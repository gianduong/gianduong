import { motion } from 'framer-motion'
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa'

const Projects = () => {
  const projects = [
    {
      title: 'Hệ thống Tracking e-Commerce',
      role: 'Solution Architect & Lead Dev',
      challenge: 'Xử lý dữ liệu tracking của hàng triệu user/ngày, database phình to nhanh chóng.',
      solution: 'Sử dụng Kafka để stream dữ liệu, Vitess để sharding MySQL, ElasticSearch để search nhanh.',
      result: 'Hệ thống chạy ổn định với hàng tỷ bản ghi, giảm độ trễ query xuống dưới 100ms.',
      tech: ['Kafka', 'Vitess', 'MySQL', 'Java'],
      color: 'cyan'
    },
    {
      title: 'Shopify App Platform',
      role: 'App Leader & Product Manager',
      challenge: 'Xây dựng nền tảng ứng dụng Shopify có khả năng mở rộng và dễ bảo trì.',
      solution: 'Kiến trúc microservices với Node.js, React, và Shopify Polaris. Tự động hóa CI/CD với GitLab.',
      result: 'Nền tảng hỗ trợ hàng nghìn merchants, thời gian deploy giảm 70%.',
      tech: ['Node.js', 'React', 'Shopify Polaris', 'Docker', 'Kubernetes'],
      color: 'blue'
    },
    {
      title: 'Big Data Analytics System',
      role: 'Solution Architect',
      challenge: 'Xử lý và phân tích hàng tỷ bản ghi dữ liệu trong thời gian thực.',
      solution: 'Pipeline xử lý dữ liệu với Kafka, lưu trữ phân tán với MongoDB, cache với Redis.',
      result: 'Hệ thống xử lý được 10+ tỷ events/ngày với độ trễ < 1s.',
      tech: ['Kafka', 'MongoDB', 'Redis', 'Elasticsearch', 'Go'],
      color: 'purple'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <section id="projects" className="py-20 px-6 bg-tokyo-night-bg-alt/50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Dự Án Tiêu Biểu
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-tokyo-night-cyan to-tokyo-night-blue mx-auto"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {projects.map((project, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-tokyo-night-bg p-8 rounded-lg border border-tokyo-night-purple/30 hover:border-tokyo-night-cyan/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-tokyo-night-cyan">
                    {project.title}
                  </h3>
                  <p className="text-tokyo-night-fg-alt">{project.role}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-semibold mb-1 text-tokyo-night-yellow">
                    🎯 Thách thức:
                  </p>
                  <p className="text-tokyo-night-fg-alt">{project.challenge}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1 text-tokyo-night-green">
                    💡 Giải pháp:
                  </p>
                  <p className="text-tokyo-night-fg-alt">{project.solution}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1 text-tokyo-night-cyan">
                    ✨ Kết quả:
                  </p>
                  <p className="text-tokyo-night-fg-alt">{project.result}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1 bg-tokyo-night-bg-alt rounded-full text-sm border border-tokyo-night-${project.color}/30`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Projects

