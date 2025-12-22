# Sử Dụng HINT Để Thay Đổi Chiến Lược Thực Thi

## Tổng Quan
Query hints cho phép bạn force SQL Server sử dụng chiến lược thực thi cụ thể. Sử dụng đúng cách có thể cải thiện performance, nhưng cần cẩn thận.

## Khi Nào Dùng HINT

### 1. SQL Server Chọn Plan Không Tối Ưu
```sql
-- SQL Server chọn plan chậm
-- Bạn biết plan tốt hơn
SELECT * FROM TableName
WHERE Column = @Value
OPTION (FORCE ORDER)  -- Force join order
```

### 2. Statistics Cũ
```sql
-- Statistics cũ làm SQL Server chọn plan sai
-- Tạm thời dùng hint cho đến khi update statistics
SELECT * FROM TableName
WHERE Column = @Parameter
OPTION (OPTIMIZE FOR (@Parameter = 'CommonValue'))
```

### 3. Testing và Troubleshooting
```sql
-- Test các plans khác nhau
-- So sánh performance
SELECT * FROM TableName
OPTION (MAXDOP 1)  -- Serial execution
```

## Các Loại HINT

### 1. INDEX HINT
```sql
-- Force sử dụng index cụ thể
SELECT * FROM Orders
WITH (INDEX(IX_Orders_CustomerID))
WHERE CustomerID = 123

-- Hoặc force table scan
SELECT * FROM Orders
WITH (INDEX(0))  -- 0 = table scan
WHERE CustomerID = 123
```

**Khi Nào Dùng:**
- SQL Server không chọn index tốt nhất
- Cần test performance với index khác
- Index mới chưa được statistics recognize

### 2. JOIN HINT
```sql
-- Force join type
SELECT *
FROM Table1 t1
INNER HASH JOIN Table2 t2 ON t1.ID = t2.ID

-- Các loại join hints:
-- INNER LOOP JOIN
-- INNER MERGE JOIN
-- INNER HASH JOIN
-- LEFT LOOP JOIN
-- LEFT MERGE JOIN
-- LEFT HASH JOIN
```

**Khi Nào Dùng:**
- SQL Server chọn join type không tối ưu
- Bạn biết join type nào tốt hơn cho data cụ thể

### 3. FORCE ORDER
```sql
-- Force join order
SELECT *
FROM Table1 t1
INNER JOIN Table2 t2 ON t1.ID = t2.ID
INNER JOIN Table3 t3 ON t2.ID = t3.ID
OPTION (FORCE ORDER)

-- SQL Server sẽ join theo thứ tự viết trong query
```

**Khi Nào Dùng:**
- Join order quan trọng
- Bạn biết order nào tốt hơn

### 4. OPTIMIZE FOR
```sql
-- Optimize cho giá trị cụ thể
SELECT * FROM Orders
WHERE CustomerID = @CustomerID
OPTION (OPTIMIZE FOR (@CustomerID = 123))

-- SQL Server sẽ optimize plan cho CustomerID = 123
-- Nhưng vẫn chạy với giá trị khác
```

**Khi Nào Dùng:**
- Parameter sniffing gây vấn đề
- Cần optimize cho giá trị phổ biến

### 5. OPTIMIZE FOR UNKNOWN
```sql
-- Optimize với average statistics
SELECT * FROM Orders
WHERE CustomerID = @CustomerID
OPTION (OPTIMIZE FOR UNKNOWN)

-- SQL Server không dùng parameter value
-- Dùng average statistics thay thế
```

**Khi Nào Dùng:**
- Parameter sniffing gây vấn đề
- Parameters có distribution khác nhau

### 6. MAXDOP
```sql
-- Force parallel execution
SELECT * FROM LargeTable
OPTION (MAXDOP 4)

-- Hoặc force serial
SELECT * FROM LargeTable
OPTION (MAXDOP 1)
```

**Khi Nào Dùng:**
- Cần control parallelism
- Test performance với different degrees

### 7. RECOMPILE
```sql
-- Force recompile mỗi lần chạy
SELECT * FROM Orders
WHERE CustomerID = @CustomerID
OPTION (RECOMPILE)

-- Plan được tạo mới mỗi lần
-- Sử dụng parameter values thực tế
```

**Khi Nào Dùng:**
- Parameters có distribution khác nhau
- Cần plan tối ưu cho từng execution

### 8. KEEP PLAN
```sql
-- Giữ plan trong cache
SELECT * FROM Orders
WHERE CustomerID = @CustomerID
OPTION (KEEP PLAN)

-- Ngược lại với RECOMPILE
```

