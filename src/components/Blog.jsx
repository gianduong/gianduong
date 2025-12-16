import { motion } from 'framer-motion'
import { FaExternalLinkAlt } from 'react-icons/fa'

const Blog = () => {
  // Placeholder articles - in production, you would fetch from Dev.to API
  const articles = [
    {
      title: 'Optimizing Database Performance with Billions of Records',
      excerpt: 'Chiến lược tối ưu hóa database khi xử lý hàng tỷ bản ghi, từ indexing đến sharding...',
      url: 'https://dev.to/jun',
      date: '2024-01-15'
    },
    {
      title: 'Building Scalable Microservices Architecture',
      excerpt: 'Kinh nghiệm xây dựng kiến trúc microservices có khả năng mở rộng cao với Kafka và Kubernetes...',
      url: 'https://dev.to/jun',
      date: '2024-01-10'
    },
    {
      title: 'From Developer to Product Leader: My Journey',
      excerpt: 'Chia sẻ hành trình chuyển đổi từ developer sang product leader và những bài học quý giá...',
      url: 'https://dev.to/jun',
      date: '2024-01-05'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    <section id="blog" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Bài Viết Mới Nhất
          </h2>
          <p className="text-tokyo-night-fg-alt mb-2">Latest from Dev.to</p>
          <div className="w-24 h-1 bg-gradient-to-r from-tokyo-night-cyan to-tokyo-night-blue mx-auto"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {articles.map((article, index) => (
            <motion.a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-tokyo-night-bg-alt p-6 rounded-lg border border-tokyo-night-purple/30 hover:border-tokyo-night-cyan/50 transition-all block"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-tokyo-night-cyan flex-1">
                  {article.title}
                </h3>
                <FaExternalLinkAlt className="text-tokyo-night-fg-alt ml-2 flex-shrink-0" />
              </div>
              <p className="text-tokyo-night-fg-alt mb-4 leading-relaxed">
                {article.excerpt}
              </p>
              <p className="text-sm text-tokyo-night-fg-alt/70">
                {new Date(article.date).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.a
            href="https://dev.to/jun"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-6 py-3 border-2 border-tokyo-night-cyan text-tokyo-night-cyan rounded-lg font-semibold hover:bg-tokyo-night-cyan/10 transition-colors"
          >
            Xem Tất Cả Bài Viết
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default Blog

