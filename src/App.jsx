import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./components/Home";
import DatabaseOptimization from "./components/DatabaseOptimization";
import SecurityNews from "./components/SecurityNews";
import Cat from "./components/Cat";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-tokyo-night-bg">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/database-optimization"
            element={<DatabaseOptimization />}
          />
          <Route path="/security-news" element={<SecurityNews />} />
        </Routes>
        <Cat />
      </div>
    </Router>
  );
}

export default App;
