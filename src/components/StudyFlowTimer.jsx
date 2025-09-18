import React, { useState, useEffect } from "react";

export default function StudyFlowTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h3>Study Flow Timer</h3>
      <p>Time Elapsed: {seconds}s</p>
    </div>
  );
}
