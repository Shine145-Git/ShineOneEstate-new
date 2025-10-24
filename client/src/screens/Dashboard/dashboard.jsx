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
  const [propertiesInArea, setPropertiesInArea] = useState([]);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
  useEffect(() => {
    const fetchPropertiesByLocation = async () => {
      if (!userLocation) {
        // console.log("userLocation not ready yet");
        return;
      }
      try {
        const fields = [
          userLocation.area,
          userLocation.village,
          userLocation.city_district,
          userLocation.county,
          userLocation.state_district,
          userLocation.state,
        ].filter(Boolean);

        // console.log("Raw userLocation object:", userLocation);
        // console.log("Filtered fields to send to backend:", fields);

        const resProps = await fetch(
          `${process.env.REACT_APP_SEARCH_PROPERTIES_BY_LOCATION_API}`,
          {
            method: "POST",
            credentials: "include", // ✅ valid
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ queryFields: fields }),
          }
        );

        // console.log("Raw response object from backend:", resProps);

        const text = await resProps.text();
        // console.log("Backend response text:", text);

        if (resProps.ok) {
          const propsData = JSON.parse(text);
          // console.log("Properties fetched by location:", propsData);
          setPropertiesInArea(propsData);
        } else {
          // console.log("Failed to fetch properties, status:", resProps.status);
          setPropertiesInArea([]);
        }
      } catch (err) {
        // console.error("Error fetching properties by location:", err);
        setPropertiesInArea([]);
      }
    };

    fetchPropertiesByLocation();
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
          setRecentSearches(data.history.slice(0, 5));
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
            `${process.env.REACT_APP_RENT_PROPERTY_API}`,
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
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    if (user) {
      try {
        await fetch(
          `${
            process.env.REACT_APP_SEARCH_PROPERTIES_API
          }?query=${encodeURIComponent(searchQuery.trim())}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        // console.log('Search history sent successfully');
      } catch (err) {
        console.error("Error sending search history:", err);
      }
    }
    navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_LOGOUT_API}`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/login");
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
    { name: "Buy", new: false },
    { name: "Rent", new: false },
    { name: "New Launch", new: true },
    { name: "Commercial", new: false },
    { name: "Plots/Land", new: false },
    { name: "Projects", new: false },
    { name: "Post Property", new: false, free: true },
  ];
  const mobiletabs = [
    { name: "Buy", new: false },
    { name: "Rent", new: false },
    { name: "New Launch", new: true },
  ]

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#333333",
        backgroundColor: "#F4F7F9",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Floating Chat Button */}
      <style>
        {`
          @keyframes floatUpDown {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
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
      <TopNavigationBar
        user={user}
        handleLogout={handleLogout}
        navItems={navItems}
      />

     {/* Hero Banner with Search */}
<div style={{ width: '100%', position: 'relative' }}>
  {/* Hero Banner / Carousel */}

  <Adcarousel />
      
  {/* Search Box positioned below carousel */}
  <div
    style={{
      position: 'absolute',
      bottom: window.innerWidth < 768 ? '-260px' : '-135px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '1200px',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      zIndex: 10,
      overflow: 'visible',
    }}
  >
    {/* Tabs */}
   {/* Tabs Section */}
{!isMobile ? (
  // Desktop tabs
  <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
    {tabs.map(tab => (
      <button
        key={tab.name}
        onClick={() => setActiveTab(tab.name)}
        style={{
          padding: '16px 24px',
          border: 'none',
          backgroundColor: 'transparent',
          color: activeTab === tab.name ? '#003366' : '#4A6A8A',
          fontSize: '14px',
          fontWeight: activeTab === tab.name ? '600' : '500',
          cursor: 'pointer',
          borderBottom: activeTab === tab.name ? '3px solid #00A79D' : '3px solid transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          position: 'relative',
        }}
      >
        {tab.name}
        {tab.new && <span style={{ backgroundColor: '#FF4757', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>NEW</span>}
        {tab.free && <span style={{ backgroundColor: '#00A79D', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>FREE</span>}
      </button>
    ))}
  </div>
) : (
  // Mobile tabs (scrollable horizontal)
  <div style={{ display: 'flex', overflowX: 'auto', padding: '8px 0', gap: '8px', backgroundColor: '#FFFFFF' }}>
    {tabs.map(tab => (
      <button
        key={tab.name}
        onClick={() => setActiveTab(tab.name)}
        style={{
          padding: '12px 16px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: activeTab === tab.name ? '#00A79D' : '#F4F7F9',
          color: activeTab === tab.name ? '#FFFFFF' : '#4A6A8A',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          flex: '0 0 auto',
        }}
      >
        {tab.name}
        {tab.new && <span style={{ backgroundColor: '#FF4757', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginLeft: '4px' }}>NEW</span>}
        {tab.free && <span style={{ backgroundColor: '#00A79D', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginLeft: '4px' }}>FREE</span>}
      </button>
    ))}
  </div>
)}

    {/* Detailed Search Input */}
    <div style={{ padding: '20px 24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', minWidth: '180px' }}>
        <div
          style={{
            padding: '12px 16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#333333',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
            width: '100%',
            fontWeight: '500',
          }}
        >
          All Residential
        </div>
      </div>
      <div
        style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          minWidth: '320px',
          position: 'relative',
        }}
      >
        <Search size={20} color="#4A6A8A" style={{ marginRight: '8px' }} />
        <input
          type="text"
          placeholder='Search "Farm house in Punjab below 1 cr"'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => { if (!user) navigate("/login"); else setShowRecentDropdown(true); }}
          onBlur={() => setTimeout(() => setShowRecentDropdown(false), 400)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            fontSize: '14px',
            color: '#333333',
            backgroundColor: 'transparent',
          }}
        />
        <button onClick={handleSearch} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Search size={20} color="#4A6A8A" />
        </button>

        {showRecentDropdown && user && recentSearches.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '0.5rem',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            width: '100%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 10
          }}>
            {recentSearches.map((search, idx) => (
              <div
                key={search._id || idx}
                style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: idx !== recentSearches.length - 1 ? '1px solid #f1f1f1' : 'none', color: '#333', fontSize: '14px', backgroundColor: '#fff', transition: 'background 0.2s' }}
                onMouseDown={e => { e.preventDefault(); setSearchQuery(search.query); setShowRecentDropdown(false); handleSearch(); }}
                onMouseEnter={e => e.target.style.backgroundColor = '#F4F7F9'}
                onMouseLeave={e => e.target.style.backgroundColor = '#fff'}
              >
                {search.query}
              </div>
            ))}
          </div>
        )}

        <Mic
          size={20}
          color="#00A79D"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (!('webkitSpeechRecognition' in window)) { alert('Voice recognition not supported'); return; }
            const recognition = new window.webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.start();
            recognition.onresult = event => { const voiceInput = event.results[0][0].transcript; setSearchQuery(voiceInput); handleSearch(); };
            recognition.onerror = event => console.error("Voice recognition error:", event.error);
          }}
        />
      </div>

      <button
        style={{
          padding: '12px 48px',
          backgroundColor: '#0066FF',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={e => { e.target.style.backgroundColor = '#0052CC'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(0,102,255,0.3)'; }}
        onMouseLeave={e => { e.target.style.backgroundColor = '#0066FF'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  </div>
</div>

      {/* Cards Section */}
      <CardSection />
      {/* Property Dashboard Section */}
      <PropertyDashboard
        properties={user ? recommended : properties}
        user={user}
        title={user ? "Recommended for you" : "Explore Properties"}
      />
      {/* Property Snapshot Section */}
      <PropertySnapshot />
      {/* News Section */}
      <div id="news">
        <PropertyHeroSection />
      </div>

      {/* Advertisement Section */}
      <LandingPage />
      {/* {Banners} */}
      <Banners user={user} />
      {/* Property in Area */}
      <PropertiesInArea
        properties={propertiesInArea}
        user={user}
        title="Properties in your area"
      />
      {/* Tools */}
      <ToolsShowcase />
      {/* Property Options */}
      <PropertyCitiesComponent />
      {/* Location Section - pass setUserLocation to allow lifting state */}
      <Location setUserLocation={setUserLocation} />

      {/* Bottom Section */}
      <div
        style={{
          backgroundColor: "#4A6A8A",
          padding: "48px 4%",
          marginTop: "40px",
        }}
      >
        <div
          style={{ maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#FFFFFF",
              marginBottom: "16px",
            }}
          >
            How can we help you?
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#FFFFFF",
              opacity: "0.9",
              marginBottom: "32px",
            }}
          >
            Explore our services and find the perfect solution for your real
            estate needs
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                padding: "14px 32px",
                backgroundColor: "#00A79D",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#22D3EE";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#00A79D";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Learn More
            </button>
            <button
              style={{
                padding: "14px 32px",
                backgroundColor: "transparent",
                color: "#FFFFFF",
                border: "2px solid #FFFFFF",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#FFFFFF";
                e.target.style.color = "#4A6A8A";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#FFFFFF";
              }}
              onClick={() => navigate("/support")}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#003366",
          color: "#FFFFFF",
          padding: "32px 4%",
          fontSize: "14px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ opacity: "0.8" }}>
            © 2025 99acres. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              "Privacy Policy",
              "Cookie Policy",
              "Terms & Conditions",
              "Sitemap",
            ].map((item, idx) => (
              <a
                key={idx}
                href="#"
                style={{
                  color: "#FFFFFF",
                  textDecoration: "none",
                  opacity: "0.8",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "1")}
                onMouseLeave={(e) => (e.target.style.opacity = "0.8")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <div
        style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          right: "0",
          backgroundColor: "#003366",
          padding: "16px 4%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
          zIndex: "1000",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <p style={{ color: "#FFFFFF", fontSize: "14px", margin: "0" }}>
          This site uses cookies to improve your experience. By browsing, you
          agree to our{" "}
          <a href="#" style={{ color: "#22D3EE", textDecoration: "underline" }}>
            Privacy Policy
          </a>{" "}
          &{" "}
          <a href="#" style={{ color: "#22D3EE", textDecoration: "underline" }}>
            Cookie Policy
          </a>
        </p>
        <button
          style={{
            padding: "10px 32px",
            backgroundColor: "#0066FF",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0052CC")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#0066FF")}
        >
          Okay
        </button>
      </div>
    </div>
  );
}
