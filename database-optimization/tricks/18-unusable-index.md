# Unusable Index - Phát Hiện và Xử Lý

## Tổng Quan
Unusable index là index không thể sử dụng được, có thể do nhiều nguyên nhân. Phát hiện và fix unusable indexes là quan trọng cho performance.

## Nguyên Nhân Unusable Index

### 1. Index Bị Disable
```sql
-- Index bị disable
ALTER INDEX IX_IndexName ON TableName DISABLE

-- Index không thể sử dụng cho queries
-- Nhưng vẫn chiếm disk space
```

### 2. Index Bị Corrupt
```sql
-- Index bị corrupt do:
-- - Disk failure
-- - System crash
-- - Data corruption
```

### 3. Schema Change Không Tương Thích
```sql
-- Thay đổi schema làm index không tương thích
ALTER TABLE TableName
ALTER COLUMN ColumnName VARCHAR(100)  -- Thay đổi data type

-- Index trên column này có thể trở thành unusable
```

### 4. Rebuild Failed
```sql
-- Rebuild index failed
ALTER INDEX IX_IndexName ON TableName REBUILD
-- Nếu fail, index có thể unusable
```

## Phát Hiện Unusable Index

### 1. Kiểm Tra Disabled Indexes
```sql
-- Tìm disabled indexes
SELECT 
    OBJECT_SCHEMA_NAME(object_id) AS SchemaName,
    OBJECT_NAME(object_id) AS TableName,
    name AS IndexName,
    type_desc AS IndexType,
    is_disabled,
    is_hypothetical
FROM sys.indexes
WHERE is_disabled = 1
    AND object_id > 100  -- User objects only
ORDER BY OBJECT_SCHEMA_NAME(object_id), OBJECT_NAME(object_id)
```

### 2. Kiểm Tra Index Usage
```sql
-- Index không được sử dụng
SELECT 
    OBJECT_NAME(ios.object_id) AS TableName,
    i.name AS IndexName,
    ios.user_seeks,
    ios.user_scans,
    ios.user_lookups,
    ios.user_updates,
    i.is_disabled
FROM sys.dm_db_index_usage_stats ios
INNER JOIN sys.indexes i 
    ON ios.object_id = i.object_id 
    AND ios.index_id = i.index_id
WHERE ios.database_id = DB_ID()
    AND i.is_disabled = 1
```

### 3. Kiểm Tra Index Fragmentation
```sql
-- Index có fragmentation cao có thể unusable
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    name AS IndexName,
    avg_fragmentation_in_percent,
    page_count,
    CASE 
        WHEN avg_fragmentation_in_percent > 90 THEN 'UNUSABLE'
        WHEN avg_fragmentation_in_percent > 30 THEN 'NEEDS REBUILD'
        ELSE 'OK'
    END AS Status
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED')
WHERE avg_fragmentation_in_percent > 30
    AND page_count > 1000
ORDER BY avg_fragmentation_in_percent DESC
```

## Giải Pháp

### 1. Rebuild Disabled Index
```sql
-- Rebuild disabled index
ALTER INDEX IX_IndexName ON TableName REBUILD
WITH (
    ONLINE = ON,
    MAXDOP = 4
)

-- Hoặc rebuild tất cả disabled indexes
DECLARE @SQL NVARCHAR(MAX)
SELECT @SQL = STRING_AGG(
    'ALTER INDEX ' + QUOTENAME(name) + 
    ' ON ' + QUOTENAME(OBJECT_SCHEMA_NAME(object_id)) + '.' +
    QUOTENAME(OBJECT_NAME(object_id)) + 
    ' REBUILD WITH (ONLINE = ON);',
    CHAR(13)
)
FROM sys.indexes
WHERE is_disabled = 1
    AND object_id > 100

IF @SQL IS NOT NULL
BEGIN
    PRINT @SQL
    -- EXEC sp_executesql @SQL
END
```

### 2. Drop và Recreate
```sql
-- Nếu rebuild không work
-- Drop và recreate index
DROP INDEX IX_IndexName ON TableName

CREATE NONCLUSTERED INDEX IX_IndexName
ON TableName(ColumnName)
WITH (
    ONLINE = ON,
    FILLFACTOR = 90
)
```

### 3. Fix Corrupt Index
```sql
-- Kiểm tra corruption
DBCC CHECKDB('DatabaseName')

-- Nếu có corruption:
-- 1. Restore từ backup
-- 2. Hoặc fix corruption (cẩn thận!)
DBCC CHECKDB('DatabaseName', REPAIR_ALLOW_DATA_LOSS)
```

### 4. Recreate Sau Schema Change
```sql
-- Sau khi thay đổi schema
-- Drop index cũ
DROP INDEX IX_IndexName ON TableName

-- Tạo index mới với schema mới
CREATE NONCLUSTERED INDEX IX_IndexName
ON TableName(NewColumnName)
```

## Best Practices

