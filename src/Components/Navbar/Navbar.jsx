import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import Logout from "../Logout/Logout";

function Navbar() {
  const navItems = [
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/profile", label: "Profile" },
    { path: "/quiz", label: "Quiz" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <NavLink to="/">Gyan-Yatra</NavLink>
        </div>
        <div className="nav-right">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Logout />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;