### 9. KEEPFIXED PLAN
```sql
-- Giữ plan cố định, không recompile
SELECT * FROM Orders
WHERE CustomerID = @CustomerID
OPTION (KEEPFIXED PLAN)

-- Không recompile ngay cả khi statistics thay đổi
```

## Best Practices

### 1. Sử Dụng HINT Cẩn Thận
```sql
-- ❌ Không nên
-- Dùng hint mọi nơi
-- Không test trước
-- Không document lý do

-- ✅ Nên
-- Chỉ dùng khi thực sự cần
-- Test kỹ trước khi deploy
-- Document lý do sử dụng
```

### 2. Test Performance
```sql
-- Test với và không có hint
SET STATISTICS IO ON
SET STATISTICS TIME ON

-- Query không có hint
SELECT * FROM TableName WHERE Column = @Value

-- Query có hint
SELECT * FROM TableName 
WITH (INDEX(IX_IndexName))
WHERE Column = @Value

-- So sánh kết quả
```

### 3. Monitor Plan Changes
```sql
-- Sử dụng Query Store để monitor
-- Xem plan có thay đổi không
-- So sánh performance
```

### 4. Document Hints
```sql
-- Comment trong code
-- Giải thích lý do dùng hint
SELECT * FROM TableName
WHERE Column = @Value
OPTION (MAXDOP 4)  -- Force parallel vì table lớn và statistics cũ
```

## Common Mistakes

### Mistake 1: Overuse Hints
```sql
-- ❌ Quá nhiều hints
SELECT * FROM Table1 t1
WITH (INDEX(IX_Index1))
INNER HASH JOIN Table2 t2 ON t1.ID = t2.ID
WHERE t1.Column = @Value
OPTION (FORCE ORDER, MAXDOP 4, RECOMPILE)

-- ✅ Chỉ dùng hints cần thiết
SELECT * FROM Table1 t1
INNER JOIN Table2 t2 ON t1.ID = t2.ID
WHERE t1.Column = @Value
OPTION (MAXDOP 4)  -- Chỉ hint cần thiết
```

### Mistake 2: Hints Không Phù Hợp
```sql
-- ❌ Hint không phù hợp với data
SELECT * FROM SmallTable  -- Table nhỏ
OPTION (MAXDOP 8)  -- Parallel không cần thiết

-- ✅ Hint phù hợp
SELECT * FROM LargeTable  -- Table lớn
OPTION (MAXDOP 4)  -- Parallel hợp lý
```

### Mistake 3: Không Review Sau Khi Fix
```sql
-- ❌ Dùng hint để fix vấn đề
-- Nhưng không review lại sau khi fix root cause

-- ✅ Review và remove hints không cần thiết
-- Sau khi fix statistics, index, etc.
```

## Alternatives to Hints

### 1. Fix Root Cause
```sql
-- Thay vì dùng hint
SELECT * FROM TableName
WITH (INDEX(IX_IndexName))
WHERE Column = @Value

-- Fix root cause
UPDATE STATISTICS TableName
-- Hoặc tạo index mới
-- Hoặc sửa query
```

### 2. Plan Guides
```sql
-- Sử dụng plan guides thay vì hints trong code
EXEC sp_create_plan_guide
    @name = N'PlanGuide_Orders',
    @stmt = N'SELECT * FROM Orders WHERE CustomerID = @CustomerID',
    @type = N'SQL',
    @module_or_batch = NULL,
    @params = NULL,
    @hints = N'OPTION (OPTIMIZE FOR (@CustomerID = 123))'
```

## Monitoring Hints

### Tìm Queries Có Hints
```sql
-- Tìm queries có hints trong plan cache
SELECT 
    cp.objtype,
    cp.cacheobjtype,
    cp.size_in_bytes,
    qp.query_plan,
    qt.text
FROM sys.dm_exec_cached_plans cp
CROSS APPLY sys.dm_exec_sql_text(cp.plan_handle) qt
CROSS APPLY sys.dm_exec_query_plan(cp.plan_handle) qp
WHERE qt.text LIKE '%OPTION%'
    OR qt.text LIKE '%WITH (INDEX%'
    OR qt.text LIKE '%JOIN%'
```

## Kết Luận

Query hints là công cụ mạnh mẽ nhưng cần sử dụng cẩn thận:
- ✅ Chỉ dùng khi thực sự cần
- ✅ Test kỹ trước khi deploy
- ✅ Document lý do sử dụng
- ✅ Review và remove khi không cần
- ❌ Không overuse hints
- ❌ Không dùng thay vì fix root cause

Hints nên là last resort, không phải first solution!

