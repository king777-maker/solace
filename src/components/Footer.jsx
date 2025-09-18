import React from "react";

export default function Footer() {
  return (
    <footer style={{ textAlign: "center", padding: "1rem", marginTop: "2rem", background: "#f4f4f4" }}>
      <p>© {new Date().getFullYear()} Solace | Wellness Companion 🌱</p>
    </footer>
  );
}
