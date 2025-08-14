import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Logout.css"; // We'll create this CSS file

function Logout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Add a small delay for better UX
    setTimeout(() => {
      // Clear all user-related data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userData");
      
      // Redirect to login page
      navigate("/login", { replace: true });
      
      // Optional: Show a logout success message
      window.dispatchEvent(new CustomEvent("showToast", {
        detail: {
          message: "You have been logged out successfully",
          type: "success"
        }
      }));
    }, 500);
  };

  return (
    <button 
      onClick={handleLogout}
      className={`logout-button ${isLoggingOut ? "logging-out" : ""}`}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <span className="spinner"></span>
          Logging out...
        </>
      ) : (
        "Logout"
      )}
    </button>
  );
}

export default Logout;