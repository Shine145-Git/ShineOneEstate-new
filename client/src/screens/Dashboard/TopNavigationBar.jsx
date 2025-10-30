import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  ChevronDown,
  Bell,
  User,
  Bot,
  Square,
  LogOut,
} from "lucide-react";
import SideMenuBar from "./SideMenu";
import Location from "./Location";
import SavedProperties from "./savedproperties";

const TopNavigationBar = ({ user, handleLogout, navItems = [] }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Buy");
  const [hoveredCard, setHoveredCard] = useState(null);

  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);

  // Media query state for responsive design
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [isMediumScreen, setIsMediumScreen] = useState(window.innerWidth < 1024);

  // --- Preference Popup State ---
  const [showPreferencePopup, setShowPreferencePopup] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      setIsMediumScreen(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch saved properties from API
  useEffect(() => {
    console.log("Fetching saved properties from API...");
    axios
      .get(process.env.REACT_APP_FETCHING_SAVED_PROPERTIES, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("Fetched saved properties successfully:", response.data);
        setProperties(response.data);
      })
      .catch((error) => {
        console.error("Error fetching saved properties:", error);
      });
  }, []);

  // Show preference popup on login/component load, but only on dashboard route
  useEffect(() => {
    if (user && location.pathname === "/") {
      setShowPreferencePopup(true);
    }
  }, [user, location]);

  return (
  <>
  <nav
    style={{
      backgroundColor: "#003366",
      padding: "10px 4%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      position: "relative",
      zIndex: 1000,
    }}
  >
    <div style={{ position: "relative" }}>
      <Menu
        size={24}
        color="#FFFFFF"
        style={{ cursor: "pointer", display: "block" }}
        onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
      />
      {isSideMenuOpen && <SideMenuBar
        currentUser={user}
        onLoginClick={() => { navigate('/login'); }}
      />}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <div
        style={{
          fontSize: isSmallScreen ? "20px" : "28px",
          fontWeight: "700",
          color: "#FFFFFF",
          letterSpacing: "0.2px",
          marginRight: "2px",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => navigate("/")}
      >
        ggnRentalDeals
      </div>
      
      
    </div>

    {/* Nav items - hidden on screens smaller than 1024px */}
    <div 
      style={{ 
        display: isMediumScreen ? "none" : "flex",
        gap: "28px", 
        alignItems: "center",
      }}
    >
      {navItems.map((item, idx) => (
        <a
          key={idx}
          href="#"
          style={{
            color: "#FFFFFF",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "400",
            transition: "opacity 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {item}
        </a>
      ))}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: isSmallScreen ? "12px" : "16px" }}>
      {/* AI Search Button */}
      <button
        style={{
          padding: isSmallScreen ? "8px 12px" : "8px 20px",
          backgroundColor: "#00A79D",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "6px",
          fontSize: isSmallScreen ? "12px" : "13px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.3s ease",
          whiteSpace: "nowrap",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#22D3EE";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 211, 238, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#00A79D";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
        onClick={() => {
          if (user) navigate(`${process.env.REACT_APP_AI_ASSISTANT_PAGE}`);
          else navigate(`${process.env.REACT_APP_LOGIN_PAGE}`);
        }}
      >
        <span>{isSmallScreen ? "ARIA" : "ARIA"}</span>
        <span
          style={{
            backgroundColor: "#FFFFFF",
            color: "#00A79D",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: "700",
          }}
        >
          FREE
        </span>
      </button>

      {/* Post Property Button - hidden on screens smaller than 768px */}
      {!isSmallScreen && (
        <button
          style={{
            padding: "8px 20px",
            backgroundColor: "#00A79D",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#22D3EE";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 211, 238, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00A79D";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
          onClick={() => {
            if (user) navigate(`${process.env.REACT_APP_ADD_PROPERTY_PAGE}`);
            else navigate(`${process.env.REACT_APP_LOGIN_PAGE}`);
          }}
          
        >
          <span>Post property</span>
          <span
            style={{
              backgroundColor: "#FFFFFF",
              color: "#00A79D",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: "700",
            }}
          >
            FREE
          </span>
        </button>
      )}



      <Location 
        size={20} 
        color="#FFFFFF" 
        style={{ 
          cursor: "pointer",
          flexShrink: 0,
        }} 
      />

      <div style={{ position: "relative" }}>
        <User
          size={20}
          color="#FFFFFF"
          style={{ 
            cursor: "pointer",
            flexShrink: 0,
          }}
          onClick={() => setShowMenu(!showMenu)}
        />
        {showMenu && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              minWidth: "200px",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              padding: "1rem",
              zIndex: 1001,
            }}
          >
            {user ? (
              <>
                <div
                  style={{
                    marginBottom: "0.75rem",
                    fontWeight: "700",
                    color: "#000000",
                    fontSize: "0.95rem",
                  }}
                >
                  Hi, {user.name || user.email}
                </div>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    width: "100%",
                    padding: "1rem 1.5rem",
                    backgroundColor: "transparent",
                    color: "#333333",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease",
                    borderRadius: "8px",
                  }}
                  onClick={() => navigate("/rewards")}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F4F7F9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Bot size={20} color="#4A6A8A" />
                  <span>Rewards</span>
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    width: "100%",
                    padding: "1rem 1.5rem",
                    backgroundColor: "transparent",
                    color: "#333333",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease",
                    borderRadius: "8px",
                  }}
                  onClick={() => navigate("/my-properties")}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F4F7F9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Square size={20} color="#4A6A8A" />
                  <span>Properties</span>
                </button>
                      {/* Saved Properties Button
      <button
        style={{
          padding: "8px 20px",
          backgroundColor: "#00A79D",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.3s ease",
          whiteSpace: "nowrap",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#22D3EE";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 211, 238, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#00A79D";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
        onClick={() => {
          navigate("/savedproperties", { state: { savedProperties: properties } });
        }}
      >
        <span>Saved Properties</span>
      </button> */}
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    width: "100%",
                    padding: "1rem 1.5rem",
                    backgroundColor: "transparent",
                    color: "#333333",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease",
                    borderRadius: "8px",
                  }}
                  onClick={() => navigate("/support")}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F4F7F9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Bot size={20} color="#4A6A8A" />
                  <span>Customer Support</span>
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    width: "100%",
                    padding: "1rem 1.5rem",
                    marginTop: "0.5rem",
                    backgroundColor: "transparent",
                    color: "#333333",
                    border: "none",
                    borderTop: "1px solid #F4F7F9",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease",
                    borderRadius: "8px",
                  }}
                  onClick={handleLogout}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F4F7F9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <LogOut size={20} color="#4A6A8A" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <button
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  backgroundColor: "#003366",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onClick={() => navigate("/login")}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#004488")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#003366")
                }
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  </nav>

  {/* --- Preference Popup Modal --- */}
  {showPreferencePopup && (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.55)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.3s",
        animation: "fadeInBackdrop 0.36s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          width: isSmallScreen ? "90%" : "40%",
          maxWidth: "480px",
          minWidth: isSmallScreen ? "unset" : "340px",
          padding: isSmallScreen ? "1.3rem 1rem" : "2.3rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          animation: "scaleFadeInPopup 0.36s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div
          style={{
            fontSize: isSmallScreen ? "1.15rem" : "1.5rem",
            fontWeight: 700,
            marginBottom: isSmallScreen ? "0.5rem" : "0.7rem",
            color: "#003366",
            letterSpacing: "0.01em",
          }}
        >
          ✨ Personalize Your Experience
        </div>
        <div
          style={{
            fontSize: isSmallScreen ? "0.97rem" : "1.07rem",
            fontWeight: 400,
            color: "#3c4f68",
            marginBottom: isSmallScreen ? "1.2rem" : "1.7rem",
            lineHeight: 1.5,
          }}
        >
          Tell us your preferences to get smarter property matches.
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            gap: isSmallScreen ? "0.75rem" : "1.2rem",
            width: "100%",
            justifyContent: "center",
            marginTop: isSmallScreen ? "0.1rem" : "0.2rem",
          }}
        >
          <button
            onClick={() => {
              setShowPreferencePopup(false);
              navigate(`${process.env.REACT_APP_AI_ASSISTANT_PAGE}`);
            }}
            style={{
              flex: 1,
              padding: isSmallScreen ? "0.65rem 0.5rem" : "0.75rem 1.2rem",
              background: "linear-gradient(90deg, #00A79D 0%, #22D3EE 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: isSmallScreen ? "1rem" : "1.08rem",
              cursor: "pointer",
              marginBottom: isSmallScreen ? "0.15rem" : 0,
              boxShadow: "0 2px 8px rgba(34,211,238,0.13)",
              transition: "background 0.2s, transform 0.18s",
              outline: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(90deg, #22D3EE 0%, #00A79D 100%)")}
            onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(90deg, #00A79D 0%, #22D3EE 100%)")}
          >
            Set Preferences
          </button>
          <button
            onClick={() => setShowPreferencePopup(false)}
            style={{
              flex: 1,
              padding: isSmallScreen ? "0.65rem 0.5rem" : "0.75rem 1.2rem",
              background: "#f5f7fa",
              color: "#003366",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: isSmallScreen ? "1rem" : "1.08rem",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              transition: "background 0.2s, color 0.2s",
              outline: "none",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#e2e8f0";
              e.currentTarget.style.color = "#00A79D";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#f5f7fa";
              e.currentTarget.style.color = "#003366";
            }}
          >
            Maybe Later
          </button>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleFadeInPopup {
          from { opacity: 0; transform: scale(0.93);}
          to { opacity: 1; transform: scale(1);}
        }
      `}</style>
    </div>
  )
  }
  </>
);
};

export default TopNavigationBar;