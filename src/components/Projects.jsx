import { motion } from "framer-motion";
import {
  FaRocket,
  FaFacebook,
  FaTiktok,
  FaGoogle,
  FaCalendarAlt,
  FaGlobe,
  FaChartLine,
  FaTwitter,
  FaPinterest,
  FaHome,
} from "react-icons/fa";

const Projects = () => {
  const projects = [
    {
      title: "Trakpilot: Google Ads, GA4 & GTM",
      role: "Leader / Developer",
      customer: "Shopify merchants",
      description:
        "Server-side Google Tracking: Multi Google Pixels, Remarketing via Google Tag Manager (GTM), Analytics",
      challenge:
        "Xây dựng ứng dụng Shopify để tracking Google Ads, GA4 với server-side tracking, GTM integration, xử lý conversion data chính xác.",
      solution:
        "Remix Vite (Shopify source), Node.js backend, MongoDB. Multi-account Google Ads tracking, real-time analytics dashboards, ROI optimization, Enhanced Conversions (GDPR compliant).",
      result:
        "Ứng dụng hỗ trợ tracking Google Ads hiệu quả với server-side tracking, tối ưu ROI/ROAS, lower CPA, hỗ trợ hàng nghìn merchants.",
      tech: [
        "Node.js",
        "Remix",
        "Vite",
        "GraphQL",
        "Redis",
        "Kafka",
        "Elasticsearch",
        "MySQL",
      ],
      color: "green",
      icon: <FaChartLine className="text-2xl" />,
      year: "2025 - now",
      link: "https://apps.shopify.com/trakpilot-google-ads-tracking",
      teamSize: "4-14",
    },
    {
      title: "Style My Room - AI Room Decorator",
      role: "Leader",
      customer: "Shop.app users",
      description:
        "AI-powered room decoration app: Upload room photos, AI automatically decorates and suggests furniture from shop.app. Featured by Shopify as one of the innovative Shop Minis.",
      challenge:
        "Xây dựng ứng dụng mobile trên shop.app sử dụng AI để phân tích ảnh căn phòng, tự động decor và gợi ý các sản phẩm nội thất phù hợp từ shop.app.",
      solution:
        "React mobile app, Node.js backend, Gemini AI integration. Xử lý ảnh upload, AI image analysis, automatic room decoration suggestions, product recommendations từ shop.app catalog.",
      result:
        "Ứng dụng được Shopify vinh danh trong blog chính thức như một trong những Shop Minis tiên phong. Giúp users dễ dàng visualize căn phòng được decor, tăng engagement và conversion rate cho shop.app merchants.",
      tech: ["Node.js", "React", "Gemini AI"],
      color: "blue",
      icon: <FaHome className="text-2xl" />,
      year: "2025 - now",
      link: "https://shop.app/mini/style-my-room-he5w",
      teamSize: "7",
    },
    {
      title: "Omega Facebook Pixel Ad Report",
      role: "Developer",
      customer: "Shopify merchants",
      description:
        "Rise above Facebook Signal Loss with Meta Pixel, Advanced Conversion API & Facebook Product Feed",
      challenge:
        "Xây dựng ứng dụng Shopify để tracking Facebook ads với Meta Pixel và Conversion API, xử lý hàng triệu events/ngày.",
      solution:
        "React JS frontend, Laravel backend, MongoDB database, Redux state management, Webpack bundler. Tạo web pixel extensions và checkout UI extensions.",
      result:
        "Ứng dụng hỗ trợ hàng nghìn Shopify merchants, tối ưu SEO và performance, queue optimization.",
      tech: [
        "React JS",
        "PHP",
        "Laravel",
        "Node.js",
        "MongoDB",
        "Redux",
        "TypeScript",
        "React Query",
        "Webpack",
      ],
      color: "blue",
      icon: <FaFacebook className="text-2xl" />,
      year: "2021 - now",
      link: "https://apps.shopify.com/facebook-multi-pixels",
      teamSize: "4-14",
    },
    {
      title: "Twoowls - Smart Multi Pixels",
      role: "Leader / Developer",
      customer: "Wix merchants",
      description: "Track ads: Facebook, Tiktok, Snapchat, X & more",
      challenge:
        "Xây dựng ứng dụng Wix để tracking đa nền tảng (Facebook, TikTok, Snapchat, X) cho merchants.",
      solution:
        "Full-stack development với React JS, PHP Laravel, Node.js, MongoDB. Quản lý toàn bộ từ PO/BA đến DevOps.",
      result:
        "Ứng dụng hoàn chỉnh hỗ trợ tracking đa nền tảng, tự quản lý toàn bộ quy trình phát triển.",
      tech: [
        "React JS",
        "PHP",
        "Laravel",
        "Node.js",
        "MongoDB",
        "Redux",
        "Webpack",
      ],
      color: "purple",
      icon: <FaRocket className="text-2xl" />,
      year: "2024 - now",
      link: "https://www.wix.com/app-market/web-solution/omega-multi-facebook-pixels",
      teamSize: "1",
    },
    {
      title: "Omega Pixel - TikTok Pixels",
      role: "Leader / Developer",
      customer: "Shopify merchants",
      description:
        "TikTok Pixel tracking và conversion tracking cho Shopify stores",
      challenge:
        "Tích hợp TikTok Pixel vào Shopify, xử lý tracking events và conversion data.",
      solution:
        "React JS frontend, Laravel backend, MongoDB. Tạo web pixel extensions, checkout UI extensions. Tối ưu queue và performance.",
      result:
        "Ứng dụng tracking TikTok ads hiệu quả, hỗ trợ hàng nghìn merchants, tối ưu SEO và performance.",
      tech: [
        "React JS",
        "PHP",
        "Laravel",
        "Node.js",
        "MongoDB",
        "Redux",
        "Webpack",
      ],
      color: "cyan",
      icon: <FaTiktok className="text-2xl" />,
      year: "2021 - now",
      teamSize: "4-14",
    },
    {
      title: "Omega Twitter Pixel, Conversion",
      role: "Leader / Developer",
      customer: "Shopify merchants",
      description:
        "Fully track your conversions with 5 powerful events and the Multi Twitter/X Pixels conversion API",
      challenge:
        "Tích hợp Twitter/X Pixel vào Shopify với Conversion API, tracking đầy đủ customer journey từ Page View đến Purchase.",
      solution:
        "React JS frontend, Laravel backend, MongoDB. Multi-pixel tracking, Conversion API, analytics dashboard. Tạo web pixel extensions và checkout UI extensions.",
      result:
        "Ứng dụng tracking Twitter/X ads hiệu quả với Conversion API, vượt qua iOS 14.5 limitations, hỗ trợ hàng nghìn merchants.",
      tech: [
        "React JS",
        "PHP",
        "Laravel",
        "Node.js",
        "MongoDB",
        "Redux",
        "Webpack",
      ],
      color: "blue",
      icon: <FaTwitter className="text-2xl" />,
      year: "2021 - now",
      link: "https://apps.shopify.com/twitter-multi-pixels",
      teamSize: "4-14",
    },
    {
      title: "Omega - Pinterest Pixels, CAPI",
      role: "Leader / Developer",
      customer: "Shopify merchants",
      description:
        "Pinterest Tag tracking và Conversion API (CAPI) cho Shopify stores",
      challenge:
        "Tích hợp Pinterest Pixel vào Shopify với Conversion API, tracking events và conversion data chính xác.",
      solution:
        "React JS frontend, Laravel backend, MongoDB. Pinterest Tag integration, Conversion API, analytics. Tạo web pixel extensions và checkout UI extensions.",
      result:
        "Ứng dụng tracking Pinterest ads hiệu quả với CAPI, hỗ trợ hàng nghìn merchants, tối ưu performance.",
      tech: [
        "React JS",
        "PHP",
        "Laravel",
        "Node.js",
        "MongoDB",
        "Redux",
        "Webpack",
      ],
      color: "red",
      icon: <FaPinterest className="text-2xl" />,
      year: "2021 - now",
      link: "https://apps.shopify.com/pinterest-multi-pixels",
      teamSize: "4-14",
    },
    {
      title: "Omega Google Shopping Feed",
      role: "Developer",
      customer: "Shopify merchants",
      description:
        "Optimize your Google Shopping by syncing data-rich product feeds to Google Merchant hourly",
      challenge:
        "Đồng bộ product feeds từ Shopify lên Google Merchant Center với tần suất cao, xử lý hàng nghìn products.",
      solution:
        "React JS frontend, Laravel backend, Redux state management. Tối ưu code và làm việc với outsource team.",
      result:
        "Feed sync hourly thành công, tối ưu Google Shopping performance, hỗ trợ merchants tăng sales.",
      tech: ["React JS", "PHP", "Laravel", "Redux"],
      color: "green",
      icon: <FaGoogle className="text-2xl" />,
      year: "2021 - now",
      teamSize: "4-8",
    },
    {
      title: "DingDoong: Local Delivery Date",
      role: "Developer",
      customer: "Shopify merchants",
      description:
        "Plan your delivery schedule ahead with date picker for shipping, local delivery and store pickup",
      challenge:
        "Xây dựng ứng dụng Shopify để quản lý lịch giao hàng với date picker cho shipping, local delivery và store pickup.",
      solution:
        "Setup source code frontend, code frontend và backend với React JS, Laravel, Redux.",
      result:
        "Ứng dụng giúp merchants quản lý delivery schedule hiệu quả, cải thiện customer experience.",
      tech: ["React JS", "PHP", "Laravel", "Redux"],
      color: "yellow",
      icon: <FaCalendarAlt className="text-2xl" />,
      year: "2021 - 2022",
      teamSize: "4-14",
    },
    {
      title: "Website Twoowls",
      role: "Developer",
      customer: "Shopify merchants",
      description: "Twoowls Brand Marketing Website",
      challenge:
        "Xây dựng website marketing cho thương hiệu Twoowls với UI/UX hiện đại.",
      solution:
        "Frontend development với React JS, TypeScript, Bootstrap 5. Tập trung vào responsive design và performance.",
      result:
        "Website marketing chuyên nghiệp, responsive trên mọi thiết bị, load time tối ưu.",
      tech: ["React JS", "TypeScript", "Bootstrap 5"],
      color: "red",
      icon: <FaGlobe className="text-2xl" />,
      year: "2021",
      teamSize: "4-14",
    },
    {
      title: "Website Dingdoong",
      role: "Developer",
      customer: "Shopify merchants",
      description: "Dingdoong Brand Marketing Website",
      challenge: "Xây dựng website marketing cho thương hiệu Dingdoong.",
      solution: "Frontend development với React JS, TypeScript, Bootstrap 5.",
      result: "Website marketing hoàn chỉnh, tăng brand awareness.",
      tech: ["React JS", "TypeScript", "Bootstrap 5"],
      color: "cyan",
      icon: <FaGlobe className="text-2xl" />,
      year: "2021",
      teamSize: "4-14",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: {
        bg: "bg-tokyo-night-cyan/10",
        border: "border-tokyo-night-cyan",
        text: "text-tokyo-night-cyan",
        badge:
          "bg-tokyo-night-cyan/20 text-tokyo-night-cyan border-tokyo-night-cyan/30",
      },
      blue: {
        bg: "bg-tokyo-night-blue/10",
        border: "border-tokyo-night-blue",
        text: "text-tokyo-night-blue",
        badge:
          "bg-tokyo-night-blue/20 text-tokyo-night-blue border-tokyo-night-blue/30",
      },
      purple: {
        bg: "bg-tokyo-night-purple/10",
        border: "border-tokyo-night-purple",
        text: "text-tokyo-night-purple",
        badge:
          "bg-tokyo-night-purple/20 text-tokyo-night-purple border-tokyo-night-purple/30",
      },
      green: {
        bg: "bg-tokyo-night-green/10",
        border: "border-tokyo-night-green",
        text: "text-tokyo-night-green",
        badge:
          "bg-tokyo-night-green/20 text-tokyo-night-green border-tokyo-night-green/30",
      },
      yellow: {
        bg: "bg-tokyo-night-yellow/10",
        border: "border-tokyo-night-yellow",
        text: "text-tokyo-night-yellow",
        badge:
          "bg-tokyo-night-yellow/20 text-tokyo-night-yellow border-tokyo-night-yellow/30",
      },
      red: {
        bg: "bg-tokyo-night-red/10",
        border: "border-tokyo-night-red",
        text: "text-tokyo-night-red",
        badge:
          "bg-tokyo-night-red/20 text-tokyo-night-red border-tokyo-night-red/30",
      },
    };
    return colors[color] || colors.cyan;
  };

  return (
    <section
      id="projects"
      className="py-20 px-4 sm:px-6 bg-tokyo-night-bg-alt/30"
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Dự Án Đã Làm
          </h2>
          <p className="text-lg text-tokyo-night-fg/70 max-w-2xl mx-auto">
            Các dự án thực tế trong suốt hành trình phát triển sự nghiệp
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-tokyo-night-cyan to-tokyo-night-blue mx-auto mt-4"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const colors = getColorClasses(project.color);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-tokyo-night-bg-alt/50 hover:bg-tokyo-night-bg-alt rounded-xl p-6 border-l-4 ${colors.border} transition-all duration-300 shadow-sm hover:shadow-lg`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 ${colors.bg} rounded-lg ${colors.text}`}>
                    {project.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-tokyo-night-fg/50 font-medium block">
                      {project.year}
                    </span>
                    {project.teamSize && (
                      <span className="text-[10px] text-tokyo-night-fg/40">
                        Team: {project.teamSize}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>
                  {project.title}
                </h3>
                <p className="text-sm text-tokyo-night-fg/60 mb-1">
                  {project.role}
                </p>
                <p className="text-xs text-tokyo-night-fg/50 mb-3">
                  {project.customer}
                </p>

                {/* Description */}
                {project.description && (
                  <div className="mb-3">
                    <p className="text-xs text-tokyo-night-fg/70 leading-relaxed italic">
                      {project.description}
                    </p>
                  </div>
                )}

                {/* Challenge */}
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1 text-tokyo-night-yellow flex items-center gap-1">
                    <span>🎯</span> Thách thức
                  </p>
                  <p className="text-xs text-tokyo-night-fg/70 leading-relaxed">
                    {project.challenge}
                  </p>
                </div>

                {/* Solution */}
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1 text-tokyo-night-green flex items-center gap-1">
                    <span>💡</span> Giải pháp
                  </p>
                  <p className="text-xs text-tokyo-night-fg/70 leading-relaxed">
                    {project.solution}
                  </p>
                </div>

                {/* Result */}
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-1 text-tokyo-night-cyan flex items-center gap-1">
                    <span>✨</span> Kết quả
                  </p>
                  <p className="text-xs text-tokyo-night-fg/70 leading-relaxed">
                    {project.result}
                  </p>
                </div>

                {/* Link */}
                {project.link && (
                  <div className="mb-3">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-tokyo-night-cyan hover:text-tokyo-night-blue underline flex items-center gap-1"
                    >
                      Xem ứng dụng →
                    </a>
                  </div>
                )}

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-tokyo-night-border">
                  {project.tech.map((tech, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${colors.badge}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-tokyo-night-bg-alt/50 rounded-lg p-4 text-center border border-tokyo-night-border">
            <div className="text-3xl font-bold text-tokyo-night-cyan mb-1">
              {projects.length}
            </div>
            <div className="text-sm text-tokyo-night-fg/60">Dự án</div>
          </div>
          <div className="bg-tokyo-night-bg-alt/50 rounded-lg p-4 text-center border border-tokyo-night-border">
            <div className="text-3xl font-bold text-tokyo-night-blue mb-1">
              4+
            </div>
            <div className="text-sm text-tokyo-night-fg/60">
              Năm kinh nghiệm
            </div>
          </div>
          <div className="bg-tokyo-night-bg-alt/50 rounded-lg p-4 text-center border border-tokyo-night-border">
            <div className="text-3xl font-bold text-tokyo-night-purple mb-1">
              Shopify
            </div>
            <div className="text-sm text-tokyo-night-fg/60">Platform chính</div>
          </div>
          <div className="bg-tokyo-night-bg-alt/50 rounded-lg p-4 text-center border border-tokyo-night-border">
            <div className="text-3xl font-bold text-tokyo-night-green mb-1">
              Full
            </div>
            <div className="text-sm text-tokyo-night-fg/60">Stack Dev</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
