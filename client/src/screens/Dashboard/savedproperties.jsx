import React, { useEffect, useState } from "react";
import { MapPin, Bed, Bath, Home, SlidersHorizontal, Grid, List, X, Calendar, Car, PawPrint, Cigarette, Package, Building, Wrench, Building2, Shield, Check, Award } from "lucide-react";
import TopNavigationBar from "./TopNavigationBar";
import { useNavigate } from "react-router-dom";
import MapsIntegration from "../Property View/mapsintegration.jsx";
const SavedProperties = () => {
  const isMobile = window.innerWidth <= 768;
  // For inline map view on right
  const [selectedSector, setSelectedSector] = useState(null);
  const handleMapView = (sector) => setSelectedSector(sector);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  
  // Filter states
  const [sortBy, setSortBy] = useState("default");
  const [sector, setSector] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [bedrooms, setBedrooms] = useState("all");
  const [bathrooms, setBathrooms] = useState("all");
  const [areaRange, setAreaRange] = useState({ min: 0, max: Infinity });
  const [tempAreaRange, setTempAreaRange] = useState({ min: "", max: "" });
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [tempPriceRange, setTempPriceRange] = useState({ min: "", max: "" });
  const [moveInDate, setMoveInDate] = useState("");
  const [parking, setParking] = useState("all");
  const [petPolicy, setPetPolicy] = useState("all");
  const [smokingPolicy, setSmokingPolicy] = useState("all");
  const [appliances, setAppliances] = useState([]);
  const [communityFeatures, setCommunityFeatures] = useState([]);
  const [condition, setCondition] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Extract unique values for dropdowns
  const [uniqueSectors, setUniqueSectors] = useState([]);
  const [uniqueAppliances, setUniqueAppliances] = useState([]);
  const [uniqueCommunityFeatures, setUniqueCommunityFeatures] = useState([]);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        const res = await fetch(
          process.env.REACT_APP_PROPERTY_ANALYSIS_GET_SAVED_PROPERTIES_API,
          { 
            method: 'GET',
            credentials: 'include'
          }
        );
        const data = await res.json();
        const props = data?.properties || [];
        setProperties(props);
        setFilteredProperties(props);
        
        // Extract unique values
        const sectors = [...new Set(props.map(p => p.Sector).filter(Boolean))];
        setUniqueSectors(sectors);
        
        const allAppliances = props.flatMap(p => p.appliances || []);
        setUniqueAppliances([...new Set(allAppliances)]);
        
        const allFeatures = props.flatMap(p => p.communityFeatures || []);
        setUniqueCommunityFeatures([...new Set(allFeatures)]);
      } catch (err) {
        console.error("Error fetching saved properties:", err);
        console.log("Testing");
        setError("Failed to load saved properties");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
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

  useEffect(() => {
    applyFiltersAndSort();
  }, [properties, sortBy, sector, propertyType, bedrooms, bathrooms, areaRange, priceRange, moveInDate, parking, petPolicy, smokingPolicy, appliances, communityFeatures, condition]);

  const applyFiltersAndSort = () => {
    let filtered = [...properties];

    // Sector filter
    if (sector !== "all") {
      filtered = filtered.filter(prop => prop.Sector === sector);
    }

    // Property type filter
    if (propertyType !== "all") {
      filtered = filtered.filter(prop => {
        const type = prop.propertyType?.toLowerCase() || "";
        return type === propertyType.toLowerCase();
      });
    }

    // Bedrooms filter
    if (bedrooms !== "all") {
      filtered = filtered.filter(prop => prop.bedrooms === parseInt(bedrooms));
    }

    // Bathrooms filter
    if (bathrooms !== "all") {
      filtered = filtered.filter(prop => prop.bathrooms === parseInt(bathrooms));
    }

    // Area filter
    filtered = filtered.filter(prop => {
      const area = prop.totalArea?.sqft || 0;
      return area >= areaRange.min && area <= areaRange.max;
    });

    // Price/Rent filter
    filtered = filtered.filter(prop => {
      const price = prop.price || prop.monthlyRent || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Move-in date filter
    if (moveInDate) {
      filtered = filtered.filter(prop => {
        if (!prop.moveInDate) return false;
        const propDate = new Date(prop.moveInDate);
        const filterDate = new Date(moveInDate);
        return propDate <= filterDate;
      });
    }

    // Parking filter
    if (parking !== "all") {
      filtered = filtered.filter(prop => {
        const parkingInfo = (prop.parking || "").toLowerCase();
        return parkingInfo.includes(parking.toLowerCase());
      });
    }

    // Pet policy filter
    if (petPolicy !== "all") {
      filtered = filtered.filter(prop => {
        const policy = (prop.petPolicy || "").toLowerCase();
        return policy.includes(petPolicy.toLowerCase());
      });
    }

    // Smoking policy filter
    if (smokingPolicy !== "all") {
      filtered = filtered.filter(prop => {
        const policy = (prop.smokingPolicy || "").toLowerCase();
        return policy.includes(smokingPolicy.toLowerCase());
      });
    }

    // Appliances filter
    if (appliances.length > 0) {
      filtered = filtered.filter(prop => {
        const propAppliances = prop.appliances || [];
        return appliances.every(app => propAppliances.includes(app));
      });
    }

    // Community features filter
    if (communityFeatures.length > 0) {
      filtered = filtered.filter(prop => {
        const propFeatures = prop.communityFeatures || [];
        return communityFeatures.every(feat => propFeatures.includes(feat));
      });
    }

    // Condition/Age filter
    if (condition !== "all") {
      filtered = filtered.filter(prop => {
        const cond = (prop.conditionAge || "").toLowerCase();
        return cond.includes(condition.toLowerCase());
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => ((a.price || a.monthlyRent) || 0) - ((b.price || b.monthlyRent) || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => ((b.price || b.monthlyRent) || 0) - ((a.price || a.monthlyRent) || 0));
        break;
      case "date-new":
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "date-old":
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "title-az":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title-za":
        filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "area-low":
        filtered.sort((a, b) => ((a.totalArea?.sqft) || 0) - ((b.totalArea?.sqft) || 0));
        break;
      case "area-high":
        filtered.sort((a, b) => ((b.totalArea?.sqft) || 0) - ((a.totalArea?.sqft) || 0));
        break;
      default:
        break;
    }

    setFilteredProperties(filtered);
  };

  const handleApplyPriceRange = () => {
    setPriceRange({
      min: tempPriceRange.min ? Number(tempPriceRange.min) : 0,
      max: tempPriceRange.max ? Number(tempPriceRange.max) : Infinity
    });
  };

  const handleApplyAreaRange = () => {
    setAreaRange({
      min: tempAreaRange.min ? Number(tempAreaRange.min) : 0,
      max: tempAreaRange.max ? Number(tempAreaRange.max) : Infinity
    });
  };

  const handleResetFilters = () => {
    setSortBy("default");
    setSector("all");
    setPropertyType("all");
    setBedrooms("all");
    setBathrooms("all");
    setAreaRange({ min: 0, max: Infinity });
    setTempAreaRange({ min: "", max: "" });
    setPriceRange({ min: 0, max: Infinity });
    setTempPriceRange({ min: "", max: "" });
    setMoveInDate("");
    setParking("all");
    setPetPolicy("all");
    setSmokingPolicy("all");
    setAppliances([]);
    setCommunityFeatures([]);
    setCondition("all");
  };

  const toggleArrayFilter = (array, setArray, value) => {
    if (array.includes(value)) {
      setArray(array.filter(item => item !== value));
    } else {
      setArray([...array, value]);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#F4F7F9" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "50px", height: "50px", border: "4px solid #22D3EE", borderTop: "4px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }}></div>
          <p style={{ color: "#003366", fontSize: "1.1rem" }}>Loading saved properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#F4F7F9" }}>
        <div style={{ background: "white", padding: "2rem", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <p style={{ color: "#dc2626", fontSize: "1.1rem" }}>{error}</p>
        </div>
      </div>
    );
  }

return (
  <>
    <style>{`
      .fixed-navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .property-card {
        transition: all 0.3s ease;
      }
      .property-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 55, 102, 0.15) !important;
      }
      .filter-btn {
        transition: all 0.2s;
      }
      .filter-btn:hover {
        background: #4A6A8A !important;
        transform: translateY(-1px);
      }
      .view-btn {
        transition: all 0.2s;
      }
      .view-btn:hover {
        background: #e5e7eb;
      }
      .view-btn.active {
        background: #003366;
        color: white;
      }
      .chip {
        display: inline-block;
        padding: 0.4rem 0.8rem;
        margin: 0.25rem;
        background: #F4F7F9;
        border: 2px solid #003366;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s;
      }
      .chip:hover {
        background: #e5e7eb;
      }
      .chip.active {
        background: #003366;
        color: white;
      }
    `}</style>
    <TopNavigationBar className="fixed-navbar" user={user} onLogout={handleLogout} navItems={navItems} />
 
    <div style={{ marginTop: "10px", height: "calc(100vh - 70px)", overflowY: "auto" }}>
      <div style={{ display: "flex", minHeight: "100%", background: "#F4F7F9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Left Sidebar - Filters */}
        <div style={{ width: showFilters ? "340px" : "0", background: "white", boxShadow: "2px 0 10px rgba(0,0,0,0.05)", overflow: "hidden", transition: "width 0.3s ease" }}>
        <div style={{ padding: "1.5rem", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, color: "#003366", fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <SlidersHorizontal size={22} />
              Filters
            </h3>
            <button onClick={() => setShowFilters(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4A6A8A" }}>
              <X size={20} />
            </button>
          </div>

          {/* Sort By */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              🎯 Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", background: "white", color: "#333333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="area-low">Area: Small to Large</option>
              <option value="area-high">Area: Large to Small</option>
              <option value="date-new">Newest First</option>
              <option value="date-old">Oldest First</option>
              <option value="title-az">Title: A-Z</option>
              <option value="title-za">Title: Z-A</option>
            </select>
          </div>

          {/* Sector */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              📍 Sector
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", background: "white", color: "#333333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              <option value="all">All Sectors</option>
              {uniqueSectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              🏠 Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", background: "white", color: "#333333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              <option value="all">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="villa">Villa</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              🛏️ Bedrooms
            </label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", background: "white", color: "#333333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              <option value="all">Any</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
          </div>

          {/* Bathrooms */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              🛁 Bathrooms
            </label>
            <select
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", background: "white", color: "#333333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              <option value="all">Any</option>
              <option value="1">1 Bathroom</option>
              <option value="2">2 Bathrooms</option>
              <option value="3">3 Bathrooms</option>
              <option value="4">4+ Bathrooms</option>
            </select>
          </div>

          {/* Area Range */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              📏 Area (sqft)
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="number"
                placeholder="Min"
                value={tempAreaRange.min}
                onChange={(e) => setTempAreaRange({ ...tempAreaRange, min: e.target.value })}
                style={{ flex: 1, padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", fontSize: "0.85rem" }}
              />
              <input
                type="number"
                placeholder="Max"
                value={tempAreaRange.max}
                onChange={(e) => setTempAreaRange({ ...tempAreaRange, max: e.target.value })}
                style={{ flex: 1, padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", fontSize: "0.85rem" }}
              />
            </div>
            <button
              onClick={handleApplyAreaRange}
              className="filter-btn"
              style={{ width: "100%", padding: "0.65rem", background: "#003366", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}
            >
              Apply Area
            </button>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              💰 Price / Rent Range
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="number"
                placeholder="Min"
                value={tempPriceRange.min}
                onChange={(e) => setTempPriceRange({ ...tempPriceRange, min: e.target.value })}
                style={{ flex: 1, padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", fontSize: "0.85rem" }}
              />
              <input
                type="number"
                placeholder="Max"
                value={tempPriceRange.max}
                onChange={(e) => setTempPriceRange({ ...tempPriceRange, max: e.target.value })}
                style={{ flex: 1, padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", fontSize: "0.85rem" }}
              />
            </div>
            <button
              onClick={handleApplyPriceRange}
              className="filter-btn"
              style={{ width: "100%", padding: "0.65rem", background: "#003366", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}
            >
              Apply Price
            </button>
          </div>

          {/* Move-in Date */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              📅 Move-in Date (Before)
            </label>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", fontSize: "0.85rem" }}
            />
          </div>

          {/* Parking */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              🚗 Parking
            </label>
            <select
              value={parking}
              onChange={(e) => setParking(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", background: "white", color: "#333333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              <option value="all">Any</option>
              <option value="yes">Available</option>
              <option value="no">Not Available</option>
              <option value="covered">Covered</option>
              <option value="open">Open</option>
            </select>
          </div>

          {/* Pet Policy */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              🐶 Pet Policy
            </label>
            <select
              value={petPolicy}
              onChange={(e) => setPetPolicy(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", background: "white", color: "#333333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              <option value="all">Any</option>
              <option value="allowed">Pets Allowed</option>
              <option value="not allowed">No Pets</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>

          {/* Smoking Policy */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              🚬 Smoking Policy
            </label>
            <select
              value={smokingPolicy}
              onChange={(e) => setSmokingPolicy(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", background: "white", color: "#333333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              <option value="all">Any</option>
              <option value="allowed">Smoking Allowed</option>
              <option value="not allowed">No Smoking</option>
              <option value="outdoor only">Outdoor Only</option>
            </select>
          </div>

          {/* Appliances */}
          {uniqueAppliances.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                🧰 Appliances
              </label>
              <div style={{ maxHeight: "150px", overflowY: "auto", padding: "0.5rem", background: "#F4F7F9", borderRadius: "8px" }}>
                {uniqueAppliances.map(app => (
                  <span
                    key={app}
                    className={`chip ${appliances.includes(app) ? 'active' : ''}`}
                    onClick={() => toggleArrayFilter(appliances, setAppliances, app)}
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Community Features */}
          {uniqueCommunityFeatures.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                🏘️ Community Features
              </label>
              <div style={{ maxHeight: "150px", overflowY: "auto", padding: "0.5rem", background: "#F4F7F9", borderRadius: "8px" }}>
                {uniqueCommunityFeatures.map(feat => (
                  <span
                    key={feat}
                    className={`chip ${communityFeatures.includes(feat) ? 'active' : ''}`}
                    onClick={() => toggleArrayFilter(communityFeatures, setCommunityFeatures, feat)}
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Condition/Age */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#003366", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              🔧 Condition / Age
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "2px solid #e5e7eb", background: "white", color: "#333333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              <option value="all">Any</option>
              <option value="new">New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="needs renovation">Needs Renovation</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetFilters}
            style={{ width: "100%", padding: "0.65rem", background: "#F4F7F9", color: "#003366", border: "2px solid #003366", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", marginBottom: "1rem" }}
          >
            Reset All Filters
          </button>

          {/* Results Count */}
          <div style={{ padding: "1rem", background: "#F4F7F9", borderRadius: "8px", textAlign: "center" }}>
            <p style={{ margin: 0, color: "#4A6A8A", fontSize: "0.85rem" }}>
              Showing <strong style={{ color: "#003366" }}>{filteredProperties.length}</strong> of <strong style={{ color: "#003366" }}>{properties.length}</strong> properties
            </p>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          
          {/* Header */}
          <div style={{
            background: "#ffffff",
            padding: "0.1rem 1.2rem",
            boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: "6px",
            marginBottom: "0.8rem"
          }}>
               <div>
                <h1 style={{ margin: "0 0 0 0", color: "#003366", fontSize: "1.8rem" }}>Saved Properties</h1>
                <p style={{ margin: 0, color: "#4A6A8A" }}>Manage and explore your favorite properties</p>
              </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {!showFilters && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="filter-btn"
                  style={{ padding: "0.75rem 1.25rem", background: "#003366", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                >
                  <SlidersHorizontal size={18} />
                  Show Filters
                </button>
              )}
              <button
                onClick={() => setViewMode("grid")}
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                style={{ padding: "0.75rem", background: viewMode === "grid" ? "#003366" : "#F4F7F9", color: viewMode === "grid" ? "white" : "#333333", border: "none", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                style={{ padding: "0.75rem", background: viewMode === "list" ? "#003366" : "#F4F7F9", color: viewMode === "list" ? "white" : "#333333", border: "none", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Properties List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "2rem", height: "calc(100vh - 70px - 86px)" }}>
            {filteredProperties.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <Home size={64} color="#4A6A8A" style={{ margin: "0 auto 1rem" }} />
                <h3 style={{ color: "#003366", marginBottom: "0.5rem" }}>No properties found</h3>
                <p style={{ color: "#4A6A8A" }}>Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(260px, 1fr))" : "1fr",
                gap: "2rem",
                padding: "1rem"
              }}>
                {filteredProperties.map((prop) => (
                  <div
                    key={prop._id}
                    className="property-card"
                    style={{
                      background: "white",
                      borderRadius: "10px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      cursor: "pointer",
                      transform: "scale(0.95)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease"
                    }}
                  >
                    {prop.images && prop.images.length > 0 && (
                      <div style={{ position: "relative", height: viewMode === "grid" ? "160px" : "220px", overflow: "hidden" }}>
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{ position: "absolute", top: "1rem", left: "1rem", background: prop.defaultpropertytype === "rental" ? "#00A79D" : "#22D3EE", color: "white", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600" }}>
                          {prop.defaultpropertytype === "rental" ? "For Rent" : "For Sale"}
                        </div>
                        {prop.Sector && (
                          <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(0, 51, 102, 0.9)", color: "white", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600" }}>
                            {prop.Sector}
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ padding: "1.25rem" }}>
                      <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.2rem", color: "#003366", fontWeight: "700" }}>
                        {prop.title || "Untitled Property"}
                      </h3>
                      <p style={{ margin: "0 0 1rem 0", color: "#4A6A8A", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <MapPin size={16} />
                        {prop.Sector || "Location not specified"}
                      </p>
                      
                      {/* Property Details */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
                        {prop.bedrooms && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", background: "#F4F7F9", borderRadius: "6px" }}>
                            <Bed size={16} color="#4A6A8A" />
                            <span style={{ fontSize: "0.85rem", color: "#333333" }}>{prop.bedrooms} Bed</span>
                          </div>
                        )}
                        {prop.bathrooms && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", background: "#F4F7F9", borderRadius: "6px" }}>
                            <Bath size={16} color="#4A6A8A" />
                            <span style={{ fontSize: "0.85rem", color: "#333333" }}>{prop.bathrooms} Bath</span>
                          </div>
                        )}
                        {prop.totalArea?.sqft && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", background: "#F4F7F9", borderRadius: "6px" }}>
                            <Home size={16} color="#4A6A8A" />
                            <span style={{ fontSize: "0.85rem", color: "#333333" }}>{prop.totalArea.sqft} sqft</span>
                          </div>
                        )}
                        {prop.totalArea?.configuration && (
                          <div style={{ padding: "0.4rem 0.8rem", background: "#F4F7F9", borderRadius: "6px" }}>
                            <span style={{ fontSize: "0.85rem", color: "#333333", fontWeight: "600" }}>{prop.totalArea.configuration}</span>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.8rem" }}>
                        {prop.parking && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#4A6A8A" }}>
                            <Car size={14} />
                            <span>Parking</span>
                          </div>
                        )}
                        {prop.petPolicy && prop.petPolicy.toLowerCase().includes("allowed") && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#4A6A8A" }}>
                            <PawPrint size={14} />
                            <span>Pet Friendly</span>
                          </div>
                        )}
                        {prop.appliances && prop.appliances.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#4A6A8A" }}>
                            <Package size={14} />
                            <span>{prop.appliances.length} Appliances</span>
                          </div>
                        )}
                        {prop.communityFeatures && prop.communityFeatures.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#4A6A8A" }}>
                            <Building size={14} />
                            <span>{prop.communityFeatures.length} Features</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid #F4F7F9" }}>
                        <div>
                          <p style={{ margin: "0 0 0.25rem 0", color: "#4A6A8A", fontSize: "0.85rem" }}>
                            {prop.defaultpropertytype === "rental" ? "Monthly Rent" : "Price"}
                          </p>
                          <p style={{ margin: 0, fontWeight: "700", color: "#00A79D", fontSize: "1.4rem" }}>
                            ₹{((prop.price || prop.monthlyRent) || 0).toLocaleString()}
                            {prop.defaultpropertytype === "rental" && <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>/mo</span>}
                          </p>
                        </div>
                        {prop.moveInDate && (
                          <div style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#4A6A8A", fontSize: "0.8rem" }}>
                              <Calendar size={14} />
                              <span>Move-in</span>
                            </div>
                            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#333333" }}>
                              {new Date(prop.moveInDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Map View Button */}
                      <div style={{ marginTop: "1rem", textAlign: "right" }}>
                        <button
                          onClick={() => handleMapView(prop.Sector)}
                          style={{
                            background: "#003366",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "0.5rem 1.1rem",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            transition: "background 0.2s"
                          }}
                        >
                          Map View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

            {/* Map View Section - Sticky Right Column */}
            <div style={{ width: "450px", background: "white", boxShadow: "-2px 0 10px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
              {/* Sticky Container */}
              <div style={{ position: "sticky", top: "80px", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid #F4F7F9" }}>
                  <h3 style={{ margin: 0, color: "#003366", fontSize: "1.2rem" }}>Map View</h3>
                  <p style={{ margin: "0.25rem 0 0 0", color: "#4A6A8A", fontSize: "0.9rem" }}>Property locations</p>
                </div>
                <div style={{ height: "300px", overflow: "hidden" }}>
                  {selectedSector ? (
                    <MapsIntegration key={selectedSector} sector={selectedSector} type="property" />
                  ) : (
                    <p style={{ textAlign: "center", color: "#4A6A8A" }}>Select a property to view on map</p>
                  )}
                </div>
                {/* Quick Actions Cards */}
                <div style={{ marginTop: "2rem" }}>
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
                    textAlign: "center",
                    marginBottom: "1.5rem"
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

                  {/* Manage Listings Card */}
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
                    <h3 style={{ color: "#1f2937", fontSize: "1.125rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                      Manage Listings
                    </h3>
                    <p style={{ color: "#6b7280", marginBottom: "1rem", fontSize: "0.875rem", lineHeight: "1.5" }}>
                      View, edit, or delete your saved properties easily
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
                      onClick={() => navigate("/my-properties")}
                    >
                      Go to Listings
                    </button>
                  </div>

                  {/* AI Search Card */}
                  <div style={{
                    backgroundColor: "#eff6ff",
                    border: "2px solid #3b82f6",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    textAlign: "center",
                    marginBottom: "1.5rem"
                  }}>
                    <SlidersHorizontal size={48} color="#3b82f6" style={{ margin: "0 auto 1rem" }} />
                    <h3 style={{ color: "#1f2937", fontSize: "1.125rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                      AI Property Search
                    </h3>
                    <p style={{ color: "#6b7280", marginBottom: "1rem", fontSize: "0.875rem", lineHeight: "1.5" }}>
                      Find properties instantly using AI-powered search and filters
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
                      onClick={() => navigate("/AIassistant")}
                    >
                      Start AI Search
                    </button>
                  </div>

                  {/* Property Stats Card */}
                  <div style={{
                    backgroundColor: "#fef9c3",
                    border: "2px solid #facc15",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    textAlign: "center",
                    marginBottom: "1.5rem"
                  }}>
                    <Home size={48} color="#f59e0b" style={{ margin: "0 auto 1rem" }} />
                    <h3 style={{ color: "#1f2937", fontSize: "1.125rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                      Property Stats
                    </h3>
                    {/* Stats Table */}
                    <div style={{ textAlign: "left", marginBottom: "1rem", fontSize: "0.875rem", color: "#374151" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: "0.5rem", fontWeight: "600" }}>Total Saved Properties:</td>
                            <td style={{ padding: "0.5rem" }}>{properties.length}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.5rem", fontWeight: "600" }}>Configuration Count:</td>
                            <td style={{ padding: "0.5rem" }}>
                              {Object.entries(
                                properties.reduce((acc, prop) => {
                                  const config = prop.totalArea?.configuration || "Unknown";
                                  acc[config] = (acc[config] || 0) + 1;
                                  return acc;
                                }, {})
                              ).map(([config, count]) => (
                                <div key={config}>{config}: {count}</div>
                              ))}
                            </td>
                          </tr>
                          {properties.some(p => p.rating) && (
                            <tr>
                              <td style={{ padding: "0.5rem", fontWeight: "600" }}>Average Rating:</td>
                              <td style={{ padding: "0.5rem" }}>
                                {(
                                  properties.reduce((sum, p) => sum + (p.rating || 0), 0) /
                                  properties.filter(p => p.rating).length
                                ).toFixed(1)}
                              </td>
                            </tr>
                          )}
                          {properties.some(p => p.views) && (
                            <tr>
                              <td style={{ padding: "0.5rem", fontWeight: "600" }}>Total Views:</td>
                              <td style={{ padding: "0.5rem" }}>
                                {properties.reduce((sum, p) => sum + (p.views || 0), 0)}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td style={{ padding: "0.5rem", fontWeight: "600" }}>Average Price:</td>
                            <td style={{ padding: "0.5rem" }}>
                              ₹{(properties.reduce((sum, p) => sum + (p.price || p.monthlyRent || 0), 0) / (properties.length || 1)).toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.5rem", fontWeight: "600" }}>Average Area (sqft):</td>
                            <td style={{ padding: "0.5rem" }}>
                              {(
                                properties.reduce((sum, p) => sum + (p.totalArea?.sqft || 0), 0) /
                                (properties.length || 1)
                              ).toFixed(0)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.5rem", fontWeight: "600" }}>Properties with Parking:</td>
                            <td style={{ padding: "0.5rem" }}>
                              {properties.filter(p => p.parking).length}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.5rem", fontWeight: "600" }}>Pet Friendly Properties:</td>
                            <td style={{ padding: "0.5rem" }}>
                              {properties.filter(p => p.petPolicy?.toLowerCase().includes("allowed")).length}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.5rem", fontWeight: "600" }}>Properties with Community Features:</td>
                            <td style={{ padding: "0.5rem" }}>
                              {properties.filter(p => p.communityFeatures?.length > 0).length}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.5rem", fontWeight: "600" }}>Properties with Appliances:</td>
                            <td style={{ padding: "0.5rem" }}>
                              {properties.filter(p => p.appliances?.length > 0).length}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
             <footer style={{
        background: "linear-gradient(135deg, #003366 0%, #004b6b 100%)",
        color: "#FFFFFF",
        padding: "3rem 1.5rem",
        textAlign: "center",
        marginTop: "3rem"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3 style={{ fontWeight: "800", fontSize: "1.6rem", marginBottom: "0.5rem" }}>
            ggnHomes – Find Your Dream Home
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
            © {new Date().getFullYear()} ggnHomes. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  </>
);
};
      

export default SavedProperties;