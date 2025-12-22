# Bài Toán Hiệu Năng Của LOB (Large Object)

## Tổng Quan
LOB (Large Object) như VARCHAR(MAX), NVARCHAR(MAX), VARBINARY(MAX), TEXT, NTEXT, IMAGE có thể gây ra vấn đề hiệu năng nghiêm trọng nếu không được xử lý đúng cách.

## Vấn Đề Với LOB

### 1. Storage Overhead
- LOB data được lưu riêng biệt (out-of-row storage)
- Mỗi LOB column tạo thêm pointer trong row
- Tăng I/O operations

### 2. Query Performance
- SELECT * bao gồm LOB columns → Chậm
- LOB columns không thể index trực tiếp
- Full-text index cần thiết cho text search

### 3. Memory Usage
- LOB data được load vào memory
- Có thể gây memory pressure
- Ảnh hưởng đến buffer pool

## Best Practices

### 1. Tránh SELECT * Khi Có LOB Columns
```sql
-- ❌ Chậm: Load tất cả LOB data
SELECT * FROM Documents

-- ✅ Nhanh: Chỉ select columns cần thiết
SELECT DocumentID, Title, CreatedDate 
FROM Documents
WHERE DocumentID = @ID

-- ✅ Chỉ load LOB khi cần
SELECT DocumentID, Title, CreatedDate,
    CASE WHEN @NeedContent = 1 THEN Content ELSE NULL END AS Content
FROM Documents
WHERE DocumentID = @ID
```

### 2. Sử Dụng File Storage Cho Large Files
- Lưu file lớn (> 1MB) trên file system
- Chỉ lưu file path trong database
- Giảm database size và I/O

### 3. Compression
```sql
-- Enable compression cho LOB columns
ALTER TABLE Documents
REBUILD WITH (DATA_COMPRESSION = PAGE)

-- Hoặc row compression
ALTER TABLE Documents
REBUILD WITH (DATA_COMPRESSION = ROW)
```

### 4. Chia Nhỏ LOB Data
- Chia large document thành nhiều chunks
- Lưu mỗi chunk trong row riêng
- Dễ dàng query và update từng phần

### 5. Sử Dụng FILESTREAM (SQL Server 2008+)
```sql
-- Tạo FILESTREAM filegroup
ALTER DATABASE DatabaseName
ADD FILEGROUP FileStreamGroup CONTAINS FILESTREAM

ALTER DATABASE DatabaseName
ADD FILE (
    NAME = 'FileStreamData',
    FILENAME = 'C:\FileStreamData'
) TO FILEGROUP FileStreamGroup

-- Tạo table với FILESTREAM
CREATE TABLE Documents (
    DocumentID UNIQUEIDENTIFIER ROWGUIDCOL NOT NULL UNIQUE,
    DocumentName NVARCHAR(255),
    DocumentData VARBINARY(MAX) FILESTREAM NULL
)
```

## Tối Ưu Query Với LOB

### 1. Sử Dụng SUBSTRING Cho Partial Read
```sql
-- Chỉ đọc phần cần thiết của LOB
SELECT DocumentID,
    SUBSTRING(Content, 1, 1000) AS Preview
FROM Documents
WHERE DocumentID = @ID
```

### 2. Full-Text Index Cho Text Search
```sql
-- Tạo full-text catalog
CREATE FULLTEXT CATALOG DocumentCatalog

-- Tạo full-text index
CREATE FULLTEXT INDEX ON Documents(Content)
KEY INDEX PK_Documents
ON DocumentCatalog

-- Query với full-text search
SELECT DocumentID, Title
FROM Documents
WHERE CONTAINS(Content, 'search term')
```

### 3. Tránh LOB Trong WHERE Clause
```sql
-- ❌ Chậm: LOB trong WHERE
SELECT * FROM Documents
WHERE Content LIKE '%search%'

-- ✅ Nhanh: Sử dụng full-text index
SELECT * FROM Documents
WHERE CONTAINS(Content, 'search')
```

## Monitoring LOB Performance

### Kiểm Tra LOB Usage
```sql
-- Tìm tables có LOB columns
SELECT 
    t.name AS TableName,
    c.name AS ColumnName,
    ty.name AS DataType,
    c.max_length
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
WHERE ty.name IN ('text', 'ntext', 'image', 'varchar', 'nvarchar', 'varbinary')
    AND (c.max_length = -1 OR c.max_length > 8000)
ORDER BY t.name, c.name
```

### Kiểm Tra LOB I/O
```sql
-- Monitor LOB reads
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    SUM(lob_reads) AS TotalLOBReads,
    SUM(lob_writes) AS TotalLOBWrites
FROM sys.dm_db_index_usage_stats
WHERE database_id = DB_ID()
GROUP BY object_id
HAVING SUM(lob_reads) > 0 OR SUM(lob_writes) > 0
ORDER BY TotalLOBReads DESC
```

## Migration Strategy

### Từ TEXT/NTEXT/IMAGE Sang VARCHAR(MAX)/NVARCHAR(MAX)/VARBINARY(MAX)
```sql
-- Step 1: Add new column
ALTER TABLE Documents
ADD ContentNew NVARCHAR(MAX)

-- Step 2: Copy data
UPDATE Documents
SET ContentNew = CAST(Content AS NVARCHAR(MAX))

-- Step 3: Drop old column
ALTER TABLE Documents
DROP COLUMN Content

-- Step 4: Rename new column
EXEC sp_rename 'Documents.ContentNew', 'Content', 'COLUMN'
```

## Kết Luận

### Key Takeaways
1. **Tránh SELECT *** khi có LOB columns
2. **Sử dụng file storage** cho files lớn
3. **Enable compression** để giảm size
4. **Full-text index** cho text search
5. **Monitor LOB usage** thường xuyên

### Performance Impact
- Proper LOB handling có thể cải thiện performance 10-100x
- Giảm I/O operations đáng kể
- Giảm memory usage
- Cải thiện query response time

