# Các Table Nào Đang Bị Quét Full (Full Table Scan)

## Tổng Quan
Full table scan là một trong những vấn đề performance nghiêm trọng nhất. Phát hiện và fix các tables đang bị quét full là ưu tiên hàng đầu.

## Phát Hiện Full Table Scan

### 1. Sử Dụng DMV
```sql
-- Tìm tables có nhiều scans hơn seeks
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    i.name AS IndexName,
    ios.user_seeks,
    ios.user_scans,
    ios.user_lookups,
    ios.user_updates,
    ios.user_seeks + ios.user_scans + ios.user_lookups AS total_reads,
    CASE 
        WHEN ios.user_seeks + ios.user_scans + ios.user_lookups > 0 
        THEN ios.user_scans * 100.0 / (ios.user_seeks + ios.user_scans + ios.user_lookups)
        ELSE 0
    END AS scan_percentage
FROM sys.dm_db_index_usage_stats ios
INNER JOIN sys.indexes i 
    ON ios.object_id = i.object_id 
    AND ios.index_id = i.index_id
WHERE ios.database_id = DB_ID()
    AND ios.user_scans > ios.user_seeks * 10  -- Nhiều scans hơn seeks 10 lần
    AND ios.user_scans > 100  -- Có đủ activity
ORDER BY scan_percentage DESC, ios.user_scans DESC
```

### 2. Sử Dụng Execution Plan
```sql
-- Enable execution plan
SET STATISTICS PROFILE ON

-- Chạy query và xem plan
SELECT * FROM TableName WHERE Column1 = @Value

-- Tìm "Table Scan" operator trong plan
-- ❌ Table Scan = Full table scan
-- ✅ Index Seek = Sử dụng index
```

### 3. Sử Dụng Query Store
```sql
-- Tìm queries có table scan trong Query Store
SELECT 
    q.query_id,
    qt.query_sql_text,
    rs.avg_cpu_time,
    rs.avg_logical_io_reads,
    rs.avg_physical_io_reads
FROM sys.query_store_query q
INNER JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
INNER JOIN sys.query_store_plan p ON q.query_id = p.query_id
INNER JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
WHERE rs.avg_physical_io_reads > 10000  -- High I/O
ORDER BY rs.avg_physical_io_reads DESC
```

## Nguyên Nhân Full Table Scan

### 1. Không Có Index
```sql
-- Table không có index phù hợp
SELECT * FROM Orders
WHERE CustomerID = 123
-- ❌ Nếu không có index trên CustomerID → Table scan
```

### 2. Index Không Được Sử Dụng
```sql
-- Index có nhưng không được sử dụng
-- Nguyên nhân:
-- - Statistics cũ
-- - Implicit conversion
-- - Functions trên indexed column
```

### 3. Query Không Tối Ưu
```sql
-- Query không sử dụng index hiện có
SELECT * FROM Orders
WHERE YEAR(OrderDate) = 2024
-- ❌ Function trên column → Index không được dùng
```

## Giải Pháp

### 1. Tạo Index Phù Hợp
```sql
-- Tạo index cho column thường xuyên query
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
INCLUDE (OrderDate, TotalAmount)

-- Verify index được sử dụng
SELECT * FROM Orders WHERE CustomerID = 123
-- ✅ Index Seek thay vì Table Scan
```

### 2. Sửa Query Để Sử Dụng Index
```sql
-- ❌ Chậm: Function trên column
SELECT * FROM Orders
WHERE YEAR(OrderDate) = 2024

-- ✅ Nhanh: Range query
SELECT * FROM Orders
WHERE OrderDate >= '2024-01-01' AND OrderDate < '2025-01-01'
```

### 3. Update Statistics
```sql
-- Statistics cũ có thể làm index không được sử dụng
UPDATE STATISTICS Orders
WITH FULLSCAN

-- Verify lại execution plan
```

### 4. Sử Dụng Covering Index
```sql
-- Covering index để tránh key lookup
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID_Covering
ON Orders(CustomerID)
INCLUDE (OrderDate, TotalAmount, Status)

-- Query chỉ cần đọc index, không cần table
SELECT CustomerID, OrderDate, TotalAmount
FROM Orders
WHERE CustomerID = 123
```

## Monitoring Scripts

### Script Tự Động Phát Hiện
```sql
-- Tìm tables có full table scan
WITH IndexUsage AS (
    SELECT 
        OBJECT_NAME(ios.object_id) AS TableName,
        i.name AS IndexName,
        ios.user_seeks,
        ios.user_scans,
        ios.user_lookups,
        ios.user_updates,
        CASE 
            WHEN ios.user_seeks + ios.user_scans + ios.user_lookups > 0 
            THEN ios.user_scans * 100.0 / (ios.user_seeks + ios.user_scans + ios.user_lookups)
            ELSE 0
        END AS scan_percentage
    FROM sys.dm_db_index_usage_stats ios
    INNER JOIN sys.indexes i 
        ON ios.object_id = i.object_id 
        AND ios.index_id = i.index_id
    WHERE ios.database_id = DB_ID()
        AND ios.user_scans > 100
),
MissingIndexes AS (
    SELECT 
        OBJECT_NAME(object_id) AS TableName,
        equality_columns,
        inequality_columns,
        included_columns,
        user_seeks,
        user_scans,
        avg_total_user_cost * avg_user_impact * (user_seeks + user_scans) AS improvement_measure
    FROM sys.dm_db_missing_index_details mid
    INNER JOIN sys.dm_db_missing_index_groups mig ON mid.index_handle = mig.index_handle
    INNER JOIN sys.dm_db_missing_index_group_stats migs ON mig.index_group_handle = migs.group_handle
)
SELECT 
    iu.TableName,
    iu.scan_percentage,
    iu.user_scans,
    mi.equality_columns,
    mi.inequality_columns,
    mi.improvement_measure
FROM IndexUsage iu
LEFT JOIN MissingIndexes mi ON iu.TableName = mi.TableName
WHERE iu.scan_percentage > 50  -- Hơn 50% là scans
ORDER BY iu.scan_percentage DESC, mi.improvement_measure DESC
```

## Best Practices

### 1. Regular Monitoring
```sql
-- Schedule job để monitor full table scans
-- Chạy hàng tuần và báo cáo
```

### 2. Index Strategy
- Tạo index cho columns thường xuyên query
- Sử dụng covering index khi có thể
- Monitor index usage và drop unused indexes

### 3. Query Review
- Review queries mới trước khi deploy
- Xem execution plan cho tất cả queries
- Test với data thực tế

## Case Study

### Vấn Đề
- Table Orders có 10M rows
- Query `SELECT * FROM Orders WHERE CustomerID = 123` chậm 30 giây
- Execution plan cho thấy Table Scan

### Giải Pháp
```sql
-- Tạo index
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
INCLUDE (OrderDate, TotalAmount)

-- Update statistics
UPDATE STATISTICS Orders
```

### Kết Quả
- Query time giảm từ 30s xuống 50ms
- Index Seek thay vì Table Scan
- Improvement: 600x

## Kết Luận

Full table scan là vấn đề performance nghiêm trọng:
- ✅ Monitor thường xuyên
- ✅ Tạo index phù hợp
- ✅ Sửa queries không tối ưu
- ✅ Update statistics
- ❌ Không để full table scan trong production

Luôn ưu tiên fix full table scans trước các vấn đề performance khác!

