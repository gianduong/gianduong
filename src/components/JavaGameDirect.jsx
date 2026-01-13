import { useState } from "react";
import { motion } from "framer-motion";
import { FaKeyboard} from "react-icons/fa";

const JavaGameDirect = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Keyboard Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-4xl mb-6"
      >
        <div className="bg-tokyo-night-bg-alt p-4 rounded-lg border border-tokyo-night-border">
          <div className="flex items-center gap-2 mb-3">
            <FaKeyboard className="text-tokyo-night-yellow" />
            <h3 className="font-bold text-tokyo-night-yellow">Phím điều khiển</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-tokyo-night-cyan font-mono font-bold">↑ ↓ ← →</span>
              <p className="text-tokyo-night-fg-alt">Di chuyển</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono font-bold">Enter</span>
              <p className="text-tokyo-night-fg-alt">Chọn/OK</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono font-bold">F1 / Q</span>
              <p className="text-tokyo-night-fg-alt">Phím trái</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono font-bold">F2 / W</span>
              <p className="text-tokyo-night-fg-alt">Phím phải</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono font-bold">0-9</span>
              <p className="text-tokyo-night-fg-alt">Số</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono font-bold">Esc</span>
              <p className="text-tokyo-night-fg-alt">Menu/Settings</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono font-bold">E / R</span>
              <p className="text-tokyo-night-fg-alt">* / #</p>
            </div>
            <div>
              <span className="text-tokyo-night-cyan font-mono font-bold">Numpad</span>
              <p className="text-tokyo-night-fg-alt">Số (bàn phím số)</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Emulator Iframe */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-4xl mb-6 relative"
      >
        <div className="bg-tokyo-night-bg-alt p-6 rounded-lg border-2 border-tokyo-night-border">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-tokyo-night-bg-alt rounded-lg z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-tokyo-night-cyan mx-auto mb-4"></div>
                <p className="text-tokyo-night-fg-alt text-lg">Đang tải emulator...</p>
                <p className="text-tokyo-night-fg-alt text-sm mt-2">
                  Vui lòng đợi, FreeJ2ME đang khởi động
                </p>
              </div>
            </div>
          )}
          
          <iframe
            src="https://zb3.github.io/freej2me-web/"
            className="w-full h-[600px] md:h-[700px] rounded-lg border-0 bg-white"
            title="FreeJ2ME Web Emulator"
            onLoad={handleIframeLoad}
            allow="clipboard-read; clipboard-write"
            style={{ minHeight: '600px' }}
          />
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

export default JavaGameDirect;
