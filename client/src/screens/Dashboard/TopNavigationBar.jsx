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
  const [isMediumScreen, setIsMediumScreen] = useState(
    window.innerWidth < 1024
  );

  // --- Preference Popup State ---
  const [showPreferencePopup, setShowPreferencePopup] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      setIsMediumScreen(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // --- Close user menu when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      const userMenu = document.querySelector(".user-menu-container");
      if (userMenu && !userMenu.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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
          padding: isSmallScreen ? "0.4rem 2%" : "0.6rem 1%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          position: "relative",
          zIndex: 1000,
        }}
      >
        {/* Left Section - Menu & Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isSmallScreen ? "0.75rem" : "1rem",
            minWidth: 0,
            flex: "0 1 auto",
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Menu
              size={24}
              color="#FFFFFF"
              style={{ cursor: "pointer", display: "block" }}
              onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
            />
            {isSideMenuOpen && (
              <SideMenuBar
                currentUser={user}
                onLoginClick={() => {
                  navigate("/login");
                }}
              />
            )}
          </div>
          <div
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isSmallScreen ? "0.6rem" : "0.9rem",
              cursor: "pointer",
              color: "#FFFFFF",
              userSelect: "none",
              minWidth: 0,
            }}
          >
            <img
              src="/Logo.jpg"
              alt="ggnHome Logo"
              style={{
                height: isSmallScreen ? 36 : 44,
                width: "auto",
                borderRadius: 8,
                display: "block",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.2,
                gap: "2px",
              }}
            >
              <span
                style={{
                  fontWeight: 1000,
                  fontSize: isSmallScreen ? "1.2rem" : "1.5rem",
                  letterSpacing: "0.3px",
                  color: "#FFFFFF",
                  textShadow: "0 0 6px rgba(255,255,255,0.25)",
                  whiteSpace: "nowrap",
                }}
              >
                ggnHome
              </span>
              <span
                style={{
                  fontSize: isSmallScreen ? "0.45rem" : "0.75rem",
                  color: "#FFFFFF",
                  opacity: 0.8,
                  whiteSpace: "nowrap",
                  letterSpacing: "0.2px",
                }}
              >
                Find your perfect space & Get Rewarded
              </span>
            </div>
          </div>
        </div>

        {/* Center Section - Nav Items (responsive visibility) */}
        <div
          style={{
            display: isMediumScreen ? "none" : "flex",
            gap:
              window.innerWidth > 1100
                ? "2rem"
                : isSmallScreen
                ? "0.5rem"
                : "1rem",
            alignItems: "center",
            flex: "1 1 auto",
            justifyContent: "center",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {navItems.slice(0, 3).map((item, idx) => (
            <a
              key={idx}
              href="#"
              style={{
                color: "#FFFFFF",
                textDecoration: "none",
                fontSize: isSmallScreen
                  ? "0.8rem"
                  : window.innerWidth > 1200
                  ? "0.9rem"
                  : "0.85rem",
                fontWeight: "500",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                position: "relative",
                paddingBottom: "4px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#22D3EE";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#FFFFFF";
              }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right Section - Action Buttons & Icons (responsive) */}
        {(() => {
          // Define common styles once for use below
          const commonButtonStyle = {
            height: isSmallScreen ? "34px" : "40px",
            minWidth: isSmallScreen ? "100px" : "120px",
            padding: isSmallScreen ? "0 10px" : "0 14px",
            backgroundColor: "#00A79D",
            color: "#FFFFFF",
            border: "none",
            borderRadius: isSmallScreen ? "7px" : "8px",
            fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isSmallScreen ? "0.3rem" : "0.4rem",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            outline: "none",
            flexShrink: 0,
          };
          const iconButtonStyle = {
            height: isSmallScreen ? "36px" : "40px",
            width: isSmallScreen ? "36px" : "40px",
            backgroundColor: "#4A6A8A",
            borderRadius: isSmallScreen ? "7px" : "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            flexShrink: 0,
          };
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isSmallScreen
                  ? "0.25rem"
                  : isMediumScreen
                  ? "0.75rem"
                  : "1rem",
                flex: "0 1 auto",
                minWidth: 0,
              }}
            >
              {/* AI Search Button */}
              <button
                style={commonButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#22D3EE";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(34, 211, 238, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#00A79D";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => {
                  if (user)
                    navigate(`${process.env.REACT_APP_AI_ASSISTANT_PAGE}`);
                  else navigate(`${process.env.REACT_APP_LOGIN_PAGE}`);
                }}
              >
                <span>{isSmallScreen ? "AI Search" : "AI Search"}</span>
                {!isSmallScreen && (
                  <span
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#00A79D",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: isSmallScreen ? "0.6rem" : "0.65rem",
                      fontWeight: "700",
                    }}
                  >
                    FREE
                  </span>
                )}
              </button>

              {/* Post Property Button */}
              <button
                style={commonButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#22D3EE";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(34, 211, 238, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#00A79D";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => {
                  if (user)
                    navigate(`${process.env.REACT_APP_ADD_PROPERTY_PAGE}`);
                  else navigate(`${process.env.REACT_APP_LOGIN_PAGE}`);
                }}
              >
                <span>{"Post property"}</span>
                {window.innerWidth > 800 && (
                  <span
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#00A79D",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: isSmallScreen ? "0.6rem" : "0.65rem",
                      fontWeight: "700",
                    }}
                  >
                    FREE
                  </span>
                )}
              </button>

              {/* Location Icon */}
              {window.innerWidth > 840 && (
                <div
                  style={iconButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#00A79D";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#4A6A8A";
                  }}
                >
                  <Location size={20} color="#FFFFFF" />
                </div>
              )}

              {/* User Menu */}
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#FFFFFF",
                  marginLeft: "0.1rem",
                  marginRight: "0.1rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: isSmallScreen ? "90px" : "120px",
                }}
              >
                {window.innerWidth < 800 ? "" : user ? user.email : "Guest"}
              </div>
              <div
                className="user-menu-container"
                style={{ position: "relative", flexShrink: 0 }}
              >
                <div
                  style={iconButtonStyle}
                  onClick={() => setShowMenu(!showMenu)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#00A79D";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#4A6A8A";
                  }}
                >
                  <User size={20} color="#FFFFFF" />
                </div>

                {showMenu && (
                  <>
                    {user ? (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 12px)",
                          right: 0,
                          backgroundColor: "#FFFFFF",
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(0,51,102,0.15)",
                          minWidth: isSmallScreen ? "180px" : "220px",
                          overflow: "hidden",
                          border: "1px solid #F4F7F9",
                          zIndex: 1001,
                          maxHeight: isSmallScreen ? "70vh" : "80vh",
                          overflowY: "auto",
                        }}
                      >
                        <div
                          style={{
                            padding: isSmallScreen
                              ? "0.75rem 0.9rem"
                              : "1rem 1.25rem",
                            borderBottom: "1px solid #F4F7F9",
                            backgroundColor: "#F4F7F9",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "700",
                              color: "#003366",
                              fontSize: isSmallScreen ? "0.875rem" : "0.95rem",
                              marginBottom: "0.25rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {user.name || user.email}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#4A6A8A",
                            }}
                          >
                            Welcome back!
                          </div>
                        </div>

                        <div style={{ padding: "0.5rem 0" }}>
                          <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              width: "100%",
                              padding: isSmallScreen
                                ? "0.55rem 0.9rem"
                                : "0.75rem 1.25rem",
                              backgroundColor: "transparent",
                              color: "#333333",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
                              fontWeight: "500",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={() => navigate("/rewards")}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F4F7F9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Bot size={18} color="#4A6A8A" />
                            <span>Rewards</span>
                          </button>
                          <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              width: "100%",
                              padding: isSmallScreen
                                ? "0.55rem 0.9rem"
                                : "0.75rem 1.25rem",
                              backgroundColor: "transparent",
                              color: "#333333",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
                              fontWeight: "500",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={() => navigate("/savedproperties")}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F4F7F9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Bot size={18} color="#4A6A8A" />
                            <span>Saved</span>
                          </button>
                           <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              width: "100%",
                              padding: isSmallScreen
                                ? "0.55rem 0.9rem"
                                : "0.75rem 1.25rem",
                              backgroundColor: "transparent",
                              color: "#333333",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
                              fontWeight: "500",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={() => navigate("/servicesCreate")}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F4F7F9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Bot size={18} color="#4A6A8A" />
                            <span>Create Service</span>
                          </button>

                          <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              width: "100%",
                              padding: isSmallScreen
                                ? "0.55rem 0.9rem"
                                : "0.75rem 1.25rem",
                              backgroundColor: "transparent",
                              color: "#333333",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
                              fontWeight: "500",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={() => navigate("/my-properties")}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F4F7F9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Bot size={18} color="#4A6A8A" />
                            <span>Manage Listings</span>
                          </button>
                          <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              width: "100%",
                              padding: isSmallScreen
                                ? "0.55rem 0.9rem"
                                : "0.75rem 1.25rem",
                              backgroundColor: "transparent",
                              color: "#333333",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
                              fontWeight: "500",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={() => navigate("/services")}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F4F7F9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Bot size={18} color="#4A6A8A" />
                            <span>Manage Services</span>
                          </button>
                          

                          <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              width: "100%",
                              padding: isSmallScreen
                                ? "0.55rem 0.9rem"
                                : "0.75rem 1.25rem",
                              backgroundColor: "transparent",
                              color: "#333333",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
                              fontWeight: "500",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={() => navigate("/support")}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F4F7F9")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Bot size={18} color="#4A6A8A" />
                            <span>Customer Support</span>
                          </button>

                          <div
                            style={{
                              height: "1px",
                              backgroundColor: "#F4F7F9",
                              margin: "0.5rem 0",
                            }}
                          />

                          <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              width: "100%",
                              padding: isSmallScreen
                                ? "0.55rem 0.9rem"
                                : "0.75rem 1.25rem",
                              backgroundColor: "transparent",
                              color: "#00A79D",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
                              fontWeight: "600",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={handleLogout}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#F4F7F9";
                              e.currentTarget.style.color = "#22D3EE";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color = "#00A79D";
                            }}
                          >
                            <LogOut size={18} color="currentColor" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 12px)",
                          right: 0,
                          backgroundColor: "#FFFFFF",
                          borderRadius: "10px",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                          minWidth: isSmallScreen ? "180px" : "200px",
                          padding: isSmallScreen ? "0.75rem" : "1rem",
                          zIndex: 1001,
                        }}
                      >
                        <div
                          style={{
                            color: "#003366",
                            marginBottom: "0.75rem",
                            fontWeight: "500",
                            textAlign: "center",
                          }}
                        >
                          You are not logged in.
                        </div>
                        <button
                          onClick={() => navigate("/login")}
                          style={{
                            backgroundColor: "#00A79D",
                            color: "#FFFFFF",
                            padding: isSmallScreen
                              ? "0.45rem 0.85rem"
                              : "0.5rem 1rem",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            width: "100%",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#22D3EE")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#00A79D")
                          }
                        >
                          Login Now
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })()}
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
            backgroundColor: "rgba(0,51,102,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.3s",
            animation: "fadeInBackdrop 0.36s cubic-bezier(.4,0,.2,1)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,51,102,0.25)",
              width: "100%",
              maxWidth: isSmallScreen ? "340px" : "500px",
              padding: isSmallScreen ? "1.5rem" : "2.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              animation: "scaleFadeInPopup 0.36s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <div
              style={{
                width: isSmallScreen ? "56px" : "64px",
                height: isSmallScreen ? "56px" : "64px",
                borderRadius: "50%",
                backgroundColor: "#F4F7F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: isSmallScreen ? "1.25rem" : "1.5rem",
              }}
            >
              <span style={{ fontSize: isSmallScreen ? "1.75rem" : "2rem" }}>
                ✨
              </span>
            </div>

            <div
              style={{
                fontSize: isSmallScreen ? "1.125rem" : "1.5rem",
                fontWeight: "700",
                marginBottom: "0.75rem",
                color: "#003366",
                letterSpacing: "-0.01em",
              }}
            >
              Personalize Your Experience
            </div>

            <div
              style={{
                fontSize: isSmallScreen ? "0.875rem" : "1rem",
                fontWeight: "400",
                color: "#4A6A8A",
                marginBottom: isSmallScreen ? "1.5rem" : "2rem",
                lineHeight: 1.6,
              }}
            >
              Tell us your preferences to get smarter property matches tailored
              just for you.
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                gap: isSmallScreen ? "0.75rem" : "1rem",
                width: "100%",
              }}
            >
              <button
                onClick={() => {
                  setShowPreferencePopup(false);
                  navigate(`${process.env.REACT_APP_AI_ASSISTANT_PAGE}`);
                }}
                style={{
                  flex: 1,
                  padding: isSmallScreen
                    ? "0.75rem 1.25rem"
                    : "0.875rem 1.5rem",
                  background:
                    "linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: isSmallScreen ? "0.875rem" : "1rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0, 167, 157, 0.3)",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(34, 211, 238, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 167, 157, 0.3)";
                }}
              >
                Set Preferences
              </button>

              <button
                onClick={() => setShowPreferencePopup(false)}
                style={{
                  flex: 1,
                  padding: isSmallScreen
                    ? "0.75rem 1.25rem"
                    : "0.875rem 1.5rem",
                  background: "#F4F7F9",
                  color: "#4A6A8A",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: isSmallScreen ? "0.875rem" : "1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#4A6A8A";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#F4F7F9";
                  e.currentTarget.style.color = "#4A6A8A";
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
            from { opacity: 0; transform: scale(0.95);}
            to { opacity: 1; transform: scale(1);}
          }
        `}</style>
        </div>
      )}
    </>
  );
};

export default TopNavigationBar;
