# Đọc và Phân Tích Execution Plan

## Tổng Quan
Execution Plan (chiến lược thực thi) là bản đồ cho thấy SQL Server sẽ thực thi query như thế nào. Hiểu execution plan là kỹ năng quan trọng để tối ưu query.

## Cách Xem Execution Plan

### 1. Estimated Execution Plan
- Không thực thi query
- Dựa trên statistics
- Nhanh, không tốn tài nguyên
- Có thể không chính xác 100%

### 2. Actual Execution Plan
- Thực thi query và thu thập thông tin thực tế
- Chính xác hơn estimated plan
- Tốn tài nguyên hơn
- Hiển thị actual rows, actual time

### Cách Bật
```sql
-- Trong SSMS
-- Menu: Query > Include Actual Execution Plan
-- Hoặc Ctrl + M

-- Hoặc trong query
SET STATISTICS PROFILE ON
SELECT * FROM Table
SET STATISTICS PROFILE OFF
```

## Các Thành Phần Quan Trọng

### 1. Operators (Toán Tử)

#### Table Scan
- Quét toàn bộ table
- ❌ Chậm nhất, tránh bằng mọi giá
- Giải pháp: Thêm index

#### Index Seek
- Truy cập trực tiếp vào index entry
- ✅ Nhanh nhất
- Lý tưởng cho exact match

#### Index Scan
- Quét toàn bộ index
- ⚠️ Nhanh hơn table scan nhưng không tối ưu
- Có thể cải thiện bằng covering index

#### Key Lookup
- Tra cứu data từ clustered index
- ⚠️ Có thể gây N+1 problem
- Giải pháp: Covering index

#### Sort
- Sắp xếp data
- ⚠️ Tốn CPU và memory
- Giải pháp: Index hỗ trợ ORDER BY

#### Hash Match
- Hash join hoặc aggregation
- ⚠️ Tốn memory
- Phù hợp cho large datasets

#### Nested Loops
- Loop join
- ✅ Nhanh cho small datasets
- ⚠️ Chậm cho large datasets

#### Merge Join
- Merge join
- ✅ Nhanh cho sorted data
- Cần data được sắp xếp

### 2. Cost Percentage
- Phần trăm cost của từng operation
- Operation có cost cao nhất là bottleneck
- Tập trung tối ưu operation này

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
1. Table Scan → Cần index
2. Key Lookup → Cần covering index
3. Sort → Có thể dùng index để sort
4. Implicit Conversion → Sửa data type

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
- So sánh plan trước và sau khi tối ưu
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
Đọc execution plan là kỹ năng cần thiết để:
- Hiểu cách SQL Server thực thi query
- Xác định bottlenecks
- Tối ưu query hiệu quả
- Troubleshoot performance issues

Practice thường xuyên để thành thạo kỹ năng này!

