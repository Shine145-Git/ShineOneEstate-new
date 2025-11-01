import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, MapPin, Edit2, Trash2, Home, TrendingUp, Users, Star, ArrowRight, Plus, X, Search, Filter, Eye, Calendar, PhoneCall, MessageSquare, BarChart3, Grid, List, ChevronDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../Dashboard/TopNavigationBar';
import EditPropertyModal from './editpropertymodal';

export default function PropertyCards() {
  const [properties, setProperties] = useState([]);
  const [user, setUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, propertyId: null });
  const [editModal, setEditModal] = useState({ show: false, propertyId: null, propertyType: null });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest First');
  const [userMetrics, setUserMetrics] = useState(null);
  // Performance metrics state
  const [metrics, setMetrics] = useState(null);
  // New state to hold edit form data
  const [editFormData, setEditFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
    fetchUser();
    // Fetch performance metrics
const fetchUserMetrics = async () => {
  try {
    const token = localStorage.getItem("token");
    const baseURL = process.env.REACT_APP_Base_API;

    const response = await axios.get(`${baseURL}/api/property-analytics/user-metrics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    setUserMetrics(response.data);
  } catch (error) {
    if (error.response) {
      console.error("❌ User metrics error response:", error.response.data);
      if (error.response.status === 401) {
        console.warn("🚫 Unauthorized — user token invalid or expired");
      }
    } else {
      console.error("💥 Error fetching user metrics:", error.message);
    }
  }
};
fetchUserMetrics();
  }, []);

  const handleLogout = async () => { await fetch(process.env.REACT_APP_LOGOUT_API, { method: "POST", credentials: "include" }); setUser(null); navigate("/login"); };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_USER_PROPERTIES_API}`, { credentials: 'include' });
      const data = await response.json();
      let props = Array.isArray(data) ? data : data.properties || [];
      // For each property, fetch metrics and merge
      const metricsPromises = props.map(async (property) => {
        try {
       const metricsRes = await axios.get(
  `${process.env.REACT_APP_PROPERTY_ANALYSIS_GET_METRICS}/${property._id}`,
  { withCredentials: true }
);
const metrics = metricsRes.data || {};
return {
  ...property,
  totalViews: Array.isArray(metrics.views) ? metrics.views.length : 0,
  totalRatings: Array.isArray(metrics.ratings) ? metrics.ratings.length : 0,
};
        } catch (err) {
          // If metrics can't be fetched, default to 0
          return {
            ...property,
            totalViews: 0,
            totalRatings: 0,
          };
        }
      });
      props = await Promise.all(metricsPromises);
      // Add defaultPropertyType to each property
      props = props.map(p => ({
        ...p,
        defaultPropertyType: p.monthlyRent ? 'rental' : 'sale'
      }));
      setProperties(props);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_USER_ME_API}`, { method: "GET", credentials: "include" });
      const data = await res.json();
      if (res.ok) setUser(data);
    } catch (err) { console.error("Error:", err); }
  };

  const handleDelete = async (propertyId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_Base_API}/api/user/delete-property/${propertyId}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) { setProperties(properties.filter(p => p._id !== propertyId)); setDeleteModal({ show: false, propertyId: null }); }
    } catch (error) { console.error('Error:', error); }
  };

  const handleEdit = (propertyId) => {
    const property = properties.find(p => p._id === propertyId);
    const isRental = !!property?.monthlyRent; // determine type
    setEditModal({
      show: true,
      propertyId,
      propertyType: isRental ? 'rental' : 'sale'
    });
  };

  const navItems = ["For Buyers", "For Tenants", "For Owners", "For Dealers / Builders", "Insights"];

  const filteredProperties = properties.filter(p => {
    let statusMatch = true;
    if (filterStatus === 'active') statusMatch = p.isActive === true;
    else if (filterStatus === 'deleted') statusMatch = p.isActive === false;

    const matchesSearch =
      searchQuery === '' ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      propertyTypeFilter === 'all' ||
      (propertyTypeFilter === 'rental' && p.defaultPropertyType === 'rental') ||
      (propertyTypeFilter === 'sale' && p.defaultPropertyType === 'sale');

    return statusMatch && matchesSearch && matchesType;
  });

  // Sorting logic based on sortOption
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortOption === 'Newest First') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (sortOption === 'Oldest First') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    if (sortOption === 'Price: Low to High') {
      const aPrice = a.price ?? a.monthlyRent ?? 0;
      const bPrice = b.price ?? b.monthlyRent ?? 0;
      return aPrice - bPrice;
    }
    if (sortOption === 'Price: High to Low') {
      const aPrice = a.price ?? a.monthlyRent ?? 0;
      const bPrice = b.price ?? b.monthlyRent ?? 0;
      return bPrice - aPrice;
    }
    if (sortOption === 'Rental First') {
      return a.defaultPropertyType === 'rental' && b.defaultPropertyType === 'sale' ? -1 :
             a.defaultPropertyType === 'sale' && b.defaultPropertyType === 'rental' ? 1 : 0;
    }
    if (sortOption === 'Sale First') {
      return a.defaultPropertyType === 'sale' && b.defaultPropertyType === 'rental' ? -1 :
             a.defaultPropertyType === 'rental' && b.defaultPropertyType === 'sale' ? 1 : 0;
    }
    return 0;
  });

  // Handle property update (edit)
  const handleUpdateProperty = async (updatedData) => {
    try {
      const baseURL = process.env.REACT_APP_Base_API;
      const endpoint = updatedData.purpose === 'Rent'
        ? `${baseURL}/api/rental-properties/${updatedData._id}`
        : `${baseURL}/api/sale-properties/${updatedData._id}`;

      const res = await axios.put(endpoint, updatedData, { withCredentials: true });

      if (res.status === 200) {
        setProperties(prev =>
          prev.map(p => (p._id === updatedData._id ? { ...p, ...updatedData } : p))
        );
        setEditModal({ show: false, propertyId: null, propertyType: null });
      }
    } catch (err) {
      console.error('❌ Error updating property:', err);
      alert('Failed to update property.');
    }
  };


  return (
    <div style={{ backgroundColor: '#F1F5F9', minHeight: '100vh' }}>
      <TopNavigationBar user={user} navItems={navItems} onLogout={handleLogout} />

      {/* Responsive Header and Filters */}
      <div className="properties-header-bar" style={{ backgroundColor: '#FFF', borderBottom: '1px solid #E2E8F0', padding: '20px 0' }}>
        <div className="properties-header-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div className="properties-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>My Properties</h1>
              <p style={{ color: '#64748B', fontSize: '14px' }}>Last visited: {new Date().toLocaleString()}</p>
            </div>
            <button onClick={() => navigate('/add-property')} className="properties-header-post-btn" style={{ backgroundColor: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '8px', padding: '12px 24px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}>
              <Plus size={18} />POST A PROPERTY
            </button>
          </div>

          <div className="properties-header-filters" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          

           

            <div className="properties-header-search" style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search by locality, project, or landmark..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
            </div>

            <div className="properties-header-viewmode" style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '8px', backgroundColor: viewMode === 'grid' ? '#DBEAFE' : '#FFF', border: `1px solid ${viewMode === 'grid' ? '#3B82F6' : '#E2E8F0'}`, borderRadius: '6px', cursor: 'pointer' }}>
                <Grid size={18} color={viewMode === 'grid' ? '#1E40AF' : '#64748B'} />
              </button>
              <button onClick={() => setViewMode('list')} style={{ padding: '8px', backgroundColor: viewMode === 'list' ? '#DBEAFE' : '#FFF', border: `1px solid ${viewMode === 'list' ? '#3B82F6' : '#E2E8F0'}`, borderRadius: '6px', cursor: 'pointer' }}>
                <List size={18} color={viewMode === 'list' ? '#1E40AF' : '#64748B'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="properties-main-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Unified Options Dropdown */}
        <div className="properties-main-filters-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '16px 20px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Showing:</span>
            <span style={{ fontSize: '14px', color: '#64748B' }}>ALL</span>
            <button style={{ backgroundColor: '#F1F5F9', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', color: '#3B82F6', fontWeight: '600' }}>Clear All Filters</button>
          </div>
          {/* Unified Dropdown for sort/filter */}
          <OptionsDropdown
            sortOption={sortOption}
            setSortOption={setSortOption}
            propertyTypeFilter={propertyTypeFilter}
            setPropertyTypeFilter={setPropertyTypeFilter}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </div>

        <div style={{ marginBottom: '16px', padding: '12px 20px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} color="#D97706" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#92400E', fontSize: '13px' }}>NEW: </strong>
            <span style={{ color: '#78350F', fontSize: '13px' }}>Self Verify by uploading photos with location data - Now verify without being at the property</span>
          </div>
          <button style={{ backgroundColor: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Learn more</button>
        </div>

        {/* Two-column layout: left = property list, right = banners/metrics/support */}
        <div className="properties-flex-two-col" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', marginTop: '0' }}>
          {/* Left column: property cards list */}
          <div className="properties-col-left" style={{ flex: '0 1 70%', maxWidth: '70%' }}>
            <div className="properties-main-card-list-container" style={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', marginBottom: '24px' }}>
              <div className="properties-main-card-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>{sortedProperties.length} ALL Products</h3>
                <div className="properties-main-card-list-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', cursor: 'pointer' }}>
                    <input type="checkbox" />Select All
                  </label>
                  <button style={{ backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Recall</button>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTop: '3px solid #3B82F6', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
                  <p>Loading properties...</p>
                </div>
              ) : sortedProperties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #E2E8F0', borderRadius: '12px' }}>
                  <Home size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ color: '#475569', fontSize: '18px', marginBottom: '8px' }}>No properties found</h3>
                  <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '20px' }}>Start by posting your first property</p>
                  <button onClick={() => navigate('/add-property')} style={{ backgroundColor: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />Post Property
                  </button>
                </div>
              ) : (
                <div className="properties-main-card-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sortedProperties.map((p, idx) => (
                    <div key={p._id} className="property-card" style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px', transition: 'all 0.2s', cursor: 'pointer', backgroundColor: '#FFF' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#CBD5E1'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
                      <div className="property-card-content" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start' }}>
                          <input type="checkbox" style={{ marginTop: '4px', cursor: 'pointer' }} />
                        </label>

                        <div style={{ flexShrink: 0, position: 'relative' }}>
                          <img src={p.images?.[0] || '/default-property.jpg'} alt={p.name} style={{ width: '200px', height: '140px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/default-property.jpg'; }} />
                          {p.isPremium && (
                            <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#F59E0B', color: '#FFF', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>Plain</div>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>{p.name || p.title || 'Property'}</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <MapPin size={14} color="#64748B" />
                                <span style={{ fontSize: '13px', color: '#64748B' }}>{p.address || p.location || 'Location not specified'}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                                {p.bedrooms && <span>🛏️ {p.bedrooms} BHK</span>}
                                {(p.area || p.totalArea?.sqft) && <span>📐 {p.area || p.totalArea?.sqft} sq.ft</span>}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                                ₹{(p.price || p.monthlyRent || 0).toLocaleString()}
                                {p.defaultPropertyType === 'rental' && (
                                  <span style={{ fontSize: '13px', fontWeight: '400', color: '#64748B' }}>/month</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '8px 0', borderTop: '1px solid #F1F5F9' }}>
                            <span style={{ fontSize: '12px', color: '#64748B' }}>MS{(Math.random() * 10000000).toFixed(0)}:</span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#EF4444' }}>Deleted</span>
                            <span style={{ fontSize: '12px', color: '#64748B' }}>| Posted On: {new Date(p.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>

                          {(() => {
                            // Dynamically calculate completion percentage based on key fields
                            const totalFields = 8;
                            const filledFields = [
                              p.title,
                              p.description,
                              p.price || p.monthlyRent,
                              p.bedrooms,
                              p.bathrooms,
                              p.address || p.location,
                              p.area || p.totalArea?.sqft,
                              (Array.isArray(p.images) ? p.images.length : 0)
                            ].filter(val => {
                              // For images, count as filled if length > 0
                              if (typeof val === 'number') return val > 0;
                              return !!val;
                            }).length;
                            const completionPercentage = Math.round((filledFields / totalFields) * 100);
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', marginBottom: '12px' }}>
                                <CheckCircle size={16} color="#10B981" />
                                <span style={{ fontSize: '12px', color: '#475569' }}>{completionPercentage}% Complete</span>
                                <div style={{ flex: 1, height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', marginLeft: '8px' }}>
                                  <div style={{ width: `${completionPercentage}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '2px' }}></div>
                                </div>
                              </div>
                            );
                          })()}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(p._id); }} style={{ backgroundColor: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}>
                              <Edit2 size={14} />Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModal({ show: true, propertyId: p._id });
                              }}
                              style={{
                                backgroundColor: p.isActive ? '#FEE2E2' : '#DCFCE7',
                                color: p.isActive ? '#DC2626' : '#166534',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) =>
                                e.currentTarget.style.backgroundColor = p.isActive ? '#FECACA' : '#BBF7D0'
                              }
                              onMouseLeave={(e) =>
                                e.currentTarget.style.backgroundColor = p.isActive ? '#FEE2E2' : '#DCFCE7'
                              }
                            >
                              {p.isActive ? (
                                <>
                                  <Trash2 size={14} /> Delete
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={14} /> Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const metricsRes = await axios.get(`${process.env.REACT_APP_PROPERTY_ANALYSIS_GET_METRICS}/${p._id}`, { withCredentials: true });
                                  navigate(`/property-analytics/${p._id}`, { state: { metrics: metricsRes.data } });
                                } catch (err) {
                                  console.error('Error loading metrics:', err);
                                  navigate(`/property-analytics/${p._id}`);
                                }
                              }}
                              style={{ backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                            >
                              <BarChart3 size={14} />Analytics
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/property-visit/${p._id}`); }} style={{ backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}>
                              <Eye size={14} />View Details
                            </button>
                          </div>

                          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748B' }}>
                            <span>Total Views: {p.totalViews ?? 0}</span>
                            <span>Ratings: {p.totalRatings ?? 0}</span>
                            <button style={{ marginLeft: 'auto', backgroundColor: '#DBEAFE', color: '#1E40AF', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Get Leads</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Right column: banner/metrics/support cards */}
          <div className="properties-col-right" style={{ flex: '0 1 30%', maxWidth: '30%' }}>
            <div className="properties-bottom-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: 0 }}>
              <div style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', borderRadius: '12px', padding: '24px', color: '#FFF' }}>
                <Home size={32} style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>List More Properties</h3>
                <p style={{ fontSize: '13px', marginBottom: '16px', opacity: 0.95 }}>Reach thousands of verified buyers & tenants</p>
                <button onClick={() => navigate('/add-property')} style={{ backgroundColor: '#FFF', color: '#667EEA', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <Plus size={18} />Post Property
                </button>
              </div>
              {/* Performance Stats Section */}
              <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0' }}>
                <TrendingUp size={28} color="#10B981" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>
                  Performance Stats
                </h3>
                {!userMetrics ? (
                  <p>Loading performance metrics...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>Total Properties</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                        {userMetrics.totalProperties || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>Total Views</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                        {userMetrics.totalViews || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>Total Saves</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                        {userMetrics.totalSaves || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>Total Ratings</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                        {userMetrics.totalRatings || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>Average Rating</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                        {userMetrics.avgRating || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>Avg. Engagement (s)</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                        {userMetrics.avgEngagement || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#0F172A', borderRadius: '12px', padding: '24px', color: '#FFF' }}>
                <Star size={28} color="#FCD34D" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Upgrade to Premium</h3>
                <p style={{ fontSize: '13px', marginBottom: '16px', color: '#CBD5E1' }}>Get featured listings, priority support & advanced analytics</p>
                <button style={{ backgroundColor: '#FCD34D', color: '#0F172A', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  Upgrade Now<ArrowRight size={16} />
                </button>
              </div>

              <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '24px', border: '1px solid #E2E8F0' }}>
                <Users size={28} color="#3B82F6" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Need Assistance?</h3>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>Our support team is available 24/7</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => navigate('/support')} style={{ backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}>
                    <MessageSquare size={16} />Contact Support
                  </button>
                  <button onClick={() => navigate('/chatbot')} style={{ backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}>
                    <PhoneCall size={16} />Live Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
       <footer style={{
        background: "linear-gradient(135deg, #003366 0%, #004b6b 100%)",
        color: "#FFFFFF",
        padding: "3rem 1.5rem",
        textAlign: "center",
        marginTop: "3rem"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3 style={{ fontWeight: "800", fontSize: "1.6rem", marginBottom: "0.5rem" }}>
            ggnRentalDeals – Find Your Dream Home
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#D1E7FF", marginBottom: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
            Explore thousands of verified listings, connect directly with owners, and make your next move with confidence.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <a href="/" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>Home</a>
            <a href="/about" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>About</a>
            <a href="/support" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>Contact</a>
            <a href="/add-property" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>Post Property</a>
          </div>
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: "1rem",
            fontSize: "0.8rem",
            color: "#B0C4DE"
          }}>
            © {new Date().getFullYear()} ggnRentalDeals. All rights reserved.
          </div>
        </div>
      </footer>

      {deleteModal.show && (() => {
        // Find the property to get its isActive status
        const property = properties.find(p => p._id === deleteModal.propertyId);
        const isActive = property?.isActive;
        // Modal config based on property status
        const modalConfig = isActive
          ? {
              bgColor: '#FEE2E2',
              icon: <Trash2 size={32} color="#DC2626" />,
              title: 'Delete Property?',
              message: 'Are you sure you want to delete this property? This action cannot be undone and all associated data will be permanently removed.',
              buttonText: 'Delete Property',
              buttonColor: '#DC2626',
              buttonHover: '#B91C1C',
            }
          : {
              bgColor: '#DCFCE7',
              icon: <CheckCircle size={32} color="#16A34A" />,
              title: 'Activate Property?',
              message: 'Are you sure you want to activate this property? It will be visible to users again.',
              buttonText: 'Activate Property',
              buttonColor: '#16A34A',
              buttonHover: '#166534',
            };
        return (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '32px', maxWidth: '440px', width: '90%', boxShadow: '0 25px 80px rgba(0,0,0,0.3)' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: modalConfig.bgColor, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                {modalConfig.icon}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', textAlign: 'center' }}>{modalConfig.title}</h3>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '28px', textAlign: 'center', lineHeight: '1.6' }}>{modalConfig.message}</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setDeleteModal({ show: false, propertyId: null })}
                  style={{
                    flex: 1,
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E2E8F0'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.propertyId)}
                  style={{
                    flex: 1,
                    backgroundColor: modalConfig.buttonColor,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = modalConfig.buttonHover}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = modalConfig.buttonColor}
                >
                  {modalConfig.buttonText}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {editModal.show && (
        <EditPropertyModal
          propertyId={editModal.propertyId}
          propertyType={editModal.propertyType}
          isOpen={editModal.show}
          onClose={() => setEditModal({ show: false, propertyId: null, propertyType: null })}
          onSuccess={fetchProperties}
        />
      )}
 <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive Design for Properties User Page */
        @media (max-width: 768px) {
          .properties-header-container {
            padding: 0 8px !important;
          }
          .properties-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .properties-header-post-btn {
            width: 100%;
            justify-content: center;
            margin-top: 8px;
            padding: 12px 0 !important;
            font-size: 15px !important;
          }
          .properties-header-filters {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .properties-header-status {
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .properties-header-status-btn {
            width: 100%;
            min-width: 110px;
            font-size: 12px !important;
          }
          .properties-header-search {
            max-width: 100% !important;
            width: 100%;
            margin-top: 6px;
          }
          .properties-header-viewmode {
            margin-left: 0 !important;
            margin-top: 8px;
            gap: 4px !important;
          }

          .properties-main-container {
            padding: 12px !important;
          }
          .properties-main-filters-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 12px 8px !important;
          }
          .properties-main-card-list-container {
            padding: 12px 8px !important;
          }
          .properties-main-card-list-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          .properties-main-card-list-header-actions {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .properties-main-card-list {
            gap: 12px !important;
          }
          .property-card {
            padding: 12px 6px !important;
          }
          .property-card-content {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .property-card-content img {
            width: 100% !important;
            max-width: 100% !important;
            height: 180px !important;
            object-fit: cover;
          }
          .property-card-content > div {
            width: 100% !important;
          }
          /* Make property card buttons full width and stack */
          .property-card button {
            width: 100%;
            min-width: 0 !important;
            margin-bottom: 6px;
            justify-content: center;
          }
        /* Two-column layout responsive: stack columns vertically on small screens */
        .properties-flex-two-col {
          display: flex;
          gap: 32px;
          align-items: flex-start;
        }
        .properties-col-left {
          flex: 0 1 70%;
          max-width: 70%;
        }
        .properties-col-right {
          flex: 0 1 30%;
          max-width: 30%;
        }
        .properties-bottom-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 0;
        }
        @media (max-width: 768px) {
          .properties-flex-two-col {
            flex-direction: column !important;
            gap: 0 !important;
          }
          .properties-col-left,
          .properties-col-right {
            max-width: 100% !important;
            flex: 1 1 100% !important;
          }
          .properties-bottom-grid {
            flex-direction: column !important;
            gap: 14px !important;
            margin-top: 18px !important;
          }
        }
        }
      `}</style>
     
    </div>
  );
}
// Unified Dropdown component for sort/filter
function OptionsDropdown({
  sortOption,
  setSortOption,
  propertyTypeFilter,
  setPropertyTypeFilter,
  filterStatus,
  setFilterStatus,
}) {
  const [open, setOpen] = React.useState(false);
  // For closing dropdown on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest('.options-dropdown-root')) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  // Options
  const sortOptions = [
    'Newest First',
    'Oldest First',
    'Price: Low to High',
    'Price: High to Low',
    'Rental First',
    'Sale First',
  ];
  return (
    <div className="options-dropdown-root" style={{ position: 'relative', minWidth: '140px' }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          background: '#FFF',
          border: '1px solid #CBD5E1',
          borderRadius: '6px',
          padding: '8px 20px 8px 14px',
          fontWeight: 600,
          fontSize: '14px',
          color: '#334155',
          cursor: 'pointer',
          boxShadow: open ? '0 4px 16px rgba(0,0,0,0.06)' : undefined,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '120px',
          transition: 'box-shadow 0.2s',
        }}
      >
        Options <ChevronDown size={16} style={{ marginLeft: 2 }} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            minWidth: '220px',
            background: '#FFF',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
            zIndex: 20,
            padding: '8px 0',
            marginTop: '6px',
            fontSize: '14px',
          }}
        >
          {/* Sort */}
          <div style={{ padding: '8px 20px 2px 20px', fontWeight: 700, color: '#64748B', fontSize: '13px', letterSpacing: 0.5 }}>Sort by</div>
          {sortOptions.map(option => (
            <button
              key={option}
              onClick={() => { setSortOption(option); setOpen(false); }}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                color: sortOption === option ? '#2563EB' : '#334155',
                fontWeight: sortOption === option ? 700 : 500,
                padding: '8px 20px',
                cursor: 'pointer',
                borderRadius: 0,
                backgroundColor: sortOption === option ? '#F1F5F9' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = sortOption === option ? '#F1F5F9' : 'transparent'}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      
    </div>
  );
}