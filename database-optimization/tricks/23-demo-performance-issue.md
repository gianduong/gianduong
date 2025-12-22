# Demo Sự Cố Hiệu Năng - Case Study Thực Tế

## Tổng Quan
Case study thực tế về sự cố hiệu năng và cách giải quyết. Học từ các vấn đề thực tế giúp tránh lặp lại mistakes.

## Case Study 1: Foreign Key Không Có Index

### Vấn Đề
- Hệ thống bị treo khi DELETE parent records
- Nhiều sessions bị block
- Timeout errors thường xuyên
- Users không thể thao tác

### Phân Tích
```sql
-- Query gây vấn đề
DELETE FROM Customers WHERE CustomerID = 123

-- Execution plan cho thấy:
-- - Table Scan trên Orders table
-- - Lock trên toàn bộ Orders table
-- - Block time: 30+ seconds
```

### Nguyên Nhân
- Foreign key `Orders.CustomerID` không có index
- DELETE phải scan toàn bộ Orders table để check constraint
- Gây lock contention nghiêm trọng

### Giải Pháp
```sql
-- Tạo index cho foreign key
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
WITH (ONLINE = ON, MAXDOP = 4)

-- Update statistics
UPDATE STATISTICS Orders
```

### Kết Quả
- DELETE time: 30s → 50ms (600x improvement)
- Lock time: 30s → 50ms
- No more blocking
- System stability restored

## Case Study 2: Query Chậm Do Missing Index

### Vấn Đề
- Query report chậm 30 giây
- Users phàn nàn
- System load cao

### Query
```sql
SELECT o.OrderID, o.OrderDate, c.CustomerName, SUM(oi.Quantity * oi.Price) AS Total
FROM Orders o
INNER JOIN Customers c ON o.CustomerID = c.CustomerID
INNER JOIN OrderItems oi ON o.OrderID = oi.OrderID
WHERE o.OrderDate >= '2024-01-01'
GROUP BY o.OrderID, o.OrderDate, c.CustomerName
ORDER BY o.OrderDate DESC
```

### Phân Tích Execution Plan
- Table Scan trên Orders (Cost: 60%)
- Table Scan trên OrderItems (Cost: 30%)
- Sort operation (Cost: 10%)

### Giải Pháp
```sql
-- Tạo indexes
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate
ON Orders(OrderDate)
INCLUDE (CustomerID)

CREATE NONCLUSTERED INDEX IX_OrderItems_OrderID
ON OrderItems(OrderID)
INCLUDE (Quantity, Price)

-- Update statistics
UPDATE STATISTICS Orders WITH FULLSCAN
UPDATE STATISTICS OrderItems WITH FULLSCAN
```

### Kết Quả
- Query time: 30s → 200ms (150x improvement)
- Index Seek thay vì Table Scan
- System load giảm đáng kể

## Case Study 3: Parameter Sniffing

### Vấn Đề
- Query đôi khi chậm, đôi khi nhanh
- Không consistent
- Khó reproduce

### Query
```sql
CREATE PROCEDURE sp_GetOrders
    @CustomerID INT
AS
BEGIN
    SELECT * FROM Orders
    WHERE CustomerID = @CustomerID
    ORDER BY OrderDate DESC
END
```

### Phân Tích
- First execution với CustomerID = 1 (có 10 orders) → Plan cached
- Plan optimized cho 10 rows
- Execution với CustomerID = 2 (có 100,000 orders) → Dùng plan cũ → Chậm

