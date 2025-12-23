import { motion } from "framer-motion";
import {
  FaCertificate,
  FaGraduationCap,
  FaExternalLinkAlt,
} from "react-icons/fa";

const Certificates = () => {
  const certificates = [
    {
      title: "Wecommit 100X Hiệu năng",
      organization: "Wecommit",
      date: "2025",
      icon: FaGraduationCap,
      color: "cyan",
      description:
        "Hiểu sâu về Database, làm chủ tư duy tối ưu. Framework tối ưu đã được kiểm chứng qua hàng chục hệ thống lớn, cách phân tích tận gốc bản chất hoạt động của Database.",
      link: "",
    },
    {
      title: "Node.js, Express & MongoDB Bootcamp",
      organization: "Udemy",
      date: "2025",
      icon: FaCertificate,
      color: "blue",
      description:
        "Khóa học toàn diện về Node.js, Express.js và MongoDB. Xây dựng RESTful APIs, authentication, và các ứng dụng web hiện đại.",
      link: "",
    },
    {
      title: "SSL Complete Guide",
      organization: "Udemy",
      date: "2025",
      icon: FaCertificate,
      color: "purple",
      description:
        "Khóa học toàn diện về SSL/TLS, bảo mật website, cấu hình HTTPS, và các best practices về bảo mật web.",
      link: "",
    },
    {
      title: "DEVELOPMENT AND OPERATIONS SYSTEM",
      organization: "VTI ACADEMY",
      date: "Tháng 7, 2025",
      icon: FaGraduationCap,
      color: "cyan",
      description:
        "Khóa học về Development và Operations System, bao gồm DevOps practices, CI/CD, và quản lý hệ thống.",
      link: "https://drive.google.com/file/d/1e_sQa_iwVLYb0wBHMTdDyqLbvNw7yiZd/view?usp=drive_link",
    },
    {
      title: "Apache Kafka for Event-Driven Spring Boot Microservices",
      organization: "Udemy",
      date: "27 tháng 6, 2025",
      icon: FaCertificate,
      color: "blue",
      description:
        "Khóa học về Apache Kafka cho Event-Driven Architecture với Spring Boot Microservices.",
      link: "https://drive.google.com/file/d/1410bdsDzHmdDFCJjarUerqzOWF0e2Df1/view?usp=drive_link",
    },
    {
      title: "NGINX Fundamentals: High Performance Servers from Scratch",
      organization: "Udemy",
      date: "23 tháng 12, 2025",
      icon: FaCertificate,
      color: "purple",
      description:
        "Khóa học về NGINX từ cơ bản đến nâng cao, xây dựng high-performance servers.",
      link: "https://drive.google.com/file/d/1Sv2kCYRpXQQL1j8hcPJu2SXU9KHFZDQ0/view?usp=drive_link",
    },
    {
      title: "Complete Web & Mobile Designer in 2023: UI/UX, Figma, +more",
      organization: "Udemy",
      date: "17 tháng 4, 2023",
      icon: FaCertificate,
      color: "cyan",
      description:
        "Khóa học toàn diện về Web & Mobile Design, UI/UX, Figma và các công cụ thiết kế khác.",
      link: "https://drive.google.com/file/d/1Sv2kCYRpXQQL1j8hcPJu2SXU9KHFZDQ0/view?usp=drive_link",
    },
    {
      title: "DevOps on AWS",
      organization: "CODESTAR ACADEMY",
      date: "Tháng 4, 2024",
      icon: FaGraduationCap,
      color: "blue",
      description:
        "Khóa học về DevOps trên nền tảng AWS, bao gồm CI/CD, containerization, và cloud infrastructure.",
      link: "https://drive.google.com/file/d/1ptifYtSK35f-WOfIWFxw6Kvnxkci2LLs/view?usp=drive_link",
    },
    {
      title: "SYSTEM ADMIN",
      organization: "VTI ACADEMY",
      date: "Tháng 11, 2024",
      icon: FaCertificate,
      color: "purple",
      description:
        "Khóa học quản trị hệ thống, bao gồm quản lý server, network, và bảo mật hệ thống.",
      link: "https://drive.google.com/file/d/1NJ2rhEW7ptFATn1fCqq2gqSIilsD7bAT/view?usp=drive_link",
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="certificates" className="py-20 px-6 bg-tokyo-night-bg-alt/50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Khóa Học Đã Tham Gia
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-tokyo-night-cyan to-tokyo-night-blue mx-auto"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {certificates.map((cert, index) => {
            const IconComponent = cert.icon;
            const bgColorClass =
              cert.color === "cyan"
                ? "bg-tokyo-night-cyan/10 border-tokyo-night-cyan/30"
                : cert.color === "blue"
                ? "bg-tokyo-night-blue/10 border-tokyo-night-blue/30"
                : "bg-tokyo-night-purple/10 border-tokyo-night-purple/30";
            const iconColorClass =
              cert.color === "cyan"
                ? "text-tokyo-night-cyan"
                : cert.color === "blue"
                ? "text-tokyo-night-blue"
                : "text-tokyo-night-purple";
            const CardContent = (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-2 rounded-lg border ${bgColorClass} flex-shrink-0`}
                  >
                    <IconComponent className={`text-xl ${iconColorClass}`} />
                  </div>
                  {cert.link && (
                    <FaExternalLinkAlt className="text-tokyo-night-cyan/60 text-sm flex-shrink-0" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 text-tokyo-night-cyan leading-tight">
                  {cert.title}
                </h3>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <p className="text-sm text-tokyo-night-fg-alt font-semibold">
                    {cert.organization}
                  </p>
                  <span className="text-tokyo-night-fg-alt/40">•</span>
                  <p className="text-sm text-tokyo-night-fg-alt/70">
                    {cert.date}
                  </p>
                </div>
                <p className="text-sm text-tokyo-night-fg-alt leading-relaxed">
                  {cert.description}
                </p>
              </>
            );

            return cert.link ? (
              <motion.a
                key={index}
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-tokyo-night-bg p-6 rounded-lg border border-tokyo-night-purple/30 hover:border-tokyo-night-cyan/50 transition-all block cursor-pointer"
              >
                {CardContent}
              </motion.a>
            ) : (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-tokyo-night-bg p-6 rounded-lg border border-tokyo-night-purple/30 hover:border-tokyo-night-cyan/50 transition-all"
              >
                {CardContent}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Certificates;
