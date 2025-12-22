# Các Loại Index Trong SQL Server

## Tổng Quan
SQL Server hỗ trợ nhiều loại index khác nhau, mỗi loại có use case riêng. Hiểu rõ các loại index giúp chọn đúng loại cho từng scenario.

## Clustered Index

### Định Nghĩa
- Mỗi table chỉ có **một** clustered index
- Data được **sắp xếp vật lý** theo clustered index
- Clustered index = Table structure

### Đặc Điểm
- Data rows được lưu trong leaf pages của clustered index
- Không có separate data storage
- Thường là PRIMARY KEY

### Ví Dụ
```sql
-- Tạo clustered index
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY CLUSTERED,  -- Clustered index
    OrderDate DATETIME,
    CustomerID INT
)

-- Hoặc tạo riêng
CREATE CLUSTERED INDEX PK_Orders
ON Orders(OrderID)
```

### Khi Nào Dùng
- ✅ Primary key
- ✅ Column thường xuyên trong ORDER BY
- ✅ Column thường xuyên trong range queries
- ✅ Sequential values (ID, Date)

## Non-Clustered Index

### Định Nghĩa
- Có thể có **nhiều** non-clustered indexes
- Chứa **pointer** đến data rows
- Separate structure từ data

### Đặc Điểm
- Leaf pages chứa index key + row locator
- Row locator trỏ đến clustered index key hoặc RID
- Tách biệt với data storage

### Ví Dụ
```sql
-- Tạo non-clustered index
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
INCLUDE (OrderDate, TotalAmount)
```

### Khi Nào Dùng
- ✅ Columns thường xuyên trong WHERE clause
- ✅ Foreign keys
- ✅ Columns trong JOIN
- ✅ Covering indexes

## Unique Index

### Định Nghĩa
- Đảm bảo **uniqueness** của index key
- Có thể là clustered hoặc non-clustered
- Tự động tạo khi tạo UNIQUE constraint

### Ví Dụ
```sql
-- Tạo unique index
CREATE UNIQUE NONCLUSTERED INDEX IX_Customers_Email
ON Customers(Email)

-- Hoặc qua constraint
ALTER TABLE Customers
ADD CONSTRAINT UQ_Customers_Email UNIQUE (Email)
```

### Khi Nào Dùng
- ✅ Enforce uniqueness
- ✅ Primary key (unique clustered)
- ✅ Business keys (Email, SSN, etc.)

## Filtered Index

### Định Nghĩa
- Index chỉ trên **subset** của data
- Smaller và faster hơn full index
- Chỉ index rows thỏa điều kiện

### Ví Dụ
```sql
-- Filtered index cho active orders
CREATE NONCLUSTERED INDEX IX_Orders_Active
ON Orders(CustomerID, OrderDate)
WHERE Status = 'Active'

-- Chỉ index orders có Status = 'Active'
```

### Khi Nào Dùng
- ✅ Query thường filter trên subset nhỏ
- ✅ Giảm index size
- ✅ Improve performance cho filtered queries

## Columnstore Index

### Định Nghĩa
- **Column-based** storage thay vì row-based
- High compression
- Optimized cho analytics

### Đặc Điểm
- Data được lưu theo columns
- Compression ratio cao (10x-100x)
- Fast aggregation queries

### Ví Dụ
```sql
-- Clustered columnstore index
CREATE CLUSTERED COLUMNSTORE INDEX IX_Orders_Columnstore
ON Orders

-- Non-clustered columnstore index
CREATE NONCLUSTERED COLUMNSTORE INDEX IX_Orders_Columnstore
ON Orders(OrderDate, CustomerID, TotalAmount)
```

### Khi Nào Dùng
- ✅ Data warehouse
- ✅ Analytics workloads
- ✅ Aggregation queries
- ✅ Large tables (> 100M rows)

## Full-Text Index

### Định Nghĩa
- Index cho **full-text search**
- Hỗ trợ linguistic search
- Tách biệt từ data index

### Ví Dụ
```sql
-- Tạo full-text catalog
CREATE FULLTEXT CATALOG DocumentCatalog

-- Tạo full-text index
CREATE FULLTEXT INDEX ON Documents(Content)
KEY INDEX PK_Documents
ON DocumentCatalog

-- Search
SELECT * FROM Documents
WHERE CONTAINS(Content, 'search term')
```

