# Shrink và Rebuild - Khi Nào Cần và Lưu Ý

## Tổng Quan
Shrink và Rebuild là các operations quan trọng để quản lý database size và index fragmentation, nhưng cần sử dụng cẩn thận.

## Shrink Database

### Khi Nào Cần Shrink
1. **Sau Khi Xóa Nhiều Data**
   ```sql
   -- Sau khi archive hoặc delete data
   DELETE FROM Orders WHERE OrderDate < '2020-01-01'
   -- Database file vẫn giữ nguyên size
   ```

2. **Database File Quá Lớn**
   - File size lớn hơn data thực tế nhiều
   - Cần giải phóng disk space
   - Migration hoặc consolidation

3. **Temporary Cleanup**
   - Sau khi import/export data lớn
   - Sau khi rebuild indexes
   - Maintenance operations

### Cách Shrink Database
```sql
-- Shrink database file
DBCC SHRINKFILE('DatabaseName', target_size_MB)

-- Shrink với target size
DBCC SHRINKFILE('DatabaseName', 1000)  -- Shrink xuống 1000MB

-- Shrink với percentage
DBCC SHRINKFILE('DatabaseName', 0, TRUNCATEONLY)  -- Chỉ truncate free space

-- Shrink toàn bộ database
DBCC SHRINKDATABASE('DatabaseName', 10)  -- Giữ lại 10% free space
```

### Lưu Ý Quan Trọng

#### 1. Shrink Gây Fragmentation
```sql
-- Shrink có thể gây index fragmentation
-- Nên rebuild index sau khi shrink
DBCC SHRINKFILE('DatabaseName', target_size)
ALTER INDEX ALL ON TableName REBUILD
```

#### 2. Performance Impact
- Shrink là operation tốn kém
- Có thể gây blocking
- Nên thực hiện trong maintenance window

#### 3. Không Nên Shrink Thường Xuyên
- Shrink chỉ nên làm khi thực sự cần
- Thường xuyên shrink → Fragmentation cao
- Tốt hơn: Plan database growth đúng cách

## Rebuild Index

### Khi Nào Cần Rebuild
1. **Index Fragmentation Cao**
   ```sql
   -- Kiểm tra fragmentation
   SELECT 
       OBJECT_NAME(object_id) AS TableName,
       name AS IndexName,
       avg_fragmentation_in_percent,
       page_count
   FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED')
   WHERE avg_fragmentation_in_percent > 30
       AND page_count > 1000
   ```

2. **Statistics Cũ**
   - Statistics không được update tự động
   - Query performance giảm
   - Rebuild sẽ update statistics

3. **Sau Khi Shrink**
   - Shrink gây fragmentation
   - Rebuild để fix fragmentation

### Cách Rebuild Index
```sql
-- Rebuild tất cả indexes trên table
ALTER INDEX ALL ON TableName REBUILD
WITH (
    ONLINE = ON,           -- Online rebuild (SQL Server 2014+)
    MAXDOP = 4,           -- Parallel processing
    FILLFACTOR = 90       -- Fill factor
)

-- Rebuild index cụ thể
ALTER INDEX IX_IndexName ON TableName REBUILD

-- Rebuild với options
ALTER INDEX IX_IndexName ON TableName REBUILD
WITH (
    ONLINE = ON,
    MAXDOP = 4,
    PAD_INDEX = ON,
    FILLFACTOR = 90,
    SORT_IN_TEMPDB = ON
)
```

### Reorganize vs Rebuild

#### Reorganize (Ít Tốn Kém Hơn)
```sql
-- Reorganize index
ALTER INDEX ALL ON TableName REORGANIZE

-- Khi nào dùng:
-- - Fragmentation 10-30%
-- - Không thể có downtime
-- - Ít tài nguyên hơn
```

#### Rebuild (Hiệu Quả Hơn)
```sql
-- Rebuild index
ALTER INDEX ALL ON TableName REBUILD

-- Khi nào dùng:
-- - Fragmentation > 30%
-- - Có maintenance window
-- - Cần update statistics
```

## Best Practices

### 1. Shrink Strategy
```sql
-- ❌ Không nên shrink thường xuyên
-- ❌ Không shrink trong production giờ cao điểm
-- ❌ Không shrink nếu sẽ grow lại ngay

-- ✅ Shrink chỉ khi:
-- - Thực sự cần disk space
-- - Sau khi xóa data lớn
-- - Trong maintenance window
```

### 2. Rebuild Strategy
```sql
-- Script rebuild indexes với fragmentation > 30%
DECLARE @TableName SYSNAME
DECLARE @IndexName SYSNAME
DECLARE @Fragmentation FLOAT

DECLARE index_cursor CURSOR FOR
SELECT 
    OBJECT_NAME(object_id),
    name,
    avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED')
WHERE avg_fragmentation_in_percent > 30
    AND page_count > 1000
    AND index_id > 0

OPEN index_cursor
FETCH NEXT FROM index_cursor INTO @TableName, @IndexName, @Fragmentation

WHILE @@FETCH_STATUS = 0
BEGIN
    IF @Fragmentation > 30
    BEGIN
        EXEC('ALTER INDEX ' + QUOTENAME(@IndexName) + 
             ' ON ' + QUOTENAME(@TableName) + 
             ' REBUILD WITH (ONLINE = ON, MAXDOP = 4)')
    END
    ELSE IF @Fragmentation > 10
    BEGIN
        EXEC('ALTER INDEX ' + QUOTENAME(@IndexName) + 
             ' ON ' + QUOTENAME(@TableName) + 
             ' REORGANIZE')
    END
    
    FETCH NEXT FROM index_cursor INTO @TableName, @IndexName, @Fragmentation
END

CLOSE index_cursor
DEALLOCATE index_cursor
```

