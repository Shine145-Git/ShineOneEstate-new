import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Bed, Bath, Maximize, DollarSign, MapPin, Share2, Heart, Calendar, Phone, Mail } from 'lucide-react';
import TopNavigationBar from '../Dashboard/TopNavigationBar';

const addEngagementTime = async (propertyId, seconds) => {
  try {
    await fetch(process.env.REACT_APP_PROPERTY_ANALYSIS_ADD_ENGAGEMENT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, seconds }),
      credentials: 'include',
    });
  } catch (err) {
    console.error('Error adding engagement time:', err);
  }
};

const addRating = async (propertyId, rating, comment = '') => {
  try {
    await fetch(process.env.REACT_APP_PROPERTY_ANALYSIS_ADD_RATING, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, rating, comment }),
      credentials: 'include',
    });
  } catch (err) {
    console.error('Error adding rating:', err);
  }
};

export default function SalePropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await fetch(`${process.env.REACT_APP_SALE_PROPERTY_DETAIL_API}/${id}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Property not found');
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        console.error('Error fetching SaleProperty:', err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProperty();
  }, [id]);

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

  useEffect(() => {
    if (!property) return;
    const startTime = Date.now();
    return () => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      addEngagementTime(id, seconds);
    };
  }, [id, property]);

  const navItems = ["For Buyers", "For Tenants", "For Owners", "For Dealers / Builders", "Insights"];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`${process.env.REACT_APP_PROPERTY_ANALYSIS_ADD_SAVE}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property._id }),
      });
      alert('Property saved!');
    } catch (err) {
      console.error('Error saving property:', err);
      alert('Failed to save property');
    }
  };

  const handleSubmitRating = async () => {
    if (userRating < 1) {
      alert("Please select a rating before submitting!");
      return;
    }
    await addRating(id, userRating, userComment);
    alert("Thank you for your rating!");
    setUserRating(0);
    setUserComment('');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F7F9', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <TopNavigationBar navItems={navItems} user={user} onLogout={handleLogout} />
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#4A6A8A' }}>Loading property details...</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F7F9', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <TopNavigationBar navItems={navItems} user={user} onLogout={handleLogout} />
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#4A6A8A' }}>Property not found.</div>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : ['https://via.placeholder.com/800x600?text=No+Image'];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7F9', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <TopNavigationBar navItems={navItems} user={user} onLogout={handleLogout} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* Breadcrumb */}
        <div style={{ padding: '12px 0', fontSize: '14px', color: '#4A6A8A' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ cursor: 'pointer' }}>Properties for Sale</span>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#003366', fontWeight: '500' }}>{property.Sector || 'Property Details'}</span>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Image Gallery */}
            <div style={{ background: '#FFFFFF', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ position: 'relative', width: '100%', height: '500px', background: '#000' }}>
                <img 
                  src={images[currentImageIndex]} 
                  alt="Property" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length)}
                      style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >‹</button>
                    <button
                      onClick={() => setCurrentImageIndex((currentImageIndex + 1) % images.length)}
                      style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >›</button>
                  </>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
              {images.length > 1 && (
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  padding: '16px', 
                  overflowX: 'auto',
                  background: '#FAFAFA'
                }}>
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      onClick={() => setCurrentImageIndex(i)}
                      style={{
                        width: '100px',
                        height: '75px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: i === currentImageIndex ? '2px solid #00A79D' : '2px solid transparent',
                        opacity: i === currentImageIndex ? 1 : 0.6
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Property Overview */}
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003366', marginBottom: '12px', lineHeight: '1.3' }}>
                {property.title || 'Property Title Not Available'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <MapPin size={18} style={{ color: '#00A79D' }} />
                <span style={{ fontSize: '16px', color: '#4A6A8A' }}>{property.Sector || 'Location not specified'}</span>
              </div>

              {/* Price Section */}
              <div style={{ 
                background: 'linear-gradient(135deg, #003366 0%, #00A79D 100%)', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '14px', color: '#F4F7F9', marginBottom: '4px' }}>Property Price</div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#FFFFFF' }}>
                  {property.price ? `₹${property.price.toLocaleString()}` : 'Price on Request'}
                </div>
              </div>

              {/* Property Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '16px',
                paddingBottom: '24px',
                borderBottom: '1px solid #E5E7EB'
              }}>
                <div style={{ textAlign: 'center', padding: '16px', background: '#F4F7F9', borderRadius: '8px' }}>
                  <Bed size={24} style={{ color: '#00A79D', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#003366' }}>
                    {property.bedrooms != null ? property.bedrooms : '-'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4A6A8A' }}>Bedrooms</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: '#F4F7F9', borderRadius: '8px' }}>
                  <Bath size={24} style={{ color: '#00A79D', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#003366' }}>
                    {property.bathrooms != null ? property.bathrooms : '-'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4A6A8A' }}>Bathrooms</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: '#F4F7F9', borderRadius: '8px' }}>
                  <Maximize size={24} style={{ color: '#00A79D', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#003366' }}>
                    {property.totalArea
                      ? typeof property.totalArea === 'object'
                        ? property.totalArea.sqft ?? '-'
                        : property.totalArea
                      : '-'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4A6A8A' }}>
                    {property.totalArea && typeof property.totalArea === 'object' && property.totalArea.configuration
                      ? property.totalArea.configuration
                      : 'Sq. Ft.'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginTop: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#003366', marginBottom: '12px' }}>
                  About this Property
                </h2>
                <p style={{ fontSize: '15px', color: '#333333', lineHeight: '1.8', margin: 0 }}>
                  {property.description || 'No description available for this property.'}
                </p>
              </div>
            </div>

            {/* Rating Section */}
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#003366', marginBottom: '16px' }}>
                Rate this Property
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setUserRating(star)}
                    style={{
                      fontSize: '32px',
                      cursor: 'pointer',
                      color: star <= userRating ? '#FFD700' : '#E5E7EB',
                      transition: 'color 0.2s'
                    }}
                  >★</span>
                ))}
                {userRating > 0 && (
                  <span style={{ marginLeft: '12px', fontSize: '16px', color: '#4A6A8A' }}>
                    {userRating} out of 5
                  </span>
                )}
              </div>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your thoughts about this property (optional)"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '15px',
                  marginBottom: '16px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <button
                onClick={handleSubmitRating}
                style={{
                  background: '#00A79D',
                  color: '#fff',
                  padding: '12px 32px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.target.style.background = '#00887a'}
                onMouseOut={e => e.target.style.background = '#00A79D'}
              >
                Submit Rating
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Action Buttons */}
            <div style={{ 
              background: '#FFFFFF', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '20px'
            }}>
              <button
                onClick={() => navigate(`/property-visit/${property._id}`)}
                style={{
                  width: '100%',
                  background: '#00A79D',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#00887a'}
                onMouseOut={e => e.currentTarget.style.background = '#00A79D'}
              >
                <Calendar size={20} />
                Schedule a Visit
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleShare}
                  style={{
                    flex: 1,
                    background: '#F4F7F9',
                    color: '#003366',
                    border: '1px solid #E5E7EB',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#E5E7EB';
                    e.currentTarget.style.borderColor = '#00A79D';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#F4F7F9';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                  title="Share this property"
                >
                  <Share2 size={18} />
                  Share
                </button>

                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    background: '#F4F7F9',
                    color: '#003366',
                    border: '1px solid #E5E7EB',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#E5E7EB';
                    e.currentTarget.style.borderColor = '#00A79D';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#F4F7F9';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                  title="Save to favorites"
                >
                  <Heart size={18} />
                  Save
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#003366', marginBottom: '16px' }}>
                Contact Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  background: '#F4F7F9',
                  borderRadius: '6px'
                }}>
                  <Phone size={18} style={{ color: '#00A79D' }} />
                  <span style={{ fontSize: '15px', color: '#333333' }}>9310994032</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  background: '#F4F7F9',
                  borderRadius: '6px'
                }}>
                  <Mail size={18} style={{ color: '#00A79D' }} />
                  <span
                    onClick={() => navigate('/support')}
                    style={{
                      fontSize: '15px',
                      color: '#00A79D',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Send inquiry
                  </span>
                </div>
              </div>
            </div>

            {/* Property ID */}
            <div style={{ background: '#F4F7F9', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '13px', color: '#4A6A8A', marginBottom: '4px' }}>Property ID</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#003366', fontFamily: 'monospace' }}>
                #{property._id ? property._id.slice(0, property._id.length / 2).toUpperCase() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}