# Index Table - Khi Nào Cần và Cách Sử Dụng

## Tổng Quan
Index table là bảng được tạo riêng để lưu trữ index data, thường dùng cho các scenarios đặc biệt như full-text search, denormalization, hoặc materialized views.

## Khi Nào Cần Index Table

### 1. Full-Text Search
```sql
-- Tạo index table cho search
CREATE TABLE ProductSearchIndex (
    ProductID INT,
    SearchText NVARCHAR(MAX),
    SearchKeywords NVARCHAR(MAX),
    INDEX IX_SearchText (SearchText)
)

-- Populate từ main table
INSERT INTO ProductSearchIndex (ProductID, SearchText, SearchKeywords)
SELECT 
    ProductID,
    ProductName + ' ' + Description AS SearchText,
    -- Extract keywords
    Keywords AS SearchKeywords
FROM Products

-- Search
SELECT p.*
FROM Products p
INNER JOIN ProductSearchIndex psi ON p.ProductID = psi.ProductID
WHERE psi.SearchText LIKE '%keyword%'
```

### 2. Denormalization
```sql
-- Index table để denormalize data
CREATE TABLE CustomerOrderSummary (
    CustomerID INT PRIMARY KEY,
    OrderCount INT,
    TotalAmount DECIMAL(18,2),
    LastOrderDate DATETIME,
    INDEX IX_TotalAmount (TotalAmount DESC)
)

-- Maintain bằng triggers hoặc jobs
CREATE TRIGGER trg_UpdateCustomerSummary
ON Orders
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    -- Update summary table
    MERGE CustomerOrderSummary AS target
    USING (
        SELECT 
            CustomerID,
            COUNT(*) AS OrderCount,
            SUM(TotalAmount) AS TotalAmount,
            MAX(OrderDate) AS LastOrderDate
        FROM Orders
        GROUP BY CustomerID
    ) AS source
    ON target.CustomerID = source.CustomerID
    WHEN MATCHED THEN
        UPDATE SET 
            OrderCount = source.OrderCount,
            TotalAmount = source.TotalAmount,
            LastOrderDate = source.LastOrderDate
    WHEN NOT MATCHED THEN
        INSERT (CustomerID, OrderCount, TotalAmount, LastOrderDate)
        VALUES (source.CustomerID, source.OrderCount, source.TotalAmount, source.LastOrderDate);
END
```

### 3. Materialized Views
```sql
-- Index table như materialized view
CREATE TABLE vw_ProductSales (
    ProductID INT,
    SaleDate DATE,
    TotalSales DECIMAL(18,2),
    TotalQuantity INT,
    PRIMARY KEY (ProductID, SaleDate),
    INDEX IX_SaleDate (SaleDate)
)

-- Populate từ source tables
INSERT INTO vw_ProductSales (ProductID, SaleDate, TotalSales, TotalQuantity)
SELECT 
    ProductID,
    CAST(OrderDate AS DATE) AS SaleDate,
    SUM(Quantity * Price) AS TotalSales,
    SUM(Quantity) AS TotalQuantity
FROM OrderItems oi
INNER JOIN Orders o ON oi.OrderID = o.OrderID
GROUP BY ProductID, CAST(OrderDate AS DATE)

-- Query từ index table
SELECT * FROM vw_ProductSales
WHERE SaleDate >= '2024-01-01'
ORDER BY TotalSales DESC
```

### 4. Cross-Reference Tables
```sql
-- Index table cho many-to-many relationships
CREATE TABLE ProductCategoryIndex (
    ProductID INT,
    CategoryID INT,
    PRIMARY KEY (ProductID, CategoryID),
    INDEX IX_CategoryID (CategoryID)
)

-- Query products by category
SELECT p.*
FROM Products p
INNER JOIN ProductCategoryIndex pci ON p.ProductID = pci.ProductID
WHERE pci.CategoryID = @CategoryID
```

## Best Practices

### 1. Maintain Consistency
```sql
-- Use triggers hoặc jobs để maintain
-- Đảm bảo index table sync với source tables
CREATE PROCEDURE sp_RefreshIndexTable
AS
BEGIN
    TRUNCATE TABLE ProductSearchIndex
    
    INSERT INTO ProductSearchIndex (ProductID, SearchText, SearchKeywords)
    SELECT 
        ProductID,
        ProductName + ' ' + Description AS SearchText,
        Keywords AS SearchKeywords
    FROM Products
END
```

