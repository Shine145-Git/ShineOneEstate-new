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

// --- BEGIN AI+MIC ENHANCED IMPLEMENTATION ---
export default function AIAssistant() {
  const videoRef = useRef(null);
  const [show, setShow] = useState(false);
  const [input, setInput] = useState("");
  const [inputs, setInputs] = useState([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState({});
  const [micActive, setMicActive] = useState(false);
  const [micListening, setMicListening] = useState(false);
  // Show the new "Start Consultation" button at page load
  const [consultationStarted, setConsultationStarted] = useState(false);
  // Send type state (email, whatsapp, call)
  const [sendType, setSendType] = useState("");
  const [micPromptVisible, setMicPromptVisible] = useState(false);
  const micButtonRef = useRef(null);
  const [micAutoFocus, setMicAutoFocus] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(-1);
  const [questionTimeout, setQuestionTimeout] = useState(null);
  const [videoWasPaused, setVideoWasPaused] = useState(false);
  const [user, setUser] = useState(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const questionStartTimeRef = useRef(null);

  // Questions timeline as per requirements, with final sendType question
  const questionsTimeline = [
    {
      start: 12,
      end: 19,
      text: "First, could you please tell me your budget range? This helps me filter properties that fit your financial plan.",
    },
    {
      start: 20,
      end: 25,
      text: "Are you looking to rent a property or buy one? This will help me tailor options for you.",
    },
    {
      start: 26,
      end: 31,
      text: "Will this property be for personal use or are you planning to share it with roommates/family?",
    },
    {
      start: 32,
      end: 41,
      text: "Which location or area are you interested in? You can specify sectors, neighborhoods, or even nearby landmarks.",
    },
    {
      start: 42,
      end: 51,
      text: "What type of property are you looking for? Options include apartment, villa, independent floor, studio, or commercial space.",
    },
    {
      start: 52,
      end: 57,
      text: "Do you have a preference for the size of the property (in sq ft or number of bedrooms)?",
    },
    {
      start: 58,
      end: 66,
      text: "Which amenities are important to you? For example: parking, gym, swimming pool, security, pet-friendly, etc.",
    },
    {
      start: 67,
      end: 71,
      text: "Do you have any preference for the floor level or the orientation/view of the property?",
    },
    {
      start: 72,
      end: 78,
      text: "When are you looking to move in? Do you need something immediate or flexible over the next few months?",
    },
    {
      start: 79,
      end: 86,
      text: "Do you require home loan or financing assistance? We can guide you with verified financial partners if needed.",
    },
    {
      start: 87,
      end: 96,
      text: "Any other preferences or requirements? For example, eco-friendly properties, furnished options, gated communities, or school proximity?",
    },
    // Final sendType question (no time, will be shown after last question is answered)
    {
      start: null,
      end: null,
      text: "How would you like to receive your property matches and consultation summary? Please reply with 'email', 'whatsapp', or 'call'.",
    },
  ];

  // --- Microphone and Speech Recognition ---
  // Helper to get SpeechRecognition cross-browser
  function getSpeechRecognition() {
    return (
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition
    );
  }

  // Manual mic button (one-shot, only on click)
  const startMic = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return false;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    let recognition;
    try {
      recognition = new SpeechRecognition();
    } catch (e) {
      return false;
    }
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognition.onstart = () => {
      setMicListening(true);
      setMicActive(true);
    };
    recognition.onend = () => {
      setMicListening(false);
      setMicActive(false);
    };
    recognition.onerror = (event) => {
      setMicListening(false);
      setMicActive(false);
    };
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      // Use as answer (manual)
      handleManualSpeechInput(transcript.trim());
      setMicListening(false);
      setMicActive(false);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      return true;
    } catch (err) {
      return false;
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setMicListening(false);
    setMicActive(false);
  };

  // Handle manual mic answer
  const handleManualSpeechInput = async (text) => {
    if (text.trim() !== "" && aiQuestion && currentQuestionIdx >= 0) {
      const capturedAnswer = text.trim();
      const questionText = aiQuestion;

      // If final question (sendType)
      if (currentQuestionIdx === questionsTimeline.length - 1) {
  setSendType(capturedAnswer.toLowerCase());
  setInputs((prev) => [
    ...prev,
    { question: questionText, answer: capturedAnswer },
  ]);
  if (questionTimeout) {
    clearTimeout(questionTimeout);
    setQuestionTimeout(null);
  }
  setAiQuestion("");
  setShow(false);
  setInput(""); // if text input
  return; // Don't send yet, wait until endListener
}

      setInputs((prev) => [
        ...prev,
        { question: questionText, answer: capturedAnswer },
      ]);
      // Clear question timeout if any
      if (questionTimeout) {
        clearTimeout(questionTimeout);
        setQuestionTimeout(null);
      }
      setAiQuestion("");
      setShow(false);
      // Resume video
      if (videoRef.current && videoRef.current.paused) videoRef.current.play();
      // No longer send to backend here; will send all at once at end
    }
  };
const finalizeConsultation = async () => {
  if (!inputsRef.current || inputsRef.current.length === 0) return;

  const keyQuestions = [
    questionsTimeline[0].text,
    questionsTimeline[1].text,
    questionsTimeline[3].text,
  ];

  const answersToQuestions = inputsRef.current
    .filter((item) => keyQuestions.includes(item.question))
    .map((item) => item.answer)
    .filter(Boolean)
    .join(" ");

  console.log("Final search query:", answersToQuestions);

  // --- Save all inputs to backend ---
  try {
    if (user && user.email && process.env.REACT_APP_AI_SAVE_API) {
      await fetch(process.env.REACT_APP_AI_SAVE_API, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          sendType: sendType || "email", // fallback to email
          responses: inputsRef.current,
        }),
      });
    }
  } catch (err) {
    console.error("Error saving AI responses:", err);
  }

  setInputs([]); // clear local state if desired

  // Navigate to search
  if (answersToQuestions.trim()) {
    navigate(`/search/${encodeURIComponent(answersToQuestions)}`);
  }
};

  // Handle text input (manual)
  const handleInput = async () => {
    if (input.trim() !== "" && aiQuestion && currentQuestionIdx >= 0) {
      const capturedAnswer = input.trim();
      const questionText = aiQuestion;

      // If final question (sendType)
     if (currentQuestionIdx === questionsTimeline.length - 1) {
  setSendType(capturedAnswer.toLowerCase());
  setInputs((prev) => [
    ...prev,
    { question: questionText, answer: capturedAnswer },
  ]);

  if (questionTimeout) {
    clearTimeout(questionTimeout);
    setQuestionTimeout(null);
  }

  setAiQuestion("");
  setShow(false);
  setInput("");

  // Immediately navigate to search
  finalizeConsultation();
  return;
}

      setInputs((prev) => [
        ...prev,
        { question: questionText, answer: capturedAnswer },
      ]);
      // Clear question timeout if any
      if (questionTimeout) {
        clearTimeout(questionTimeout);
        setQuestionTimeout(null);
      }
      setInput("");
      setAiQuestion("");
      setShow(false);
      // Resume video
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play();
      }
      // No longer send to backend here; will send all at once at end
    }
  };

  // --- Video & Question Flow ---
  // Main effect: video time monitoring, triggers
  // Ref to always get latest inputs in handlers (avoid stale closure)
  const inputsRef = useRef(inputs);
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Handler for video time update (fixed: uses ref for inputs, ensures only one timeout)
    function handleTimeUpdate() {
      const t = v.currentTime;
      // Find if a question is being asked (for overlay only)
      const idx = questionsTimeline.findIndex(
        (q) => t >= q.start && t <= q.end
      );
      // Show overlay when question is being asked
      if (idx !== -1 && !askedQuestions[idx] && idx !== currentQuestionIdx) {
        setCurrentQuestionIdx(idx);
        setIsTyping(true);
        setTimeout(() => {
          setAiQuestion(questionsTimeline[idx].text);
          setIsTyping(false);
          setShow(true);
          setAskedQuestions((prev) => ({ ...prev, [idx]: true }));
        }, 600);
      }

      // Detect when question ends (video crosses a question end time)
      // Only mark as not answered if not already answered (using latest inputs)
      for (let i = 0; i < questionsTimeline.length - 1; i++) {
        const q = questionsTimeline[i];
        if (
          t >= q.end &&
          !inputsRef.current.find((item) => item.question === q.text)
        ) {
          // Pause video
          v.pause();
          // Only one active timeout at a time
          if (questionTimeout) clearTimeout(questionTimeout);
          const timeout = setTimeout(async () => {
            // On timeout, submit "(No answer given)" if still not answered
            if (!inputsRef.current.find((item) => item.question === q.text)) {
              setInputs((prev) => [
                ...prev,
                { question: q.text, answer: "(No answer given)" },
              ]);
              // No longer send to backend here; will send all at once at end
            }
            setAiQuestion("");
            setShow(false);
            if (v.paused) v.play();
          }, 20000);
          setQuestionTimeout(timeout);
          break; // Only trigger for one question at a time
        }
      }
    }

    v.addEventListener("timeupdate", handleTimeUpdate);
   
    // If video is ended, save all responses and sendType in one POST
