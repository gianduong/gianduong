import { motion } from 'framer-motion'
import { FaCode, FaRocket, FaDatabase, FaChartLine } from 'react-icons/fa'

const Projects = () => {
  const projects = [
    {
      title: 'Hệ thống Tracking e-Commerce',
      role: 'Solution Architect & Lead Dev',
      challenge: 'Xử lý dữ liệu tracking của hàng triệu user/ngày, database phình to nhanh chóng.',
      solution: 'Sử dụng Kafka để stream dữ liệu, Vitess để sharding MySQL, ElasticSearch để search nhanh.',
      result: 'Hệ thống chạy ổn định với hàng tỷ bản ghi, giảm độ trễ query xuống dưới 100ms.',
      tech: ['Kafka', 'Vitess', 'MySQL', 'Java', 'Elasticsearch'],
      color: 'cyan',
      icon: <FaDatabase className="text-2xl" />,
      year: '2022-2023'
    },
    {
      title: 'Shopify App Platform',
      role: 'App Leader & Product Manager',
      challenge: 'Xây dựng nền tảng ứng dụng Shopify có khả năng mở rộng và dễ bảo trì.',
      solution: 'Kiến trúc microservices với Node.js, React, và Shopify Polaris. Tự động hóa CI/CD với GitLab.',
      result: 'Nền tảng hỗ trợ hàng nghìn merchants, thời gian deploy giảm 70%.',
      tech: ['Node.js', 'React', 'Shopify Polaris', 'Docker', 'Kubernetes', 'GitLab CI/CD'],
      color: 'blue',
      icon: <FaRocket className="text-2xl" />,
      year: '2023-2024'
    },
    {
      title: 'Big Data Analytics System',
      role: 'Solution Architect',
      challenge: 'Xử lý và phân tích hàng tỷ bản ghi dữ liệu trong thời gian thực.',
      solution: 'Pipeline xử lý dữ liệu với Kafka, lưu trữ phân tán với MongoDB, cache với Redis.',
      result: 'Hệ thống xử lý được 10+ tỷ events/ngày với độ trễ < 1s.',
      tech: ['Kafka', 'MongoDB', 'Redis', 'Elasticsearch', 'Go'],
      color: 'purple',
      icon: <FaChartLine className="text-2xl" />,
      year: '2021-2022'
    },
    {
      title: 'Microservices Payment Gateway',
      role: 'Full Stack Developer & Solution Architect',
      challenge: 'Xây dựng hệ thống thanh toán có khả năng xử lý hàng triệu giao dịch/ngày với độ tin cậy cao.',
      solution: 'Kiến trúc microservices với Spring Boot, message queue với RabbitMQ, database sharding với PostgreSQL.',
      result: 'Hệ thống xử lý 5M+ transactions/ngày, uptime 99.9%, thời gian phản hồi < 200ms.',
      tech: ['Java', 'Spring Boot', 'PostgreSQL', 'RabbitMQ', 'Docker', 'Kubernetes'],
      color: 'green',
      icon: <FaCode className="text-2xl" />,
      year: '2020-2021'
    },
    {
      title: 'Real-time Dashboard & Monitoring',
      role: 'Full Stack Developer',
      challenge: 'Xây dựng dashboard real-time để giám sát hệ thống với hàng nghìn metrics.',
      solution: 'WebSocket cho real-time updates, InfluxDB cho time-series data, React với D3.js cho visualization.',
      result: 'Dashboard hiển thị real-time với độ trễ < 500ms, hỗ trợ 10K+ concurrent users.',
      tech: ['React', 'Node.js', 'WebSocket', 'InfluxDB', 'D3.js', 'TypeScript'],
      color: 'yellow',
      icon: <FaChartLine className="text-2xl" />,
      year: '2019-2020'
    },
    {
      title: 'E-Commerce Platform (Laravel)',
      role: 'Full Stack Developer',
      challenge: 'Xây dựng nền tảng e-commerce với khả năng mở rộng và tối ưu performance.',
      solution: 'Laravel backend, Vue.js frontend, Redis caching, MySQL với query optimization, CDN integration.',
      result: 'Platform hỗ trợ 100K+ products, load time < 2s, conversion rate tăng 30%.',
      tech: ['PHP', 'Laravel', 'Vue.js', 'MySQL', 'Redis', 'Nginx'],
      color: 'red',
      icon: <FaRocket className="text-2xl" />,
      year: '2018-2019'
    },
    {
      title: 'API Gateway & Service Mesh',
      role: 'Solution Architect',
      challenge: 'Tạo API Gateway tập trung để quản lý và bảo mật hàng trăm microservices.',
      solution: 'Kong API Gateway, service discovery với Consul, rate limiting, authentication với JWT.',
      result: 'Giảm 80% thời gian tích hợp services mới, tăng security với centralized auth.',
      tech: ['Kong', 'Consul', 'Docker', 'Kubernetes', 'Nginx', 'JWT'],
      color: 'cyan',
      icon: <FaDatabase className="text-2xl" />,
      year: '2022'
    },
    {
      title: 'CI/CD Pipeline Automation',
      role: 'DevOps Engineer & Developer',
      challenge: 'Tự động hóa quy trình build, test, và deploy cho nhiều projects đồng thời.',
      solution: 'Jenkins pipeline, Docker containerization, automated testing với Jest/PHPUnit, GitLab CI/CD.',
      result: 'Giảm thời gian deploy từ 2 giờ xuống 15 phút, tự động hóa 90% quy trình.',
      tech: ['Jenkins', 'Docker', 'GitLab CI/CD', 'Kubernetes', 'Bash', 'Python'],
      color: 'blue',
      icon: <FaCode className="text-2xl" />,
      year: '2021'
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      cyan: {
        bg: 'bg-tokyo-night-cyan/10',
        border: 'border-tokyo-night-cyan',
        text: 'text-tokyo-night-cyan',
        badge: 'bg-tokyo-night-cyan/20 text-tokyo-night-cyan border-tokyo-night-cyan/30'
      },
      blue: {
        bg: 'bg-tokyo-night-blue/10',
        border: 'border-tokyo-night-blue',
        text: 'text-tokyo-night-blue',
        badge: 'bg-tokyo-night-blue/20 text-tokyo-night-blue border-tokyo-night-blue/30'
      },
      purple: {
        bg: 'bg-tokyo-night-purple/10',
        border: 'border-tokyo-night-purple',
        text: 'text-tokyo-night-purple',
        badge: 'bg-tokyo-night-purple/20 text-tokyo-night-purple border-tokyo-night-purple/30'
      },
      green: {
        bg: 'bg-tokyo-night-green/10',
        border: 'border-tokyo-night-green',
        text: 'text-tokyo-night-green',
        badge: 'bg-tokyo-night-green/20 text-tokyo-night-green border-tokyo-night-green/30'
      },
      yellow: {
        bg: 'bg-tokyo-night-yellow/10',
        border: 'border-tokyo-night-yellow',
        text: 'text-tokyo-night-yellow',
        badge: 'bg-tokyo-night-yellow/20 text-tokyo-night-yellow border-tokyo-night-yellow/30'
      },
      red: {
        bg: 'bg-tokyo-night-red/10',
        border: 'border-tokyo-night-red',
        text: 'text-tokyo-night-red',
        badge: 'bg-tokyo-night-red/20 text-tokyo-night-red border-tokyo-night-red/30'
      }
    }
    return colors[color] || colors.cyan
  }

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 bg-tokyo-night-bg-alt/30">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Dự Án Đã Làm
          </h2>
          <p className="text-lg text-tokyo-night-fg/70 max-w-2xl mx-auto">
            Các dự án tiêu biểu trong suốt hành trình phát triển sự nghiệp
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-tokyo-night-cyan to-tokyo-night-blue mx-auto mt-4"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const colors = getColorClasses(project.color)
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-tokyo-night-bg-alt/50 hover:bg-tokyo-night-bg-alt rounded-xl p-6 border-l-4 ${colors.border} transition-all duration-300 shadow-sm hover:shadow-lg`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 ${colors.bg} rounded-lg ${colors.text}`}>
                    {project.icon}
                  </div>
                  <span className="text-xs text-tokyo-night-fg/50 font-medium">
                    {project.year}
                  </span>
                </div>

                <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>
                  {project.title}
                </h3>
                <p className="text-sm text-tokyo-night-fg/60 mb-4">
                  {project.role}
                </p>

                {/* Challenge */}
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1 text-tokyo-night-yellow flex items-center gap-1">
                    <span>🎯</span> Thách thức
                  </p>
                  <p className="text-xs text-tokyo-night-fg/70 leading-relaxed">
                    {project.challenge}
                  </p>
                </div>

                {/* Solution */}
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1 text-tokyo-night-green flex items-center gap-1">
                    <span>💡</span> Giải pháp
                  </p>
                  <p className="text-xs text-tokyo-night-fg/70 leading-relaxed">
                    {project.solution}
                  </p>
                </div>

                {/* Result */}
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-1 text-tokyo-night-cyan flex items-center gap-1">
                    <span>✨</span> Kết quả
                  </p>
                  <p className="text-xs text-tokyo-night-fg/70 leading-relaxed">
                    {project.result}
                  </p>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-tokyo-night-border">
                  {project.tech.map((tech, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${colors.badge}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-tokyo-night-bg-alt/50 rounded-lg p-4 text-center border border-tokyo-night-border">
            <div className="text-3xl font-bold text-tokyo-night-cyan mb-1">{projects.length}+</div>
            <div className="text-sm text-tokyo-night-fg/60">Dự án</div>
          </div>
          <div className="bg-tokyo-night-bg-alt/50 rounded-lg p-4 text-center border border-tokyo-night-border">
            <div className="text-3xl font-bold text-tokyo-night-blue mb-1">8+</div>
            <div className="text-sm text-tokyo-night-fg/60">Năm kinh nghiệm</div>
          </div>
          <div className="bg-tokyo-night-bg-alt/50 rounded-lg p-4 text-center border border-tokyo-night-border">
            <div className="text-3xl font-bold text-tokyo-night-purple mb-1">10B+</div>
            <div className="text-sm text-tokyo-night-fg/60">Records xử lý</div>
          </div>
          <div className="bg-tokyo-night-bg-alt/50 rounded-lg p-4 text-center border border-tokyo-night-border">
            <div className="text-3xl font-bold text-tokyo-night-green mb-1">99.9%</div>
            <div className="text-sm text-tokyo-night-fg/60">Uptime</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Projects
