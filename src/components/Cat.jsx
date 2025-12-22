import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const Cat = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [particles, setParticles] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);
  const [showCoconuts, setShowCoconuts] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleClick = () => {
    setIsClicked(true);
    setClickCount((prev) => prev + 1);

    // Tạo particles
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      emoji: ["🐾", "✨", "⭐", "💫", "🌟", "🎉", "😸", "🎊"][
        Math.floor(Math.random() * 8)
      ],
    }));
    setParticles(newParticles);

    // Reset sau animation
    setTimeout(() => {
      setIsClicked(false);
      setTimeout(() => setParticles([]), 1000);
    }, 2000);
  };

  const handleYarnClick = (e) => {
    e.stopPropagation(); // Ngăn trigger click của mèo

    // Tạo mưa sao băng
    const stars = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: -50,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      size: Math.random() * 20 + 15,
    }));
    setShootingStars(stars);

    // Reset sau animation
    setTimeout(() => {
      setShootingStars([]);
    }, 4000);
  };

  const handleGrassClick = (e) => {
    e.stopPropagation(); // Ngăn trigger click của mèo
    e.preventDefault();

    setShowCoconuts(true);

    // Ẩn cây dừa sau 5 giây
    setTimeout(() => {
      setShowCoconuts(false);
    }, 5000);
  };

  return (
    <>
      {/* Coconut trees container - full screen */}
      {showCoconuts && (
        <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {/* Left coconut tree */}
            <motion.div
              key="left-coconut"
              initial={{ x: -200, y: "100%", scale: 0 }}
              animate={{ x: 20, y: "calc(100% - 150px)", scale: 1 }}
              exit={{ x: -200, scale: 0 }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
              }}
              className="absolute bottom-0 text-6xl"
            >
              🌴
            </motion.div>

            {/* Right coconut tree */}
            <motion.div
              key="right-coconut"
              initial={{ x: "100%", y: "100%", scale: 0 }}
              animate={{
                x: "calc(100% - 80px)",
                y: "calc(100% - 150px)",
                scale: 1,
              }}
              exit={{ x: "100%", scale: 0 }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: 0.2,
              }}
              className="absolute bottom-0 text-6xl"
            >
              🌴
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Shooting stars container - full screen */}
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {shootingStars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute text-2xl"
              initial={{
                x: star.x,
                y: star.y,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: star.x + (Math.random() * 200 - 100),
                y: window.innerHeight + 100,
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                rotate: [0, 360],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: star.duration,
                delay: star.delay,
                ease: "easeIn",
              }}
            >
              ⭐
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        className="fixed bottom-4 left-4 z-40 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="relative">
          {/* Grass under cat */}
          <div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 cursor-pointer"
            onClick={handleGrassClick}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-lg"
            >
              🌱
            </motion.div>
            <motion.div
              animate={{
                rotate: [0, -5, 5, 0],
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="text-lg"
            >
              🌿
            </motion.div>
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
              className="text-lg"
            >
              🍀
            </motion.div>
            <motion.div
              animate={{
                rotate: [0, -5, 5, 0],
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                duration: 2.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9,
              }}
              className="text-lg"
            >
              🌱
            </motion.div>
          </div>

          {/* Particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute text-2xl pointer-events-none"
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  rotate: [0, 360],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  ease: "easeOut",
                }}
              >
                {particle.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Cat body */}
          <motion.div
            className="relative"
            animate={
              isClicked
                ? {
                    y: [0, -80, 0],
                    rotate: [0, 720, 0],
                    scale: [1, 1.3, 1],
                  }
                : {
                    y: [0, -5, 0],
                  }
            }
            transition={
              isClicked
                ? {
                    duration: 0.8,
                    ease: "easeOut",
                  }
                : {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            {/* Cat ears */}
            <div className="absolute -top-2 left-2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-tokyo-night-fg/80"></div>
            <div className="absolute -top-2 right-2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-tokyo-night-fg/80"></div>

            {/* Cat head */}
            <motion.div
              className="w-12 h-10 bg-tokyo-night-fg/80 rounded-full relative"
              animate={
                isClicked
                  ? {
                      rotate: [0, -20, 20, -20, 0],
                      scale: [1, 1.2, 1],
                    }
                  : isHovered
                  ? { rotate: [0, -10, 10, -10, 0] }
                  : {}
              }
              transition={{ duration: isClicked ? 0.8 : 0.3 }}
            >
              {/* Eyes */}
              <motion.div
                className="absolute top-3 left-3 w-2 h-2 bg-tokyo-night-cyan rounded-full"
                animate={
                  isClicked
                    ? {
                        scale: [1, 1.5, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(6, 182, 212, 0)",
                          "0 0 20px 10px rgba(6, 182, 212, 0.8)",
                          "0 0 0 0 rgba(6, 182, 212, 0)",
                        ],
                      }
                    : {
                        scaleY: [1, 0.1, 1],
                      }
                }
                transition={{
                  duration: isClicked ? 0.8 : 3,
                  repeat: isClicked ? 0 : Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute top-3 right-3 w-2 h-2 bg-tokyo-night-cyan rounded-full"
                animate={
                  isClicked
                    ? {
                        scale: [1, 1.5, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(6, 182, 212, 0)",
                          "0 0 20px 10px rgba(6, 182, 212, 0.8)",
                          "0 0 0 0 rgba(6, 182, 212, 0)",
                        ],
                      }
                    : {
                        scaleY: [1, 0.1, 1],
                      }
                }
                transition={{
                  duration: isClicked ? 0.8 : 3,
                  repeat: isClicked ? 0 : Infinity,
                  ease: "easeInOut",
                  delay: isClicked ? 0 : 0.1,
                }}
              />
              {/* Nose */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-tokyo-night-purple rounded-full"></div>
              {/* Mouth */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="w-3 h-2 border-b-2 border-tokyo-night-purple rounded-b-full"></div>
              </div>
            </motion.div>

            {/* Cat body */}
            <motion.div
              className="w-14 h-8 bg-tokyo-night-fg/80 rounded-full -mt-2 relative"
              animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {/* Paws */}
              <motion.div
                className="absolute -bottom-1 left-2 w-3 h-2 bg-tokyo-night-fg/80 rounded-full"
                animate={{
                  x: [0, 2, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-1 right-2 w-3 h-2 bg-tokyo-night-fg/80 rounded-full"
                animate={{
                  x: [0, -2, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />
            </motion.div>

            {/* Tail */}
            <motion.div
              className="absolute -right-2 top-4 w-1 h-8 bg-tokyo-night-fg/80 rounded-full origin-top"
              animate={
                isClicked
                  ? {
                      rotate: [0, 180, -180, 0],
                    }
                  : {
                      rotate: [0, 15, -15, 0],
                    }
              }
              transition={{
                duration: isClicked ? 0.8 : 2,
                repeat: isClicked ? 0 : Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Yarn ball */}
          <motion.div
            className="absolute -bottom-2 -left-4 w-4 h-4 bg-tokyo-night-purple/60 rounded-full cursor-pointer z-10"
            onClick={handleYarnClick}
            animate={{
              x: [0, 3, 0],
              y: [0, -2, 0],
              rotate: [0, 180, 360],
            }}
            whileHover={{
              scale: 1.3,
            }}
            whileTap={{
              scale: 0.9,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-tokyo-night-purple/40 to-tokyo-night-purple/80 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-tokyo-night-purple rounded-full"></div>
            </div>
          </motion.div>

          {/* Thought bubble on hover */}
          {isHovered && !isClicked && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute bottom-full left-0 mb-2 bg-tokyo-night-bg-alt border border-tokyo-night-cyan/50 rounded-lg px-3 py-2 text-xs text-tokyo-night-fg whitespace-nowrap"
            >
              Meow! 🐾
              <div className="absolute top-full left-4 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-tokyo-night-bg-alt"></div>
            </motion.div>
          )}

          {/* Special message on click */}
          <AnimatePresence>
            {isClicked && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: -100 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 bg-gradient-to-r from-tokyo-night-purple to-tokyo-night-cyan border-2 border-tokyo-night-cyan rounded-xl px-6 py-4 text-center whitespace-nowrap"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 2,
                  }}
                  className="text-2xl mb-2"
                >
                  {clickCount === 1
                    ? "Wow! 😸"
                    : clickCount === 2
                    ? "Again! 🎉"
                    : clickCount === 3
                    ? "You're fun! 🎊"
                    : clickCount === 5
                    ? "Cat Power! ⚡"
                    : clickCount === 10
                    ? "Purrfect! 🌟"
                    : "Meow! 🐾"}
                </motion.div>
                <div className="text-xs text-tokyo-night-fg/80">
                  Click count: {clickCount}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default Cat;
