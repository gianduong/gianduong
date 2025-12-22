# So Sánh Chi Tiết Giữa Range Scan và Index Seek

## Tổng Quan
Hiểu sự khác biệt giữa Range Scan và Index Seek là critical để tối ưu queries. Mỗi loại có use case riêng và performance characteristics khác nhau.

## Index Seek

### Định Nghĩa
Index Seek là khi SQL Server truy cập trực tiếp vào index entry cụ thể mà không cần scan.

### Đặc Điểm
- **Truy cập trực tiếp** vào index entry
- **O(log n)** complexity
- **Ít I/O** nhất
- **Nhanh nhất** cho exact match

### Ví Dụ
```sql
-- Exact match → Index Seek
SELECT * FROM Orders
WHERE OrderID = 12345
-- ✅ Index Seek trên OrderID (Primary Key)

-- Range query với index → Index Seek
SELECT * FROM Orders
WHERE OrderDate >= '2024-01-01' AND OrderDate < '2024-02-01'
-- ✅ Index Seek trên OrderDate index
```

### Execution Plan
```
Index Seek (Clustered)
  Cost: 10%
  Rows: 1
  I/O: 3 logical reads
```

## Range Scan

### Định Nghĩa
Range Scan là khi SQL Server scan một phần của index (một range) thay vì truy cập trực tiếp.

### Đặc Điểm
- **Scan một phần** của index
- **O(n)** complexity (trong range)
- **Nhiều I/O hơn** seek nhưng ít hơn table scan
- **Phù hợp** cho range queries

### Ví Dụ
```sql
-- Range query → Range Scan
SELECT * FROM Orders
WHERE OrderDate BETWEEN '2024-01-01' AND '2024-12-31'
-- ✅ Range Scan trên OrderDate index

-- LIKE với prefix → Range Scan
SELECT * FROM Customers
WHERE CustomerName LIKE 'John%'
-- ✅ Range Scan nếu có index trên CustomerName
```

### Execution Plan
```
Index Seek (Clustered)
  Cost: 25%
  Rows: 10,000
  I/O: 150 logical reads
  Scan Direction: FORWARD
```

## Table Scan

### Định Nghĩa
Table Scan là khi SQL Server scan toàn bộ table, không sử dụng index.

### Đặc Điểm
- **Scan toàn bộ** table
- **O(n)** complexity (toàn bộ table)
- **Nhiều I/O nhất**
- **Chậm nhất**

### Ví Dụ
```sql
-- Không có index → Table Scan
SELECT * FROM Orders
WHERE CustomerID = 123
-- ❌ Table Scan nếu không có index trên CustomerID

-- Function trên column → Table Scan
SELECT * FROM Orders
WHERE YEAR(OrderDate) = 2024
-- ❌ Table Scan vì function trên indexed column
```

### Execution Plan
```
Table Scan
  Cost: 100%
  Rows: 1,000,000
  I/O: 10,000 logical reads
```

## So Sánh Performance

### Case 1: Exact Match
```sql
-- Query: SELECT * FROM Orders WHERE OrderID = 12345
-- Table: 1M rows

-- Index Seek
-- I/O: 3 logical reads
-- Time: 1ms
-- ✅ Best

-- Table Scan
-- I/O: 10,000 logical reads
-- Time: 100ms
-- ❌ 100x chậm hơn
```

### Case 2: Range Query
```sql
-- Query: SELECT * FROM Orders WHERE OrderDate BETWEEN '2024-01-01' AND '2024-01-31'
-- Table: 1M rows, 10K rows trong range

-- Range Scan
-- I/O: 150 logical reads
-- Time: 15ms
-- ✅ Good

-- Table Scan
-- I/O: 10,000 logical reads
-- Time: 100ms
-- ❌ 6.7x chậm hơn

-- Index Seek (không khả thi cho range)
-- N/A
```

### Case 3: Large Range
```sql
-- Query: SELECT * FROM Orders WHERE OrderDate >= '2020-01-01'
-- Table: 1M rows, 800K rows trong range

-- Range Scan
-- I/O: 8,000 logical reads
-- Time: 80ms
-- ⚠️ Acceptable

-- Table Scan
-- I/O: 10,000 logical reads
-- Time: 100ms
-- ❌ Chỉ chậm hơn 25%

-- Nếu range quá lớn, table scan có thể tốt hơn
```