### 1. Regular Monitoring
```sql
-- Script tự động phát hiện unusable indexes
CREATE PROCEDURE sp_CheckUnusableIndexes
AS
BEGIN
    -- Disabled indexes
    SELECT 
        'DISABLED' AS IssueType,
        OBJECT_SCHEMA_NAME(object_id) AS SchemaName,
        OBJECT_NAME(object_id) AS TableName,
        name AS IndexName
    FROM sys.indexes
    WHERE is_disabled = 1
        AND object_id > 100
    
    UNION ALL
    
    -- Unused indexes (có thể drop)
    SELECT 
        'UNUSED' AS IssueType,
        OBJECT_SCHEMA_NAME(ios.object_id) AS SchemaName,
        OBJECT_NAME(ios.object_id) AS TableName,
        i.name AS IndexName
    FROM sys.dm_db_index_usage_stats ios
    INNER JOIN sys.indexes i 
        ON ios.object_id = i.object_id 
        AND ios.index_id = i.index_id
    WHERE ios.database_id = DB_ID()
        AND ios.user_seeks + ios.user_scans + ios.user_lookups = 0
        AND ios.user_updates > 0  -- Có updates nhưng không được dùng
        AND i.is_primary_key = 0
        AND i.is_unique_constraint = 0
END
```

### 2. Prevent Unusable Indexes
```sql
-- Không disable index trừ khi thực sự cần
-- Luôn rebuild sau khi disable
-- Test schema changes trên staging trước
```

### 3. Document Index Status
```sql
-- Track index status
CREATE TABLE IndexMaintenanceLog (
    LogDate DATETIME DEFAULT GETDATE(),
    TableName SYSNAME,
    IndexName SYSNAME,
    Action VARCHAR(50),
    Status VARCHAR(50),
    Notes NVARCHAR(MAX)
)
```

## Automation

### Script Tự Động Fix
```sql
CREATE PROCEDURE sp_FixUnusableIndexes
    @RebuildOnly BIT = 1  -- 1 = Rebuild, 0 = Drop and Recreate
AS
BEGIN
    DECLARE @SQL NVARCHAR(MAX)
    DECLARE @TableName SYSNAME
    DECLARE @IndexName SYSNAME
    
    DECLARE index_cursor CURSOR FOR
    SELECT 
        OBJECT_SCHEMA_NAME(object_id) + '.' + OBJECT_NAME(object_id),
        name
    FROM sys.indexes
    WHERE is_disabled = 1
        AND object_id > 100
    
    OPEN index_cursor
    FETCH NEXT FROM index_cursor INTO @TableName, @IndexName
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF @RebuildOnly = 1
        BEGIN
            SET @SQL = 'ALTER INDEX ' + QUOTENAME(@IndexName) + 
                      ' ON ' + QUOTENAME(@TableName) + 
                      ' REBUILD WITH (ONLINE = ON)'
        END
        ELSE
        BEGIN
            -- Drop và recreate (cần lưu index definition trước)
            SET @SQL = '-- Drop and recreate index ' + QUOTENAME(@IndexName)
        END
        
        PRINT @SQL
        -- EXEC sp_executesql @SQL
        
        FETCH NEXT FROM index_cursor INTO @TableName, @IndexName
    END
    
    CLOSE index_cursor
    DEALLOCATE index_cursor
END
```

## Performance Impact

### Disabled Index
- ❌ Không được sử dụng cho queries
- ❌ Vẫn chiếm disk space
- ❌ Vẫn được maintain (updates)
- ✅ Có thể enable lại nhanh

### Unused Index
- ❌ Chiếm disk space
- ❌ Tốn resources để maintain
- ❌ Làm chậm INSERT/UPDATE
- ✅ Có thể drop an toàn

## Case Study

### Vấn Đề
- Database có 50 disabled indexes
- Chiếm 200GB disk space
- Không được sử dụng
- Làm chậm maintenance operations

### Giải Pháp
```sql
-- Rebuild tất cả disabled indexes
DECLARE @SQL NVARCHAR(MAX)
SELECT @SQL = STRING_AGG(
    'ALTER INDEX ' + QUOTENAME(name) + 
    ' ON ' + QUOTENAME(OBJECT_SCHEMA_NAME(object_id)) + '.' +
    QUOTENAME(OBJECT_NAME(object_id)) + 
    ' REBUILD WITH (ONLINE = ON);',
    CHAR(13)
)
FROM sys.indexes
WHERE is_disabled = 1

EXEC sp_executesql @SQL
```

### Kết Quả
- Tất cả indexes được rebuild
- Disk space được tối ưu
- Maintenance operations nhanh hơn
- Query performance cải thiện

## Kết Luận

Unusable indexes cần được:
- ✅ Phát hiện thường xuyên
- ✅ Rebuild hoặc drop
- ✅ Monitor và prevent
- ✅ Document status

Regular maintenance của indexes là critical cho database performance!

