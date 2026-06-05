"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import AsciiField from "@/components/ascii-field";

type Field =
  | "team_count"
  | "member_names"
  | "school"
  | "team_name"
  | "contact_email"
  | "contact_phone"
  | "confirm";

type Answers = {
  teamCount: string;
  members: string[];
  school: string;
  teamName: string;
  contactEmail: string;
  contactPhone: string;
};

const ACCENT = "#cba6f7";

const SCHOOLS = [
  "The International School Bangalore", "Indus International School Bangalore", "Greenwood High International School",
  "Mallya Aditi International School", "Inventure Academy", "Canadian International School",
  "Stonehill International School", "Trio World Academy", "Oakridge International School Bengaluru",
  "Neev Academy", "Legacy School", "Bangalore International School", "Sharanya Narayani International School",
  "Harrow International School Bengaluru", "New Horizon International School", "Primus Public School",
  "Harvest International School", "Ebenezer International School", "One World International School", "United World Academy",
  "National Public School Indiranagar", "National Public School Rajajinagar", "National Public School Koramangala",
  "National Public School HSR Layout", "Delhi Public School Bangalore East", "Delhi Public School Bangalore South",
  "Delhi Public School Bangalore North", "Presidency School Bangalore North", "Presidency School Bangalore South",
  "National Centre for Excellence", "Sri Kumaran Children's Home", "Kendriya Vidyalaya IISc",
  "Kendriya Vidyalaya DRDO", "Orchid International School", "VIBGYOR High School", "The Brigade School",
  "New Horizon Gurukul", "Jain International Residential School", "BGS National Public School",
  "Ryan International School Bangalore", "Bishop Cotton Boys' School", "Bishop Cotton Girls' School",
  "Bethany High School", "New Horizon Public School", "Frank Anthony Public School", "Baldwin Boys' High School",
  "Baldwin Girls' High School", "Sophia High School", "Sacred Heart Girls High School", "Clarence High School",
  "St. Joseph's Boys' High School", "St. Francis Xavier Girls High School", "Vidyashilp Academy",
  "Greenwood High ICSE", "Head Start Educational Academy", "The Valley School", "Deens Academy",
  "Treamis World School", "Prakriya Green Wisdom School", "Gear Innovative International School",
  "Army Public School", "Air Force School Hebbal", "CMR National Public School", "CMR International School",
  "EuroSchool Whitefield", "EuroSchool HSR", "EuroSchool North Campus", "Chrysalis High Varthur",
  "Chrysalis High Kadugodi", "Chrysalis High Bannerghatta", "Candor International School",
  "Jain Heritage School", "Presidency School RT Nagar", "Vidyaniketan Public School",
  "Greenwood High Bannerghatta", "Green Dot International School", "National Academy for Learning",
  "Greenwood High Sarjapur", "Shishya BEML Public School", "Vibgyor High Haralur", "Vibgyor High Marathahalli",
  "Vibgyor High Electronic City", "BGS International Public School", "Sorsfort International School",
  "Delhi World Public School", "Cambridge Public School", "Reva Independent PU & School", "Ekya School JP Nagar",
  "Ekya School ITPL", "Ekya School BTM Layout", "Rashtrotthana Vidya Kendra", "Nitte International School",
  "Whitefield Global School", "Winmore Academy", "Presidency School Kasturinagar", "Harvest CBSE School",
  "Global Indian International School", "Sherwood High School", "Florence Public School", "East Point School",
];

function getPrompt(field: Field, idx?: number): string {
  switch (field) {
    case "team_count":
      return "Enter number of team members (2-4)";
    case "member_names":
      return `Member ${idx! + 1}`;
    case "school":
      return "School";
    case "team_name":
      return "Team name";
    case "contact_email":
      return "Contact email";
    case "contact_phone":
      return "Contact phone";
    case "confirm":
      return "Submit registration? (y/n)";
  }
}

