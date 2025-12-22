# Hướng Dẫn Chi Tiết Tạo Bảng Partition Trong SQL Server

## Tổng Quan
Tạo bảng partition từ đầu là cách tốt nhất để áp dụng partitioning. Quy trình này đơn giản hơn so với partition bảng đã tồn tại.

## Quy Trình Từng Bước

### Bước 1: Tạo Filegroups (Optional nhưng Recommended)
```sql
-- Tạo filegroups cho từng partition
ALTER DATABASE DatabaseName
ADD FILEGROUP FG_2024Q1

ALTER DATABASE DatabaseName
ADD FILEGROUP FG_2024Q2

ALTER DATABASE DatabaseName
ADD FILEGROUP FG_2024Q3

ALTER DATABASE DatabaseName
ADD FILEGROUP FG_2024Q4

-- Thêm files vào filegroups
ALTER DATABASE DatabaseName
ADD FILE (
    NAME = 'Data_2024Q1',
    FILENAME = 'C:\Data\DatabaseName_2024Q1.ndf',
    SIZE = 100MB,
    MAXSIZE = 10GB,
    FILEGROWTH = 100MB
) TO FILEGROUP FG_2024Q1

-- Lặp lại cho các filegroups khác
```

### Bước 2: Tạo Partition Function
```sql
-- Partition function theo quý
CREATE PARTITION FUNCTION PF_Quarterly (DATETIME)
AS RANGE RIGHT FOR VALUES (
    '2024-01-01',  -- Q1
    '2024-04-01',  -- Q2
    '2024-07-01',  -- Q3
    '2024-10-01'   -- Q4
)
```

**Lưu ý:**
- `RANGE RIGHT`: Giá trị boundary thuộc partition bên phải
- `RANGE LEFT`: Giá trị boundary thuộc partition bên trái
- Chọn phù hợp với logic nghiệp vụ

### Bước 3: Tạo Partition Scheme
```sql
-- Map partitions đến filegroups
CREATE PARTITION SCHEME PS_Quarterly
AS PARTITION PF_Quarterly
TO (
    FG_2024Q1,  -- Partition 1
    FG_2024Q2,  -- Partition 2
    FG_2024Q3,  -- Partition 3
    FG_2024Q4,  -- Partition 4
    [PRIMARY]    -- Partition 5 (future data)
)
```

### Bước 4: Tạo Bảng Với Partition Scheme
```sql
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1),
    OrderDate DATETIME NOT NULL,
    CustomerID INT,
    TotalAmount DECIMAL(18,2),
    -- Các cột khác
    CONSTRAINT PK_Orders PRIMARY KEY (OrderID, OrderDate)
) ON PS_Quarterly(OrderDate)
```

**Quan Trọng:**
- Partition key phải nằm trong PRIMARY KEY hoặc UNIQUE constraint
- Nếu có clustered index, partition key phải là phần của index key

### Bước 5: Tạo Non-Clustered Indexes
```sql
-- Tạo index với partition scheme
CREATE NONCLUSTered INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
ON PS_Quarterly(OrderDate)  -- Aligned index

-- Hoặc không partition (non-aligned)
CREATE NONCLUSTered INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
ON [PRIMARY]
```

## Các Loại Partitioning

### 1. Range Partitioning
Phân chia theo khoảng giá trị:
```sql
CREATE PARTITION FUNCTION PF_Range (INT)
AS RANGE LEFT FOR VALUES (100, 200, 300)
```

### 2. Hash Partitioning
Phân chia đều bằng hash function:
```sql
-- SQL Server không hỗ trợ hash partitioning trực tiếp
-- Nhưng có thể dùng computed column
ALTER TABLE TableName
ADD HashColumn AS CHECKSUM(ColumnName) PERSISTED

CREATE PARTITION FUNCTION PF_Hash (INT)
AS RANGE LEFT FOR VALUES (0, 1, 2, 3)
```

### 3. Composite Partitioning
Kết hợp nhiều chiến lược:
- Range theo thời gian
- Sau đó hash theo user_id

## Best Practices

### 1. Chọn Partition Key
- ✅ Cột thường xuyên trong WHERE clause
- ✅ Có phân bố đều
- ✅ Không thay đổi thường xuyên
- ❌ Tránh columns có nhiều NULL

### 2. Số Lượng Partitions
- **Tối thiểu**: 2 partitions
- **Tối đa**: 15,000 partitions (SQL Server 2016+)
- **Khuyến nghị**: 10-100 partitions cho hầu hết trường hợp

### 3. Filegroup Strategy
- Mỗi partition một filegroup (tốt nhất)
- Hoặc nhiều partitions trên một filegroup
- Cân nhắc backup/restore strategy

### 4. Index Alignment
- **Aligned Index**: Partition theo cùng partition key
- **Non-Aligned Index**: Không partition
- Khuyến nghị: Sử dụng aligned index

## Maintenance Operations

### Split Partition
```sql
-- Thêm partition mới
ALTER PARTITION FUNCTION PF_Quarterly()
SPLIT RANGE ('2025-01-01')
```

### Merge Partition
```sql
-- Gộp 2 partitions
ALTER PARTITION FUNCTION PF_Quarterly()
MERGE RANGE ('2024-01-01')
```

### Switch Partition
```sql
-- Chuyển partition sang bảng staging
ALTER TABLE Orders
SWITCH PARTITION 1 TO Orders_Archive
```

## Monitoring

### Kiểm Tra Partitions
```sql
-- Xem thông tin partitions
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    partition_number,
    rows,
    size_mb = SUM(size) * 8 / 1024
FROM sys.partitions p
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE object_id = OBJECT_ID('Orders')
GROUP BY object_id, partition_number, rows
ORDER BY partition_number
```

### Kiểm Tra Partition Elimination
```sql
-- Xem execution plan
SET STATISTICS IO ON
SELECT * FROM Orders
WHERE OrderDate >= '2024-01-01' AND OrderDate < '2024-02-01'
-- Chỉ partition 1 được truy cập
```

## Common Mistakes

1. **Quên thêm partition key vào PRIMARY KEY**
   - Lỗi: "Partition column must be part of primary key"
   - Giải pháp: Thêm partition key vào PK

2. **Không đủ filegroups**
   - Lỗi: "Partition scheme maps to fewer filegroups than partitions"
   - Giải pháp: Thêm filegroups hoặc dùng PRIMARY

3. **Partition key NULL**
   - Lỗi: Data không được phân bố đúng
   - Giải pháp: Thêm NOT NULL constraint

## Kết Luận
Tạo bảng partition từ đầu là cách tốt nhất để áp dụng partitioning. Plan kỹ partition key, số lượng partitions, và filegroup strategy để đạt hiệu quả tối đa.