## Khi Nào Dùng Gì

### Index Seek
- ✅ Exact match queries
- ✅ Primary key lookups
- ✅ Unique index lookups
- ✅ Small range queries

### Range Scan
- ✅ Range queries (BETWEEN, >=, <=)
- ✅ LIKE với prefix ('John%')
- ✅ IN với nhiều values
- ✅ Queries cần scan một phần index

### Table Scan
- ❌ Tránh bằng mọi giá
- ⚠️ Chỉ acceptable khi:
  - Range quá lớn (> 80% table)
  - Table nhỏ (< 1000 rows)
  - Không có index phù hợp

## Tối Ưu Cho Range Scan

### 1. Tạo Index Phù Hợp
```sql
-- Index cho range queries
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate
ON Orders(OrderDate)
INCLUDE (CustomerID, TotalAmount)

-- Range scan sẽ nhanh hơn
SELECT CustomerID, TotalAmount
FROM Orders
WHERE OrderDate BETWEEN '2024-01-01' AND '2024-12-31'
```

### 2. Covering Index
```sql
-- Covering index để tránh key lookup
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate_Covering
ON Orders(OrderDate)
INCLUDE (CustomerID, TotalAmount, Status)

-- Range scan + covering = rất nhanh
SELECT CustomerID, TotalAmount, Status
FROM Orders
WHERE OrderDate BETWEEN '2024-01-01' AND '2024-12-31'
```

### 3. Partitioning
```sql
-- Partitioning giúp range scan nhanh hơn
-- Chỉ scan partitions cần thiết
SELECT * FROM Orders
WHERE OrderDate BETWEEN '2024-01-01' AND '2024-12-31'
-- Chỉ scan partitions năm 2024
```

## Monitoring

### Kiểm Tra Scan vs Seek
```sql
-- So sánh seeks vs scans
SELECT 
    OBJECT_NAME(ios.object_id) AS TableName,
    i.name AS IndexName,
    ios.user_seeks,
    ios.user_scans,
    ios.user_lookups,
    CASE 
        WHEN ios.user_seeks + ios.user_scans + ios.user_lookups > 0
        THEN ios.user_seeks * 100.0 / (ios.user_seeks + ios.user_scans + ios.user_lookups)
        ELSE 0
    END AS seek_percentage
FROM sys.dm_db_index_usage_stats ios
INNER JOIN sys.indexes i 
    ON ios.object_id = i.object_id 
    AND ios.index_id = i.index_id
WHERE ios.database_id = DB_ID()
ORDER BY seek_percentage ASC  -- Tìm indexes có ít seeks
```

### Kiểm Tra Execution Plans
```sql
-- Tìm queries có table scan
SELECT 
    qp.query_plan,
    qt.text
FROM sys.dm_exec_cached_plans cp
CROSS APPLY sys.dm_exec_sql_text(cp.plan_handle) qt
CROSS APPLY sys.dm_exec_query_plan(cp.plan_handle) qp
WHERE qp.query_plan.exist('//RelOp[@PhysicalOp="Table Scan"]') = 1
```

## Best Practices

### 1. Maximize Index Seeks
- Tạo index cho exact match queries
- Sử dụng primary key khi có thể
- Tránh functions trên indexed columns

### 2. Optimize Range Scans
- Tạo index cho range queries
- Sử dụng covering index
- Consider partitioning cho large ranges

### 3. Avoid Table Scans
- Luôn có index phù hợp
- Sửa queries không tối ưu
- Update statistics

## Kết Luận

Hiểu sự khác biệt giữa Index Seek, Range Scan, và Table Scan:
- ✅ **Index Seek**: Best cho exact match, O(log n)
- ✅ **Range Scan**: Good cho range queries, O(n) trong range
- ❌ **Table Scan**: Worst, O(n) toàn bộ table

Mục tiêu: Maximize seeks, optimize scans, eliminate table scans!

