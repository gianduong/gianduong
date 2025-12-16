import { motion } from 'framer-motion'

const TechStack = () => {
  const categories = [
    {
      title: 'Backend & Languages',
      items: ['Java (Spring Boot)', 'PHP (Laravel)', 'Node.js', 'C#', 'Go']
    },
    {
      title: 'Frontend',
      items: ['React', 'Next.js', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Shopify Polaris']
    },
    {
      title: 'Database & Big Data',
      core: ['MySQL', 'PostgreSQL', 'Oracle', 'MongoDB'],
      performance: ['Vitess', 'Elasticsearch', 'Redis', 'Apache Kafka', 'Memcached']
    },
    {
      title: 'DevOps & Cloud',
      items: ['AWS', 'Docker', 'Kubernetes (K8s)', 'Cloudflare', 'Nginx', 'Jenkins', 'GitLab CI/CD']
    },
    {
      title: 'Management Tools',
      items: ['Jira', 'Lark', 'Slack', 'Kanban Methodology']
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
    <section id="tech" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Kỹ Năng Chuyên Môn
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-tokyo-night-cyan to-tokyo-night-blue mx-auto"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-tokyo-night-bg-alt p-6 rounded-lg border border-tokyo-night-purple/30 hover:border-tokyo-night-cyan/50 transition-all"
            >
              <h3 className="text-xl font-bold mb-4 text-tokyo-night-cyan">
                {category.title}
              </h3>
              {category.items && (
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-tokyo-night-bg rounded-full text-sm border border-tokyo-night-blue/30 hover:border-tokyo-night-cyan transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
              {category.core && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-2 text-tokyo-night-fg-alt">Core:</p>
                    <div className="flex flex-wrap gap-2">
                      {category.core.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-tokyo-night-bg rounded-full text-sm border border-tokyo-night-blue/30"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2 text-tokyo-night-fg-alt">Performance & Scaling:</p>
                    <div className="flex flex-wrap gap-2">
                      {category.performance.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-tokyo-night-bg rounded-full text-sm border border-tokyo-night-purple/30"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default TechStack