const endListener = async () => {
  try {
    const sendTypeQuestion = questionsTimeline[questionsTimeline.length - 1];
    const sendTypeAnswered = inputs.find(
      (item) => item.question === sendTypeQuestion.text
    );

    // If final sendType question not answered yet
    if (!sendTypeAnswered) {
      setAiQuestion(sendTypeQuestion.text);
      setShow(true);
      setCurrentQuestionIdx(questionsTimeline.length - 1);
      return; // Wait for user input before saving
    }

  

  } catch (error) {
    console.error("Error saving preferences or redirecting:", error);
  }
};
    v.addEventListener("ended", endListener);

    // Cleanup
    return () => {
      v.removeEventListener("timeupdate", handleTimeUpdate);
      v.removeEventListener("ended", endListener);
      if (questionTimeout) clearTimeout(questionTimeout);
    };
    // eslint-disable-next-line
  }, [inputs, askedQuestions, currentQuestionIdx, consultationStarted]);

  // Scroll chat to bottom on new message/question
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [inputs, aiQuestion, isTyping]);

  // Cleanup mic and pause video on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      stopMic();
    };
    // eslint-disable-next-line
  }, []);

  // Remove fallback mic prompt logic for every question

  // Fetch user
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

  // --- UI ---
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
            <div
              className={`status-indicator ${show ? "active" : ""} ${
                micActive ? "mic-on" : ""
              }`}
            />
            <span className="status-text">
              {show
                ? micActive
                  ? "Listening..."
                  : "AI Assistant Active"
                : "Standby Mode"}
            </span>
            {(show || micActive) && (
              <Mic
                size={14}
                className={`mic-icon ${micActive ? "mic-on" : ""}`}
              />
            )}
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
        {/* Chat Panel */}
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
                  {show || micActive ? (
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
            {/* Show Start Consultation button if not started */}
            {!consultationStarted && (
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
                <button
                  className="mic-prompt-btn"
                  style={{ marginTop: 28 }}
                  onClick={() => {
                    setConsultationStarted(true);
                  }}
                >
                  <Mic size={20} style={{ marginRight: 8 }} />
                  Start Consultation
                </button>
              </div>
            )}
            {consultationStarted && (
              <>
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
                          <span className="message-sender">
                            ggnRentalDeals AI
                          </span>
                          <span className="message-time">
                            {idx < questionsTimeline.length - 1
                              ? `Question ${idx + 1}`
                              : "Preference"}
                          </span>
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
              </>
            )}
          </div>
          {/* Enhanced Input Area */}
          <div className="input-container">
            {/* Only show input controls if consultation started */}
            {consultationStarted ? (
              show && aiQuestion && !isTyping ? (
                <div className="input-wrapper">
                  <div className="input-field-wrapper">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && !e.shiftKey && handleInput()
                      }
                      placeholder="Type your response here or speak..."
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
                    <button
                      onClick={() => {
                        if (!micActive) startMic();
                        else stopMic();
                      }}
                      className={`send-button mic-btn ${
                        micActive ? "active" : ""
                      }`}
                      title={micActive ? "Stop mic" : "Start mic"}
                      style={{
                        marginLeft: 8,
                        background: micActive ? "#06b6d4" : "#e2e8f0",
                        color: micActive ? "#fff" : "#64748b",
                      }}
                    >
                      <Mic size={20} className={micActive ? "mic-on" : ""} />
                    </button>
                  </div>
                  <div className="input-hint">
                    Speak or type your answer • {input.length}/500
                  </div>
                  {(micActive || micListening) && (
                    <div className="mic-visualizer">
                      <div className="mic-dot mic-dot-1" />
                      <div className="mic-dot mic-dot-2" />
                      <div className="mic-dot mic-dot-3" />
                    </div>
                  )}
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
              )
            ) : null}
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
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #64748b;
          transition: all 0.3s ease;
          border: 2px solid #fff;
          position: relative;
        }
        .status-indicator.active {
          background: #06b6d4;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.4);
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .status-indicator.mic-on {
          background: #22d3ee;
          box-shadow: 0 0 20px #22d3ee, 0 0 40px #06b6d4;
          animation: pulse-glow-mic 1.2s infinite;
        }
        .mic-icon {
          color: #64748b;
          margin-left: 2px;
        }
        .mic-icon.mic-on {
          color: #22d3ee;
          animation: pulse-glow-mic 1.2s infinite;
        }
        .mic-btn {
          margin-left: 0;
        }
        .mic-visualizer {
          display: flex;
          gap: 4px;
          margin-top: 8px;
        }
        .mic-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22d3ee;
          opacity: 0.8;
          animation: mic-dot-bounce 1s infinite;
        }
        .mic-dot-2 {
          animation-delay: 0.2s;
        }
        .mic-dot-3 {
          animation-delay: 0.4s;
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
        @keyframes pulse-glow-mic {
          0% { box-shadow: 0 0 0 0 #22d3ee; }
          50% { box-shadow: 0 0 0 8px #22d3ee33; }
          100% { box-shadow: 0 0 0 0 #22d3ee; }
        }
        @keyframes mic-dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(-8px); opacity: 1; }
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
// --- END AI+MIC ENHANCED IMPLEMENTATION ---
<style>{`
  .mic-prompt-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 0 18px 0;
  }
  .mic-prompt-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    padding: 14px 28px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(6,182,212,0.25);
    cursor: pointer;
    outline: none;
    transition: all 0.2s;
  }
  .mic-prompt-btn:focus {
    box-shadow: 0 0 0 3px #22d3ee90;
  }
  .mic-prompt-btn:hover {
    background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
    transform: scale(1.04);
  }
  .mic-prompt-desc {
    color: #64748b;
    font-size: 13px;
    text-align: center;
  }
`}</style>;
