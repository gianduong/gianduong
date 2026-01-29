import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { HiOutlineArrowDown } from "react-icons/hi";
import Prism from "./Prism";

const Hero = () => {
  const roles = [
    "Product Manager",
    "DevOps & SysAdmin",
    "Database Engineer",
    "Full Stack Developer",
  ];

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });
      cursorX.set(clientX - 16);
      cursorY.set(clientY - 16);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      },
    },
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        />
      </div>

      {/* Custom Cursor Glow */}
      <motion.div
        className="fixed w-8 h-8 rounded-full bg-tokyo-night-cyan/50 blur-xl pointer-events-none z-50 mix-blend-screen"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 text-center z-10 relative"
      >
        {/* Floating Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-block mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            className="px-6 py-2 rounded-full bg-tokyo-night-cyan/10 border border-tokyo-night-cyan/30 backdrop-blur-sm"
          >
            <span className="text-tokyo-night-cyan font-semibold">✨ Available for opportunities</span>
          </motion.div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl font-bold mb-6 relative"
        >
          Hi, I'm{" "}
          <motion.span 
            className="inline-block relative"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          >
            <span className="text-gradient-animated bg-gradient-to-r from-tokyo-night-cyan via-tokyo-night-blue to-tokyo-night-purple bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Jun
            </span>
            <motion.span
              className="absolute -top-4 -right-8 text-4xl"
              animate={{ rotate: [0, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👋
            </motion.span>
          </motion.span>
        </motion.h1>

        <motion.div
          variants={itemVariants}
          className="text-2xl md:text-4xl font-semibold mb-6 h-20 flex items-center justify-center"
        >
          <TypewriterText roles={roles} />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-base md:text-lg text-tokyo-night-fg-alt mb-6 italic relative"
        >
          <span className="relative inline-block">
            <span className="absolute inset-0 bg-gradient-to-r from-tokyo-night-cyan/20 to-tokyo-night-purple/20 blur-lg"></span>
            <span className="relative">"Navigating the full spectrum of the Web Development Lifecycle."</span>
          </span>
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-tokyo-night-fg-alt max-w-3xl mx-auto mb-12 leading-relaxed"
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
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(125, 207, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="group px-8 py-4 bg-gradient-to-r from-tokyo-night-cyan to-tokyo-night-blue text-tokyo-night-bg rounded-lg font-semibold relative overflow-hidden"
          >
            <span className="relative z-10">Xem Dự Án Của Tôi</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-purple"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(125, 207, 255, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-tokyo-night-cyan text-tokyo-night-cyan rounded-lg font-semibold hover:bg-tokyo-night-cyan/10 transition-all backdrop-blur-sm"
          >
            Tải CV / Kết nối LinkedIn
          </motion.a>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-20">
          <motion.a
            href="#about"
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="inline-block"
            whileHover={{ scale: 1.2 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-tokyo-night-cyan/30 rounded-full blur-xl"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <HiOutlineArrowDown className="text-5xl text-tokyo-night-cyan relative" />
            </div>
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
    <div className="relative inline-block">
      <motion.span 
        className="bg-gradient-to-r from-tokyo-night-cyan via-tokyo-night-blue to-tokyo-night-purple bg-clip-text text-transparent"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% auto" }}
      >
        {displayText}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-tokyo-night-cyan"
        >
          |
        </motion.span>
      </motion.span>
    </div>
  );
};

export default Hero;
