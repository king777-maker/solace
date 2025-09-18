import React, { useState } from "react";

export default function PrivacyToggle() {
  const [isPrivate, setIsPrivate] = useState(true);

  return (
    <div>
      <p>Privacy: {isPrivate ? "Private 🔒" : "Public 🌍"}</p>
      <button onClick={() => setIsPrivate(!isPrivate)}>
        Toggle Privacy
      </button>
    </div>
  );
}
