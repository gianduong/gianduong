import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaGamepad, FaArrowLeft, FaRedo } from "react-icons/fa";
import JavaGameDirect from "./JavaGameDirect";

// --- Components ---

const GameCard = ({ title, description, icon, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-tokyo-night-bg-alt p-6 rounded-lg shadow-lg border border-tokyo-night-border cursor-pointer flex flex-col items-center text-center hover:border-tokyo-night-cyan transition-colors"
    onClick={onClick}
  >
    <div className="text-4xl text-tokyo-night-cyan mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-tokyo-night-blue mb-2">{title}</h3>
    <p className="text-tokyo-night-fg-alt">{description}</p>
  </motion.div>
);

const SnakeGame = ({ onBack }) => {
  const CANVAS_SIZE = 400;
  const GRID_SIZE = 20;
  const SPEED = 100;

  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 }); // Start static
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem("snakeHighScore")) || 0);

  const canvasRef = useRef(null);

  // Handle Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        setGameStarted(true);
        setDirection({ x: 1, y: 0 }); // Default start direction
      }

      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, gameStarted]);

  // Game Loop
  useEffect(() => {
    if (gameOver || !gameStarted) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const newHead = {
          x: prevSnake[0].x + direction.x,
          y: prevSnake[0].y + direction.y,
        };

        // Check Wall Collision
        if (
          newHead.x < 0 ||
          newHead.x >= CANVAS_SIZE / GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= CANVAS_SIZE / GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check Self Collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check Food Collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 1);
          generateFood(newSnake);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, SPEED);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, gameStarted]);

  // Update High Score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score);
    }
  }, [score, highScore]);

  const generateFood = (currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      };
      // eslint-disable-next-line no-loop-func
      const isOnSnake = currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    setFood(newFood);
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 0, y: 0 });
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
  };

  // Draw Canvas
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Grid Background with darker lines
    ctx.strokeStyle = "rgba(125, 207, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE / GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
      ctx.stroke();
    }

    // Draw Food with glow and pulse animation
    const time = Date.now() / 200;
    const pulse = Math.sin(time) * 0.15 + 0.85;
    
    // Food outer glow
    const foodGlowGradient = ctx.createRadialGradient(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      0,
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE * 0.8
    );
    foodGlowGradient.addColorStop(0, "rgba(247, 118, 142, 0.4)");
    foodGlowGradient.addColorStop(1, "rgba(247, 118, 142, 0)");
    
    ctx.fillStyle = foodGlowGradient;
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE * 0.7 * pulse,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Food main body with 3D effect
    const foodGradient = ctx.createRadialGradient(
      food.x * GRID_SIZE + GRID_SIZE / 2 - 3,
      food.y * GRID_SIZE + GRID_SIZE / 2 - 3,
      2,
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2
    );
    foodGradient.addColorStop(0, "#ff9db5");
    foodGradient.addColorStop(0.5, "#f7768e");
    foodGradient.addColorStop(1, "#d94371");
    
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2 - 1,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Food highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE / 2.5,
      food.y * GRID_SIZE + GRID_SIZE / 2.5,
      GRID_SIZE / 5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Snake Body First (from tail to neck)
    for (let i = snake.length - 1; i > 0; i--) {
      const segment = snake[i];
      const centerX = segment.x * GRID_SIZE + GRID_SIZE / 2;
      const centerY = segment.y * GRID_SIZE + GRID_SIZE / 2;
      const radius = GRID_SIZE / 2 - 1;
      
      // Calculate fade for tail
      const fadeRatio = i / snake.length;
      const segmentRadius = radius * (0.7 + fadeRatio * 0.3);
      
      // Special tail rendering for last segment
      if (i === snake.length - 1) {
        // Calculate tail direction (opposite of next segment)
        const nextSegment = snake[i - 1];
        const tailDirX = segment.x - nextSegment.x;
        const tailDirY = segment.y - nextSegment.y;
        
        let tailAngle = 0;
        if (tailDirX === 1) tailAngle = 0; // Right
        else if (tailDirX === -1) tailAngle = Math.PI; // Left
        else if (tailDirY === 1) tailAngle = Math.PI / 2; // Down
        else if (tailDirY === -1) tailAngle = -Math.PI / 2; // Up
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(tailAngle);
        
        // Tail shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.beginPath();
        ctx.ellipse(1, 2, segmentRadius * 1.2, segmentRadius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail gradient
        const tailGradient = ctx.createRadialGradient(
          -segmentRadius / 3,
          -segmentRadius / 3,
          segmentRadius / 4,
          0,
          0,
          segmentRadius
        );
        
        const lightGreen = `rgba(158, 206, 106, 0.95)`;
        const midGreen = `rgba(134, 180, 92, 0.95)`;
        const darkGreen = `rgba(110, 154, 78, 0.9)`;
        
        tailGradient.addColorStop(0, lightGreen);
        tailGradient.addColorStop(0.5, midGreen);
        tailGradient.addColorStop(1, darkGreen);
        
        ctx.fillStyle = tailGradient;
        
        // Draw teardrop/pointed tail shape
        ctx.beginPath();
        ctx.moveTo(segmentRadius * 1.5, 0); // Tip point
        ctx.quadraticCurveTo(segmentRadius / 2, -segmentRadius, -segmentRadius / 2, -segmentRadius * 0.7);
        ctx.quadraticCurveTo(-segmentRadius, 0, -segmentRadius / 2, segmentRadius * 0.7);
        ctx.quadraticCurveTo(segmentRadius / 2, segmentRadius, segmentRadius * 1.5, 0);
        ctx.closePath();
        ctx.fill();
        
        // Tail highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.ellipse(-segmentRadius / 4, -segmentRadius / 4, segmentRadius / 3, segmentRadius / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        continue;
      }
      
      // Body shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.arc(centerX + 1, centerY + 2, segmentRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Body 3D gradient (top-lit sphere effect)
      const bodyGradient = ctx.createRadialGradient(
        centerX - segmentRadius / 3,
        centerY - segmentRadius / 3,
        segmentRadius / 4,
        centerX,
        centerY,
        segmentRadius
      );
      
      // Green snake colors with variation
      const lightGreen = `rgba(158, 206, 106, ${0.9 + fadeRatio * 0.1})`;
      const midGreen = `rgba(134, 180, 92, ${0.9 + fadeRatio * 0.1})`;
      const darkGreen = `rgba(110, 154, 78, ${0.8 + fadeRatio * 0.2})`;
      
      bodyGradient.addColorStop(0, lightGreen);
      bodyGradient.addColorStop(0.5, midGreen);
      bodyGradient.addColorStop(1, darkGreen);
      
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, segmentRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Scale pattern on body
      if (i % 2 === 0) {
        ctx.fillStyle = "rgba(110, 154, 78, 0.3)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, segmentRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Highlight on top
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.arc(centerX - segmentRadius / 3, centerY - segmentRadius / 3, segmentRadius / 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Snake Head (triangular/diamond shape)
    if (snake.length > 0) {
      const head = snake[0];
      const centerX = head.x * GRID_SIZE + GRID_SIZE / 2;
      const centerY = head.y * GRID_SIZE + GRID_SIZE / 2;
      const headSize = GRID_SIZE * 0.6;
      
      // Determine head orientation
      let angle = 0;
      if (direction.x === 1) angle = 0; // Right
      else if (direction.x === -1) angle = Math.PI; // Left
      else if (direction.y === 1) angle = Math.PI / 2; // Down
      else if (direction.y === -1) angle = -Math.PI / 2; // Up
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      // Head shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.moveTo(headSize, 0);
      ctx.lineTo(-headSize / 2, -headSize / 1.5);
      ctx.lineTo(-headSize / 2, headSize / 1.5);
      ctx.closePath();
      ctx.fill();
      
      // Head main body with gradient
      const headGradient = ctx.createLinearGradient(-headSize / 2, 0, headSize, 0);
      headGradient.addColorStop(0, "#2ac3de");
      headGradient.addColorStop(0.5, "#7dcfff");
      headGradient.addColorStop(1, "#5fb4d4");
      
      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.moveTo(headSize, 0); // Nose point
      ctx.lineTo(-headSize / 2, -headSize / 1.5); // Top left
      ctx.lineTo(-headSize / 2, headSize / 1.5); // Bottom left
      ctx.closePath();
      ctx.fill();
      
      // Head outline for definition
      ctx.strokeStyle = "rgba(42, 195, 222, 0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Head highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.moveTo(headSize * 0.3, 0);
      ctx.lineTo(-headSize / 3, -headSize / 3);
      ctx.lineTo(-headSize / 3, headSize / 3);
      ctx.closePath();
      ctx.fill();
      
      // Draw Eyes (larger and more prominent)
      const eyeOffsetX = headSize * 0.2;
      const eyeOffsetY = headSize * 0.4;
      const eyeRadius = 3.5;
      
      // Eye sockets (white)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(eyeOffsetX, -eyeOffsetY, eyeRadius + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius + 1, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye pupils (black)
      ctx.fillStyle = "#1a1b26";
      ctx.beginPath();
      ctx.arc(eyeOffsetX, -eyeOffsetY, eyeRadius - 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius - 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye highlights (white dots)
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(eyeOffsetX + 1, -eyeOffsetY - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeOffsetX + 1, eyeOffsetY - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Tongue (when moving)
      if (direction.x !== 0 || direction.y !== 0) {
        const tongueFlicker = Math.sin(Date.now() / 100) * 2;
        ctx.strokeStyle = "#f7768e";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(headSize, 0);
        ctx.lineTo(headSize + 8, -3 + tongueFlicker);
        ctx.moveTo(headSize, 0);
        ctx.lineTo(headSize + 8, 3 - tongueFlicker);
        ctx.stroke();
      }
      
      ctx.restore();
    }

  }, [snake, food, direction]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4">
        <div className="text-tokyo-night-fg">Điểm: <span className="text-tokyo-night-yellow font-bold">{score}</span></div>
        <div className="text-tokyo-night-fg">Cao nhất: <span className="text-tokyo-night-purple font-bold">{highScore}</span></div>
      </div>

      <div className="relative border-4 border-tokyo-night-border rounded-lg overflow-hidden bg-tokyo-night-bg-alt">
         <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
        />
        {(!gameStarted && !gameOver) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold">
                Nhấn mũi tên để bắt đầu
            </div>
        )}
        {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <h2 className="text-3xl font-bold text-tokyo-night-red mb-4">Game Over!</h2>
                <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-4 py-2 bg-tokyo-night-blue text-tokyo-night-bg font-bold rounded hover:bg-tokyo-night-cyan transition-colors"
                >
                    <FaRedo /> Chơi Lại
                </button>
            </div>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <button onClick={onBack} className="text-tokyo-night-fg hover:text-tokyo-night-cyan underline">
           Quay lại menu
        </button>
      </div>
       <p className="mt-4 text-sm text-tokyo-night-fg-alt hidden md:block">Sử dụng các phím mũi tên để di chuyển</p>
    </div>
  );
};

const TicTacToe = ({ onBack }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  const handleClick = (i) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-xl font-bold text-tokyo-night-fg">
        {winner ? (
            <span className="text-tokyo-night-green">Người thắng: {winner}</span>
        ) : isDraw ? (
            <span className="text-tokyo-night-yellow">Hòa!</span>
        ) : (
            <span>Lượt của: <span className={xIsNext ? "text-tokyo-night-blue" : "text-tokyo-night-red"}>{xIsNext ? "X" : "O"}</span></span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-tokyo-night-border p-2 rounded-lg">
        {board.map((square, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-20 h-20 sm:w-24 sm:h-24 bg-tokyo-night-bg-alt flex items-center justify-center text-4xl font-bold rounded
                ${square === 'X' ? 'text-tokyo-night-blue' : 'text-tokyo-night-red'}
                ${!square && !winner ? 'hover:bg-tokyo-night-bg' : ''}
            `}
            onClick={() => handleClick(i)}
            disabled={!!square || !!winner}
          >
            {square}
          </motion.button>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button
            onClick={resetGame}
            className="flex items-center gap-2 px-4 py-2 bg-tokyo-night-purple text-tokyo-night-bg font-bold rounded hover:bg-tokyo-night-red transition-colors"
        >
            <FaRedo /> Reset
        </button>
         <button onClick={onBack} className="text-tokyo-night-fg hover:text-tokyo-night-cyan underline px-4 py-2">
           Quay lại menu
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const Games = () => {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!activeGame ? (
          <>
            <h1 className="text-4xl font-bold text-gradient mb-8 text-center">Góc Giải Trí</h1>
            <p className="text-center text-tokyo-night-fg-alt mb-12 max-w-2xl mx-auto">
              Thư giãn với các trò chơi cổ điển. Chọn một trò chơi bên dưới để bắt đầu!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <GameCard
                title="Rắn Săn Mồi"
                description="Trò chơi kinh điển. Ăn mồi để dài ra nhưng đừng đụng vào tường!"
                icon={<div className="font-mono font-bold">🐍</div>}
                onClick={() => setActiveGame("snake")}
              />
              <GameCard
                title="Cờ Ca-rô (Tic Tac Toe)"
                description="Thách đấu trí tuệ. Xếp 3 ô thẳng hàng để chiến thắng."
                icon={<div className="font-mono font-bold">❌⭕</div>}
                onClick={() => setActiveGame("tictactoe")}
              />
              <GameCard
                title="Game Java (J2ME)"
                description="Chơi game Java như Ninja School ngay trên trình duyệt!"
                icon={<div className="font-mono font-bold">📱</div>}
                onClick={() => setActiveGame("javagame")}
              />
            </div>
          </>
        ) : (
            <div className="flex flex-col items-center">
                <div className="w-full max-w-4xl mb-6">
                    <button
                        onClick={() => setActiveGame(null)}
                        className="flex items-center gap-2 text-tokyo-night-fg hover:text-tokyo-night-cyan transition-colors"
                    >
                        <FaArrowLeft /> Chọn game khác
                    </button>
                </div>

                <h2 className="text-3xl font-bold text-tokyo-night-purple mb-8">
                    {activeGame === 'snake' ? 'Rắn Săn Mồi' : activeGame === 'tictactoe' ? 'Cờ Ca-rô' : 'Game Java (J2ME)'}
                </h2>

                {activeGame === 'snake' && <SnakeGame onBack={() => setActiveGame(null)} />}
                {activeGame === 'tictactoe' && <TicTacToe onBack={() => setActiveGame(null)} />}
                {activeGame === 'javagame' && <JavaGameDirect onBack={() => setActiveGame(null)} />}
            </div>
        )}
      </motion.div>
    </div>
  );
};

export default Games;
