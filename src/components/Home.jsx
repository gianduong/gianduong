import { motion, useScroll, useTransform } from "framer-motion";
import Hero from "./Hero";
import About from "./About";
import Experience from "./Experience";
import TechStack from "./TechStack";
import Certificates from "./Certificates";
import Projects from "./Projects";
import Blog from "./Blog";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";

const ScrollytellingSection = ({ children, chapter, title }) => (
  <div className="min-h-screen flex flex-col justify-center relative py-24 px-6 scrolly-section-layer">
    {chapter && (
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px", amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute top-24 left-6 md:left-12 flex items-center gap-3"
      >
        <span className="text-6xl md:text-8xl font-bold text-tokyo-night-cyan/10">
          {chapter}
        </span>
        {title && (
          <span className="text-sm md:text-base text-tokyo-night-fg-alt font-medium uppercase tracking-widest">
            {title}
          </span>
        )}
      </motion.div>
    )}
    <div className="container mx-auto max-w-6xl relative z-10">{children}</div>
  </div>
);

const Home = () => {
  const { scrollYProgress } = useScroll();
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      {/* Scroll progress bar - top (scaleX = compositor-only, mượt hơn width) */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-tokyo-night-border z-50 scroll-ui-layer"
        style={{ originX: 0 }}
      >
        <motion.div
          className="h-full w-full bg-gradient-to-r from-tokyo-night-cyan via-tokyo-night-blue to-tokyo-night-purple"
          style={{ scaleX: progressScaleX, transformOrigin: "left" }}
        />
      </motion.div>

      {/* Section navigation - left side (dùng chung scrollYProgress, ít listener hơn) */}
      <ScrollProgress scrollYProgress={scrollYProgress} />

      {/* Hero - Chapter 0 */}
      <section id="hero" className="min-h-screen scrolly-section">
        <Hero />
      </section>

      {/* About - Chapter 1 */}
      <ScrollytellingSection chapter="01" title="Hành trình">
        <About />
      </ScrollytellingSection>

      {/* Experience - Chapter 2 */}
      <ScrollytellingSection chapter="02" title="Kinh nghiệm">
        <Experience />
      </ScrollytellingSection>

      {/* TechStack - Chapter 3 */}
      <ScrollytellingSection chapter="03" title="Kỹ năng">
        <TechStack />
      </ScrollytellingSection>

      {/* Certificates - Chapter 4 */}
      <ScrollytellingSection chapter="04" title="Chứng chỉ">
        <Certificates />
      </ScrollytellingSection>

      {/* Projects - Chapter 5 */}
      <ScrollytellingSection chapter="05" title="Dự án">
        <Projects />
      </ScrollytellingSection>

      {/* Blog - Chapter 6 */}
      <ScrollytellingSection chapter="06" title="Bài viết">
        <Blog />
      </ScrollytellingSection>

      {/* Contact - Chapter 7 */}
      <section id="contact" className="scrolly-section">
        <Footer />
      </section>
    </>
  );
};

export default Home;
