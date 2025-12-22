# Foreign Key Index - Vấn Đề và Giải Pháp

## Tổng Quan
Foreign keys không tự động có index, điều này có thể gây ra vấn đề performance nghiêm trọng.

## Vấn Đề

### 1. DELETE/UPDATE Trên Parent Table
Khi xóa hoặc cập nhật parent record, SQL Server cần kiểm tra foreign key constraint:

```sql
-- Nếu không có index trên foreign key column
DELETE FROM Customers WHERE CustomerID = 1
-- ❌ SQL Server phải scan toàn bộ Orders table
-- ❌ Chậm và tốn tài nguyên
```

### 2. JOIN Operations
```sql
-- JOIN giữa parent và child tables
SELECT c.CustomerName, o.OrderID
FROM Customers c
INNER JOIN Orders o ON c.CustomerID = o.CustomerID
-- ❌ Nếu không có index trên Orders.CustomerID
-- ❌ Phải scan toàn bộ Orders table
```

### 3. Lock Contention
- DELETE/UPDATE trên parent table có thể lock child table
- Không có index → Lock time lâu hơn
- Giảm concurrency

## Script Kiểm Tra Foreign Keys Không Có Index

```sql
-- Tìm foreign keys không có index
SELECT 
    fk.name AS ForeignKeyName,
    OBJECT_SCHEMA_NAME(fk.parent_object_id) AS SchemaName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
    OBJECT_SCHEMA_NAME(fk.referenced_object_id) AS ReferencedSchemaName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTableName,
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferencedColumnName
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fc 
    ON fk.object_id = fc.constraint_object_id
LEFT JOIN sys.index_columns ic 
    ON fc.parent_object_id = ic.object_id 
    AND fc.parent_column_id = ic.column_id
    AND ic.key_ordinal = 1  -- First column in index
WHERE ic.object_id IS NULL  -- No index found
ORDER BY 
    OBJECT_SCHEMA_NAME(fk.parent_object_id),
    OBJECT_NAME(fk.parent_object_id),
    fk.name
```

## Giải Pháp

### 1. Tạo Index Cho Foreign Key Columns
```sql
-- Tạo index cho foreign key
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
INCLUDE (OrderDate, TotalAmount)  -- Covering index nếu có thể
```

### 2. Composite Index Nếu Cần
```sql
-- Nếu query thường filter trên nhiều columns
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID_Status
ON Orders(CustomerID, Status)
INCLUDE (OrderDate, TotalAmount)
```

### 3. Include Columns Cho Covering Index
```sql
-- Nếu query chỉ cần một số columns
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
INCLUDE (OrderDate, TotalAmount, Status)
-- Query không cần key lookup
```

## Best Practices

### 1. Luôn Tạo Index Cho Foreign Keys
```sql
-- Script tự động tạo index cho foreign keys
DECLARE @SQL NVARCHAR(MAX)

SELECT @SQL = STRING_AGG(
    'CREATE NONCLUSTERED INDEX IX_' + 
    OBJECT_NAME(fc.parent_object_id) + '_' + 
    COL_NAME(fc.parent_object_id, fc.parent_column_id) + 
    ' ON ' + 
    QUOTENAME(OBJECT_SCHEMA_NAME(fc.parent_object_id)) + '.' +
    QUOTENAME(OBJECT_NAME(fc.parent_object_id)) + 
    '(' + QUOTENAME(COL_NAME(fc.parent_object_id, fc.parent_column_id)) + ');',
    CHAR(13)
)
FROM sys.foreign_key_columns fc
LEFT JOIN sys.index_columns ic 
    ON fc.parent_object_id = ic.object_id 
    AND fc.parent_column_id = ic.column_id
WHERE ic.object_id IS NULL

IF @SQL IS NOT NULL
BEGIN
    PRINT @SQL
    -- EXEC sp_executesql @SQL  -- Uncomment để thực thi
END
```

### 2. Monitor Foreign Key Usage
```sql
-- Kiểm tra index usage trên foreign key columns
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
    AND OBJECT_NAME(ios.object_id) IN (
        SELECT OBJECT_NAME(parent_object_id)
        FROM sys.foreign_keys
    )
ORDER BY ios.user_seeks + ios.user_scans DESC
```

