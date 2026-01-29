import { motion } from "framer-motion";
import { FaBriefcase, FaCode, FaProjectDiagram } from "react-icons/fa";

const Experience = () => {
  const experiences = [
    {
      period: "Hiện tại",
      duration: "2+ Năm",
      role: "App Leader",
      icon: FaBriefcase,
      description:
        "Dẫn dắt đội ngũ phát triển sản phẩm, chịu trách nhiệm từ khâu ý tưởng đến khi deploy.",
      focus: ["Quản lý team", "Product Strategy", "Shopify Apps development"],
      color: "cyan",
    },
    {
      period: "Quá khứ",
      duration: "2 Năm",
      role: "Solution Architect",
      icon: FaProjectDiagram,
      description: "Thiết kế kiến trúc hệ thống chịu tải cao.",
      focus: [
        "Big Data",
        "Database Optimization",
        "Microservices",
        "System Design",
      ],
      color: "blue",
    },
    {
      period: "Nền tảng",
      duration: "4 Năm",
      role: "Full Stack Developer",
      icon: FaCode,
      description:
        "Xây dựng nền tảng kỹ thuật vững chắc trên nhiều ngôn ngữ và framework.",
      focus: ["Java", "PHP", "C#", "Node.js", "Frontend & Backend logic"],
      color: "purple",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="experience" className="py-12 md:py-20 px-6 bg-tokyo-night-bg-alt/50 scrolly-section">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Kinh Nghiệm Làm Việc
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-tokyo-night-cyan to-tokyo-night-blue mx-auto"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-tokyo-night-bg p-6 rounded-lg border border-tokyo-night-purple/30 hover:border-tokyo-night-cyan/50 transition-all h-full flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <exp.icon
                    className={`text-2xl text-tokyo-night-${exp.color}`}
                  />
                  <div>
                    <h3 className="text-xl font-bold">{exp.role}</h3>
                    <p className="text-tokyo-night-fg-alt text-sm">
                      {exp.period} • {exp.duration}
                    </p>
                  </div>
                </div>
                <p className="text-tokyo-night-fg-alt mb-4 leading-relaxed text-sm flex-grow">
                  {exp.description}
                </p>
                <div>
                  <p className="text-sm font-semibold mb-2 text-tokyo-night-cyan">
                    Key Focus:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exp.focus.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-tokyo-night-bg-alt rounded-full text-xs border border-tokyo-night-purple/30"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
