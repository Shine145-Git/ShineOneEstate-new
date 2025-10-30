import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, MapPin, Edit2, Trash2, Home, TrendingUp, Users, Star, ArrowRight, Plus, X, Search, Filter, Eye, Calendar, PhoneCall, MessageSquare, BarChart3, Grid, List, ChevronDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../Dashboard/TopNavigationBar';

function EditPropertyModal({ propertyId, propertyType, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({ address: '', Sector: '', propertyType: 'apartment', bedrooms: '', bathrooms: '', totalArea: { sqft: '', configuration: '' }, parking: '', monthlyRent: '', leaseTerm: '', securityDeposit: '', utilities: [], appliances: [], communityFeatures: [], petPolicy: '', smokingPolicy: '', maintenance: '', title: '', description: '', price: '', area: '', location: '', images: [] });
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => { if (isOpen && propertyId) { fetchPropertyData(); setUploadedImages([]); } }, [isOpen, propertyId]);

  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      const endpoint = propertyType === 'rental' ? `${process.env.REACT_APP_RENTAL_PROPERTY_DETAIL_API}/${propertyId}` : `${process.env.REACT_APP_API_URL}/api/sale-property/${propertyId}`;
      const response = await fetch(endpoint, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) { setFormData((prev) => ({ ...prev, ...data, totalArea: data.totalArea || { sqft: '', configuration: '' }, appliances: data.appliances || [], utilities: data.utilities || [], communityFeatures: data.communityFeatures || [], images: data.images || [] })); }
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) { const [parent, child] = field.split('.'); setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } })); } 
    else { setFormData(prev => ({ ...prev, [field]: value === '' ? '' : value })); }
  };

  const handleArrayToggle = (field, value) => { setFormData(prev => ({ ...prev, [field]: prev[field].includes(value) ? prev[field].filter(i => i !== value) : [...prev[field], value] })); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let response;
      if (uploadedImages.length > 0) {
        const form = new FormData();
        Object.entries({ ...formData, propertyType, price: formData.price ? Number(formData.price) : 0, area: formData.area ? Number(formData.area) : 0, monthlyRent: formData.monthlyRent ? Number(formData.monthlyRent) : 0, bedrooms: formData.bedrooms ? Number(formData.bedrooms) : 0, bathrooms: formData.bathrooms ? Number(formData.bathrooms) : 0 }).forEach(([key, value]) => {
          if (key === 'totalArea') { form.append('totalArea.sqft', value?.sqft ?? ''); form.append('totalArea.configuration', value?.configuration ?? ''); } 
          else if (Array.isArray(value)) { value.forEach((v) => form.append(key, v)); } 
          else { form.append(key, value ?? ''); }
        });
        uploadedImages.forEach((img) => { form.append('images', img); });
        response = await fetch(`${process.env.REACT_APP_Base_API}/api/user/update-property/${propertyId}`, { method: 'PUT', credentials: 'include', body: form });
      } else {
        const payload = { ...formData, propertyType, price: formData.price ? Number(formData.price) : 0, area: formData.area ? Number(formData.area) : 0, monthlyRent: formData.monthlyRent ? Number(formData.monthlyRent) : 0, bedrooms: formData.bedrooms ? Number(formData.bedrooms) : 0, bathrooms: formData.bathrooms ? Number(formData.bathrooms) : 0 };
        response = await fetch(`${process.env.REACT_APP_Base_API}/api/user/update-property/${propertyId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
      }
      if (response.ok) { alert('Property updated!'); onSuccess?.(); onClose(); } else { alert('Failed to update'); }
    } catch (error) { console.error('Error:', error); } finally { setSubmitting(false); }
  };

  const handleImageChange = (e) => { const files = Array.from(e.target.files); setUploadedImages(files); };

  if (!isOpen) return null;

  const Field = ({ label, value, onChange, type = 'text', ph }) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', outline: 'none', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#3B82F6'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
    </div>
  );

  const TextArea = ({ label, value, onChange, ph }) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} rows={3} style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#3B82F6'} onBlur={(e) => e.target.style.borderColor = '#CBD5E1'} />
    </div>
  );

  const Select = ({ label, value, onChange, opts }) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}>
        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  const Checks = ({ label, opts, sel, onChange }) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {opts.map(o => (
          <label key={o} style={{ display: 'flex', alignItems: 'center', padding: '7px 12px', backgroundColor: sel.includes(o) ? '#DBEAFE' : '#F8FAFC', border: `1px solid ${sel.includes(o) ? '#3B82F6' : '#CBD5E1'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: sel.includes(o) ? '#1E40AF' : '#64748B', transition: 'all 0.2s' }}>
            <input type="checkbox" checked={sel.includes(o)} onChange={() => onChange(o)} style={{ marginRight: '6px' }} />{o}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', maxWidth: '900px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 80px rgba(0,0,0,0.35)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, #F8FAFC, #FFF)' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>Edit Property Details</h2>
            <p style={{ fontSize: '13px', color: '#64748B' }}>{propertyType === 'rental' ? 'Rental' : 'Sale'} Property • ID: {propertyId?.slice(-8)}</p>
          </div>
          <button onClick={onClose} style={{ backgroundColor: '#F1F5F9', border: 'none', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}>
            <X size={20} color="#475569" />
          </button>
        </div>

        {propertyType === 'rental' && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px', backgroundColor: '#FAFBFC' }}>
            {['basic', 'financial', 'amenities', 'policies'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '10px', backgroundColor: activeTab === t ? '#3B82F6' : 'transparent', color: activeTab === t ? '#FFF' : '#64748B', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', textTransform: 'capitalize', transition: 'all 0.2s' }}>{t}</button>
            ))}
          </div>
        )}

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading property data...</div> : propertyType === 'sale' ? (
            <>
              <Field label="Property Title" value={formData.title} onChange={(v) => handleInputChange('title', v)} ph="Enter descriptive title" />
              <TextArea label="Property Description" value={formData.description} onChange={(v) => handleInputChange('description', v)} ph="Describe property features, nearby amenities..." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="Price (₹)" type="number" value={formData.price} onChange={(v) => handleInputChange('price', v)} ph="0" />
                <Field label="Area (sq ft)" type="number" value={formData.area} onChange={(v) => handleInputChange('area', v)} ph="0" />
                <Field label="Bedrooms" type="number" value={formData.bedrooms} onChange={(v) => handleInputChange('bedrooms', v)} />
                <Field label="Bathrooms" type="number" value={formData.bathrooms} onChange={(v) => handleInputChange('bathrooms', v)} />
              </div>
              <Field label="Location / Address" value={formData.location} onChange={(v) => handleInputChange('location', v)} />
              <Field label="Sector" value={formData.Sector} onChange={(v) => handleInputChange('Sector', v)} />
            </>
          ) : (
            <>
              {activeTab === 'basic' && (<>
                <Field label="Property Address" value={formData.address} onChange={(v) => handleInputChange('address', v)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Sector" value={formData.Sector} onChange={(v) => handleInputChange('Sector', v)} />
                  <Select label="Property Type" value={formData.propertyType} onChange={(v) => handleInputChange('propertyType', v)} opts={[{v: 'house', l: 'House'}, {v: 'apartment', l: 'Apartment'}, {v: 'condo', l: 'Condo'}, {v: 'villa', l: 'Villa'}]} />
                  <Field label="Bedrooms" type="number" value={formData.bedrooms} onChange={(v) => handleInputChange('bedrooms', v)} />
                  <Field label="Bathrooms" type="number" value={formData.bathrooms} onChange={(v) => handleInputChange('bathrooms', v)} />
                  <Field label="Area (sq ft)" type="number" value={formData.totalArea.sqft} onChange={(v) => handleInputChange('totalArea.sqft', v)} />
                  <Field label="Configuration" value={formData.totalArea.configuration} onChange={(v) => handleInputChange('totalArea.configuration', v)} ph="e.g., 3 BHK" />
                </div>
                <Field label="Parking" value={formData.parking} onChange={(v) => handleInputChange('parking', v)} />
              </>)}
              {activeTab === 'financial' && (<>
                <Field label="Monthly Rent (₹)" type="number" value={formData.monthlyRent} onChange={(v) => handleInputChange('monthlyRent', v)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Lease Term" value={formData.leaseTerm} onChange={(v) => handleInputChange('leaseTerm', v)} ph="e.g., 12 months" />
                  <Field label="Security Deposit" value={formData.securityDeposit} onChange={(v) => handleInputChange('securityDeposit', v)} />
                </div>
                <Checks label="Utilities Included" opts={['Water', 'Electricity', 'Gas', 'Internet']} sel={formData.utilities} onChange={(v) => handleArrayToggle('utilities', v)} />
              </>)}
              {activeTab === 'amenities' && (<>
                <Checks label="Appliances" opts={['Refrigerator', 'Washing Machine', 'Dryer', 'Dishwasher', 'Microwave', 'AC']} sel={formData.appliances} onChange={(v) => handleArrayToggle('appliances', v)} />
                <Checks label="Community Features" opts={['Pool', 'Gym', 'Clubhouse', 'Security', 'Parking']} sel={formData.communityFeatures} onChange={(v) => handleArrayToggle('communityFeatures', v)} />
              </>)}
              {activeTab === 'policies' && (<>
                <Select label="Pet Policy" value={formData.petPolicy} onChange={(v) => handleInputChange('petPolicy', v)} opts={[{v: '', l: 'Select Policy'}, {v: 'allowed', l: 'Pets Allowed'}, {v: 'not-allowed', l: 'No Pets'}]} />
                <Select label="Smoking Policy" value={formData.smokingPolicy} onChange={(v) => handleInputChange('smokingPolicy', v)} opts={[{v: '', l: 'Select Policy'}, {v: 'allowed', l: 'Smoking Allowed'}, {v: 'not-allowed', l: 'No Smoking'}]} />
                <TextArea label="Maintenance Info" value={formData.maintenance} onChange={(v) => handleInputChange('maintenance', v)} />
              </>)}
            </>
          )}

          <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '10px' }}>Property Images</label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ marginBottom: '12px', fontSize: '13px' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
              {Array.isArray(formData.images) && formData.images.length > 0 && formData.images.map((img, idx) => (
                <div key={'existing-' + img + idx} style={{ width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #E2E8F0', background: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <img src={img} alt={`Property ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
              {uploadedImages.length > 0 && uploadedImages.map((file, idx) => (
                <div key={'uploaded-' + file.name + idx} style={{ width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #3B82F6', background: '#FFF', boxShadow: '0 2px 8px rgba(59,130,246,0.2)' }}>
                  <img src={URL.createObjectURL(file)} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
              {uploadedImages.length > 0 ? `${uploadedImages.length} new image${uploadedImages.length > 1 ? 's' : ''} selected` : 'Upload new images to replace or add to existing ones'}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#FAFBFC' }}>
          <button onClick={onClose} style={{ padding: '10px 24px', backgroundColor: '#FFF', color: '#64748B', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#94A3B8'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ padding: '10px 24px', backgroundColor: submitting ? '#94A3B8' : '#3B82F6', color: '#FFF', border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }} onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#2563EB')} onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#3B82F6')}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PropertyCards() {
  const [properties, setProperties] = useState([]);
  const [user, setUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, propertyId: null });
  const [editModal, setEditModal] = useState({ show: false, propertyId: null, propertyType: null });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest First');
  const [userMetrics, setUserMetrics] = useState(null);
  // Performance metrics state
  const [metrics, setMetrics] = useState(null);
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

  const handleEdit = async (propertyId) => {
    try {
      const rentalRes = await fetch(`${process.env.REACT_APP_RENTAL_PROPERTY_DETAIL_API}/${propertyId}`, { credentials: 'include' });
      setEditModal({ show: true, propertyId, propertyType: rentalRes.ok ? 'rental' : 'sale' });
    } catch (err) { setEditModal({ show: true, propertyId, propertyType: 'sale' }); }
  };

  const navItems = ["For Buyers", "For Tenants", "For Owners", "For Dealers / Builders", "Insights"];

  const filteredProperties = properties.filter(p => {
    // Filter by status
    let statusMatch = true;
    if (filterStatus === 'active') {
      statusMatch = p.isActive === true;
    } else if (filterStatus === 'deleted') {
      statusMatch = p.isActive === false;
    }
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && matchesSearch;
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
    return 0;
  });


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
            <div className="properties-header-status" style={{ display: 'flex', gap: '8px' }}>
              {['all', 'active', 'deleted'].map(status => (
                <button key={status} onClick={() => setFilterStatus(status)} className="properties-header-status-btn" style={{ padding: '8px 16px', backgroundColor: filterStatus === status ? '#DBEAFE' : '#FFF', color: filterStatus === status ? '#1E40AF' : '#64748B', border: `1px solid ${filterStatus === status ? '#3B82F6' : '#E2E8F0'}`, borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', transition: 'all 0.2s' }}>
                  {status}
                </button>
              ))}
            </div>

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
        <div className="properties-main-filters-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '16px 20px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Showing:</span>
            <span style={{ fontSize: '14px', color: '#64748B' }}>ALL</span>
            <button style={{ backgroundColor: '#F1F5F9', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', color: '#3B82F6', fontWeight: '600' }}>Clear All Filters</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>SORT:</span>
            <select
              style={{ padding: '6px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px', padding: '12px 20px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} color="#D97706" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#92400E', fontSize: '13px' }}>NEW: </strong>
            <span style={{ color: '#78350F', fontSize: '13px' }}>Self Verify by uploading photos with location data - Now verify without being at the property</span>
          </div>
          <button style={{ backgroundColor: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Learn more</button>
        </div>

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
                            ₹{(p.monthlyRent || p.price || 0).toLocaleString()}
                            {p.monthlyRent && <span style={{ fontSize: '13px', fontWeight: '400', color: '#64748B' }}>/month</span>}
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
                        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ show: true, propertyId: p._id }); }} style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FECACA'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}>
                          <Trash2 size={14} />Delete
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

        <div className="properties-bottom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '24px' }}>
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

      {deleteModal.show && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '32px', maxWidth: '440px', width: '90%', boxShadow: '0 25px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Trash2 size={32} color="#DC2626" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', textAlign: 'center' }}>Delete Property?</h3>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '28px', textAlign: 'center', lineHeight: '1.6' }}>Are you sure you want to delete this property? This action cannot be undone and all associated data will be permanently removed.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteModal({ show: false, propertyId: null })} style={{ flex: 1, backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}>Cancel</button>
              <button onClick={() => handleDelete(deleteModal.propertyId)} style={{ flex: 1, backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}>Delete Property</button>
            </div>
          </div>
        </div>
      )}

      <EditPropertyModal propertyId={editModal.propertyId} propertyType={editModal.propertyType} isOpen={editModal.show} onClose={() => setEditModal({ show: false, propertyId: null, propertyType: null })} onSuccess={fetchProperties} />

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
          /* Bottom grid: stack boxes vertically */
          .properties-bottom-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            margin-top: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}