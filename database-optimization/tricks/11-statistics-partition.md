# Lưu Ý Về Cập Nhật Statistics Trên Các Partition Objects

## Tổng Quan
Statistics trên partition tables cần được quản lý đặc biệt để đảm bảo query optimizer có thông tin chính xác.

## Vấn Đề Với Statistics Trên Partition Tables

### 1. Statistics Cũ
- Statistics trên partition tables có thể nhanh chóng trở nên outdated
- Chỉ một partition thay đổi có thể ảnh hưởng đến toàn bộ statistics
- Query optimizer có thể chọn plan không tối ưu

### 2. Full Table Statistics
```sql
-- Cập nhật statistics cho toàn bộ table
UPDATE STATISTICS TableName
-- ❌ Chậm với table lớn
-- ❌ Ảnh hưởng đến tất cả partitions
```

### 3. Partition-Specific Statistics
```sql
-- Cập nhật statistics cho partition cụ thể
UPDATE STATISTICS TableName
WITH RESAMPLE ON PARTITIONS(1)
-- ✅ Nhanh hơn
-- ✅ Chỉ ảnh hưởng partition cụ thể
```

## Incremental Statistics (SQL Server 2014+)

### Tạo Statistics Với Incremental Option
```sql
-- Tạo statistics với incremental
CREATE STATISTICS Stats_OrderDate
ON Orders(OrderDate)
WITH INCREMENTAL = ON
```

### Lợi Ích
- Chỉ cập nhật statistics cho partitions thay đổi
- Giảm thời gian maintenance đáng kể
- Tự động quản lý per-partition statistics

### Cập Nhật Incremental Statistics
```sql
-- Cập nhật chỉ partitions thay đổi
UPDATE STATISTICS Orders
WITH RESAMPLE ON PARTITIONS(1, 2, 3)
```

## Best Practices

### 1. Enable Incremental Statistics
```sql
-- Kiểm tra statistics hiện tại
SELECT 
    name,
    is_incremental,
    auto_created
FROM sys.stats
WHERE object_id = OBJECT_ID('TableName')

-- Tạo incremental statistics nếu chưa có
IF NOT EXISTS (
    SELECT 1 FROM sys.stats 
    WHERE object_id = OBJECT_ID('TableName') 
    AND name = 'Stats_Name'
    AND is_incremental = 1
)
BEGIN
    CREATE STATISTICS Stats_Name
    ON TableName(ColumnName)
    WITH INCREMENTAL = ON
END
```

### 2. Update Statistics Sau Data Changes
```sql
-- Sau khi insert/update data vào partition
UPDATE STATISTICS TableName
WITH RESAMPLE ON PARTITIONS(@PartitionNumber)
```

### 3. Scheduled Maintenance
```sql
-- Script tự động update statistics cho partitions thay đổi
DECLARE @PartitionNumber INT
DECLARE @LastUpdateDate DATETIME

-- Tìm partitions có data thay đổi gần đây
SELECT 
    p.partition_number,
    MAX(modify_date) AS LastModifyDate
INTO #ChangedPartitions
FROM sys.partitions p
INNER JOIN sys.objects o ON p.object_id = o.object_id
WHERE o.name = 'TableName'
    AND p.rows > 0
GROUP BY p.partition_number
HAVING MAX(modify_date) > DATEADD(DAY, -1, GETDATE())

-- Update statistics cho partitions thay đổi
DECLARE partition_cursor CURSOR FOR
SELECT partition_number FROM #ChangedPartitions

OPEN partition_cursor
FETCH NEXT FROM partition_cursor INTO @PartitionNumber

WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC('UPDATE STATISTICS TableName WITH RESAMPLE ON PARTITIONS(' + 
         CAST(@PartitionNumber AS VARCHAR) + ')')
    FETCH NEXT FROM partition_cursor INTO @PartitionNumber
END

CLOSE partition_cursor
DEALLOCATE partition_cursor
```

## Monitoring Statistics

### Kiểm Tra Statistics Age
```sql
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    name AS StatisticsName,
    STATS_DATE(object_id, stats_id) AS LastUpdateDate,
    DATEDIFF(DAY, STATS_DATE(object_id, stats_id), GETDATE()) AS DaysOld
FROM sys.stats
WHERE object_id = OBJECT_ID('TableName')
    AND STATS_DATE(object_id, stats_id) < DATEADD(DAY, -7, GETDATE())
ORDER BY LastUpdateDate
```

