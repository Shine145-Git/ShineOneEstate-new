import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Search, MapPin, Home, Sparkles, SlidersHorizontal, Heart, MoreVertical, Phone, MessageCircle, Bed, Bath, Car, Maximize, TrendingUp, Award, Shield, ChevronDown, Filter, Grid, List, X, Check, Building2, Calendar, IndianRupee } from "lucide-react";
import TopNavigationBar from "../Dashboard/TopNavigationBar";
import { useNavigate, useParams, useLocation } from "react-router-dom";
// Function to add a property view
const addPropertyView = async (propertyId) => {
  try {
    await axios.post(
      process.env.REACT_APP_PROPERTY_ANALYSIS_ADD_VIEW,
      { propertyId },
      { withCredentials: true }
    );
  } catch (err) {
    console.error("Error adding view:", err);
  }
};

const Searchproperty = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const { query } = useParams();
  const location = useLocation();
  useEffect(() => {
    if (query) {
      setSearchQuery(query);
    }
  }, [query]);
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsTimeout = useRef(null);
  // Debounced fetch for sector/area suggestions
  useEffect(() => {
    // Don't fetch if empty
    if (!searchQuery.trim()) {
      setAreaSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // Debounce logic
    if (suggestionsTimeout.current) clearTimeout(suggestionsTimeout.current);
    suggestionsTimeout.current = setTimeout(() => {
      fetchSuggestions(searchQuery.trim());
    }, 300);
    return () => {
      if (suggestionsTimeout.current) clearTimeout(suggestionsTimeout.current);
    };
    // eslint-disable-next-line
  }, [searchQuery]);

  // Fetch suggestions function (sector/area autocomplete)
  const fetchSuggestions = async (input) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_SEARCH_AREAS_API}?query=${encodeURIComponent(input)}`,
        { withCredentials: true }
      );

      // ✅ Handle API returning { sectors: [...] }
      const data = res.data?.sectors || [];

      if (data.length > 0) {
        setAreaSuggestions(data.map(s => s.name || s)); // extract sector names if objects
        setShowSuggestions(true);
      } else {
        setAreaSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setAreaSuggestions([]);
      setShowSuggestions(false);
    }
  };
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  // Remove activeTab, as tab UI is removed
  const [viewMode, setViewMode] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  // Effect to read property type from navigation (dashboard) and set filters
  useEffect(() => {
    if (location.state?.type === "sale") setPropertyTypeFilter("sale");
    else if (location.state?.type === "rent") setPropertyTypeFilter("rent");
    else if (location.state?.type === "new") setSortBy("newest");
    else setPropertyTypeFilter("");
  // eslint-disable-next-line
  }, [location.state]);
  const [savedProperties, setSavedProperties] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const fetchSearchResults = async (queryToSearch) => {
    const searchVal =
      typeof queryToSearch === "string" ? queryToSearch : searchQuery;
    if (searchVal.trim() === "") return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("query", searchVal.trim());
      // console.log("🔍 Sending search params:", params.toString());
      const apiUrl = process.env.REACT_APP_SEARCH_PROPERTIES_API;
      const res = await axios.get(`${apiUrl}?${params.toString()}`);
      // console.log("Search API response:", res);

      // Attach type field using defaultpropertytype only
      let filteredData = res.data.map(p => ({
        ...p,
        type: p.defaultpropertytype || "rental"
      }));

      // Filter only by defaultpropertytype if specified
      if (propertyTypeFilter) {
        const normalizedFilter =
          propertyTypeFilter.toLowerCase() === "rent" ? "rental" : propertyTypeFilter.toLowerCase();
        filteredData = filteredData.filter(
          (p) => p.defaultpropertytype?.toLowerCase() === normalizedFilter
        );
      }

      // Debug log
      // console.log("🔎 Filtered properties:", filteredData.length, " | Filter:", propertyTypeFilter);

      // 🔍 Additional dashboard-type-based filtering and sorting
      const dashboardType = location.state?.type;

      if (dashboardType === "new") {
        // Sort by newest first
        filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (dashboardType === "commercial") {
        // Prefer large areas or commercial keywords
        filteredData = filteredData
          .filter(
            (p) =>
              /office|tower|commercial|space/i.test(p.title || "") ||
              /office|tower|commercial|space/i.test(p.description || "") ||
              (p.totalArea?.sqft || p.area || 0) > 1200
          )
          .sort(() => Math.random() - 0.5);
      } else if (dashboardType === "project") {
        // Prefer properties with more images or newer ones
        filteredData = filteredData
          .filter((p) => (p.images?.length || 0) > 2)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      // Only include active properties
      filteredData = filteredData.filter(p => p.isActive !== false);
      setFilteredPayments(filteredData);
    } catch (error) {
      console.error("Search API error:", error);
      setFilteredPayments([]);
    } finally {
      setLoading(false);
    }
  };

// Trigger search when search query or property type changes
useEffect(() => {
  if (searchQuery.trim() === "") return;
  fetchSearchResults(searchQuery);
}, [searchQuery, propertyTypeFilter]);

  const getSortedProperties = () => {
    let sorted = [...filteredPayments];
    if (sortBy === "price-low") {
      sorted.sort((a, b) => {
        const priceA = a.monthlyRent || a.price || 0;
        const priceB = b.monthlyRent || b.price || 0;
        return priceA - priceB;
      });
    } else if (sortBy === "price-high") {
      sorted.sort((a, b) => {
        const priceA = a.monthlyRent || a.price || 0;
        const priceB = b.monthlyRent || b.price || 0;
        return priceB - priceA;
      });
    } else if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  };

  const toggleSaveProperty = (propertyId, e) => {
    e.stopPropagation();
    setSavedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) newSet.delete(propertyId);
      else newSet.add(propertyId);
      return newSet;
    });
  };

  // Helper for ripple effect on buttons
  const createRipple = useCallback((event) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");
    button.appendChild(circle);
    setTimeout(() => {
      circle.remove();
    }, 500);
  }, []);

  const PropertyCard = ({ property, isGridView }) => {
    const isRental = property.defaultpropertytype?.toLowerCase() === "rental";
    const propertyTitle = isRental
      ? "Property For Rent"
      : property.title || "Property For Sale";
    const propertyLocation = property.Sector;
    const propertyPrice = property.monthlyRent ? property.monthlyRent : property.price;
    // For fade-in & slide-up animation
    const [visible, setVisible] = useState(false);
    const cardRef = useRef(null);
    useEffect(() => {
      // Animate on mount
      setTimeout(() => setVisible(true), Math.random() * 200 + 70); // staggered
    }, []);
    return (
      <div
        ref={cardRef}
        className={`property-card${visible ? " property-card--visible" : ""}`}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: "1.25rem",
          cursor: "pointer",
          border: "1px solid #E5E7EB",
          position: "relative",
          // animation handled by CSS class
        }}
        onClick={() => {
          // 🧠 Check login state first
          if (!user) {
            // Redirect to login if not authenticated
            navigate("/login");
            return;
          }

          // Track the property view for analytics
          addPropertyView(property._id);

          // Navigate to appropriate details page
          if (property.type === "rental") {
            navigate(`/Rentaldetails/${property._id}`);
          } else if (property.type === "sale") {
            navigate(`/Saledetails/${property._id}`);
          } else {
            console.warn("Unknown property type:", property.type);
          }
        }}
      >
        <div style={{ display: "flex", flexDirection: isGridView || isMobile ? "column" : "row", position: "relative" }}>
          <div
            style={{
              width: isGridView || isMobile ? "100%" : "320px",
              height: isGridView || isMobile ? "220px" : "220px",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden"
            }}
            className="property-card__imgwrap"
          >
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0] || "/default-property.jpg"}
                alt="Property"
                className="property-card__img"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  if (
                    e.currentTarget.src !== window.location.origin + "/default-property.jpg" &&
                    e.currentTarget.src !== window.location.origin + "/default-property.jpg/"
                  ) {
                    e.currentTarget.src = "/default-property.jpg";
                  }
                }}
              />
            ) : (
              <img
                src="/default-property.jpg"
                alt="Default Property"
                className="property-card__img"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
            <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <div
                style={{
                  backgroundColor: isRental ? "#00A79D" : "#22D3EE",
                  color: "#FFFFFF",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  backdropFilter: "blur(8px)"
                }}
              >
                {isRental ? "RENT" : "SALE"}
              </div>
              {Math.random() > 0.5 && <div style={{ backgroundColor: "rgba(0, 51, 102, 0.95)", color: "#FFFFFF", padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", backdropFilter: "blur(8px)" }}>FEATURED</div>}
            </div>
           {typeof property.matchPercentage === "number" && (
  <div
    style={{
      position: "absolute",
      bottom: "10px",
      left: "10px",
      backgroundColor:
        property.matchPercentage >= 70
          ? "rgba(34,197,94,0.9)" // Green for good match
          : property.matchPercentage >= 40
          ? "rgba(234,179,8,0.9)" // Yellow for average
          : "rgba(239,68,68,0.9)", // Red for poor match
      color: "#fff",
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "0.8rem",
      fontWeight: "700",
      backdropFilter: "blur(8px)",
      transition: "all 0.3s ease",
    }}
  >
    💯 {property.matchPercentage}% Match
  </div>
)}
            {property.images && property.images.length > 1 && (
              <div style={{ position: "absolute", bottom: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.75)", color: "#FFFFFF", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "600", backdropFilter: "blur(8px)" }}>{property.images.length} Photos</div>
            )}
          </div>

          <div style={{ flex: 1, padding: isGridView || isMobile ? "1.25rem" : "1.25rem 1.5rem", display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "0.75rem" }}>
              <h3 style={{ color: "#003366", fontSize: "1.15rem", fontWeight: "700", marginBottom: "0.35rem", lineHeight: "1.3" }}>{propertyTitle}</h3>
              {property.society && <p style={{ color: "#4A6A8A", fontSize: "0.85rem", marginBottom: "0.35rem", fontWeight: "500" }}>{property.society}</p>}
              {propertyLocation && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#4A6A8A", fontSize: "0.85rem" }}><MapPin size={14} /><span>{propertyLocation}</span></div>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", marginBottom: "0.85rem", paddingBottom: "0.85rem", borderBottom: "1px solid #F4F7F9" }}>
              {property.bedrooms && <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#4A6A8A", fontSize: "0.8rem", backgroundColor: "#F4F7F9", padding: "4px 8px", borderRadius: "6px" }}><Bed size={15} /><span>{property.bedrooms} Beds</span></div>}
              {property.bathrooms && <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#4A6A8A", fontSize: "0.8rem", backgroundColor: "#F4F7F9", padding: "4px 8px", borderRadius: "6px" }}><Bath size={15} /><span>{property.bathrooms} Baths</span></div>}
              {property.area && <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#4A6A8A", fontSize: "0.8rem", backgroundColor: "#F4F7F9", padding: "4px 8px", borderRadius: "6px" }}><Maximize size={15} /><span>{property.area} sqft</span></div>}
              {property.parking && <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#4A6A8A", fontSize: "0.8rem", backgroundColor: "#F4F7F9", padding: "4px 8px", borderRadius: "6px" }}><Car size={15} /><span>{property.parking}</span></div>}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ color: "#003366", fontSize: "1.5rem", fontWeight: "800", lineHeight: "1", display: "flex", alignItems: "baseline", gap: "2px" }}><IndianRupee size={20} /><span>{propertyPrice ? Number(propertyPrice).toLocaleString() : "N/A"}</span></div>
                {property.monthlyRent && <div style={{ color: "#4A6A8A", fontSize: "0.75rem", marginTop: "2px" }}>per month</div>}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  className="main-action-btn"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#00A79D",
                    border: "1.5px solid #00A79D",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.18s cubic-bezier(.4,2,.3,1), background-color 0.2s, color 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#00A79D";
                    e.currentTarget.style.color = "#FFFFFF";
                    e.currentTarget.style.transform = "scale(1.045)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                    e.currentTarget.style.color = "#00A79D";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  onClick={createRipple}
                ><Phone size={14} />Contact</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sortedProperties = getSortedProperties();

  return (
    <div className={fadeOut ? "fade-out" : "fade-in"}>
      <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      {/* Animations and transitions for property cards, buttons, ripple */}
      <style>
        {`
        .fade-in {
          opacity: 1;
          transition: opacity 0.4s ease;
        }
        .fade-out {
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        /* --- Property Card Fade-in & Slide-up --- */
        .property-card {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.55s cubic-bezier(.5,.7,.2,1), transform 0.55s cubic-bezier(.5,.7,.2,1), box-shadow 0.27s cubic-bezier(.6,.4,.3,1);
        }
        .property-card--visible {
          opacity: 1;
          transform: translateY(0);
        }
        .property-card:hover {
          box-shadow: 0 12px 32px rgba(0,51,102,0.15);
          transform: translateY(-6px) scale(1.022);
          transition: box-shadow 0.27s cubic-bezier(.6,.4,.3,1), transform 0.27s cubic-bezier(.4,1.7,.3,1);
        }
        .property-card__img {
          transition: transform 0.32s cubic-bezier(.4,1.7,.3,1);
        }
        .property-card__imgwrap:hover .property-card__img {
          transform: scale(1.045);
        }

        /* --- Button Hover Scaling and Ripple --- */
        .main-action-btn {
          transition: transform 0.18s cubic-bezier(.4,2,.3,1), background-color 0.2s, color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .main-action-btn:active {
          transform: scale(0.98);
        }
        .main-action-btn .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple-effect 0.48s linear;
          background: rgba(0, 167, 157, 0.19);
          pointer-events: none;
          z-index: 2;
        }
        @keyframes ripple-effect {
          to {
            transform: scale(2.7);
            opacity: 0;
          }
        }
        /* --- Ripple for other main buttons --- */
        button:not(.main-action-btn):not([disabled]):active {
          transform: scale(0.98);
        }
        /* --- Sidebar/CTA Buttons Hover Scaling --- */
        .sidebar-cta-btn {
          transition: transform 0.18s cubic-bezier(.4,2,.3,1), background-color 0.2s;
        }
        .sidebar-cta-btn:hover {
          transform: scale(1.045);
        }
        /* --- Slide out animation for page transitions --- */
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
        .slide-out {
          animation: slideOut 0.4s ease forwards;
        }
        `}
      </style>
           <TopNavigationBar user={user} onLogout={handleLogout} navItems={navItems} />
      <div style={{ backgroundColor: "#003366", padding: isMobile ? "1.5rem 1rem 1.5rem 1rem" : "2rem 0 1.5rem 0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", background: "linear-gradient(135deg, #003366 0%, #4A6A8A 100%)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 0rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
     
      <style>
        {`
        .modern-pill-back-btn {
          /* For specificity, add .modern-pill-back-btn here if needed */
        }
        .modern-pill-back-btn:active {
          transform: scale(0.97);
        }
        `}
      </style>
            <div style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              textAlign: "center",
              marginTop: isMobile ? "0" : "-0.5rem",
              padding: "0.5rem 1rem",
            }}>
              <h1
                style={{
                  color: "#FFFFFF",
                  fontSize: isMobile ? "2rem" : "2.75rem",
                  fontWeight: "900",
                  letterSpacing: "0.02em",
                  textShadow: "0 4px 10px rgba(0,0,0,0.25)",
                  background: "linear-gradient(90deg, #00C6FF, #0072FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "0.5rem",
                }}
              >
                Find Your Perfect Property
              </h1>
              <p style={{
                color: "#DCEFFF",
                fontSize: isMobile ? "0.9rem" : "1rem",
                fontWeight: "500",
                maxWidth: "600px",
                lineHeight: "1.6",
              }}>
                Discover homes and apartments that fit your lifestyle and budget, in just a few clicks.
              </p>
            </div>
          </div>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "0.25rem 0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>

            <Search size={20} color="#4A6A8A" style={{ marginLeft: "0.75rem" }} />
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (areaSuggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  // Delay hiding to allow click
                  setTimeout(() => setShowSuggestions(false), 140);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim() !== "") {
                    fetchSearchResults(searchQuery.trim());
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Search by Sector or Configuration (e.g., Sector-46, 3 BHK)"
                style={{
                  flex: 1,
                  padding: "0.75rem 0",
                  border: "none",
                  fontSize: "0.95rem",
                  outline: "none",
                  color: "#333333",
                  minWidth: "200px",
                  width: "100%",
                  background: "transparent"
                }}
              />
              {showSuggestions && areaSuggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "0 0 10px 10px",
                    zIndex: 100,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    maxHeight: "230px",
                    overflowY: "auto"
                  }}
                >
                  {areaSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      onMouseDown={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                        fetchSearchResults(suggestion);
                      }}
                      style={{
                        padding: "0.7rem 1rem",
                        cursor: "pointer",
                        color: "#003366",
                        fontWeight: 500,
                        borderBottom: idx !== areaSuggestions.length - 1 ? "1px solid #F3F4F6" : "none",
                        background: "#fff"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (searchQuery.trim() !== "") {
                  fetchSearchResults(searchQuery.trim());
                  setShowSuggestions(false);
                }
              }}
              className="main-action-btn"
              style={{
                backgroundColor: "#00A79D",
                color: "#FFFFFF",
                border: "none",
                padding: "0.75rem 1.75rem",
                borderRadius: "10px",
                fontSize: "0.95rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "background-color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#008A82"; e.currentTarget.style.transform = "scale(1.045)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#00A79D"; e.currentTarget.style.transform = "scale(1)"; }}
              onClick={createRipple}
            >
              <Search size={16} />Search
            </button>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E5E7EB", padding: "0.85rem 0", position: "sticky", top: "0", zIndex: "10", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.85rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap", flex: 1 }}>
            {/* <button onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", backgroundColor: showFilters ? "#003366" : "#FFFFFF", color: showFilters ? "#FFFFFF" : "#333333", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }}><SlidersHorizontal size={16} />Filters</button> */}
            <select value={propertyTypeFilter} onChange={(e) => setPropertyTypeFilter(e.target.value)} style={{ padding: "0.6rem 0.9rem", borderRadius: "8px", border: "1.5px solid #E5E7EB", backgroundColor: "#fff", color: "#333333", fontSize: "0.85rem", cursor: "pointer", fontWeight: "500", minWidth: "130px" }}>
              <option value="">All Types</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "0.6rem 0.9rem", borderRadius: "8px", border: "1.5px solid #E5E7EB", backgroundColor: "#fff", color: "#333333", fontSize: "0.85rem", cursor: "pointer", fontWeight: "500", minWidth: "150px" }}>
              <option value="relevance">Most Relevant</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
            <div style={{ color: "#4A6A8A", fontSize: "0.85rem", fontWeight: "600", padding: "0 0.5rem" }}>{sortedProperties.length} Properties</div>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", backgroundColor: "#F4F7F9", padding: "4px", borderRadius: "8px" }}>
            <button onClick={() => setViewMode("list")} style={{ padding: "0.5rem 0.7rem", backgroundColor: viewMode === "list" ? "#FFFFFF" : "transparent", color: viewMode === "list" ? "#00A79D" : "#4A6A8A", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s", boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><List size={18} /></button>
            <button onClick={() => setViewMode("grid")} style={{ padding: "0.5rem 0.7rem", backgroundColor: viewMode === "grid" ? "#FFFFFF" : "transparent", color: viewMode === "grid" ? "#00A79D" : "#4A6A8A", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s", boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}><Grid size={18} /></button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.75rem 1.5rem" }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "1.75rem" }}>
          <div style={{ flex: isMobile ? "1 1 100%" : "1 1 70%" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#003366" }}>
                <div style={{ display: "inline-block", width: "48px", height: "48px", border: "4px solid #E5E7EB", borderTop: "4px solid #00A79D", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <p style={{ marginTop: "1rem", fontSize: "1rem", color: "#4A6A8A" }}>Searching properties...</p>
              </div>
            ) : sortedProperties.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3.5rem 2rem", backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Home size={56} color="#D1D5DB" style={{ margin: "0 auto 1rem" }} />
                <h3 style={{ color: "#003366", fontSize: "1.35rem", marginBottom: "0.4rem", fontWeight: "700" }}>No Properties Found</h3>
                <p style={{ color: "#4A6A8A", fontSize: "0.9rem" }}>Try adjusting your filters or search in different areas</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" && !isMobile ? "repeat(auto-fill, minmax(360px, 1fr))" : "1fr", gap: "1.25rem" }}>
                {sortedProperties.map((property) => (
                  <PropertyCard key={property._id} property={property} isGridView={viewMode === "grid"} />
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: isMobile ? "1 1 100%" : "0 0 28%", marginTop: isMobile ? "1.5rem" : "0" }}>
            <div style={{ position: "sticky", top: "90px" }}>
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center", marginBottom: "1.25rem", border: "1px solid #E5E7EB" }}>
                <Building2 size={42} color="#667eea" style={{ margin: "0 auto 1rem" }} />
                <h3 style={{ color: "#1F2937", fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.6rem" }}>List Your Property</h3>
                <p style={{ color: "#6B7280", marginBottom: "1rem", fontSize: "0.85rem", lineHeight: "1.5" }}>Connect with thousands of verified buyers and renters instantly.</p>
                <button
                  className="sidebar-cta-btn"
                  style={{
                    backgroundColor: "#667eea",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "10px",
                    fontWeight: "700",
                    cursor: "pointer",
                    width: "100%",
                    fontSize: "0.9rem",
                    transition: "background-color 0.2s, transform 0.18s cubic-bezier(.4,2,.3,1)"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#5568d3"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#667eea"; }}
                  onClick={() => {
                    if (!user) {
                      navigate("/login");
                      return;
                    }
                    navigate("/add-property");
                  }}
                >Post Property Free</button>
              </div>

              <div style={{ background: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)", color: "#FFFFFF", borderRadius: "14px", padding: "1.75rem 1.5rem", textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", marginBottom: "1.25rem" }}>
                <Sparkles size={40} color="#FFD700" style={{ margin: "0 auto 0.85rem" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.6rem" }}>Premium Benefits</h3>
                <p style={{ fontSize: "0.85rem", color: "#FEF3C7", marginBottom: "1rem", lineHeight: "1.5" }}>Get exclusive rewards worth ₹2,000 on successful property deals through our platform.</p>
                <button
                  className="sidebar-cta-btn"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#EF4444",
                    border: "none",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "10px",
                    fontWeight: "700",
                    cursor: "pointer",
                    width: "100%",
                    fontSize: "0.9rem",
                    transition: "transform 0.2s, background-color 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.045)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >Explore Benefits</button>
              </div>

              <div style={{ backgroundColor: "#EFF6FF", border: "2px solid #3B82F6", borderRadius: "14px", padding: "1.5rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
                  <Shield size={28} color="#3B82F6" />
                  <h4 style={{ color: "#1F2937", fontSize: "1rem", fontWeight: "700" }}>Why Choose Us?</h4>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {["100% Verified Listings", "Zero Brokerage Fees", "Expert Consultation", "Legal Assistance"].map((item, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4B5563", marginBottom: "0.65rem", fontSize: "0.8rem" }}><Check size={16} color="#10B981" strokeWidth={3} /><span>{item}</span></li>
                  ))}
                </ul>
              </div>

              <div style={{ backgroundColor: "#FEF2F2", border: "2px solid #F87171", borderRadius: "14px", padding: "1.5rem", textAlign: "center" }}>
                <Award size={32} color="#EF4444" style={{ margin: "0 auto 0.65rem" }} />
                <h4 style={{ color: "#991B1B", fontSize: "1rem", fontWeight: "700", marginBottom: "0.4rem" }}>Need Assistance?</h4>
                <p style={{ color: "#7F1D1D", fontSize: "0.8rem", marginBottom: "0.85rem" }}>Our property experts are here to help you</p>
                <button
                  className="sidebar-cta-btn"
                  style={{
                    backgroundColor: "#EF4444",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "0.7rem 1.25rem",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                    width: "100%",
                    fontSize: "0.85rem",
                    transition: "background-color 0.2s, transform 0.18s cubic-bezier(.4,2,.3,1)"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#DC2626"; e.currentTarget.style.transform = "scale(1.045)"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#EF4444"; e.currentTarget.style.transform = "scale(1)"; }}
                  onClick={() => {
                    if (!user) {
                      navigate("/login");
                      return;
                    }
                    navigate("/support");
                  }}
                >Contact Us Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      {/* --- Modern Footer Section --- */}
      <footer style={{
        background: "linear-gradient(135deg, #003366 0%, #004b6b 100%)",
        color: "#FFFFFF",
        padding: "3rem 1.5rem",
        textAlign: "center",
        marginTop: "3rem"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3 style={{ fontWeight: "800", fontSize: "1.6rem", marginBottom: "0.5rem" }}>
            ggnRentalDeals – Find Your Dream Home
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#D1E7FF", marginBottom: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
            Explore thousands of verified listings, connect directly with owners, and make your next move with confidence.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <a href="/" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>Home</a>
            <a href="/about" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>About</a>
            <a href="/support" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>Contact</a>
            <a href="/add-property" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>Post Property</a>
          </div>
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: "1rem",
            fontSize: "0.8rem",
            color: "#B0C4DE"
          }}>
            © {new Date().getFullYear()} ggnRentalDeals. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Searchproperty;