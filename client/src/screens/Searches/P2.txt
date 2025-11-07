import { useState, useEffect, useRef, useCallback } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
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
      fetchSearchResults(query);
    }
  }, [query]);

  const [searchQuery, setSearchQuery] = useState(query || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsTimeout = useRef(null);

  // Debounced fetch for sector/area suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAreaSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (suggestionsTimeout.current) clearTimeout(suggestionsTimeout.current);
    suggestionsTimeout.current = setTimeout(() => {
      fetchSuggestions(searchQuery.trim());
    }, 300);
    return () => {
      if (suggestionsTimeout.current) clearTimeout(suggestionsTimeout.current);
    };
  }, [searchQuery]);

  const fetchSuggestions = async (input) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_SEARCH_AREAS_API}?query=${encodeURIComponent(input)}`,
        { withCredentials: true }
      );
      const data = res.data?.sectors || [];
      if (data.length > 0) {
        setAreaSuggestions(data.map(s => s.name || s));
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
  const [viewMode, setViewMode] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  // Additional filters
  const [bedroomsFilter, setBedroomsFilter] = useState("");
  const [bathroomsFilter, setBathroomsFilter] = useState("");
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [minAreaFilter, setMinAreaFilter] = useState("");
  const [maxAreaFilter, setMaxAreaFilter] = useState("");
  const [moveInDateFilter, setMoveInDateFilter] = useState("");
  const [parkingFilter, setParkingFilter] = useState("");
  const [petPolicyFilter, setPetPolicyFilter] = useState("");
  const [smokingPolicyFilter, setSmokingPolicyFilter] = useState("");
  const [amenitiesFilter, setAmenitiesFilter] = useState([]);

  useEffect(() => {
    if (location.state?.type === "sale") setPropertyTypeFilter("sale");
    else if (location.state?.type === "rent") setPropertyTypeFilter("rent");
    else if (location.state?.type === "new") setSortBy("newest");
    else setPropertyTypeFilter("");
  }, [location.state]);

  const [savedProperties, setSavedProperties] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [user, setUser] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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
    navigate("/");
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
    const searchVal = typeof queryToSearch === "string" ? queryToSearch : searchQuery;
    if (searchVal.trim() === "") return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const params = new URLSearchParams();
      params.append("query", searchVal.trim());
      const apiUrl = process.env.REACT_APP_SEARCH_PROPERTIES_API;
      const res = await axios.get(`${apiUrl}?${params.toString()}`);

      let filteredData = res.data.map(p => ({
        ...p,
        type: p.defaultpropertytype || "rental"
      }));

      // Property type
      if (propertyTypeFilter) {
        const normalizedFilter = propertyTypeFilter.toLowerCase() === "rent" ? "rental" : propertyTypeFilter.toLowerCase();
        filteredData = filteredData.filter((p) => p.defaultpropertytype?.toLowerCase() === normalizedFilter);
      }

      // Dashboard type
      const dashboardType = location.state?.type;
      if (dashboardType === "new") {
        filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (dashboardType === "commercial") {
        filteredData = filteredData
          .filter((p) =>
            /office|tower|commercial|space/i.test(p.title || "") ||
            /office|tower|commercial|space/i.test(p.description || "") ||
            (p.totalArea?.sqft || p.area || 0) > 1200
          )
          .sort(() => Math.random() - 0.5);
      } else if (dashboardType === "project") {
        filteredData = filteredData
          .filter((p) => (p.images?.length || 0) > 2)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      // Filter by bedrooms
      if (bedroomsFilter !== "") {
        filteredData = filteredData.filter(p => Number(p.bedrooms) === Number(bedroomsFilter));
      }
      // Filter by bathrooms
      if (bathroomsFilter !== "") {
        filteredData = filteredData.filter(p => Number(p.bathrooms) === Number(bathroomsFilter));
      }
      // Filter by price (rent or sale)
      if (minPriceFilter !== "") {
        filteredData = filteredData.filter(p => {
          const price = p.monthlyRent || p.price || 0;
          return price >= Number(minPriceFilter);
        });
      }
      if (maxPriceFilter !== "") {
        filteredData = filteredData.filter(p => {
          const price = p.monthlyRent || p.price || 0;
          return price <= Number(maxPriceFilter);
        });
      }
      // Filter by area
      if (minAreaFilter !== "") {
        filteredData = filteredData.filter(p => {
          const area = p.area || p.totalArea?.sqft || 0;
          return area >= Number(minAreaFilter);
        });
      }
      if (maxAreaFilter !== "") {
        filteredData = filteredData.filter(p => {
          const area = p.area || p.totalArea?.sqft || 0;
          return area <= Number(maxAreaFilter);
        });
      }
      // Move-in date (rentals only)
      if (moveInDateFilter && propertyTypeFilter === "rent") {
        filteredData = filteredData.filter(p => {
          if (!p.availableFrom) return true;
          // Compare as YYYY-MM-DD
          return new Date(p.availableFrom) <= new Date(moveInDateFilter);
        });
      }
      // Parking
      if (parkingFilter !== "") {
        filteredData = filteredData.filter(p =>
          (p.parking || "").toLowerCase() === parkingFilter.toLowerCase()
        );
      }
      // Pet policy
      if (petPolicyFilter !== "") {
        filteredData = filteredData.filter(p =>
          (p.petPolicy || "").toLowerCase() === petPolicyFilter.toLowerCase()
        );
      }
      // Smoking policy
      if (smokingPolicyFilter !== "") {
        filteredData = filteredData.filter(p =>
          (p.smokingPolicy || "").toLowerCase() === smokingPolicyFilter.toLowerCase()
        );
      }
      // Amenities (all selected must be present)
      if (amenitiesFilter.length > 0) {
        filteredData = filteredData.filter(p => {
          const amenities = Array.isArray(p.amenities) ? p.amenities.map(a => a.toLowerCase()) : [];
          return amenitiesFilter.every(sel => amenities.includes(sel.toLowerCase()));
        });
      }

      filteredData = filteredData.filter(p => p.isActive !== false);
      setFilteredPayments(filteredData);
    } catch (error) {
      console.error("Search API error:", error);
      setFilteredPayments([]);
    } finally {
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 2000 - elapsed);
      setTimeout(() => setLoading(false), delay);
    }
  };

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
    setTimeout(() => circle.remove(), 500);
  }, []);

  const PropertyCard = ({ property, isGridView }) => {
    const isRental = property.defaultpropertytype?.toLowerCase() === "rental";
    const propertyTitle = isRental ? property.title || "Property For Rent" : property.title || "Property For Sale";
    const propertyLocation = property.Sector;
    const propertyPrice = property.monthlyRent || property.price;
    const [visible, setVisible] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
      setTimeout(() => setVisible(true), Math.random() * 200 + 70);
    }, []);

    return (
      <div
        ref={cardRef}
        className={`property-card${visible ? " property-card--visible" : ""}`}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: "1.25rem",
          cursor: "pointer",
          border: "1px solid #E5E7EB",
          transition: "all 0.3s ease"
        }}
        onClick={() => {
          if (!user) {
            navigate("/login");
            return;
          }
          addPropertyView(property._id);
          if (property.type === "rental") {
            navigate(`/Rentaldetails/${property._id}`);
          } else if (property.type === "sale") {
            navigate(`/Saledetails/${property._id}`);
          } else {
            console.warn("Unknown property type:", property.type);
          }
        }}
      >
        <div style={{ display: "flex", flexDirection: isGridView || isMobile ? "column" : "row" }}>
          {/* Property Image */}
          <div style={{
            width: isGridView || isMobile ? "100%" : "280px",
            height: "200px",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden"
          }}>
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0] || "/default-property.jpg"}
                alt="Property"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + "/default-property.jpg") {
                    e.currentTarget.src = "/default-property.jpg";
                  }
                }}
              />
            ) : (
              <img
                src="/default-property.jpg"
                alt="Default Property"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
            
            {/* Badge */}
            <div style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              backgroundColor: isRental ? "#10b981" : "#3b82f6",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              {isRental ? "RENT" : "SALE"}
            </div>

            {/* Match Percentage */}
            {typeof property.matchPercentage === "number" && (
              <div style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                backgroundColor: property.matchPercentage >= 70 ? "rgba(16,185,129,0.95)" :
                                property.matchPercentage >= 40 ? "rgba(251,191,36,0.95)" : "rgba(239,68,68,0.95)",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "700"
              }}>
                {property.matchPercentage}% Match
              </div>
            )}

            {/* Photo Count */}
            {property.images && property.images.length > 1 && (
              <div style={{
                position: "absolute",
                bottom: "12px",
                left: "12px",
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "600"
              }}>
                {property.images.length} Photos
              </div>
            )}

            {/* Heart Icon */}
            <button
              onClick={(e) => toggleSaveProperty(property._id, e)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <Heart
                size={18}
                fill={savedProperties.has(property._id) ? "#ef4444" : "none"}
                color={savedProperties.has(property._id) ? "#ef4444" : "#6b7280"}
              />
            </button>
          </div>

          {/* Property Details */}
          <div style={{ flex: 1, padding: "1.25rem", display: "flex", flexDirection: "column" }}>
            {/* Title & Location */}
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{
                color: "#1f2937",
                fontSize: "1.125rem",
                fontWeight: "700",
                marginBottom: "0.5rem",
                lineHeight: "1.4"
              }}>
                {propertyTitle}
              </h3>
              
              {propertyLocation && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#6b7280",
                  fontSize: "0.875rem"
                }}>
                  <MapPin size={16} />
                  <span>{propertyLocation}</span>
                </div>
              )}
              {property.description && (
                <p style={{
                  color: "#4b5563",
                  fontSize: "0.875rem",
                  lineHeight: "1.5",
                  marginTop: "0.5rem"
                }}>
                  {property.description.length > 120
                    ? property.description.slice(0, 120) + "..."
                    : property.description}
                </p>
              )}
            </div>

            {/* Property Features */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid #f3f4f6"
            }}>
              {property.bedrooms && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#6b7280",
                  fontSize: "0.875rem"
                }}>
                  <Bed size={16} />
                  <span>{property.bedrooms} Beds</span>
                </div>
              )}
              {property.bathrooms && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#6b7280",
                  fontSize: "0.875rem"
                }}>
                  <Bath size={16} />
                  <span>{property.bathrooms} Baths</span>
                </div>
              )}
              {property.area && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#6b7280",
                  fontSize: "0.875rem"
                }}>
                  <Maximize size={16} />
                  <span>{property.area} sqft</span>
                </div>
              )}
              {property.parking && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#6b7280",
                  fontSize: "0.875rem"
                }}>
                  <Car size={16} />
                  <span>{property.parking}</span>
                </div>
              )}
            </div>

            {/* Price & Actions */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
              gap: "1rem",
              flexWrap: "wrap"
            }}>
              <div>
                <div style={{
                  color: "#1f2937",
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px"
                }}>
                  <IndianRupee size={20} />
                  <span>{propertyPrice ? Number(propertyPrice).toLocaleString() : "N/A"}</span>
                </div>
                {property.monthlyRent && (
                  <div style={{
                    color: "#6b7280",
                    fontSize: "0.75rem",
                    marginTop: "2px"
                  }}>
                    per month
                  </div>
                )}
              </div>
              
              <button
                className="contact-btn"
                style={{
                  backgroundColor: "#10b981",
                  color: "#fff",
                  border: "none",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease"
                }}
                onClick={createRipple}
              >
                <Phone size={16} />
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sortedProperties = getSortedProperties();
  const propertiesPerPage = 20;
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = sortedProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(sortedProperties.length / propertiesPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={fadeOut ? "fade-out" : "fade-in"}>
      <style>{`
        .property-card {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s ease, transform 0.4s ease, box-shadow 0.3s ease;
        }
        .property-card--visible {
          opacity: 1;
          transform: translateY(0);
        }
        .property-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transform: translateY(-4px);
        }
        .contact-btn:hover {
          background-color: #059669;
          transform: scale(1.05);
        }
        .contact-btn .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple-effect 0.5s linear;
          background: rgba(255,255,255,0.3);
          pointer-events: none;
        }
        @keyframes ripple-effect {
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(255,255,255,0.9)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            border: "6px solid #f3f4f6",
            borderTop: "6px solid #10b981",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ marginTop: "1rem", color: "#1f2937", fontWeight: "600" }}>Searching properties...</p>
        </div>
      )}

      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        {/* Fixed Top Navigation Bar */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 999,
          }}
        >
          <TopNavigationBar user={user} onLogout={handleLogout} navItems={navItems} />
        </div>

        {/* Hero Search Section */}
        <div style={{
          backgroundImage: "linear-gradient(rgba(30,58,138,0.7), rgba(59,130,246,0.7)), url('/AdBackground.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: isMobile ? "2.5rem 1rem" : "3rem 2rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          marginTop: "64px", // Reserve space for fixed navbar
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{
              textAlign: "center",
              marginBottom: "2rem"
            }}>
              <h1 style={{
                color: "#fff",
                fontSize: isMobile ? "2rem" : "2.5rem",
                fontWeight: "800",
                marginBottom: "0.75rem",
                letterSpacing: "-0.02em"
              }}>
                Find Your Perfect Property
              </h1>
              <p style={{
                color: "#bfdbfe",
                fontSize: isMobile ? "0.875rem" : "1rem",
                maxWidth: "600px",
                margin: "0 auto"
              }}>
                Discover homes and apartments that fit your lifestyle and budget
              </p>
            </div>

            {/* Search Bar */}
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              maxWidth: "900px",
              margin: "0 auto"
            }}>
              <Search size={20} color="#6b7280" style={{ marginLeft: "0.75rem" }} />
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
                    setTimeout(() => setShowSuggestions(false), 200);
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
                    padding: "0.875rem 0",
                    border: "none",
                    fontSize: "1rem",
                    outline: "none",
                    color: "#1f2937",
                    width: "100%",
                    background: "transparent"
                  }}
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && areaSuggestions.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    zIndex: 100,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    maxHeight: "250px",
                    overflowY: "auto"
                  }}>
                    {areaSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        onMouseDown={() => {
                          setSearchQuery(suggestion);
                          setShowSuggestions(false);
                          fetchSearchResults(suggestion);
                        }}
                        style={{
                          padding: "0.875rem 1rem",
                          cursor: "pointer",
                          color: "#1f2937",
                          fontWeight: 500,
                          borderBottom: idx !== areaSuggestions.length - 1 ? "1px solid #f3f4f6" : "none",
                          transition: "background-color 0.2s ease"
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  createRipple(e);
                  if (searchQuery.trim() !== "") {
                    setLoading(true);
                    fetchSearchResults(searchQuery.trim());
                    setShowSuggestions(false);
                  }
                }}
                style={{
                  backgroundColor: "#10b981",
                  color: "#fff",
                  border: "none",
                  padding: "0.875rem 1.75rem",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#059669"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#10b981"}
              >
                <Search size={18} />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div style={{
          backgroundColor: "#F4F7F9",
          borderBottom: "1px solid #00A79D",
          padding: "1rem 0",
          position: "sticky",
          top: "64px", // Stick below the fixed navbar
          zIndex: "10",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            {/* Left: property type, sort, filter button, count */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              flex: 1
            }}>
              {/* Property Type */}
              <select
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
                style={{
                  padding: "0.625rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #00A79D",
                  backgroundColor: "#FFFFFF",
                  color: "#333333",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  outline: "none",
                  transition: "background 0.2s"
                }}
                onFocus={e => e.currentTarget.style.backgroundColor = "#22D3EE"}
                onBlur={e => e.currentTarget.style.backgroundColor = "#FFFFFF"}
                onMouseOver={e => e.currentTarget.style.backgroundColor = "#22D3EE"}
                onMouseOut={e => e.currentTarget.style.backgroundColor = "#FFFFFF"}
              >
                <option value="">All Types</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "0.625rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #00A79D",
                  backgroundColor: "#FFFFFF",
                  color: "#333333",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  outline: "none",
                  transition: "background 0.2s"
                }}
                onFocus={e => e.currentTarget.style.backgroundColor = "#22D3EE"}
                onBlur={e => e.currentTarget.style.backgroundColor = "#FFFFFF"}
                onMouseOver={e => e.currentTarget.style.backgroundColor = "#22D3EE"}
                onMouseOut={e => e.currentTarget.style.backgroundColor = "#FFFFFF"}
              >
                <option value="relevance">Most Relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: "0.625rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #00A79D",
                  backgroundColor: "#00A79D",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <SlidersHorizontal size={18} />
                Filter
              </button>
              <div style={{
                color: "#4A6A8A",
                fontSize: "0.875rem",
                fontWeight: "600"
              }}>
                {sortedProperties.length} Properties
              </div>
            </div>
            {/* View Mode Buttons */}
            <div style={{
              display: "flex",
              gap: "0.5rem",
              backgroundColor: "#22D3EE",
              padding: "4px",
              borderRadius: "8px"
            }}>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  padding: "0.5rem 0.75rem",
                  backgroundColor: viewMode === "list" ? "#fff" : "transparent",
                  color: viewMode === "list" ? "#00A79D" : "#003366",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                  boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "0.5rem 0.75rem",
                  backgroundColor: viewMode === "grid" ? "#fff" : "transparent",
                  color: viewMode === "grid" ? "#00A79D" : "#003366",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                  boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                <Grid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
          paddingTop: "24px", // Add extra space for fixed navbar and sticky filter bar
        }}>
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "2rem"
          }}>
            {/* Unified Filters Modal for all screen sizes */}
            {showFilters && (
              <Modal open={showFilters} onClose={() => setShowFilters(false)}>
                <Box sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "90%",
                  maxWidth: "400px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  bgcolor: "#F4F7F9",
                  borderRadius: 2,
                  p: 3,
                  boxShadow: 24,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h4 style={{ color: "#003366", margin: 0 }}>Filters</h4>
                    <button
                      onClick={() => setShowFilters(false)}
                      style={{ background: "none", border: "none", color: "#003366", cursor: "pointer", fontSize: "1.25rem", marginLeft: "0.5rem" }}
                      aria-label="Close"
                    >
                      <X size={22} />
                    </button>
                    {/* Clear Filters Button */}
                    <button
                      onClick={() => {
                        setBedroomsFilter("");
                        setBathroomsFilter("");
                        setMinPriceFilter("");
                        setMaxPriceFilter("");
                        setMinAreaFilter("");
                        setMaxAreaFilter("");
                        setMoveInDateFilter("");
                        setParkingFilter("");
                        setPetPolicyFilter("");
                        setSmokingPolicyFilter("");
                        setAmenitiesFilter([]);
                      }}
                      style={{
                        backgroundColor: "#f87171",
                        color: "#fff",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: "pointer",
                        marginLeft: "auto"
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>

                  {/* Bedrooms */}
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4A6A8A" }}>Bedrooms</label>
                  <select value={bedroomsFilter} onChange={e => setBedroomsFilter(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "6px", border: "1px solid #00A79D" }}>
                    <option value="">Any</option>
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}+</option>)}
                  </select>

                  {/* Bathrooms */}
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4A6A8A" }}>Bathrooms</label>
                  <select value={bathroomsFilter} onChange={e => setBathroomsFilter(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "6px", border: "1px solid #00A79D" }}>
                    <option value="">Any</option>
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}+</option>)}
                  </select>

                  {/* Price Range */}
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4A6A8A" }}>Price Range</label>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <input type="number" min={0} placeholder="Min" value={minPriceFilter} onChange={e => setMinPriceFilter(e.target.value)} style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #00A79D" }} />
                    <input type="number" min={0} placeholder="Max" value={maxPriceFilter} onChange={e => setMaxPriceFilter(e.target.value)} style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #00A79D" }} />
                  </div>

                  {/* Area Range */}
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4A6A8A" }}>Area Range (sqft)</label>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <input type="number" min={0} placeholder="Min" value={minAreaFilter} onChange={e => setMinAreaFilter(e.target.value)} style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #00A79D" }} />
                    <input type="number" min={0} placeholder="Max" value={maxAreaFilter} onChange={e => setMaxAreaFilter(e.target.value)} style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #00A79D" }} />
                  </div>

                  {/* Move-In Date (rentals only) */}
                  {propertyTypeFilter === "rent" && (
                    <>
                      <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4A6A8A" }}>Move-In Date</label>
                      <input type="date" value={moveInDateFilter} onChange={e => setMoveInDateFilter(e.target.value)} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #00A79D", marginBottom: "1rem" }} />
                    </>
                  )}

                  {/* Parking */}
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4A6A8A" }}>Parking</label>
                  <select value={parkingFilter} onChange={e => setParkingFilter(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "6px", border: "1px solid #00A79D" }}>
                    <option value="">Any</option>
                    <option value="none">None</option>
                    <option value="open">Open</option>
                    <option value="covered">Covered</option>
                    <option value="garage">Garage</option>
                    <option value="reserved">Reserved</option>
                    <option value="street">Street</option>
                  </select>

                  {/* Pet Policy */}
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4A6A8A" }}>Pet Policy</label>
                  <select value={petPolicyFilter} onChange={e => setPetPolicyFilter(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "6px", border: "1px solid #00A79D" }}>
                    <option value="">Any</option>
                    <option value="allowed">Allowed</option>
                    <option value="not allowed">Not Allowed</option>
                    <option value="negotiable">Negotiable</option>
                  </select>

                  {/* Smoking Policy */}
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4A6A8A" }}>Smoking Policy</label>
                  <select value={smokingPolicyFilter} onChange={e => setSmokingPolicyFilter(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "6px", border: "1px solid #00A79D" }}>
                    <option value="">Any</option>
                    <option value="allowed">Allowed</option>
                    <option value="not allowed">Not Allowed</option>
                    <option value="negotiable">Negotiable</option>
                  </select>

                  {/* Amenities as checkboxes */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4A6A8A", display: "block", marginBottom: "0.5rem" }}>Amenities</label>
                    {["gym","pool","clubhouse","garden","security","lift","power backup","children play area","sports","shopping","wifi"].map((amenity) => (
                      <div key={amenity} style={{ display: "flex", alignItems: "center", marginBottom: "0.25rem" }}>
                        <input
                          type="checkbox"
                          checked={amenitiesFilter.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) setAmenitiesFilter(prev => [...prev, amenity]);
                            else setAmenitiesFilter(prev => prev.filter(a => a !== amenity));
                          }}
                          id={`amenity-${amenity}`}
                          style={{ marginRight: "0.5rem" }}
                        />
                        <label htmlFor={`amenity-${amenity}`} style={{ fontSize: "0.875rem", color: "#374151" }}>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</label>
                      </div>
                    ))}
                  </div>

                  {/* Apply Filters Button */}
                  <button
                    style={{
                      backgroundColor: "#10b981",
                      color: "#fff",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                      width: "100%",
                      fontSize: "0.95rem",
                      marginTop: "0.5rem"
                    }}
                    onClick={() => {
                      setShowFilters(false);
                      fetchSearchResults(searchQuery);
                    }}
                  >
                    Apply Filters
                  </button>
                </Box>
              </Modal>
            )}
            {/* Properties List */}
            <div style={{ flex: isMobile ? "1 1 100%" : "1 1 100%" }}>
              {loading ? (
                <div style={{
                  textAlign: "center",
                  padding: "4rem 0",
                  color: "#1f2937"
                }}>
                  <div style={{
                    display: "inline-block",
                    width: "48px",
                    height: "48px",
                    border: "4px solid #f3f4f6",
                    borderTop: "4px solid #10b981",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }}></div>
                  <p style={{
                    marginTop: "1rem",
                    fontSize: "1rem",
                    color: "#6b7280"
                  }}>
                    Searching properties...
                  </p>
                </div>
              ) : sortedProperties.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}>
                  <Home size={56} color="#d1d5db" style={{ margin: "0 auto 1rem" }} />
                  <h3 style={{
                    color: "#1f2937",
                    fontSize: "1.25rem",
                    marginBottom: "0.5rem",
                    fontWeight: "700"
                  }}>
                    No Properties Found
                  </h3>
                  <p style={{
                    color: "#6b7280",
                    fontSize: "0.875rem"
                  }}>
                    Try adjusting your filters or search in different areas
                  </p>
                </div>
              ) : (
                <>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: viewMode === "grid" && !isMobile ? "repeat(auto-fill, minmax(350px, 1fr))" : "1fr",
                    gap: "1.25rem"
                  }}>
                    {currentProperties.map((property) => (
                      <PropertyCard key={property._id} property={property} isGridView={viewMode === "grid"} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "2rem",
                      gap: "0.5rem",
                      flexWrap: "wrap"
                    }}>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                          padding: "0.625rem 1.25rem",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          backgroundColor: currentPage === 1 ? "#f3f4f6" : "#fff",
                          color: currentPage === 1 ? "#9ca3af" : "#1f2937",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          fontSize: "0.875rem"
                        }}
                      >
                        Previous
                      </button>
                      
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePageChange(idx + 1)}
                          style={{
                            padding: "0.625rem 1rem",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            backgroundColor: currentPage === idx + 1 ? "#10b981" : "#fff",
                            color: currentPage === idx + 1 ? "#fff" : "#1f2937",
                            fontWeight: currentPage === idx + 1 ? "700" : "500",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                          }}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "0.625rem 1.25rem",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          backgroundColor: currentPage === totalPages ? "#f3f4f6" : "#fff",
                          color: currentPage === totalPages ? "#9ca3af" : "#1f2937",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          fontSize: "0.875rem"
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ flex: isMobile ? "1 1 100%" : "0 0 32%", marginTop: isMobile ? "2rem" : "0" }}>
              <div style={{ position: "sticky", top: "100px" }}>
                {/* Post Property Card */}
                <div style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  border: "1px solid #e5e7eb"
                }}>
                  <Building2 size={48} color="#3b82f6" style={{ margin: "0 auto 1rem" }} />
                  <h3 style={{
                    color: "#1f2937",
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    marginBottom: "0.5rem"
                  }}>
                    List Your Property
                  </h3>
                  <p style={{
                    color: "#6b7280",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                    lineHeight: "1.5"
                  }}>
                    Connect with thousands of verified buyers and renters instantly.
                  </p>
                  <button
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                      width: "100%",
                      fontSize: "0.875rem",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2563eb"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3b82f6"}
                    onClick={() => {
                      if (!user) {
                        navigate("/login");
                        return;
                      }
                      navigate("/add-property");
                    }}
                  >
                    Post Property Free
                  </button>
                </div>

                {/* Why Choose Us Card */}
                <div style={{
                  backgroundColor: "#eff6ff",
                  border: "2px solid #3b82f6",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem"
                  }}>
                    <Shield size={28} color="#3b82f6" />
                    <h4 style={{
                      color: "#1f2937",
                      fontSize: "1rem",
                      fontWeight: "700"
                    }}>
                      Why Choose Us?
                    </h4>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {[
                      "100% Verified Listings",
                      "Zero Brokerage Fees",
                      "Expert Consultation",
                      "Legal Assistance"
                    ].map((item, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "#374151",
                          marginBottom: "0.75rem",
                          fontSize: "0.875rem"
                        }}
                      >
                        <Check size={16} color="#10b981" strokeWidth={3} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Need Assistance Card */}
                <div style={{
                  backgroundColor: "#fef2f2",
                  border: "2px solid #f87171",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  textAlign: "center"
                }}>
                  <Award size={32} color="#ef4444" style={{ margin: "0 auto 0.75rem" }} />
                  <h4 style={{
                    color: "#991b1b",
                    fontSize: "1rem",
                    fontWeight: "700",
                    marginBottom: "0.5rem"
                  }}>
                    Need Assistance?
                  </h4>
                  <p style={{
                    color: "#7f1d1d",
                    fontSize: "0.875rem",
                    marginBottom: "1rem"
                  }}>
                    Our property experts are here to help you
                  </p>
                  <button
                    style={{
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      width: "100%",
                      fontSize: "0.875rem",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#dc2626"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ef4444"}
                    onClick={() => {
                      if (!user) {
                        navigate("/login");
                        return;
                      }
                      navigate("/support");
                    }}
                  >
                    Contact Us Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
      
export default Searchproperty;