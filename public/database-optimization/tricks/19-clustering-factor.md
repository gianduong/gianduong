# Clustering Factor và Sự Ảnh Hưởng Đến Index

## Tổng Quan
Clustering Factor là metric quan trọng đo lường mức độ data được sắp xếp theo index. Hiểu clustering factor giúp tối ưu index hiệu quả hơn.

## Clustering Factor Là Gì

### Định Nghĩa
Clustering Factor đo lường số lần SQL Server phải "nhảy" giữa các data pages khi đọc index theo thứ tự.

- **Clustering Factor Thấp** = Data được sắp xếp tốt = Index hiệu quả
- **Clustering Factor Cao** = Data không được sắp xếp = Index kém hiệu quả

### Cách Tính
```
Clustering Factor = Số lần đổi data page khi scan index theo thứ tự
```

Ví dụ:
- Index có 1000 entries
- Scan theo thứ tự index
- Nếu mỗi entry ở page khác nhau → Clustering Factor = 1000 (tệ nhất)
- Nếu tất cả entries ở cùng page → Clustering Factor = 1 (tốt nhất)

## Ảnh Hưởng Đến Performance

### Clustering Factor Thấp (Tốt)
```sql
-- Data được sắp xếp theo index
-- Index scan nhanh, ít I/O
SELECT * FROM Orders
ORDER BY OrderDate  -- OrderDate là clustered index key
-- ✅ Sequential I/O
-- ✅ Ít page reads
-- ✅ Nhanh
```

### Clustering Factor Cao (Xấu)
```sql
-- Data không được sắp xếp theo index
-- Index scan chậm, nhiều I/O
SELECT * FROM Orders
ORDER BY CustomerID  -- CustomerID không phải clustered index key
-- ❌ Random I/O
-- ❌ Nhiều page reads
-- ❌ Chậm
```

## Đo Lường Clustering Factor

### SQL Server
SQL Server không expose clustering factor trực tiếp, nhưng có thể estimate:

```sql
-- Estimate clustering factor bằng cách so sánh:
-- 1. Số pages trong index
-- 2. Số pages trong table
-- 3. Fragmentation

SELECT 
    OBJECT_NAME(object_id) AS TableName,
    name AS IndexName,
    avg_fragmentation_in_percent,
    page_count AS IndexPages,
    (SELECT SUM(reserved_page_count) 
     FROM sys.dm_db_partition_stats 
     WHERE object_id = OBJECT_ID('TableName')) AS TablePages,
    CASE 
        WHEN avg_fragmentation_in_percent > 30 THEN 'HIGH'
        WHEN avg_fragmentation_in_percent > 10 THEN 'MEDIUM'
        ELSE 'LOW'
    END AS ClusteringFactorEstimate
FROM sys.dm_db_index_physical_stats(DB_ID(), OBJECT_ID('TableName'), NULL, NULL, 'DETAILED')
WHERE index_id > 0
```

### Oracle (Reference)
Oracle có clustering factor metric:
```sql
-- Oracle
SELECT 
    table_name,
    index_name,
    clustering_factor
FROM user_indexes
WHERE clustering_factor > num_rows * 0.8  -- High clustering factor
```

## Cải Thiện Clustering Factor

### 1. Thay Đổi Clustered Index
```sql
-- Nếu clustering factor cao
-- Cân nhắc thay đổi clustered index

-- Drop clustered index cũ
DROP INDEX PK_Orders ON Orders

-- Tạo clustered index mới trên column phù hợp hơn
CREATE CLUSTERED INDEX PK_Orders_OrderDate
ON Orders(OrderDate)
```

### 2. Rebuild Index
```sql
-- Rebuild index để cải thiện clustering
ALTER INDEX ALL ON Orders REBUILD
WITH (
    ONLINE = ON,
    FILLFACTOR = 100  -- Pack data tightly
)
```

### 3. Reorganize Data
```sql
-- Sắp xếp lại data theo index key
-- Có thể dùng:
-- 1. Rebuild clustered index
-- 2. Recreate table với data sorted
-- 3. Partition table theo index key
```

