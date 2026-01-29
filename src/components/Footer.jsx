import { motion } from "framer-motion";
import {
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaDev,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  const socialLinks = [
    {
      icon: FaLinkedin,
      url: "https://linkedin.com/in/nguyengianduong",
      label: "LinkedIn",
    },
    { icon: FaGithub, url: "https://github.com/gianduong", label: "GitHub" },
    {
      icon: FaFacebook,
      url: "https://fb.com/nguyengianduong",
      label: "Facebook",
    },
    { icon: FaDev, url: "https://dev.to/jun", label: "Dev.to" },
  ];

  return (
    <footer
      id="contact"
      className="py-12 px-6 bg-tokyo-night-bg-alt/50 border-t border-tokyo-night-purple/30 scrolly-section"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2 text-gradient">Jun</h3>
            <p className="text-tokyo-night-fg-alt mb-2">
              Product Manager & Full Stack Developer
            </p>
            <p className="text-sm text-tokyo-night-fg-alt/70">
              Email:{" "}
              <a
                href="mailto:gduongit9@example.com"
                className="hover:text-tokyo-night-cyan transition-colors"
              >
                gduongit9@example.com
              </a>
            </p>
            <p className="text-sm text-tokyo-night-fg-alt/70">
              Location: Hà Nội, Việt Nam
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <div className="flex gap-4 mb-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-2xl text-tokyo-night-fg-alt hover:text-tokyo-night-cyan transition-colors"
                >
                  <link.icon />
                </motion.a>
              ))}
            </div>
            <p className="text-sm text-tokyo-night-fg-alt/70">
              Built with Vite, React & Tailwind CSS
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-tokyo-night-purple/30 text-center">
          <p className="text-sm text-tokyo-night-fg-alt/70">
            © {new Date().getFullYear()} Jun. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
