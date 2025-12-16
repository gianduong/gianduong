import { motion } from 'framer-motion'
import { FaFire, FaHandshake, FaRocket } from 'react-icons/fa'

const About = () => {
  const strengths = [
    {
      icon: FaFire,
      title: 'Big Data Expert',
      description: 'Có kinh nghiệm thực chiến tối ưu hóa cơ sở dữ liệu với hàng tỷ bản ghi (Billions of records).'
    },
    {
      icon: FaHandshake,
      title: 'Versatile Leader',
      description: 'Không ngại "đội nhiều mũ" – từ việc định nghĩa yêu cầu (PO/BA), trực tiếp Coding, đến kiểm thử (Testing) để đảm bảo chất lượng bàn giao.'
    },
    {
      icon: FaRocket,
      title: 'Product Mindset',
      description: 'Đam mê xây dựng các ứng dụng có khả năng mở rộng (Scalable) và tự động hóa quy trình (DevOps).'
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
    <section id="about" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Hành Trình Của Tôi
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-tokyo-night-cyan to-tokyo-night-blue mx-auto"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12"
        >
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-tokyo-night-fg-alt leading-relaxed mb-8 text-center max-w-4xl mx-auto"
          >
            Với hơn <span className="text-tokyo-night-cyan font-semibold">8 năm kinh nghiệm</span> trong ngành phần mềm, 
            tôi đã trải qua hầu hết các vai trò: từ Developer, Tester, Solution Architect đến Product Leader. 
            Điều này cho phép tôi nhìn nhận sản phẩm từ nhiều góc độ: <span className="text-tokyo-night-blue">kỹ thuật</span>, 
            <span className="text-tokyo-night-blue"> nghiệp vụ</span> và <span className="text-tokyo-night-blue">người dùng cuối</span>.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {strengths.map((strength, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-tokyo-night-bg-alt p-6 rounded-lg border border-tokyo-night-purple/30 hover:border-tokyo-night-cyan/50 transition-all"
            >
              <strength.icon className="text-4xl text-tokyo-night-cyan mb-4" />
              <h3 className="text-xl font-bold mb-3 text-tokyo-night-cyan">
                {strength.title}
              </h3>
              <p className="text-tokyo-night-fg-alt leading-relaxed">
                {strength.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default About

