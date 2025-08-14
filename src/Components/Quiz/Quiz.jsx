import React, { useState, useEffect, useRef } from "react";
import "./Quiz.css";
import Result from "../Result/Result";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const [numQuestions, setNumQuestions] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [difficulty, setDifficulty] = useState("medium");

  const navigate = useNavigate();
  const startTime = useRef(null);
  const timerRef = useRef(null);

  const startQuiz = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    fetch(
      `http://localhost:5000/api/quiz/start?size=${numQuestions}&difficulty=${difficulty}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          throw new Error("Session expired. Please log in again.");
        }
        if (!res.ok) throw new Error(`Error fetching questions: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setQuestions(data);
        startTime.current = Date.now();
        setTimeLeft(data.length * timePerQuestion);
        setProgress(0);
        setLoading(false);
        setQuizStarted(true);
      })
      .catch((err) => {
        console.error("Fetch quiz error:", err);
        setError(err.message);
        setLoading(false);
      });
  };

  const submitToServer = async (finalAnswers) => {
    try {
      setSubmitting(true);
      clearInterval(timerRef.current);
      const token = localStorage.getItem("token");
      const timeTakenSec = Math.round(
        (Date.now() - (startTime.current || Date.now())) / 1000
      );

      const res = await fetch("http://localhost:5000/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: finalAnswers,
          timeTaken: timeTakenSec,
          difficulty,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        throw new Error("Session expired. Please log in again.");
      }
      if (!res.ok) throw new Error(`Submit failed: ${res.status}`);

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Submit quiz error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerClick = (selectedOption) => {
    const q = questions[current];
    const updated = [...answers, { qid: q._id, answer: selectedOption }];
    setAnswers(updated);
    setSelectedOption(null);

    const next = current + 1;
    if (next < questions.length) {
      setCurrent(next);
      setProgress(((next) / questions.length) * 100);
    } else {
      submitToServer(updated);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (selectedOption) {
      handleAnswerClick(selectedOption);
    }
  };

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitToServer(answers);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quizStarted, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getTimeColor = (time) => {
    const totalTime = questions.length * timePerQuestion;
    if (time < totalTime * 0.2) return "time-critical";
    if (time < totalTime * 0.5) return "time-warning";
    return "time-normal";
  };

  if (error) {
    return (
      <div className="quiz-container error-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="quiz-setup-container">
        <div className="quiz-setup-card">
          <h2>Quiz Setup</h2>
          <p>Customize your quiz experience</p>

          <div className="setup-option">
            <label>Number of Questions</label>
            <div className="slider-container">
              <input
                type="range"
                min="5"
                max="30"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              />
              <span>{numQuestions}</span>
            </div>
          </div>

          <div className="setup-option">
            <label>Time per Question (seconds)</label>
            <div className="slider-container">
              <input
                type="range"
                min="10"
                max="60"
                value={timePerQuestion}
                onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              />
              <span>{timePerQuestion}</span>
            </div>
          </div>

          <div className="setup-option">
            <label>Difficulty Level</label>
            <div className="difficulty-buttons">
              {["easy", "medium", "hard"].map((level) => (
                <button
                  key={level}
                  className={difficulty === level ? "active" : ""}
                  onClick={() => setDifficulty(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            className="start-quiz-button"
            onClick={startQuiz}
            disabled={loading}
          >
            {loading ? <LoadingSpinner small /> : "Start Quiz"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="quiz-loading-container">
        <LoadingSpinner />
        <p>Preparing your quiz...</p>
      </div>
    );
  }

  if (result) return <Result result={result} />;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="quiz-info">
          <div className="question-counter">
            Question {current + 1} of {questions.length}
          </div>
          <div className={`timer ${getTimeColor(timeLeft)}`}>
            <i className="fas fa-clock"></i> {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="question-container">
        <h3 className="question-text">{questions[current].questionText}</h3>
        
        <div className="options-grid">
          {questions[current].options.map((option, i) => (
            <div
              key={i}
              className={`option-card ${
                selectedOption === option ? "selected" : ""
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="option-letter">
                {String.fromCharCode(65 + i)}
              </div>
              <div className="option-text">{option}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-footer">
        <button
          className="next-button"
          onClick={handleNextQuestion}
          disabled={!selectedOption || submitting}
        >
          {current === questions.length - 1
            ? submitting
              ? "Submitting..."
              : "Submit Quiz"
            : "Next Question"}
        </button>
      </div>
    </div>
  );
}

export default Quiz;