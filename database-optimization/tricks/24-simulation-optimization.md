# Giả Lập Bài Toán Cần Thực Hiện Tối Ưu Cơ Sở Dữ Liệu

## Tổng Quan
Giả lập các bài toán tối ưu database giúp hiểu rõ vấn đề và tìm giải pháp hiệu quả. Đây là cách tiếp cận thực tế để học database optimization.

## Bài Toán 1: E-Commerce Database

### Scenario
- Database: 100M orders, 10M customers
- Query: Tìm orders của customer trong tháng
- Performance: Query chậm 30 giây
- Requirement: < 1 giây

### Phân Tích
```sql
-- Query hiện tại
SELECT o.OrderID, o.OrderDate, o.TotalAmount, oi.ProductName, oi.Quantity
FROM Orders o
INNER JOIN OrderItems oi ON o.OrderID = oi.OrderID
WHERE o.CustomerID = @CustomerID
    AND o.OrderDate >= DATEADD(MONTH, -1, GETDATE())
ORDER BY o.OrderDate DESC
```

### Vấn Đề
- Table Scan trên Orders
- Table Scan trên OrderItems
- No indexes phù hợp
- Statistics cũ

### Giải Pháp
```sql
-- 1. Tạo indexes
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID_OrderDate
ON Orders(CustomerID, OrderDate DESC)
INCLUDE (TotalAmount)

CREATE NONCLUSTERED INDEX IX_OrderItems_OrderID
ON OrderItems(OrderID)
INCLUDE (ProductName, Quantity)

-- 2. Update statistics
UPDATE STATISTICS Orders WITH FULLSCAN
UPDATE STATISTICS OrderItems WITH FULLSCAN

-- 3. Consider partitioning
CREATE PARTITION FUNCTION PF_Monthly (DATETIME)
AS RANGE RIGHT FOR VALUES ('2024-01-01', '2024-02-01', ...)

CREATE PARTITION SCHEME PS_Monthly
AS PARTITION PF_Monthly
TO ([PRIMARY], [PRIMARY], ...)

-- Recreate table với partition
```

### Kết Quả
- Query time: 30s → 200ms (150x improvement)
- Index Seek thay vì Table Scan
- Partition elimination cho range queries

## Bài Toán 2: Analytics Database

### Scenario
- Database: 1B events, time-series data
- Query: Aggregate events theo ngày
- Performance: Query chậm 10 phút
- Requirement: < 10 giây

### Phân Tích
```sql
-- Query hiện tại
SELECT 
    CAST(EventDate AS DATE) AS EventDay,
    EventType,
    COUNT(*) AS EventCount,
    SUM(EventValue) AS TotalValue
FROM Events
WHERE EventDate >= DATEADD(DAY, -30, GETDATE())
GROUP BY CAST(EventDate AS DATE), EventType
ORDER BY EventDay DESC, EventType
```

### Vấn Đề
- Full table scan
- Function trên indexed column
- No aggregation optimization
- Large result set

### Giải Pháp
```sql
-- 1. Sửa query
SELECT 
    CAST(EventDate AS DATE) AS EventDay,
    EventType,
    COUNT(*) AS EventCount,
    SUM(EventValue) AS TotalValue
FROM Events
WHERE EventDate >= DATEADD(DAY, -30, GETDATE())
    AND EventDate < GETDATE()
GROUP BY CAST(EventDate AS DATE), EventType
ORDER BY EventDay DESC, EventType

-- 2. Tạo index
CREATE NONCLUSTERED INDEX IX_Events_EventDate_EventType
ON Events(EventDate, EventType)
INCLUDE (EventValue)

-- 3. Consider columnstore index
CREATE NONCLUSTERED COLUMNSTORE INDEX IX_Events_Columnstore
ON Events(EventDate, EventType, EventValue)

-- 4. Partitioning
CREATE PARTITION FUNCTION PF_Daily (DATETIME)
AS RANGE RIGHT FOR VALUES (...)
```

### Kết Quả
- Query time: 10 minutes → 5 seconds (120x improvement)
- Columnstore index cho analytics
- Partition elimination

## Bài Toán 3: Multi-Tenant Database

### Scenario
- Database: 1000 tenants, 1B records total
- Query: Tenant-specific queries
- Performance: Queries chậm, không scalable
- Requirement: Fast và scalable

