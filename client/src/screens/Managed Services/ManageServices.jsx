import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, AlertCircle, Home, Phone, Calendar, FileText, Wrench, X, ChevronRight, Filter, Search } from 'lucide-react';
import TopNavigationBar from '../Dashboard/TopNavigationBar';
import { useNavigate } from 'react-router-dom';
const ServiceTrackingSystem = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

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


  // Load user & requests from API
  const loadUser = async () => {
    try {
      const res = await fetch(process.env.REACT_APP_USER_ME_API, { method: 'GET', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(Boolean(data?.role === 'admin' || data?.isAdmin));
      }
    } catch (e) {
      // ignore user load failure
    }
  };
  

  const loadRequests = async (nextPage = 1, options = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(nextPage));
      params.set('limit', String(limit));
      if (filterStatus !== 'all') params.set('status', filterStatus);
      // optional server-side filtering by serviceType via search query if it exactly matches a label
      if (options.serviceType) params.set('serviceType', options.serviceType);

      const res = await fetch(`${process.env.REACT_APP_Base_API}/api/services?${params.toString()}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to load service requests');
      const data = await res.json();
      setRequests(Array.isArray(data.items) ? data.items : []);
      setTotalPages(Number(data.totalPages || 1));
      setPage(Number(data.page || nextPage));
    } catch (e) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser().finally(() => loadRequests(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when filterStatus changes
  useEffect(() => {
    loadRequests(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const serviceTypes = {
    cleaning: { icon: '🧹', label: 'Cleaning', color: '#00A79D' },
    painting: { icon: '🎨', label: 'Painting', color: '#8B5CF6' },
    termite: { icon: '🐛', label: 'Termite Control', color: '#DC2626' },
    plumbing: { icon: '🚰', label: 'Plumbing', color: '#2563EB' },
    acService: { icon: '❄️', label: 'AC Service', color: '#06B6D4' },
    carpenter: { icon: '🪚', label: 'Carpenter', color: '#D97706' },
    electrical: { icon: '⚡', label: 'Electrical', color: '#F59E0B' },
    moving: { icon: '📦', label: 'Moving', color: '#10B981' },
    pestControl: { icon: '🦟', label: 'Pest Control', color: '#EF4444' },
    other: { icon: '🔧', label: 'Other', color: '#6B7280' }
  };

  const statusConfig = {
    pending: { 
      icon: Clock, 
      label: 'Pending', 
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      description: 'Request received, awaiting assignment'
    },
    'in-progress': { 
      icon: Package, 
      label: 'In Progress', 
      color: '#00A79D',
      bgColor: '#CCFBF1',
      description: 'Service provider is working on your request'
    },
    completed: { 
      icon: CheckCircle, 
      label: 'Completed', 
      color: '#10B981',
      bgColor: '#D1FAE5',
      description: 'Service completed successfully'
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = (status) => {
    switch(status) {
      case 'pending': return 33;
      case 'in-progress': return 66;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const filteredRequests = (requests || []).filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = req.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         serviceTypes[req.serviceType]?.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F4F7F9 0%, #FFFFFF 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      maxWidth: '1200px',
      margin: '0 auto 32px',
      background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
      borderRadius: '16px',
      padding: '32px',
      color: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0, 51, 102, 0.2)',
      marginTop: '80px'
    },
    title: {
      fontSize: '36px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '16px',
      opacity: '0.9',
      margin: '0'
    },
    controls: {
      maxWidth: '1200px',
      margin: '0 auto 24px',
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap'
    },
    searchBox: {
      flex: '1',
      minWidth: '250px',
      position: 'relative'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 44px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      boxSizing: 'border-box'
    },
    searchIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6B7280'
    },
    filterButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    filterButton: (isActive, color) => ({
      padding: '10px 20px',
      border: isActive ? `2px solid ${color}` : '2px solid #E5E7EB',
      borderRadius: '8px',
      background: isActive ? color : '#FFFFFF',
      color: isActive ? '#FFFFFF' : '#4A6A8A',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }),
    requestsList: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '20px'
    },
    requestCard: {
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 16px rgba(0, 51, 102, 0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '2px solid transparent'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    serviceIcon: (color) => ({
      fontSize: '32px',
      width: '56px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      background: `${color}15`,
      border: `2px solid ${color}40`
    }),
    statusBadge: (status) => {
      const config = statusConfig[status];
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        background: config.bgColor,
        color: config.color
      };
    },
    cardBody: {
      marginBottom: '16px'
    },
    serviceLabel: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#003366',
      marginBottom: '8px'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      marginBottom: '8px',
      fontSize: '14px',
      color: '#4A6A8A'
    },
    progressBar: {
      width: '100%',
      height: '6px',
      background: '#E5E7EB',
      borderRadius: '3px',
      overflow: 'hidden',
      marginBottom: '12px'
    },
    progressFill: (percentage, color) => ({
      width: `${percentage}%`,
      height: '100%',
      background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
      transition: 'width 0.5s ease',
      borderRadius: '3px'
    }),
    viewDetailsButton: {
      width: '100%',
      padding: '10px',
      background: 'transparent',
      border: '2px solid #00A79D',
      borderRadius: '8px',
      color: '#00A79D',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.3s ease'
    },
    modal: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 51, 102, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000',
      padding: '20px',
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      background: '#FFFFFF',
      borderRadius: '16px',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 51, 102, 0.3)'
    },
    modalHeader: (status) => ({
      background: `linear-gradient(135deg, ${statusConfig[status].color} 0%, ${statusConfig[status].color}CC 100%)`,
      padding: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#FFFFFF',
      borderRadius: '16px 16px 0 0'
    }),
    modalTitle: {
      fontSize: '24px',
      fontWeight: '700',
      margin: '0'
    },
    closeButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
      color: '#FFFFFF'
    },
    modalBody: {
      padding: '24px'
    },
    timeline: {
      position: 'relative',
      paddingLeft: '40px',
      marginTop: '24px'
    },
    timelineItem: (isActive) => ({
      position: 'relative',
      paddingBottom: '24px',
      opacity: isActive ? 1 : 0.5
    }),
    timelineDot: (color, isActive) => ({
      position: 'absolute',
      left: '-40px',
      top: '0',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: isActive ? color : '#E5E7EB',
      border: `3px solid ${isActive ? color : '#9CA3AF'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2
    }),
    timelineLine: {
      position: 'absolute',
      left: '-29px',
      top: '24px',
      bottom: '0',
      width: '2px',
      background: '#E5E7EB'
    },
    timelineContent: {
      marginBottom: '8px'
    },
    timelineStatus: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#003366',
      marginBottom: '4px'
    },
    timelineDate: {
      fontSize: '13px',
      color: '#6B7280',
      marginBottom: '4px'
    },
    timelineDescription: {
      fontSize: '14px',
      color: '#4A6A8A'
    },
    detailsSection: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#003366',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    detailItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px',
      background: '#F4F7F9',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    detailIcon: {
      color: '#00A79D',
      flexShrink: 0
    },
    detailText: {
      fontSize: '14px',
      color: '#333333',
      lineHeight: '1.5'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6B7280'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px'
    },
    emptyText: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#4A6A8A'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#4A6A8A' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Loading your service requests...</div>
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
          
          <div style={styles.header  }>
        <h1 style={styles.title}>
          <Package size={40} />
          Track Service Requests
        </h1>
        <p style={styles.subtitle}>
          Monitor the status of all your service requests in real-time
        </p>
      </div>

      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <Search size={20} style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by address or service type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = '#00A79D'}
            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>
        <div style={styles.filterButtons}>
          <button
            style={styles.filterButton(filterStatus === 'all', '#003366')}
            onClick={() => setFilterStatus('all')}
            onMouseEnter={(e) => filterStatus !== 'all' && (e.currentTarget.style.background = '#F4F7F9')}
            onMouseLeave={(e) => filterStatus !== 'all' && (e.currentTarget.style.background = '#FFFFFF')}
          >
            <Filter size={16} />
            All ({requests.length})
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              style={styles.filterButton(filterStatus === key, config.color)}
              onClick={() => setFilterStatus(key)}
              onMouseEnter={(e) => filterStatus !== key && (e.currentTarget.style.background = '#F4F7F9')}
              onMouseLeave={(e) => filterStatus !== key && (e.currentTarget.style.background = '#FFFFFF')}
            >
              <config.icon size={16} />
              {config.label} ({requests.filter(r => r.status === key).length})
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <div style={styles.emptyText}>No service requests found</div>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>
            {searchQuery ? 'Try adjusting your search criteria' : 'Create your first service request to get started'}
          </p>
        </div>
      ) : (
        <div style={styles.requestsList}>
          {filteredRequests.map(request => {
            const service = serviceTypes[request.serviceType];
            const status = statusConfig[request.status];
            const progress = getProgressPercentage(request.status);

            return (
              <div
                key={request._id}
                style={styles.requestCard}
                onClick={() => setSelectedRequest(request)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 51, 102, 0.15)';
                  e.currentTarget.style.borderColor = status.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 51, 102, 0.08)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.serviceIcon(service.color)}>
                    {service.icon}
                  </div>
                  <div style={styles.statusBadge(request.status)}>
                    {React.createElement(status.icon, { size: 14 })}
                    {status.label}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.serviceLabel}>
                    {service.label} Service
                  </div>
                  <div style={styles.infoRow}>
                    <Home size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ lineHeight: '1.4' }}>{request.address}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <Calendar size={16} style={{ flexShrink: 0 }} />
                    <span>Requested: {formatDate(request.createdAt)}</span>
                  </div>
                </div>

                <div style={styles.progressBar}>
                  <div style={styles.progressFill(progress, status.color)} />
                </div>

                <button
                  style={styles.viewDetailsButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#00A79D';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#00A79D';
                  }}
                >
                  View Details
                  <ChevronRight size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedRequest && (
        <div style={styles.modal} onClick={() => setSelectedRequest(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader(selectedRequest.status)}>
              <h2 style={styles.modalTitle}>
                {serviceTypes[selectedRequest.serviceType].icon} {serviceTypes[selectedRequest.serviceType].label} Service
              </h2>
              <button
                style={styles.closeButton}
                onClick={() => setSelectedRequest(null)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailsSection}>
                <div style={styles.sectionTitle}>📍 Service Details</div>
                <div style={styles.detailItem}>
                  <Home size={18} style={styles.detailIcon} />
                  <div style={styles.detailText}>
                    <strong>Address:</strong><br />
                    {selectedRequest.address}
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <Phone size={18} style={styles.detailIcon} />
                  <div style={styles.detailText}>
                    <strong>Contact:</strong> {selectedRequest.contactNumber}
                  </div>
                </div>
                {selectedRequest.preferredDate && (
                  <div style={styles.detailItem}>
                    <Calendar size={18} style={styles.detailIcon} />
                    <div style={styles.detailText}>
                      <strong>Preferred Date:</strong> {formatDate(selectedRequest.preferredDate)}
                    </div>
                  </div>
                )}
                {selectedRequest.notes && (
                  <div style={styles.detailItem}>
                    <FileText size={18} style={styles.detailIcon} />
                    <div style={styles.detailText}>
                      <strong>Notes:</strong><br />
                      {selectedRequest.notes}
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.detailsSection}>
                <div style={styles.sectionTitle}>📊 Request Timeline</div>
                <div style={styles.timeline}>
                  {(selectedRequest.timeline && selectedRequest.timeline.length > 0) ? (
                    (selectedRequest.timeline || []).map((item, index) => {
                      const isActive = index <= selectedRequest.timeline.length - 1;
                      const config = statusConfig[item.status];
                      const StatusIcon = config.icon;

                      return (
                        <div key={index} style={styles.timelineItem(isActive)}>
                          {index < selectedRequest.timeline.length - 1 && (
                            <div style={styles.timelineLine} />
                          )}
                          <div style={styles.timelineDot(config.color, isActive)}>
                            {isActive && <StatusIcon size={12} color="#FFFFFF" />}
                          </div>
                          <div style={styles.timelineContent}>
                            <div style={styles.timelineStatus}>{config.label}</div>
                            <div style={styles.timelineDate}>{formatDate(item.date)}</div>
                            <div style={styles.timelineDescription}>{item.description}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: '#4A6A8A', fontSize: '14px' }}>
                      📭 No updates recorded for this request yet.
                    </p>
                  )}
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: statusConfig[selectedRequest.status].bgColor,
                borderRadius: '8px',
                borderLeft: `4px solid ${statusConfig[selectedRequest.status].color}`
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#003366', marginBottom: '4px' }}>
                  Current Status
                </div>
                <div style={{ fontSize: '14px', color: '#4A6A8A' }}>
                  {statusConfig[selectedRequest.status].description}
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '14px', color: '#003366', fontWeight: 600 }}>Update Status:</label>
                <select
                  value={selectedStatus || selectedRequest.status}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '2px solid #E5E7EB' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={async () => {
                    setUpdateError('');
                    setUpdateSuccess('');
                    setStatusUpdating(true);
                    try {
                      const statusToSend = selectedStatus || selectedRequest.status;
                      const base = `${process.env.REACT_APP_Base_API}`;
                      const url = isAdmin
                        ? `${base}/api/admin/services/${selectedRequest._id}/status`
                        : `${base}/api/services/${selectedRequest._id}/status`;
                      const res = await fetch(url, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ status: statusToSend })
                      });
                      if (!res.ok) throw new Error('Failed to update status');
                      setUpdateSuccess('Status updated successfully');
                      // Optimistically update local state
                      setRequests((prev) => prev.map(r => r._id === selectedRequest._id ? { ...r, status: statusToSend, updatedAt: new Date().toISOString() } : r));
                      setSelectedRequest((prev) => prev ? { ...prev, status: statusToSend, timeline: [...(prev.timeline || []), { status: statusToSend, date: new Date().toISOString(), description: 'Status updated' }] } : prev);
                    } catch (err) {
                      setUpdateError(err.message || 'Error updating status');
                    } finally {
                      setStatusUpdating(false);
                    }
                  }}
                  disabled={statusUpdating}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: statusUpdating ? '#9CA3AF' : '#00A79D', color: '#FFFFFF', fontWeight: 700, cursor: statusUpdating ? 'not-allowed' : 'pointer' }}
                >
                  {statusUpdating ? 'Updating...' : 'Save'}
                </button>
                {updateError && <span style={{ color: '#DC2626', fontSize: '13px' }}>{updateError}</span>}
                {updateSuccess && <span style={{ color: '#10B981', fontSize: '13px' }}>{updateSuccess}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ maxWidth: '1200px', margin: '32px auto', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => page > 1 && loadRequests(page - 1)}
          disabled={page <= 1}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #E5E7EB', background: page <= 1 ? '#F4F7F9' : '#FFFFFF', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => loadRequests(idx + 1)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #E5E7EB', background: page === (idx + 1) ? '#00A79D' : '#FFFFFF', color: page === (idx + 1) ? '#FFFFFF' : '#003366', fontWeight: 700 }}
          >
            {idx + 1}
          </button>
        ))}
        <button
          onClick={() => page < totalPages && loadRequests(page + 1)}
          disabled={page >= totalPages}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #E5E7EB', background: page >= totalPages ? '#F4F7F9' : '#FFFFFF', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
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

export default ServiceTrackingSystem;