### Giải Pháp
```sql
-- Option 1: OPTIMIZE FOR
CREATE PROCEDURE sp_GetOrders
    @CustomerID INT
AS
BEGIN
    SELECT * FROM Orders
    WHERE CustomerID = @CustomerID
    ORDER BY OrderDate DESC
    OPTION (OPTIMIZE FOR (@CustomerID = 1))
END

-- Option 2: OPTIMIZE FOR UNKNOWN
CREATE PROCEDURE sp_GetOrders
    @CustomerID INT
AS
BEGIN
    SELECT * FROM Orders
    WHERE CustomerID = @CustomerID
    ORDER BY OrderDate DESC
    OPTION (OPTIMIZE FOR UNKNOWN)
END

-- Option 3: RECOMPILE
CREATE PROCEDURE sp_GetOrders
    @CustomerID INT
AS
BEGIN
    SELECT * FROM Orders
    WHERE CustomerID = @CustomerID
    ORDER BY OrderDate DESC
    OPTION (RECOMPILE)
END
```

### Kết Quả
- Consistent performance
- No more random slowdowns
- Predictable query times

## Case Study 4: Full Table Scan trên Large Table

### Vấn Đề
- Report query chậm 5 phút
- Database CPU 100%
- Blocking other queries

### Query
```sql
SELECT CustomerID, COUNT(*) AS OrderCount, SUM(TotalAmount) AS Total
FROM Orders
WHERE YEAR(OrderDate) = 2024
GROUP BY CustomerID
```

### Phân Tích
- Function `YEAR()` trên indexed column
- Index không được sử dụng
- Full table scan trên 10M rows

### Giải Pháp
```sql
-- Sửa query để sử dụng index
SELECT CustomerID, COUNT(*) AS OrderCount, SUM(TotalAmount) AS Total
FROM Orders
WHERE OrderDate >= '2024-01-01' AND OrderDate < '2025-01-01'
GROUP BY CustomerID

-- Tạo index nếu chưa có
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate
ON Orders(OrderDate)
INCLUDE (CustomerID, TotalAmount)
```

### Kết Quả
- Query time: 5 minutes → 2 seconds (150x improvement)
- Index Seek thay vì Table Scan
- CPU usage giảm từ 100% xuống 10%

## Case Study 5: Index Fragmentation

### Vấn Đề
- Queries chậm dần theo thời gian
- Index size tăng nhưng performance giảm
- Maintenance operations chậm

### Phân Tích
```sql
-- Kiểm tra fragmentation
SELECT 
    name AS IndexName,
    avg_fragmentation_in_percent,
    page_count
FROM sys.dm_db_index_physical_stats(DB_ID(), OBJECT_ID('Orders'), NULL, NULL, 'DETAILED')
WHERE index_id > 0

-- Kết quả:
-- avg_fragmentation_in_percent: 75%
-- page_count: 50,000
```

### Giải Pháp
```sql
-- Rebuild indexes
ALTER INDEX ALL ON Orders REBUILD
WITH (
    ONLINE = ON,
    MAXDOP = 4,
    FILLFACTOR = 90
)

-- Update statistics
UPDATE STATISTICS Orders WITH FULLSCAN
```

### Kết Quả
- Fragmentation: 75% → 5%
- Query performance cải thiện 3x
- Index size giảm 20%

## Best Practices Từ Case Studies

### 1. Always Index Foreign Keys
```sql
-- Luôn tạo index cho foreign keys
CREATE INDEX IX_ChildTable_ParentID
ON ChildTable(ParentID)
```

### 2. Avoid Functions on Indexed Columns
```sql
-- ❌ Chậm
WHERE YEAR(OrderDate) = 2024

-- ✅ Nhanh
WHERE OrderDate >= '2024-01-01' AND OrderDate < '2025-01-01'
```

### 3. Monitor Query Performance
```sql
-- Sử dụng Query Store
-- Monitor execution plans
-- Track performance trends
```

### 4. Regular Index Maintenance
```sql
-- Rebuild/reorganize indexes thường xuyên
-- Update statistics
-- Monitor fragmentation
```

### 5. Test với Data Thực Tế
```sql
-- Test queries với production-like data
-- Measure actual performance
-- Verify execution plans
```

## Kết Luận

Học từ case studies thực tế:
- ✅ Identify patterns
- ✅ Apply solutions
- ✅ Prevent issues
- ✅ Improve performance

Mỗi case study là một bài học quý giá!

