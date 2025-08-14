import React, { useEffect, useState } from "react";
import "./Profile.css";
import Logout from "../Logout/Logout";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiAward, FiBarChart2, FiTrendingUp } from "react-icons/fi";

function Profile() {
  const [user, setUser] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    accuracy: 0,
    averageScore: 0,
    improvement: 0
  });
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch all data in parallel where possible
      const [profileRes, leaderboardRes, statsRes] = await Promise.all([
        fetch("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5000/api/leaderboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5000/api/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      if (!profileRes.ok) throw new Error("Failed to fetch profile data");
      const profileData = await profileRes.json();
      setUser(profileData.user);

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        const userRank = leaderboardData.findIndex(
          (entry) => entry.username === profileData.user.username
        );
        setRank(userRank !== -1 ? userRank + 1 : null);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          accuracy: statsData.accuracy || 0,
          averageScore: statsData.averageScore || 0,
          improvement: statsData.improvement || 0
        });
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching profile:", err);
      
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleQuizCompleted = () => {
      fetchProfile();
      // Show a temporary success message
      const event = new CustomEvent("showToast", {
        detail: {
          message: "Profile updated with your latest results!",
          type: "success"
        }
      });
      window.dispatchEvent(event);
    };

    window.addEventListener("quizCompleted", handleQuizCompleted);
    return () => window.removeEventListener("quizCompleted", handleQuizCompleted);
  }, []);

  if (loading) {
    return (
      <div className="profile-loading">
        <LoadingSpinner />
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error-card">
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          <button onClick={fetchProfile}>Retry</button>
          <Logout />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-empty">
        <p>No profile data available.</p>
        <button onClick={() => navigate("/login")}>Log In</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card profile-info">
          <h2><FiUser /> Basic Information</h2>
          <div className="info-item">
            <span>Username:</span>
            <strong>{user.username}</strong>
          </div>
          <div className="info-item">
            <span>Email:</span>
            <strong>{user.email}</strong>
          </div>
        </div>

        <div className="profile-card profile-stats">
          <h2><FiBarChart2 /> Quiz Statistics</h2>
          <div className="stat-item">
            <div className="stat-value">{user.quizzesPlayed || 0}</div>
            <div className="stat-label">Quizzes Played</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{user.highestScore || 0}</div>
            <div className="stat-label">Highest Score</div>
          </div>
        </div>

        <div className="profile-card profile-rank">
          <h2><FiTrendingUp /> Ranking</h2>
          {rank ? (
            <>
              <div className="rank-badge">#{rank}</div>
              <p>Global Leaderboard Position</p>
            </>
          ) : (
            <p className="no-rank">Complete a quiz to get ranked!</p>
          )}
        </div>
      </div>

      <div className="profile-actions">
        <button 
          className="btn-primary"
          onClick={() => navigate('/quiz')}
        >
          Take New Quiz
        </button>
      </div>
    </div>
  );
}

export default Profile;