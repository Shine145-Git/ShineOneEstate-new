import React, { useState, useEffect } from 'react';
// Removed import of content.json
import AdsColumn from "./adscolumn";

export default function PropertySnapshot() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cityData, setCityData] = useState(null);

  useEffect(() => {
    // Fetch content.json from public folder
    fetch('/content.json')
      .then((res) => res.json())
      .then((data) => {
        const cities = data.cities;
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        setCityData(randomCity);
      })
      .catch((err) => console.error('Failed to load city data:', err));
  }, []);

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#F4F7F9',
    },
    heading: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#333333',
      marginBottom: '0.5rem',
      position: 'relative',
      paddingBottom: '0.75rem',
    },
    underline: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      width: '60px',
      height: '3px',
      backgroundColor: '#22D3EE',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid #E5E5E5',
    },
    description: {
      fontSize: '1rem',
      lineHeight: '1.8',
      color: '#666666',
      marginBottom: '2.5rem',
    },
    readMore: {
      color: '#003366',
      fontWeight: '600',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#003366',
      marginBottom: '0.5rem',
    },
    statLabel: {
      fontSize: '0.95rem',
      color: '#666666',
      lineHeight: '1.5',
    },
  };

  if (!cityData) return <div>Loading...</div>;

  const truncatedText =
    cityData.description.length > 250 ? cityData.description.slice(0, 250) + '...' : cityData.description;

  const stats = [
    { number: cityData.lowBudgetFlats.split(' ')[0], label: cityData.lowBudgetFlats },
    { number: cityData.propertiesForSale.split(' ')[0], label: cityData.propertiesForSale },
    { number: cityData.residentialAgents.split(' ')[0], label: cityData.residentialAgents },
    { number: cityData.residentialProjects.split(' ')[0], label: cityData.residentialProjects },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "24px", flexWrap: "wrap", padding: "2rem" }}>
      <div style={{ flex: "3 1 700px", minWidth: "60%" }}>
        <div style={styles.container}>
          <h2 style={styles.heading}>
            {cityData.name} Property Snapshot
            <span style={styles.underline}></span>
          </h2>

          <div style={styles.card}>
            <p style={styles.description}>
              {isExpanded ? cityData.description : truncatedText}{" "}
              <span
                style={styles.readMore}
                onClick={() => setIsExpanded(!isExpanded)}
                onMouseEnter={(e) => {
                  e.target.style.color = "#00A79D";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#003366";
                }}
              >
                {isExpanded ? "Read less" : "Read more"}
              </span>
            </p>

            <div style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} style={styles.statItem}>
                  <div style={styles.statNumber}>{stat.number}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex: "1 1 300px", minWidth: "280px" }}>
        <AdsColumn />
      </div>
    </div>
  );
}