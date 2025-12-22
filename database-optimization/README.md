# Database Optimization Tricks

Thư mục này chứa các thủ thuật và kỹ thuật tối ưu database được tổ chức từ các tài liệu SQL Server.

## Cấu Trúc

```
database-optimization/
├── index.json          # Metadata và cấu trúc của các tricks
├── tricks/             # Các file markdown chứa nội dung chi tiết
│   ├── 01-partitioning.md
│   ├── 02-query-optimization.md
│   ├── 03-index-optimization.md
│   ├── 04-query-store.md
│   ├── 05-execution-plan.md
│   └── 06-lob-performance.md
└── data/               # Dữ liệu bổ sung (nếu có)
```

## Thêm Trick Mới

1. Tạo file markdown mới trong thư mục `tricks/`
2. Thêm entry vào `index.json` trong category phù hợp
3. Copy file vào `public/database-optimization/tricks/` để có thể truy cập từ web

## Format Markdown

Các file markdown sử dụng format chuẩn với:
- Headers (#, ##, ###)
- Code blocks (```sql, ```)
- Lists (-, *)
- Emoji indicators (✅, ❌, ⚠️)

## Categories

- **Partitioning**: Kỹ thuật chia bảng lớn thành partitions
- **Query Optimization**: Tối ưu câu lệnh SQL
- **Index Optimization**: Tối ưu index từ cơ bản đến nâng cao
- **Monitoring & Analysis**: Query Store, Execution Plan
- **Advanced Techniques**: LOB performance, parallel processing

