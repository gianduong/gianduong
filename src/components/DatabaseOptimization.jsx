import { motion } from 'framer-motion'
import { FaDatabase, FaRocket, FaChartLine, FaCog, FaCheckCircle, FaLightbulb } from 'react-icons/fa'

const DatabaseOptimization = () => {
  const tips = [
    {
      icon: <FaDatabase className="text-2xl" />,
      color: "text-tokyo-night-cyan",
      bgColor: "bg-tokyo-night-cyan/10",
      borderColor: "border-tokyo-night-cyan",
      title: "Indexing Strategy",
      description: "Tạo index phù hợp cho các cột thường xuyên được query. Tránh over-indexing vì sẽ làm chậm quá trình INSERT/UPDATE.",
      tips: [
        "Sử dụng composite index cho các query có nhiều điều kiện WHERE",
        "Đánh index cho foreign keys và các cột trong JOIN",
        "Sử dụng partial index cho các điều kiện cụ thể",
        "Thường xuyên analyze và optimize index với ANALYZE TABLE"
      ]
    },
    {
      icon: <FaRocket className="text-2xl" />,
      color: "text-tokyo-night-blue",
      bgColor: "bg-tokyo-night-blue/10",
      borderColor: "border-tokyo-night-blue",
      title: "Query Optimization",
      description: "Viết query hiệu quả là nền tảng của performance. Một query tốt có thể giảm thời gian xử lý từ vài giây xuống milliseconds.",
      tips: [
        "Sử dụng EXPLAIN để phân tích execution plan",
        "Tránh SELECT * - chỉ lấy các cột cần thiết",
        "Sử dụng LIMIT cho pagination thay vì load toàn bộ data",
        "Tối ưu JOIN - đảm bảo có index trên các cột JOIN",
        "Sử dụng UNION thay vì OR trong một số trường hợp",
        "Cache kết quả query thường xuyên được sử dụng"
      ]
    },
    {
      icon: <FaChartLine className="text-2xl" />,
      color: "text-tokyo-night-purple",
      bgColor: "bg-tokyo-night-purple/10",
      borderColor: "border-tokyo-night-purple",
      title: "Database Sharding & Partitioning",
      description: "Khi database phình to với hàng tỷ bản ghi, sharding và partitioning là giải pháp tất yếu để duy trì performance.",
      tips: [
        "Horizontal partitioning theo thời gian (time-based) cho log data",
        "Sharding theo user_id hoặc region cho multi-tenant apps",
        "Sử dụng Vitess cho MySQL sharding tự động",
        "Partition pruning để giảm số lượng partitions được scan",
        "Đảm bảo shard key phân bố đều để tránh hot spots"
      ]
    },
    {
      icon: <FaCog className="text-2xl" />,
      color: "text-tokyo-night-green",
      bgColor: "bg-tokyo-night-green/10",
      borderColor: "border-tokyo-night-green",
      title: "Connection Pooling & Caching",
      description: "Quản lý connections và cache hiệu quả giúp giảm tải cho database và cải thiện response time.",
      tips: [
        "Sử dụng connection pooling (HikariCP, PgBouncer) để tái sử dụng connections",
        "Cache kết quả query với Redis hoặc Memcached",
        "Implement cache invalidation strategy hợp lý",
        "Sử dụng read replicas để phân tải read operations",
        "Batch operations thay vì multiple single queries",
        "Sử dụng prepared statements để tái sử dụng query plans"
      ]
    },
    {
      icon: <FaDatabase className="text-2xl" />,
      color: "text-tokyo-night-yellow",
      bgColor: "bg-tokyo-night-yellow/10",
      borderColor: "border-tokyo-night-yellow",
      title: "Big Data Specific Techniques",
      description: "Với hệ thống xử lý hàng tỷ bản ghi, cần áp dụng các kỹ thuật đặc biệt.",
      tips: [
        "Sử dụng Kafka để stream data thay vì batch processing",
        "Elasticsearch cho full-text search và analytics",
        "Time-series databases (InfluxDB, TimescaleDB) cho metrics",
        "Columnar storage (ClickHouse) cho analytics workloads",
        "Archive old data vào cold storage (S3, Glacier)",
        "Materialized views cho các aggregations phức tạp"
      ]
    },
    {
      icon: <FaRocket className="text-2xl" />,
      color: "text-tokyo-night-red",
      bgColor: "bg-tokyo-night-red/10",
      borderColor: "border-tokyo-night-red",
      title: "Monitoring & Performance Tuning",
      description: "Đo lường và giám sát liên tục là chìa khóa để duy trì performance tốt.",
      tips: [
        "Monitor slow query log thường xuyên",
        "Sử dụng tools như Percona Toolkit, pt-query-digest",
        "Track các metrics: query time, connection count, cache hit ratio",
        "Set up alerts cho các queries chậm hơn threshold",
        "Regular maintenance: OPTIMIZE TABLE, VACUUM (PostgreSQL)",
        "Review và refactor queries dựa trên real-world usage patterns"
      ]
    }
  ]

  const caseStudies = [
    {
      title: "Case Study 1: E-Commerce Tracking System",
      challenge: "Hệ thống tracking e-commerce với hàng triệu events/ngày",
      solution: "Sử dụng Kafka để stream data, Vitess để shard MySQL, và Elasticsearch cho search",
      result: "Query time giảm từ 5-10s xuống dưới 100ms"
    },
    {
      title: "Case Study 2: Large Scale Database",
      challenge: "Database với 2 tỷ bản ghi, query chậm dần theo thời gian",
      solution: "Implement time-based partitioning, archive data cũ vào S3, và optimize indexes",
      result: "Performance ổn định dù data tăng trưởng liên tục"
    }
  ]

  return (
    <div className="min-h-screen bg-tokyo-night-bg pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-3">
            Thủ Thuật Tối Ưu Database
          </h1>
          <p className="text-base sm:text-lg text-tokyo-night-fg/70 max-w-3xl mx-auto">
            Chia sẻ kinh nghiệm thực chiến từ việc tối ưu hóa hệ thống xử lý hàng tỷ bản ghi
          </p>
        </motion.div>

        {/* Tips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={`bg-tokyo-night-bg-alt/50 hover:bg-tokyo-night-bg-alt rounded-xl p-6 border-l-4 ${tip.borderColor} transition-all duration-300 shadow-sm hover:shadow-lg`}
            >
              <div className={`inline-flex p-3 ${tip.bgColor} rounded-lg mb-4 ${tip.color}`}>
                {tip.icon}
              </div>
              
              <h2 className={`text-xl font-bold mb-3 ${tip.color}`}>
                {tip.title}
              </h2>
              
              <p className="text-sm text-tokyo-night-fg/70 mb-4 leading-relaxed">
                {tip.description}
              </p>
              
              <ul className="space-y-2.5">
                {tip.tips.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2.5 text-sm">
                    <FaCheckCircle className={`${tip.color} mt-0.5 flex-shrink-0 text-xs`} />
                    <span className="text-tokyo-night-fg/80 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Case Studies */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-tokyo-night-bg-alt/50 rounded-xl p-8 border border-tokyo-night-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-tokyo-night-yellow/20 rounded-lg">
              <FaLightbulb className="text-2xl text-tokyo-night-yellow" />
            </div>
            <h2 className="text-2xl font-bold text-tokyo-night-cyan">
              Kinh Nghiệm Thực Tế
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-tokyo-night-bg rounded-lg p-5 border border-tokyo-night-border">
                <h3 className="text-lg font-semibold text-tokyo-night-cyan mb-3">
                  {study.title}
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div>
                    <span className="font-medium text-tokyo-night-red">Thách thức:</span>
                    <p className="text-tokyo-night-fg/70 mt-1">{study.challenge}</p>
                  </div>
                  <div>
                    <span className="font-medium text-tokyo-night-blue">Giải pháp:</span>
                    <p className="text-tokyo-night-fg/70 mt-1">{study.solution}</p>
                  </div>
                  <div>
                    <span className="font-medium text-tokyo-night-green">Kết quả:</span>
                    <p className="text-tokyo-night-fg/70 mt-1">{study.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-tokyo-night-bg rounded-lg p-5 border-l-4 border-tokyo-night-cyan">
            <p className="text-sm text-tokyo-night-fg/80 leading-relaxed">
              <strong className="text-tokyo-night-cyan">Best Practice:</strong> Luôn bắt đầu với query optimization và indexing trước khi 
              nghĩ đến sharding. Sharding là giải pháp cuối cùng khi các phương pháp khác không còn hiệu quả.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DatabaseOptimization
