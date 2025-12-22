import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiOutlineArrowDown } from "react-icons/hi";

const Hero = () => {
  const roles = [
    "Product Manager",
    "DevOps & SysAdmin",
    "Database Engineer",
    "Full Stack Developer",
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
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-tokyo-night-purple/20 via-transparent to-tokyo-night-cyan/20" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 text-center z-10"
      >
        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-7xl font-bold mb-6"
        >
          Hi, I'm <span className="text-gradient">Jun</span> 👋
        </motion.h1>

        <motion.div
          variants={itemVariants}
          className="text-2xl md:text-3xl font-semibold mb-4 h-16 flex items-center justify-center"
        >
          <TypewriterText roles={roles} />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-tokyo-night-fg-alt mb-6 italic"
        >
          "Navigating the full spectrum of the Web Development Lifecycle."
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-tokyo-night-fg-alt max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Từ việc viết những dòng code đầu tiên đến kiến trúc hệ thống xử lý
          hàng tỷ bản ghi. Tôi kết hợp tư duy sản phẩm và kỹ thuật chuyên sâu để
          biến các vấn đề phức tạp thành giải pháp đơn giản, hiệu quả và có khả
          năng mở rộng.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-tokyo-night-cyan text-tokyo-night-bg rounded-lg font-semibold hover:bg-tokyo-night-blue transition-colors"
          >
            Xem Dự Án Của Tôi
          </motion.a>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 border-2 border-tokyo-night-cyan text-tokyo-night-cyan rounded-lg font-semibold hover:bg-tokyo-night-cyan/10 transition-colors"
          >
            Tải CV / Kết nối LinkedIn
          </motion.a>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-20">
          <motion.a
            href="#about"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block"
          >
            <HiOutlineArrowDown className="text-4xl text-tokyo-night-fg-alt" />
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

const TypewriterText = ({ roles }) => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[currentRoleIndex];
    let timeout;

    if (!isDeleting && displayText.length < currentRole.length) {
      timeout = setTimeout(() => {
        setDisplayText(currentRole.slice(0, displayText.length + 1));
      }, 100);
    } else if (!isDeleting && displayText.length === currentRole.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayText(currentRole.slice(0, displayText.length - 1));
      }, 50);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentRoleIndex, roles]);

  return (
    <span className="text-gradient">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default Hero;
