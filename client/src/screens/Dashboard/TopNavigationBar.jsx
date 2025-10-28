import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      setIsMediumScreen(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch saved properties from API
  React.useEffect(() => {
    console.log("Fetching saved properties from API...");
    axios
      .get("http://localhost:2000/api/property-analysis/saved-properties", {
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

return (
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
        <span>{isSmallScreen ? "AI" : "AI Search"}</span>
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
);
};

export default TopNavigationBar;