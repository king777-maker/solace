import React, { useEffect, useRef, useState } from "react";

/**
 * AudioJournal.jsx
 * - Record using MediaRecorder (if available).
 * - Very simple "tone analysis": counts positive/negative words.
 * - Suggests a soundscape name to play (just an <audio> tag with looped sample URL).
 */

const POS = ["great","calm","peace","happy","okay","hope","love","joy"];
const NEG = ["sad","tired","angry","anxious","worried","down","stress","stressed","upset"];

function analyzeTone(text) {
  const t = text.toLowerCase();
  const pos = POS.reduce((n,w)=>n + (t.includes(w)?1:0), 0);
  const neg = NEG.reduce((n,w)=>n + (t.includes(w)?1:0), 0);
  const score = pos - neg;
  let mood = "Neutral";
  if (score >= 2) mood = "Upbeat";
  else if (score <= -2) mood = "Low";
  return { score, mood };
}

function pickSoundscape(mood) {
  if (mood === "Upbeat") return { name: "Breezy Meadow", url: "https://cdn.jsdelivr.net/gh/anars/blank-audio/5-seconds-of-silence.mp3" };
  if (mood === "Low") return { name: "Warm Rain", url: "https://cdn.jsdelivr.net/gh/anars/blank-audio/5-seconds-of-silence.mp3" };
  return { name: "Still Lake", url: "https://cdn.jsdelivr.net/gh/anars/blank-audio/5-seconds-of-silence.mp3" };
}

export default function AudioJournal() {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaOk, setMediaOk] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");
  const recRef = useRef(null);
  const chunks = useRef([]);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaOk(false);
    }
  }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      rec.onstop = () => {
        const b = new Blob(chunks.current, { type: "audio/webm" });
        chunks.current = [];
        setBlobUrl(URL.createObjectURL(b));
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch (e) {
      console.error(e);
      setMediaOk(false);
    }
  };

  const stop = () => {
    const rec = recRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setRecording(false);
  };

  const analyze = () => {
    // simple mock "transcription": user types notes; in a real app we'd pass audio to server.
    const { mood } = analyzeTone(transcript);
    return pickSoundscape(mood);
  };

  const suggestion = analyze();

  return (
    <div style={{ padding: 16 }}>
      <h2>Audio Journal + Soundscapes</h2>
      {!mediaOk && <div style={{color:"#b00"}}>Microphone not available in this browser.</div>}

      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <button onClick={start} disabled={!mediaOk || recording}>Start</button>
        <button onClick={stop} disabled={!recording}>Stop</button>
        {blobUrl && <a href={blobUrl} download={`audio-journal-${Date.now()}.webm`}>Download</a>}
      </div>

      {blobUrl && (
        <div>
          <audio src={blobUrl} controls />
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", fontWeight: 600 }}>Transcription (mock):</label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={6}
          style={{ width: "100%", maxWidth: 640 }}
          placeholder="Type a short summary of what you said, or paste a transcript..."
        />
      </div>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <div>Suggested Soundscape: <b>{suggestion.name}</b></div>
        <audio src={suggestion.url} loop controls />
        <div style={{ fontSize: 12, color: "#666" }}>Loops quietly; replace the URL with real audio tracks in production.</div>
      </div>
    </div>
  );
}
