# Chia Partition Trên Bảng Đã Tồn Tại

## Tổng Quan
Khi bạn có một bảng lớn đã tồn tại và muốn áp dụng partitioning, cần thực hiện cẩn thận để tránh downtime và đảm bảo data integrity.

## Quy Trình Thực Hiện

### Bước 1: Chuẩn Bị
1. **Backup Database**
   ```sql
   BACKUP DATABASE DatabaseName 
   TO DISK = 'C:\Backup\DatabaseName.bak'
   ```

2. **Kiểm Tra Cấu Trúc Bảng Hiện Tại**
   ```sql
   -- Xem cấu trúc bảng
   SELECT 
       c.name AS ColumnName,
       t.name AS DataType,
       c.max_length
   FROM sys.columns c
   INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
   WHERE c.object_id = OBJECT_ID('TableName')
   ```

3. **Xác Định Partition Key**
   - Chọn cột phù hợp (thường là cột thời gian)
   - Đảm bảo cột không NULL
   - Có phân bố đều

### Bước 2: Tạo Partition Function
```sql
-- Tạo partition function theo tháng
CREATE PARTITION FUNCTION PF_Monthly (DATETIME)
AS RANGE RIGHT FOR VALUES (
    '2024-01-01',
    '2024-02-01',
    '2024-03-01',
    -- ... thêm các giá trị khác
    '2024-12-01'
)
```

### Bước 3: Tạo Partition Scheme
```sql
-- Tạo partition scheme
CREATE PARTITION SCHEME PS_Monthly
AS PARTITION PF_Monthly
TO (
    [PRIMARY],
    [PRIMARY],
    [PRIMARY]
    -- ... map đến các filegroups
)
```

### Bước 4: Tạo Clustered Index Mới Với Partition Scheme

#### Cách 1: Online Index Creation (SQL Server 2014+)
```sql
-- Tạo clustered index mới với partition scheme
CREATE CLUSTERED INDEX IX_Clustered_Partitioned
ON TableName(PartitionKeyColumn, PrimaryKeyColumn)
WITH (
    ONLINE = ON,
    MAXDOP = 4,
    PAD_INDEX = ON,
    FILLFACTOR = 90
)
ON PS_Monthly(PartitionKeyColumn)
```

#### Cách 2: Tạo Bảng Mới và Copy Data
```sql
-- Tạo bảng mới với partition scheme
CREATE TABLE TableName_New (
    -- Các cột giống bảng cũ
    ...
) ON PS_Monthly(PartitionKeyColumn)

-- Copy data
INSERT INTO TableName_New
SELECT * FROM TableName

-- Rename tables
EXEC sp_rename 'TableName', 'TableName_Old'
EXEC sp_rename 'TableName_New', 'TableName'
```

### Bước 5: Rebuild Non-Clustered Indexes
```sql
-- Rebuild tất cả non-clustered indexes
ALTER INDEX ALL ON TableName REBUILD
WITH (
    ONLINE = ON,
    MAXDOP = 4
)
```

### Bước 6: Drop Index Cũ (Nếu Có)
```sql
-- Drop clustered index cũ nếu đã tạo mới
DROP INDEX IX_OldClusteredIndex ON TableName
```

## Lưu Ý Quan Trọng

### Downtime
- Quá trình này có thể mất nhiều thời gian với bảng lớn
- Nên thực hiện trong maintenance window
- Sử dụng ONLINE = ON để giảm downtime

### Disk Space
- Cần đủ disk space (ít nhất 2x kích thước bảng)
- Monitor disk usage trong quá trình thực hiện

### Performance Impact
- Quá trình partition có thể ảnh hưởng đến performance
- Nên thực hiện vào giờ thấp điểm
- Monitor CPU, Memory, I/O

### Testing
- Test trên môi trường dev/staging trước
- Verify data integrity sau khi hoàn thành
- Test queries để đảm bảo partition elimination hoạt động

## Best Practices

1. **Plan Carefully**
   - Xác định partition key phù hợp
   - Tính toán số lượng partitions
   - Plan filegroup strategy

2. **Monitor Progress**
   ```sql
   -- Kiểm tra tiến độ
   SELECT 
       session_id,
       command,
       percent_complete,
       estimated_completion_time
   FROM sys.dm_exec_requests
   WHERE command LIKE '%INDEX%'
   ```

3. **Verify Partitioning**
   ```sql
   -- Kiểm tra partitions đã được tạo
   SELECT 
       p.partition_number,
       p.rows,
       r.value AS RangeValue
   FROM sys.partitions p
   INNER JOIN sys.partition_range_values r 
       ON p.partition_number = r.boundary_id
   WHERE p.object_id = OBJECT_ID('TableName')
   ```

4. **Update Statistics**
   ```sql
   -- Cập nhật statistics sau khi partition
   UPDATE STATISTICS TableName
   WITH FULLSCAN
   ```

## Troubleshooting

### Lỗi: "Cannot partition a table that has computed columns"
- Giải pháp: Drop computed columns trước, partition, sau đó tạo lại

### Lỗi: "Partition scheme does not exist"
- Giải pháp: Đảm bảo partition scheme đã được tạo trước

### Lỗi: "Insufficient disk space"
- Giải pháp: Free up disk space hoặc thêm disk mới

## Kết Luận
Chia partition trên bảng đã tồn tại là quá trình phức tạp nhưng cần thiết để cải thiện performance. Thực hiện cẩn thận với đầy đủ backup và testing.