### Phân Tích
```sql
-- Query hiện tại
SELECT * FROM Data
WHERE TenantID = @TenantID
    AND CreatedDate >= @StartDate
ORDER BY CreatedDate DESC
```

### Vấn Đề
- No tenant isolation
- Index không tối ưu cho multi-tenant
- Hot spots trên popular tenants

### Giải Pháp
```sql
-- 1. Composite index với TenantID đầu tiên
CREATE NONCLUSTERED INDEX IX_Data_TenantID_CreatedDate
ON Data(TenantID, CreatedDate DESC)

-- 2. Consider partitioning by tenant
CREATE PARTITION FUNCTION PF_Tenant (INT)
AS RANGE RIGHT FOR VALUES (100, 200, 300, ...)

-- 3. Row-level security (SQL Server 2016+)
CREATE FUNCTION dbo.fn_TenantSecurityPolicy(@TenantID INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS result
WHERE @TenantID = CAST(SESSION_CONTEXT(N'TenantID') AS INT)

CREATE SECURITY POLICY TenantPolicy
ADD FILTER PREDICATE dbo.fn_TenantSecurityPolicy(TenantID) ON Data
```

### Kết Quả
- Query performance cải thiện 10x
- Tenant isolation
- Scalable architecture

## Bài Toán 4: Reporting Database

### Scenario
- Database: OLTP database dùng cho reporting
- Query: Complex reports với nhiều JOINs
- Performance: Reports chậm, ảnh hưởng OLTP
- Requirement: Fast reports, không ảnh hưởng OLTP

### Phân Tích
```sql
-- Report query
SELECT 
    c.CustomerName,
    COUNT(o.OrderID) AS OrderCount,
    SUM(o.TotalAmount) AS TotalAmount,
    AVG(o.TotalAmount) AS AvgAmount
FROM Customers c
LEFT JOIN Orders o ON c.CustomerID = o.CustomerID
WHERE o.OrderDate >= DATEADD(MONTH, -12, GETDATE())
GROUP BY c.CustomerID, c.CustomerName
HAVING COUNT(o.OrderID) > 10
ORDER BY TotalAmount DESC
```

### Vấn Đề
- Complex query trên OLTP database
- Ảnh hưởng đến OLTP performance
- No optimization cho reporting

### Giải Pháp
```sql
-- 1. Read replicas
-- Setup read replica cho reporting
-- Route report queries đến replica

-- 2. Materialized views
CREATE VIEW vw_CustomerOrderSummary
WITH SCHEMA_BINDING
AS
SELECT 
    c.CustomerID,
    c.CustomerName,
    COUNT_BIG(o.OrderID) AS OrderCount,
    SUM(o.TotalAmount) AS TotalAmount
FROM dbo.Customers c
INNER JOIN dbo.Orders o ON c.CustomerID = o.CustomerID
WHERE o.OrderDate >= DATEADD(MONTH, -12, GETDATE())
GROUP BY c.CustomerID, c.CustomerName

CREATE UNIQUE CLUSTERED INDEX IX_CustomerOrderSummary
ON vw_CustomerOrderSummary(CustomerID)

-- 3. Separate reporting database
-- ETL data từ OLTP sang reporting DB
-- Optimize reporting DB cho analytics
```

### Kết Quả
- Report performance cải thiện 50x
- No impact on OLTP
- Scalable reporting solution

## Methodology

### 1. Understand the Problem
- Analyze current performance
- Identify bottlenecks
- Measure actual metrics

### 2. Design Solution
- Consider multiple approaches
- Evaluate trade-offs
- Plan implementation

### 3. Implement and Test
- Implement solution
- Test với data thực tế
- Measure improvements

### 4. Monitor and Optimize
- Monitor performance
- Identify further optimizations
- Continuous improvement

## Best Practices

### 1. Start with Indexes
- Tạo indexes phù hợp
- Monitor index usage
- Drop unused indexes

### 2. Optimize Queries
- Sửa queries không tối ưu
- Avoid functions on indexed columns
- Use appropriate JOIN types

### 3. Consider Architecture
- Partitioning cho large tables
- Read replicas cho reporting
- Separate databases khi cần

### 4. Monitor Performance
- Track query performance
- Monitor system resources
- Set up alerts

## Kết Luận

Giả lập bài toán giúp:
- ✅ Hiểu vấn đề sâu sắc
- ✅ Tìm giải pháp hiệu quả
- ✅ Learn từ thực tế
- ✅ Apply vào production

Practice makes perfect!

