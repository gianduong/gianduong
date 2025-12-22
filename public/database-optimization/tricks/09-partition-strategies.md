# Chiến Lược Partitioning Từ Cơ Bản Đến Phức Hợp (Composite)

## Tổng Quan
Partitioning strategy phụ thuộc vào đặc điểm data và query patterns. Chọn đúng strategy là chìa khóa để đạt hiệu quả tối đa.

## Các Chiến Lược Cơ Bản

### 1. Range Partitioning
Phân chia theo khoảng giá trị liên tục.

**Khi Nào Dùng:**
- Data có tính thời gian (time-series)
- Cần archive data cũ dễ dàng
- Query thường filter theo range

**Ví Dụ:**
```sql
-- Partition theo tháng
CREATE PARTITION FUNCTION PF_Monthly (DATETIME)
AS RANGE RIGHT FOR VALUES (
    '2024-01-01', '2024-02-01', '2024-03-01'
    -- ...
)
```

**Ưu Điểm:**
- Dễ implement và maintain
- Partition elimination hiệu quả
- Dễ archive/delete data cũ

**Nhược Điểm:**
- Có thể gây hot spots nếu data không phân bố đều
- Cần quản lý partitions mới thường xuyên

### 2. List Partitioning (Simulated)
SQL Server không hỗ trợ list partitioning trực tiếp, nhưng có thể simulate:

```sql
-- Sử dụng computed column
ALTER TABLE Orders
ADD RegionCode AS 
    CASE 
        WHEN Country IN ('US', 'CA', 'MX') THEN 'NA'
        WHEN Country IN ('UK', 'FR', 'DE') THEN 'EU'
        ELSE 'OTHER'
    END PERSISTED

CREATE PARTITION FUNCTION PF_Region (VARCHAR(10))
AS RANGE RIGHT FOR VALUES ('NA', 'EU', 'OTHER')
```

### 3. Hash Partitioning (Simulated)
Phân chia đều bằng hash function:

```sql
-- Sử dụng CHECKSUM
ALTER TABLE Users
ADD HashKey AS CHECKSUM(UserID) % 4 PERSISTED

CREATE PARTITION FUNCTION PF_Hash (INT)
AS RANGE LEFT FOR VALUES (0, 1, 2, 3)
```

**Khi Nào Dùng:**
- Cần phân bố đều data
- Không có cột thời gian rõ ràng
- Tránh hot spots

## Chiến Lược Phức Hợp (Composite)

### 1. Range-Hash Composite
Partition theo range trước, sau đó hash:

**Use Case:** Multi-tenant application với time-series data

```sql
-- Bước 1: Tạo bảng với range partition
CREATE TABLE TenantEvents (
    EventID BIGINT,
    TenantID INT,
    EventDate DATETIME,
    EventData NVARCHAR(MAX),
    HashKey AS CHECKSUM(TenantID) % 4 PERSISTED
) ON PS_Monthly(EventDate)

-- Bước 2: Tạo index với hash component
CREATE NONCLUSTERED INDEX IX_Tenant_Hash
ON TenantEvents(TenantID, HashKey)
INCLUDE (EventData)
```

### 2. Multi-Level Partitioning
Kết hợp nhiều levels:

**Level 1:** Range theo năm
**Level 2:** Hash theo tenant_id trong mỗi năm

```sql
-- Tạo partition function theo năm
CREATE PARTITION FUNCTION PF_Yearly (DATETIME)
AS RANGE RIGHT FOR VALUES (
    '2020-01-01', '2021-01-01', '2022-01-01', '2023-01-01'
)

-- Trong mỗi năm, sử dụng hash cho tenant distribution
```

### 3. Functional Partitioning
Partition dựa trên business logic:

