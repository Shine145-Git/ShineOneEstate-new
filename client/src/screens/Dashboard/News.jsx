import React, { useState, useEffect } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PropertyHeroSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("News");
  const [articlesByCategory, setArticlesByCategory] = useState({
    News: [],
    "Tax & Legal": [],
    "Help Guides": [],
    Investment: [],
  });
  const [loading, setLoading] = useState(true);

  const tabs = ["News", "Tax & Legal", "Help Guides", "Investment"];

  // GNews API base URL and key
  const gnewsApiKey = process.env.REACT_APP_GNEWS_API_KEY;
  const gnewsBaseUrl = "https://gnews.io/api/v4/search";

  // Queries for each category
  const queries = {
    News: "real estate news",
    "Tax & Legal": "property tax",
    "Help Guides": "home buying guide",
    Investment: "real estate investment",
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const cachedData = localStorage.getItem("articlesByCategory");
        const cachedTimestamp = localStorage.getItem("articlesTimestamp");
        const now = Date.now();

        if (cachedData && cachedTimestamp) {
          setArticlesByCategory(JSON.parse(cachedData));
        }

        if (cachedTimestamp) {
          const lastFetchDate = new Date(parseInt(cachedTimestamp, 10));
          // Calculate midnight of the next day
          const nextMidnight = new Date(lastFetchDate);
          nextMidnight.setHours(24, 0, 0, 0); // set to midnight next day

          if (now < nextMidnight.getTime()) {
            // Current time is before next midnight, skip fetching
            setLoading(false);
            return;
          }
        }

        // Fetch new articles from API
        const newArticles = {};
        for (const tab of tabs) {
          const url = `${gnewsBaseUrl}?q=${encodeURIComponent(
            queries[tab]
          )}&token=${gnewsApiKey}&lang=en&max=10`;
          const res = await fetch(url);
          const data = await res.json();
          const articlesData = Array.isArray(data.articles)
            ? data.articles
            : [];
          // Map API response to required fields with fallbacks and clickable title/image links
          newArticles[tab] = articlesData.map((item, index) => {
            const link = item.url || "#";
            const title = item.title || "No Title";
            const image =
              item.image ||
              "https://via.placeholder.com/150?text=No+Image";
            const date = item.publishedAt
              ? new Date(item.publishedAt).toDateString()
              : "";
            return {
              id: item.url || index,
              title,
              date,
              image,
              category: tab,
              link,
              description: item.description || "",
              // For clickable title and image, we can store the link here and handle in render
            };
          });
        }
        setArticlesByCategory(newArticles);
        localStorage.setItem("articlesByCategory", JSON.stringify(newArticles));
        localStorage.setItem("articlesTimestamp", now.toString());
      } catch (err) {
        const cachedData = localStorage.getItem("articlesByCategory");
        if (cachedData) {
          setArticlesByCategory(JSON.parse(cachedData));
          console.warn("Failed to fetch new articles, loaded cached data instead.");
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const isMobile = window.innerWidth < 768;

  const containerStyle = { backgroundColor: "#F4F7F9",marginTop: isMobile ? "-150px" : "0px", padding: isMobile ? "0px 0px" : "40px 20px" };
  const topTagStyle = {
    textAlign: "center",
    color: "#4A6A8A",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "2px",
    marginBottom: "8px",
    textTransform: "uppercase",
  };
  const mainTitleStyle = {
    textAlign: "center",
    fontSize: isMobile ? "24px" : "42px",
    fontWeight: "800",
    color: "#003366",
    marginBottom: isMobile ? "20px" : "40px",
    lineHeight: "1.2",
    fontFamily: "'Inter', sans-serif",
  };
  const mainWrapperStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    gap: "30px",
    alignItems: "flex-start",
    flexDirection: isMobile ? "column" : "row",
  };
  const leftColumnStyle = {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "0",
  };
  const rightColumnStyle = {
    width: isMobile ? "100%" : "420px",
    maxWidth: isMobile ? "100%" : "420px",
    flexShrink: 0,
    marginTop: isMobile ? "30px" : "0",
  };
  const buyCardStyle = {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 16px rgba(0, 51, 102, 0.08)",
    position: isMobile ? "static" : "sticky",
    top: isMobile ? "auto" : "20px",
  };
  const buyImageStyle = { width: "100%", height: isMobile ? "180px" : "260px", objectFit: "cover" };
  const buyContentStyle = { padding: isMobile ? "20px" : "30px" };
  const buyTagStyle = {
    color: "#4A6A8A",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    marginBottom: "10px",
    textTransform: "uppercase",
  };
  const buyTitleStyle = {
    fontSize: isMobile ? "20px" : "28px",
    fontWeight: "800",
    color: "#003366",
    marginBottom: "15px",
    lineHeight: "1.3",
  };
  const buyDescStyle = {
    fontSize: "15px",
    color: "#333333",
    marginBottom: isMobile ? "15px" : "25px",
    lineHeight: "1.5",
  };
  const exploreButtonStyle = {
    backgroundColor: "#0066CC",
    color: "#FFFFFF",
    padding: isMobile ? "12px 20px" : "14px 28px",
    fontSize: "15px",
    fontWeight: "700",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    width: "100%",
    justifyContent: "center",
  };
  const articlesCardStyle = {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    padding: isMobile ? "40px" : "30px",
    width: isMobile ? "100%" : "90%",
    boxShadow: "0 2px 16px rgba(0, 51, 102, 0.08)",
  };
  const articlesHeaderStyle = {
    fontSize: isMobile ? "20px" : "24px",
    fontWeight: "800",
    color: "#003366",
    marginBottom: "8px",
    lineHeight: "1.3",
  };
  const articlesSubtitleStyle = {
    fontSize: isMobile ? "12px" : "14px",
    color: "#4A6A8A",
    marginBottom: isMobile ? "16px" : "24px",
    fontWeight: "500",
  };
  const tabsContainerStyle = {
    display: "flex",
    gap: "24px",
    marginBottom: "0",
    borderBottom: "1px solid #E5E7EB",
    position: "relative",
    overflowX: isMobile ? "auto" : "visible",
    paddingBottom: "8px",
  };
  const tabStyle = (isActive) => ({
    fontSize: isMobile ? "12px" : "14px",
    fontWeight: isActive ? "700" : "600",
    color: isActive ? "#003366" : "#4A6A8A",
    padding: "0 0 14px 0",
    cursor: "pointer",
    borderBottom: isActive ? "3px solid #00A79D" : "3px solid transparent",
    transition: "all 0.3s ease",
    position: "relative",
    whiteSpace: "nowrap",
    flexShrink: 0,
  });
  const articlesGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  };
  const articleCardStyle = {
    display: "flex",
    gap: "12px",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    padding: "8px",
    borderRadius: "8px",
  };
  const articleImageStyle = {
    width: "80px",
    height: "60px",
    borderRadius: "4px",
    objectFit: "cover",
    flexShrink: 0,
  };
  const articleContentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "60px",
  };
  const articleTitleStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#003366",
    marginBottom: "6px",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
  const articleDateStyle = {
    fontSize: "12px",
    color: "#4A6A8A",
    fontWeight: "500",
  };
  const readMoreLinkStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#003366",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "24px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textDecoration: "none",
  };

  return (
    <div style={containerStyle}>
      <div style={topTagStyle}>ALL PROPERTY NEEDS - ONE PORTAL</div>
      <h1 style={mainTitleStyle}>
        Find Better Places to Live, Work and Wonder...
      </h1>

      <div style={mainWrapperStyle}>
        {/* Left Column */}
        <div style={leftColumnStyle}>
          <div style={articlesCardStyle}>
            <h2 style={articlesHeaderStyle}>Top articles on home buying</h2>
            <p style={articlesSubtitleStyle}>
              Read from Beginners check-list to Pro Tips
            </p>

            <div style={tabsContainerStyle}>
              {tabs.map((tab) => (
                <div
                  key={tab}
                  style={tabStyle(activeTab === tab)}
                  onClick={() => setActiveTab(tab)}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) e.target.style.color = "#00A79D";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) e.target.style.color = "#4A6A8A";
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div style={articlesGridStyle}>
              {loading ? (
                <p>Loading...</p>
              ) : (
                articlesByCategory[activeTab]?.map((article) => (
                  <a
                    key={article.id}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...articleCardStyle, textDecoration: "none" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.backgroundColor = "#F4F7F9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      style={articleImageStyle}
                    />
                    <div style={articleContentStyle}>
                      <div style={articleTitleStyle}>{article.title}</div>
                      <div style={articleDateStyle}>{article.date}</div>
                    </div>
                  </a>
                ))
              )}
            </div>

            <a
              style={readMoreLinkStyle}
              onMouseEnter={(e) => {
                e.target.style.color = "#00A79D";
                e.target.style.gap = "10px";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#003366";
                e.target.style.gap = "6px";
              }}
            >
              Read realty news, guides & articles <ChevronRight size={16} />
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div style={rightColumnStyle}>
          <div style={buyCardStyle}>
            <img
              src="https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&h=500&fit=crop"
              alt="Buy a home"
              style={buyImageStyle}
            />
            <div style={buyContentStyle}>
              <div style={buyTagStyle}>BUY A HOME</div>
              <h2 style={buyTitleStyle}>Find, Buy & Own Your Dream Home</h2>
              <p style={buyDescStyle}>
                Explore from Apartments, land, builder floors, villas and more
              </p>
              <button
                style={exploreButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#003366";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0, 51, 102, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#0066CC";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => navigate("/search")}
              >
                Explore Buying <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeroSection;