### 2. Optimize Index Table
```sql
-- Tạo indexes phù hợp trên index table
CREATE NONCLUSTERED INDEX IX_ProductSearchIndex_SearchText
ON ProductSearchIndex(SearchText)
INCLUDE (ProductID)

-- Consider full-text index
CREATE FULLTEXT INDEX ON ProductSearchIndex(SearchText)
KEY INDEX PK_ProductSearchIndex
ON SearchCatalog
```

### 3. Monitor Performance
```sql
-- Monitor index table usage
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    user_seeks,
    user_scans,
    user_lookups,
    user_updates
FROM sys.dm_db_index_usage_stats
WHERE database_id = DB_ID()
    AND OBJECT_NAME(object_id) LIKE '%Index'
```

## Use Cases

### Case 1: Search Optimization
```sql
-- Main table có full-text data
-- Index table cho fast search
CREATE TABLE DocumentSearchIndex (
    DocumentID INT PRIMARY KEY,
    SearchableText NVARCHAR(MAX),
    Keywords NVARCHAR(MAX),
    FULLTEXT INDEX ON SearchableText
)

-- Fast search
SELECT d.*
FROM Documents d
INNER JOIN DocumentSearchIndex dsi ON d.DocumentID = dsi.DocumentID
WHERE CONTAINS(dsi.SearchableText, 'keyword')
```

### Case 2: Aggregation Optimization
```sql
-- Pre-aggregated data trong index table
CREATE TABLE DailySalesIndex (
    SaleDate DATE,
    ProductID INT,
    TotalSales DECIMAL(18,2),
    TotalQuantity INT,
    PRIMARY KEY (SaleDate, ProductID),
    INDEX IX_ProductID (ProductID)
)

-- Fast aggregation queries
SELECT 
    ProductID,
    SUM(TotalSales) AS TotalSales
FROM DailySalesIndex
WHERE SaleDate >= '2024-01-01'
GROUP BY ProductID
```

### Case 3: Relationship Optimization
```sql
-- Index table cho complex relationships
CREATE TABLE CustomerProductIndex (
    CustomerID INT,
    ProductID INT,
    PurchaseCount INT,
    LastPurchaseDate DATETIME,
    PRIMARY KEY (CustomerID, ProductID),
    INDEX IX_ProductID (ProductID)
)

-- Fast relationship queries
SELECT c.*
FROM Customers c
INNER JOIN CustomerProductIndex cpi ON c.CustomerID = cpi.CustomerID
WHERE cpi.ProductID = @ProductID
    AND cpi.PurchaseCount > 10
```

## Maintenance

### Refresh Strategy
```sql
-- Incremental refresh
CREATE PROCEDURE sp_RefreshIndexTableIncremental
AS
BEGIN
    -- Chỉ update records thay đổi
    MERGE ProductSearchIndex AS target
    USING (
        SELECT 
            ProductID,
            ProductName + ' ' + Description AS SearchText,
            Keywords AS SearchKeywords
        FROM Products
        WHERE ModifiedDate > DATEADD(DAY, -1, GETDATE())
    ) AS source
    ON target.ProductID = source.ProductID
    WHEN MATCHED THEN
        UPDATE SET 
            SearchText = source.SearchText,
            SearchKeywords = source.SearchKeywords
    WHEN NOT MATCHED THEN
        INSERT (ProductID, SearchText, SearchKeywords)
        VALUES (source.ProductID, source.SearchText, source.SearchKeywords);
END
```

### Validation
```sql
-- Validate index table consistency
CREATE PROCEDURE sp_ValidateIndexTable
AS
BEGIN
    -- Check for missing records
    SELECT p.ProductID
    FROM Products p
    LEFT JOIN ProductSearchIndex psi ON p.ProductID = psi.ProductID
    WHERE psi.ProductID IS NULL
    
    -- Check for orphaned records
    SELECT psi.ProductID
    FROM ProductSearchIndex psi
    LEFT JOIN Products p ON psi.ProductID = p.ProductID
    WHERE p.ProductID IS NULL
END
```

## Performance Considerations

### Pros
- ✅ Fast queries
- ✅ Reduced load on main tables
- ✅ Optimized for specific use cases

### Cons
- ❌ Additional storage
- ❌ Maintenance overhead
- ❌ Consistency challenges

## Kết Luận

Index tables hữu ích khi:
- ✅ Cần optimize specific queries
- ✅ Full-text search
- ✅ Pre-aggregated data
- ✅ Complex relationships

Cân nhắc trade-offs:
- Storage vs Performance
- Maintenance vs Speed
- Consistency vs Optimization

Sử dụng index tables đúng cách có thể cải thiện performance đáng kể!

