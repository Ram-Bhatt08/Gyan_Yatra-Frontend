import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Result.css";
import Confetti from "react-confetti";
import { FiAward, FiUser, FiHome, FiRepeat } from "react-icons/fi";

const API_BASE_URL = "https://gyan-yatra-backend.onrender.com";

function Result({ result, score, total }) {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  const username = localStorage.getItem("username") || "Guest";
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);

  const display = result
    ? {
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        scorePercent: result.scorePercent,
        topicStats: result.topicStats || {},
      }
    : {
        correctAnswers: score ?? 0,
        totalQuestions: total ?? 0,
        scorePercent: Math.round(((score ?? 0) / (total ?? 1)) * 100),
        topicStats: {},
      };

  // Save quiz result to backend
  useEffect(() => {
    if (!result || !token) return;

    const saveResult = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/quiz/save-result`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: display.correctAnswers,
            totalQuestions: display.totalQuestions,
            scorePercent: display.scorePercent,
            topicStats: display.topicStats,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to save result");
        }
      } catch (error) {
        console.error("Error saving quiz result:", error);
      } finally {
        setIsLoading(false);
      }
    };

    saveResult();
  }, [result, token, display]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePlayAgain = () => {
    localStorage.removeItem("currentQuiz");
    localStorage.removeItem("quizProgress");
    navigate("/quiz");
  };

  const handleGoProfile = () => {
    navigate("/profile");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const getPerformanceMessage = () => {
    const percentage = display.scorePercent;
    if (percentage >= 90) return "Outstanding! 🎯";
    if (percentage >= 70) return "Great job! 👍";
    if (percentage >= 50) return "Good effort! 💪";
    return "Keep practicing! 📚";
  };

  return (
    <div className="result-container">
      {display.scorePercent >= 70 && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="result-card">
        <div className="result-header">
          <h2>Quiz Results</h2>
          <p className="performance-message">{getPerformanceMessage()}</p>
        </div>

        <div className="user-info">
          <FiUser className="icon" />
          <span>{username}</span>
        </div>

        <div className="score-display">
          <div className="score-circle">
            <div className="circle-progress" style={{
              '--percentage': `${display.scorePercent}%`
            }}>
              <span>{display.scorePercent}%</span>
            </div>
          </div>
          <p className="score-details">
            {display.correctAnswers} out of {display.totalQuestions} correct
          </p>
        </div>

        {Object.keys(display.topicStats).length > 0 && (
          <div className="topic-stats">
            <h3>Topic Breakdown</h3>
            <div className="stats-grid">
              {Object.entries(display.topicStats).map(([topic, correct]) => (
                <div key={topic} className="stat-item">
                  <div className="topic-name">{topic}</div>
                  <div className="topic-score">
                    <span>{correct}</span>
                    <span>/{display.totalQuestions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="result-actions">
          <button 
            className="btn primary" 
            onClick={handlePlayAgain}
            disabled={isLoading}
          >
            <FiRepeat className="icon" />
            {isLoading ? "Saving..." : "Play Again"}
          </button>
          <button className="btn secondary" onClick={handleGoProfile}>
            <FiAward className="icon" />
            View Profile
          </button>
          <button className="btn tertiary" onClick={handleGoHome}>
            <FiHome className="icon" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Result;
