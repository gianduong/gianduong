# Giải Mã DISTINCT - Khi Nào Dùng và Khi Nào Tránh

## Tổng Quan
DISTINCT là một trong những operations tốn kém nhất trong SQL. Hiểu rõ khi nào cần và khi nào tránh là critical cho performance.

## DISTINCT Là Gì

### Cơ Chế Hoạt Động
```sql
SELECT DISTINCT Column1, Column2
FROM TableName
```

**Quá Trình:**
1. Sort data theo DISTINCT columns
2. Loại bỏ duplicates
3. Return kết quả

**Cost:**
- O(n log n) complexity
- Tốn CPU và memory
- Có thể chậm với large datasets

## Khi Nào Cần DISTINCT

### 1. Thực Sự Có Duplicates
```sql
-- Table có thể có duplicates
SELECT DISTINCT CustomerID
FROM Orders
WHERE OrderDate >= '2024-01-01'
```

### 2. Không Thể Dùng GROUP BY
```sql
-- Cần unique values nhưng không aggregate
SELECT DISTINCT ProductCategory
FROM Products
```

### 3. Subquery với EXISTS
```sql
-- Đôi khi cần DISTINCT trong subquery
SELECT *
FROM Customers c
WHERE EXISTS (
    SELECT DISTINCT CustomerID
    FROM Orders
    WHERE CustomerID = c.CustomerID
)
```

## Khi Nào Không Cần DISTINCT

### 1. Đã Có UNIQUE Constraint
```sql
-- ❌ Không cần: CustomerID đã là PRIMARY KEY
SELECT DISTINCT CustomerID FROM Customers

-- ✅ Đúng: Không cần DISTINCT
SELECT CustomerID FROM Customers
```

### 2. JOIN Đã Đảm Bảo Uniqueness
```sql
-- ❌ Không cần: JOIN 1-1 đã đảm bảo unique
SELECT DISTINCT c.CustomerID, c.CustomerName
FROM Customers c
INNER JOIN Orders o ON c.CustomerID = o.CustomerID

-- ✅ Đúng: Nếu cần, dùng GROUP BY
SELECT c.CustomerID, c.CustomerName
FROM Customers c
INNER JOIN Orders o ON c.CustomerID = o.CustomerID
GROUP BY c.CustomerID, c.CustomerName
```

### 3. Có Thể Dùng GROUP BY
```sql
-- ❌ DISTINCT
SELECT DISTINCT CustomerID, COUNT(*) AS OrderCount
FROM Orders
GROUP BY CustomerID

-- ✅ GROUP BY (tốt hơn)
SELECT CustomerID, COUNT(*) AS OrderCount
FROM Orders
GROUP BY CustomerID
```

## Performance Impact

### DISTINCT vs GROUP BY
```sql
-- DISTINCT: Chỉ loại bỏ duplicates
SELECT DISTINCT CustomerID
FROM Orders
-- Cost: Sort + Deduplication

-- GROUP BY: Aggregate + loại bỏ duplicates
SELECT CustomerID
FROM Orders
GROUP BY CustomerID
-- Cost: Hash aggregation (thường nhanh hơn)
```

### Test Performance
```sql
SET STATISTICS IO ON
SET STATISTICS TIME ON

-- Test DISTINCT
SELECT DISTINCT CustomerID FROM Orders

-- Test GROUP BY
SELECT CustomerID FROM Orders GROUP BY CustomerID

-- So sánh execution plans và statistics
```

## Alternatives to DISTINCT

### 1. Sử Dụng GROUP BY
```sql
-- Thay vì DISTINCT
SELECT DISTINCT CustomerID, OrderDate
FROM Orders

-- Dùng GROUP BY (thường nhanh hơn)
SELECT CustomerID, OrderDate
FROM Orders
GROUP BY CustomerID, OrderDate
```

### 2. Sử Dụng EXISTS
```sql
-- Thay vì DISTINCT trong subquery
SELECT *
FROM Customers
WHERE CustomerID IN (
    SELECT DISTINCT CustomerID FROM Orders
)

-- Dùng EXISTS (thường tốt hơn)
SELECT *
FROM Customers c
WHERE EXISTS (
    SELECT 1 FROM Orders o 
    WHERE o.CustomerID = c.CustomerID
)
```

