// import { useRef, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import TopNavigationBar from "../Dashboard/TopNavigationBar";

// export default function AIAssistant(){
//   const videoRef=useRef(null);
//   const [show,setShow]=useState(false);
//   const [input,setInput]=useState("");
//   const [inputs,setInputs]=useState([]);
//   const [current,setCurrent]=useState(0);
//   const timings = [[30, 45], [46, 65], [70, 90]];
//   const navigate=useNavigate();
//   const [user, setUser] = useState(null);

//   useEffect(()=>{
//     const v=videoRef.current;
//     const check=()=>{const t=Math.floor(v.currentTime);setCurrent(t);let s=timings.some(([a,b])=>t>=a&&t<=b);setShow(s);}
//     v.addEventListener("timeupdate",check);
//     const endListener = async () => {
//       const userRes = await fetch("http://localhost:2000/auth/me",{method:"GET",credentials:"include"});
//       const userData = await userRes.json();
//       const payload = {username: userData.username || userData.name || "",email: userData.email || "",preferences: inputs};
//       await fetch("http://localhost:2000/save-preferences",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
//       setInputs([]);
//     }
//     v.addEventListener("ended", endListener);
//     return()=>{v.removeEventListener("timeupdate",check);v.removeEventListener("ended",endListener);}
//   }, [inputs]);
//     const handleLogout = async () => {
//       await fetch("http://localhost:2000/auth/logout", {
//         method: "POST",
//         credentials: "include",
//       });
//       setUser(null);
//       navigate("/login");
//     };

//     useEffect(() => {
//       const fetchUser = async () => {
//         try {
//           const res = await fetch("http://localhost:2000/auth/me", {
//             method: "GET",
//             credentials: "include",
//           });
//           const data = await res.json();
//           if (res.ok) setUser(data);
//         } catch (err) {
//           console.error("Error fetching user:", err);
//         }
//       };
//       fetchUser();
//     }, []);

//     const navItems = ["For Buyers", "For Tenants", "For Owners", "For Dealers / Builders", "Insights"];

//   const handleInput = () => {
//     if(input.trim()!==""){setInputs(prev=>[...prev,input]);setInput("");}
//   }