export default function RegistrationPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [schoolMatchIdx, setSchoolMatchIdx] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const [emailAttempts, setEmailAttempts] = useState(0);
  const [cooldownEnd, setCooldownEnd] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const [field, setField] = useState<Field | null>(null);
  const [memberIdx, setMemberIdx] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({
    teamCount: "",
    members: [],
    school: "",
    teamName: "",
    contactEmail: "",
    contactPhone: "",
  });
  const progress = useMemo(() => {
    if (!bootDone) return 0;
    if (submitted) return 1;
    const teamCount = parseInt(answers.teamCount, 10);
    switch (field) {
      case "team_count": return 0.08;
      case "member_names": return 0.08 + (memberIdx / (teamCount || 2)) * 0.22;
      case "school": return 0.35;
      case "team_name": return 0.50;
      case "contact_email": return 0.65;
      case "contact_phone": return 0.80;
      case "confirm": return 0.92;
      default: return 0;
    }
  }, [bootDone, field, memberIdx, answers.teamCount, submitted]);
  const [history, setHistory] = useState<{ prompt: string; value: string; isMessage?: boolean }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("ascendant-gate")) {
      router.replace("/");
      return;
    }
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [router]);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 40;
    const interval = setInterval(() => {
      frame++;
      setBootProgress(Math.min(frame / totalFrames, 1));
      if (frame >= totalFrames) {
        clearInterval(interval);
        setTimeout(() => {
          setBootDone(true);
          setField("team_count");
          focusInput();
        }, 400);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    focusInput();
  }, [field, focusInput]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldownEnd <= Date.now()) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      setCooldownLeft(left);
      if (left <= 0) {
        clearInterval(id);
        setEmailAttempts(0);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownEnd]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, input, field]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        router.push("/");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  function commitInput() {
    const val = input.trim();
    if (!val) return;

    if (field === "team_count") {
      const n = parseInt(val, 10);
      if (isNaN(n) || n < 2 || n > 4) return;
      setAnswers((prev) => ({ ...prev, teamCount: val }));
      setHistory((prev) => [...prev, { prompt: getPrompt("team_count"), value: val }]);
      setHistory((prev) => [...prev, { prompt: "Please enter your team members names", value: "", isMessage: true }]);
      setInput("");
      setField("member_names");
      setMemberIdx(0);
      return;
    }

    if (field === "member_names") {
      const idx = memberIdx;
      const count = parseInt(answers.teamCount, 10);
      // Check for duplicate names
      if (answers.members.slice(0, idx).some((n) => n.toLowerCase() === val.toLowerCase())) {
        setErrorMsg("Member names cannot be the same");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }
      setAnswers((prev) => {
        const members = [...prev.members];
        members[idx] = val;
        return { ...prev, members };
      });
      setHistory((prev) => [...prev, { prompt: getPrompt("member_names", idx), value: val }]);
      setInput("");
      if (idx + 1 >= count) {
        setField("school");
      } else {
        setMemberIdx(idx + 1);
      }
      return;
    }

    if (field === "school") {
      setAnswers((prev) => ({ ...prev, school: val }));
      setHistory((prev) => [...prev, { prompt: getPrompt("school"), value: val }]);
      setInput("");
      setSuggestions([]);
      setField("team_name");
      return;
    }

    if (field === "team_name") {
      setAnswers((prev) => ({ ...prev, teamName: val }));
      setHistory((prev) => [...prev, { prompt: getPrompt("team_name"), value: val }]);
      setInput("");
      setField("contact_email");
      return;
    }

    if (field === "contact_email") {
      const valid = /@(gmail\.com|outlook\.com)$/i.test(val);
      if (!valid) {
        const attempts = emailAttempts + 1;
        setEmailAttempts(attempts);
        setShakeKey((k) => k + 1);
        if (attempts >= 3) {
          const end = Date.now() + 4 * 60 * 1000;
          setCooldownEnd(end);
          setCooldownLeft(240);
          setErrorMsg("3 failed attempts, try again after 4 mins");
        } else {
          setErrorMsg("Please enter a valid email, preferable ones *@gmail.com");
        }
        setTimeout(() => { if (attempts < 3) setErrorMsg(""); }, 3000);
        return;
      }
      setEmailAttempts(0);
      setAnswers((prev) => ({ ...prev, contactEmail: val }));
      setHistory((prev) => [...prev, { prompt: getPrompt("contact_email"), value: val }]);
      setInput("");
      setField("contact_phone");
      return;
    }

    if (field === "contact_phone") {
      if (val.length !== 10 || !/^\d{10}$/.test(val)) {
        setErrorMsg("Phone number must be 10 digits");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }
      setAnswers((prev) => ({ ...prev, contactPhone: val }));
      setHistory((prev) => [...prev, { prompt: getPrompt("contact_phone"), value: val }]);
      setInput("");
      setField("confirm");
      return;
    }

    if (field === "confirm") {
      if (val.toLowerCase() === "y") {
        setSubmitted(true);
        setField(null);
      } else if (val.toLowerCase() === "n") {
        setAnswers({ teamCount: "", members: [], school: "", teamName: "", contactEmail: "", contactPhone: "" });
        setHistory([]);
        setInput("");
        setField("team_count");
      }
      return;
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\n/g, "");
    if (field === "member_names" || field === "school" || field === "team_name") {
      if (/[\d]/.test(val)) {
        setErrorMsg("Please enter a valid name");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }
      if (field === "school") {
        const q = val.toLowerCase().trim();
        if (q) {
          const matches = SCHOOLS.filter((s) => s.toLowerCase().includes(q));
          setSuggestions(matches.slice(0, 3));
          setSchoolMatchIdx(-1);
        } else {
          setSuggestions([]);
        }
      }
    } else if (field === "contact_phone") {
      val = val.replace(/\D/g, "");
    }
    setInput(val);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "contact_email" && cooldownLeft > 0) return;
      commitInput();
      if (field === "school") { setSchoolMatchIdx(-1); setSuggestions([]); }
      return;
    }
    if (e.key === "Tab" && field === "school") {
      e.preventDefault();
      if (suggestions.length === 0) return;
      const next = (schoolMatchIdx + 1) % suggestions.length;
      setSchoolMatchIdx(next);
      setInput(suggestions[next]);
    }
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      <AsciiField progress={progress} />
      <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="flex flex-col"
        style={{
          width: "88%",
          maxWidth: 960,
          height: "86vh",
          maxHeight: 800,
          border: "1px solid #2a2a2a",
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#000000",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03)",
          animation: errorMsg ? "shake 0.4s ease" : "none",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center shrink-0 select-none"
          style={{
            height: 36,
            padding: "0 16px",
            borderBottom: "1px solid #1a1a1a",
            backgroundColor: "#0a0a0a",
          }}
        >
          <div className="flex items-center gap-2 mr-4">
            <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#2a2a2a", border: "1px solid #333" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#2a2a2a", border: "1px solid #333" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#2a2a2a", border: "1px solid #333" }} />
          </div>
          <div
            className="flex-1 text-center text-xs tracking-wider truncate"
            style={{ color: "#666", fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace" }}
          >
            [term] register — ascendant 2026
          </div>
          <div className="w-[62px]" />
        </div>

        {/* Terminal body */}
        <div
          className="flex-1 overflow-y-auto p-6 md:p-8"
          style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace" }}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Initial command */}
          <div className="mb-5" style={{ fontSize: 13, lineHeight: 1.7 }}>
            <span style={{ color: ACCENT }}>ascendant@core</span>
            <span style={{ color: "#666" }}>:~$ </span>
            <span style={{ color: "#eee" }}>./register --interactive</span>
          </div>

          {/* Boot / loading */}
          {!bootDone && (
            <div className="mb-6" style={{ fontSize: 13, lineHeight: 1.7 }}>
              <div className="mb-2" style={{ color: "#aaa" }}>
                Starting registration process...
              </div>
              <div
                style={{
                  width: "100%",
                  maxWidth: 400,
                  height: 18,
                  border: "1px solid #2a2a2a",
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "transparent",
                }}
              >
                <div
                  style={{
                    width: `${bootProgress * 100}%`,
                    height: "100%",
                    backgroundColor: ACCENT,
                    transition: "width 0.05s linear",
                    opacity: 0.7,
                  }}
                />
              </div>
              <div className="mt-1" style={{ color: "#555", fontSize: 11 }}>
                {Math.round(bootProgress * 100)}%
              </div>
            </div>
          )}

          {/* History — continuous flow with > prompt */}
          {history.map((h, i) => (
            <div key={i} className="mb-3" style={{ fontSize: 13, lineHeight: 1.7 }}>
              {h.isMessage ? (
                <div style={{ color: "#888", fontStyle: "italic" }}>{h.prompt}</div>
              ) : (
                <div>
                  <span style={{ color: "#555" }}>&gt; </span>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>{h.prompt}:</span>
                  <span style={{ color: "#eee" }}> {h.value}</span>
                </div>
              )}
            </div>
          ))}

          {/* Current prompt + input */}
          {field && !submitted && (
            <div className="mb-3" style={{ fontSize: 13, lineHeight: 1.7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>
                <span style={{ color: "#555" }}>&gt; </span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>
                  {field === "member_names"
                    ? getPrompt("member_names", memberIdx)
                    : getPrompt(field)}:
                </span>
                {field !== "contact_email" || cooldownLeft <= 0 ? (
                  <>
                    <span style={{ color: "#eee" }}> {input}</span>
                    <CursorBlink show />
                  </>
                ) : null}
              </span>
              {field === "contact_email" && cooldownLeft > 0 && (
                <span style={{ color: "#444", fontSize: 11 }}>
                  {Math.floor(cooldownLeft / 60)}:{String(cooldownLeft % 60).padStart(2, "0")}
                </span>
              )}
            </div>
          )}

          {/* School suggestions */}
          {field === "school" && suggestions.length > 0 && (
            <div className="mb-3" style={{ fontSize: 11, lineHeight: 1.8, color: "#555" }}>
              {suggestions.map((s, i) => (
                <div key={s} style={{ paddingLeft: 20 }}>
                  <span style={{ color: i === schoolMatchIdx ? "#cba6f7" : "#555" }}>
                    {i === schoolMatchIdx ? "\u25B6 " : "  "}{s}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="mb-3" style={{ fontSize: 12, lineHeight: 1.7, color: "#ff4444" }}>
              ! {errorMsg}
            </div>
          )}

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="opacity-0 absolute"
            style={{ left: -9999, top: -9999, width: 1, height: 1 }}
            autoFocus
          />

          {/* Submitted confirmation */}
          {submitted && (
            <div className="mt-4" style={{ fontSize: 13, lineHeight: 1.7 }}>
              <div className="mb-4" style={{ color: ACCENT, fontWeight: 600 }}>
                ✓ Registration submitted successfully
              </div>
              <div className="mb-1" style={{ color: "#888" }}>
                Team name: <span style={{ color: "#eee" }}>{answers.teamName}</span>
              </div>
              <div className="mb-1" style={{ color: "#888" }}>
                Members ({answers.teamCount}): <span style={{ color: "#eee" }}>{answers.members.join(", ")}</span>
              </div>
              <div className="mb-1" style={{ color: "#888" }}>
                School: <span style={{ color: "#eee" }}>{answers.school}</span>
              </div>
              <div className="mb-1" style={{ color: "#888" }}>
                Contact: <span style={{ color: "#eee" }}>{answers.contactEmail}</span> <span style={{ color: "#555" }}>/</span> <span style={{ color: "#eee" }}>{answers.contactPhone}</span>
              </div>
              <div className="mt-6" style={{ color: "#555" }}>
                Press <span style={{ color: "#888" }}>Ctrl+D</span> to return
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div
          className="shrink-0 text-center text-[10px] tracking-widest select-none py-3"
          style={{ color: "#222", borderTop: "1px solid #111" }}
        >
          CTRL+D — CANCEL
        </div>
      </div>

      <style>{`@keyframes cursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } } @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); } }`}</style>
      </div>
    </div>
  );
}

function CursorBlink({ show }: { show: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 14,
        backgroundColor: "#eee",
        marginLeft: 2,
        verticalAlign: "text-bottom",
        animation: show ? "cursorBlink 1s step-end infinite" : "none",
      }}
    />
  );
}
