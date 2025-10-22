import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Menu, ChevronDown, Bell, User, Bot, Square, LogOut } from 'react-icons/your-icon-library';
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    if (user) {
      try {
        await fetch(
          `http://localhost:2000/api/search-properties?query=${encodeURIComponent(
            searchQuery.trim()
          )}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        // console.log("Search history sent successfully");
      } catch (err) {
        console.error("Error sending search history:", err);
      }
    }
    navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <nav
      style={{
        backgroundColor: "#003366",
        padding: "15px 6%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ position: "relative" }}>
        <Menu
          size={24}
          color="#FFFFFF"
          style={{ cursor: "pointer" }}
          onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
        />
        {isSideMenuOpen && <SideMenuBar />}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#FFFFFF",
            letterSpacing: "-0.3px",
            marginRight: "2px",
          }}
          onClick={() => navigate("/")}
        >
          ShineOneEstate
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            backgroundColor: "rgba(255,255,255,0.1)",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <span
            style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: "500" }}
          >
            All India
          </span>
          <ChevronDown size={16} color="#FFFFFF" />
        </div>
      </div>
      <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
        {navItems.map((item, idx) => (
          <a
            key={idx}
            href="#"
            style={{
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "400",
              transition: "opacity 0.2s",
              display: window.innerWidth < 1024 ? "none" : "block",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            {item}
          </a>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Navigation URL configurable via .env */}
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
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#22D3EE";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#00A79D";
            e.target.style.transform = "translateY(0)";
          }}
          onClick={() => {
            if (user) navigate(`${process.env.REACT_APP_AI_ASSISTANT_PAGE}`);
            else navigate(`${process.env.REACT_APP_LOGIN_PAGE}`);
          }}
        >
          AI Search{" "}
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
        {/* Navigation URL configurable via .env */}
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
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#22D3EE";


            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#00A79D";
            e.target.style.transform = "translateY(0)";
          }}
          onClick={() => {
            if (user) navigate(`${process.env.REACT_APP_ADD_PROPERTY_PAGE}`);
            else navigate(`${process.env.REACT_APP_LOGIN_PAGE}`);
          }}
        >
          Post property{" "}
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
        <Location size={20} color="#FFFFFF" style={{ cursor: "pointer" }} />
        <div style={{ position: "relative" }}>
          <User
            size={20}
            color="#FFFFFF"
            style={{ cursor: "pointer" }}
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.75rem",
                backgroundColor: "#FFF",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                minWidth: "200px",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                padding: "1rem",
                zIndex: 10,
              }}
            >
              {user ? (
                <>
                  <div
                    style={{
                      marginBottom: "0.75rem",
                      fontWeight: "700",
                      color: "#000",
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
                      color: "#333",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => navigate("/rewards")}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#F4F7F9")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <Bot size={20} color="#4A6A8A" />
                    Rewards
                  </button>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      width: "100%",
                      padding: "1rem 1.5rem",
                      backgroundColor: "transparent",
                      color: "#333",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => navigate("/my-properties")}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#F4F7F9")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <Square size={20} color="#4A6A8A" />
                    Properties
                  </button>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      width: "100%",
                      padding: "1rem 1.5rem",
                      backgroundColor: "transparent",
                      color: "#333",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => navigate("/support")}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#F4F7F9")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <Bot size={20} color="#4A6A8A" />
                    Customer Support
                  </button>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      width: "100%",
                      padding: "1rem 1.5rem",
                      backgroundColor: "transparent",
                      color: "#333",
                      border: "none",
                      borderTop: "1px solid #F4F7F9",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                    onClick={handleLogout}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#F4F7F9")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <LogOut size={20} color="#4A6A8A" />
                    Log Out
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
                    color: "#FFF",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/login")}
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
