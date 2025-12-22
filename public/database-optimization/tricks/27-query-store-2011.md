# Query Store trên SQL Server 2011 (2012)

## Tổng Quan
SQL Server 2012 không có Query Store built-in, nhưng có thể sử dụng các techniques tương tự để monitor và optimize queries.

## Alternatives cho Query Store

### 1. Plan Cache Analysis
```sql
-- Phân tích plan cache
SELECT 
    cp.objtype,
    cp.cacheobjtype,
    cp.size_in_bytes,
    cp.usecounts,
    cp.refcounts,
    qp.query_plan,
    qt.text AS query_text
FROM sys.dm_exec_cached_plans cp
CROSS APPLY sys.dm_exec_sql_text(cp.plan_handle) qt
CROSS APPLY sys.dm_exec_query_plan(cp.plan_handle) qp
WHERE qt.text NOT LIKE '%sys.%'
ORDER BY cp.usecounts DESC
```

### 2. Query Statistics
```sql
-- Query statistics từ plan cache
SELECT 
    qs.execution_count,
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time,
    qs.total_logical_reads / qs.execution_count AS avg_logical_reads,
    qs.total_physical_reads / qs.execution_count AS avg_physical_reads,
    qs.total_worker_time / qs.execution_count AS avg_cpu_time,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2)+1) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
WHERE qt.text NOT LIKE '%sys.%'
ORDER BY avg_elapsed_time DESC
```

### 3. Custom Tracking Table
```sql
-- Tạo table để track queries
CREATE TABLE QueryPerformanceLog (
    LogID BIGINT IDENTITY(1,1) PRIMARY KEY,
    QueryText NVARCHAR(MAX),
    ExecutionCount INT,
    AvgElapsedTime BIGINT,
    AvgLogicalReads BIGINT,
    AvgPhysicalReads BIGINT,
    AvgCpuTime BIGINT,
    LogDate DATETIME DEFAULT GETDATE()
)

-- Stored procedure để capture
CREATE PROCEDURE sp_CaptureQueryStats
AS
BEGIN
    INSERT INTO QueryPerformanceLog (
        QueryText,
        ExecutionCount,
        AvgElapsedTime,
        AvgLogicalReads,
        AvgPhysicalReads,
        AvgCpuTime
    )
    SELECT 
        SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
            ((CASE qs.statement_end_offset
                WHEN -1 THEN DATALENGTH(qt.text)
                ELSE qs.statement_end_offset
            END - qs.statement_start_offset)/2)+1) AS query_text,
        qs.execution_count,
        qs.total_elapsed_time / qs.execution_count,
        qs.total_logical_reads / qs.execution_count,
        qs.total_physical_reads / qs.execution_count,
        qs.total_worker_time / qs.execution_count
    FROM sys.dm_exec_query_stats qs
    CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
    WHERE qt.text NOT LIKE '%sys.%'
        AND qs.execution_count > 10
END
```

## Monitoring Queries

### Top Slow Queries
```sql
-- Top 10 slowest queries
SELECT TOP 10
    qs.execution_count,
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time_ms,
    qs.total_logical_reads / qs.execution_count AS avg_logical_reads,
    qs.total_physical_reads / qs.execution_count AS avg_physical_reads,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2)+1) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
WHERE qt.text NOT LIKE '%sys.%'
ORDER BY avg_elapsed_time_ms DESC
```

### Most Executed Queries
```sql
-- Most executed queries
SELECT TOP 10
    qs.execution_count,
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time_ms,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2)+1) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
WHERE qt.text NOT LIKE '%sys.%'
ORDER BY qs.execution_count DESC
```

## Plan Analysis

### Find Plans with Table Scan
```sql
-- Tìm plans có table scan
SELECT 
    qp.query_plan,
    qt.text AS query_text,
    qs.execution_count,
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time
FROM sys.dm_exec_cached_plans cp
CROSS APPLY sys.dm_exec_sql_text(cp.plan_handle) qt
CROSS APPLY sys.dm_exec_query_plan(cp.plan_handle) qp
CROSS APPLY sys.dm_exec_query_stats(cp.plan_handle) qs
WHERE qp.query_plan.exist('//RelOp[@PhysicalOp="Table Scan"]') = 1
ORDER BY qs.total_elapsed_time DESC
```

### Find Missing Indexes
```sql
-- Missing indexes từ plan cache
SELECT 
    OBJECT_NAME(mid.object_id) AS TableName,
    mid.equality_columns,
    mid.inequality_columns,
    mid.included_columns,
    migs.user_seeks,
    migs.user_scans,
    migs.avg_total_user_cost,
    migs.avg_user_impact
FROM sys.dm_db_missing_index_details mid
INNER JOIN sys.dm_db_missing_index_groups mig 
    ON mid.index_handle = mig.index_handle
INNER JOIN sys.dm_db_missing_index_group_stats migs 
    ON mig.index_group_handle = migs.group_handle
WHERE mid.database_id = DB_ID()
ORDER BY migs.avg_total_user_cost * migs.avg_user_impact * (migs.user_seeks + migs.user_scans) DESC
```

## Automation

### Scheduled Job
```sql
-- Tạo job để capture query stats hàng ngày
USE msdb
GO

EXEC sp_add_job
    @job_name = 'Capture Query Stats'

EXEC sp_add_jobstep
    @job_name = 'Capture Query Stats',
    @step_name = 'Capture Stats',
    @subsystem = 'TSQL',
    @command = 'EXEC DatabaseName.dbo.sp_CaptureQueryStats'

EXEC sp_add_schedule
    @schedule_name = 'Daily Capture',
    @freq_type = 4,  -- Daily
    @freq_interval = 1,
    @active_start_time = 020000  -- 2 AM

EXEC sp_attach_schedule
    @job_name = 'Capture Query Stats',
    @schedule_name = 'Daily Capture'

EXEC sp_add_jobserver
    @job_name = 'Capture Query Stats'
```

## Comparison với Query Store

### Query Store (2016+)
- ✅ Built-in feature
- ✅ Automatic capture
- ✅ Plan history
- ✅ Plan forcing

### Alternatives (2012)
- ⚠️ Manual setup
- ⚠️ Plan cache dependent
- ⚠️ No plan history
- ⚠️ No plan forcing

## Best Practices

### 1. Regular Monitoring
- Schedule jobs để capture stats
- Review reports thường xuyên
- Track performance trends

### 2. Plan Cache Management
- Monitor plan cache size
- Clear plan cache khi cần
- Review plan reuse

### 3. Custom Tracking
- Tạo custom tables để track
- Maintain history
- Analyze trends

## Kết Luận

SQL Server 2012 không có Query Store, nhưng có thể:
- ✅ Sử dụng DMVs để monitor
- ✅ Tạo custom tracking
- ✅ Analyze plan cache
- ✅ Track query performance

Với setup đúng, có thể achieve similar functionality như Query Store!

