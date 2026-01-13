import { useState } from "react";
import { motion } from "framer-motion";
import { FaDownload, FaKeyboard, FaGamepad } from "react-icons/fa";

const JavaGame = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mb-6"
      >
        <h2 className="text-3xl font-bold text-tokyo-night-purple mb-4">
          🎮 J2ME Game Emulator
        </h2>
        <p className="text-tokyo-night-fg-alt mb-4">
          Chơi game Java (J2ME) ngay trên trình duyệt với FreeJ2ME Emulator
        </p>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-6xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Download Section */}
        <div className="bg-tokyo-night-bg-alt p-4 rounded-lg border border-tokyo-night-border">
          <div className="flex items-center gap-2 mb-3">
            <FaDownload className="text-tokyo-night-cyan" />
            <h3 className="font-bold text-tokyo-night-cyan">Bước 1: Tải Game</h3>
          </div>
          <p className="text-sm text-tokyo-night-fg-alt mb-3">
            Tải file game Ninja School hoặc sử dụng file JAR của bạn:
          </p>
          <a
            href="/java-game/Ninja-School-2.jar"
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-tokyo-night-purple text-white rounded hover:bg-tokyo-night-blue transition-colors"
          >
            <FaDownload />
            Tải Ninja School 2
          </a>
        </div>

        {/* Upload Section */}
        <div className="bg-tokyo-night-bg-alt p-4 rounded-lg border border-tokyo-night-border">
          <div className="flex items-center gap-2 mb-3">
            <FaGamepad className="text-tokyo-night-green" />
            <h3 className="font-bold text-tokyo-night-green">Bước 2: Chơi Game</h3>
          </div>
          <p className="text-sm text-tokyo-night-fg-alt mb-2">
            Trong emulator bên dưới:
          </p>
          <ol className="text-sm text-tokyo-night-fg-alt list-decimal list-inside space-y-1">
            <li>Click "Choose File" ở mục "Add new game"</li>
            <li>Chọn file JAR vừa tải</li>
            <li>Click "Run" để chơi</li>
          </ol>
        </div>
      </motion.div>

      {/* Keyboard Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-6xl mb-6"
      >
        <div className="bg-tokyo-night-bg-alt p-4 rounded-lg border border-tokyo-night-border">
          <div className="flex items-center gap-2 mb-3">
            <FaKeyboard className="text-tokyo-night-yellow" />
            <h3 className="font-bold text-tokyo-night-yellow">Phím điều khiển</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-tokyo-night-cyan font-mono">↑ ↓ ← →</span>
              <p className="text-tokyo-night-fg-alt">Di chuyển</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono">Enter</span>
              <p className="text-tokyo-night-fg-alt">Chọn/OK</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono">F1 / Q</span>
              <p className="text-tokyo-night-fg-alt">Phím trái</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono">F2 / W</span>
              <p className="text-tokyo-night-fg-alt">Phím phải</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono">0-9</span>
              <p className="text-tokyo-night-fg-alt">Số</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono">Esc</span>
              <p className="text-tokyo-night-fg-alt">Menu/Tùy chọn</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Emulator Iframe */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-6xl mb-6 relative"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-tokyo-night-bg-alt rounded-lg border border-tokyo-night-border z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tokyo-night-cyan mx-auto mb-4"></div>
              <p className="text-tokyo-night-fg-alt">Đang tải emulator...</p>
            </div>
          </div>
        )}
        
        <iframe
          src="https://zb3.github.io/freej2me-web/"
          className="w-full h-[600px] md:h-[700px] rounded-lg border-2 border-tokyo-night-border bg-white"
          title="J2ME Emulator"
          onLoad={handleIframeLoad}
          allow="clipboard-read; clipboard-write"
        />
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-6xl mb-6"
      >
        <div className="bg-tokyo-night-bg-alt p-4 rounded-lg border border-tokyo-night-yellow/30">
          <p className="text-sm text-tokyo-night-fg-alt">
            <span className="text-tokyo-night-yellow font-bold">💡 Lưu ý:</span>{" "}
            Emulator chạy hoàn toàn trên trình duyệt của bạn. Dữ liệu game được lưu trong browser storage.
            Nếu game không hoạt động, thử thay đổi cài đặt (phone type, display size) trong emulator.
          </p>
        </div>
      </motion.div>

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={onBack}
          className="text-tokyo-night-fg hover:text-tokyo-night-cyan underline"
        >
          ← Quay lại danh sách games
        </button>
      </div>
    </div>
  );
};

export default JavaGame;