//   return(
//     <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, position: "relative" }}>
//       <TopNavigationBar user= {user} navItems={navItems} handleLogout={handleLogout} />
//       <video ref={videoRef} src="/AI Video.mp4" autoPlay controls style={{width:"100%",height:"100%",objectFit:"cover"}}/>
//       {show&&<div style={{position:"absolute",top:"50%",left:"30px",transform:"translateY(-50%)",background:"linear-gradient(135deg, #003366 0%, #4A6A8A 100%)",padding:"2px",borderRadius:"16px",boxShadow:"0 10px 30px rgba(34,211,238,0.4), 0 0 20px rgba(0,167,157,0.3)",animation:"slideInLeft 0.4s cubic-bezier(0.34,1.56,0.64,1)",zIndex:1000,width:"320px"}}><div style={{background:"#F4F7F9",borderRadius:"14px",padding:"20px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 20% 50%, rgba(34,211,238,0.1) 0%, transparent 50%)",animation:"pulse 3s ease-in-out infinite",pointerEvents:"none"}}/><div style={{marginBottom:"15px",position:"relative",zIndex:1}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"5px"}}><div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#00A79D",animation:"pulseGlow 2s ease-in-out infinite",boxShadow:"0 0 15px rgba(0,167,157,0.6)"}}/><h3 style={{margin:0,color:"#003366",fontSize:"16px",fontWeight:"700"}}>AI is listening...</h3></div></div><div style={{position:"relative",marginBottom:"12px"}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleInput()} placeholder="Type your answer..." autoFocus style={{width:"100%",padding:"12px 14px",fontSize:"14px",border:"2px solid transparent",borderRadius:"10px",background:"#FFFFFF",color:"#333333",outline:"none",transition:"all 0.3s ease",boxShadow:"0 2px 10px rgba(0,51,102,0.08)",fontFamily:"system-ui,-apple-system,sans-serif"}}/></div><button onClick={handleInput} style={{width:"100%",padding:"12px",fontSize:"14px",fontWeight:"600",color:"#FFFFFF",background:"linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)",border:"none",borderRadius:"10px",cursor:"pointer",transition:"all 0.3s ease",boxShadow:"0 3px 15px rgba(0,167,157,0.3)",position:"relative",overflow:"hidden"}}>Submit</button></div></div>}
//       <style>{`@keyframes slideInLeft{from{opacity:0;transform:translateY(-50%) translateX(-30px)}to{opacity:1;transform:translateY(-50%) translateX(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}@keyframes pulseGlow{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.2);opacity:0.7}}input:focus{border-color:#22D3EE!important;box-shadow:0 2px 15px rgba(34,211,238,0.2)!important}button:hover{transform:translateY(-1px);box-shadow:0 4px 18px rgba(0,167,157,0.4)!important}button:active{transform:translateY(0)}button::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);transition:left 0.5s}button:hover::before{left:100%}`}</style>
//     </div>
//   );
// }
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavigationBar from "../Dashboard/TopNavigationBar";
import {
  MessageCircle,
  Send,
  Mic,
  Bot,
  User,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export default function AIAssistant() {
  const videoRef = useRef(null);
  const [show, setShow] = useState(false);
  const [input, setInput] = useState("");
  const [inputs, setInputs] = useState([]);
  const [current, setCurrent] = useState(0);
  const [aiQuestion, setAiQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState({});
  const timings = [
    [30, 45],
    [46, 65],
    [70, 90],
  ];
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const chatContainerRef = useRef(null);

  // Map: time (seconds) -> question
  const questionMap = {
    9: "Which locations are you most interested in?",
    17: "What is the absolute size of the property?",
    29: "What is your budget range for this property?",
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const check = () => {
      const t = Math.floor(v.currentTime);
      setCurrent(t);
      // New show calculation: show if any questionMap key has t >= time
      const s = Object.keys(questionMap).some(
        (time) => t >= parseInt(time, 10)
      );
      setShow(s);

      // Loop through questionMap keys in order
      for (const [timeStr, question] of Object.entries(questionMap)) {
        const time = parseInt(timeStr, 10);
        // If this question has not been asked and current time >= its trigger
        if (!askedQuestions[time] && t >= time) {
          setIsTyping(true);
          // Delay to show typing animation, then show question and mark as asked
          setTimeout(() => {
            setAiQuestion(question);
            setIsTyping(false);
            setAskedQuestions((prev) => ({ ...prev, [time]: true }));
          }, 800);
          break; // Only trigger one question at a time
        }
      }
    };
    v.addEventListener("timeupdate", check);

    const endListener = async () => {
      try {
        // 1. Save preferences as before
        const userRes = await fetch(`${process.env.REACT_APP_USER_ME_API}`, {
          method: "GET",
          credentials: "include",
        });
        const userData = await userRes.json();
        const payload = {
          username: userData.username || userData.name || "Guest",
          email: userData.email || "",
          preferences: inputs,
        };
        await fetch(`${process.env.REACT_APP_SAVE_PREFERENCES_API}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // 2. Generate a search query from answers
        // We'll join the answers with spaces, fallback to empty string if no answers
        const searchQuery = inputs
          .map((item) => (typeof item === "string" ? item : (item && item.answer) || ""))
          .filter(Boolean)
          .join(" ");

        // 3. Clear the inputs state before redirecting
        setInputs([]);

        // 4. Redirect to /search/:query with encoded query
        if (searchQuery.trim()) {
          navigate(`/search/${encodeURIComponent(searchQuery)}`);
        }
      } catch (error) {
        console.error("Error saving preferences or redirecting:", error);
      }
    };
    v.addEventListener("ended", endListener);

    return () => {
      v.removeEventListener("timeupdate", check);
      v.removeEventListener("ended", endListener);
    };
  }, [inputs, askedQuestions]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [inputs, aiQuestion, isTyping]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_LOGOUT_API}`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_USER_ME_API}`, {
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

  const navItems = [
    "For Buyers",
    "For Tenants",
    "For Owners",
    "For Dealers / Builders",
    "Insights",
  ];

  const handleInput = () => {
    if (input.trim() !== "") {
      setInputs((prev) => [
        ...prev,
        { question: aiQuestion, answer: input.trim() },
      ]);
      setInput("");
      setAiQuestion("");
    }
  };

  return (
    <div className="app-container">
      <TopNavigationBar
        user={user}
        navItems={navItems}
        handleLogout={handleLogout}
      />

      <div className="main-content">
        {/* Video Section */}
        <div className="video-section">
          <video
            ref={videoRef}
            src="/AI Video1.mp4"
            autoPlay
            controls
            className="video-player"
          />

          {/* AI Status Badge */}
          <div className="status-badge">
            <div className={`status-indicator ${show ? "active" : ""}`} />
            <span className="status-text">
              {show ? "AI Assistant Active" : "Standby Mode"}
            </span>
            {show && <Sparkles size={14} className="sparkle-icon" />}
          </div>

          {/* Video Overlay Info */}
          <div className="video-overlay">
            <div className="overlay-content">
              <Bot size={32} className="overlay-icon" />
              <h3>Interactive Property Consultation</h3>
              <p>Our AI will guide you through personalized questions</p>
            </div>
          </div>
        </div>

        {/* Enhanced Chat Panel */}
        <div className="chat-panel">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="header-content">
              <div className="ai-avatar">
                <Bot size={24} strokeWidth={2.5} />
                <div className="avatar-pulse" />
              </div>
              <div className="header-text">
                <h2>AI Property Consultant</h2>
                <p className="header-subtitle">
                  {show ? (
                    <span className="status-live">
                      <span className="live-dot" />
                      Live Session
                    </span>
                  ) : (
                    "Powered by Advanced AI"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div ref={chatContainerRef} className="chat-messages">
            {inputs.length === 0 && !show && !isTyping && (
              <div className="welcome-screen">
                <div className="welcome-icon-wrapper">
                  <div className="welcome-icon">
                    <Mic size={32} strokeWidth={2} />
                  </div>
                  <div className="icon-ring ring-1" />
                  <div className="icon-ring ring-2" />
                  <div className="icon-ring ring-3" />
                </div>
                <h3 className="welcome-title">
                  Welcome to Your Personal Property Consultation
                </h3>
                <p className="welcome-description">
                  During this interactive session, our AI will ask tailored
                  questions to understand your property preferences. Your
                  responses will help us curate the perfect matches for you.
                </p>
                <div className="welcome-features">
                  <div className="feature-item">
                    <Sparkles size={16} />
                    <span>Intelligent Analysis</span>
                  </div>
                  <div className="feature-item">
                    <MessageCircle size={16} />
                    <span>Real-time Interaction</span>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation History */}
            {inputs.map((item, idx) => (
              <div key={idx} className="message-group">
                {/* AI Question */}
                <div className="message-wrapper ai-message">
                  <div className="message-avatar ai-avatar-small">
                    <Bot size={16} />
                  </div>
                  <div className="message-bubble ai-bubble">
                    <div className="message-header">
                      <span className="message-sender">AI Consultant</span>
                      <span className="message-time">Question {idx + 1}</span>
                    </div>
                    <p className="message-text">{item.question}</p>
                  </div>
                </div>

                {/* User Answer */}
                <div className="message-wrapper user-message">
                  <div className="message-bubble user-bubble">
                    <div className="message-header">
                      <span className="message-sender">You</span>
                    </div>
                    <p className="message-text">{item.answer}</p>
                  </div>
                  <div className="message-avatar user-avatar-small">
                    <User size={16} />
                  </div>
                </div>
              </div>
            ))}

            {/* Current AI Question */}
            {show && aiQuestion && !isTyping && (
              <div className="message-wrapper ai-message current-question">
                <div className="message-avatar ai-avatar-small">
                  <Bot size={16} />
                </div>
                <div className="message-bubble ai-bubble">
                  <div className="message-header">
                    <span className="message-sender">AI Consultant</span>
                    <span className="message-badge">New</span>
                  </div>
                  <p className="message-text">{aiQuestion}</p>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="message-wrapper ai-message">
                <div className="message-avatar ai-avatar-small">
                  <Bot size={16} />
                </div>
                <div className="message-bubble ai-bubble typing-bubble">
                  <div className="typing-indicator">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              </div>
            )}

            {/* Scroll to Bottom Hint */}
            {inputs.length > 2 && (
              <div className="scroll-hint">
                <ChevronDown size={16} />
              </div>
            )}
          </div>

          {/* Enhanced Input Area */}
          <div className="input-container">
            {show && aiQuestion && !isTyping ? (
              <div className="input-wrapper">
                <div className="input-field-wrapper">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleInput()
                    }
                    placeholder="Type your response here..."
                    className="chat-input"
                    autoFocus
                  />
                  <button
                    onClick={handleInput}
                    disabled={!input.trim()}
                    className={`send-button ${
                      input.trim() ? "active" : "disabled"
                    }`}
                  >
                    <Send size={20} />
                  </button>
                </div>
                <div className="input-hint">
                  Press Enter to send • {input.length}/500
                </div>
              </div>
            ) : (
              <div className="waiting-state">
                <div className="waiting-content">
                  {inputs.length === 0 ? (
                    <>
                      <Sparkles size={18} className="waiting-icon" />
                      <span>Start the video to begin your consultation</span>
                    </>
                  ) : (
                    <>
                      <div className="pulse-dot" />
                      <span>Awaiting next question...</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .app-container {
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }

        .main-content {
          flex: 1;
          display: flex;
          position: relative;
          overflow: hidden;
        }

        /* Video Section Styles */
        .video-section {
          flex: 1;
          position: relative;
          background: #000;
          overflow: hidden;
        }

   .video-player {
  width: 100%;            /* full width of container */
  max-width: 720px;       /* optional, limit width */
  aspect-ratio: 16 / 9;   /* maintain 16:9 ratio */
  object-fit: contain;     /* no cropping, entire video visible */
  display: block;
  margin: 0 auto;          /* center horizontally */
  height: 100%;
  border-radius: 12px;     /* optional, rounded corners */
}

        .status-badge {
          position: absolute;
          top: 24px;
          left: 24px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          padding: 12px 24px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .status-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #64748b;
          transition: all 0.3s ease;
        }

        .status-indicator.active {
          background: #06b6d4;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.4);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .status-text {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .sparkle-icon {
          color: #06b6d4;
          animation: sparkle 1.5s ease-in-out infinite;
        }

        .video-overlay {
          position: absolute;
          bottom: 32px;
          left: 32px;
          right: 32px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
          backdrop-filter: blur(20px);
          padding: 24px 32px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          z-index: 5;
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.6s ease-out 0.5s forwards;
        }

        .overlay-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .overlay-icon {
          color: #06b6d4;
          flex-shrink: 0;
        }

        .video-overlay h3 {
          margin: 0 0 4px 0;
          color: #fff;
          font-size: 18px;
          font-weight: 700;
        }

        .video-overlay p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        /* Chat Panel Styles */
        .chat-panel {
          width: 480px;
          background: #fff;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 40px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .chat-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .chat-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%);
          pointer-events: none;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .ai-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          position: relative;
          box-shadow: 0 8px 24px rgba(6, 182, 212, 0.4);
        }

        .avatar-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #06b6d4;
          animation: avatar-pulse 2s ease-in-out infinite;
        }

        .header-text h2 {
          margin: 0 0 4px 0;
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .header-subtitle {
          margin: 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-live {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #06b6d4;
          font-weight: 600;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #06b6d4;
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Chat Messages Styles */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: linear-gradient(to bottom, #f8fafc 0%, #fff 100%);
          scroll-behavior: smooth;
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Welcome Screen */
        .welcome-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 48px 32px;
          text-align: center;
        }

        .welcome-icon-wrapper {
          position: relative;
          margin-bottom: 32px;
        }

        .welcome-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 12px 40px rgba(6, 182, 212, 0.3);
          position: relative;
          z-index: 2;
        }

        .icon-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid #06b6d4;
          opacity: 0;
        }

        .ring-1 {
          inset: -8px;
          animation: ring-pulse 2s ease-out infinite;
        }

        .ring-2 {
          inset: -16px;
          animation: ring-pulse 2s ease-out 0.3s infinite;
        }

        .ring-3 {
          inset: -24px;
          animation: ring-pulse 2s ease-out 0.6s infinite;
        }

        .welcome-title {
          margin: 0 0 12px 0;
          color: #0f172a;
          font-size: 20px;
          font-weight: 700;
          line-height: 1.4;
        }

        .welcome-description {
          margin: 0 0 24px 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.6;
          max-width: 380px;
        }

        .welcome-features {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #f1f5f9;
          border-radius: 100px;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
        }

        /* Message Styles */
        .message-group {
          margin-bottom: 24px;
        }

        .message-wrapper {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          animation: messageSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ai-message {
          justify-content: flex-start;
        }

        .user-message {
          justify-content: flex-end;
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .ai-avatar-small {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }

        .user-avatar-small {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
        }

        .message-bubble {
          max-width: 75%;
          padding: 16px 20px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .message-bubble:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .ai-bubble {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-top-left-radius: 4px;
        }

        .user-bubble {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          border-top-right-radius: 4px;
        }

        .message-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          gap: 12px;
        }

        .message-sender {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.7;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.5;
        }

        .message-badge {
          background: #06b6d4;
          color: #fff;
          padding: 2px 8px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .message-text {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          color: inherit;
        }

        .current-question {
          animation: messageSlide 0.5s cubic-bezier(0.4, 0, 0.2, 1), glow 2s ease-in-out infinite;
        }

        .typing-bubble {
          padding: 12px 20px;
        }

        .typing-indicator {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .typing-indicator .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #06b6d4;
          animation: typing 1.4s ease-in-out infinite;
        }

        .typing-indicator .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        .scroll-hint {
          position: absolute;
          bottom: 80px;
          right: 24px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          animation: bounce 2s ease-in-out infinite;
          cursor: pointer;
        }

        /* Input Area Styles */
        .input-container {
          padding: 20px 24px;
          background: #fff;
          border-top: 1px solid #e2e8f0;
        }

        .input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-field-wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .chat-input {
          flex: 1;
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: all 0.3s ease;
          background: #f8fafc;
          resize: none;
        }

        .chat-input:focus {
          border-color: #06b6d4;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }

        .send-button {
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .send-button.active {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(6, 182, 212, 0.3);
        }

        .send-button.active:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 24px rgba(6, 182, 212, 0.4);
        }

        .send-button.active:active {
          transform: translateY(0) scale(0.98);
        }

        .send-button.disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .input-hint {
          font-size: 12px;
          color: #94a3b8;
          padding: 0 4px;
        }

        .waiting-state {
          padding: 16px 20px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
        }

        .waiting-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .waiting-icon {
          color: #06b6d4;
          animation: sparkle 1.5s ease-in-out infinite;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #06b6d4;
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Animations */
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.6);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(6, 182, 212, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0);
          }
        }

        @keyframes sparkle {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }

        }

        @keyframes bounce {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
