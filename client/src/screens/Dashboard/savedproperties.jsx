import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MapPin, Bed, Bath, Square, Eye, Trash2, Filter, Search, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


function SavedProperties({ savedProperties = [] }) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState(savedProperties);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`${process.env.REACT_APP_PROPERTY_ANALYSIS_GET_SAVED_PROPERTIES_API}`, {
        withCredentials: true, // send cookies instead of token
      })
      .then((res) => {
        console.log("✅ Saved properties loaded:", res.data);
        setProperties((res.data || []).filter(p => p.isActive));
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching saved properties:", err.response || err.message);
        setError('Failed to load saved properties.');
        setLoading(false);
      });
  }, []);

  const removeProperty = (id) => {
    setProperties(properties.filter(prop => prop.id !== id));
  };

  const filteredProperties = properties.filter(prop => {
    const matchesType = filterType === 'all' || prop.type === filterType;
    const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prop.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const propertyTypes = ['all', ...new Set(properties.map(p => p.type))];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>Loading saved properties...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
      padding: '40px 20px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 40px',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(0, 51, 102, 0.2)',
          border: '1px solid rgba(0, 167, 157, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '10px'
          }}>
            <Heart 
              size={32} 
              fill="#00A79D" 
              color="#00A79D"
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(0, 167, 157, 0.3))'
              }}
            />
            <h1 style={{
              color: '#003366',
              fontSize: '36px',
              fontWeight: '700',
              margin: 0
            }}>
              Saved Properties
            </h1>
          </div>
          <p style={{
            color: '#4A6A8A',
            fontSize: '16px',
            margin: 0
          }}>
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 30px'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 8px 30px rgba(0, 51, 102, 0.15)',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search */}
          <div style={{
            position: 'relative',
            flex: '1',
            minWidth: '250px'
          }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#4A6A8A',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 15px 12px 45px',
                borderRadius: '12px',
                border: '2px solid #F4F7F9',
                background: '#F4F7F9',
                color: '#333333',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.background = '#FFFFFF';
                e.target.style.borderColor = '#00A79D';
              }}
              onBlur={(e) => {
                e.target.style.background = '#F4F7F9';
                e.target.style.borderColor = '#F4F7F9';
              }}
            />
          </div>

          {/* Filter */}
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Filter size={20} color="#003366" />
            {propertyTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: filterType === type 
                    ? 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)' 
                    : '#F4F7F9',
                  color: filterType === type ? '#FFFFFF' : '#333333',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textTransform: 'capitalize',
                  boxShadow: filterType === type ? '0 4px 12px rgba(0, 167, 157, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (filterType !== type) {
                    e.target.style.background = '#E8F0F2';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterType !== type) {
                    e.target.style.background = '#F4F7F9';
                  }
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            gap: '10px',
            background: '#F4F7F9',
            padding: '5px',
            borderRadius: '12px'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 15px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'grid' ? '#00A79D' : 'transparent',
                color: viewMode === 'grid' ? '#FFFFFF' : '#4A6A8A',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 15px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'list' ? '#00A79D' : 'transparent',
                color: viewMode === 'list' ? '#FFFFFF' : '#4A6A8A',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {filteredProperties.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0, 51, 102, 0.15)'
          }}>
            <Heart size={64} color="#4A6A8A" style={{ opacity: 0.3, marginBottom: '20px' }} />
            <h2 style={{ color: '#003366', fontSize: '24px', marginBottom: '10px' }}>
              No properties found
            </h2>
            <p style={{ color: '#4A6A8A' }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' 
              ? 'repeat(auto-fill, minmax(350px, 1fr))' 
              : '1fr',
            gap: '25px'
          }}>
            {filteredProperties.map((property, index) => (
              <div
                key={property.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 30px rgba(0, 51, 102, 0.12)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
                  display: viewMode === 'list' ? 'flex' : 'block',
                  cursor: 'pointer',
                  border: '1px solid #F4F7F9'
                }}
                onClick={() => {
                  if (property.monthlyRent) {
                    navigate(`/Rentaldetails/${property._id}`);
                  } else {
                    navigate(`/Saledetails/${property._id}`);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 167, 157, 0.25)';
                  e.currentTarget.style.borderColor = '#22D3EE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 51, 102, 0.12)';
                  e.currentTarget.style.borderColor = '#F4F7F9';
                }}
              >
                {/* Image */}
                <div style={{
                  position: 'relative',
                  width: viewMode === 'list' ? '300px' : '100%',
                  paddingBottom: viewMode === 'list' ? '0' : '66.67%',
                  height: viewMode === 'list' ? '100%' : 'auto',
                  overflow: 'hidden',
                  background: '#F4F7F9'
                }}>
                  <img
                    src={property.image}
                    alt={property.title}
                    style={{
                      position: viewMode === 'list' ? 'static' : 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  
                  {/* Type Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(0, 167, 157, 0.4)'
                  }}>
                    {property.type}
                  </div>

                  {/* Actions */}
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('View property details');
                      }}
                      style={{
                        background: '#FFFFFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(0, 51, 102, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.background = '#22D3EE';
                        e.target.querySelector('svg').style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.background = '#FFFFFF';
                        e.target.querySelector('svg').style.color = '#00A79D';
                      }}
                    >
                      <Eye size={18} color="#00A79D" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeProperty(property.id);
                      }}
                      style={{
                        background: '#FFFFFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 12px rgba(0, 51, 102, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.background = '#EF4444';
                        e.target.querySelector('svg').style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.background = '#FFFFFF';
                        e.target.querySelector('svg').style.color = '#EF4444';
                      }}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div style={{
                  padding: '20px',
                  flex: 1
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <h3 style={{
                      color: '#003366',
                      fontSize: '20px',
                      fontWeight: '700',
                      margin: 0,
                      flex: 1
                    }}>
                      {property.title}
                    </h3>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '15px'
                  }}>
                    <MapPin size={16} color="#4A6A8A" />
                    <span style={{
                      color: '#4A6A8A',
                      fontSize: '14px'
                    }}>
                      {property.location}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Bed size={18} color="#00A79D" />
                      <span style={{ color: '#333333', fontSize: '14px', fontWeight: '500' }}>
                        {property.beds} Beds
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Bath size={18} color="#00A79D" />
                      <span style={{ color: '#333333', fontSize: '14px', fontWeight: '500' }}>
                        {property.baths} Baths
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Square size={18} color="#00A79D" />
                      <span style={{ color: '#333333', fontSize: '14px', fontWeight: '500' }}>
                        {property.area} sqft
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '15px',
                    borderTop: '2px solid #F4F7F9'
                  }}>
                    <span style={{
                      color: '#003366',
                      fontSize: '24px',
                      fontWeight: '700'
                    }}>
                      {property.price}
                    </span>
                    <span style={{
                      color: '#4A6A8A',
                      fontSize: '12px'
                    }}>
                      Saved {new Date(property.savedDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input::placeholder {
          color: #4A6A8A;
        }
      `}</style>
    </div>
  );
}

export default SavedProperties;