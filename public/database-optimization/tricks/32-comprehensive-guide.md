# Hướng Dẫn Toàn Diện Tối Ưu Database

## Tổng Quan
Tổng hợp tất cả các kỹ thuật và best practices để tối ưu database hiệu quả. Đây là guide toàn diện cho database optimization.

## Quy Trình Tối Ưu

### Bước 1: Phân Tích
1. **Identify Problems**
   - Slow queries
   - High CPU/Memory usage
   - Blocking issues
   - I/O bottlenecks

2. **Measure Baseline**
   - Query execution times
   - System resource usage
   - User complaints
   - Business impact

### Bước 2: Optimize
1. **Query Optimization**
   - Fix slow queries
   - Add missing indexes
   - Optimize JOINs
   - Remove unnecessary operations

2. **Index Optimization**
   - Create missing indexes
   - Remove unused indexes
   - Rebuild fragmented indexes
   - Update statistics

3. **Architecture Optimization**
   - Consider partitioning
   - Implement read replicas
   - Optimize database design
   - Consider caching

### Bước 3: Monitor
1. **Track Performance**
   - Monitor query performance
   - Track system resources
   - Set up alerts
   - Regular reviews

2. **Continuous Improvement**
   - Identify new issues
   - Apply optimizations
   - Measure improvements
   - Document learnings

## Checklist Tối Ưu

### Indexes
- [ ] Tất cả foreign keys có index
- [ ] Columns trong WHERE clause có index
- [ ] Columns trong JOIN có index
- [ ] Covering indexes cho frequent queries
- [ ] No unused indexes
- [ ] Indexes không bị fragmentation cao

### Queries
- [ ] Không có table scans
- [ ] Không có functions trên indexed columns
- [ ] JOINs có index support
- [ ] Queries sử dụng appropriate hints
- [ ] Statistics được update thường xuyên

### Statistics
- [ ] Statistics được update sau data changes
- [ ] Incremental statistics cho partition tables
- [ ] Statistics age < 7 days
- [ ] No stale statistics

### Maintenance
- [ ] Indexes được rebuild/reorganize thường xuyên
- [ ] Statistics được update thường xuyên
- [ ] Database được backup regularly
- [ ] Monitoring được setup

## Tools và Scripts

### 1. Query Store (2016+)
- Automatic query tracking
- Plan history
- Performance comparison
- Plan forcing

### 2. DMVs
- sys.dm_exec_query_stats
- sys.dm_db_index_usage_stats
- sys.dm_db_missing_index_details
- sys.dm_db_index_physical_stats

### 3. Execution Plans
- Estimated plans
- Actual plans
- Plan analysis
- Missing index suggestions

## Best Practices Summary

### Indexes
- ✅ Index foreign keys
- ✅ Index WHERE/JOIN columns
- ✅ Use covering indexes
- ✅ Monitor and maintain
- ❌ Avoid over-indexing
- ❌ Don't index low-selectivity columns

### Queries
- ✅ Use appropriate JOIN types
- ✅ Avoid functions on indexed columns
- ✅ Use parameterized queries
- ✅ Test with real data
- ❌ Don't use SELECT *
- ❌ Don't use DISTINCT unnecessarily

### Statistics
- ✅ Update regularly
- ✅ Use incremental for partitions
- ✅ Monitor statistics age
- ✅ Full scan for critical tables

### Maintenance
- ✅ Regular index maintenance
- ✅ Regular statistics updates
- ✅ Monitor performance
- ✅ Document changes

## Performance Targets

### Query Performance
- Simple queries: < 100ms
- Complex queries: < 1s
- Reports: < 10s
- Batch operations: As fast as possible

### System Resources
- CPU usage: < 70% average
- Memory usage: < 80%
- I/O wait: < 10%
- Blocking: Minimal

## Common Mistakes

1. **Over-Indexing**
   - Too many indexes
   - High maintenance overhead
   - Slow writes

2. **Under-Indexing**
   - Missing critical indexes
   - Table scans
   - Slow queries

3. **Ignoring Statistics**
   - Stale statistics
   - Poor plans
   - Performance degradation

4. **No Monitoring**
   - Unaware of issues
   - Reactive instead of proactive
   - No performance baseline

## Kết Luận

Database optimization là continuous process:
- ✅ Regular monitoring
- ✅ Proactive optimization
- ✅ Measure and improve
- ✅ Document and learn

Với approach đúng, có thể maintain optimal performance!

