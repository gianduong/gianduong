import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaGamepad, FaArrowLeft, FaRedo } from "react-icons/fa";

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

    // Draw Food
    ctx.fillStyle = "#f7768e"; // Tokyo Night Red
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);

    // Draw Snake
    ctx.fillStyle = "#9ece6a"; // Tokyo Night Green
    snake.forEach((segment, index) => {
        if (index === 0) ctx.fillStyle = "#7dcfff"; // Head color (Cyan)
        else ctx.fillStyle = "#9ece6a";
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    });

  }, [snake, food]);

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
                    {activeGame === 'snake' ? 'Rắn Săn Mồi' : 'Cờ Ca-rô'}
                </h2>

                {activeGame === 'snake' && <SnakeGame onBack={() => setActiveGame(null)} />}
                {activeGame === 'tictactoe' && <TicTacToe onBack={() => setActiveGame(null)} />}
            </div>
        )}
      </motion.div>
    </div>
  );
};

export default Games;