## Best Practices

### 1. Chọn Clustered Index Phù Hợp
```sql
-- Clustered index nên là:
-- ✅ Column thường xuyên trong ORDER BY
-- ✅ Column thường xuyên trong range queries
-- ✅ Column có tính sequential (date, ID)
-- ❌ Tránh random values (GUID, hash)
```

### 2. Monitor Fragmentation
```sql
-- Fragmentation cao = clustering factor cao
-- Monitor và rebuild khi cần
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    name AS IndexName,
    avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED')
WHERE avg_fragmentation_in_percent > 30
ORDER BY avg_fragmentation_in_percent DESC
```

### 3. Consider Partitioning
```sql
-- Partitioning có thể cải thiện clustering factor
-- Mỗi partition có clustering tốt hơn
CREATE PARTITION FUNCTION PF_Monthly (DATETIME)
AS RANGE RIGHT FOR VALUES ('2024-01-01', '2024-02-01')

CREATE TABLE Orders (
    OrderID INT,
    OrderDate DATETIME,
    -- ...
) ON PS_Monthly(OrderDate)
```

## Performance Impact

### Case 1: Low Clustering Factor
```sql
-- Query: SELECT * FROM Orders ORDER BY OrderDate
-- Clustering Factor: 10 (tốt)
-- I/O: 100 pages
-- Time: 100ms
```

### Case 2: High Clustering Factor
```sql
-- Query: SELECT * FROM Orders ORDER BY OrderDate
-- Clustering Factor: 1000 (xấu)
-- I/O: 10,000 pages (random I/O)
-- Time: 10,000ms (100x chậm hơn)
```

## Monitoring Script

### Comprehensive Clustering Analysis
```sql
WITH IndexStats AS (
    SELECT 
        OBJECT_NAME(ips.object_id) AS TableName,
        i.name AS IndexName,
        i.type_desc,
        i.is_unique,
        ips.avg_fragmentation_in_percent,
        ips.page_count,
        ips.record_count,
        CASE 
            WHEN i.type_desc = 'CLUSTERED' THEN 'CLUSTERED'
            ELSE 'NONCLUSTERED'
        END AS IndexType
    FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED') ips
    INNER JOIN sys.indexes i 
        ON ips.object_id = i.object_id 
        AND ips.index_id = i.index_id
    WHERE ips.index_id > 0
        AND ips.page_count > 100
),
UsageStats AS (
    SELECT 
        OBJECT_NAME(ios.object_id) AS TableName,
        i.name AS IndexName,
        ios.user_seeks,
        ios.user_scans,
        ios.user_lookups,
        ios.user_updates
    FROM sys.dm_db_index_usage_stats ios
    INNER JOIN sys.indexes i 
        ON ios.object_id = i.object_id 
        AND ios.index_id = i.index_id
    WHERE ios.database_id = DB_ID()
)
SELECT 
    is_.TableName,
    is_.IndexName,
    is_.IndexType,
    is_.avg_fragmentation_in_percent,
    is_.page_count,
    us.user_seeks + us.user_scans AS total_reads,
    CASE 
        WHEN is_.avg_fragmentation_in_percent > 30 THEN 'HIGH_CLUSTERING_FACTOR'
        WHEN is_.avg_fragmentation_in_percent > 10 THEN 'MEDIUM_CLUSTERING_FACTOR'
        ELSE 'LOW_CLUSTERING_FACTOR'
    END AS ClusteringFactorStatus
FROM IndexStats is_
LEFT JOIN UsageStats us 
    ON is_.TableName = us.TableName 
    AND is_.IndexName = us.IndexName
ORDER BY is_.avg_fragmentation_in_percent DESC
```

## Kết Luận

Clustering Factor ảnh hưởng trực tiếp đến index performance:
- ✅ Low clustering factor = Fast sequential I/O
- ❌ High clustering factor = Slow random I/O
- ✅ Chọn clustered index phù hợp
- ✅ Monitor và rebuild khi cần
- ✅ Consider partitioning cho large tables

Hiểu và optimize clustering factor là key để đạt index performance tốt nhất!

