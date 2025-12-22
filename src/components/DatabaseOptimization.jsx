import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaDatabase,
  FaRocket,
  FaChartLine,
  FaCog,
  FaCheckCircle,
  FaLightbulb,
  FaBook,
  FaTimes,
} from "react-icons/fa";

// Icon mapping
const iconMap = {
  FaDatabase,
  FaRocket,
  FaChartLine,
  FaCog,
  FaLightbulb,
};

const DatabaseOptimization = () => {
  const [selectedTrick, setSelectedTrick] = useState(null);
  const [trickContent, setTrickContent] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Load tricks data from public folder
    fetch("/database-optimization/index.json")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.categories) {
          setCategories(data.categories);
        }
      })
      .catch((error) => {
        console.error("Error loading tricks data:", error);
      });
  }, []);

  const loadTrickContent = async (trickFile) => {
    try {
      const response = await fetch(`/database-optimization/${trickFile}`);
      if (response.ok) {
        const content = await response.text();
        setTrickContent(content);
      } else {
        console.error("Failed to load trick content:", response.statusText);
      }
    } catch (error) {
      console.error("Error loading trick content:", error);
    }
  };

  const handleTrickClick = (trick) => {
    setSelectedTrick(trick);
    loadTrickContent(trick.file);
  };

  const closeTrickModal = () => {
    setSelectedTrick(null);
    setTrickContent(null);
  };

  return (
    <div className="min-h-screen bg-tokyo-night-bg pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-3">
            Thủ Thuật Tối Ưu Database
          </h1>
          <p className="text-base sm:text-lg text-tokyo-night-fg/70 max-w-3xl mx-auto">
            Một vài thứ tôi học được từ quá trình tìm hiểu và làm việc với
            Database
          </p>
        </motion.div>

        {/* Categories Section */}
        {categories.map((category, catIndex) => {
          const CategoryIcon = iconMap[category.icon] || FaDatabase;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: catIndex * 0.1 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`inline-flex p-3 ${category.bgColor} rounded-lg ${category.color}`}
                >
                  <CategoryIcon className="text-2xl" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${category.color}`}>
                    {category.title}
                  </h2>
                  <p className="text-sm text-tokyo-night-fg/70 mt-1">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tricks.map((trick, trickIndex) => (
                  <motion.div
                    key={trick.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: catIndex * 0.1 + trickIndex * 0.08,
                    }}
                    onClick={() => handleTrickClick(trick)}
                    className={`bg-tokyo-night-bg-alt/50 hover:bg-tokyo-night-bg-alt rounded-xl p-6 border-l-4 ${category.borderColor} transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`inline-flex p-3 ${category.bgColor} rounded-lg ${category.color}`}
                      >
                        <CategoryIcon className="text-xl" />
                      </div>
                      <FaBook
                        className={`text-sm ${category.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                      />
                    </div>

                    <h3 className={`text-lg font-bold mb-2 ${category.color}`}>
                      {trick.title}
                    </h3>

                    {trick.tags && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {trick.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-xs px-2 py-1 rounded-full bg-tokyo-night-bg border border-tokyo-night-border text-tokyo-night-fg/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-tokyo-night-fg/60 group-hover:text-tokyo-night-fg/80 transition-colors">
                      Click để xem chi tiết →
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Trick Detail Modal */}
        {selectedTrick && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={closeTrickModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-tokyo-night-bg-alt rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-tokyo-night-border"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-tokyo-night-border flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-tokyo-night-cyan mb-2">
                    {selectedTrick.title}
                  </h2>
                  {selectedTrick.tags && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTrick.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded-full bg-tokyo-night-bg border border-tokyo-night-border text-tokyo-night-fg/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={closeTrickModal}
                  className="p-2 hover:bg-tokyo-night-bg rounded-lg transition-colors text-tokyo-night-fg/70 hover:text-tokyo-night-fg"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {trickContent ? (
                  <div className="prose prose-invert max-w-none">
                    <div
                      className="text-tokyo-night-fg/80 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: trickContent
                          .replace(
                            /^# (.+)$/gm,
                            '<h1 class="text-2xl font-bold text-tokyo-night-cyan mb-4 mt-6">$1</h1>'
                          )
                          .replace(
                            /^## (.+)$/gm,
                            '<h2 class="text-xl font-bold text-tokyo-night-blue mb-3 mt-5">$1</h2>'
                          )
                          .replace(
                            /^### (.+)$/gm,
                            '<h3 class="text-lg font-semibold text-tokyo-night-purple mb-2 mt-4">$1</h3>'
                          )
                          .replace(
                            /^#### (.+)$/gm,
                            '<h4 class="text-base font-semibold text-tokyo-night-green mb-2 mt-3">$1</h4>'
                          )
                          .replace(
                            /^```sql\n([\s\S]*?)```/gm,
                            '<pre class="bg-tokyo-night-bg p-4 rounded-lg overflow-x-auto my-4 border border-tokyo-night-border"><code class="text-tokyo-night-cyan">$1</code></pre>'
                          )
                          .replace(
                            /^```([\s\S]*?)```/gm,
                            '<pre class="bg-tokyo-night-bg p-4 rounded-lg overflow-x-auto my-4 border border-tokyo-night-border"><code>$1</code></pre>'
                          )
                          .replace(
                            /`([^`]+)`/g,
                            '<code class="bg-tokyo-night-bg px-1.5 py-0.5 rounded text-tokyo-night-cyan text-sm">$1</code>'
                          )
                          .replace(
                            /^\*\* (.+)$/gm,
                            '<li class="ml-4 mb-2"><strong>$1</strong></li>'
                          )
                          .replace(
                            /^\- (.+)$/gm,
                            '<li class="ml-4 mb-2">$1</li>'
                          )
                          .replace(
                            /^✅ (.+)$/gm,
                            '<div class="flex items-start gap-2 mb-2"><span class="text-tokyo-night-green">✅</span><span>$1</span></div>'
                          )
                          .replace(
                            /^❌ (.+)$/gm,
                            '<div class="flex items-start gap-2 mb-2"><span class="text-tokyo-night-red">❌</span><span>$1</span></div>'
                          )
                          .replace(
                            /^⚠️ (.+)$/gm,
                            '<div class="flex items-start gap-2 mb-2"><span class="text-tokyo-night-yellow">⚠️</span><span>$1</span></div>'
                          )
                          .replace(/\n\n/g, '</p><p class="mb-4">')
                          .replace(
                            /^(?!<[h|p|l|d|p|s|c|u|o])(.+)$/gm,
                            '<p class="mb-4">$1</p>'
                          ),
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-tokyo-night-fg/60">
                      Đang tải nội dung...
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DatabaseOptimization;
