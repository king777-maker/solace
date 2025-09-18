import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Chip,
  Typography,
  Toolbar,
  AppBar,
  TextField,
  InputAdornment,
  Tooltip,
  Divider,
  Switch,
  useTheme,
  CssBaseline,
  Stack,
  Avatar,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Tag as TagIcon,
} from "@mui/icons-material";

// --- Crypto and Utility Code unchanged (except encryptJSON template literal fix) ---

const STORAGE_KEY = "wj_entries_v2";
const SALT_KEY = "wj_kdf_salt_v1";
const PASS_KEY = "wj_pass_hint_v1";

const MOODS = [
  { id: "happy", label: "Happy", emoji: "😊", color: "gold" },
  { id: "calm", label: "Calm", emoji: "😌", color: "skyblue" },
  { id: "meh", label: "Meh", emoji: "😐", color: "grey" },
  { id: "sad", label: "Sad", emoji: "😔", color: "cornflowerblue" },
  { id: "angry", label: "Angry", emoji: "😡", color: "red" },
  { id: "anxious", label: "Anxious", emoji: "😰", color: "purple" },
  { id: "confident", label: "Confident", emoji: "😎", color: "seagreen" },
];

const uid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const debounce = (fn, ms = 400) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
};

const wordCountOf = (html) => {
  const txt = stripHtml(html);
  return txt ? txt.split(" ").filter(Boolean).length : 0;
};

const readTime = (wc, wpm = 180) => Math.max(1, Math.round(wc / wpm));

const NEGATIVE_TERMS = [
  "always fail",
  "never",
  "can't",
  "worthless",
  "hopeless",
  "pointless",
  "hate myself",
  "no one",
  "nobody",
  "stupid",
  "should have",
  "shouldn't",
  "my fault",
  "i must",
  "i have to",
  "i need to",
];
const CATASTROPHIZING = ["disaster", "ruined", "terrible", "awful", "doomed"];
const EXTERNAL_LOCUS = ["they made me", "because of them", "not my choice"];
const ALL_OR_NOTHING = ["always", "never", "every time", "nothing works"];
const OVERGENERAL = ["everyone", "everything", "everybody", "no one"];

function analyzeCognitions(text) {
  const lc = text.toLowerCase();
  const hits = [];
  const containsAny = (arr) => arr.some((k) => lc.includes(k));
  if (containsAny(NEGATIVE_TERMS))
    hits.push({
      type: "Negative Self-talk",
      tip: "Speak to yourself as a friend: challenge absolute negatives.",
      reframe:
        "Replace “I can’t do anything right” with “Today was tough; I can learn for next time.”",
    });
  if (containsAny(CATASTROPHIZING))
    hits.push({
      type: "Catastrophizing",
      tip: "Pause. What’s truly likely, and what’s a step you control?",
      reframe: "“This is a setback; here’s a small next step.”",
    });
  if (containsAny(EXTERNAL_LOCUS))
    hits.push({
      type: "External Locus",
      tip: "See your choices – even small ones – in any situation.",
      reframe:
        '“I felt X when Y happened. Next time, I’ll voice a need or boundary.”',
    });
  if (containsAny(ALL_OR_NOTHING))
    hits.push({
      type: "All-or-Nothing",
      tip: "Look for the grey. Find a recent exception.",
      reframe: '“I always mess up” → “But last week I finished A correctly.”',
    });
  if (containsAny(OVERGENERAL))
    hits.push({
      type: "Over-generalization",
      tip: "Be specific: who, when, where exactly?",
      reframe: '“I felt dismissed in that meeting,” not “Everyone ignores me.”',
    });
  let score = 0;
  score += hits.length * 2;
  score += (lc.match(/\!/g) || []).length > 3 ? 1 : 0;
  score += (lc.match(/\b(never|nothing|no one)\b/g) || []).length;
  return { hits, score };
}

