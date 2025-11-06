import React, { useState, useEffect } from "react";
import {
  Search,
  Mic,
  MapPin,
  Bell,
  User,
  Menu,
  ChevronDown,
  Home,
  Key,
  TrendingUp,
  FileText,
  Lightbulb,
  ChevronRight,
  LogOut,
  Bot,
  Square,
} from "lucide-react";
// import {  ChevronDown, Bell, User, Bot, Square, LogOut } from 'lucide-react';
// import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import CardSection from "./CardSection";
import TopNavigationBar from "./TopNavigationBar";
import PropertyDashboard from "./PropertiesWithwithoutlogin";
import PropertyHeroSection from "./News";
import LandingPage from "./advertisement";
import PropertySnapshot from "./PropertySnapshots";
import Banners from "./Banners";
import PropertyCitiesComponent from "./propertyOptions";
import PropertiesInArea from "./RecommendedProperties";
import Location from "./Location";
import Chatbot from "./ChatBot";
import ToolsShowcase from "./Tools";
import Adcarousel from "./Adcarousel";

export default function RealEstateDashboard() {
  const [activeTab, setActiveTab] = useState("Buy");
  // Loading state for search
  const [isLoading, setIsLoading] = useState(false);
  // Floating Chat Button Modal State
  const [showChatModal, setShowChatModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  // Area suggestions effect
  useEffect(() => {
    // If searchQuery is empty, clear suggestions and show history
    if (!searchQuery.trim()) {
      setAreaSuggestions([]);
      return;
    }
    // Fetch area suggestions from API
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SEARCH_AREAS_API}?query=${encodeURIComponent(
            searchQuery.trim()
          )}`,
          { method: "GET", credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setAreaSuggestions(data.sectors || []);
        } else {
          setAreaSuggestions([]);
        }
      } catch (err) {
        setAreaSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [searchQuery]);
  const [propertiesInArea, setPropertiesInArea] = useState([]);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (!userLocation) return;

    // Debounce API call to avoid duplicate consecutive searches
    const debounceTimeout = setTimeout(async () => {
      try {
        const fields = [
          userLocation.area,
          userLocation.village,
          userLocation.city_district,
          userLocation.county,
          userLocation.state_district,
          userLocation.state,
        ].filter(Boolean);

        const resProps = await fetch(
          `${process.env.REACT_APP_SEARCH_PROPERTIES_BY_LOCATION_API}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ queryFields: fields }),
          }
        );

        const text = await resProps.text();
        if (resProps.ok) {
          const propsData = JSON.parse(text);
          setPropertiesInArea(propsData);
        } else {
          setPropertiesInArea([]);
        }
      } catch (err) {
        setPropertiesInArea([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [userLocation]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_USER_ME_API}`, {
          method: "GET",
          credentials: "include",
        });
        // console.log("Fetch response status:", res.status);
        // console.log("Fetch response object:", res);

        const data = await res.json();
        // console.log("Parsed response data:", data);

        if (res.ok && data) {
          setUser(data); // use data directly
          // console.log("User set in state:", data);
        } else {
          setUser(null);
          // console.log("User not set, response data:", data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);
  useEffect(() => {
    if (!user) return;

    const fetchSearchHistory = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_SEARCH_HISTORY_API}`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          // Take the last 5 searches
          // console.log("Recent searches:", data.history.slice(0, 5));
          setRecentSearches(data.history.slice(0, 10));
        }
      } catch (err) {
        console.error("Error fetching search history:", err);
      }
    };

    fetchSearchHistory();
  }, [user]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        if (!user) {
          const res = await fetch(
            `${process.env.REACT_APP_ALL_RENT_PROPERTY_FETCH_API}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (res.ok) {
            const data = await res.json();

            setProperties(data.slice(0, 15)); // data is array
          } else {
            setProperties([]);
          }
        } else {
          const res = await fetch(
            `${process.env.REACT_APP_USER_DASHBOARD_API}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          if (res.ok) {
            const data = await res.json();
            setRecentSearches(data.recentSearches || []);
            // Use the array directly if backend returns it
            const recommendedProps = data.recommendedProperties || data || [];
            // console.log("Recommended properties fetched:", recommendedProps);
            setRecommended(recommendedProps);
          } else {
            setRecentSearches([]);
            setRecommended([]);
          }
        }
      } catch (err) {
        // console.error("Error fetching properties or dashboard data:", err);
        setProperties([]);
        setRecentSearches([]);
        setRecommended([]);
      }
    };
    fetchProperties();
  }, [user]);

  // Track property views
  const handlePropertyClick = async (propertyId) => {
    try {
      await fetch(`${process.env.REACT_APP_PROPERTY_ANALYSIS_ADD_VIEW}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ propertyId }),
      });
    } catch (err) {
      console.error("Error adding view:", err);
    }
  };
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    const start = Date.now();
    let fetchPromise = fetch(
      `${process.env.REACT_APP_SEARCH_PROPERTIES_API}?query=${encodeURIComponent(
        searchQuery.trim()
      )}&type=${encodeURIComponent(propertyTypeFilter)}`,
      { method: "GET", credentials: "include" }
    );
    let navPromise = (async () => {
      try {
        await fetchPromise;
      } catch (err) {
        // error handled below
      }
      try {
        navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      } catch (err) {
        // navigation error, do nothing
      }
    })();
    // Wait for both navigation and at least 2s
    try {
      await Promise.all([
        navPromise,
        new Promise((resolve) => {
          const elapsed = Date.now() - start;
          if (elapsed >= 2000) resolve();
          else setTimeout(resolve, 2000 - elapsed);
        }),
      ]);
    } catch (err) {
      // error handled below
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_LOGOUT_API}`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  const navItems = [
    "For Buyers",
    "For Tenants",
    "For Owners",
    "For Dealers / Builders",
    "Insights",
  ];
  const tabs = [
    { name: "All Properties", new: false },
    { name: "Buy", new: false },
    { name: "Rent", new: false },
    { name: "New Launch", new: true },
    { name: "Commercial", new: false },
    { name: "Projects", new: false },
    { name: "Post Property", new: false, free: true },
  ];
  const mobiletabs = [
    { name: "Buy", new: false },
    { name: "Rent", new: false },
    { name: "New Launch", new: true },
  ];

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#333333",
        backgroundColor: "#F4F7F9",
        minHeight: "100vh",
        position: "relative",
        paddingTop: "80px" // adjust based on navbar height
      }}
    >
      {isLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(255,255,255,0.8)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backdropFilter: "blur(6px)"
        }}>
          <div className="spinner" style={{
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #00A79D",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ marginTop: "16px", color: "#003366", fontWeight: "600" }}>Searching properties...</p>
        </div>
      )}
      {/* Floating Chat Button */}
      <style>
        {`
          /* Responsive improvements for dashboard */
          @media (max-width: 767px) {
            .search-box-container {
              position: static !important;
              bottom: unset !important;
              left: unset !important;
              transform: none !important;
              width: 98vw !important;
              max-width: 100vw !important;
              margin: 0.5rem auto 0.5rem auto !important;
              border-radius: 12px !important;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
              padding: 0 !important;
            }
            .search-box-container input[type="text"] {
              font-size: 15px !important;
              border: none !important;
              flex: 1 !important;
              padding: 10px !important;
              border-radius: 8px !important;
              background: transparent !important;
              min-height: 44px !important;
              margin: 0 !important;
            }
            .search-box-container select {
              font-size: 15px !important;
            }
            .search-row-mobile {
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;
              padding: 8px 10px !important;
              background: #fff !important;
              border-radius: 10px !important;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
              margin: 0 !important;
              min-height: 44px !important;
            }
            .search-row-mobile input[type="text"] {
              border: none !important;
              outline: none !important;
              background: transparent !important;
              flex: 1 !important;
              font-size: 15px !important;
              padding: 10px 0 !important;
              margin: 0 !important;
              border-radius: 8px !important;
              min-height: 44px !important;
            }
            .search-row-mobile .search-icon-btn,
            .search-row-mobile .mic-icon-btn {
              background: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 6px !important;
              min-width: 44px !important;
              min-height: 44px !important;
              height: 44px !important;
              width: 44px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              border-radius: 8px !important;
              cursor: pointer !important;
              font-size: 20px !important;
            }
            .search-row-mobile .search-icon-btn:active,
            .search-row-mobile .mic-icon-btn:active {
              background: #f4f7f9 !important;
            }
            .floating-chat-btn {
              width: 68px !important;
              height: 68px !important;
              right: 16px !important;
              bottom: 16px !important;
              font-size: 34px !important;
            }
            .chat-modal-content {
              max-width: 99vw !important;
              min-width: 0 !important;
              width: 99vw !important;
              min-height: 70vh !important;
              max-height: 95vh !important;
              border-radius: 16px !important;
            }
            .property-snapshot-section,
            .news-section,
            .footer-section,
            .hero-banner-section {
              padding: 1.2rem 0.5rem !important;
              margin: 0.5rem 0 !important;
            }
            .property-dashboard-section {
              padding: 1.2rem 0.5rem !important;
            }
            .dashboard-footer-btns {
              flex-direction: column !important;
              gap: 12px !important;
            }
            .dashboard-footer-btns button {
              width: 100% !important;
              padding: 16px 0 !important;
              font-size: 16px !important;
            }
            .dashboard-footer-links {
              flex-direction: column !important;
              gap: 10px !important;
            }
          }
          /* Card/Ad modern look */
          .dashboard-card,
          .dashboard-ad {
            border-radius: 14px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.09);
            background: #fff;
            margin-bottom: 16px;
            overflow: hidden;
          }
          @media (max-width: 767px) {
            .dashboard-card,
            .dashboard-ad {
              margin-bottom: 14px !important;
              border-radius: 13px !important;
            }
            .dashboard-cards-section,
            .dashboard-ads-section {
              flex-direction: column !important;
              gap: 0 !important;
            }
          }
          @keyframes floatUpDown {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .floating-chat-btn {
            position: fixed;
            bottom: 32px;
            right: 32px;
            z-index: 1200;
            background: #00A79D;
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 62px;
            height: 62px;
            box-shadow: 0 6px 24px rgba(0,0,0,0.18);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 28px;
            animation: floatUpDown 2.4s ease-in-out infinite;
            transition: background 0.2s, box-shadow 0.2s;
          }
          .floating-chat-btn:hover {
            background: #22D3EE;
            box-shadow: 0 10px 32px rgba(0,167,157,0.22);
          }
          .chat-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.38);
            z-index: 1300;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeInModal 0.2s;
          }
          @keyframes fadeInModal {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .chat-modal-content {
            background: #fff;
            border-radius: 18px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.22);
            max-width: 420px;
            width: 95vw;
            min-height: 480px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            position: relative;
            padding: 0;
            overflow: hidden;
            animation: fadeInModal 0.22s;
          }
          .chat-modal-close {
            position: absolute;
            top: 14px;
            right: 14px;
            background: #f4f7f9;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            font-size: 22px;
            color: #333;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            transition: background 0.18s;
          }
          .chat-modal-close:hover {
            background: #e5e7eb;
          }
          @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100%); }
          }
          .slide-out {
            animation: slideOutRight 0.6s ease-in forwards;
          }
        `}
      </style>
      <button
        className="floating-chat-btn"
        title="Chat with us"
        onClick={() => setShowChatModal(true)}
        aria-label="Open Chatbot"
      >
        <span role="img" aria-label="Chatbot" style={{ fontSize: "32px" }}>
          💬
        </span>
      </button>

      {/* Modal for Chatbot */}
      {showChatModal && (
        <div
          className="chat-modal-overlay"
          onClick={() => setShowChatModal(false)}
        >
          <div
            className="chat-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="chat-modal-close"
              onClick={() => setShowChatModal(false)}
              aria-label="Close Chatbot"
            >
              ×
            </button>
            {/* Directly render Chatbot component inside modal */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                height: "100%",
                overflow: "auto",
              }}
            >
              <Chatbot />
            </div>
          </div>
        </div>
      )}
      {/* Top Navigation Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 999,
          backgroundColor: "#FFFFFF" // or match your navbar background
        }}
      >
        <TopNavigationBar
          user={user}
          handleLogout={handleLogout}
          navItems={navItems}
        />
      </div>

      {/* Hero Banner with Search */}
      <div
        className="hero-banner-section"
        style={{
          width: "100%",
          position: "relative",
          padding: isMobile ? "0" : "0",
          marginBottom: isMobile ? "1.5rem" : "2.5rem",
        }}
      >
        {/* Hero Banner / Carousel */}
        <Adcarousel />
        {/* Search Box positioned below carousel */}
        <div
          className="search-box-container"
          style={{
            position: isMobile ? "static" : "absolute",
            bottom: isMobile ? "unset" : "-135px",
            left: isMobile ? "unset" : "50%",
            transform: isMobile ? "none" : "translateX(-50%)",
            width: isMobile ? "98vw" : "90%",
            maxWidth: isMobile ? "100vw" : "1200px",
            backgroundColor: "#FFFFFF",
            borderRadius: isMobile ? "14px" : "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            zIndex: 10,
            overflow: "visible",
            margin: isMobile ? "0.5rem auto" : "unset",
            padding: isMobile ? "0.3rem 0" : "unset",
          }}
        >
          {/* Tabs */}
          {/* Tabs Section */}
          {!isMobile ? (
            // Desktop tabs
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    if (tab.name === "All Properties") {
                      setPropertyTypeFilter("All");
                    } else if (tab.name === "Buy") {
                      setPropertyTypeFilter("Sale");
                    } else if (tab.name === "Rent") {
                      setPropertyTypeFilter("Rent");
                    } else if (tab.name === "Post Property") {
                      const searchBox = document.querySelector(".search-box-container");
                      if (searchBox) {
                        searchBox.classList.add("slide-out");
                        setTimeout(() => {
                          navigate("/add-property");
                          searchBox.classList.remove("slide-out");
                        }, 600);
                      } else {
                        navigate("/add-property");
                      }
                    }
                  }}
                  style={{
                    padding: "16px 24px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: activeTab === tab.name ? "#003366" : "#4A6A8A",
                    fontSize: "14px",
                    fontWeight: activeTab === tab.name ? "600" : "500",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === tab.name
                        ? "3px solid #00A79D"
                        : "3px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    position: "relative",
                  }}
                >
                  {tab.name}
                  {tab.new && (
                    <span
                      style={{
                        backgroundColor: "#FF4757",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "700",
                      }}
                    >
                      NEW
                    </span>
                  )}
                  {tab.free && (
                    <span
                      style={{
                        backgroundColor: "#00A79D",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "700",
                      }}
                    >
                      FREE
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            // Mobile tabs (scrollable horizontal)
            <div
              style={{
                display: "flex",
                overflowX: "auto",
                padding: "8px 0",
                gap: "8px",
                backgroundColor: "#FFFFFF",
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    if (tab.name === "All Properties") {
                      setPropertyTypeFilter("All");
                    } else if (tab.name === "Buy") {
                      setPropertyTypeFilter("Sale");
                    } else if (tab.name === "Rent") {
                      setPropertyTypeFilter("Rent");
                    } else if (tab.name === "Post Property") {
                      const searchBox = document.querySelector(".search-box-container");
                      if (searchBox) {
                        searchBox.classList.add("slide-out");
                        setTimeout(() => {
                          navigate("/add-property");
                          searchBox.classList.remove("slide-out");
                        }, 600);
                      } else {
                        navigate("/add-property");
                      }
                    }
                  }}
                  style={{
                    padding: "12px 16px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor:
                      activeTab === tab.name ? "#00A79D" : "#F4F7F9",
                    color: activeTab === tab.name ? "#FFFFFF" : "#4A6A8A",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    flex: "0 0 auto",
                  }}
                >
                  {tab.name}
                  {tab.new && (
                    <span
                      style={{
                        backgroundColor: "#FF4757",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "700",
                        marginLeft: "4px",
                      }}
                    >
                      NEW
                    </span>
                  )}
                  {tab.free && (
                    <span
                      style={{
                        backgroundColor: "#00A79D",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "700",
                        marginLeft: "4px",
                      }}
                    >
                      FREE
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Detailed Search Input */}
          {/* Search Input Layout */}
          {isMobile ? (
            <>
              <div
                className="search-row-mobile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  background: "#fff",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  margin: 0,
                  minHeight: "44px",
                }}
              >
                <button
                  className="search-icon-btn"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: "0 6px",
                    minWidth: "44px",
                    minHeight: "44px",
                    height: "44px",
                    width: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                  onClick={handleSearch}
                  aria-label="Search"
                  type="button"
                >
                  <Search size={20} color="#4A6A8A" />
                </button>
                <input
                  type="text"
                  placeholder="Search area or property type"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (!user) {
                      console.log(
                        "User not logged in, search disabled until login"
                      );
                      return; // do nothing on focus
                    }
                    setShowRecentDropdown(true);
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowRecentDropdown(false), 400)
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{
                    border: "none",
                    outline: "none",
                    flex: 1,
                    fontSize: "15px",
                    color: "#333333",
                    backgroundColor: "transparent",
                    width: "100%",
                    padding: "10px 0",
                    margin: 0,
                    borderRadius: "8px",
                    minHeight: "44px",
                  }}
                />
                {showRecentDropdown && user && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "0.5rem",
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      width: "100%",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      zIndex: 10,
                    }}
                  >
                    {/* If searchQuery is empty, show recentSearches */}
                    {!searchQuery.trim() &&
                      recentSearches.length > 0 &&
                      recentSearches.map((search, idx) => (
                        <div
                          key={search._id || idx}
                          style={{
                            padding: "10px 16px",
                            cursor: "pointer",
                            borderBottom:
                              idx !== recentSearches.length - 1
                                ? "1px solid #f1f1f1"
                                : "none",
                            color: "#333",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            transition: "background 0.2s",
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(search.query);
                            setShowRecentDropdown(false);
                            handleSearch();
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#F4F7F9")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#fff")
                          }
                        >
                          {search.query}
                        </div>
                      ))}
                    {/* If searchQuery is not empty and areaSuggestions exist, show suggestions */}
                    {searchQuery.trim() &&
                      areaSuggestions.length > 0 &&
                      areaSuggestions.map((sector, idx) => (
                        <div
                          key={sector.id || sector.name || idx}
                          style={{
                            padding: "10px 16px",
                            cursor: "pointer",
                            borderBottom:
                              idx !== areaSuggestions.length - 1
                                ? "1px solid #f1f1f1"
                                : "none",
                            color: "#333",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            transition: "background 0.2s",
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(sector.name);
                            setShowRecentDropdown(false);
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#F4F7F9")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#fff")
                          }
                        >
                          {sector.name}
                        </div>
                      ))}
                  </div>
                )}
                <button
                  className="mic-icon-btn"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: "0 6px",
                    minWidth: "44px",
                    minHeight: "44px",
                    height: "44px",
                    width: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                  aria-label="Voice search"
                  type="button"
                  onClick={() => {
                    if (!("webkitSpeechRecognition" in window)) {
                      alert("Voice recognition not supported");
                      return;
                    }
                    const recognition = new window.webkitSpeechRecognition();
                    recognition.lang = "en-US";
                    recognition.interimResults = false;
                    recognition.maxAlternatives = 1;
                    recognition.start();
                    recognition.onresult = (event) => {
                      const voiceInput = event.results[0][0].transcript;
                      setSearchQuery(voiceInput);
                      handleSearch();
                    };
                    recognition.onerror = (event) =>
                      console.error("Voice recognition error:", event.error);
                  }}
                >
                  <Mic size={20} color="#00A79D" />
                </button>
              </div>
              {/* Mobile Search Button */}
              <button
                onClick={handleSearch}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "12px 0",
                  backgroundColor: "#0066FF",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                Search
              </button>
            </>
          ) : (
            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
                flexDirection: "row",
              }}
            >
              <div style={{ position: "relative", minWidth: "180px", width: "auto", marginBottom: 0 }}>
                <select
                  value={propertyTypeFilter}
                  onChange={(e) => setPropertyTypeFilter(e.target.value)}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#333333",
                    backgroundColor: "#FFFFFF",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "500",
                  }}
                >
                  <option value="All">All</option>
                  <option value="Rent">Rent</option>
                  <option value="Sale">Sale</option>
                </select>
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  minWidth: "320px",
                  width: "auto",
                  position: "relative",
                  marginBottom: 0,
                }}
              >
                <Search
                  size={20}
                  color="#4A6A8A"
                  style={{ marginRight: "8px" }}
                />
                <input
                  type="text"
                  placeholder={'Search "3 BHK" or "Sector-46 or 3 BHK in Sector-46"'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (!user) {
                      console.log(
                        "User not logged in, search disabled until login"
                      );
                      return; // do nothing on focus
                    }
                    setShowRecentDropdown(true);
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowRecentDropdown(false), 400)
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{
                    border: "none",
                    outline: "none",
                    flex: 1,
                    fontSize: "14px",
                    color: "#333333",
                    backgroundColor: "transparent",
                    width: "100%",
                  }}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                  aria-label="Search"
                  type="button"
                >
                  <Search size={20} color="#4A6A8A" />
                </button>
                {showRecentDropdown && user && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "0.5rem",
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      width: "100%",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      zIndex: 10,
                    }}
                  >
                    {/* If searchQuery is empty, show recentSearches */}
                    {!searchQuery.trim() &&
                      recentSearches.length > 0 &&
                      recentSearches.map((search, idx) => (
                        <div
                          key={search._id || idx}
                          style={{
                            padding: "10px 16px",
                            cursor: "pointer",
                            borderBottom:
                              idx !== recentSearches.length - 1
                                ? "1px solid #f1f1f1"
                                : "none",
                            color: "#333",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            transition: "background 0.2s",
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(search.query);
                            setShowRecentDropdown(false);
                            handleSearch();
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#F4F7F9")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#fff")
                          }
                        >
                          {search.query}
                        </div>
                      ))}
                    {/* If searchQuery is not empty and areaSuggestions exist, show suggestions */}
                    {searchQuery.trim() &&
                      areaSuggestions.length > 0 &&
                      areaSuggestions.map((sector, idx) => (
                        <div
                          key={sector.id || sector.name || idx}
                          style={{
                            padding: "10px 16px",
                            cursor: "pointer",
                            borderBottom:
                              idx !== areaSuggestions.length - 1
                                ? "1px solid #f1f1f1"
                                : "none",
                            color: "#333",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            transition: "background 0.2s",
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(sector.name);
                            setShowRecentDropdown(false);
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#F4F7F9")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#fff")
                          }
                        >
                          {sector.name}
                        </div>
                      ))}
                  </div>
                )}
                <Mic
                  size={20}
                  color="#00A79D"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (!("webkitSpeechRecognition" in window)) {
                      alert("Voice recognition not supported");
                      return;
                    }
                    const recognition = new window.webkitSpeechRecognition();
                    recognition.lang = "en-US";
                    recognition.interimResults = false;
                    recognition.maxAlternatives = 1;
                    recognition.start();
                    recognition.onresult = (event) => {
                      const voiceInput = event.results[0][0].transcript;
                      setSearchQuery(voiceInput);
                      handleSearch();
                    };
                    recognition.onerror = (event) =>
                      console.error("Voice recognition error:", event.error);
                  }}
                />
              </div>
              <button
                style={{
                  padding: "12px 48px",
                  backgroundColor: "#0066FF",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#0052CC";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(0,102,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#0066FF";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards Section */}
      <div className="dashboard-cards-section" style={{ margin: isMobile ? "0.5rem 0" : "2rem 0" }}>
        { <CardSection />}
      </div>
      {/* Property Dashboard Section */}
      <div className="property-dashboard-section" style={{ padding: isMobile ? "1.2rem 0.5rem" : "2rem 0" }}>
        <PropertyDashboard
          properties={user ? recommended : properties}
          user={user}
          title={user ? "Recommended for you" : "Explore Properties"}
          onPropertyClick={handlePropertyClick}
        />
      </div>
      {/* Property Snapshot Section */}
      <div className="property-snapshot-section" style={{ padding: isMobile ? "1.2rem 0.5rem" : "2rem 0" }}>
        <PropertySnapshot />
      </div>
      {/* News Section */}
      <div id="news" className="news-section" style={{ padding: isMobile ? "1.2rem 0.5rem" : "2rem 0" }}>
        <PropertyHeroSection />
      </div>
      {/* Advertisement Section */}
      <div className="dashboard-ads-section" style={{ margin: isMobile ? "0.5rem 0" : "2rem 0" }}>
        <LandingPage />
      </div>
      {/* {Banners} */}
      <Banners user={user} />
      {/* Property in Area */}
      <div className="dashboard-cards-section" style={{ margin: isMobile ? "0.5rem 0" : "2rem 0" }}>
        <PropertiesInArea
          properties={propertiesInArea}
          user={user}
          title="Properties in your area"
          onPropertyClick={handlePropertyClick}
        />
      </div>
      {/* Tools */}
      <div className="dashboard-cards-section" style={{ margin: isMobile ? "0.5rem 0" : "2rem 0" }}>
        <ToolsShowcase />
      </div>
      {/* Property Options */}
      <div className="dashboard-cards-section" style={{ margin: isMobile ? "0.5rem 0" : "2rem 0" }}>
        <PropertyCitiesComponent />
      </div>
      {/* Location Section - pass setUserLocation to allow lifting state */}
      <div className="dashboard-cards-section" style={{ margin: isMobile ? "0.5rem 0" : "2rem 0" }}>
        <Location setUserLocation={setUserLocation} />
      </div>



      {/* Footer */}
      <footer
        style={{
          background: "linear-gradient(135deg, #003366 0%, #004b6b 100%)",
          color: "#FFFFFF",
          padding: isMobile ? "1.2rem 0.4rem" : "3rem 1.5rem",
          textAlign: "center",
          marginTop: isMobile ? "1.2rem" : "3rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3
            style={{
              fontWeight: "800",
              fontSize: isMobile ? "1.1rem" : "1.6rem",
              marginBottom: isMobile ? "0.2rem" : "0.5rem",
            }}
          >
            ggnHome – Find Your Dream Home
          </h3>
          <p
            style={{
              fontSize: isMobile ? "0.8rem" : "0.9rem",
              color: "#D1E7FF",
              marginBottom: isMobile ? "0.8rem" : "1.5rem",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Explore thousands of verified listings, connect directly with owners, and make your next move with confidence.
          </p>
          <div
            className="dashboard-footer-links"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: isMobile ? "10px" : "2rem",
              flexWrap: "wrap",
              marginBottom: isMobile ? "1rem" : "2rem",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
            }}
          >
            <a href="/" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: isMobile ? "0.95rem" : "0.9rem" }}>Home</a>
            <a href="/about" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: isMobile ? "0.95rem" : "0.9rem" }}>About</a>
            <a href="/support" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: isMobile ? "0.95rem" : "0.9rem" }}>Contact</a>
            <a href="/add-property" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: isMobile ? "0.95rem" : "0.9rem" }}>Post Property</a>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.15)",
              paddingTop: isMobile ? "0.7rem" : "1rem",
              fontSize: isMobile ? "0.7rem" : "0.8rem",
              color: "#B0C4DE",
            }}
          >
            © {new Date().getFullYear()} ggnHome. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
