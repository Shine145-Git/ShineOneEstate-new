// AdCarousel Component - Place this in your dashboard.jsx file

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  '/Ad/Ad1.jpg',
  '/Ad/Ad2.jpg',
  '/Ad/Ad3.jpg',
  '/Ad/Ad4.jpg'
];

function AdCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

 useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, 4000); // scroll every 1 second

  return () => clearInterval(interval);
}, []); // empty dependency array

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(true), 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((currentIndex + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(to right, rgba(0,51,102,0.7), rgba(74,106,138,0.6))',
      padding: '20px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100px'
    }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {/* Main Carousel Container */}
        <div style={{
          position: 'relative',
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '34px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}>
          {/* Image Container with aspect ratio 1080x1350 (4:5) */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            paddingBottom: '125%' 
          }}>
            {images.map((img, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  inset: '0',
                  transition: 'opacity 0.5s ease-in-out',
                  opacity: index === currentIndex ? 1 : 0
                }}
              >
                <img
                  src={img}
                  alt={`Advertisement ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ))}
            
            {/* Gradient Overlays for better button visibility */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '120px',
              background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '120px',
              background: 'linear-gradient(to left, rgba(0,0,0,0.3), transparent)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#1f2937',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s',
              zIndex: 10,
              backdropFilter: 'blur(4px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft style={{ width: '24px', height: '24px' }} />
          </button>

          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#1f2937',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s',
              zIndex: 10,
              backdropFilter: 'blur(4px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
            aria-label="Next slide"
          >
            <ChevronRight style={{ width: '24px', height: '24px' }} />
          </button>

          {/* Dot Indicators */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  transition: 'all 0.3s',
                  borderRadius: '9999px',
                  width: index === currentIndex ? '32px' : '8px',
                  height: '8px',
                  background: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (index !== currentIndex) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentIndex) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                  }
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 10
          }}>
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        </div>
    </div>
  );
}



export default AdCarousel;