import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Bed, Bath, Maximize, Car, DollarSign, MapPin, Calendar, Shield, Wrench, Flame, Wind, Zap, Droplet, Users, AlertCircle, PawPrint, Cigarette, Share2 } from 'lucide-react';
import TopNavigationBar from '../Dashboard/TopNavigationBar';
export default function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchProperty() {
      try {
        console.log("Fetching property with id:", id);
        // Property detail endpoint is configurable via .env
        const response = await fetch(`${process.env.REACT_APP_PROPERTY_DETAIL_API}/${id}`, {
          credentials: 'include',
        });
        console.log("Response:", response);
        if (!response.ok) {
          throw new Error('Property not found');
        }
        const data = await response.json();
        console.log("Property data received:", data);
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
    // Logout endpoint is configurable via .env
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
        // User info endpoint is configurable via .env
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

  // Share button handler
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Optionally, show a notification
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
  };
  // Helper to render fields, array fields joined with commas, fallback to 'N.A'
  const renderField = (label, value, isArray = false) => {
    // value is now a direct field of property (already flattened)
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:'12px',borderBottom:'1px solid #F4F7F9'}}>
        <span style={{color:'#4A6A8A',fontWeight:'500'}}>{label}</span>
        <span style={{color:'#333333',fontWeight:'600'}}>
          {isArray
            ? (value && value.length > 0 ? value.join(', ') : 'N.A')
            : (value || 'N.A')}
        </span>
      </div>
    );
  };

  if (loading) {
    return <div style={{fontFamily:'system-ui,-apple-system,sans-serif',padding:'20px'}}>Loading property...</div>;
  }

  if (!property) {
    return <div style={{fontFamily:'system-ui,-apple-system,sans-serif',padding:'20px'}}>Property not found.</div>;
  }

  console.log("Rendering property:", property);
  return (
    <div style={{ minHeight: '100vh', background: '#F4F7F9', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <TopNavigationBar navItems={navItems} user={user} onLogout={handleLogout} />
      <div style={{maxWidth:'1200px',margin:'40px auto',padding:'32px 20px',background:'#FFFFFF',borderRadius:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
          {/* Images Carousel */}
          <div style={{overflowX:'auto',display:'flex',gap:'12px',padding:'20px',background:'#FFFFFF',WebkitOverflowScrolling:'touch',scrollbarWidth:'thin',marginBottom:'24px'}}>
            {(property.images && property.images.length > 0 ? property.images : ['https://via.placeholder.com/480x320?text=No+Image']).map((img,i)=>(
              <img key={i} src={img} alt={`Property Image ${i+1}`} style={{height:'320px',minWidth:'480px',objectFit:'cover',borderRadius:'12px',cursor:'pointer',transition:'transform 0.2s'}} onMouseOver={e=>e.target.style.transform='scale(1.02)'} onMouseOut={e=>e.target.style.transform='scale(1)'} />
            ))}
          </div>

          {/* Header */}
          <div style={{background:'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',padding:'32px',borderRadius:'16px',marginBottom:'32px',boxShadow:'0 4px 16px rgba(0,51,102,0.2)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
              <Home size={32} style={{color:'#22D3EE'}} />
              <h1 style={{color:'#FFFFFF',fontSize:'32px',fontWeight:'700',margin:0}}>
                {property.propertyType || 'N.A'}
              </h1>
              <button
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#22D3EE',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.target.style.background = '#00A79D'}
                onMouseOut={e => e.target.style.background = '#22D3EE'}
                title="Copy page link"
              >
                <Share2 size={20} style={{marginRight: '6px'}} />
                Share
              </button>
            </div>
            <p style={{color:'#F4F7F9',fontSize:'18px',marginBottom:'24px'}}>
              📍 {property.address || 'N.A'}
            </p>
            <div style={{display:'flex',alignItems:'baseline',gap:'8px'}}>
              <span style={{fontSize:'48px',fontWeight:'800',color:'#22D3EE'}}>
                {property.monthlyRent ? `₹${property.monthlyRent.toLocaleString()}` : 'N.A'}
              </span>
              <span style={{fontSize:'24px',color:'#F4F7F9',fontWeight:'500'}}>/month</span>
            </div>
          </div>

          {/* Property Basics */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'24px',marginBottom:'32px'}}>
            <div style={{background:'#FFFFFF',padding:'24px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
                <Home size={24} style={{color:'#00A79D'}} />
                <h2 style={{fontSize:'20px',fontWeight:'600',color:'#003366',margin:0}}>Property Basics</h2>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                {renderField('Type', property.propertyType)}
                <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                    <Bed size={18} style={{color:'#00A79D'}} />
                    <span style={{color:'#333333',fontWeight:'600'}}>{property.bedrooms != null ? `${property.bedrooms} Beds` : 'N.A'}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                    <Bath size={18} style={{color:'#00A79D'}} />
                    <span style={{color:'#333333',fontWeight:'600'}}>{property.bathrooms != null ? `${property.bathrooms} Baths` : 'N.A'}</span>
                  </div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                  <Maximize size={18} style={{color:'#00A79D'}} />
                  <span style={{color:'#333333',fontWeight:'600'}}>{property.totalArea != null ? `${property.totalArea} sqft` : 'N.A'}</span>
                </div>
                </div>
                <div style={{paddingTop:'8px',borderTop:'1px solid #F4F7F9'}}>
                  <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Layout Features:</p>
                  <p style={{color:'#333333',margin:0,lineHeight:'1.8'}}>
                    {Array.isArray(property.layoutFeatures) ? property.layoutFeatures.join(', ') : property.layoutFeatures ? property.layoutFeatures : 'N.A'}
                  </p>
                </div>
                <div style={{paddingTop:'8px',borderTop:'1px solid #F4F7F9'}}>
                  <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Appliances Included:</p>
                  <p style={{color:'#333333',margin:0}}>{property.appliances && property.appliances.length > 0 ? property.appliances.join(', ') : 'N.A'}</p>
                </div>
                {renderField('Built', property.conditionAge ? `${property.conditionAge} years old` : 'N.A')}
                <div style={{paddingTop:'8px',borderTop:'1px solid #F4F7F9'}}>
                  <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Recent Renovations:</p>
                  <p style={{color:'#333333',margin:0}}>
                    {Array.isArray(property.renovations) ? property.renovations.join(', ') : property.renovations ? property.renovations : 'N.A'}
                  </p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'6px',paddingTop:'12px',borderTop:'1px solid #F4F7F9'}}>
                  <Car size={18} style={{color:'#00A79D'}} />
                  <span style={{color:'#333333',fontWeight:'600'}}>{property.parking || 'N.A'}</span>
                </div>
                <div style={{paddingTop:'8px',borderTop:'1px solid #F4F7F9'}}>
                  <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Outdoor Space:</p>
                  <p style={{color:'#333333',margin:0}}>{property.outdoorSpace || 'N.A'}</p>
                </div>
              </div>
            </div>

            {/* Financial & Lease */}
            <div style={{background:'#FFFFFF',padding:'24px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
                <DollarSign size={24} style={{color:'#00A79D'}} />
                <h2 style={{fontSize:'20px',fontWeight:'600',color:'#003366',margin:0}}>Financial & Lease</h2>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div style={{background:'linear-gradient(to right, #00A79D, #22D3EE)',padding:'16px',borderRadius:'8px'}}>
                  <p style={{color:'#FFFFFF',fontSize:'14px',margin:'0 0 4px 0',opacity:0.9}}>Monthly Rent</p>
                  <p style={{color:'#FFFFFF',fontSize:'28px',fontWeight:'700',margin:0}}>
                    {property.monthlyRent ? `$${property.monthlyRent.toLocaleString()}` : 'N.A'}
                  </p>
                </div>
                {renderField('Lease Term', property.leaseTerm)}
                {renderField('Security Deposit', property.securityDeposit)}
                <div style={{paddingBottom:'12px',borderBottom:'1px solid #F4F7F9'}}>
                  <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Other Fees:</p>
                  <p style={{color:'#333333',margin:0,lineHeight:'1.8'}}>
                    {Array.isArray(property.otherFees) ? property.otherFees.join(', ') : property.otherFees ? property.otherFees : 'N.A'}
                  </p>
                </div>
                <div style={{paddingBottom:'12px',borderBottom:'1px solid #F4F7F9'}}>
                  <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Utilities:</p>
                  <div style={{display:'flex',gap:'16px',marginBottom:'8px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <Droplet size={16} style={{color:'#22D3EE'}} />
                      <span style={{color:'#333333',fontSize:'14px'}}>
                        Water {property.utilities && property.utilities.water ? '✓' : '✗'}
                      </span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <Wind size={16} style={{color: property.utilities && property.utilities.gas ? '#22D3EE' : '#4A6A8A'}} />
                      <span style={{color:'#333333',fontSize:'14px'}}>
                        Gas {property.utilities && property.utilities.gas ? '✓' : '✗'}
                      </span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <Zap size={16} style={{color: property.utilities && property.utilities.electric ? '#22D3EE' : '#4A6A8A'}} />
                      <span style={{color:'#333333',fontSize:'14px'}}>
                        Electric {property.utilities && property.utilities.electric ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                  <p style={{color:'#333333',fontSize:'14px',margin:0}}>
                    <strong>Included:</strong> {property.utilities && property.utilities.included && property.utilities.included.length > 0 ? property.utilities.included.join(', ') : 'N.A'}<br />
                    <strong>Tenant Pays:</strong> {property.utilities && property.utilities.tenantPays && property.utilities.tenantPays.length > 0 ? property.utilities.tenantPays.join(', ') : 'N.A'}
                  </p>
                </div>
                <div style={{paddingBottom:'12px',borderBottom:'1px solid #F4F7F9'}}>
                  <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Tenant Requirements:</p>
                  <p style={{color:'#333333',margin:0,lineHeight:'1.8'}}>
                    {Array.isArray(property.tenantRequirements) ? (property.tenantRequirements.length > 0 ? property.tenantRequirements.join(', ') : 'N.A') : property.tenantRequirements ? property.tenantRequirements : 'N.A'}
                  </p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                  <Calendar size={18} style={{color:'#00A79D'}} />
                  <span style={{color:'#4A6A8A',fontWeight:'500'}}>Available:</span>
                  <span style={{color:'#333333',fontWeight:'600'}}>
                    {property.moveInDate ? new Date(property.moveInDate).toLocaleDateString() : 'N.A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Amenities */}
          <div style={{background:'#FFFFFF',padding:'24px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',marginBottom:'24px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
              <MapPin size={24} style={{color:'#00A79D'}} />
              <h2 style={{fontSize:'20px',fontWeight:'600',color:'#003366',margin:0}}>Location & Amenities</h2>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{paddingBottom:'12px',borderBottom:'1px solid #F4F7F9'}}>
                <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Neighborhood:</p>
                <p style={{color:'#333333',margin:0}}>{property.neighborhoodVibe || 'N.A'}</p>
              </div>
              <div style={{paddingBottom:'12px',borderBottom:'1px solid #F4F7F9'}}>
                <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Transportation:</p>
                <p style={{color:'#333333',margin:0,whiteSpace:'pre-line'}}>{property.transportation || 'N.A'}</p>
              </div>
              <div style={{paddingBottom:'12px',borderBottom:'1px solid #F4F7F9'}}>
                <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Local Amenities:</p>
                <p style={{color:'#333333',margin:0,lineHeight:'1.8'}}>
                  {Array.isArray(property.localAmenities) ? property.localAmenities.join(', ') : property.localAmenities ? property.localAmenities : 'N.A'}
                </p>
              </div>
              <div style={{paddingTop:'8px'}}>
                <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Community Features:</p>
                <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                  {(property.communityFeatures && property.communityFeatures.length > 0 ? property.communityFeatures : ['N.A']).map((f,i)=>(
                    <span key={i} style={{background:'#F4F7F9',color:'#003366',padding:'8px 16px',borderRadius:'20px',fontSize:'14px',fontWeight:'500'}}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Policies & Logistics */}
          <div style={{background:'#FFFFFF',padding:'24px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
              <Shield size={24} style={{color:'#00A79D'}} />
              <h2 style={{fontSize:'20px',fontWeight:'600',color:'#003366',margin:0}}>Policies & Logistics</h2>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'flex',alignItems:'start',gap:'10px',padding:'16px',background:'#F4F7F9',borderRadius:'8px',borderLeft:'4px solid #00A79D'}}>
                <PawPrint size={20} style={{color:'#00A79D',marginTop:'2px'}} />
                <div>
                  <p style={{color:'#003366',fontWeight:'600',margin:'0 0 6px 0'}}>Pet Policy</p>
                  <p style={{color:'#333333',margin:0,fontSize:'14px',lineHeight:'1.6'}}>
                    {property.petPolicy || 'N.A'}
                  </p>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'start',gap:'10px',padding:'16px',background:'#F4F7F9',borderRadius:'8px',borderLeft:'4px solid #4A6A8A'}}>
                <Cigarette size={20} style={{color:'#4A6A8A',marginTop:'2px'}} />
                <div>
                  <p style={{color:'#003366',fontWeight:'600',margin:'0 0 6px 0'}}>Smoking Policy</p>
                  <p style={{color:'#333333',margin:0,fontSize:'14px'}}>
                    {property.smokingPolicy || 'N.A'}
                  </p>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'start',gap:'10px',padding:'16px',background:'#F4F7F9',borderRadius:'8px',borderLeft:'4px solid #22D3EE'}}>
                <Wrench size={20} style={{color:'#22D3EE',marginTop:'2px'}} />
                <div>
                  <p style={{color:'#003366',fontWeight:'600',margin:'0 0 6px 0'}}>Maintenance Responsibilities</p>
                  <p style={{color:'#333333',margin:0,fontSize:'14px',lineHeight:'1.6'}}>
                    {property.maintenance || 'N.A'}
                  </p>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'start',gap:'10px',padding:'16px',background:'#F4F7F9',borderRadius:'8px',borderLeft:'4px solid #003366'}}>
                <AlertCircle size={20} style={{color:'#003366',marginTop:'2px'}} />
                <div>
                  <p style={{color:'#003366',fontWeight:'600',margin:'0 0 6px 0'}}>Renter's Insurance</p>
                  <p style={{color:'#333333',margin:0,fontSize:'14px'}}>
                    {property.insurance || 'N.A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Viewing Button */}
          <div style={{marginTop:'32px',padding:'24px',background:'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',borderRadius:'12px',textAlign:'center'}}>
            <p style={{color:'#FFFFFF',fontSize:'18px',fontWeight:'600',margin:'0 0 12px 0'}}>Interested in this property?</p>
            <button
              style={{background:'#FFFFFF',color:'#003366',border:'none',padding:'14px 32px',borderRadius:'8px',fontSize:'16px',fontWeight:'600',cursor:'pointer',boxShadow:'0 4px 12px rgba(0,0,0,0.15)',transition:'transform 0.2s'}}
              onMouseOver={e=>e.target.style.transform='translateY(-2px)'}
              onMouseOut={e=>e.target.style.transform='translateY(0)'}
              onClick={() => navigate(`/property-visit/${property._id}`)}
            >
              Schedule a Viewing
            </button>
          </div>
        </div>
    </div>
  );
}
