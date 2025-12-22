import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "./Footer";
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaSync,
  FaClock,
} from "react-icons/fa";

const SecurityNews = () => {
  const [hackerNews, setHackerNews] = useState([]);
  const [cisaNews, setCisaNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Proxy function để tránh CORS issues
  const fetchRSS = async (url) => {
    try {
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
        url
      )}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Failed to fetch RSS");
      const data = await response.json();
      return data.items || [];
    } catch (err) {
      console.error("Error fetching RSS:", err);
      return [];
    }
  };

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hackerNewsData, cisaData] = await Promise.all([
        fetchRSS("https://feeds.feedburner.com/TheHackersNews"),
        fetchRSS("https://www.cisa.gov/uscert/ncas/current-activity.xml"),
      ]);

      setHackerNews(hackerNewsData.slice(0, 15));
      setCisaNews(cisaData.slice(0, 15));
      setLastUpdate(new Date());
    } catch (err) {
      setError("Không thể tải tin tức. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const stripHtml = (html) => {
    if (!html) return "";
    return (
      html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
        .substring(0, 150) + "..."
    );
  };

  const NewsCard = ({ item, source, index, sourceColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group bg-tokyo-night-bg-alt/50 hover:bg-tokyo-night-bg-alt rounded-xl p-5 pt-6 border-l-4 border-tokyo-night-border hover:border-tokyo-night-cyan transition-all duration-300 mb-4 shadow-sm hover:shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${sourceColor}`}
        ></div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-tokyo-night-fg mb-2 leading-tight group-hover:text-tokyo-night-cyan transition-colors">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-start gap-2"
            >
              <span className="flex-1">{item.title}</span>
              <FaExternalLinkAlt className="text-xs text-tokyo-night-fg/40 mt-1 flex-shrink-0" />
            </a>
          </h3>

          {item.description && (
            <p className="text-sm text-tokyo-night-fg/60 mb-3 leading-relaxed line-clamp-2">
              {stripHtml(item.description)}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-tokyo-night-fg/50">
            <div className="flex items-center gap-1">
              <FaClock className="text-[10px]" />
              <span>{formatDate(item.pubDate)}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                source === "THN"
                  ? "bg-tokyo-night-cyan/20 text-tokyo-night-cyan"
                  : "bg-tokyo-night-red/20 text-tokyo-night-red"
              }`}
            >
              {source}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-tokyo-night-bg pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-3">
            Tin Tức Bảo Mật
          </h1>
          <p className="text-base sm:text-lg text-tokyo-night-fg/70 max-w-2xl mx-auto mb-6">
            Cập nhật các lỗ hổng bảo mật và tin tức an ninh mạng
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={loadNews}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-tokyo-night-cyan text-tokyo-night-bg rounded-lg hover:bg-tokyo-night-cyan/90 transition-all disabled:opacity-50 font-medium text-sm shadow-lg hover:shadow-xl"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
            {lastUpdate && (
              <div className="flex items-center gap-2 text-xs text-tokyo-night-fg/50">
                <FaClock />
                <span>Cập nhật: {formatDate(lastUpdate)}</span>
              </div>
            )}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-tokyo-night-red/10 border-l-4 border-tokyo-night-red rounded-lg p-4 mb-8 text-tokyo-night-red text-sm"
          >
            {error}
          </motion.div>
        )}

        {loading && !hackerNews.length && !cisaNews.length ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tokyo-night-cyan"></div>
            <p className="mt-4 text-tokyo-night-fg/60">Đang tải tin tức...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* The Hacker News */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-6 pb-4 border-b border-tokyo-night-border"
              >
                <div className="p-2 bg-tokyo-night-cyan/20 rounded-lg">
                  <FaShieldAlt className="text-2xl text-tokyo-night-cyan" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-tokyo-night-cyan">
                    The Hacker News
                  </h2>
                  <p className="text-xs text-tokyo-night-fg/50 mt-0.5">
                    Tin tức bảo mật tổng hợp
                  </p>
                </div>
              </motion.div>

              <div className="space-y-0">
                {hackerNews.length > 0 ? (
                  hackerNews.map((item, index) => (
                    <div key={index} className="pt-1">
                      <NewsCard
                        item={item}
                        source="THN"
                        index={index}
                        sourceColor="bg-tokyo-night-cyan"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-tokyo-night-fg/40 text-sm">
                    Không có tin tức mới
                  </div>
                )}
              </div>
            </div>

            {/* CISA Alerts */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-6 pb-4 border-b border-tokyo-night-border"
              >
                <div className="p-2 bg-tokyo-night-red/20 rounded-lg">
                  <FaExclamationTriangle className="text-2xl text-tokyo-night-red" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-tokyo-night-red">
                    CISA Alerts
                  </h2>
                  <p className="text-xs text-tokyo-night-fg/50 mt-0.5">
                    Cảnh báo lỗ hổng nghiêm trọng
                  </p>
                </div>
              </motion.div>

              <div className="space-y-0">
                {cisaNews.length > 0 ? (
                  cisaNews.map((item, index) => (
                    <div key={index} className="pt-1">
                      <NewsCard
                        item={item}
                        source="CISA"
                        index={index}
                        sourceColor="bg-tokyo-night-red"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-tokyo-night-fg/40 text-sm">
                    Không có cảnh báo mới
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SecurityNews;
