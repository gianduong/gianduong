# Hướng Dẫn Đọc Chiến Lược Thực Thi (Execution Plan)

## Tổng Quan
Execution Plan là bản đồ cho thấy SQL Server thực thi query như thế nào. Đọc và hiểu execution plan là kỹ năng quan trọng để optimize queries.

## Cách Xem Execution Plan

### 1. Estimated Execution Plan
```sql
-- Không thực thi query
-- Dựa trên statistics
SET SHOWPLAN_ALL ON
SELECT * FROM Orders WHERE CustomerID = 123
SET SHOWPLAN_ALL OFF

-- Hoặc trong SSMS: Query > Display Estimated Execution Plan
```

### 2. Actual Execution Plan
```sql
-- Thực thi query và thu thập thông tin thực tế
SET STATISTICS PROFILE ON
SELECT * FROM Orders WHERE CustomerID = 123
SET STATISTICS PROFILE OFF

-- Hoặc trong SSMS: Query > Include Actual Execution Plan (Ctrl+M)
```

## Các Thành Phần Quan Trọng

### 1. Operators
- **Table Scan**: Scan toàn bộ table
- **Index Seek**: Truy cập trực tiếp index entry
- **Index Scan**: Scan một phần index
- **Key Lookup**: Tra cứu data từ clustered index
- **Sort**: Sắp xếp data
- **Hash Match**: Hash join hoặc aggregation
- **Nested Loops**: Loop join
- **Merge Join**: Merge join

### 2. Cost Percentage
- Phần trăm cost của từng operation
- Operation có cost cao nhất là bottleneck
- Tập trung optimize operation này

### 3. Actual vs Estimated Rows
- So sánh actual rows vs estimated rows
- Chênh lệch lớn = statistics cũ
- Cần update statistics

## Phân Tích Execution Plan

### Bước 1: Xác Định Bottleneck
1. Tìm operation có cost cao nhất
2. Xem actual execution time
3. Xác định operation nào chậm nhất

### Bước 2: Phân Tích Operators
1. **Table Scan** → Cần index
2. **Key Lookup** → Cần covering index
3. **Sort** → Có thể dùng index để sort
4. **Implicit Conversion** → Sửa data type

### Bước 3: Tìm Missing Index
- SQL Server tự động suggest missing index
- Xem trong execution plan warnings
- Đánh giá trước khi tạo index

### Bước 4: Kiểm Tra Statistics
- So sánh actual vs estimated rows
- Chênh lệch > 10% → Cần update statistics
- Statistics cũ → Plan không tối ưu

## Các Warning Quan Trọng

### Missing Index
```
Missing Index (Impact XX.X%): CREATE INDEX ...
```
- SQL Server suggest index
- Đánh giá impact trước khi tạo
- Cân nhắc overhead của index

### Implicit Conversion
```
Type conversion in expression may affect "CardinalityEstimate"
```
- Data type không khớp
- Sửa query hoặc data type
- Có thể làm index không được sử dụng

### Unmatched Index
```
Index 'IX_Name' defined on the table/view 'Table' cannot be used
```
- Index không phù hợp với query
- Cần tạo index mới hoặc sửa query

## Best Practices

### 1. Luôn Xem Execution Plan
- Trước khi deploy query mới
- Khi query chậm
- Sau khi thay đổi index/statistics

### 2. So Sánh Plans
- So sánh plan trước và sau khi optimize
- Đảm bảo cải thiện thực sự
- Test với data thực tế

### 3. Document Findings
- Ghi lại các phát hiện
- Document giải pháp đã áp dụng
- Track performance improvements

## Ví Dụ Phân Tích

### Query Chậm
```sql
SELECT o.OrderID, o.OrderDate, c.CustomerName
FROM Orders o
INNER JOIN Customers c ON o.CustomerID = c.CustomerID
WHERE o.OrderDate >= '2024-01-01'
ORDER BY o.OrderDate DESC
```

### Execution Plan Analysis
1. **Table Scan trên Orders** (Cost: 60%)
   - ❌ Không có index trên OrderDate
   - ✅ Giải pháp: Tạo index trên OrderDate

2. **Key Lookup trên Customers** (Cost: 30%)
   - ⚠️ Cần lookup CustomerName
   - ✅ Giải pháp: Covering index hoặc INCLUDE CustomerName

3. **Sort** (Cost: 10%)
   - ⚠️ Sort trên OrderDate
   - ✅ Giải pháp: Index với ORDER BY DESC

### Query Sau Khi Tối Ưu
```sql
-- Tạo index
CREATE INDEX IX_Orders_OrderDate 
ON Orders(OrderDate DESC)
INCLUDE (CustomerID)

-- Query giữ nguyên, nhưng execution plan tốt hơn
```

## Tools Hỗ Trợ

### SQL Server Management Studio
- Built-in execution plan viewer
- Graphical plan display
- Detailed operator information

### SentryOne Plan Explorer
- Free tool để phân tích execution plan
- Visualization tốt hơn
- Advanced analysis features

### SQL Server Profiler
- Capture execution plans
- Analyze performance over time
- Identify problematic queries

## Kết Luận

Đọc execution plan là kỹ năng cần thiết:
- ✅ Hiểu cách SQL Server thực thi query
- ✅ Xác định bottlenecks
- ✅ Optimize query hiệu quả
- ✅ Troubleshoot performance issues

Practice thường xuyên để thành thạo!

