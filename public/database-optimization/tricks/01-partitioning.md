# Kỹ Thuật PARTITION và Tại Sao Nó Có Thể Tăng Tốc Hàng Nghìn Lần Nếu Thiết Kế Đúng

## Tổng Quan
Partitioning là kỹ thuật chia một bảng lớn thành nhiều phần nhỏ hơn (partitions) dựa trên một cột partition key. Khi thiết kế đúng, partitioning có thể tăng tốc query hàng nghìn lần.

## Lợi Ích Chính

### 1. Partition Pruning
- SQL Server chỉ truy cập vào partition cần thiết thay vì scan toàn bộ bảng
- Giảm I/O operations đáng kể
- Tăng tốc query từ vài phút xuống vài giây

### 2. Parallel Processing
- Các partition có thể được xử lý song song
- Tận dụng tối đa tài nguyên CPU và I/O

### 3. Maintenance Operations
- Dễ dàng backup/restore từng partition
- Archive hoặc xóa data cũ bằng cách drop partition
- Rebuild index trên từng partition riêng lẻ

## Chiến Lược Partitioning

### Range Partitioning
- Phù hợp cho data theo thời gian (time-based)
- Ví dụ: Partition theo tháng, quý, năm
- Dễ dàng archive data cũ

### Hash Partitioning
- Phân bố đều data theo hash function
- Phù hợp khi không có cột thời gian rõ ràng
- Tránh hot spots

### Composite Partitioning
- Kết hợp nhiều chiến lược partitioning
- Ví dụ: Range theo thời gian, sau đó Hash theo user_id

## Best Practices

1. **Chọn Partition Key Phù Hợp**
   - Cột thường xuyên được dùng trong WHERE clause
   - Cột có phân bố đều (tránh skew)
   - Cột không thay đổi thường xuyên

2. **Số Lượng Partition Hợp Lý**
   - Quá ít: Không tận dụng được lợi ích
   - Quá nhiều: Overhead quản lý tăng
   - Khuyến nghị: 10-100 partitions cho hầu hết trường hợp

3. **Align Index với Partition**
   - Index nên được partition theo cùng partition key
   - Tránh non-aligned index (giảm hiệu quả)

4. **Statistics Maintenance**
   - Cập nhật statistics trên từng partition
   - Sử dụng incremental statistics cho partition tables

## Các Table Nào Đang Bị Quét Full

### Kiểm Tra Full Table Scan
```sql
-- Tìm các query đang thực hiện full table scan
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    user_seeks,
    user_scans,
    user_lookups,
    user_updates
FROM sys.dm_db_index_usage_stats
WHERE database_id = DB_ID()
    AND user_scans > user_seeks * 10  -- Nhiều scan hơn seek
ORDER BY user_scans DESC
```

### Giải Pháp
- Thêm index phù hợp
- Sử dụng partitioning để giảm phạm vi scan
- Tối ưu query để sử dụng index

## Làm Thế Nào Hệ Thống Biết Được Cần Phải Truy Cập Vào Partition Nào

### Partition Elimination
SQL Server sử dụng partition elimination để xác định partition cần truy cập:

1. **Query Analyzer** phân tích WHERE clause
2. **Partition Function** được áp dụng để xác định partition range
3. Chỉ các partition chứa data phù hợp mới được truy cập

### Ví Dụ
```sql
-- Nếu partition theo CreatedDate
SELECT * FROM Orders 
WHERE CreatedDate >= '2024-01-01' 
  AND CreatedDate < '2024-02-01'

-- Chỉ partition chứa tháng 1/2024 được truy cập
```

## Sự Khác Biệt Giữa Partition Object và Non-Partition Object

### Partition Object
- Index được partition theo cùng partition key với table
- Mỗi partition có index riêng
- Hiệu quả cao hơn cho partition queries

### Non-Partition Object
- Index không được partition
- Toàn bộ index nằm trên một partition
- Có thể gây overhead khi query chỉ cần một partition

## Lưu Ý Về Cập Nhật Statistics Trên Các Partition Objects

### Incremental Statistics
- SQL Server 2014+ hỗ trợ incremental statistics
- Chỉ cập nhật statistics cho partition thay đổi
- Giảm thời gian maintenance đáng kể

### Best Practice
```sql
-- Tạo statistics với incremental option
CREATE STATISTICS StatsName ON TableName(ColumnName)
WITH INCREMENTAL = ON

-- Cập nhật statistics cho partition cụ thể
UPDATE STATISTICS TableName WITH RESAMPLE ON PARTITIONS(1,2,3)
```

## Chia Partition Trên Bảng Đã Tồn Tại

### Quy Trình
1. Tạo partition function và partition scheme
2. Tạo clustered index mới với partition scheme
3. Drop index cũ
4. Rebuild các non-clustered index

### Lưu Ý
- Quá trình này có thể mất nhiều thời gian với bảng lớn
- Nên thực hiện trong maintenance window
- Backup database trước khi thực hiện

## Shrink và Rebuild

### Khi Nào Cần Shrink
- Sau khi xóa nhiều data
- Database file quá lớn so với data thực tế
- Cần giải phóng disk space

### Lưu Ý
- Shrink có thể gây fragmentation
- Nên rebuild index sau khi shrink
- Tránh shrink thường xuyên (gây overhead)

### Best Practice
```sql
-- Shrink file
DBCC SHRINKFILE('DatabaseName', target_size)

-- Rebuild index sau shrink
ALTER INDEX ALL ON TableName REBUILD
```

