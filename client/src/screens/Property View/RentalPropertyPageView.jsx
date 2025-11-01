import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Bed, Bath, Maximize, Car, DollarSign, MapPin, Calendar, Shield, Wrench, Flame, Wind, Zap, Droplet, Users, AlertCircle, PawPrint, Cigarette, Share2, Heart, Phone } from 'lucide-react';
import TopNavigationBar from '../Dashboard/TopNavigationBar';

// Engagement and Rating API helpers
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

export default function RentalPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Track engagement time on this property page
  useEffect(() => {
    if (!property) return;
    const startTime = Date.now();
    return () => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      addEngagementTime(id, seconds);
    };
  }, [id, property]);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await fetch(`${process.env.REACT_APP_RENTAL_PROPERTY_DETAIL_API}/${id}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Property not found');
        }
        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_LOGOUT_API}`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_PROPERTY_ANALYSIS_ADD_SAVE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId: id }),
        credentials: 'include',
      });
      if (response.ok) {
        alert('Property saved successfully!');
      } else {
        alert('Failed to save property.');
      }
    } catch (error) {
      console.error('Error saving property:', error);
    }
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

  const navItems = ["For Buyers", "For Tenants", "For Owners", "For Dealers / Builders", "Insights"];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
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
          <span style={{ cursor: 'pointer' }}>Properties for Rent</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Home size={28} style={{ color: '#00A79D' }} />
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#003366', margin: 0, lineHeight: '1.3' }}>
                  {property.propertyType || 'Rental Property'}
                </h1>
              </div>
              
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
                <div style={{ fontSize: '14px', color: '#F4F7F9', marginBottom: '4px' }}>Monthly Rent</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', color: '#FFFFFF' }}>
                    {property.monthlyRent ? `₹${property.monthlyRent.toLocaleString()}` : 'Price on Request'}
                  </span>
                  <span style={{ fontSize: '20px', color: '#F4F7F9', fontWeight: '500' }}>/month</span>
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
                    {property.totalArea && property.totalArea.sqft ? property.totalArea.sqft : '-'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4A6A8A' }}>
                    {property.totalArea && property.totalArea.configuration ? property.totalArea.configuration : 'Sq. Ft.'}
                  </div>
                </div>
              </div>

              {/* Property Details Section */}
              <div style={{ marginTop: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#003366', marginBottom: '16px' }}>
                  Property Details
                </h2>
                
                {/* Layout Features */}
                {property.layoutFeatures && (
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '8px' }}>Layout Features</div>
                    <div style={{ fontSize: '15px', color: '#333333', lineHeight: '1.8' }}>
                      {Array.isArray(property.layoutFeatures) ? property.layoutFeatures.join(', ') : property.layoutFeatures}
                    </div>
                  </div>
                )}

                {/* Appliances */}
                {property.appliances && property.appliances.length > 0 && (
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '8px' }}>Appliances Included</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {property.appliances.map((appliance, i) => (
                        <span key={i} style={{ background: '#F4F7F9', color: '#003366', padding: '6px 12px', borderRadius: '16px', fontSize: '14px' }}>
                          {appliance}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Condition/Age */}
                {property.conditionAge && (
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '8px' }}>Property Age</div>
                    <div style={{ fontSize: '15px', color: '#333333' }}>{property.conditionAge} years old</div>
                  </div>
                )}

                {/* Renovations */}
                {property.renovations && (
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '8px' }}>Recent Renovations</div>
                    <div style={{ fontSize: '15px', color: '#333333' }}>
                      {Array.isArray(property.renovations) ? property.renovations.join(', ') : property.renovations}
                    </div>
                  </div>
                )}

                {/* Parking */}
                {property.parking && (
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Car size={20} style={{ color: '#00A79D' }} />
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A' }}>Parking</div>
                    </div>
                    <div style={{ fontSize: '15px', color: '#333333', marginTop: '8px' }}>{property.parking}</div>
                  </div>
                )}

                {/* Outdoor Space */}
                {property.outdoorSpace && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '8px' }}>Outdoor Space</div>
                    <div style={{ fontSize: '15px', color: '#333333' }}>{property.outdoorSpace}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial & Lease Terms */}
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <DollarSign size={24} style={{ color: '#00A79D' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#003366', margin: 0 }}>Financial & Lease Terms</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                {property.leaseTerm && (
                  <div style={{ padding: '16px', background: '#F4F7F9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', color: '#4A6A8A', marginBottom: '4px' }}>Lease Term</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#003366' }}>{property.leaseTerm}</div>
                  </div>
                )}
                {property.securityDeposit && (
                  <div style={{ padding: '16px', background: '#F4F7F9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', color: '#4A6A8A', marginBottom: '4px' }}>Security Deposit</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#003366' }}>{property.securityDeposit}</div>
                  </div>
                )}
              </div>

              {/* Other Fees */}
              {property.otherFees && (
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '8px' }}>Other Fees</div>
                  <div style={{ fontSize: '15px', color: '#333333' }}>
                    {Array.isArray(property.otherFees) ? property.otherFees.join(', ') : property.otherFees}
                  </div>
                </div>
              )}

              {/* Utilities */}
              {property.utilities && (
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '12px' }}>Utilities</div>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Droplet size={18} style={{ color: property.utilities.water ? '#00A79D' : '#CCC' }} />
                      <span style={{ fontSize: '14px', color: '#333333' }}>Water {property.utilities.water ? '✓' : '✗'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Wind size={18} style={{ color: property.utilities.gas ? '#00A79D' : '#CCC' }} />
                      <span style={{ fontSize: '14px', color: '#333333' }}>Gas {property.utilities.gas ? '✓' : '✗'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={18} style={{ color: property.utilities.electric ? '#00A79D' : '#CCC' }} />
                      <span style={{ fontSize: '14px', color: '#333333' }}>Electric {property.utilities.electric ? '✓' : '✗'}</span>
                    </div>
                  </div>
                  {property.utilities.included && property.utilities.included.length > 0 && (
                    <div style={{ fontSize: '14px', color: '#333333', marginBottom: '4px' }}>
                      <strong>Included:</strong> {property.utilities.included.join(', ')}
                    </div>
                  )}
                  {property.utilities.tenantPays && property.utilities.tenantPays.length > 0 && (
                    <div style={{ fontSize: '14px', color: '#333333' }}>
                      <strong>Tenant Pays:</strong> {property.utilities.tenantPays.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Tenant Requirements */}
              {property.tenantRequirements && (
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '8px' }}>Tenant Requirements</div>
                  <div style={{ fontSize: '15px', color: '#333333' }}>
                    {Array.isArray(property.tenantRequirements) 
                      ? property.tenantRequirements.join(', ') 
                      : property.tenantRequirements}
                  </div>
                </div>
              )}

              {/* Move-in Date */}
              {property.moveInDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} style={{ color: '#00A79D' }} />
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A' }}>Available from:</span>
                  <span style={{ fontSize: '15px', color: '#003366', fontWeight: '600' }}>
                    {new Date(property.moveInDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Location & Amenities */}
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <MapPin size={24} style={{ color: '#00A79D' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#003366', margin: 0 }}>Location & Amenities</h2>
              </div>

              {property.neighborhoodVibe && (
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '8px' }}>Neighborhood</div>
                  <div style={{ fontSize: '15px', color: '#333333', lineHeight: '1.8' }}>{property.neighborhoodVibe}</div>
                </div>
              )}

              {property.transportation && (
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '8px' }}>Transportation</div>
                  <div style={{ fontSize: '15px', color: '#333333', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{property.transportation}</div>
                </div>
              )}

              {property.localAmenities && (
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '8px' }}>Local Amenities</div>
                  <div style={{ fontSize: '15px', color: '#333333', lineHeight: '1.8' }}>
                    {Array.isArray(property.localAmenities) ? property.localAmenities.join(', ') : property.localAmenities}
                  </div>
                </div>
              )}

              {property.communityFeatures && property.communityFeatures.length > 0 && (
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#4A6A8A', marginBottom: '12px' }}>Community Features</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {property.communityFeatures.map((feature, i) => (
                      <span key={i} style={{ background: '#F4F7F9', color: '#003366', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Policies & Logistics */}
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Shield size={24} style={{ color: '#00A79D' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#003366', margin: 0 }}>Policies & Logistics</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {property.petPolicy && (
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px', padding: '16px', background: '#F4F7F9', borderRadius: '8px', borderLeft: '4px solid #00A79D' }}>
                    <PawPrint size={20} style={{ color: '#00A79D', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#003366', marginBottom: '6px' }}>Pet Policy</div>
                      <div style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6' }}>{property.petPolicy}</div>
                    </div>
                  </div>
                )}

                {property.smokingPolicy && (
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px', padding: '16px', background: '#F4F7F9', borderRadius: '8px', borderLeft: '4px solid #4A6A8A' }}>
                    <Cigarette size={20} style={{ color: '#4A6A8A', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#003366', marginBottom: '6px' }}>Smoking Policy</div>
                      <div style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6' }}>{property.smokingPolicy}</div>
                    </div>
                  </div>
                )}

                {property.maintenance && (
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px', padding: '16px', background: '#F4F7F9', borderRadius: '8px', borderLeft: '4px solid #22D3EE' }}>
                    <Wrench size={20} style={{ color: '#22D3EE', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#003366', marginBottom: '6px' }}>Maintenance Responsibilities</div>
                      <div style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6' }}>{property.maintenance}</div>
                    </div>
                  </div>
                )}

                {property.insurance && (
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px', padding: '16px', background: '#F4F7F9', borderRadius: '8px', borderLeft: '4px solid #003366' }}>
                    <AlertCircle size={20} style={{ color: '#003366', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#003366', marginBottom: '6px' }}>Renter's Insurance</div>
                      <div style={{ fontSize: '14px', color: '#333333', lineHeight: '1.6' }}>{property.insurance}</div>
                    </div>
                  </div>
                )}
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
                Schedule a Viewing
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

            {/* Contact & Enquiry */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#003366', marginBottom: '16px' }}>
                Contact &amp; Enquiry
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Phone size={20} style={{ color: '#00A79D' }} />
                <span style={{ fontSize: '16px', color: '#003366', fontWeight: '600', letterSpacing: '1px' }}>
                  9310994032
                </span>
              </div>
              <button
                onClick={() => navigate('/support')}
                style={{
                  width: '100%',
                  background: '#00A79D',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#00887a'}
                onMouseOut={e => e.currentTarget.style.background = '#00A79D'}
              >
                Send Inquiry
              </button>
            </div>

            {/* Quick Info */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#003366', marginBottom: '16px' }}>
                Quick Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {property.leaseTerm && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#F4F7F9',
                    borderRadius: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#4A6A8A', fontWeight: '500' }}>Lease Term</span>
                    <span style={{ fontSize: '14px', color: '#003366', fontWeight: '600' }}>{property.leaseTerm}</span>
                  </div>
                )}
                {property.securityDeposit && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#F4F7F9',
                    borderRadius: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#4A6A8A', fontWeight: '500' }}>Security Deposit</span>
                    <span style={{ fontSize: '14px', color: '#003366', fontWeight: '600' }}>{property.securityDeposit}</span>
                  </div>
                )}
                {property.moveInDate && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#F4F7F9',
                    borderRadius: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#4A6A8A', fontWeight: '500' }}>Available From</span>
                    <span style={{ fontSize: '14px', color: '#003366', fontWeight: '600' }}>
                      {new Date(property.moveInDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Property ID */}
            <div style={{ background: '#F4F7F9', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '13px', color: '#4A6A8A', marginBottom: '4px' }}>Property ID</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#003366', fontFamily: 'monospace' }}>
                #{property._id ? property._id.slice(0, 12).toUpperCase() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}