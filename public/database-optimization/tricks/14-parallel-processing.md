# Parallel Processing trong SQL Server

## Tổng Quan
Parallel processing cho phép SQL Server sử dụng nhiều CPU cores để xử lý query, có thể tăng tốc đáng kể cho các operations phức tạp.

## Khi Nào Query Chạy Parallel

### Điều Kiện
1. **Cost Threshold for Parallelism > 0**
   ```sql
   -- Kiểm tra setting
   EXEC sp_configure 'cost threshold for parallelism'
   
   -- Set threshold (default: 5)
   EXEC sp_configure 'cost threshold for parallelism', 50
   RECONFIGURE
   ```

2. **Query Cost Đủ Lớn**
   - Query cost phải lớn hơn threshold
   - Thường là queries phức tạp, scan large tables

3. **Có Đủ CPU Cores**
   - SQL Server cần có nhiều CPU cores available
   - Max degree of parallelism (MAXDOP) > 1

4. **Không Có Operations Chặn Parallelism**
   - Một số operations không thể parallel (scalar functions, cursors)

## Cấu Hình Parallelism

### Max Degree of Parallelism (MAXDOP)
```sql
-- Kiểm tra MAXDOP hiện tại
EXEC sp_configure 'max degree of parallelism'

-- Set MAXDOP
EXEC sp_configure 'max degree of parallelism', 4
RECONFIGURE

-- MAXDOP = 0: Sử dụng tất cả CPU cores
-- MAXDOP = 1: Không parallel (serial)
-- MAXDOP = N: Sử dụng tối đa N cores
```

### Best Practice cho MAXDOP
- **Small servers** (< 8 cores): MAXDOP = số cores
- **Medium servers** (8-16 cores): MAXDOP = 8
- **Large servers** (> 16 cores): MAXDOP = 16 hoặc số NUMA nodes

### Cost Threshold for Parallelism
```sql
-- Set threshold
EXEC sp_configure 'cost threshold for parallelism', 50
RECONFIGURE

-- Threshold cao hơn = ít queries chạy parallel hơn
-- Threshold thấp hơn = nhiều queries chạy parallel hơn
```

## Query Hints

### Force Parallel Execution
```sql
-- Force parallel với MAXDOP 4
SELECT * FROM LargeTable
OPTION (MAXDOP 4)

-- Force parallel với tất cả cores
SELECT * FROM LargeTable
OPTION (MAXDOP 0)
```

### Disable Parallel Execution
```sql
-- Force serial execution
SELECT * FROM LargeTable
OPTION (MAXDOP 1)
```

## Operations Hỗ Trợ Parallelism

### 1. Table/Index Scan
```sql
-- Scan large table có thể parallel
SELECT * FROM LargeTable
WHERE Column1 > 1000
-- Có thể sử dụng multiple threads
```

### 2. Sort Operations
```sql
-- Sort large result set
SELECT * FROM LargeTable
ORDER BY Column1
-- Có thể parallel sort
```

### 3. Hash Join
```sql
-- Hash join trên large tables
SELECT *
FROM Table1 t1
INNER HASH JOIN Table2 t2 ON t1.ID = t2.ID
-- Hash join thường parallel tốt
```

### 4. Aggregation
```sql
-- Aggregation trên large dataset
SELECT CustomerID, SUM(Amount)
FROM Orders
GROUP BY CustomerID
-- Có thể parallel aggregation
```

## Operations Không Hỗ Trợ Parallelism

### 1. Scalar Functions
```sql
-- Scalar function trong SELECT
SELECT dbo.ScalarFunction(Column1)
FROM TableName
-- ❌ Không thể parallel
```

### 2. Cursors
```sql
-- Cursor operations
DECLARE cursor_name CURSOR FOR ...
-- ❌ Không thể parallel
```

### 3. Certain System Functions
```sql
-- Một số system functions
SELECT GETDATE(), NEWID()
-- ❌ Có thể không parallel
```

## Monitoring Parallelism

### Kiểm Tra Query Đang Chạy Parallel
```sql
-- Xem execution plan
SET STATISTICS PROFILE ON
SELECT * FROM LargeTable
SET STATISTICS PROFILE OFF

-- Tìm "Parallelism" operators trong plan
-- "Gather Streams" = parallel execution
```

### Kiểm Tra Parallel Execution Stats
```sql
SELECT 
    qs.execution_count,
    qs.total_worker_time / qs.execution_count AS avg_cpu_time,
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time,
    qs.max_worker_time,
    qs.max_elapsed_time,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2)+1) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
WHERE qs.max_worker_time > qs.max_elapsed_time * 0.8  -- Parallel execution
ORDER BY qs.max_worker_time DESC
```

