# SQL Execution Plan - Chiến Lược Thực Thi

## Tổng Quan
Execution Plan (chiến lược thực thi) là cách SQL Server thực thi query. Hiểu execution plan giúp optimize queries và troubleshoot performance issues.

## Execution Plan Components

### 1. Query Tree
- Hierarchical structure
- Top node = Final result
- Bottom nodes = Data sources
- Flow từ bottom lên top

### 2. Operators
- **Data Access**: Table Scan, Index Seek, Index Scan
- **Join**: Nested Loops, Hash Match, Merge Join
- **Aggregation**: Stream Aggregate, Hash Aggregate
- **Sort**: Sort, Top Sort
- **Other**: Compute Scalar, Filter, etc.

### 3. Properties
- **Estimated Cost**: Cost percentage
- **Estimated Rows**: Số rows ước tính
- **Actual Rows**: Số rows thực tế
- **I/O Statistics**: Logical reads, physical reads

## Reading Execution Plan

### Left to Right Flow
```
Table Scan → Filter → Sort → SELECT
```

### Bottom to Top Flow
```
Data Sources (bottom)
    ↓
Join Operations
    ↓
Aggregations
    ↓
Final Result (top)
```

### Cost Analysis
- Tổng cost = 100%
- Operation có cost cao nhất = Bottleneck
- Tập trung optimize operation này

## Common Patterns

### Pattern 1: Index Seek
```
Index Seek (Clustered)
  Cost: 10%
  Rows: 1
  I/O: 3 logical reads
```
✅ Tốt nhất - Truy cập trực tiếp

### Pattern 2: Table Scan
```
Table Scan
  Cost: 90%
  Rows: 1,000,000
  I/O: 10,000 logical reads
```
❌ Tệ nhất - Scan toàn bộ table

### Pattern 3: Key Lookup
```
Index Seek (Non-Clustered)
  Cost: 20%
    ↓
Key Lookup (Clustered)
  Cost: 30%
```
⚠️ Có thể optimize bằng covering index

## Optimization Strategies

### 1. Eliminate Table Scans
```sql
-- ❌ Table Scan
SELECT * FROM Orders WHERE CustomerID = 123

-- ✅ Index Seek
CREATE INDEX IX_Orders_CustomerID ON Orders(CustomerID)
SELECT * FROM Orders WHERE CustomerID = 123
```

### 2. Reduce Key Lookups
```sql
-- ❌ Key Lookup
SELECT CustomerID, OrderDate, TotalAmount
FROM Orders
WHERE CustomerID = 123

-- ✅ Covering Index
CREATE INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
INCLUDE (OrderDate, TotalAmount)
```

### 3. Optimize Joins
```sql
-- ❌ Hash Join (có thể chậm)
SELECT *
FROM Table1 t1
INNER JOIN Table2 t2 ON t1.ID = t2.ID

-- ✅ Nested Loops (nhanh hơn cho small tables)
-- Đảm bảo có index trên join columns
```

## Plan Cache

### View Cached Plans
```sql
SELECT 
    cp.objtype,
    cp.cacheobjtype,
    cp.size_in_bytes,
    cp.usecounts,
    qp.query_plan,
    qt.text
FROM sys.dm_exec_cached_plans cp
CROSS APPLY sys.dm_exec_sql_text(cp.plan_handle) qt
CROSS APPLY sys.dm_exec_query_plan(cp.plan_handle) qp
WHERE qt.text LIKE '%Orders%'
```

### Plan Reuse
- Plans được cache để reuse
- Parameterized queries reuse plans tốt hơn
- Ad-hoc queries không reuse plans

## Troubleshooting

### Issue 1: Plan Not Optimal
```sql
-- Statistics cũ
UPDATE STATISTICS TableName WITH FULLSCAN

-- Hoặc force recompile
SELECT * FROM TableName
OPTION (RECOMPILE)
```

### Issue 2: Parameter Sniffing
```sql
-- Optimize for specific value
SELECT * FROM TableName
WHERE Column = @Parameter
OPTION (OPTIMIZE FOR (@Parameter = 'CommonValue'))

-- Hoặc optimize for unknown
OPTION (OPTIMIZE FOR UNKNOWN)
```

### Issue 3: Missing Index
```sql
-- SQL Server suggest missing index
-- Xem trong execution plan warnings
-- Tạo index được suggest
```

## Best Practices

1. **Always Review Plans**
   - Trước khi deploy
   - Khi query chậm
   - Sau khi thay đổi

2. **Compare Plans**
   - Trước và sau optimize
   - Verify improvements
   - Test với data thực tế

3. **Monitor Plan Changes**
   - Sử dụng Query Store
   - Track plan regressions
   - Force good plans

## Kết Luận

Execution Plan là công cụ mạnh mẽ:
- ✅ Hiểu query execution
- ✅ Identify bottlenecks
- ✅ Optimize performance
- ✅ Troubleshoot issues

Master execution plan = Master SQL optimization!

