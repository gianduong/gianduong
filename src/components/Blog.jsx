import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load tricks từ database-optimization
    fetch("/database-optimization/index.json")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.categories) {
          // Lấy tất cả tricks từ tất cả categories
          const allTricks = data.categories.flatMap((category) =>
            category.tricks.map((trick) => ({
              ...trick,
              categoryTitle: category.title,
            }))
          );
          // Lấy 3 tricks đầu tiên
          setArticles(allTricks.slice(0, 3));
        }
      })
      .catch((error) => {
        console.error("Error loading database tricks:", error);
        // Fallback nếu không load được
        setArticles([]);
      });
  }, []);

  const handleArticleClick = (e, trick) => {
    e.preventDefault();
    navigate(`/database-optimization#${trick.id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section id="blog" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Bài Viết Mới Nhất
          </h2>
          <p className="text-tokyo-night-fg-alt mb-2">
            Thủ thuật tối ưu Database
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-tokyo-night-cyan to-tokyo-night-blue mx-auto"></div>
        </motion.div>

        {articles.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.id || index}
                data-trick-id={article.id}
                onClick={(e) => handleArticleClick(e, article)}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-tokyo-night-bg-alt p-6 rounded-lg border border-tokyo-night-purple/30 hover:border-tokyo-night-cyan/50 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-tokyo-night-cyan flex-1">
                    {article.title}
                  </h3>
                  <FaExternalLinkAlt className="text-tokyo-night-fg-alt ml-2 flex-shrink-0" />
                </div>
                {article.categoryTitle && (
                  <p className="text-xs text-tokyo-night-fg-alt/60 mb-2">
                    {article.categoryTitle}
                  </p>
                )}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {article.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs px-2 py-1 rounded-full bg-tokyo-night-bg border border-tokyo-night-border text-tokyo-night-fg/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-tokyo-night-fg-alt/70 mt-2">
                  Click để xem chi tiết →
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 text-tokyo-night-fg-alt/60">
            Đang tải bài viết...
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.a
            href="/database-optimization"
            onClick={(e) => {
              e.preventDefault();
              navigate("/database-optimization");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-6 py-3 border-2 border-tokyo-night-cyan text-tokyo-night-cyan rounded-lg font-semibold hover:bg-tokyo-night-cyan/10 transition-colors"
          >
            Xem Tất Cả Bài Viết
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
