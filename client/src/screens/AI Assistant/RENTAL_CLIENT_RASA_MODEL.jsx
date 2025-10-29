import React, { useEffect, useRef, useState } from "react";
import TopNavigationBar from "../Dashboard/TopNavigationBar";
import { useNavigate } from "react-router-dom";

const VoiceAssistantRent = () => {
  const [sessionId, setSessionId] = useState(null);
  const [listening, setListening] = useState(false);
  const [botResponse, setBotResponse] = useState("");
  const [messages, setMessages] = useState([]);
  const [waveform, setWaveform] = useState(Array(40).fill(0));
  const [isMobile, setIsMobile] = useState(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const speakingRef = useRef(false);
  const isBotSpeakingRef = useRef(false);
  const messagesEndRef = useRef(null);
    const waveIntervalRef = useRef(null);

  const [user, setUser] = useState(null);
  // Conversation questions for rental preferences
  const questions = [
    "Hello! I'm Aria, your AI rental assistant. Let's find your ideal rental property. First, which location are you interested in?",
    "What is your budget range for the rent?",
    "How many bedrooms or what property size do you prefer?",
    "Are there any specific amenities or features you want?",
    "Thank you for sharing all the details. I'll save your preferences now."
  ];
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  // Deprecated: collectedPrefs, now using collectedPrefsArr for ordered responses
  // const [collectedPrefs, setCollectedPrefs] = useState({});
  const collectedPrefsRef = useRef([]);
  const navigate = useNavigate();

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(scrollToBottom, [messages]);
    
  const handleLogout = async () => {
    await fetch(process.env.REACT_APP_LOGOUT_API, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_USER_ME_API, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const navItems = ["For Buyers", "For Tenants", "For Owners", "For Dealers / Builders", "Insights"];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (listening) {
      waveIntervalRef.current = setInterval(() => { setWaveform(Array(40).fill(0).map(() => Math.random() * 100)); }, 100);
    } else {
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
      setWaveform(Array(40).fill(0));
    }
    return () => { if (waveIntervalRef.current) clearInterval(waveIntervalRef.current); };
  }, [listening]);

  const safeStartRecognition = () => { if (!recognitionRef.current || isRecognizingRef.current) return; try { recognitionRef.current.start(); } catch (err) { console.warn("Recognition start error:", err.message); } };

  useEffect(() => { return () => { if (recognitionRef.current) { try { recognitionRef.current.onstart = null; recognitionRef.current.onend = null; recognitionRef.current.onresult = null; recognitionRef.current.onerror = null; recognitionRef.current.stop(); } catch {} } if (restartTimeoutRef.current) { clearTimeout(restartTimeoutRef.current); } window.speechSynthesis.cancel(); }; }, []);

    useEffect(() => {
      if (!sessionId) return;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) { alert("Speech recognition not supported in this browser!"); return; }
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognitionRef.current = recognition;
      recognition.onstart = () => { try { isRecognizingRef.current = true; setListening(true); } catch {} };
      recognition.onend = () => {
        try {
          isRecognizingRef.current = false;
          setListening(false);
          if (!speakingRef.current) {
            restartTimeoutRef.current = setTimeout(() => { safeStartRecognition(); }, 700);
          }
        } catch {}
      };
      recognition.onerror = (event) => {
        try {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setListening(false);
            isRecognizingRef.current = false;
          } else {
            if (recognitionRef.current && !isRecognizingRef.current) {
              restartTimeoutRef.current = setTimeout(() => { safeStartRecognition(); }, 1000);
            }
          }
        } catch {}
      };
      recognition.onresult = async (event) => {
        try {
          if (speakingRef.current || isBotSpeakingRef.current) { console.log("Ignoring speech — bot is talking"); return; }
          const userSpeech = event.results[0][0].transcript.trim();
          // LOG: Recognized speech
          console.log("🎤 Recognized speech:", userSpeech);
          // --- Similarity check: Prevent user from repeating the bot's question
          const botQuestion = questions[currentQuestionIdx];
          // 🔹 Check if user repeated the bot question
          const normalizedUser = userSpeech.toLowerCase().replace(/[^a-z0-9 ]/g, "");
          const normalizedQuestion = botQuestion.toLowerCase().replace(/[^a-z0-9 ]/g, "");
          let similarity = 0;
          const words1 = new Set(normalizedUser.split(" "));
          const words2 = new Set(normalizedQuestion.split(" "));
          for (const w of words1) if (words2.has(w)) similarity++;
          const ratio = similarity / Math.max(words2.size, 1);
          // If > 0.6 words overlap → probably repeated the bot question
          if (ratio > 0.3) {
            setMessages(prev => [...prev, { type: "bot", text: "Please answer the question so I can continue." }]);
            speak("Please answer the question so I can continue.");
            return;
          }
          // -----
          collectedPrefsRef.current.push(userSpeech);
          console.log("🧩 Collected responses so far:", collectedPrefsRef.current);
          setMessages(prev => [...prev, { type: "user", text: userSpeech }]);
          // Move to next question
          const nextIdx = currentQuestionIdx + 1;
          setCurrentQuestionIdx(nextIdx);
          if (nextIdx < questions.length) {
            setMessages(prev => [...prev, { type: "bot", text: questions[nextIdx] }]);
            speak(questions[nextIdx]);
          } else {
            // All questions done, preferences to backend
            const orderedPrefs = {
              location: collectedPrefsRef.current[0] || "",
              budget: collectedPrefsRef.current[1] || "",
              size: collectedPrefsRef.current[2] || "",
              amenities: collectedPrefsRef.current[3] ? [collectedPrefsRef.current[3]] : [],
              furnishing: "",
              propertyType: ""
            };
            console.log("🧾 Final orderedPrefs before sending (from ref):", orderedPrefs);
            const payload = {
              email: user?.email || null,
              assistantType: "rental",
              preferences: orderedPrefs,
            };
            setMessages(prev => [...prev, { type: "bot", text: questions[questions.length - 1] }]);
            speak(questions[questions.length - 1]);
            // Save to backend
            try {
              const resp = await fetch(process.env.REACT_APP_RENTAL_PROPERTY_PREFERENCE_ARIA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
              });
              if (resp.ok) {
                console.log("✅ User preferences saved successfully.");
                console.log("✅ Backend acknowledged preference save.");
                navigate("/");
              } else {
                const errText = await resp.text();
                console.error("❌ Failed to save preferences:", errText);
              }
            } catch (err) {
              console.error("❌ Error saving user preferences:", err);
            }
            if (recognitionRef.current) recognitionRef.current.stop();
          }
        } catch (err) { console.error("Speech result error:", err); }
      };
      safeStartRecognition();
      return () => {
        if (restartTimeoutRef.current) { clearTimeout(restartTimeoutRef.current); }
        try { recognition.stop(); } catch {}
      };
    // eslint-disable-next-line
    }, [sessionId, currentQuestionIdx]);

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      isBotSpeakingRef.current = true;
      speakingRef.current = true;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.name.includes("Google UK English Female")) ||
        voices.find((v) => v.name.includes("Google US English")) ||
        voices.find((v) => v.name.includes("Microsoft")) ||
        voices.find((v) => v.lang === "en-IN") ||
        voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log("🗣️ Using voice:", preferredVoice.name);
      }
      utterance.onend = async () => {
        console.log("🗣️ Bot finished speaking...");
        isBotSpeakingRef.current = false;
        speakingRef.current = false;
        // Only auto-restart recognition if not at end
        if (currentQuestionIdx < questions.length) {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
              setTimeout(() => {
                safeStartRecognition();
              }, 1200);
            } catch (err) {
              console.warn("Restart error:", err);
            }
          }
        }
      };
      utterance.onerror = (err) => {
        console.error("Speech synthesis error:", err);
        isBotSpeakingRef.current = false;
        speakingRef.current = false;
        if (recognitionRef.current) {
          setTimeout(() => safeStartRecognition(), 800);
        }
      };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis error:", e);
      speakingRef.current = false;
    }
  };

  // On session start, immediately trigger the first question
  useEffect(() => {
    if (sessionId) {
      setCurrentQuestionIdx(0);
      setMessages([{ type: "bot", text: questions[0] }]);
      speak(questions[0]);
    }
    // eslint-disable-next-line
  }, [sessionId]);

  useEffect(() => { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); }; }, []);

    return (
      <>
       <TopNavigationBar
        user={user}
        handleLogout={handleLogout}
        navItems={navItems}
      />
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #000814 0%, #001d3d 25%, #003566 50%, #001d3d 75%, #000814 100%)", backgroundSize: "400% 400%", animation: "gradientShift 15s ease infinite", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "10px" : "20px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: "relative", overflow: "hidden" }}>
          
      <style>{`@keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 33% { transform: translateY(-20px) rotate(5deg); } 66% { transform: translateY(-10px) rotate(-5deg); } } @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.7; } } @keyframes ripple { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } } @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(0, 167, 157, 0.3), 0 0 60px rgba(34, 211, 238, 0.2); } 50% { box-shadow: 0 0 40px rgba(34, 211, 238, 0.8), 0 0 80px rgba(0, 167, 157, 0.6), 0 0 120px rgba(34, 211, 238, 0.4); } } @keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } } @keyframes particle { 0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; } }`}</style>
      
      {[...Array(isMobile ? 10 : 20)].map((_, i) => ( <div key={i} style={{ position: "absolute", width: "4px", height: "4px", background: `rgba(${i % 2 === 0 ? '34, 211, 238' : '0, 167, 157'}, 0.6)`, borderRadius: "50%", left: `${Math.random() * 100}%`, bottom: "0", animation: `particle ${8 + Math.random() * 10}s linear infinite`, animationDelay: `${Math.random() * 8}s`, boxShadow: `0 0 10px rgba(${i % 2 === 0 ? '34, 211, 238' : '0, 167, 157'}, 0.8)` }} /> ))}

      <div style={{ width: "100%", maxWidth: "1400px", background: "rgba(0, 13, 26, 0.85)", borderRadius: isMobile ? "20px" : "32px", padding: isMobile ? "20px" : "50px", boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)", backdropFilter: "blur(20px)", border: "1px solid rgba(34, 211, 238, 0.2)", position: "relative", overflow: "hidden" }}>
        
        <div style={{ position: "absolute", top: "0", left: "0", right: "0", height: "2px", background: "linear-gradient(90deg, transparent, #22D3EE, transparent)", animation: "slideInRight 3s ease-in-out infinite" }} />

        <div style={{ textAlign: "center", marginBottom: isMobile ? "20px" : "40px", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: isMobile ? "8px" : "15px", marginBottom: isMobile ? "8px" : "15px" }}>
            <div style={{ width: isMobile ? "35px" : "50px", height: isMobile ? "35px" : "50px", background: "linear-gradient(135deg, #00A79D, #22D3EE)", borderRadius: isMobile ? "8px" : "12px", display: "flex", alignItems: "center", justifyContent: "center", animation: "breathe 3s ease-in-out infinite", boxShadow: "0 8px 32px rgba(34, 211, 238, 0.4)" }}>
              <svg width={isMobile ? "20" : "28"} height={isMobile ? "20" : "28"} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </div>
            <h1 style={{ color: "#22D3EE", fontSize: isMobile ? "28px" : "42px", fontWeight: "800", margin: "0", textShadow: "0 0 30px rgba(34, 211, 238, 0.6), 0 0 60px rgba(0, 167, 157, 0.3)", letterSpacing: "-1px", background: "linear-gradient(135deg, #22D3EE, #00A79D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ARIA</h1>
          </div>
          <p style={{ color: "#F4F7F9", fontSize: isMobile ? "11px" : "16px", margin: "0", opacity: "0.9", letterSpacing: isMobile ? "1px" : "2px", fontWeight: "300", textTransform: "uppercase" }}>AI Real Estate Intelligence Assistant</p>
          <div style={{ width: isMobile ? "40px" : "60px", height: "3px", background: "linear-gradient(90deg, transparent, #00A79D, transparent)", margin: isMobile ? "10px auto 0" : "15px auto 0" }} />
        </div>

        {!sessionId ? (
          <div style={{ textAlign: "center", padding: isMobile ? "40px 10px" : "80px 20px" }}>
            <div style={{ position: "relative", width: isMobile ? "140px" : "200px", height: isMobile ? "140px" : "200px", margin: isMobile ? "0 auto 30px" : "0 auto 50px", animation: "float 6s ease-in-out infinite" }}>
              <div style={{ position: "absolute", inset: "0", borderRadius: "50%", background: "linear-gradient(135deg, rgba(0, 167, 157, 0.2), rgba(34, 211, 238, 0.2))", animation: "ripple 2s ease-out infinite" }} />
              <div style={{ position: "absolute", inset: "0", borderRadius: "50%", background: "linear-gradient(135deg, rgba(0, 167, 157, 0.2), rgba(34, 211, 238, 0.2))", animation: "ripple 2s ease-out infinite 1s" }} />
              <div style={{ position: "absolute", inset: isMobile ? "15px" : "20px", borderRadius: "50%", background: "linear-gradient(135deg, #00A79D, #22D3EE)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(34, 211, 238, 0.6), inset 0 -5px 20px rgba(0, 0, 0, 0.3)", border: "3px solid rgba(255, 255, 255, 0.2)" }}>
                <svg width={isMobile ? "50" : "80"} height={isMobile ? "50" : "80"} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
            </div>
            <button onClick={() => { const newSessionId = `user_${Math.random().toString(36).substr(2, 9)}`; setSessionId(newSessionId); }} style={{ padding: isMobile ? "14px 40px" : "18px 60px", background: "linear-gradient(135deg, #00A79D, #22D3EE)", color: "#FFFFFF", border: "none", borderRadius: "50px", cursor: "pointer", fontSize: isMobile ? "14px" : "18px", fontWeight: "700", boxShadow: "0 10px 40px rgba(0, 167, 157, 0.5)", transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", outline: "none", letterSpacing: "1px", textTransform: "uppercase", position: "relative", overflow: "hidden" }} onMouseOver={(e) => { e.target.style.transform = "translateY(-3px) scale(1.05)"; e.target.style.boxShadow = "0 15px 50px rgba(0, 167, 157, 0.7)"; }} onMouseOut={(e) => { e.target.style.transform = "translateY(0) scale(1)"; e.target.style.boxShadow = "0 10px 40px rgba(0, 167, 157, 0.5)"; }}>
              <span style={{ position: "relative", zIndex: "1" }}>🚀 Initiate AI Session</span>
              <div style={{ position: "absolute", inset: "0", background: "linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2), transparent)", transform: "translateX(-100%)", transition: "transform 0.6s" }} />
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "450px 1fr", gap: isMobile ? "20px" : "40px", alignItems: "start" }}>
            
            <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", alignItems: "center", justifyContent: isMobile ? "space-between" : "flex-start", position: isMobile ? "relative" : "sticky", top: isMobile ? "auto" : "20px", gap: isMobile ? "15px" : "0", padding: isMobile ? "15px" : "0", background: isMobile ? "rgba(0, 13, 26, 0.6)" : "transparent", borderRadius: isMobile ? "20px" : "0", border: isMobile ? "1px solid rgba(34, 211, 238, 0.2)" : "none" }}>
              
              <div style={{ position: "relative", width: isMobile ? "100px" : "280px", height: isMobile ? "100px" : "280px", marginBottom: isMobile ? "0" : "30px", flexShrink: "0" }}>
                {listening && [...Array(3)].map((_, i) => ( <div key={i} style={{ position: "absolute", inset: isMobile ? "-10px" : "-30px", borderRadius: "50%", border: "2px solid rgba(34, 211, 238, 0.3)", animation: `ripple ${2 + i * 0.5}s ease-out infinite`, animationDelay: `${i * 0.3}s` }} /> ))}
                
                <div style={{ position: "absolute", inset: "0", borderRadius: "50%", background: listening ? "radial-gradient(circle, rgba(0, 167, 157, 0.4) 0%, rgba(34, 211, 238, 0.2) 40%, transparent 70%)" : "transparent", animation: listening ? "pulse 2.5s ease-in-out infinite" : "none" }}>
                  <div style={{ position: "absolute", inset: isMobile ? "8px" : "15px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(0, 13, 26, 0.9), rgba(0, 29, 61, 0.8))", border: isMobile ? "2px solid rgba(34, 211, 238, 0.3)" : "3px solid rgba(34, 211, 238, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: listening ? "0 0 60px rgba(34, 211, 238, 0.8), 0 0 100px rgba(0, 167, 157, 0.4), inset 0 0 40px rgba(34, 211, 238, 0.2)" : "0 10px 40px rgba(0, 0, 0, 0.5)", transition: "all 0.3s", animation: listening ? "glow 2s ease-in-out infinite" : "none" }}>
                    <div style={{ position: "relative", width: isMobile ? "60px" : "160px", height: isMobile ? "60px" : "160px", borderRadius: "50%", background: listening ? "linear-gradient(135deg, #00A79D, #22D3EE)" : "linear-gradient(135deg, #1a4d7a, #003366)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: listening ? "0 10px 40px rgba(34, 211, 238, 0.6), inset 0 -8px 20px rgba(0, 0, 0, 0.4)" : "0 8px 30px rgba(0, 0, 0, 0.5), inset 0 -8px 20px rgba(0, 0, 0, 0.3)", transition: "all 0.3s", animation: listening ? "breathe 2s ease-in-out infinite" : "none" }}>
                      <svg width={isMobile ? "30" : "70"} height={isMobile ? "30" : "70"} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))" }}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-end" : "center", gap: isMobile ? "12px" : "20px", width: isMobile ? "auto" : "100%", flex: isMobile ? "1" : "initial" }}>
                <div style={{ padding: isMobile ? "8px 20px" : "12px 32px", background: listening ? "linear-gradient(135deg, rgba(0, 167, 157, 0.3), rgba(34, 211, 238, 0.3))" : "rgba(74, 106, 138, 0.2)", borderRadius: "25px", border: `2px solid ${listening ? "#00A79D" : "#4A6A8A"}`, boxShadow: listening ? "0 8px 24px rgba(0, 167, 157, 0.4), inset 0 2px 10px rgba(34, 211, 238, 0.2)" : "0 4px 12px rgba(0, 0, 0, 0.2)", transition: "all 0.3s" }}>
                  <span style={{ color: listening ? "#22D3EE" : "#F4F7F9", fontSize: isMobile ? "12px" : "16px", fontWeight: "700", textShadow: listening ? "0 0 10px rgba(34, 211, 238, 0.6)" : "none", letterSpacing: "1px" }}>{listening ? "🎙️ LISTENING" : "⏸️ STANDBY"}</span>
                </div>
                <div style={{ display: "flex", gap: isMobile ? "2px" : "3px", height: isMobile ? "50px" : "80px", alignItems: "flex-end", justifyContent: "center", width: "100%", padding: isMobile ? "0 10px" : "0 20px" }}>
                  {waveform.slice(0, isMobile ? 20 : 40).map((height, idx) => ( <div key={idx} style={{ width: isMobile ? "3px" : "5px", height: `${Math.max(8, height * 0.7)}%`, background: listening ? "linear-gradient(180deg, #22D3EE, #00A79D)" : "rgba(74, 106, 138, 0.3)", borderRadius: "3px", transition: "height 0.1s ease", boxShadow: listening ? "0 0 8px rgba(34, 211, 238, 0.6)" : "none" }} /> ))}
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(0, 13, 26, 0.6)", borderRadius: isMobile ? "20px" : "24px", padding: isMobile ? "20px" : "30px", minHeight: isMobile ? "400px" : "600px", maxHeight: isMobile ? "400px" : "600px", overflowY: "auto", border: "1px solid rgba(34, 211, 238, 0.2)", boxShadow: "inset 0 2px 20px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(0, 0, 0, 0.3)", scrollbarWidth: "thin", scrollbarColor: "#00A79D rgba(0, 13, 26, 0.5)" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#4A6A8A", fontSize: isMobile ? "13px" : "15px", padding: isMobile ? "60px 10px" : "100px 20px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: isMobile ? "60px" : "80px", height: isMobile ? "60px" : "80px", margin: isMobile ? "0 auto 20px" : "0 auto 30px", borderRadius: "50%", border: "3px dashed rgba(74, 106, 138, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", animation: "breathe 3s ease-in-out infinite" }}>
                    <svg width={isMobile ? "30" : "40"} height={isMobile ? "30" : "40"} viewBox="0 0 24 24" fill="none" stroke="#4A6A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <p style={{ margin: "0", fontWeight: "600", fontSize: isMobile ? "15px" : "18px" }}>Awaiting voice input...</p>
                  <p style={{ margin: "12px 0 0", fontSize: isMobile ? "12px" : "14px", opacity: "0.7" }}>Start speaking to begin the conversation</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: isMobile ? "16px" : "24px", display: "flex", justifyContent: msg.type === "user" ? "flex-end" : "flex-start", animation: msg.type === "user" ? "slideInRight 0.4s ease-out" : "slideInLeft 0.4s ease-out" }}>
                    <div style={{ maxWidth: isMobile ? "90%" : "85%", display: "flex", gap: isMobile ? "8px" : "12px", flexDirection: msg.type === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
                      <div style={{ width: isMobile ? "32px" : "40px", height: isMobile ? "32px" : "40px", borderRadius: "50%", background: msg.type === "user" ? "linear-gradient(135deg, #22D3EE, #00A79D)" : "linear-gradient(135deg, #4A6A8A, #003366)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)", border: "2px solid rgba(255, 255, 255, 0.1)" }}>
                        {msg.type === "user" ? ( <svg width={isMobile ? "16" : "20"} height={isMobile ? "16" : "20"} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ) : ( <svg width={isMobile ? "16" : "20"} height={isMobile ? "16" : "20"} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> )}
                      </div>
                      <div style={{ padding: isMobile ? "12px 16px" : "16px 22px", borderRadius: msg.type === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px", background: msg.type === "user" ? "linear-gradient(135deg, #22D3EE, #00A79D)" : "linear-gradient(135deg, rgba(74, 106, 138, 0.5), rgba(74, 106, 138, 0.25))", color: "#FFFFFF", fontSize: isMobile ? "13px" : "15px", lineHeight: "1.7", boxShadow: msg.type === "user" ? "0 6px 20px rgba(34, 211, 238, 0.3)" : "0 6px 20px rgba(0, 0, 0, 0.3)", border: msg.type === "user" ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(74, 106, 138, 0.3)", position: "relative" }}>
                        <div style={{ fontSize: isMobile ? "9px" : "11px", opacity: "0.85", marginBottom: isMobile ? "6px" : "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>{msg.type === "user" ? "YOU" : "ARIA AI"}</div>
                        <div style={{ fontWeight: "400" }}>{msg.text}</div>
                        {msg.type === "bot" && ( <div style={{ position: "absolute", bottom: "-10px", left: "22px", display: "flex", gap: "4px" }}>
                          {[...Array(3)].map((_, i) => ( <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00A79D", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} /> ))}
                        </div> )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

          </div>
        )}
      </div>
        </div>
      </>
  );
};

export default VoiceAssistantRent;