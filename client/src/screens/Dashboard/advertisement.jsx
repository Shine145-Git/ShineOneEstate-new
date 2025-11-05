import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStyles = (isMobile) => ({
    container: {
      minHeight: "100vh",
      backgroundColor: "#F4F7F9",
      padding: isMobile ? "1rem" : "2rem",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    topBanner: {
      backgroundColor: "#22D3EE",
      borderRadius: "12px",
      padding: isMobile ? "1rem" : "2rem",
      marginBottom: isMobile ? "1rem" : "2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "1.5rem",
    },
    bannerContent: {
      flex: "1",
      minWidth: "300px",
      textAlign: isMobile ? "center" : "left",
    },
    bannerTitle: {
      fontSize: isMobile
        ? "clamp(1rem, 5vw, 1.25rem)"
        : "clamp(1.5rem, 3vw, 2rem)",
      fontWeight: "700",
      color: "#003366",
      marginBottom: "0.75rem",
      lineHeight: "1.2",
    },
    highlight: {
      color: "#003366",
      fontWeight: "800",
    },
    brandName: {
      color: "#003366",
      fontWeight: "800",
    },
    bannerSubtext: {
      fontSize: isMobile ? "clamp(0.9rem, 3vw, 1.125rem)" : "1.125rem",
      color: "#333333",
      display: "flex",
      justifyContent: isMobile ? "center" : "flex-start",
      alignItems: "center",
      gap: "0.5rem",
    },
    cabEmoji: {
      fontSize: "1.5rem",
    },
    findOutButton: {
      backgroundColor: "#003366",
      color: "#FFFFFF",
      border: "none",
      borderRadius: "50px",
      padding: isMobile ? "0.75rem 1.5rem" : "1rem 2.5rem",
      fontSize: isMobile ? "clamp(0.75rem, 3vw, 0.875rem)" : "1.125rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 12px rgba(0, 51, 102, 0.3)",
      alignSelf: isMobile ? "center" : "auto",
    },
    mainSection: {
      background: "linear-gradient(135deg, #4A6A8A 0%, #003366 100%)",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0, 51, 102, 0.2)",
    },

    contentWrapper: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "0",
      minHeight: isMobile ? "auto" : "500px",
      justifyContent: "center",
      alignItems: "stretch",
      overflow: "visible", // added to allow right section to show fully
    },
    leftSection: {
      padding: isMobile ? "1rem 1rem 2rem" : "3rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      height: isMobile ? "auto" : undefined,
      alignItems: isMobile ? "center" : "flex-start",
      textAlign: isMobile ? "center" : "left",
    },
    leftBg: {
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundImage:
        'url("data:image/svg+xml,%3Csvg width="200" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h200L0 200z" fill="rgba(0,0,0,0.1)"/%3E%3C/svg%3E")',
      opacity: "0.3",
    },
    leftContent: {
      position: "relative",
      zIndex: "1",
      width: isMobile ? "100%" : "auto",
    },
    mainHeading: {
      fontSize: isMobile
        ? "clamp(1.5rem, 5vw, 1.75rem)"
        : "clamp(2rem, 3vw, 2.5rem)",
      fontWeight: "700",
      color: "#22D3EE",
      marginBottom: "0.5rem",
      lineHeight: "1.2",
      textShadow: isMobile ? "2px 2px 8px rgba(0,0,0,0.7)" : undefined,
    },
    subBrand: {
      fontSize: isMobile
        ? "clamp(1rem, 4vw, 1.25rem)"
        : "clamp(1.5rem, 3vw, 2rem)",
      fontWeight: "300",
      color: "#FFFFFF",
      marginBottom: "2rem",
      textShadow: isMobile ? "1px 1px 4px rgba(0,0,0,0.7)" : undefined,
    },
    interiorImage: {
      width: "100%",
      height: isMobile ? "180px" : "100%",
      objectFit: isMobile ? "contain" : "cover",
      display: "block",
      borderRadius: "12px",
      maxWidth: isMobile ? "100%" : "auto",
    },
    rightSection: {
      backgroundColor: "#FFFFFF",
      marginTop: isMobile ? "20px" : "70px",
      padding: isMobile ? "1rem" : "1.5rem 2rem",
      height: isMobile ? "auto" : "500px",
      width: isMobile ? "100%" : "900px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignSelf: "center",
      boxSizing: "border-box",
      position: "relative", // added
      zIndex: 2, // added
    },
    whyChoose: {
      fontSize: isMobile ? "clamp(1rem, 5vw, 1.25rem)" : "1.75rem",
      fontWeight: "700",
      color: "#003366",
      marginBottom: "1.5rem",
      textAlign: isMobile ? "center" : "left",
    },
    featureList: {
      display: "flex",
      flexDirection: "column",
      gap: isMobile ? "0.75rem" : "1.25rem",
      marginBottom: "2rem",
    },
    feature: {
      display: "flex",
      alignItems: "flex-start",
      gap: isMobile ? "0.5rem" : "0.75rem",
    },
    checkIcon: {
      color: "#00A79D",
      flexShrink: "0",
      marginTop: "0.25rem",
    },
    featureText: {
      fontSize: isMobile ? "clamp(0.85rem, 4vw, 1rem)" : "1rem",
      color: "#333333",
      lineHeight: "1.6",
    },
    redText: {
      color: "#00A79D",
      fontWeight: "600",
    },
    saveBadge: {
      display: "inline-block",
      backgroundColor: "#22D3EE",
      color: "#003366",
      padding: "0.5rem 1.25rem",
      borderRadius: "8px",
      fontWeight: "700",
      fontSize: "0.875rem",
      marginBottom: "1.5rem",
    },
    brandsSection: {
      marginBottom: "1.5rem",
      overflow: "hidden",
      paddingBottom: "1rem",
      position: "relative",
    },
    brandsLabel: {
      fontSize: "0.75rem",
      color: "#4A6A8A",
      fontWeight: "600",
      marginBottom: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      textAlign: isMobile ? "center" : "left",
    },
    brandsLogosContainer: {
      display: "flex",
      gap: isMobile ? "0.75rem" : "1rem",
      whiteSpace: "nowrap",
      animation: "scrollBrands 40s linear infinite",
      justifyContent: isMobile ? "center" : "flex-start",
      flexWrap: "nowrap",
      overflowX: "hidden",
    },
    brandLogo: {
      height: isMobile ? "40px" : "50px",
      borderRadius: "6px",
      border: "1px solid #E5E5E5",
      display: "inline-block",
      objectFit: "contain",
    },
    buttonsRow: {
      display: "flex",
      gap: "1rem",
      flexWrap: "wrap",
      justifyContent: isMobile ? "center" : "flex-start",
    },
    exploreButton: {
      backgroundColor: "#003366",
      color: "#FFFFFF",
      border: "none",
      borderRadius: "50px",
      padding: isMobile ? "0.5rem 1.25rem" : "0.875rem 2rem",
      fontSize: isMobile ? "clamp(0.75rem, 3vw, 0.875rem)" : "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 12px rgba(0, 51, 102, 0.3)",
    },
    quoteButton: {
      backgroundColor: "transparent",
      color: "#003366",
      border: "2px solid #003366",
      borderRadius: "50px",
      padding: isMobile ? "0.5rem 1.25rem" : "0.875rem 2rem",
      fontSize: isMobile ? "clamp(0.75rem, 3vw, 0.875rem)" : "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
  });

  const styles = getStyles(isMobile);

  // No API calls are present in this file, only UI elements.
  return (
    <div style={styles.container}>
      {/* Top Banner */}
      <div style={styles.topBanner}>
        <div style={styles.bannerContent}>
          <h1 style={styles.bannerTitle}>
            Plan hassle-free{" "}
            <span style={styles.highlight}>
              Site Visits & Evaluate Projects
            </span>{" "}
            with <span style={styles.brandName}>ggnHomes</span>
          </h1>
          <p style={styles.bannerSubtext}>
            Get <strong>Free Cab</strong> for every site visit!{" "}
            <span style={styles.cabEmoji}>🚕</span>
          </p>
        </div>
        <button
          style={styles.findOutButton}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#00A79D";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#003366";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Find out how
        </button>
      </div>

      {/* Main Section */}
      <div style={styles.mainSection}>
        <div style={styles.contentWrapper}>
          {/* Left Section */}
          <div style={styles.leftSection}>
            <div style={styles.leftBg}></div>
            <div style={styles.leftContent}>
              <h2
                style={{
                  ...styles.mainHeading,
                  color: isMobile ? "#FFFFFF" : "#22D3EE",
                  textShadow: isMobile
                    ? "2px 2px 8px rgba(0,0,0,0.7)"
                    : undefined,
                }}
              >
                Upgrade to Your Dream Home with
              </h2>
              <p
                style={{
                  ...styles.subBrand,
                  color: isMobile ? "#22D3EE" : "#FFFFFF",
                  textShadow: isMobile
                    ? "1px 1px 4px rgba(0,0,0,0.7)"
                    : undefined,
                }}
              >
                ggnHomes
              </p>
              <img
                src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Modern real estate property"
                style={styles.interiorImage}
              />
            </div>
          </div>

          {/* Right Section */}
          <div style={styles.rightSection}>
            <div>
              <h3 style={styles.whyChoose}>Why choose us?</h3>

              <div style={styles.featureList}>
                <div style={styles.feature}>
                  <Check size={20} style={styles.checkIcon} />
                  <p style={styles.featureText}>
                    Compare & choose from{" "}
                    <span style={styles.redText}>
                      300+ top verified property developers
                    </span>
                  </p>
                </div>
                <div style={styles.feature}>
                  <Check size={20} style={styles.checkIcon} />
                  <p style={styles.featureText}>
                    <span style={styles.redText}>
                      Calculate your property investment cost instantly
                    </span>{" "}
                    with our advanced estimator
                  </p>
                </div>
              </div>

              {/* <div style={styles.saveBadge}>Save upto 40%</div> */}

              <div style={styles.brandsSection}>
                <div style={styles.brandsLabel}>Top Real Estate Brands</div>
                <div style={styles.brandsLogosContainer}>
                  {[
                    {
                      name: "Godrej Properties",
                      domain: "godrejproperties.com",
                    },
                    { name: "DLF", domain: "dlf.in" },
                    { name: "Brigade Group", domain: "brigadegroup.com" },
                    {
                      name: "Prestige Estates",
                      domain: "prestigeconstructions.com",
                    },
                    { name: "Sobha", domain: "sobha.com" },
                    { name: "Lodha Group", domain: "lodhagroup.com" },
                    { name: "Puravankara", domain: "puravankara.com" },
                    {
                      name: "Mahindra Lifespace",
                      domain: "mahindralifespaces.com",
                    },
                    { name: "Salarpuria", domain: "salarpuria.com" },
                    { name: "Kolte-Patil", domain: "koltepatil.com" },
                    { name: "Phoenix Mills", domain: "phoenixmills.com" },
                    { name: "Oberoi Realty", domain: "oberoirealty.com" },
                    { name: "Hiranandani", domain: "hiranandani.com" },
                    { name: "Tata Housing", domain: "tataproperties.com" },
                    { name: "Ansal API", domain: "ansalapi.com" },
                    { name: "Raheja Developers", domain: "raheja.com" },
                    { name: "Adani Realty", domain: "adanirealty.com" },
                    { name: "Piramal Realty", domain: "piramalrealty.com" },
                    { name: "Runwal Group", domain: "runwalgroup.com" },
                    { name: "Kalpataru", domain: "kalpataru.com" },
                    { name: "Wadhwa Group", domain: "wadhwagroup.com" },
                    { name: "Rustomjee", domain: "rustomjee.com" },
                    { name: "Sunteck Realty", domain: "sunteckindia.com" },
                    { name: "ATS Group", domain: "atsgreens.com" },
                    { name: "Marvel Realtors", domain: "marvelgroup.in" },
                    { name: "VTP Realty", domain: "vtprealty.com" },
                    { name: "Omaxe", domain: "omaxe.com" },
                    { name: "Supertech", domain: "supertechlimited.com" },
                    { name: "Kanakia", domain: "kanakia.com" },
                    { name: "BPTP", domain: "bptp.com" },
                    { name: "Unitech", domain: "unitechgroup.com" },
                    { name: "Orchid Realty", domain: "orchidrealty.com" },
                    { name: "Jaypee Greens", domain: "jaypeegreens.com" },
                    { name: "K Raheja Corp", domain: "krahejacorp.com" },
                    { name: "L&T Realty", domain: "ltrealty.com" },
                    { name: "Raheja Universal", domain: "raheja.com" },
                    { name: "Gera Developments", domain: "gera.in" },
                    {
                      name: "Mahindra World City",
                      domain: "mahindraworldcity.com",
                    },
                    { name: "Rustomjee Elements", domain: "rustomjee.com" },
                    {
                      name: "Kolte Patil Developers",
                      domain: "koltepatil.com",
                    },
                  ].map((brand, index) => (
                    <img
                      key={index}
                      src={`https://logo.clearbit.com/${brand.domain}`}
                      alt={brand.name}
                      style={styles.brandLogo}
                      loading="lazy"
                    />
                  ))}
                </div>

                <style>
                  {`
                    @keyframes scrollBrands {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                  `}
                </style>
              </div>
            </div>

            <div style={styles.buttonsRow}>
              <button
                style={styles.exploreButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#00A79D";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#003366";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Explore Brands
              </button>
              <button
                style={styles.quoteButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#003366";
                  e.target.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#003366";
                }}
              >
                Get Instant Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
