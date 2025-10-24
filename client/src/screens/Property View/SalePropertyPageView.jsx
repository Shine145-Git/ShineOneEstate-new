import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Bed, Bath, Maximize, DollarSign, MapPin, Share2 } from 'lucide-react';
import TopNavigationBar from '../Dashboard/TopNavigationBar';
export default function SalePropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await fetch(`${process.env.REACT_APP_SALE_PROPERTY_API}/${id}`, {
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

  if (loading) return <div style={{padding:'20px'}}>Loading property...</div>;
  if (!property) return <div style={{padding:'20px'}}>Property not found.</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7F9', fontFamily:'system-ui,-apple-system,sans-serif' }}>
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
              {property.title || 'N.A'}
            </h1>
            <button onClick={handleShare} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'6px',background:'#22D3EE',color:'#fff',border:'none',padding:'8px 16px',borderRadius:'8px',fontWeight:600,fontSize:'16px',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.10)',transition:'background 0.2s'}} onMouseOver={e=>e.target.style.background='#00A79D'} onMouseOut={e=>e.target.style.background='#22D3EE'} title="Copy page link">
              <Share2 size={20} style={{marginRight:'6px'}} /> Share
            </button>
          </div>
          <p style={{color:'#F4F7F9',fontSize:'18px',marginBottom:'24px'}}>📍 {property.location || 'N.A'}</p>
          <div style={{display:'flex',alignItems:'baseline',gap:'8px'}}>
            <span style={{fontSize:'48px',fontWeight:'800',color:'#22D3EE'}}>
              {property.price ? `₹${property.price.toLocaleString()}` : 'N.A'}
            </span>
            <span style={{fontSize:'24px',color:'#F4F7F9',fontWeight:'500'}}></span>
          </div>
        </div>

        {/* Property Details */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'24px',marginBottom:'32px'}}>
          <div style={{background:'#FFFFFF',padding:'24px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
              <Home size={24} style={{color:'#00A79D'}} />
              <h2 style={{fontSize:'20px',fontWeight:'600',color:'#003366',margin:0}}>Property Details</h2>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
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
                  <span style={{color:'#333333',fontWeight:'600'}}>{property.area != null ? `${property.area} sqft` : 'N.A'}</span>
                </div>
              </div>
              <div style={{paddingTop:'8px',borderTop:'1px solid #F4F7F9'}}>
                <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Description:</p>
                <p style={{color:'#333333',margin:0,lineHeight:'1.8'}}>{property.description || 'N.A'}</p>
              </div>
              <div style={{paddingTop:'8px',borderTop:'1px solid #F4F7F9'}}>
                {/* <p style={{color:'#4A6A8A',fontWeight:'500',marginBottom:'8px'}}>Owner ID:</p> */}
                {/* <p style={{color:'#333333',margin:0,lineHeight:'1.8'}}>{property.ownerId?._id || 'N.A'}</p> */}
              </div>
            </div>
          </div>
              </div>
              <div style={{marginTop:'16px'}}>
  <button
    onClick={() => navigate(`/property-visit/${property._id}`)}
    style={{
      backgroundColor: '#00A79D',
      color: '#fff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: 600,
      fontSize: '16px',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      transition: 'background 0.2s',
    }}
    onMouseOver={e => e.currentTarget.style.background = '#00887a'}
    onMouseOut={e => e.currentTarget.style.background = '#00A79D'}
  >
    Schedule a Visit
  </button>
</div>
      </div>
    </div>
  );
}
