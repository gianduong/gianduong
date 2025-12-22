# Partitioning & Indexing - Best Practices

## Tổng Quan
Kết hợp partitioning và indexing đúng cách là key để đạt performance tối đa. Cần hiểu cách chúng tương tác và best practices.

## Index Alignment

### Aligned Index
```sql
-- Index được partition theo cùng partition key với table
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate
ON Orders(OrderDate)
ON PS_Monthly(OrderDate)  -- Aligned với partition scheme

-- Mỗi partition có index riêng
-- Hiệu quả cao cho partition queries
```

**Lợi Ích:**
- Partition elimination hiệu quả
- Rebuild index trên từng partition
- Switch partition dễ dàng

### Non-Aligned Index
```sql
-- Index không được partition
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
ON [PRIMARY]  -- Không partition

-- Toàn bộ index trên một partition
-- Có thể gây overhead
```

**Khi Nào Dùng:**
- Index không liên quan đến partition key
- Global indexes cần thiết
- Cross-partition queries

## Best Practices

### 1. Align Indexes với Partition Key
```sql
-- Partition key: OrderDate
-- Index nên align với OrderDate
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate_CustomerID
ON Orders(OrderDate, CustomerID)
ON PS_Monthly(OrderDate)  -- Aligned

-- Query chỉ scan partitions cần thiết
SELECT * FROM Orders
WHERE OrderDate >= '2024-01-01' AND OrderDate < '2024-02-01'
-- Chỉ partition tháng 1 được scan
```

### 2. Covering Indexes
```sql
-- Covering index để tránh key lookup
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate_Covering
ON Orders(OrderDate)
INCLUDE (CustomerID, TotalAmount, Status)
ON PS_Monthly(OrderDate)  -- Aligned

-- Query chỉ đọc index, không cần table
SELECT CustomerID, TotalAmount, Status
FROM Orders
WHERE OrderDate >= '2024-01-01'
```

### 3. Rebuild Indexes Per Partition
```sql
-- Rebuild index trên partition cụ thể
ALTER INDEX IX_Orders_OrderDate
ON Orders REBUILD PARTITION = 1
WITH (ONLINE = ON)

-- Nhanh hơn rebuild toàn bộ index
-- Không ảnh hưởng partitions khác
```

### 4. Statistics Per Partition
```sql
-- Update statistics cho partition cụ thể
UPDATE STATISTICS Orders
WITH RESAMPLE ON PARTITIONS(1)

-- Hoặc incremental statistics
CREATE STATISTICS Stats_OrderDate
ON Orders(OrderDate)
WITH INCREMENTAL = ON
```

## Common Patterns

### Pattern 1: Time-Based Partitioning
```sql
-- Partition theo thời gian
CREATE PARTITION FUNCTION PF_Monthly (DATETIME)
AS RANGE RIGHT FOR VALUES ('2024-01-01', '2024-02-01', ...)

-- Index align với partition key
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate
ON Orders(OrderDate)
ON PS_Monthly(OrderDate)

-- Queries filter theo OrderDate → Partition elimination
```

### Pattern 2: Composite Index
```sql
-- Index với partition key đầu tiên
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate_CustomerID
ON Orders(OrderDate, CustomerID)
ON PS_Monthly(OrderDate)

-- Partition key phải là first column
-- Để partition elimination hoạt động
```

### Pattern 3: Non-Aligned Global Index
```sql
-- Index không align (khi cần)
CREATE NONCLUSTERED INDEX IX_Orders_CustomerID
ON Orders(CustomerID)
ON [PRIMARY]

-- Dùng cho queries không filter theo partition key
SELECT * FROM Orders
WHERE CustomerID = 123
-- Scan tất cả partitions
```

## Performance Considerations

### Aligned Index Benefits
- ✅ Partition elimination
- ✅ Parallel processing per partition
- ✅ Independent maintenance
- ✅ Switch partition dễ dàng

### Non-Aligned Index Trade-offs
- ⚠️ Không có partition elimination
- ⚠️ Phải scan tất cả partitions
- ⚠️ Maintenance phức tạp hơn

## Maintenance

### Rebuild Indexes
```sql
-- Rebuild tất cả indexes trên table
ALTER INDEX ALL ON Orders REBUILD
WITH (ONLINE = ON)

-- Hoặc rebuild per partition
ALTER INDEX IX_Orders_OrderDate
ON Orders REBUILD PARTITION = ALL
WITH (ONLINE = ON)
```

### Update Statistics
```sql
-- Update statistics với incremental
UPDATE STATISTICS Orders
WITH RESAMPLE

-- Hoặc per partition
UPDATE STATISTICS Orders
WITH RESAMPLE ON PARTITIONS(1, 2, 3)
```

## Monitoring

### Index Usage Per Partition
```sql
-- Monitor index usage (không có direct partition stats)
-- Sử dụng execution plan để xem partition elimination
SET STATISTICS PROFILE ON
SELECT * FROM Orders
WHERE OrderDate >= '2024-01-01'
SET STATISTICS PROFILE OFF

-- Xem "Partition ID" trong plan
```

### Fragmentation Per Partition
```sql
-- Fragmentation per partition
SELECT 
    OBJECT_NAME(object_id) AS TableName,
    partition_number,
    index_id,
    avg_fragmentation_in_percent,
    page_count
FROM sys.dm_db_index_physical_stats(DB_ID(), OBJECT_ID('Orders'), NULL, NULL, 'DETAILED')
WHERE index_id > 0
ORDER BY partition_number, index_id
```

## Best Practices Summary

1. **Align Indexes với Partition Key**
   - Partition key phải là first column trong index
   - Enable partition elimination

2. **Use Covering Indexes**
   - Include columns thường xuyên query
   - Tránh key lookup

3. **Maintain Per Partition**
   - Rebuild indexes per partition
   - Update statistics per partition

4. **Monitor Performance**
   - Track partition elimination
   - Monitor fragmentation
   - Measure query performance

## Kết Luận

Partitioning và Indexing:
- ✅ Align indexes với partition key
- ✅ Use covering indexes
- ✅ Maintain per partition
- ✅ Monitor performance

Đúng strategy = Maximum performance!

