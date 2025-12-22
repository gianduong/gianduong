# Tối Ưu Index - Từ Cơ Bản Đến Nâng Cao

## Tổng Quan
Index là yếu tố quan trọng nhất ảnh hưởng đến hiệu năng query. Hiểu và tối ưu index đúng cách có thể cải thiện performance hàng trăm lần.

## Các Loại Index

### Clustered Index
- Mỗi table chỉ có một clustered index
- Data được sắp xếp vật lý theo clustered index
- Thường là Primary Key
- Ảnh hưởng đến cách data được lưu trữ

### Non-Clustered Index
- Có thể có nhiều non-clustered index
- Chứa pointer đến data row
- Tách biệt với data storage
- Tăng tốc SELECT nhưng chậm INSERT/UPDATE

### Columnstore Index
- Cho data warehouse và analytics
- Column-based storage
- Compression cao
- Phù hợp cho aggregation queries

## Clustering Factor và Sự Ảnh Hưởng

### Clustering Factor Là Gì
- Đo lường mức độ data được sắp xếp theo index
- Thấp = data được sắp xếp tốt = index hiệu quả
- Cao = data không được sắp xếp = index kém hiệu quả

### Ảnh Hưởng Đến Performance
- Clustering factor thấp: Index seek nhanh, ít I/O
- Clustering factor cao: Nhiều random I/O, chậm hơn

### Cải Thiện Clustering Factor
- Sắp xếp data theo index key
- Rebuild index thường xuyên
- Xem xét thay đổi clustered index

## Bài Toán Không Nên Dùng Index

### Khi Nào Index Không Giúp Ích

1. **Table Nhỏ**
   - Table < 1000 rows
   - Overhead của index lớn hơn lợi ích
   - Table scan có thể nhanh hơn

2. **Column Có Selectivity Thấp**
   - Column có ít giá trị unique (ví dụ: Gender, Status)
   - Index không giúp loại bỏ nhiều rows
   - Có thể dùng filtered index thay thế

3. **Column Thường Xuyên Thay Đổi**
   - Mỗi UPDATE cần update index
   - Overhead maintenance cao
   - Cân nhắc kỹ trước khi tạo index

4. **Write-Heavy Workloads**
   - INSERT/UPDATE nhiều hơn SELECT
   - Index làm chậm write operations
   - Cân nhắc giảm số lượng index

## Tạo Index Cho Bảng Tỷ Dòng

### Chiến Lược

1. **Online Index Creation**
   ```sql
   CREATE INDEX IX_Name ON Table(Column)
   WITH (ONLINE = ON, MAXDOP = 4)
   ```
   - Không block table trong quá trình tạo
   - Cho phép concurrent operations
   - Tốn nhiều tài nguyên hơn

2. **Phân Chia Thành Nhiều Bước**
   - Tạo index trên partition nhỏ trước
   - Test performance
   - Mở rộng dần

3. **Sử Dụng FILLFACTOR**
   ```sql
   CREATE INDEX IX_Name ON Table(Column)
   WITH (FILLFACTOR = 80)
   ```
   - Để lại không gian cho future inserts
   - Giảm page splits
   - Phù hợp cho tables có nhiều inserts

4. **Incremental Statistics**
   - Cập nhật statistics trong quá trình tạo index
   - Giúp query optimizer có thông tin chính xác

## Unusable Index

### Khi Nào Index Trở Thành Unusable
- Sau khi rebuild failed
- Index bị corrupt
- Schema change không tương thích

### Phát Hiện Unusable Index
```sql
-- SQL Server
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    name AS IndexName,
    is_disabled
FROM sys.indexes
WHERE is_disabled = 1
```

### Giải Pháp
- Rebuild index
- Drop và recreate nếu cần
- Fix underlying issue trước

## Foreign Key Index

### Vấn Đề
- Foreign key không tự động có index
- JOIN và DELETE/UPDATE trên parent table chậm
- Có thể gây lock contention

### Script Kiểm Tra Foreign Key Không Có Index
```sql
SELECT 
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fc 
    ON fk.object_id = fc.constraint_object_id
LEFT JOIN sys.index_columns ic 
    ON fc.parent_object_id = ic.object_id 
    AND fc.parent_column_id = ic.column_id
WHERE ic.object_id IS NULL
```

### Best Practice
- Luôn tạo index cho foreign key columns
- Giảm lock time khi DELETE/UPDATE parent
- Tăng tốc JOIN operations

## Partitioning & Indexing

### Aligned Index
- Index được partition theo cùng partition key với table
- Mỗi partition có index riêng
- Hiệu quả cao cho partition queries

### Non-Aligned Index
- Index không được partition
- Toàn bộ index trên một partition
- Có thể gây overhead

### Best Practice
- Sử dụng aligned index cho partition tables
- Rebuild index trên từng partition riêng
- Monitor index usage per partition

## Index Table

### Khi Nào Cần Index Table
- Query pattern không phù hợp với index structure
- Cần denormalize data để tăng tốc
- Materialized view không đủ

### Ví Dụ
```sql
-- Index table cho full-text search
CREATE TABLE ProductSearchIndex (
    ProductID INT,
    SearchText NVARCHAR(MAX),
    INDEX IX_SearchText (SearchText)
)
```

## So Sánh Chi Tiết Giữa Range Scan

### Index Seek
- Truy cập trực tiếp vào index entry
- O(log n) complexity
- Ít I/O nhất
- Phù hợp cho exact match

### Range Scan
- Scan một phần của index
- O(n) complexity (trong range)
- Nhiều I/O hơn seek
- Phù hợp cho range queries

### Table Scan
- Scan toàn bộ table
- O(n) complexity
- Nhiều I/O nhất
- Tránh bằng mọi giá

### Best Practice
- Thiết kế index để maximize seeks
- Range scan chấp nhận được nếu range nhỏ
- Monitor execution plans để phát hiện table scans

## Giám Sát Index

### Scripts Kiểm Tra

#### Index Usage Statistics
```sql
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    name AS IndexName,
    user_seeks,
    user_scans,
    user_lookups,
    user_updates,
    CASE 
        WHEN user_seeks + user_scans + user_lookups = 0 THEN 'Unused'
        WHEN user_updates > (user_seeks + user_scans + user_lookups) * 10 THEN 'Overhead'
        ELSE 'OK'
    END AS Status
FROM sys.dm_db_index_usage_stats
WHERE database_id = DB_ID()
ORDER BY user_updates DESC
```

#### Index Fragmentation
```sql
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    name AS IndexName,
    avg_fragmentation_in_percent,
    page_count
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED')
WHERE avg_fragmentation_in_percent > 30
    AND page_count > 1000
ORDER BY avg_fragmentation_in_percent DESC
```

### Maintenance Strategy
- Rebuild index khi fragmentation > 30%
- Reorganize index khi fragmentation 10-30%
- Drop unused indexes
- Monitor index usage thường xuyên

