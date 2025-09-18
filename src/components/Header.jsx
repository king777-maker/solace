import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const mainLinks = [
  { to: "/", label: "Home" },
  { to: "/journal", label: "Journal" },
  { to: "/daily-mood", label: "Daily Mood" },
  { to: "/community", label: "Community" },
  { to: "/analytics", label: "Analytics" },
];

const moreLinks = [
  { to: "/audio-journal", label: "Audio Journal" },
  { to: "/eco-wellness", label: "Eco Wellness" },
  { to: "/emotional-wardrobe", label: "Emotional Wardrobe" },
  { to: "/finance-overlay", label: "Finance Overlay" },
  { to: "/growth-garden", label: "Growth Garden" },
  { to: "/growth-portfolio", label: "Growth Portfolio" },
  { to: "/handsfree-journal", label: "Hands-Free Journal" },
  { to: "/legacy-journal", label: "Legacy Journal" },
  { to: "/meal-reflection", label: "Meal Reflection" },
  { to: "/mood-journal", label: "Mood Journal" },
  { to: "/studyflow-sync", label: "StudyFlow Sync" },
  { to: "/vision-board", label: "Vision Board" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <header className="header">
      <nav className="nav">
        {/* Logo */}
        <h2 className="logo">🌱 Solace</h2>

        {/* Hamburger Menu (for mobile) */}
        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </div>

        {/* Main Navigation Links */}
        <div className={`nav-links-wrapper ${isMenuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            {mainLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} onClick={() => setIsMenuOpen(false)}>{link.label}</Link>
              </li>
            ))}
            
            {/* "More" Dropdown Button */}
            <li className="more-dropdown">
              <button className="more-btn" onClick={() => setIsMoreOpen(!isMoreOpen)}>
                More ▼
              </button>
              {isMoreOpen && (
                <ul className="dropdown-menu">
                  {moreLinks.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} onClick={() => {
                        setIsMenuOpen(false);
                        setIsMoreOpen(false);
                      }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}