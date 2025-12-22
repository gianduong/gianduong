# Tạo Index Cho Bảng Tỷ Dòng

## Tổng Quan
Tạo index trên bảng có hàng tỷ dòng là thách thức lớn. Cần strategy đúng để tránh downtime và đảm bảo success.

## Thách Thức

### 1. Thời Gian Tạo Index
- Với 1 tỷ rows, tạo index có thể mất hàng giờ hoặc ngày
- Cần đủ disk space (ít nhất 2x kích thước index)
- Có thể block table nếu không dùng ONLINE option

### 2. Tài Nguyên Hệ Thống
- CPU usage cao
- Memory consumption lớn
- I/O intensive
- Có thể ảnh hưởng đến các operations khác

### 3. Risk
- Nếu fail, phải rollback
- Có thể gây blocking
- Cần đủ disk space

## Chiến Lược Tạo Index

### 1. Online Index Creation (SQL Server 2014+)
```sql
-- Tạo index với ONLINE = ON
CREATE NONCLUSTERED INDEX IX_LargeTable_Column
ON LargeTable(ColumnName)
WITH (
    ONLINE = ON,              -- Không block table
    MAXDOP = 4,               -- Parallel processing
    SORT_IN_TEMPDB = ON,      -- Sort trong tempdb (nhanh hơn nếu tempdb nhanh)
    FILLFACTOR = 90,          -- Để lại 10% free space
    PAD_INDEX = ON            -- Apply fillfactor cho intermediate pages
)
INCLUDE (Column2, Column3)     -- Covering index
```

**Lợi Ích:**
- Không block table (Enterprise edition)
- Có thể chạy trong production
- Có thể cancel nếu cần

### 2. Phân Chia Thành Nhiều Bước

#### Bước 1: Tạo Index Trên Sample Data
```sql
-- Test trên sample data trước
SELECT TOP 1000000 *
INTO LargeTable_Sample
FROM LargeTable

-- Tạo index trên sample
CREATE INDEX IX_Sample_Column
ON LargeTable_Sample(ColumnName)

-- Test performance
SELECT * FROM LargeTable_Sample
WHERE ColumnName = @Value
```

#### Bước 2: Tạo Index Trên Partition (Nếu Có)
```sql
-- Nếu table đã được partition
-- Tạo index trên từng partition
ALTER INDEX IX_LargeTable_Column
ON LargeTable REBUILD PARTITION = 1
WITH (ONLINE = ON)

-- Lặp lại cho các partitions khác
```

#### Bước 3: Tạo Index Toàn Bộ
```sql
-- Sau khi test thành công
CREATE INDEX IX_LargeTable_Column
ON LargeTable(ColumnName)
WITH (ONLINE = ON, MAXDOP = 4)
```

### 3. Sử Dụng SORT_IN_TEMPDB
```sql
-- Sort trong tempdb (nhanh hơn nếu tempdb có fast storage)
CREATE INDEX IX_LargeTable_Column
ON LargeTable(ColumnName)
WITH (
    ONLINE = ON,
    SORT_IN_TEMPDB = ON,      -- Sort trong tempdb
    MAXDOP = 4
)

-- Yêu cầu:
-- - Tempdb có đủ space
-- - Tempdb trên fast storage (SSD)
```

### 4. Điều Chỉnh MAXDOP
```sql
-- Điều chỉnh MAXDOP dựa trên system
-- - Nhiều cores: MAXDOP = 4-8
-- - Ít cores: MAXDOP = 2-4
-- - Cần resources cho other operations: MAXDOP = 2

CREATE INDEX IX_LargeTable_Column
ON LargeTable(ColumnName)
WITH (
    ONLINE = ON,
    MAXDOP = 4
)
```

## Monitoring Progress

### Kiểm Tra Tiến Độ
```sql
-- Xem progress của index creation
SELECT 
    session_id,
    command,
    percent_complete,
    estimated_completion_time / 1000 / 60 AS estimated_minutes,
    start_time,
    status
FROM sys.dm_exec_requests
WHERE command LIKE '%INDEX%'
    OR command LIKE '%CREATE%'
```

### Kiểm Tra Resource Usage
```sql
-- Monitor CPU, Memory, I/O
SELECT 
    session_id,
    cpu_time,
    total_scheduled_time,
    total_elapsed_time,
    reads,
    writes,
    logical_reads
FROM sys.dm_exec_requests
WHERE session_id = @SessionID
```

