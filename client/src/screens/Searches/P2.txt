import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Home,
  Sparkles,
  SlidersHorizontal,
  Heart,
  MoreVertical,
  Phone,
  MessageCircle,
} from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import TopNavigationBar from "../Dashboard/TopNavigationBar";

const Searchproperty = () => {
  const { query } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");

  // ✅ Responsive handler
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchSearchResults = async (queryToSearch) => {
    const searchVal =
      typeof queryToSearch === "string" ? queryToSearch : searchQuery;
    if (searchVal.trim() === "") return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("query", searchVal.trim());
      if (propertyTypeFilter) params.append("type", propertyTypeFilter);

      const res = await axios.get(
        `${process.env.REACT_APP_SEARCH_PROPERTIES_API}?${params.toString()}`,
        { withCredentials: true }
      );
      setFilteredPayments(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Search API error:", error);
      setFilteredPayments([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") return;
    fetchSearchResults(searchQuery);
  }, [searchQuery, propertyTypeFilter]);

  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_LOGOUT_API}`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F4F7F9" }}>
      <TopNavigationBar navItems={navItems} user={user} handleLogout={handleLogout} />

      {/* Search and Filter Section */}
      <div
        style={{
          backgroundColor: "#003d82",
          padding: isMobile ? "2rem 1rem" : "3rem 0 2.5rem 0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          background: "linear-gradient(180deg, #003d82 0%, #065bb1ff 100%)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
          {/* Search Bar */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Search size={22} color="#4A6A8A" style={{ marginLeft: "0.75rem" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim() !== "") {
                  fetchSearchResults(searchQuery.trim());
                }
              }}
              placeholder="Search by location, property type, or amenities"
              style={{
                flex: 1,
                padding: "0.85rem 0",
                border: "none",
                fontSize: "1rem",
                outline: "none",
                color: "#333333",
              }}
            />
            <select
              value={propertyTypeFilter}
              onChange={(e) => setPropertyTypeFilter(e.target.value)}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#fff",
                color: "#333",
                fontSize: "1rem",
                flex: isMobile ? "1 1 100%" : "0 0 200px",
              }}
            >
              <option value="">All Types</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
            <button
              style={{
                backgroundColor: "#00A79D",
                color: "#FFFFFF",
                border: "none",
                padding: "0.85rem 2rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                width: isMobile ? "100%" : "auto",
              }}
              onClick={() => {
                if (searchQuery.trim() !== "") {
                  fetchSearchResults(searchQuery.trim());
                }
              }}
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2.5rem 2rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "2rem",
          }}
        >
          {/* Left Column */}
          <div style={{ flex: isMobile ? "1 1 100%" : "1 1 70%" }}>
            {/* Property List */}
            {loading ? (
              <div style={{ textAlign: "center", color: "#003366" }}>
                Loading properties...
              </div>
            ) : filteredPayments.length === 0 ? (
              <div style={{ textAlign: "center", color: "#003366" }}>
                No results found.
              </div>
            ) : (
              filteredPayments.map((property) => (
                <div
                  key={property._id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 2px 12px rgba(0, 51, 102, 0.08)",
                    marginBottom: "1.5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (property.monthlyRent) {
                      navigate(`/Rentaldetails/${property._id}`);
                    } else {
                      navigate(`/Saledetails/${property._id}`);
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                    }}
                  >
                    {/* Property Image */}
                    <div
                      style={{
                        width: isMobile ? "100%" : "300px",
                        height: "220px",
                        flexShrink: 0,
                        background:
                          "linear-gradient(135deg, #003366 0%, #4A6A8A 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt="Property"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Home size={64} color="rgba(255,255,255,0.3)" />
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, padding: "1.5rem" }}>
                      <h3
                        style={{
                          color: "#003366",
                          fontSize: "1.25rem",
                          fontWeight: "700",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {property.monthlyRent
                          ? `${property.propertyType ? property.propertyType + ' ' : ''}For Rent${property.address ? ' in ' + property.address : ''}`
                          : `${property.title ? property.title + ' ' : ''}For Sale${property.location ? ' in ' + property.location : ''}`}
                      </h3>
                      <p style={{ color: "#4A6A8A", marginBottom: "0.75rem" }}>
                        {property.monthlyRent && property.society ? property.society : ''}
                      </p>

                      <div style={{ color: "#003366", fontWeight: "700" }}>
                        {property.monthlyRent && property.monthlyRent ? `₹ ${Number(property.monthlyRent).toLocaleString()}` : ''}
                        {property.price && !property.monthlyRent ? `₹ ${Number(property.price).toLocaleString()}` : ''}
                        {property.area ? ` | ${property.area} sqft` : ''}
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                        <button
                          style={{
                            backgroundColor: "#FFFFFF",
                            color: "#00A79D",
                            border: "2px solid #00A79D",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer",
                            width: isMobile ? "100%" : "auto",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/support`);
                          }}
                        >
                          <Phone size={16} /> Get Phone No.
                        </button>
                        <button
                          style={{
                            backgroundColor: "#DC2626",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer",
                            width: isMobile ? "100%" : "auto",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/support`);
                          }}
                        >
                          <MessageCircle size={16} /> Contact Agent
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column */}
          <div
            style={{
              flex: isMobile ? "1 1 100%" : "0 0 320px",
              marginTop: isMobile ? "2rem" : "0",
            }}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  color: "#003366",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  marginBottom: "0.5rem",
                }}
              >
                List Your Property
              </h3>
              <p style={{ color: "#4A6A8A", marginBottom: "1rem" }}>
                Reach thousands of verified buyers and tenants on GGN Rental Deals.
              </p>
              <button
                onClick={() => navigate("/add-property")}
                style={{
                  backgroundColor: "#00A79D",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "0.85rem 1.5rem",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  width: "100%",
                }}
              >
                Post Property Free
              </button>
            </div>

            {/* Promotional Banner */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, #003d82 0%, #065bb1ff 100%)",
                color: "#FFFFFF",
                borderRadius: "12px",
                padding: "2rem 1.5rem",
                textAlign: "center",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              <Sparkles size={40} color="#FFD700" style={{ marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                Exclusive Offers!
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#e0e7ff", marginBottom: "1rem" }}>
                Get free goodies worth ₹5,000 when you close a deal through us.
              </p>
              <button
                onClick={() => navigate("/offers")}
                style={{
                  backgroundColor: "#FFD700",
                  color: "#003d82",
                  border: "none",
                  padding: "0.8rem 1.5rem",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                View Offers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Searchproperty;