### Khi Nào Dùng
- ✅ Full-text search
- ✅ Document search
- ✅ Text analysis

## XML Index

### Định Nghĩa
- Index cho **XML columns**
- Hỗ trợ XML queries
- Primary và secondary indexes

### Ví Dụ
```sql
-- Primary XML index
CREATE PRIMARY XML INDEX IX_XML_Primary
ON TableName(XMLColumn)

-- Secondary XML index (PATH)
CREATE XML INDEX IX_XML_Path
ON TableName(XMLColumn)
USING XML INDEX IX_XML_Primary
FOR PATH
```

### Khi Nào Dùng
- ✅ XML data
- ✅ XML queries
- ✅ XML search

## Spatial Index

### Định Nghĩa
- Index cho **spatial data** (geography, geometry)
- Hỗ trợ spatial queries
- Grid-based structure

### Ví Dụ
```sql
-- Spatial index
CREATE SPATIAL INDEX IX_Location_Spatial
ON Locations(GeographyColumn)
USING GEOGRAPHY_GRID
WITH (
    GRIDS = (LEVEL_1 = MEDIUM, LEVEL_2 = MEDIUM, LEVEL_3 = MEDIUM, LEVEL_4 = MEDIUM),
    CELLS_PER_OBJECT = 16
)
```

### Khi Nào Dùng
- ✅ Geographic data
- ✅ Location-based queries
- ✅ Spatial analysis

## Memory-Optimized Index

### Định Nghĩa
- Index cho **memory-optimized tables**
- Hash index hoặc range index
- In-memory structure

### Ví Dụ
```sql
-- Hash index
CREATE TABLE Orders_Memory (
    OrderID INT PRIMARY KEY NONCLUSTERED HASH WITH (BUCKET_COUNT = 10000),
    OrderDate DATETIME,
    INDEX IX_OrderDate NONCLUSTERED (OrderDate)
) WITH (MEMORY_OPTIMIZED = ON)
```

### Khi Nào Dùng
- ✅ Memory-optimized tables
- ✅ High-performance scenarios
- ✅ In-memory OLTP

## Index với Included Columns

### Định Nghĩa
- Non-clustered index với **included columns**
- Included columns không tính vào index key
- Covering index để tránh key lookup

### Ví Dụ
```sql
-- Index với included columns
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
INCLUDE (OrderDate, TotalAmount, Status)

-- Query chỉ cần đọc index
SELECT CustomerID, OrderDate, TotalAmount
FROM Orders
WHERE CustomerID = 123
-- ✅ No key lookup needed
```

### Khi Nào Dùng
- ✅ Covering indexes
- ✅ Tránh key lookup
- ✅ Improve query performance

## So Sánh Các Loại Index

| Index Type | Use Case | Performance | Storage |
|------------|----------|-------------|---------|
| Clustered | Primary key, ORDER BY | Fastest for range | Data storage |
| Non-Clustered | WHERE, JOIN | Fast for seeks | Separate structure |
| Unique | Uniqueness | Same as base type | Same as base type |
| Filtered | Subset queries | Faster, smaller | Smaller |
| Columnstore | Analytics | Very fast aggregation | High compression |
| Full-Text | Text search | Fast text search | Separate catalog |
| XML | XML queries | Fast XML search | Separate structure |
| Spatial | Geographic | Fast spatial queries | Grid structure |

## Best Practices

### 1. Chọn Đúng Loại Index
- Clustered cho primary key
- Non-clustered cho WHERE/JOIN columns
- Columnstore cho analytics
- Filtered cho subset queries

### 2. Balance Indexes
- Không quá nhiều indexes (overhead)
- Không quá ít indexes (slow queries)
- Monitor và adjust

### 3. Monitor Performance
- Track index usage
- Identify unused indexes
- Create missing indexes

## Kết Luận

Hiểu rõ các loại index:
- ✅ Chọn đúng loại cho use case
- ✅ Optimize performance
- ✅ Balance storage và speed
- ✅ Monitor và maintain

Đúng index type = Better performance!