async function getSalt() {
  let salt = localStorage.getItem(SALT_KEY);
  if (salt) return Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
  const newSalt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(SALT_KEY, btoa(String.fromCharCode(...newSalt)));
  return newSalt;
}

async function deriveKey(passphrase) {
  const enc = new TextEncoder();
  const salt = await getSalt();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 120000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptJSON(data, key) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = enc.encode(JSON.stringify(data));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(cipher)));
  return `${ivB64}.${ctB64}`;
}

async function decryptJSON(payload, key) {
  const [ivB64, ctB64] = String(payload || "").split(".");
  if (!ivB64 || !ctB64) return null;
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(plainBuf));
}

const exec = (cmd, value = null) => document.execCommand(cmd, false, value);
function readFileAsText(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsText(file);
  });
}

// --- MAIN JOURNAL COMPONENT ---
export default function Journal() {
  const editorRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draftHTML, setDraftHTML] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [mood, setMood] = useState(MOODS[2]);
  const [search, setSearch] = useState("");
  const [locked, setLocked] = useState(true);
  const [passphrase, setPassphrase] = useState("");
  const [key, setKey] = useState(null);
  const [passHint, setPassHint] = useState(localStorage.getItem(PASS_KEY) || "");
  const [nudge, setNudge] = useState(null);
  const [analysis, setAnalysis] = useState({ hits: [], score: 0 });
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const theme = useTheme();

  // --- CORE LOGIC / EFFECTS SAME AS BEFORE, OMITTED FOR BREVITY ---
  // (Use the logic for unlock, lock, import/export, etc. as in previous code.)

  // ... (Place core logic from the previous answer here unchanged!) ...

  // UI: Modern, with Material UI, Responsive and Attractive!
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: dark ? "#181825" : "#f4f6fa" }}>
      <CssBaseline />
      
      <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: 1401, bgcolor: dark ? "#232339" : "#fff" }}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700 }}>
            <span role="img" aria-label="notebook">📝</span> Smart Journal
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => setDark((v) => !v)} color="primary">
              {dark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            {locked ? (
              <Tooltip title="Unlock Journal">
                <IconButton color="secondary" onClick={unlock}><LockOpenIcon /></IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Lock Journal">
                <IconButton color="secondary" onClick={lock}><LockIcon /></IconButton>
              </Tooltip>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: 320, flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 320, boxSizing: "border-box", bgcolor: dark ? "#22223a" : "#f8fafd" }
        }}
        open
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              startIcon={<AddIcon />}
              onClick={newEntry}
              variant="contained"
              sx={{ bgcolor: "#0057b8" }}
              fullWidth
              disabled={locked}
            >
              New Entry
            </Button>
          </Stack>

          <Box mt={2} mb={1}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Search entries, mood or tag"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }}
              disabled={locked}
            />
          </Box>
          <Divider />
        </Box>

        <List dense sx={{ maxHeight: "70vh", overflow: "auto" }}>
          {filteredEntries.length === 0 ? (
            <Typography sx={{ p: 2, color: "#aaa" }} align="center">
              {locked ? "Unlock to see your journal entries." : "No entries yet."}
            </Typography>
          ) : (
            filteredEntries.map((e) => {
              const moodObj = MOODS.find(m => m.id === (e.mood?.id || e.mood)) || MOODS[2];
              return (
                <ListItemButton
                  selected={e.id === activeId}
                  key={e.id}
                  onClick={() => selectEntry(e.id)}
                  sx={{
                    py: 2, px: 2,
                    borderLeft: `4px solid ${e.id === activeId ? "#0057b8" : "transparent"}`,
                    bgcolor: e.id === activeId ? (dark ? "#232339" : "#deebff") : "transparent"
                  }}
                  disabled={locked}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Avatar sx={{ bgcolor: moodObj.color }}>{moodObj.emoji}</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 600, fontSize: 16 }}>{moodObj.label}</Typography>}
                    secondary={
                      <Typography noWrap sx={{ fontSize: 14, color: "#777" }}>
                        {stripHtml(e.html).slice(0, 40)}...
                      </Typography>
                    }
                  />
                  <Tooltip title="Delete Entry">
                    <IconButton size="small" onClick={ev => { ev.stopPropagation(); deleteEntry(e.id); }} disabled={locked}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </ListItemButton>
              );
            })
          )}
        </List>
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: 3, overflow: "auto", bgcolor: dark ? "#191929" : "#f4f6fa" }}>
        <Toolbar />

        {locked ? (
          <Paper elevation={3} sx={{ p: 4, mt: 6, maxWidth: 480, mx: "auto", textAlign: "center", bgcolor: dark ? "#292949" : "#fff6fd" }}>
            <LockIcon sx={{ fontSize: 50, color: "#888" }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 3, fontWeight: 500 }}>Your journal is locked</Typography>
            <TextField
              type="password"
              label="Passphrase"
              fullWidth
              sx={{ mb: 2 }}
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              autoFocus
            />
            <Button size="large" variant="contained" onClick={unlock} fullWidth>
              Unlock
            </Button>
            <Box mt={2}>
              <TextField
                fullWidth
                label="Passphrase hint (optional)"
                value={passHint}
                onChange={e => setPassHint(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button variant="outlined" onClick={savePassHint} size="small">Save hint</Button>
              <Typography color="textSecondary" sx={{ mt: 1, fontSize: 14 }}>
                {passHint ? `Hint: ${passHint}` : "Set a passphrase and (optionally) a hint, stored only locally."}
              </Typography>
            </Box>
          </Paper>
        ) : activeId ? (
          <Box>
            {/* Editor Metadata Row */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" mb={2}>
              {/* Mood */}
              <Stack direction="row" spacing={1} alignItems="center">
                {MOODS.map(m => (
                  <Chip
                    key={m.id}
                    label={m.emoji}
                    clickable
                    color={mood.id === m.id ? "primary" : "default"}
                    onClick={() => {
                      setMood(m);
                      debouncedSave();
                    }}
                    sx={{
                      bgcolor: mood.id === m.id ? m.color : "#f0f0f0",
                      color: "#222",
                      fontWeight: 700,
                    }}
                  />
                ))}
              </Stack>
              {/* Tag Entry */}
              <Box>
                <TextField
                  size="small"
                  variant="outlined"
                  label="Add tag"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  sx={{ width: 120 }}
                  onKeyDown={e => e.key === "Enter" && addTag()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={addTag}>
                          <TagIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction="row" spacing={1} mt={1}>
                  {tags.map(t => <Chip key={t} label={t} onDelete={() => removeTag(t)} />)}
                </Stack>
              </Box>
              {/* Word count */}
              <Typography color="textSecondary" sx={{ ml: { sm: "auto" }, whiteSpace: "nowrap" }}>
                {wordCountOf(draftHTML)} words • {stripHtml(draftHTML).length} chars • ~{readTime(wordCountOf(draftHTML))} min
              </Typography>
            </Stack>

            {/* Formatting Toolbar */}
            <Stack direction="row" mb={1} spacing={1} alignItems="center">
              <Tooltip title="Normal text"><IconButton onClick={() => apply("formatBlock", "p")}>¶</IconButton></Tooltip>
              <Tooltip title="H1 heading"><IconButton onClick={() => apply("formatBlock", "h1")}>H1</IconButton></Tooltip>
              <Tooltip title="H2 heading"><IconButton onClick={() => apply("formatBlock", "h2")}>H2</IconButton></Tooltip>
              <Tooltip title="Bold"><IconButton onClick={() => apply("bold")}><b>B</b></IconButton></Tooltip>
              <Tooltip title="Italic"><IconButton onClick={() => apply("italic")}><i>I</i></IconButton></Tooltip>
              <Tooltip title="Underline"><IconButton onClick={() => apply("underline")}><u>U</u></IconButton></Tooltip>
              <Tooltip title="Strikethrough"><IconButton onClick={() => apply("strikeThrough")}><s>S</s></IconButton></Tooltip>
              <Tooltip title="List"><IconButton onClick={() => apply("insertUnorderedList")}>• List</IconButton></Tooltip>
              <Tooltip title="Numbered list"><IconButton onClick={() => apply("insertOrderedList")}>1. List</IconButton></Tooltip>
              <Tooltip title="Quote"><IconButton onClick={() => apply("formatBlock", "blockquote")}>❝</IconButton></Tooltip>
              <Tooltip title="Insert link"><IconButton onClick={() => apply("createLink")}>🔗</IconButton></Tooltip>
              <Tooltip title="Timestamp">
                <IconButton
                  onClick={() => {
                    apply("insertText", ` [${new Date().toLocaleString()}] `);
                  }}
                >
                  ⏱
                </IconButton>
              </Tooltip>
              <Tooltip title="Save entry">
                <IconButton
                  color="success"
                  onClick={async () => {
                    if (!key) return alert("Unlock first.");
                    const updated = entries.map((e) =>
                      e.id === activeId
                        ? {
                          ...e,
                          html: draftHTML,
                          updatedAt: new Date().toISOString(),
                          wordCount: wordCountOf(draftHTML),
                          tags,
                          mood,
                        }
                        : e
                    );
                    setEntries(updated);
                    const blob = await encryptJSON(updated, key);
                    localStorage.setItem(STORAGE_KEY, blob);
                    alert("Saved!");
                  }}>
                  <CloudUploadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export journal">
                <IconButton onClick={exportJSON}><CloudDownloadIcon /></IconButton>
              </Tooltip>
              <label>
                <input
                  type="file"
                  accept=".json"
                  onChange={e => e.target.files?.[0] && importJSON(e.target.files[0])}
                  style={{ display: "none" }}
                />
                <Tooltip title="Import journal">
                  <IconButton component="span"><CloudUploadIcon /></IconButton>
                </Tooltip>
              </label>
            </Stack>

            {/* Rich Text Editor */}
            <Paper
              ref={editorRef}
              onInput={onInput}
              component="div"
              contentEditable
              suppressContentEditableWarning
              variant="outlined"
              sx={{
                minHeight: 220,
                p: 2,
                fontSize: 17,
                fontFamily: "inherit",
                border: "1.5px solid #cfd8dc",
                outline: "none",
                bgcolor: dark ? "#232339" : "#fff"
              }}
              dangerouslySetInnerHTML={{ __html: draftHTML || "<p>Start writing…</p>" }}
            />

            {/* Insight row */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={3}>
              <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  🧠 Pattern Breaker
                </Typography>
                {analysis.hits.length === 0 ? (
                  <Typography color="text.secondary">No notable cognitive traps detected in your entry.</Typography>
                ) : (
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {analysis.hits.map((h, i) => (
                        <li key={i} style={{ marginBottom: 8 }}>
                          <Typography variant="body1" fontWeight={600}>{h.type}</Typography>
                          <Typography variant="body2" color="textSecondary">{h.tip}</Typography>
                          <Typography variant="body2" fontStyle="italic" sx={{ borderLeft: "4px solid #dde1fb", pl: 1, mt: .5 }}>
                            {h.reframe}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  )}
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, flex: 1, bgcolor: "#eeffef" }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  💬 Motivational Nudge
                </Typography>
                <Typography color="success.dark">{nudge}</Typography>
                <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                  Nudges change with mood and writing style!
                </Typography>
              </Paper>
            </Stack>
          </Box>
        ) : (
          <Paper elevation={1} sx={{ p: 4, mt: 10, textAlign: "center", maxWidth: 480, mx: "auto", bgcolor: dark ? "#222" : "#fff" }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              No Entry Selected
            </Typography>
            <Button variant="outlined" onClick={newEntry}>Create your first Journal Entry</Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
