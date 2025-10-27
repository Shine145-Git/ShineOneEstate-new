import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, MapPin, DollarSign } from 'lucide-react';
import TopNavigationBar from '../Dashboard/TopNavigationBar';
import { useNavigate } from 'react-router-dom';

export default function PropertyCards() {
  const [payments, setPayments] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user properties endpoint configurable via .env
    axios.get(`${process.env.REACT_APP_USER_PROPERTIES_API}`, { withCredentials: true })
      .then(response => {
        setPayments(response.data);
      })
      .catch(error => {
        console.error('Error fetching payments:', error);
      });
  }, []);

  const handleLogout = async () => {
    // Logout endpoint configurable via .env
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
        // User info endpoint configurable via .env
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

  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    };

    switch(status) {
      case 'approved':
        return { ...baseStyle, backgroundColor: '#00A79D', color: '#FFFFFF' };
      case 'pending':
        return { ...baseStyle, backgroundColor: '#4A6A8A', color: '#FFFFFF' };
      case 'rejected':
        return { ...baseStyle, backgroundColor: '#333333', color: '#FFFFFF' };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F4F7F9'
    }}>
      {/* Header */}
      <TopNavigationBar navItems={navItems} user={user} handleLogout={handleLogout} />

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#003366',
          marginBottom: '30px'
        }}>
          Property Listings
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {payments.map((property) => (
            <div
              key={property._id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0, 51, 102, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={async () => {
                try {
                  const res = await axios.get(`${process.env.REACT_APP_RENTAL_PROPERTY_DETAIL_API}/${property._id}`, { withCredentials: true });
                  if (res.status === 200) {
                    navigate(`/Rentaldetails/${property._id}`);
                  } else {
                    navigate(`/Saledetails/${property._id}`);
                  }
                } catch (err) {
                  // If rental property not found, go to sale property
                  navigate(`/Saledetails/${property._id}`);
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 51, 102, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 51, 102, 0.1)';
              }}
            >
              <img
                src={property.images && property.images.length > 0 ? property.images[0] : '/default-property.jpg'}
                alt={property.name || 'Property Image'}
                onError={(e) => { e.target.src = '/default-property.jpg'; }}
                style={{
                  width: '100%',
                  height: '160px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  marginBottom: '16px'
                }}
              />
              {property.status === 'approved' && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: '#22D3EE',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(34, 211, 238, 0.3)'
                }}>
                  <Award size={20} color="#FFFFFF" />
                </div>
              )}
              
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#003366',
                marginBottom: '16px',
                paddingRight: property.status === 'approved' ? '40px' : '0'
              }}>
                {property.name}
              </h2>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                color: '#4A6A8A'
              }}>
               
                <span style={{ fontSize: '18px', fontWeight: '600' }}>
                  {property.monthlyRent ? `₹${property.monthlyRent}` : 'N/A'}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                color: '#4A6A8A'
              }}>
                <MapPin size={18} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '14px' }}>
                  {property.address || 'N/A'}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <span style={getStatusStyle(property.status)}>
                  {property.status}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent triggering the card click
                  navigate(`/property-analytics/${property._id}`, { state: { propertyId: property._id } });
                }}
                style={{
                  marginTop: '16px',
                  backgroundColor: '#003366',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#22D3EE'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#003366'}
              >
                View Analytics
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}