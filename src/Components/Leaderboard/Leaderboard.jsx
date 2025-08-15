import { useEffect, useState } from "react";
import "./Leaderboard.css";

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("https://gyan-yatra-backend.onrender.com/api/leaderboard");
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const data = await res.json();
      setLeaders(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Refresh leaderboard after quiz completion
    const handleQuizCompleted = () => fetchLeaderboard();
    window.addEventListener("quizCompleted", handleQuizCompleted);

    return () => {
      window.removeEventListener("quizCompleted", handleQuizCompleted);
    };
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaders.length > 0 ? (
            leaders.map((leader, index) => (
              <tr key={index}>
                <td>{leader.rank || index + 1}</td>
                <td>{leader.username}</td>
                <td>{leader.score}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No leaderboard data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