### Kiểm Tra Blocking
```sql
-- Kiểm tra blocking
SELECT 
    blocking_session_id,
    wait_type,
    wait_time,
    wait_resource
FROM sys.dm_exec_requests
WHERE blocking_session_id > 0
```

## Best Practices

### 1. Plan Trước
```sql
-- Estimate index size
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    SUM(reserved_page_count) * 8 / 1024 AS size_mb
FROM sys.dm_db_partition_stats
WHERE object_id = OBJECT_ID('LargeTable')
GROUP BY object_id

-- Estimate index sẽ chiếm khoảng 20-30% table size
```

### 2. Maintenance Window
```sql
-- Nếu không thể dùng ONLINE = ON
-- Thực hiện trong maintenance window
-- Thông báo users trước
```

### 3. Backup Trước
```sql
-- Backup database trước khi tạo index lớn
BACKUP DATABASE DatabaseName
TO DISK = 'C:\Backup\BeforeIndexCreation.bak'
WITH COMPRESSION
```

### 4. Test Trên Staging
```sql
-- Test trên staging environment trước
-- Copy data từ production
-- Test index creation
-- Measure performance impact
```

## Troubleshooting

### Issue 1: Out of Disk Space
```sql
-- Kiểm tra disk space
EXEC xp_fixeddrives

-- Giải pháp:
-- 1. Free up disk space
-- 2. Thêm disk mới
-- 3. Sử dụng SORT_IN_TEMPDB (nếu tempdb có nhiều space)
```

### Issue 2: Timeout
```sql
-- Tăng timeout
SET LOCK_TIMEOUT -1  -- Không timeout

-- Hoặc tạo index trong batch nhỏ hơn
```

### Issue 3: Blocking
```sql
-- Sử dụng ONLINE = ON (Enterprise edition)
-- Hoặc thực hiện trong maintenance window
```

## Alternative Approaches

### 1. Partitioned Index
```sql
-- Nếu table đã partition
-- Tạo index trên partition scheme
CREATE NONCLUSTERED INDEX IX_LargeTable_Column
ON LargeTable(ColumnName)
ON PS_Monthly(PartitionKeyColumn)  -- Aligned với partition

-- Có thể tạo trên từng partition riêng
```

### 2. Filtered Index
```sql
-- Nếu chỉ cần index cho subset data
CREATE NONCLUSTERED INDEX IX_LargeTable_Active
ON LargeTable(ColumnName)
WHERE Status = 'Active'

-- Nhỏ hơn và nhanh hơn
```

### 3. Columnstore Index
```sql
-- Cho analytics workloads
CREATE NONCLUSTERED COLUMNSTORE INDEX IX_LargeTable_Columnstore
ON LargeTable(Column1, Column2, Column3)

-- Compression cao, phù hợp cho large tables
```

## Performance Tips

### 1. Optimize TempDB
```sql
-- TempDB nên có:
-- - Multiple files (1 per CPU core, up to 8)
-- - Fast storage (SSD)
-- - Initial size lớn để tránh autogrow
-- - Same size cho tất cả files
```

### 2. Optimize Database Settings
```sql
-- Tăng max server memory nếu có thể
EXEC sp_configure 'max server memory', 32768
RECONFIGURE

-- Tăng max degree of parallelism
EXEC sp_configure 'max degree of parallelism', 8
RECONFIGURE
```

### 3. Schedule During Low Activity
```sql
-- Tạo index vào giờ thấp điểm
-- Monitor system load
-- Điều chỉnh MAXDOP nếu cần
```

## Case Study

### Scenario
- Table: 2 tỷ rows, 500GB
- Cần tạo index trên CustomerID
- Production system, không thể có downtime

### Solution
```sql
-- Tạo index với ONLINE = ON
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
WITH (
    ONLINE = ON,
    MAXDOP = 4,
    SORT_IN_TEMPDB = ON,
    FILLFACTOR = 90
)
INCLUDE (OrderDate, TotalAmount)
```

### Result
- Thời gian: 8 giờ
- Không có downtime
- Không block other operations
- Index size: 120GB
- Query performance cải thiện 1000x

## Kết Luận

Tạo index trên bảng tỷ dòng cần:
- ✅ Plan kỹ lưỡng
- ✅ Sử dụng ONLINE = ON khi có thể
- ✅ Monitor progress
- ✅ Đủ disk space
- ✅ Test trên staging trước
- ✅ Backup trước khi thực hiện

Với strategy đúng, có thể tạo index trên bảng tỷ dòng mà không gây downtime!