### Kiểm Tra CXPACKET Waits
```sql
-- CXPACKET waits = parallel execution
SELECT 
    wait_type,
    waiting_tasks_count,
    wait_time_ms,
    signal_wait_time_ms
FROM sys.dm_os_wait_stats
WHERE wait_type = 'CXPACKET'
-- CXPACKET waits là bình thường với parallel queries
```

## Performance Considerations

### Khi Parallelism Tốt
- ✅ Large table scans
- ✅ Complex joins
- ✅ Large aggregations
- ✅ Sort operations trên large datasets

### Khi Parallelism Không Tốt
- ❌ Small tables (< 100K rows)
- ❌ Simple queries
- ❌ Queries với nhiều CXPACKET waits
- ❌ System đã có high CPU usage

### CXPACKET Waits
```sql
-- CXPACKET waits xảy ra khi:
-- 1. Một thread hoàn thành trước các threads khác
-- 2. Uneven work distribution
-- 3. Skewed data

-- Giải pháp:
-- 1. Tăng cost threshold for parallelism
-- 2. Optimize query để giảm work imbalance
-- 3. Sử dụng MAXDOP hint cho query cụ thể
```

## Best Practices

### 1. Cấu Hình MAXDOP Phù Hợp
```sql
-- Không nên set MAXDOP = 0 trên large servers
-- Có thể gây CPU contention

-- Khuyến nghị:
-- - Servers < 8 cores: MAXDOP = số cores
-- - Servers 8-16 cores: MAXDOP = 8
-- - Servers > 16 cores: MAXDOP = 16 hoặc số NUMA nodes
```

### 2. Điều Chỉnh Cost Threshold
```sql
-- Tăng threshold nếu có quá nhiều queries chạy parallel
EXEC sp_configure 'cost threshold for parallelism', 50
RECONFIGURE

-- Giảm threshold nếu cần nhiều queries chạy parallel
EXEC sp_configure 'cost threshold for parallelism', 25
RECONFIGURE
```

### 3. Sử Dụng Query Hints Cẩn Thận
```sql
-- Chỉ force parallel khi thực sự cần
SELECT * FROM LargeTable
OPTION (MAXDOP 4)

-- Test performance trước và sau
```

### 4. Monitor và Tune
```sql
-- Monitor CXPACKET waits
SELECT * FROM sys.dm_os_wait_stats
WHERE wait_type = 'CXPACKET'

-- Nếu CXPACKET waits cao:
-- 1. Tăng cost threshold
-- 2. Optimize queries
-- 3. Điều chỉnh MAXDOP
```

## Troubleshooting

### Issue 1: Query Không Chạy Parallel
```sql
-- Kiểm tra:
-- 1. MAXDOP > 1
EXEC sp_configure 'max degree of parallelism'

-- 2. Cost threshold
EXEC sp_configure 'cost threshold for parallelism'

-- 3. Query cost
-- Xem execution plan, tìm "Estimated Cost"
```

### Issue 2: Parallelism Gây Chậm
```sql
-- Nguyên nhân:
-- 1. CXPACKET waits cao
-- 2. CPU contention
-- 3. Work imbalance

-- Giải pháp:
-- 1. Tăng cost threshold
-- 2. Giảm MAXDOP
-- 3. Optimize query
```

### Issue 3: Too Many Parallel Queries
```sql
-- Nhiều queries chạy parallel cùng lúc
-- → CPU contention
-- → Performance degradation

-- Giải pháp:
-- 1. Tăng cost threshold
-- 2. Sử dụng Resource Governor
-- 3. Limit MAXDOP per query
```

## Case Studies

### Case 1: Large Table Scan
```sql
-- Query: Scan 100M rows
SELECT * FROM LargeTable WHERE Column1 > 1000

-- Serial: 30 seconds
-- Parallel (MAXDOP 4): 8 seconds
-- Improvement: 3.75x
```

### Case 2: Complex Join
```sql
-- Query: Join 2 large tables
SELECT *
FROM Table1 t1
INNER JOIN Table2 t2 ON t1.ID = t2.ID

-- Serial: 45 seconds
-- Parallel (MAXDOP 8): 12 seconds
-- Improvement: 3.75x
```

## Kết Luận

Parallelism là công cụ mạnh mẽ nhưng cần sử dụng đúng cách:
- ✅ Cấu hình MAXDOP phù hợp
- ✅ Điều chỉnh cost threshold
- ✅ Monitor CXPACKET waits
- ✅ Test performance
- ❌ Không force parallel cho small queries
- ❌ Không set MAXDOP quá cao

Parallelism không phải lúc nào cũng tốt hơn - đôi khi serial execution nhanh hơn!

