import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AutoRotatingAds() {
  const [currentAd, setCurrentAd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const images = [
    'https://res.cloudinary.com/dvapbd2xx/image/upload/v1762606793/Ad1_hkbhkl.jpg',
    'https://res.cloudinary.com/dvapbd2xx/image/upload/v1762606793/Ad2_fxa7ty.jpg',
    'https://res.cloudinary.com/dvapbd2xx/image/upload/v1762606793/ad3_q7p0ez.jpg',
    'https://res.cloudinary.com/dvapbd2xx/image/upload/v1762606794/ad4_soaq99.jpg',
  ];

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPaused, images.length]);

  const goToAd = (index) => {
    setCurrentAd(index);
  };

  const nextAd = () => {
    setCurrentAd((prev) => (prev + 1) % images.length);
  };

  const prevAd = () => {
    setCurrentAd((prev) => (prev - 1 + images.length) % images.length);
  };

  const styles = {
    container: {
      width: '100%',
      maxWidth: '320px',
      aspectRatio: '4 / 5',
      backgroundColor: '#F4F7F9',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    adSlide: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0',
      textAlign: 'center',
      backgroundColor: '#000',
      transition: 'all 0.5s ease',
      borderRadius: '12px 12px 0 0',
      overflow: 'hidden',
    },
    image: {
      objectFit: 'cover',
      width: '100%',
      height: '100%',
    },
    navigationWrapper: {
      height: '56px',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 16px',
      borderRadius: '0 0 12px 12px',
      boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.05)',
    },
    navButton: {
      background: 'transparent',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#003366',
    },
    dotsContainer: {
      display: 'flex',
      gap: '6px',
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#C4C4C4',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    activeDot: {
      width: '20px',
      borderRadius: '10px',
      background: '#003366',
    },
    pauseButton: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'none',
      borderRadius: '16px',
      padding: '4px 10px',
      color: '#003366',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      zIndex: 2,
      userSelect: 'none',
    },
    logo: {
      position: 'absolute',
      top: '12px',
      left: '12px',
      fontSize: '18px',
      fontWeight: '700',
      color: '#FFFFFF',
      userSelect: 'none',
      zIndex: 2,
    }
  };

  // Responsive media query for mobile
  let isMobile = false;
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    isMobile = true;
    styles.container.margin = '0 auto';
    styles.container.maxWidth = '380px';
    styles.container.aspectRatio = '4 / 5';
  }

  const MainContainer = ({ children }) => {
    if (isMobile) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ marginTop: isMobile ? '-250px' : '120px' }}>
            {children}
          </div>
        </div>
      );
    }
    return <div style={{ marginTop: '120px' }}>{children}</div>;
  };

  return (
    <MainContainer>
      <div style={styles.container}>
      <style>
        {`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      {/* <div style={styles.logo}>GGN</div> */}
      
      

      <div style={styles.adSlide} key={currentAd}>
        <img src={images[currentAd]} alt={`Ad ${currentAd + 1}`} style={styles.image} />
      </div>

      <div style={styles.navigationWrapper}>
        <button 
          style={styles.navButton}
          onClick={prevAd}
          onMouseEnter={(e) => e.target.style.color = '#0077AA'}
          onMouseLeave={(e) => e.target.style.color = '#003366'}
          aria-label="Previous Ad"
        >
          <ChevronLeft size={20} />
        </button>

        <div style={styles.dotsContainer}>
          {images.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.dot,
                ...(index === currentAd && styles.activeDot)
              }}
              onClick={() => goToAd(index)}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>

        <button 
          style={styles.navButton}
          onClick={nextAd}
          onMouseEnter={(e) => e.target.style.color = '#0077AA'}
          onMouseLeave={(e) => e.target.style.color = '#003366'}
          aria-label="Next Ad"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      </div>
    </MainContainer>
  );
}