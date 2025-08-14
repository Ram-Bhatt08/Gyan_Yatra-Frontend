// src/components/LoadingSpinner/LoadingSpinner.js
import "./LoadingSpinner.css";

function LoadingSpinner({ small = false }) {
  return (
    <div className={`spinner-container ${small ? "small" : ""}`}>
      <div className="loading-spinner"></div>
    </div>
  );
}

export default LoadingSpinner;