```sql
-- Partition theo order status và date
ALTER TABLE Orders
ADD PartitionKey AS 
    CASE 
        WHEN Status = 'Completed' AND OrderDate < DATEADD(MONTH, -12, GETDATE()) 
            THEN 'Archive'
        WHEN Status IN ('Pending', 'Processing') 
            THEN 'Active'
        ELSE 'Other'
    END PERSISTED

CREATE PARTITION FUNCTION PF_Status (VARCHAR(20))
AS RANGE RIGHT FOR VALUES ('Archive', 'Active', 'Other')
```

## Chọn Chiến Lược Phù Hợp

### Decision Tree

1. **Data có tính thời gian?**
   - ✅ Có → Range partitioning theo thời gian
   - ❌ Không → Xem tiếp

2. **Cần phân bố đều?**
   - ✅ Có → Hash partitioning
   - ❌ Không → Xem tiếp

3. **Multi-tenant?**
   - ✅ Có → Composite (Range + Hash)
   - ❌ Không → Range hoặc List

4. **Query patterns phức tạp?**
   - ✅ Có → Composite strategy
   - ❌ Không → Đơn giản hóa

## Best Practices

### 1. Partition Key Selection
- **Time-based**: OrderDate, CreatedDate, TransactionDate
- **Geographic**: Region, Country, State
- **Business**: Status, Category, Type
- **Hash**: UserID, TenantID (cho distribution)

### 2. Partition Size
- **Tối thiểu**: 1GB per partition
- **Tối đa**: 100GB per partition (khuyến nghị)
- **Lý tưởng**: 5-20GB per partition

### 3. Number of Partitions
- **Small tables** (< 100GB): 2-10 partitions
- **Medium tables** (100GB-1TB): 10-50 partitions
- **Large tables** (> 1TB): 50-200 partitions
- **Very large** (> 10TB): 200-1000 partitions

### 4. Maintenance Strategy
```sql
-- Auto-create partitions cho tháng tiếp theo
DECLARE @NextMonth DATE = DATEADD(MONTH, 1, GETDATE())
DECLARE @FirstDay DATE = DATEFROMPARTS(YEAR(@NextMonth), MONTH(@NextMonth), 1)

ALTER PARTITION FUNCTION PF_Monthly()
SPLIT RANGE (@FirstDay)
```

## Monitoring Composite Partitions

### Kiểm Tra Distribution
```sql
SELECT 
    partition_number,
    rows,
    size_mb = SUM(size) * 8 / 1024,
    avg_rows_per_partition = AVG(rows) OVER()
FROM sys.partitions p
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE object_id = OBJECT_ID('TableName')
GROUP BY partition_number, rows
HAVING rows > AVG(rows) OVER() * 1.5  -- Tìm partitions lớn bất thường
```

### Kiểm Tra Hot Spots
```sql
-- Tìm partitions có nhiều activity
SELECT 
    p.partition_number,
    SUM(ios.page_io_latch_wait_count) AS TotalWaits
FROM sys.dm_db_index_operational_stats(DB_ID(), OBJECT_ID('TableName'), NULL, NULL) ios
INNER JOIN sys.partitions p ON ios.partition_number = p.partition_number
GROUP BY p.partition_number
ORDER BY TotalWaits DESC
```

## Case Studies

### Case 1: E-Commerce Orders
- **Strategy**: Range partitioning theo OrderDate (monthly)
- **Reason**: Query thường filter theo date range
- **Result**: Query time giảm 90%

### Case 2: Multi-Tenant SaaS
- **Strategy**: Composite (Range by Date + Hash by TenantID)
- **Reason**: Cần isolation per tenant và time-based queries
- **Result**: Scalability tăng 10x

### Case 3: Log Analytics
- **Strategy**: Range partitioning theo LogDate (daily)
- **Reason**: Archive logs cũ thường xuyên
- **Result**: Archive time giảm từ hours xuống minutes

## Kết Luận
Chọn đúng partitioning strategy phụ thuộc vào:
- Data characteristics
- Query patterns
- Business requirements
- Maintenance capabilities

Bắt đầu đơn giản với range partitioning, sau đó nâng cấp lên composite nếu cần.

