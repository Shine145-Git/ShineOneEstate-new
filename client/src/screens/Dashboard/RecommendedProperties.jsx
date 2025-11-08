// Properties in your area component
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Image, MapPin, Home, Maximize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecommendedProperties = ({ properties = [], user, title, onPropertyClick, hasMore, onLoadMore, locationQueryFields }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Responsive items per page (prevents collapse on mobile)
  const [itemsPerPage, setItemsPerPage] = useState(4);
  useEffect(() => {
    const updateItems = () => {
      const w = window.innerWidth;
      if (w < 480) setItemsPerPage(1);       // phones
      else if (w < 768) setItemsPerPage(2);  // small tablets
      else if (w < 1200) setItemsPerPage(3); // tablets / small desktops
      else setItemsPerPage(4);               // large screens
    };
    updateItems();
    window.addEventListener('resize', updateItems);
    return () => window.removeEventListener('resize', updateItems);
  }, []);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 7000);
    return () => clearTimeout(timer);
  }, []);

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
    transform: `translateX(-${currentIndex * (100 / itemsPerPage + (itemsPerPage <= 2 ? 2 : 1.25))}%)`,
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0, 51, 102, 0.08)',
    flex: `0 0 calc(${100 / itemsPerPage}% - 18px)`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(74, 106, 138, 0.1)'
  };

  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    height: itemsPerPage <= 2 ? 180 : 220,
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
              navigate('/seeAllproperties', {
                state: {
                  recommendedProperties: properties,
                  // Pass location fields when provided so SeeAllProperties can use backend pagination
                  locationQueryFields: Array.isArray(locationQueryFields) && locationQueryFields.length > 0 ? locationQueryFields : undefined,
                },
              });
            } else {
              navigate('/login');
            }
          }}
        >
          See all Properties <ChevronRight size={20} />
        </a>
      </div>

      {loading ? (
        <div className="shimmer-loader-wrapper">
          <div className="shimmer-cards-row">
            {[...Array(itemsPerPage)].map((_, idx) => (
              <div className="shimmer-card" key={idx}>
                <div className="shimmer-image" />
                <div className="shimmer-content">
                  <div className="shimmer-title shimmer-animate" />
                  <div className="shimmer-price shimmer-animate" />
                  <div className="shimmer-area shimmer-animate" />
                  <div className="shimmer-location shimmer-animate" />
                  <div className="shimmer-status shimmer-animate" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
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
            <div style={cardsContainerStyle} className="fade-in">
              {properties.filter(p => p.isActive !== false).map((property, idx) => (
                <div
                  key={property._id || property.id || idx}
                  style={cardStyle}
                  onClick={() => {
                    if (onPropertyClick) onPropertyClick(property._id);
                    if (!user) {
                      navigate("/login");
                    } else {
                      const t = (property.defaultpropertytype || property.defaultPropertyType || property.propertyCategory || '').toLowerCase();
                      if (t === 'rental') {
                        navigate(`/Rentaldetails/${property._id}`);
                      } else {
                        navigate(`/Saledetails/${property._id}`);
                      }
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
                      src={property.images?.[0] || '/default-property.jpg'}
                      alt={property.type}
                      style={imageStyle}
                      onError={(e) => { e.target.src = '/default-property.jpg'; }}
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
                      {property.Sector}
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
      )}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={onLoadMore}
            style={{
              padding: '10px 20px',
              backgroundColor: '#00A79D',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#007f73')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#00A79D')}
          >
            Load More Properties
          </button>
        </div>
      )}
      <style>
      {`
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInProperties 0.8s ease-in-out forwards;
        }

        @keyframes fadeInProperties {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Shimmer Loader Styles */
        .shimmer-loader-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px 0 36px 0;
        }
        .shimmer-cards-row {
          display: flex;
          gap: 24px;
        }
        .shimmer-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 51, 102, 0.08);
          flex: 0 0 calc(25% - 18px);
          overflow: hidden;
          border: 1px solid rgba(74, 106, 138, 0.1);
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .shimmer-image {
          background: #e0e6ed;
          height: 220px;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .shimmer-content {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .shimmer-title, .shimmer-price, .shimmer-area, .shimmer-location, .shimmer-status {
          border-radius: 6px;
          background: #e0e6ed;
          position: relative;
          overflow: hidden;
        }
        .shimmer-title {
          height: 22px;
          width: 70%;
          margin-bottom: 6px;
        }
        .shimmer-price {
          height: 18px;
          width: 50%;
        }
        .shimmer-area {
          height: 16px;
          width: 60%;
        }
        .shimmer-location {
          height: 14px;
          width: 40%;
        }
        .shimmer-status {
          height: 13px;
          width: 30%;
          margin-top: 10px;
        }
        .shimmer-animate {
          background: linear-gradient(90deg, #e0e6ed 0%, #f4f7f9 40%, #e0e6ed 80%);
          background-size: 200% 100%;
          animation: shimmer-move 1.3s linear infinite;
        }
        @keyframes shimmer-move {
          0% {
            background-position: -150% 0;
          }
          100% {
            background-position: 150% 0;
          }
        }
        @media (max-width: 768px) {
          .shimmer-cards-row { flex-wrap: nowrap; overflow-x: auto; }
          .shimmer-card { flex: 0 0 70%; min-width: 70%; }
        }
      `}
      </style>
    </div>
  );
};

export default RecommendedProperties;