### 3. Sử Dụng Window Functions
```sql
-- Thay vì DISTINCT với aggregation
SELECT DISTINCT CustomerID, 
    MAX(OrderDate) OVER (PARTITION BY CustomerID) AS LastOrderDate
FROM Orders

-- Dùng GROUP BY (đơn giản hơn)
SELECT CustomerID, MAX(OrderDate) AS LastOrderDate
FROM Orders
GROUP BY CustomerID
```

## Common Mistakes

### Mistake 1: DISTINCT với Aggregation
```sql
-- ❌ Không cần DISTINCT
SELECT DISTINCT CustomerID, COUNT(*) AS OrderCount
FROM Orders
GROUP BY CustomerID

-- ✅ GROUP BY đã đảm bảo unique
SELECT CustomerID, COUNT(*) AS OrderCount
FROM Orders
GROUP BY CustomerID
```

### Mistake 2: DISTINCT với JOIN
```sql
-- ❌ Có thể không cần
SELECT DISTINCT c.CustomerID, c.CustomerName
FROM Customers c
INNER JOIN Orders o ON c.CustomerID = o.CustomerID

-- ✅ Kiểm tra xem có thực sự cần không
SELECT c.CustomerID, c.CustomerName
FROM Customers c
WHERE EXISTS (
    SELECT 1 FROM Orders o 
    WHERE o.CustomerID = c.CustomerID
)
```

### Mistake 3: DISTINCT trên Primary Key
```sql
-- ❌ Hoàn toàn không cần
SELECT DISTINCT OrderID FROM Orders

-- ✅ OrderID đã là PRIMARY KEY
SELECT OrderID FROM Orders
```

## Optimization Tips

### 1. Kiểm Tra Execution Plan
```sql
-- Xem execution plan
SET STATISTICS PROFILE ON
SELECT DISTINCT CustomerID FROM Orders
SET STATISTICS PROFILE OFF

-- Tìm "Sort" operator
-- Nếu có, có thể optimize bằng index
```

### 2. Tạo Index Hỗ Trợ DISTINCT
```sql
-- Index có thể giúp DISTINCT nhanh hơn
CREATE INDEX IX_Orders_CustomerID
ON Orders(CustomerID)

-- DISTINCT có thể sử dụng index thay vì sort
SELECT DISTINCT CustomerID FROM Orders
```

### 3. Sử Dụng Covering Index
```sql
-- Covering index cho DISTINCT query
CREATE INDEX IX_Orders_CustomerID_OrderDate
ON Orders(CustomerID, OrderDate)
INCLUDE (TotalAmount)

-- Query có thể chỉ đọc index, không cần table
SELECT DISTINCT CustomerID, OrderDate
FROM Orders
```

## When DISTINCT is Necessary

### Case 1: Multiple JOINs Causing Duplicates
```sql
-- JOIN nhiều tables có thể tạo duplicates
SELECT DISTINCT c.CustomerID, p.ProductName
FROM Customers c
INNER JOIN Orders o ON c.CustomerID = o.CustomerID
INNER JOIN OrderItems oi ON o.OrderID = oi.OrderID
INNER JOIN Products p ON oi.ProductID = p.ProductID

-- DISTINCT cần thiết nếu một customer có nhiều orders
```

### Case 2: UNION với Duplicates
```sql
-- UNION tự động loại bỏ duplicates
SELECT CustomerID FROM Orders_2023
UNION
SELECT CustomerID FROM Orders_2024

-- UNION ALL giữ lại duplicates
SELECT CustomerID FROM Orders_2023
UNION ALL
SELECT CustomerID FROM Orders_2024
```

## Best Practices

1. **Luôn Kiểm Tra Xem Có Thực Sự Cần DISTINCT Không**
   - Kiểm tra constraints
   - Kiểm tra JOIN logic
   - Test với và không có DISTINCT

2. **Sử Dụng GROUP BY Khi Có Thể**
   - GROUP BY thường nhanh hơn DISTINCT
   - Có thể kết hợp với aggregation

3. **Tạo Index Hỗ Trợ**
   - Index trên DISTINCT columns
   - Covering index nếu có thể

4. **Monitor Performance**
   - So sánh execution plans
   - Test với data thực tế
   - Measure actual performance

## Kết Luận

DISTINCT là operation tốn kém, chỉ sử dụng khi:
- ✅ Thực sự cần loại bỏ duplicates
- ✅ Không có cách nào khác
- ✅ Đã optimize với index

Tránh DISTINCT khi:
- ❌ Đã có UNIQUE constraint
- ❌ JOIN đã đảm bảo uniqueness
- ❌ Có thể dùng GROUP BY

Luôn kiểm tra execution plan và test performance!

