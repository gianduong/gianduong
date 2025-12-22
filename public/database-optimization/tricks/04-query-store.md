# Query Store - Giám Sát và Tối Ưu Hiệu Năng Query

## Tổng Quan
Query Store là tính năng mạnh mẽ trong SQL Server 2016+ giúp tự động thu thập và lưu trữ thông tin về execution plans và runtime statistics. Đây là công cụ không thể thiếu để tối ưu database.

## Lợi Ích Chính

### 1. Tự Động Thu Thập Dữ Liệu
- Không cần cấu hình phức tạp
- Lưu trữ execution plans và runtime stats
- Theo dõi hiệu năng theo thời gian

### 2. So Sánh Hiệu Năng
- So sánh query performance giữa các thời điểm
- Phát hiện regression sau khi update
- Xác định queries bị chậm lại

### 3. Plan Forcing
- Force execution plan tốt nhất
- Không cần thay đổi code ứng dụng
- Rollback dễ dàng nếu có vấn đề

## Cấu Hình Query Store

### Bật Query Store
```sql
-- Bật Query Store cho database
ALTER DATABASE DatabaseName
SET QUERY_STORE = ON
(
    OPERATION_MODE = READ_WRITE,
    CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30),
    DATA_FLUSH_INTERVAL_SECONDS = 900,
    MAX_STORAGE_SIZE_MB = 1000,
    INTERVAL_LENGTH_MINUTES = 60,
    SIZE_BASED_CLEANUP_MODE = AUTO,
    QUERY_CAPTURE_MODE = AUTO,
    MAX_PLANS_PER_QUERY = 200
)
```

### Các Tham Số Quan Trọng

#### OPERATION_MODE
- `READ_WRITE`: Bật Query Store, ghi và đọc
- `READ_ONLY`: Chỉ đọc, không ghi mới
- `OFF`: Tắt Query Store

#### QUERY_CAPTURE_MODE
- `ALL`: Capture tất cả queries
- `AUTO`: Chỉ capture queries quan trọng (recommended)
- `NONE`: Không capture queries mới

#### MAX_STORAGE_SIZE_MB
- Giới hạn dung lượng lưu trữ
- Khi đầy, tự động cleanup data cũ
- Khuyến nghị: 1000-5000 MB

#### CLEANUP_POLICY
- Số ngày giữ lại data
- Tự động xóa data cũ hơn threshold
- Khuyến nghị: 30-90 ngày

## Sử Dụng Query Store

### 1. Tìm Queries Chậm Nhất

```sql
-- Top queries theo execution time
SELECT TOP 10
    q.query_id,
    qt.query_sql_text,
    rs.avg_duration / 1000 AS avg_duration_ms,
    rs.count_executions,
    rs.avg_cpu_time / 1000 AS avg_cpu_time_ms,
    rs.avg_logical_io_reads,
    rs.avg_physical_io_reads
FROM sys.query_store_query q
INNER JOIN sys.query_store_query_text qt 
    ON q.query_text_id = qt.query_text_id
INNER JOIN sys.query_store_plan p 
    ON q.query_id = p.query_id
INNER JOIN sys.query_store_runtime_stats rs 
    ON p.plan_id = rs.plan_id
WHERE rs.last_execution_time > DATEADD(HOUR, -24, GETDATE())
ORDER BY rs.avg_duration DESC
```

### 2. Phát Hiện Query Regression

```sql
-- So sánh hiệu năng giữa 2 khoảng thời gian
WITH CurrentStats AS (
    SELECT 
        q.query_id,
        AVG(rs.avg_duration) AS avg_duration
    FROM sys.query_store_query q
    INNER JOIN sys.query_store_plan p ON q.query_id = p.query_id
    INNER JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
    WHERE rs.last_execution_time > DATEADD(HOUR, -1, GETDATE())
    GROUP BY q.query_id
),
PreviousStats AS (
    SELECT 
        q.query_id,
        AVG(rs.avg_duration) AS avg_duration
    FROM sys.query_store_query q
    INNER JOIN sys.query_store_plan p ON q.query_id = p.query_id
    INNER JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
    WHERE rs.last_execution_time BETWEEN DATEADD(HOUR, -25, GETDATE()) 
        AND DATEADD(HOUR, -24, GETDATE())
    GROUP BY q.query_id
)
SELECT 
    c.query_id,
    qt.query_sql_text,
    c.avg_duration AS current_avg_duration,
    p.avg_duration AS previous_avg_duration,
    (c.avg_duration - p.avg_duration) / p.avg_duration * 100 AS percent_change
FROM CurrentStats c
INNER JOIN PreviousStats p ON c.query_id = p.query_id
INNER JOIN sys.query_store_query q ON c.query_id = q.query_id
INNER JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
WHERE c.avg_duration > p.avg_duration * 1.5  -- Chậm hơn 50%
ORDER BY percent_change DESC
```

### 3. Force Execution Plan

```sql
-- Xem các plans có sẵn cho query
SELECT 
    p.plan_id,
    p.query_id,
    rs.avg_duration,
    rs.count_executions,
    p.is_forced_plan
FROM sys.query_store_plan p
INNER JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
WHERE p.query_id = @QueryId
ORDER BY rs.avg_duration

-- Force plan tốt nhất
EXEC sp_query_store_force_plan @query_id = @QueryId, @plan_id = @PlanId

-- Unforce plan
EXEC sp_query_store_unforce_plan @query_id = @QueryId, @plan_id = @PlanId
```

### 4. Tìm Queries Có Nhiều Plans

```sql
-- Queries có nhiều execution plans (có thể gây plan regression)
SELECT 
    q.query_id,
    qt.query_sql_text,
    COUNT(DISTINCT p.plan_id) AS plan_count,
    STRING_AGG(CAST(p.plan_id AS VARCHAR), ', ') AS plan_ids
FROM sys.query_store_query q
INNER JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
INNER JOIN sys.query_store_plan p ON q.query_id = p.query_id
GROUP BY q.query_id, qt.query_sql_text
HAVING COUNT(DISTINCT p.plan_id) > 1
ORDER BY plan_count DESC
```

## Best Practices

### 1. Monitoring
- Review Query Store reports thường xuyên
- Set up alerts cho queries chậm
- Track performance trends

### 2. Plan Management
- Force plans chỉ khi thực sự cần
- Test kỹ trước khi force plan
- Document lý do force plan

### 3. Maintenance
- Monitor storage usage
- Adjust cleanup policy nếu cần
- Review và remove forced plans không còn cần thiết

### 4. Troubleshooting
- Sử dụng Query Store để troubleshoot performance issues
- So sánh performance trước và sau khi thay đổi
- Identify queries bị ảnh hưởng bởi statistics update

## Lưu Ý Quan Trọng

### Performance Impact
- Query Store có overhead nhỏ (thường < 5%)
- Monitor resource usage
- Adjust capture mode nếu cần

### Storage Management
- Query Store data được lưu trong database
- Tính vào database size
- Plan cleanup strategy

### Compatibility
- SQL Server 2016+ (Standard và Enterprise)
- Azure SQL Database
- SQL Server 2017+ cho Linux

## Kết Luận
Query Store là công cụ mạnh mẽ giúp tối ưu database với ít công sức. Tận dụng Query Store để:
- Tự động phát hiện performance issues
- So sánh hiệu năng theo thời gian
- Force execution plans tốt nhất
- Troubleshoot performance problems

