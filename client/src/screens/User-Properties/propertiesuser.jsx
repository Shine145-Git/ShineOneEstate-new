import React, { useState, useEffect } from 'react';
import { Award, MapPin, Edit2, Trash2, Home, TrendingUp, Users, Star, ArrowRight, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../Dashboard/TopNavigationBar';

function EditPropertyModal({ propertyId, propertyType, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    address: '', Sector: '', propertyType: 'apartment', bedrooms: '', bathrooms: '',
    totalArea: { sqft: '', configuration: '' }, parking: '', monthlyRent: '', leaseTerm: '',
    securityDeposit: '', utilities: [], appliances: [], communityFeatures: [], petPolicy: '',
    smokingPolicy: '', maintenance: '', title: '', description: '', price: '', area: '', location: ''
  });




  useEffect(() => {
    if (isOpen && propertyId) fetchPropertyData();
  }, [isOpen, propertyId]);

  const fetchPropertyData = async () => {
    setLoading(true);
    try {
      const endpoint = propertyType === 'rental' 
        ? `${process.env.REACT_APP_RENTAL_PROPERTY_DETAIL_API}/${propertyId}`
        : `${process.env.REACT_APP_API_URL}/api/sale-property/${propertyId}`;
      const response = await fetch(endpoint, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        setFormData({ ...formData, ...data, totalArea: data.totalArea || { sqft: '', configuration: '' },
          appliances: data.appliances || [], utilities: data.utilities || [], communityFeatures: data.communityFeatures || [] });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].includes(value) ? prev[field].filter(i => i !== value) : [...prev[field], value] }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/update-property/${propertyId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ ...formData, propertyType })
      });
      if (response.ok) { alert('Property updated!'); onSuccess?.(); onClose(); }
      else alert('Failed to update');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const Field = ({ label, value, onChange, type = 'text', ph }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph}
        style={{ width: '100%', padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px' }} />
    </div>
  );

  const TextArea = ({ label, value, onChange, ph }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} rows={3}
        style={{ width: '100%', padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit' }} />
    </div>
  );

  const Select = ({ label, value, onChange, opts }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px' }}>
        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  const Checks = ({ label, opts, sel, onChange }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {opts.map(o => (
          <label key={o} style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', backgroundColor: sel.includes(o) ? '#DBEAFE' : '#F8FAFC',
            border: `1px solid ${sel.includes(o) ? '#2563EB' : '#E2E8F0'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: sel.includes(o) ? '#2563EB' : '#64748B' }}>
            <input type="checkbox" checked={sel.includes(o)} onChange={() => onChange(o)} style={{ marginRight: '4px' }} />{o}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
      <div style={{ backgroundColor: '#FFF', borderRadius: '12px', maxWidth: '850px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B' }}>Edit Property</h2>
            <p style={{ fontSize: '13px', color: '#64748B' }}>{propertyType === 'rental' ? 'Rental' : 'Sale'} Property</p>
          </div>
          <button onClick={onClose} style={{ backgroundColor: '#F1F5F9', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="#64748B" />
          </button>
        </div>

        {propertyType === 'rental' && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '6px' }}>
            {['basic', 'financial', 'amenities', 'policies'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '8px', backgroundColor: activeTab === t ? '#2563EB' : '#F1F5F9', color: activeTab === t ? '#FFF' : '#64748B',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', textTransform: 'capitalize' }}>{t}</button>
            ))}
          </div>
        )}

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {loading ? <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>Loading...</div> : propertyType === 'sale' ? (
            <>
              <Field label="Title" value={formData.title} onChange={(v) => handleInputChange('title', v)} ph="Property title" />
              <TextArea label="Description" value={formData.description} onChange={(v) => handleInputChange('description', v)} ph="Describe property" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Price" type="number" value={formData.price} onChange={(v) => handleInputChange('price', v)} ph="Price" />
                <Field label="Area (sq ft)" type="number" value={formData.area} onChange={(v) => handleInputChange('area', v)} ph="Area" />
                <Field label="Bedrooms" type="number" value={formData.bedrooms} onChange={(v) => handleInputChange('bedrooms', v)} />
                <Field label="Bathrooms" type="number" value={formData.bathrooms} onChange={(v) => handleInputChange('bathrooms', v)} />
              </div>
              <Field label="Location" value={formData.location} onChange={(v) => handleInputChange('location', v)} />
              <Field label="Sector" value={formData.Sector} onChange={(v) => handleInputChange('Sector', v)} />
            </>
          ) : (
            <>
              {activeTab === 'basic' && (<>
                <Field label="Address" value={formData.address} onChange={(v) => handleInputChange('address', v)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Sector" value={formData.Sector} onChange={(v) => handleInputChange('Sector', v)} />
                  <Select label="Type" value={formData.propertyType} onChange={(v) => handleInputChange('propertyType', v)} opts={[
                    {v: 'house', l: 'House'}, {v: 'apartment', l: 'Apartment'}, {v: 'condo', l: 'Condo'}, {v: 'villa', l: 'Villa'}
                  ]} />
                  <Field label="Bedrooms" type="number" value={formData.bedrooms} onChange={(v) => handleInputChange('bedrooms', v)} />
                  <Field label="Bathrooms" type="number" value={formData.bathrooms} onChange={(v) => handleInputChange('bathrooms', v)} />
                  <Field label="Area (sq ft)" type="number" value={formData.totalArea.sqft} onChange={(v) => handleInputChange('totalArea.sqft', v)} />
                  <Field label="Config" value={formData.totalArea.configuration} onChange={(v) => handleInputChange('totalArea.configuration', v)} ph="e.g., 3 BHK" />
                </div>
                <Field label="Parking" value={formData.parking} onChange={(v) => handleInputChange('parking', v)} />
              </>)}
              {activeTab === 'financial' && (<>
                <Field label="Monthly Rent" type="number" value={formData.monthlyRent} onChange={(v) => handleInputChange('monthlyRent', v)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Lease Term" value={formData.leaseTerm} onChange={(v) => handleInputChange('leaseTerm', v)} ph="e.g., 12 months" />
                  <Field label="Security Deposit" value={formData.securityDeposit} onChange={(v) => handleInputChange('securityDeposit', v)} />
                </div>
                <Checks label="Utilities" opts={['Water', 'Electricity', 'Gas', 'Internet']} sel={formData.utilities} onChange={(v) => handleArrayToggle('utilities', v)} />
              </>)}
              {activeTab === 'amenities' && (<>
                <Checks label="Appliances" opts={['Refrigerator', 'Washing Machine', 'Dryer', 'Dishwasher', 'Microwave', 'AC']} sel={formData.appliances} onChange={(v) => handleArrayToggle('appliances', v)} />
                <Checks label="Community" opts={['Pool', 'Gym', 'Clubhouse', 'Security', 'Parking']} sel={formData.communityFeatures} onChange={(v) => handleArrayToggle('communityFeatures', v)} />
              </>)}
              {activeTab === 'policies' && (<>
                <Select label="Pet Policy" value={formData.petPolicy} onChange={(v) => handleInputChange('petPolicy', v)} opts={[
                  {v: '', l: 'Select'}, {v: 'allowed', l: 'Allowed'}, {v: 'not-allowed', l: 'Not Allowed'}
                ]} />
                <Select label="Smoking" value={formData.smokingPolicy} onChange={(v) => handleInputChange('smokingPolicy', v)} opts={[
                  {v: '', l: 'Select'}, {v: 'allowed', l: 'Allowed'}, {v: 'not-allowed', l: 'Not Allowed'}
                ]} />
                <TextArea label="Maintenance" value={formData.maintenance} onChange={(v) => handleInputChange('maintenance', v)} />
              </>)}
            </>
          )}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#F8FAFC' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', backgroundColor: '#FFF', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ padding: '8px 20px', backgroundColor: submitting ? '#94A3B8' : '#2563EB', color: '#FFF', border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px' }}>
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
  const navigate = useNavigate();

  useEffect(() => { fetchProperties(); fetchUser(); }, []);


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


  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_USER_PROPERTIES_API}`, { credentials: 'include' });
      const data = await response.json();
      console.log("Fetched properties data:", data);
      setProperties(Array.isArray(data) ? data : data.properties || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_USER_ME_API}`, { method: "GET", credentials: "include" });
      const data = await res.json();
      if (res.ok) setUser(data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDelete = async (propertyId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/delete-property/${propertyId}`, {
        method: 'DELETE', credentials: 'include'
      });
      if (response.ok) {
        setProperties(properties.filter(p => p._id !== propertyId));
        setDeleteModal({ show: false, propertyId: null });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = async (propertyId) => {
    try {
      const rentalRes = await fetch(`${process.env.REACT_APP_RENTAL_PROPERTY_DETAIL_API}/${propertyId}`, { credentials: 'include' });
      setEditModal({ show: true, propertyId, propertyType: rentalRes.ok ? 'rental' : 'sale' });
    } catch (err) {
      setEditModal({ show: true, propertyId, propertyType: 'sale' });
    }
  };


  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <TopNavigationBar user={user} navItems={navItems} onLogout={handleLogout} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>My Properties</h1>
            <p style={{ color: '#64748B', fontSize: '14px' }}>{properties.length} properties listed</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading...</div>
            ) : properties.length === 0 ? (
              <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', border: '2px dashed #E2E8F0' }}>
                <Home size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#475569', fontSize: '18px' }}>No properties yet</h3>
              </div>
            ) : (
              properties.map((p) => {
                return (
                  <div key={p._id} style={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
                      <div style={{ flexShrink: 0, position: 'relative' }}>
                        <img src={p.images?.[0] || '/default-property.jpg'} alt={p.name} style={{ width: '260px', height: '180px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/default-property.jpg'; }} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>{p.name}</h2>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(p._id); }} style={{ backgroundColor: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600' }}>
                              <Edit2 size={16} />Edit
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ show: true, propertyId: p._id }); }} style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600' }}>
                              <Trash2 size={16} />Delete
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#64748B' }}>
                          <MapPin size={16} />
                          <span style={{ fontSize: '14px' }}>{p.address || 'N/A'}</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563EB', marginBottom: '16px' }}>
                          ₹{p.monthlyRent?.toLocaleString() || 'N/A'}
                          {p.monthlyRent && <span style={{ fontSize: '14px', fontWeight: '400', color: '#64748B' }}>/month</span>}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); }} style={{ backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <TrendingUp size={16} />Analytics
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', borderRadius: '12px', padding: '24px', color: '#FFF' }}>
            <Home size={32} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Post Property</h3>
            <p style={{ fontSize: '14px', marginBottom: '16px', opacity: 0.9 }}>List your property and reach thousands</p>
            <button style={{ backgroundColor: '#FFF', color: '#667EEA', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
              <Plus size={18} />Post Property
            </button>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', marginBottom: '16px' }}>Quick Stats</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#475569' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#2563EB' }}>{properties.length}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', padding: '20px', color: '#FFF' }}>
            <Star size={28} color="#FCD34D" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Upgrade Premium</h3>
            <p style={{ fontSize: '13px', marginBottom: '16px', color: '#CBD5E1' }}>Featured listings & advanced analytics</p>
            <button style={{ backgroundColor: '#FCD34D', color: '#1E293B', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Upgrade<ArrowRight size={16} />
            </button>
          </div>

          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0' }}>
            <Users size={28} color="#3B82F6" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Need Help?</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>Our support team is here</p>
            <button style={{ backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', width: '100%' }}>Contact Support</button>
          </div>
        </div>
      </div>

      {deleteModal.show && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B', marginBottom: '12px' }}>Delete Property</h3>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Are you sure? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteModal({ show: false, propertyId: null })} style={{ flex: 1, backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteModal.propertyId)} style={{ flex: 1, backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <EditPropertyModal propertyId={editModal.propertyId} propertyType={editModal.propertyType} isOpen={editModal.show}
        onClose={() => setEditModal({ show: false, propertyId: null, propertyType: null })} onSuccess={fetchProperties} />
    </div>
  );
}