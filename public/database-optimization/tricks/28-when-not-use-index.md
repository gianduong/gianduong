# Bài Toán Không Nên Dùng Index

## Tổng Quan
Không phải lúc nào index cũng tốt. Có nhiều trường hợp index không giúp ích hoặc thậm chí làm chậm. Hiểu khi nào không nên dùng index là quan trọng.

## Khi Nào Không Nên Dùng Index

### 1. Table Nhỏ
```sql
-- Table < 1000 rows
-- Index overhead lớn hơn lợi ích
SELECT * FROM SmallTable
WHERE Column = @Value

-- Table scan có thể nhanh hơn index seek
-- Overhead: Index maintenance, storage, I/O
```

**Rule of Thumb:**
- Table < 1000 rows: Không cần index
- Table 1000-10000 rows: Cân nhắc
- Table > 10000 rows: Nên có index

### 2. Column Có Selectivity Thấp
```sql
-- Column có ít giá trị unique
-- Ví dụ: Gender (M/F), Status (Active/Inactive)
SELECT * FROM Users
WHERE Gender = 'M'

-- Index không giúp loại bỏ nhiều rows
-- Table scan có thể tốt hơn
```

**Selectivity Calculation:**
```sql
-- Tính selectivity
SELECT 
    COUNT(DISTINCT Gender) * 100.0 / COUNT(*) AS SelectivityPercent
FROM Users

-- Selectivity < 10%: Không nên index
-- Selectivity 10-50%: Cân nhắc filtered index
-- Selectivity > 50%: Nên có index
```

### 3. Write-Heavy Workloads
```sql
-- Table có nhiều INSERT/UPDATE hơn SELECT
-- Index làm chậm writes
INSERT INTO LogTable (LogDate, Message)
VALUES (GETDATE(), 'Log message')

-- Mỗi INSERT phải update tất cả indexes
-- Overhead cao cho write operations
```

**Consider:**
- Nếu writes > reads * 10: Cân nhắc giảm indexes
- Sử dụng filtered indexes cho subset data
- Consider heap table cho write-heavy tables

### 4. Column Thường Xuyên Thay Đổi
```sql
-- Column được update thường xuyên
UPDATE Orders
SET Status = 'Shipped'
WHERE OrderID = 123

-- Mỗi update phải update index
-- Overhead maintenance cao
```

**Solution:**
- Tránh index trên columns thay đổi thường xuyên
- Sử dụng filtered index nếu có thể
- Consider computed columns

### 5. Queries Scan Toàn Bộ Table
```sql
-- Query cần đọc toàn bộ table
SELECT COUNT(*) FROM Orders
SELECT SUM(TotalAmount) FROM Orders

-- Index không giúp ích
-- Table scan là tốt nhất
```

**Exception:**
- Covering index có thể giúp (chỉ đọc index)
- Columnstore index cho aggregation

### 6. Random Access Patterns
```sql
-- Queries không có pattern rõ ràng
-- Index không được sử dụng hiệu quả
SELECT * FROM Table
WHERE RandomColumn = @RandomValue

-- Nếu không có pattern, index không giúp
```

## Alternatives

### 1. Filtered Index
```sql
-- Thay vì index toàn bộ column
-- Index chỉ subset data
CREATE NONCLUSTERED INDEX IX_Orders_Active
ON Orders(CustomerID, OrderDate)
WHERE Status = 'Active'

-- Nhỏ hơn và hiệu quả hơn
```

### 2. Computed Column Index
```sql
-- Index trên computed column
ALTER TABLE Orders
ADD OrderYear AS YEAR(OrderDate) PERSISTED

CREATE INDEX IX_Orders_OrderYear
ON Orders(OrderYear)

-- Tối ưu cho queries với functions
```

### 3. Heap Table
```sql
-- Table không có clustered index
-- Phù hợp cho write-heavy workloads
CREATE TABLE LogTable (
    LogID BIGINT IDENTITY(1,1),
    LogDate DATETIME,
    Message NVARCHAR(MAX)
)  -- No clustered index

-- Faster inserts
-- No index maintenance
```

## Performance Impact

### Index Overhead
- **Storage**: Index chiếm disk space
- **Maintenance**: INSERT/UPDATE phải update index
- **Memory**: Index pages trong buffer pool
- **I/O**: Index pages cần được read/write

### When Overhead > Benefit
```sql
-- Table: 10,000 rows
-- Index: 5MB
-- Queries: 1 query/day
-- Updates: 1000 updates/day

-- Overhead:
-- - 1000 index updates/day
-- - 5MB storage
-- - Memory usage

-- Benefit:
-- - 1 query nhanh hơn 10ms

-- Net: Overhead > Benefit
-- → Không nên có index
```

## Decision Matrix

| Scenario | Index? | Reason |
|----------|--------|--------|
| Small table (< 1K rows) | ❌ No | Overhead > Benefit |
| Low selectivity (< 10%) | ❌ No | Index không hiệu quả |
| Write-heavy (writes > reads * 10) | ❌ No | Overhead cao |
| Frequently updated column | ❌ No | Maintenance overhead |
| Full table scan queries | ❌ No | Index không giúp |
| Large table (> 10K rows) | ✅ Yes | Benefit > Overhead |
| High selectivity (> 50%) | ✅ Yes | Index hiệu quả |
| Read-heavy (reads > writes * 10) | ✅ Yes | Benefit cao |
| Stable columns | ✅ Yes | Low maintenance |
| Selective queries | ✅ Yes | Index giúp ích |

## Best Practices

### 1. Measure Before Creating
```sql
-- Test với và không có index
SET STATISTICS IO ON
SET STATISTICS TIME ON

-- Without index
SELECT * FROM Table WHERE Column = @Value

-- With index
CREATE INDEX IX_Table_Column ON Table(Column)
SELECT * FROM Table WHERE Column = @Value

-- Compare results
```

### 2. Monitor Index Usage
```sql
-- Tìm unused indexes
SELECT 
    OBJECT_NAME(ios.object_id) AS TableName,
    i.name AS IndexName,
    ios.user_seeks + ios.user_scans + ios.user_lookups AS total_reads,
    ios.user_updates AS total_updates
FROM sys.dm_db_index_usage_stats ios
INNER JOIN sys.indexes i 
    ON ios.object_id = i.object_id 
    AND ios.index_id = i.index_id
WHERE ios.database_id = DB_ID()
    AND ios.user_seeks + ios.user_scans + ios.user_lookups = 0
    AND ios.user_updates > 0  -- Có updates nhưng không được dùng
```

### 3. Consider Alternatives
- Filtered indexes cho subset data
- Computed column indexes cho functions
- Heap tables cho write-heavy
- Columnstore indexes cho analytics

## Kết Luận

Không phải lúc nào index cũng tốt:
- ❌ Small tables
- ❌ Low selectivity
- ❌ Write-heavy workloads
- ❌ Frequently updated columns
- ❌ Full table scan queries

Cân nhắc:
- ✅ Measure before creating
- ✅ Monitor usage
- ✅ Consider alternatives
- ✅ Balance benefit vs overhead

Đúng index strategy = Optimal performance!

