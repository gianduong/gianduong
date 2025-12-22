# Giải Phẫu Database Partitioning

## Tổng Quan
Hiểu rõ cấu trúc bên trong của partitioning giúp tối ưu và troubleshoot hiệu quả hơn.

## Cấu Trúc Partitioning

### 1. Partition Function
Định nghĩa cách chia data thành partitions.

```sql
CREATE PARTITION FUNCTION PF_Example (INT)
AS RANGE LEFT FOR VALUES (10, 20, 30)
```

**Kết Quả:**
- Partition 1: values <= 10
- Partition 2: values > 10 and <= 20
- Partition 3: values > 20 and <= 30
- Partition 4: values > 30

### 2. Partition Scheme
Map partitions đến filegroups.

```sql
CREATE PARTITION SCHEME PS_Example
AS PARTITION PF_Example
TO ([FG1], [FG2], [FG3], [PRIMARY])
```

### 3. Partition Metadata
SQL Server lưu trữ thông tin partition trong system views:

```sql
-- Xem partition functions
SELECT * FROM sys.partition_functions

-- Xem partition schemes
SELECT * FROM sys.partition_schemes

-- Xem partition ranges
SELECT * FROM sys.partition_range_values
```

## Cấu Trúc Vật Lý

### Partition Storage
Mỗi partition được lưu trữ như một bảng riêng biệt:

```
Table (Logical)
├── Partition 1 (Physical) → Filegroup 1
├── Partition 2 (Physical) → Filegroup 2
├── Partition 3 (Physical) → Filegroup 3
└── Partition 4 (Physical) → Filegroup 4
```

### Index Structure
Index có thể được partition hoặc không:

**Aligned Index:**
```
Index (Logical)
├── Partition 1 Index → Filegroup 1
├── Partition 2 Index → Filegroup 2
└── ...
```

**Non-Aligned Index:**
```
Index (Logical) → Single Filegroup
```

## Partition Elimination

### Cơ Chế Hoạt Động
1. Query optimizer phân tích WHERE clause
2. Xác định partition key values
3. Áp dụng partition function
4. Chỉ truy cập partitions cần thiết

### Ví Dụ
```sql
-- Partition function: RANGE RIGHT FOR VALUES ('2024-01-01', '2024-02-01')

-- Query này chỉ truy cập partition 1
SELECT * FROM Orders
WHERE OrderDate >= '2024-01-01' AND OrderDate < '2024-02-01'

-- Query này truy cập partition 1 và 2
SELECT * FROM Orders
WHERE OrderDate >= '2024-01-01' AND OrderDate < '2024-03-01'
```

### Kiểm Tra Partition Elimination
```sql
SET STATISTICS IO ON
SELECT * FROM Orders WHERE OrderDate = '2024-01-15'

-- Xem execution plan
-- Tìm "Partition ID" trong operator properties
```

## Partition Operations

### 1. Split Partition
Chia một partition thành hai:

```sql
ALTER PARTITION FUNCTION PF_Monthly()
SPLIT RANGE ('2024-02-01')
```

**Quá Trình:**
1. Tạo partition mới
2. Di chuyển data phù hợp
3. Update metadata

### 2. Merge Partition
Gộp hai partitions:

```sql
ALTER PARTITION FUNCTION PF_Monthly()
MERGE RANGE ('2024-01-01')
```

**Lưu Ý:**
- Data được merge vào partition bên trái
- Có thể mất thời gian với data lớn

### 3. Switch Partition
Chuyển partition giữa các bảng:

```sql
-- Chuyển partition sang staging table
ALTER TABLE Orders
SWITCH PARTITION 1 TO Orders_Archive
```

**Điều Kiện:**
- Cả hai bảng phải có cùng structure
- Cùng partition scheme
- Không có foreign keys

## Internal Structures

### Partition ID
Mỗi partition có unique ID:

```sql
SELECT 
    p.partition_id,
    p.partition_number,
    p.rows
FROM sys.partitions p
WHERE p.object_id = OBJECT_ID('TableName')
```

### Allocation Units
Mỗi partition có allocation units:

```sql
SELECT 
    a.type_desc,
    a.total_pages,
    a.used_pages
FROM sys.allocation_units a
INNER JOIN sys.partitions p ON a.container_id = p.partition_id
WHERE p.object_id = OBJECT_ID('TableName')
```

### Extents và Pages
Partition được chia thành extents và pages:

```
Partition
├── Extent 1 (8 pages)
├── Extent 2 (8 pages)
└── ...
```

## Performance Implications

### 1. Partition Elimination
- ✅ Chỉ scan partitions cần thiết
- ✅ Giảm I/O operations
- ✅ Tăng tốc query đáng kể

### 2. Parallel Processing
- Mỗi partition có thể được xử lý song song
- Tận dụng nhiều CPU cores
- Tăng throughput

### 3. Lock Granularity
- Lock có thể ở mức partition thay vì table
- Giảm lock contention
- Tăng concurrency

### 4. Maintenance Operations
- Rebuild index trên từng partition
- Backup/restore từng partition
- Archive data dễ dàng

## Troubleshooting

### Partition Not Eliminated
```sql
-- Kiểm tra execution plan
-- Tìm "Partition ID" = "All partitions"

-- Nguyên nhân thường gặp:
-- 1. WHERE clause không filter trên partition key
-- 2. Implicit conversion
-- 3. Functions trên partition key
```

### Uneven Distribution
```sql
-- Tìm partitions có size bất thường
SELECT 
    partition_number,
    rows,
    size_mb = SUM(size) * 8 / 1024
FROM sys.partitions p
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE object_id = OBJECT_ID('TableName')
GROUP BY partition_number, rows
ORDER BY size_mb DESC
```

### Partition Metadata Corruption
```sql
-- Rebuild partition metadata
ALTER TABLE TableName REBUILD PARTITION = ALL
```

## Best Practices

1. **Monitor Partition Sizes**
   - Đảm bảo partitions có size tương đương
   - Tránh partitions quá lớn hoặc quá nhỏ

2. **Regular Maintenance**
   - Rebuild indexes trên partitions thay đổi
   - Update statistics per partition
   - Archive old partitions

3. **Plan Ahead**
   - Tạo partitions cho tương lai
   - Automate partition creation
   - Monitor partition usage

4. **Test Partition Elimination**
   - Verify execution plans
   - Test với data thực tế
   - Monitor I/O statistics

## Kết Luận
Hiểu rõ cấu trúc bên trong của partitioning giúp:
- Tối ưu hiệu quả hơn
- Troubleshoot nhanh hơn
- Maintain dễ dàng hơn
- Đạt performance tốt nhất