### 3. Maintenance Plan
```sql
-- Weekly maintenance plan
-- 1. Check fragmentation
-- 2. Reorganize if 10-30%
-- 3. Rebuild if > 30%
-- 4. Update statistics
-- 5. Shrink only if necessary
```

## Monitoring

### Kiểm Tra Fragmentation
```sql
-- Fragmentation report
SELECT 
    OBJECT_SCHEMA_NAME(object_id) AS SchemaName,
    OBJECT_NAME(object_id) AS TableName,
    name AS IndexName,
    index_type_desc,
    avg_fragmentation_in_percent,
    page_count,
    CASE 
        WHEN avg_fragmentation_in_percent > 30 THEN 'REBUILD'
        WHEN avg_fragmentation_in_percent > 10 THEN 'REORGANIZE'
        ELSE 'OK'
    END AS Recommendation
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED')
WHERE index_id > 0
    AND page_count > 1000
ORDER BY avg_fragmentation_in_percent DESC
```

### Kiểm Tra Database Size
```sql
-- Database size và free space
SELECT 
    name AS DatabaseName,
    size_mb = size * 8 / 1024,
    used_mb = FILEPROPERTY(name, 'SpaceUsed') * 8 / 1024,
    free_mb = (size - FILEPROPERTY(name, 'SpaceUsed')) * 8 / 1024,
    free_percent = (1 - FILEPROPERTY(name, 'SpaceUsed') * 1.0 / size) * 100
FROM sys.database_files
WHERE type_desc = 'ROWS'
```

## Common Mistakes

### Mistake 1: Shrink Thường Xuyên
```sql
-- ❌ Không nên
-- Scheduled job shrink database mỗi ngày
-- → Fragmentation cao
-- → Performance giảm

-- ✅ Đúng
-- Shrink chỉ khi thực sự cần
-- Plan database growth đúng cách
```

### Mistake 2: Rebuild Không Cần Thiết
```sql
-- ❌ Không nên
-- Rebuild indexes mỗi ngày
-- → Tốn tài nguyên
-- → Có thể không cần thiết

-- ✅ Đúng
-- Rebuild chỉ khi fragmentation > 30%
-- Reorganize khi 10-30%
```

### Mistake 3: Không Rebuild Sau Shrink
```sql
-- ❌ Không nên
DBCC SHRINKFILE('DatabaseName', target_size)
-- Quên rebuild indexes

-- ✅ Đúng
DBCC SHRINKFILE('DatabaseName', target_size)
ALTER INDEX ALL ON TableName REBUILD
```

## Performance Impact

### Shrink Impact
- **I/O Intensive**: Di chuyển data pages
- **Blocking**: Có thể block other operations
- **Fragmentation**: Gây index fragmentation

### Rebuild Impact
- **CPU Intensive**: Sort và rebuild index
- **I/O Intensive**: Read và write operations
- **Locking**: Có thể lock table (nếu không ONLINE)

### Online Rebuild (SQL Server 2014+)
```sql
-- Online rebuild không block table
ALTER INDEX ALL ON TableName REBUILD
WITH (ONLINE = ON)

-- Lợi ích:
-- - Không block reads
-- - Không block writes (Enterprise edition)
-- - Có thể chạy trong production
```

## Automation

### Maintenance Stored Procedure
```sql
CREATE PROCEDURE sp_MaintainIndexes
    @FragmentationThreshold FLOAT = 30
AS
BEGIN
    DECLARE @SQL NVARCHAR(MAX)
    DECLARE @TableName SYSNAME
    DECLARE @IndexName SYSNAME
    DECLARE @Fragmentation FLOAT
    
    DECLARE index_cursor CURSOR FOR
    SELECT 
        OBJECT_NAME(object_id),
        name,
        avg_fragmentation_in_percent
    FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED')
    WHERE avg_fragmentation_in_percent > @FragmentationThreshold
        AND page_count > 1000
        AND index_id > 0
    
    OPEN index_cursor
    FETCH NEXT FROM index_cursor INTO @TableName, @IndexName, @Fragmentation
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @SQL = 'ALTER INDEX ' + QUOTENAME(@IndexName) + 
                   ' ON ' + QUOTENAME(@TableName) + 
                   ' REBUILD WITH (ONLINE = ON, MAXDOP = 4)'
        
        PRINT @SQL
        -- EXEC sp_executesql @SQL
        
        FETCH NEXT FROM index_cursor INTO @TableName, @IndexName, @Fragmentation
    END
    
    CLOSE index_cursor
    DEALLOCATE index_cursor
END
```

## Kết Luận

### Shrink
- ✅ Chỉ khi thực sự cần disk space
- ✅ Sau khi xóa data lớn
- ✅ Trong maintenance window
- ❌ Không shrink thường xuyên
- ❌ Luôn rebuild sau shrink

### Rebuild
- ✅ Khi fragmentation > 30%
- ✅ Sau khi shrink
- ✅ Sử dụng ONLINE = ON khi có thể
- ❌ Không rebuild không cần thiết
- ❌ Monitor và tune thường xuyên

Shrink và Rebuild là tools mạnh mẽ nhưng cần sử dụng đúng cách để đạt hiệu quả tối đa!

