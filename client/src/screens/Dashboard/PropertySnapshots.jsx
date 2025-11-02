import React, { useState, useEffect } from 'react';
// Removed import of content.json
import AdsColumn from "./adscolumn";

export default function PropertySnapshot() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cityData, setCityData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

  useEffect(() => {
      function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    
  }, []);

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: isMobile ? '0 auto 1rem auto' : '0 auto',
      padding: isMobile ? '1rem' : '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#F4F7F9',
    },
    heading: {
      fontSize: isMobile ? '1.4rem' : '2rem',
      fontWeight: '700',
      color: '#333333',
      marginBottom: isMobile ? '0.75rem' : '0.5rem',
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
      padding: isMobile ? '1.25rem 1.5rem' : '2.5rem',
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
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
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
    mainWrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '24px',
      flexWrap: 'wrap',
      padding: isMobile ? '1rem' : '2rem',
      flexDirection: isMobile ? 'column' : 'row',
    },
    mainContent: {
      flex: isMobile ? '1 1 100%' : '3 1 700px',
      minWidth: isMobile ? '100%' : '60%',
    },
    adsColumn: {
      flex: isMobile ? '1 1 100%' : '1 1 300px',
      minWidth: isMobile ? '100%' : '280px',
      marginTop: isMobile ? '0rem' : '0',
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
    <div style={styles.mainWrapper}>
      <div style={styles.mainContent}>
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
      <div style={styles.adsColumn}>
        <AdsColumn />
      </div>
    </div>
  );
}