import { motion, useScroll } from "framer-motion";

const SECTIONS = [
  { id: "hero", label: "Trang chủ" },
  { id: "about", label: "Về tôi" },
  { id: "experience", label: "Kinh nghiệm" },
  { id: "tech", label: "Kỹ năng" },
  { id: "certificates", label: "Chứng chỉ" },
  { id: "projects", label: "Dự án" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Liên hệ" },
];

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center">
      {/* Vertical progress track */}
      <div className="relative w-1 h-32 bg-tokyo-night-border/50 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 w-full bg-gradient-to-b from-tokyo-night-cyan to-tokyo-night-purple rounded-full"
          style={{
            height: "100%",
            scaleY: scrollYProgress,
            transformOrigin: "top",
          }}
        />
      </div>

      {/* Section dots - clickable */}
      <div className="flex flex-col gap-3 mt-4">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group flex items-center gap-2 text-left"
            aria-label={`Đi tới ${section.label}`}
          >
            <div className="w-2 h-2 rounded-full bg-tokyo-night-border group-hover:bg-tokyo-night-cyan group-hover:scale-125 transition-all flex-shrink-0" />
            <span className="text-[10px] text-tokyo-night-fg-alt opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {section.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScrollProgress;
