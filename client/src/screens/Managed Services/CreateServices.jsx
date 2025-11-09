import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Home, User, Phone, Calendar, FileText, Wrench } from 'lucide-react';
import TopNavigationBar from '../Dashboard/TopNavigationBar';
import { useNavigate } from 'react-router-dom';
const ServiceRequestApp = () => {
  const [userRole, setUserRole] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPropPicker, setShowPropPicker] = useState(false);
    const [propertySearch, setPropertySearch] = useState('');
  const [user, setUser] = useState(null);
  const isMobile = window.innerWidth <= 768;
    const navigate = useNavigate();

  const [formData, setFormData] = useState({
    propertyId: '',
    propertyType: '',
    address: '',
    serviceType: '',
    contactNumber: '',
    preferredDate: '',
    notes: '',
    status: 'pending'
  });
    const handleLogout = async () => {
    await fetch(process.env.REACT_APP_LOGOUT_API, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_USER_ME_API, {
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


  const serviceTypes = [
    { value: 'cleaning', label: '🧹 Cleaning' },
    { value: 'painting', label: '🎨 Painting' },
    { value: 'termite', label: '🐛 Termite Control' },
    { value: 'plumbing', label: '🚰 Plumbing' },
    { value: 'acService', label: '❄️ AC Service' },
    { value: 'carpenter', label: '🪚 Carpenter' },
    { value: 'electrical', label: '⚡ Electrical' },
    { value: 'moving', label: '📦 Moving' },
    { value: 'pestControl', label: '🦟 Pest Control' },
    { value: 'other', label: '🔧 Other' }
  ];

  const statusOptions = [
    { value: 'pending', label: '⏳ Pending', color: '#F59E0B' },
    { value: 'in-progress', label: '🔄 In Progress', color: '#00A79D' },
    { value: 'completed', label: '✅ Completed', color: '#10B981' }
  ];

  useEffect(() => {
    if (userRole === 'owner') {
      fetchProperties();
    }
  }, [userRole, currentPage]);
  

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${process.env.REACT_APP_Base_API}/api/properties/my?page=${currentPage}&limit=10`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to fetch properties');

      const data = await response.json();
      setProperties(data.properties);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (e) => {
    const selectedProperty = properties.find(p => p._id === e.target.value);
    if (selectedProperty) {
      setFormData({
        ...formData,
        propertyId: selectedProperty._id,
        propertyType: selectedProperty.propertyCategory === 'rental' ? 'RentalProperty' : 'SaleProperty',
        address: selectedProperty.address || selectedProperty.location || ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation before submit
    if (!userRole) {
      setError('Please select your role (Owner or Renter).');
      return;
    }
    if (!formData.serviceType) {
      setError('Please select a service type.');
      return;
    }
    if (!formData.contactNumber) {
      setError('Please enter a contact number.');
      return;
    }
    if (userRole === 'owner') {
      if (!formData.propertyId || !formData.propertyType) {
        setError('Please choose a property to continue.');
        return;
      }
    } else {
      if (!formData.address || !formData.address.trim()) {
        setError('Please enter your full address.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        userRole,
        serviceType: formData.serviceType,
        contactNumber: formData.contactNumber,
        preferredDate: formData.preferredDate,
        notes: formData.notes,
        status: formData.status
      };

      if (userRole === 'owner') {
        payload.propertyId = formData.propertyId;
        payload.propertyType = formData.propertyType;
      } else {
        payload.address = formData.address;
      }

      const response = await fetch(`${process.env.REACT_APP_Base_API}/api/createservices`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to submit service request');

      setSuccess('Service request submitted successfully! 🎉');
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setFormData({
        propertyId: '',
        propertyType: '',
        address: '',
        serviceType: '',
        contactNumber: '',
        preferredDate: '',
        notes: '',
        status: 'pending'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F4F7F9 0%, #FFFFFF 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      maxWidth: '800px',
      margin: '0 auto',
      background: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 51, 102, 0.1)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
      padding: '32px',
      color: '#FFFFFF',
        textAlign: 'center',
      marginTop: '80px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '16px',
      opacity: '0.9',
      margin: '0'
    },
    content: {
      padding: '32px'
    },
    roleSelector: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '32px'
    },
    roleButton: (isSelected) => ({
      padding: '24px',
      border: isSelected ? '3px solid #00A79D' : '2px solid #E5E7EB',
      borderRadius: '12px',
      background: isSelected ? 'rgba(0, 167, 157, 0.05)' : '#FFFFFF',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      fontWeight: '600',
      fontSize: '18px',
      color: isSelected ? '#003366' : '#4A6A8A',
      boxShadow: isSelected ? '0 4px 16px rgba(0, 167, 157, 0.2)' : 'none'
    }),
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#003366',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s ease',
      outline: 'none',
      background: '#FFFFFF',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      outline: 'none',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: '0 4px 16px rgba(0, 167, 157, 0.3)'
    },
    alert: (type) => ({
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: type === 'error' ? '#FEE2E2' : '#D1FAE5',
      color: type === 'error' ? '#991B1B' : '#065F46',
      border: `2px solid ${type === 'error' ? '#FCA5A5' : '#6EE7B7'}`
    }),
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '16px'
    },
    pageButton: (isActive) => ({
      padding: '8px 16px',
      border: isActive ? '2px solid #00A79D' : '2px solid #E5E7EB',
      borderRadius: '6px',
      background: isActive ? '#00A79D' : '#FFFFFF',
      color: isActive ? '#FFFFFF' : '#4A6A8A',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    }),
    statusBadge: (status) => {
      const statusConfig = statusOptions.find(s => s.value === status);
      return {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        background: statusConfig?.color || '#9CA3AF',
        color: '#FFFFFF'
      };
    }
  };

  if (!userRole) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>
              <Wrench size={40} />
              Service Request
            </h1>
            <p style={styles.subtitle}>Professional Property Services at Your Fingertips</p>
          </div>
          <div style={styles.content}>
            <h2 style={{ textAlign: 'center', color: '#003366', marginBottom: '24px' }}>
              Select Your Role
            </h2>
            <div style={styles.roleSelector}>
              <div
                style={styles.roleButton(false)}
                onClick={() => setUserRole('owner')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 51, 102, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Home size={48} style={{ color: '#00A79D', margin: '0 auto 12px' }} />
                <div>Property Owner</div>
                <div style={{ fontSize: '14px', fontWeight: '400', marginTop: '8px', color: '#6B7280' }}>
                  Request services for your properties
                </div>
              </div>
              <div
                style={styles.roleButton(false)}
                onClick={() => setUserRole('renter')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 51, 102, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <User size={48} style={{ color: '#22D3EE', margin: '0 auto 12px' }} />
                <div>Renter</div>
                <div style={{ fontSize: '14px', fontWeight: '400', marginTop: '8px', color: '#6B7280' }}>
                  Request services for your rental
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div style={styles.container}>
          {/* Top Navigation Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 999,
          backgroundColor: "#FFFFFF" // or match your navbar background
        }}
      >
        <TopNavigationBar
          user={user}
          handleLogout={handleLogout}
          navItems={navItems}
        />
      </div>

      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255,255,255,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '6px solid #E5E7EB',
            borderTopColor: '#00A79D',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Wrench size={40} />
            Service Request
          </h1>
          <p style={styles.subtitle}>
            {userRole === 'owner' ? '👨‍💼 Property Owner Portal' : '🏠 Renter Portal'}
          </p>
        </div>
        <form onSubmit={handleSubmit} style={styles.content}>
          <button
            onClick={() => setUserRole(null)}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '2px solid #4A6A8A',
              borderRadius: '6px',
              color: '#4A6A8A',
              cursor: 'pointer',
              marginBottom: '24px',
              fontWeight: '600'
            }}
          >
            ← Change Role
          </button>

          {error && (
            <div style={styles.alert('error')}>
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={styles.alert('success')}>
              <CheckCircle size={24} />
              <span>{success}</span>
            </div>
          )}

          <div>
            {userRole === 'owner' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Home size={18} />
                    Select Property
                  </label>

                  {/* Trigger to open property picker */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowPropPicker(true)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '2px solid #E5E7EB',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        fontWeight: 700,
                        color: '#003366'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00A79D'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                    >
                      {formData.propertyId ? 'Change Property' : 'Choose Property'}
                    </button>

                    {/* Selected summary chip */}
                    {formData.propertyId && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: '2px solid #E5E7EB',
                        background: '#F9FAFB',
                        maxWidth: '100%'
                      }}>
                        <img
                          src={(properties.find(p => p._id === formData.propertyId)?.images?.[0]) || '/default-property.jpg'}
                          alt="Selected property thumbnail"
                          style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flex: '0 0 auto', background: '#E5E7EB' }}
                          onError={(e) => { if (e.currentTarget.src.indexOf('/default-property.jpg') === -1) { e.currentTarget.src = '/default-property.jpg'; } }}
                        />
                        <div style={{ fontWeight: 700, color: '#003366', minWidth: 0 }}>
                          {properties.find(p => p._id === formData.propertyId)?.title || 'Unnamed Property'}
                        </div>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: formData.propertyType === 'RentalProperty' ? '#00A79D' : '#4A6A8A',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 700,
                          flex: '0 0 auto'
                        }}>
                          {formData.propertyType === 'RentalProperty' ? 'Rental' : 'Sale'}
                        </span>
                        <div style={{ color: '#4A6A8A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {formData.address || '—'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Property Picker Modal */}
                  {showPropPicker && (
                    <div
                      onClick={() => setShowPropPicker(false)}
                      style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(2px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1300
                      }}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '92%',
                          maxWidth: '900px',
                          maxHeight: '82vh',
                          overflow: 'auto',
                          background: '#FFFFFF',
                          borderRadius: '16px',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                          padding: '20px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h3 style={{ margin: 0, color: '#003366' }}>Pick a Property</h3>
                          <button
                            onClick={() => setShowPropPicker(false)}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700, color: '#4A6A8A' }}
                          >
                            ✕
                          </button>
                        </div>

                        {/* Search & page controls */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                          <input
                            type="text"
                            placeholder="Search by title or address..."
                            value={propertySearch}
                            onChange={(e) => setPropertySearch(e.target.value)}
                            style={{ flex: '1 1 280px', padding: '10px 12px', borderRadius: '10px', border: '2px solid #E5E7EB' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#00A79D'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              style={styles.pageButton(false)}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                            >
                              Prev
                            </button>
                            <span style={{ padding: '8px 12px', color: '#4A6A8A', fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
                            <button
                              type="button"
                              style={styles.pageButton(false)}
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </div>
                        </div>

                        {/* Cards grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                          gap: '12px'
                        }}>
                          {(properties || [])
                            .filter(p => {
                              const q = propertySearch.trim().toLowerCase();
                              if (!q) return true;
                              const title = (p.title || p.propertyName || '').toLowerCase();
                              const addr = (p.address || p.location || p.Sector || '').toLowerCase();
                              return title.includes(q) || addr.includes(q);
                            })
                            .map((p) => (
                              <button
                                key={p._id}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    propertyId: p._id,
                                    propertyType: p.propertyCategory === 'rental' ? 'RentalProperty' : 'SaleProperty',
                                    address: p.address || p.location || p.Sector || ''
                                  });
                                  setShowPropPicker(false);
                                }}
                                style={{
                                  textAlign: 'left',
                                  padding: '14px',
                                  borderRadius: '12px',
                                  border: '2px solid #E5E7EB',
                                  background: '#FFFFFF',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00A79D'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                              >
                                <img
                                  src={p.images?.[0] || '/default-property.jpg'}
                                  alt={p.title || p.propertyName || 'Property image'}
                                  style={{
                                    width: '100%',
                                    height: 140,
                                    objectFit: 'cover',
                                    borderRadius: 10,
                                    marginBottom: 10,
                                    background: '#F3F4F6'
                                  }}
                                  onError={(e) => {
                                    if (e.currentTarget.src.indexOf('/default-property.jpg') === -1) {
                                      e.currentTarget.src = '/default-property.jpg';
                                    }
                                  }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <div style={{ fontWeight: 800, color: '#003366' }}>
                                    {p.title || p.propertyName || 'Unnamed Property'}
                                  </div>
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: p.propertyCategory === 'rental' ? '#00A79D' : '#4A6A8A',
                                    color: '#FFFFFF',
                                    fontSize: '12px',
                                    fontWeight: 800
                                  }}>
                                    {p.propertyCategory === 'rental' ? 'Rental' : 'Sale'}
                                  </span>
                                </div>
                                <div style={{ color: '#4A6A8A', fontSize: '14px' }}>
                                  {(p.address || p.location || p.Sector || 'Address not specified')}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px', color: '#6B7280', fontSize: '12px' }}>
                                  {typeof p.bedrooms !== 'undefined' && <span>{p.bedrooms} BR</span>}
                                  {typeof p.bathrooms !== 'undefined' && <span>{p.bathrooms} BA</span>}
                                  {p.totalArea?.sqft && <span>{p.totalArea.sqft} sqft</span>}
                                </div>
                              </button>
                            ))}
                        </div>

                        {properties.length === 0 && (
                          <div style={{ padding: '16px', color: '#6B7280' }}>No properties found on this page.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Home size={18} />
                    Property Address
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    value={formData.address}
                    readOnly
                    placeholder="Address will be auto-filled"
                  />
                </div>
              </>
            )}

            {userRole === 'renter' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Home size={18} />
                  Full Address *
                </label>
                <input
                  style={styles.input}
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange({ target: { name: 'address', value: e.target.value } })}
                  placeholder="Enter your complete address"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#00A79D'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Wrench size={18} />
                Service Type *
              </label>
              <select
                style={styles.select}
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                required
                onFocus={(e) => e.target.style.borderColor = '#00A79D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              >
                <option value="">-- Select a service --</option>
                {serviceTypes.map(service => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Phone size={18} />
                Contact Number *
              </label>
              <input
                style={styles.input}
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                required
                onFocus={(e) => e.target.style.borderColor = '#00A79D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Calendar size={18} />
                Preferred Date
              </label>
              <input
                style={styles.input}
                type="datetime-local"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                onFocus={(e) => e.target.style.borderColor = '#00A79D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {(formData.serviceType === 'other' || formData.notes) && (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FileText size={18} />
                  {formData.serviceType === 'other' ? 'Service Details * (Required for Other)' : 'Additional Notes'}
                </label>
                <textarea
                  style={styles.textarea}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Describe the service you need or add any special instructions..."
                  required={formData.serviceType === 'other'}
                  onFocus={(e) => e.target.style.borderColor = '#00A79D'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Clock size={18} />
                Request Status
              </label>
              <select
                style={styles.select}
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                onFocus={(e) => e.target.style.borderColor = '#00A79D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: '8px' }}>
                <span style={styles.statusBadge(formData.status)}>
                  Current Status: {statusOptions.find(s => s.value === formData.status)?.label}
                </span>
              </div>
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 167, 157, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 167, 157, 0.3)';
              }}
            >
              {loading ? '⏳ Submitting...' : '✨ Submit Service Request'}
            </button>
          </div>
        </form>
      </div>
       {/* Footer */}
      <footer
        style={{
          background: "linear-gradient(135deg, #003366 0%, #004b6b 100%)",
          color: "#FFFFFF",
          padding: isMobile ? "1.2rem 0.4rem" : "3rem 1.5rem",
          textAlign: "center",
          marginTop: isMobile ? "1.2rem" : "3rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3
            style={{
              fontWeight: "800",
              fontSize: isMobile ? "1.1rem" : "1.6rem",
              marginBottom: isMobile ? "0.2rem" : "0.5rem",
            }}
          >
            ggnHome – Find Your Dream Home
          </h3>
          <p
            style={{
              fontSize: isMobile ? "0.8rem" : "0.9rem",
              color: "#D1E7FF",
              marginBottom: isMobile ? "0.8rem" : "1.5rem",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            Explore thousands of verified listings, connect directly with owners, and make your next move with confidence.
          </p>
          <div
            className="dashboard-footer-links"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: isMobile ? "10px" : "2rem",
              flexWrap: "wrap",
              marginBottom: isMobile ? "1rem" : "2rem",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
            }}
          >
            <a href="/" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: isMobile ? "0.95rem" : "0.9rem" }}>Home</a>
            <a href="/about" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: isMobile ? "0.95rem" : "0.9rem" }}>About</a>
            <a href="/support" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: isMobile ? "0.95rem" : "0.9rem" }}>Contact</a>
            <a 
              href={user ? "/add-property" : "/login"}
              style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: isMobile ? "0.95rem" : "0.9rem" }}
            >
              Post Property
            </a>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.15)",
              paddingTop: isMobile ? "0.7rem" : "1rem",
              fontSize: isMobile ? "0.7rem" : "0.8rem",
              color: "#B0C4DE",
            }}
          >
            © {new Date().getFullYear()} ggnHome. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceRequestApp;