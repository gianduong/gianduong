# Quy Trình Thực Hiện Giám Sát Index

## Tổng Quan
Giám sát index thường xuyên là critical để đảm bảo performance tốt. Cần track usage, fragmentation, và identify issues sớm.

## Các Metrics Quan Trọng

### 1. Index Usage
- User seeks: Số lần index seek
- User scans: Số lần index scan
- User lookups: Số lần key lookup
- User updates: Số lần update index

### 2. Index Fragmentation
- Avg fragmentation: Fragmentation trung bình
- Page count: Số pages trong index
- Record count: Số records trong index

### 3. Index Size
- Index size: Kích thước index
- Growth rate: Tốc độ tăng trưởng

## Scripts Giám Sát

### 1. Index Usage Statistics
```sql
-- Comprehensive index usage report
SELECT 
    OBJECT_SCHEMA_NAME(ios.object_id) AS SchemaName,
    OBJECT_NAME(ios.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    i.is_unique,
    i.is_primary_key,
    ios.user_seeks,
    ios.user_scans,
    ios.user_lookups,
    ios.user_updates,
    ios.user_seeks + ios.user_scans + ios.user_lookups AS total_reads,
    CASE 
        WHEN ios.user_seeks + ios.user_scans + ios.user_lookups > 0
        THEN ios.user_seeks * 100.0 / (ios.user_seeks + ios.user_scans + ios.user_lookups)
        ELSE 0
    END AS seek_percentage,
    CASE 
        WHEN ios.user_seeks + ios.user_scans + ios.user_lookups = 0 THEN 'UNUSED'
        WHEN ios.user_updates > (ios.user_seeks + ios.user_scans + ios.user_lookups) * 10 THEN 'OVERHEAD'
        WHEN ios.user_scans > ios.user_seeks * 10 THEN 'MOSTLY_SCANS'
        ELSE 'OK'
    END AS Status
FROM sys.dm_db_index_usage_stats ios
INNER JOIN sys.indexes i 
    ON ios.object_id = i.object_id 
    AND ios.index_id = i.index_id
WHERE ios.database_id = DB_ID()
    AND i.object_id > 100  -- User objects only
ORDER BY 
    CASE 
        WHEN ios.user_seeks + ios.user_scans + ios.user_lookups = 0 THEN 1
        ELSE 0
    END,
    ios.user_updates DESC
```

### 2. Index Fragmentation Report
```sql
-- Fragmentation analysis
SELECT 
    OBJECT_SCHEMA_NAME(ips.object_id) AS SchemaName,
    OBJECT_NAME(ips.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    ips.avg_fragmentation_in_percent,
    ips.fragment_count,
    ips.avg_fragment_size_in_pages,
    ips.page_count,
    ips.record_count,
    CASE 
        WHEN ips.avg_fragmentation_in_percent > 30 AND ips.page_count > 1000 THEN 'REBUILD'
        WHEN ips.avg_fragmentation_in_percent > 10 AND ips.page_count > 1000 THEN 'REORGANIZE'
        ELSE 'OK'
    END AS Recommendation
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED') ips
INNER JOIN sys.indexes i 
    ON ips.object_id = i.object_id 
    AND ips.index_id = i.index_id
WHERE ips.index_id > 0
    AND ips.page_count > 100  -- Ignore small indexes
ORDER BY ips.avg_fragmentation_in_percent DESC
```

### 3. Unused Indexes
```sql
-- Tìm indexes không được sử dụng
SELECT 
    OBJECT_SCHEMA_NAME(i.object_id) AS SchemaName,
    OBJECT_NAME(i.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    ps.reserved_page_count * 8 / 1024 AS size_mb,
    ios.user_updates AS total_updates
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats ios 
    ON i.object_id = ios.object_id 
    AND i.index_id = ios.index_id
    AND ios.database_id = DB_ID()
LEFT JOIN sys.dm_db_partition_stats ps 
    ON i.object_id = ps.object_id 
    AND i.index_id = ps.index_id
WHERE i.object_id > 100
    AND i.is_primary_key = 0
    AND i.is_unique_constraint = 0
    AND (ios.user_seeks + ios.user_scans + ios.user_lookups) = 0
    AND ios.user_updates > 0  -- Có updates nhưng không được dùng
ORDER BY ps.reserved_page_count DESC
```

### 4. Missing Indexes
```sql
-- Tìm missing indexes
SELECT 
    OBJECT_NAME(mid.object_id) AS TableName,
    mid.equality_columns,
    mid.inequality_columns,
    mid.included_columns,
    migs.user_seeks,
    migs.user_scans,
    migs.avg_total_user_cost,
    migs.avg_user_impact,
    migs.avg_total_user_cost * migs.avg_user_impact * (migs.user_seeks + migs.user_scans) AS improvement_measure
FROM sys.dm_db_missing_index_details mid
INNER JOIN sys.dm_db_missing_index_groups mig 
    ON mid.index_handle = mig.index_handle
INNER JOIN sys.dm_db_missing_index_group_stats migs 
    ON mig.index_group_handle = migs.group_handle
WHERE mid.database_id = DB_ID()
ORDER BY improvement_measure DESC
```

### 5. Index Size Report
```sql
-- Index size và growth
SELECT 
    OBJECT_SCHEMA_NAME(ps.object_id) AS SchemaName,
    OBJECT_NAME(ps.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    ps.reserved_page_count * 8 / 1024 AS reserved_mb,
    ps.used_page_count * 8 / 1024 AS used_mb,
    ps.row_count,
    CASE 
        WHEN ps.row_count > 0 
        THEN (ps.used_page_count * 8.0 * 1024) / ps.row_count
        ELSE 0
    END AS bytes_per_row
FROM sys.dm_db_partition_stats ps
INNER JOIN sys.indexes i 
    ON ps.object_id = i.object_id 
    AND ps.index_id = i.index_id
WHERE ps.object_id > 100
ORDER BY ps.reserved_page_count DESC
```

## Automated Monitoring

### Stored Procedure Cho Daily Report
```sql
CREATE PROCEDURE sp_IndexMonitoringReport
AS
BEGIN
    -- 1. Unused indexes
    PRINT '=== UNUSED INDEXES ==='
    SELECT TOP 10
        OBJECT_SCHEMA_NAME(i.object_id) + '.' + OBJECT_NAME(i.object_id) AS TableName,
        i.name AS IndexName,
        ps.reserved_page_count * 8 / 1024 AS size_mb
    FROM sys.indexes i
    LEFT JOIN sys.dm_db_index_usage_stats ios 
        ON i.object_id = ios.object_id 
        AND i.index_id = ios.index_id
        AND ios.database_id = DB_ID()
    LEFT JOIN sys.dm_db_partition_stats ps 
        ON i.object_id = ps.object_id 
        AND i.index_id = ps.index_id
    WHERE i.object_id > 100
        AND (ios.user_seeks + ios.user_scans + ios.user_lookups) = 0
        AND ios.user_updates > 0
    ORDER BY ps.reserved_page_count DESC
    
    -- 2. High fragmentation
    PRINT '=== HIGH FRAGMENTATION ==='
    SELECT TOP 10
        OBJECT_SCHEMA_NAME(ips.object_id) + '.' + OBJECT_NAME(ips.object_id) AS TableName,
        i.name AS IndexName,
        ips.avg_fragmentation_in_percent,
        ips.page_count
    FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED') ips
    INNER JOIN sys.indexes i 
        ON ips.object_id = i.object_id 
        AND ips.index_id = i.index_id
    WHERE ips.avg_fragmentation_in_percent > 30
        AND ips.page_count > 1000
    ORDER BY ips.avg_fragmentation_in_percent DESC
    
    -- 3. Missing indexes
    PRINT '=== MISSING INDEXES ==='
    SELECT TOP 10
        OBJECT_NAME(mid.object_id) AS TableName,
        'CREATE INDEX IX_' + OBJECT_NAME(mid.object_id) + '_' + 
        REPLACE(REPLACE(REPLACE(ISNULL(mid.equality_columns, '') + 
        ISNULL(mid.inequality_columns, ''), '[', ''), ']', ''), ', ', '_') +
        ' ON ' + OBJECT_SCHEMA_NAME(mid.object_id) + '.' + OBJECT_NAME(mid.object_id) +
        '(' + ISNULL(mid.equality_columns, '') + 
        CASE WHEN mid.inequality_columns IS NOT NULL 
            THEN ',' + mid.inequality_columns 
            ELSE '' 
        END + ')' +
        CASE WHEN mid.included_columns IS NOT NULL 
            THEN ' INCLUDE (' + mid.included_columns + ')' 
            ELSE '' 
        END AS CreateIndexStatement,
        migs.avg_total_user_cost * migs.avg_user_impact * (migs.user_seeks + migs.user_scans) AS improvement_measure
    FROM sys.dm_db_missing_index_details mid
    INNER JOIN sys.dm_db_missing_index_groups mig 
        ON mid.index_handle = mig.index_handle
    INNER JOIN sys.dm_db_missing_index_group_stats migs 
        ON mig.index_group_handle = migs.group_handle
    WHERE mid.database_id = DB_ID()
    ORDER BY improvement_measure DESC
END
```

## Maintenance Schedule

### Daily
- Check unused indexes
- Check high fragmentation (> 30%)
- Check missing indexes

### Weekly
- Reorganize indexes với fragmentation 10-30%
- Review index usage statistics
- Analyze index growth

### Monthly
- Rebuild indexes với fragmentation > 30%
- Review và drop unused indexes
- Create missing indexes
- Review index strategy

## Best Practices

### 1. Regular Monitoring
- Schedule jobs để chạy monitoring scripts
- Set up alerts cho critical issues
- Review reports thường xuyên

### 2. Proactive Maintenance
- Rebuild/reorganize indexes trước khi fragmentation cao
- Create missing indexes sớm
- Drop unused indexes để giảm overhead

### 3. Documentation
- Document index strategy
- Track index changes
- Measure performance improvements

## Kết Luận

Giám sát index là critical cho database performance:
- ✅ Monitor thường xuyên
- ✅ Track usage, fragmentation, size
- ✅ Automated reports
- ✅ Proactive maintenance
- ✅ Document và review

Regular index monitoring giúp maintain optimal performance!