### Kiểm Tra Statistics Accuracy
```sql
-- So sánh estimated vs actual rows
SET STATISTICS PROFILE ON
SELECT * FROM TableName WHERE PartitionKey = @Value
SET STATISTICS PROFILE OFF

-- Xem execution plan
-- So sánh "Estimated Number of Rows" vs "Actual Number of Rows"
```

### Kiểm Tra Incremental Statistics
```sql
SELECT 
    s.name AS StatisticsName,
    s.is_incremental,
    sp.partition_number,
    sp.rows,
    sp.rows_sampled,
    sp.modification_counter
FROM sys.stats s
INNER JOIN sys.stats_columns sc ON s.stats_id = sc.stats_id 
    AND s.object_id = sc.object_id
INNER JOIN sys.partitions p ON s.object_id = p.object_id
LEFT JOIN sys.dm_db_stats_properties_internal(
    s.object_id, 
    s.stats_id
) sp ON p.partition_number = sp.partition_number
WHERE s.object_id = OBJECT_ID('TableName')
    AND s.is_incremental = 1
```

## Common Issues

### Issue 1: Statistics Not Updated After Partition Split
```sql
-- Sau khi split partition, cần update statistics
ALTER PARTITION FUNCTION PF_Monthly()
SPLIT RANGE ('2024-02-01')

-- Update statistics cho partitions mới
UPDATE STATISTICS TableName
WITH RESAMPLE ON PARTITIONS(1, 2)
```

### Issue 2: Poor Plan After Statistics Update
```sql
-- Nếu plan không tốt sau khi update statistics
-- Có thể cần full scan
UPDATE STATISTICS TableName
WITH FULLSCAN ON PARTITIONS(@PartitionNumber)
```

### Issue 3: Statistics on Computed Columns
```sql
-- Statistics trên computed columns cần recreate sau khi partition
-- Nếu computed column dựa trên partition key
DROP STATISTICS TableName.Stats_Name
CREATE STATISTICS Stats_Name
ON TableName(ComputedColumn)
WITH INCREMENTAL = ON
```

## Automation

### Auto-Update Statistics
```sql
-- Enable auto-update statistics (default)
ALTER DATABASE DatabaseName
SET AUTO_UPDATE_STATISTICS ON

-- Với incremental statistics, auto-update chỉ update partitions thay đổi
```

### Maintenance Plan
```sql
-- Tạo stored procedure để maintain statistics
CREATE PROCEDURE sp_UpdatePartitionStatistics
    @TableName SYSNAME,
    @PartitionNumber INT = NULL
AS
BEGIN
    IF @PartitionNumber IS NULL
    BEGIN
        -- Update tất cả partitions
        UPDATE STATISTICS @TableName WITH RESAMPLE
    END
    ELSE
    BEGIN
        -- Update partition cụ thể
        DECLARE @SQL NVARCHAR(MAX) = 
            'UPDATE STATISTICS ' + QUOTENAME(@TableName) + 
            ' WITH RESAMPLE ON PARTITIONS(' + 
            CAST(@PartitionNumber AS VARCHAR) + ')'
        EXEC sp_executesql @SQL
    END
END
```

## Performance Impact

### Statistics Update Overhead
- **Full scan**: Chậm nhưng chính xác
- **Sample**: Nhanh nhưng có thể không chính xác
- **Incremental**: Cân bằng tốt giữa speed và accuracy

### Best Practice
```sql
-- Sử dụng RESAMPLE cho incremental statistics
UPDATE STATISTICS TableName
WITH RESAMPLE ON PARTITIONS(@PartitionNumber)
-- ✅ Giữ lại sample rate hiện tại
-- ✅ Nhanh hơn FULLSCAN
-- ✅ Đủ chính xác cho hầu hết trường hợp
```

## Kết Luận

1. **Sử dụng Incremental Statistics** cho partition tables
2. **Update statistics** sau khi data thay đổi
3. **Monitor statistics age** và accuracy
4. **Automate maintenance** cho partitions thay đổi
5. **Test query plans** sau khi update statistics

Statistics management trên partition tables là critical để đảm bảo optimal query performance.

