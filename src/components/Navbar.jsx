import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const SECTIONS = ["hero", "about", "experience", "tech", "certificates", "projects", "blog", "contact"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll spy - highlight active section
  useEffect(() => {
    if (location.pathname !== "/") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-tokyo-night-bg-alt/90 backdrop-blur-sm shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xl font-bold text-gradient cursor-pointer"
            >
              Jun
            </motion.div>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link
              to="/"
              className={`hover:text-tokyo-night-cyan transition-colors ${
                isActive("/") && location.hash === ""
                  ? "text-tokyo-night-cyan"
                  : ""
              }`}
            >
              Trang Chủ
            </Link>
            <Link
              to="/database-optimization"
              className={`hover:text-tokyo-night-cyan transition-colors ${
                isActive("/database-optimization")
                  ? "text-tokyo-night-cyan"
                  : ""
              }`}
            >
              Tối Ưu DB
            </Link>
            <Link
              to="/security-news"
              className={`hover:text-tokyo-night-cyan transition-colors ${
                isActive("/security-news") ? "text-tokyo-night-cyan" : ""
              }`}
            >
              Tin Bảo Mật
            </Link>
            <Link
              to="/games"
              className={`hover:text-tokyo-night-cyan transition-colors ${
                isActive("/games") ? "text-tokyo-night-cyan" : ""
              }`}
            >
              Giải Trí
            </Link>
            {location.pathname === "/" ? (
              <>
                <a
                  href="#about"
                  className={`hover:text-tokyo-night-cyan transition-colors ${activeSection === "about" ? "text-tokyo-night-cyan" : ""}`}
                >
                  Về Tôi
                </a>
                <a
                  href="#experience"
                  className={`hover:text-tokyo-night-cyan transition-colors ${activeSection === "experience" ? "text-tokyo-night-cyan" : ""}`}
                >
                  Kinh Nghiệm
                </a>
                <a
                  href="#tech"
                  className={`hover:text-tokyo-night-cyan transition-colors ${activeSection === "tech" ? "text-tokyo-night-cyan" : ""}`}
                >
                  Kỹ Năng
                </a>
                <a
                  href="#projects"
                  className={`hover:text-tokyo-night-cyan transition-colors ${activeSection === "projects" ? "text-tokyo-night-cyan" : ""}`}
                >
                  Dự Án
                </a>
                <a
                  href="#blog"
                  className={`hover:text-tokyo-night-cyan transition-colors ${activeSection === "blog" ? "text-tokyo-night-cyan" : ""}`}
                >
                  Blog
                </a>
                <a
                  href="#contact"
                  className={`hover:text-tokyo-night-cyan transition-colors ${activeSection === "contact" ? "text-tokyo-night-cyan" : ""}`}
                >
                  Liên Hệ
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/#about"
                  className="hover:text-tokyo-night-cyan transition-colors"
                >
                  Về Tôi
                </Link>
                <Link
                  to="/#experience"
                  className="hover:text-tokyo-night-cyan transition-colors"
                >
                  Kinh Nghiệm
                </Link>
                <Link
                  to="/#tech"
                  className="hover:text-tokyo-night-cyan transition-colors"
                >
                  Kỹ Năng
                </Link>
                <Link
                  to="/#projects"
                  className="hover:text-tokyo-night-cyan transition-colors"
                >
                  Dự Án
                </Link>
                <Link
                  to="/#blog"
                  className="hover:text-tokyo-night-cyan transition-colors"
                >
                  Blog
                </Link>
                <Link
                  to="/#contact"
                  className="hover:text-tokyo-night-cyan transition-colors"
                >
                  Liên Hệ
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