### 3. Consider Index Order
```sql
-- Nếu foreign key thường được dùng với column khác
-- Đặt foreign key đầu tiên trong composite index
CREATE INDEX IX_Orders_CustomerID_OrderDate
ON Orders(CustomerID, OrderDate)
-- CustomerID đầu tiên để hỗ trợ foreign key constraint
```

## Performance Impact

### Trước Khi Có Index
```sql
-- DELETE trên parent table
DELETE FROM Customers WHERE CustomerID = 1
-- Execution time: 5-10 seconds (với 1M rows trong Orders)
-- Lock time: 5-10 seconds
```

### Sau Khi Có Index
```sql
-- DELETE trên parent table
DELETE FROM Customers WHERE CustomerID = 1
-- Execution time: < 100ms
-- Lock time: < 100ms
-- Improvement: 50-100x
```

## Case Study: Demo Sự Cố Treo

### Vấn Đề
- Hệ thống bị treo khi thực hiện DELETE trên parent table
- Nhiều sessions bị block
- Timeout errors

### Nguyên Nhân
- Foreign key không có index
- DELETE phải scan toàn bộ child table
- Lock contention cao

### Giải Pháp
```sql
-- Tạo index cho foreign key
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)

-- Rebuild để đảm bảo statistics
UPDATE STATISTICS Orders
```

### Kết Quả
- DELETE time giảm từ 10s xuống 50ms
- Lock contention giảm đáng kể
- System stability cải thiện

## Lưu Ý Đặc Biệt

### 1. Self-Referencing Foreign Keys
```sql
-- Foreign key trỏ đến chính table
CREATE TABLE Employees (
    EmployeeID INT PRIMARY KEY,
    ManagerID INT,
    FOREIGN KEY (ManagerID) REFERENCES Employees(EmployeeID)
)

-- Vẫn cần index
CREATE INDEX IX_Employees_ManagerID
ON Employees(ManagerID)
```

### 2. Multiple Foreign Keys
```sql
-- Table có nhiều foreign keys
CREATE TABLE OrderItems (
    OrderItemID INT PRIMARY KEY,
    OrderID INT,
    ProductID INT,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
)

-- Tạo index cho cả hai
CREATE INDEX IX_OrderItems_OrderID ON OrderItems(OrderID)
CREATE INDEX IX_OrderItems_ProductID ON OrderItems(ProductID)
```

### 3. Partitioned Tables
```sql
-- Foreign key trên partitioned table
CREATE INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
ON PS_Monthly(OrderDate)  -- Aligned với partition scheme
```

## Automation

### Script Tự Động Tạo Index
```sql
CREATE PROCEDURE sp_CreateFKIndexes
AS
BEGIN
    DECLARE @SQL NVARCHAR(MAX)
    DECLARE @TableName SYSNAME
    DECLARE @ColumnName SYSNAME
    DECLARE @IndexName SYSNAME
    
    DECLARE fk_cursor CURSOR FOR
    SELECT 
        OBJECT_NAME(fc.parent_object_id),
        COL_NAME(fc.parent_object_id, fc.parent_column_id),
        'IX_' + OBJECT_NAME(fc.parent_object_id) + '_' + 
        COL_NAME(fc.parent_object_id, fc.parent_column_id)
    FROM sys.foreign_key_columns fc
    LEFT JOIN sys.index_columns ic 
        ON fc.parent_object_id = ic.object_id 
        AND fc.parent_column_id = ic.column_id
    WHERE ic.object_id IS NULL
    
    OPEN fk_cursor
    FETCH NEXT FROM fk_cursor INTO @TableName, @ColumnName, @IndexName
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @SQL = 'CREATE NONCLUSTERED INDEX ' + QUOTENAME(@IndexName) +
                   ' ON ' + QUOTENAME(@TableName) + 
                   '(' + QUOTENAME(@ColumnName) + ')'
        
        PRINT @SQL
        -- EXEC sp_executesql @SQL
        
        FETCH NEXT FROM fk_cursor INTO @TableName, @ColumnName, @IndexName
    END
    
    CLOSE fk_cursor
    DEALLOCATE fk_cursor
END
```

## Kết Luận

1. **Luôn tạo index** cho foreign key columns
2. **Monitor** foreign key usage
3. **Automate** index creation cho foreign keys mới
4. **Test** performance trước và sau khi tạo index
5. **Document** lý do và impact

Foreign key indexes là critical để đảm bảo:
- Fast DELETE/UPDATE trên parent tables
- Efficient JOIN operations
- Reduced lock contention
- Better overall system performance

