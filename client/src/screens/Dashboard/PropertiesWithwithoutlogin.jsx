import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Image, MapPin, Home, Maximize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PropertyDashboard = ({ properties = [], user, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentIndex + itemsPerPage < properties.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const containerStyle = {
    backgroundColor: '#F4F7F9',
    minHeight: '50vh',
    padding: '40px 20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const headerStyle = {
    maxWidth: '1400px',
    margin: '0 auto 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#003366',
    margin: 0,
    position: 'relative',
    paddingBottom: '10px'
  };

  const underlineStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '80px',
    height: '4px',
    backgroundColor: '#00A79D',
    borderRadius: '2px'
  };

  const seeAllStyle = {
    color: '#00A79D',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const carouselWrapperStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    position: 'relative'
  };

  const carouselStyle = {
    overflow: 'hidden',
    position: 'relative'
  };

  const cardsContainerStyle = {
    display: 'flex',
    gap: '24px',
    transform: `translateX(-${currentIndex * (100 / itemsPerPage + 1.714)}%)`,
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0, 51, 102, 0.08)',
    flex: '0 0 calc(25% - 18px)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(74, 106, 138, 0.1)'
  };

  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '220px',
    overflow: 'hidden',
    backgroundColor: '#4A6A8A'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  };

  const imageCountStyle = {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: '#FFFFFF',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backdropFilter: 'blur(4px)'
  };

  const contentStyle = {
    padding: '18px'
  };

  const typeStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#003366',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const priceAreaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  };

  const priceStyle = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#00A79D'
  };

  const separatorStyle = {
    color: '#4A6A8A',
    fontSize: '20px',
    fontWeight: '300'
  };

  const areaStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#4A6A8A'
  };

  const locationStyle = {
    fontSize: '14px',
    color: '#333333',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const statusStyle = {
    fontSize: '13px',
    color: '#4A6A8A',
    fontWeight: '500',
    paddingTop: '10px',
    borderTop: '1px solid rgba(74, 106, 138, 0.15)'
  };

  const navButtonStyle = (direction) => ({
    position: 'absolute',
    top: '50%',
    [direction]: '-20px',
    transform: 'translateY(-50%)',
    backgroundColor: '#FFFFFF',
    border: '2px solid #003366',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 51, 102, 0.15)',
    zIndex: 10
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {title}
          <div style={underlineStyle}></div>
        </h1>
        <a 
          style={seeAllStyle}
          onMouseEnter={(e) => {
            e.target.style.color = '#003366';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#00A79D';
          }}
          onClick={() => {
            if (user) {
              navigate('/seeAllproperties', { state: { recommendedProperties: properties } });
            } else {
              navigate(`${process.env.REACT_APP_LOGIN_PAGE}`);
            }
          }}
        >
          See all Properties <ChevronRight size={20} />
        </a>
      </div>

      <div style={carouselWrapperStyle}>
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            style={navButtonStyle('left')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#003366';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronLeft size={24} color="#003366" />
          </button>
        )}

        <div style={carouselStyle}>
          <div style={cardsContainerStyle}>
            {properties.map((property, idx) => (
              <div
                key={property._id || property.id || idx}
                style={cardStyle}
                onClick={() => {
                  if (user) {
                    navigate(`/Rentaldetails/${property._id}`);
                    
                  } else {
                    navigate("/login");
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 51, 102, 0.15)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 51, 102, 0.08)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <div style={imageContainerStyle}>
                  <img
                    src={property.images?.[0] ? property.images[0] : '/default-property.jpg'}
                    alt={property.type}
                    style={imageStyle}
                    onError={(e) => {
                      if (e.target.src !== window.location.origin + '/default-property.jpg') {
                        e.target.src = '/default-property.jpg';
                      }
                    }}
                  />
                  <div style={imageCountStyle}>
                    <Image size={14} /> {property.images?.length || 0}
                  </div>
                </div>
                <div style={contentStyle}>
                  <div style={typeStyle}>
                    <Home size={18} color="#003366" />
                    {property.type}
                  </div>
                  <div style={priceAreaStyle}>
                    <span style={priceStyle}>₹{property.monthlyRent}</span>
                    <span style={separatorStyle}>|</span>
                    <span style={areaStyle}>
                      <Maximize size={14} style={{display: 'inline', marginRight: '4px'}} />
                      {property.area}
                    </span>
                  </div>
                  <div style={areaStyle}>
                    Move-in Date:{' '}
                    {property.moveInDate
                      ? new Date(property.moveInDate).toLocaleDateString()
                      : 'N/A'}
                  </div>
                  <div style={locationStyle}>
                    <MapPin size={14} color="#00A79D" />
                    {property.address}
                  </div>
                  <div style={statusStyle}>
                    {property.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentIndex + itemsPerPage < properties.length && (
          <button
            onClick={handleNext}
            style={navButtonStyle('right')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#003366';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronRight size={24} color="#003366" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertyDashboard;