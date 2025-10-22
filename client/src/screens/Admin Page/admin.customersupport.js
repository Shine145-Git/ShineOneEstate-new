import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Phone, Mail, Clock, User, MessageSquare, Calendar, Filter, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import TopNavigationBar from '../Dashboard/TopNavigationBar';
import { useNavigate } from 'react-router-dom';
export default function CallbackDetailsUI() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [callbackRequests, setCallbackRequests] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  async function fetchCallbackRequests() {
    try {
      const response = await axios.get(`${process.env.REACT_APP_GET_CALLBACK_REQUESTS_API}`, {
        withCredentials: true,
      });
    //   console.log("Raw API response:", response.data);

      if (Array.isArray(response.data.data)) {
        const formatted = response.data.data.map(item => ({
          id: item._id,
          name: item.name,
          phone: item.phone,
          email: item.email,
          preferredTime: item.preferredTime,
          issue: item.issue,
          status: item.status || 'pending',
          submittedAt: item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : '',
          priority: item.priority || 'medium',
        }));
        // console.log("Formatted requests:", formatted);
        setCallbackRequests(formatted);
      }
    } catch (error) {
      console.error('Error fetching callback requests:', error);
    }
  }
  fetchCallbackRequests();
  }, []);
  

  const handleLogout = async () => {
    await fetch("http://localhost:2000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:2000/auth/me", {
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#00A79D';
      case 'in-progress': return '#22D3EE';
      case 'completed': return '#4A6A8A';
      case 'cancelled': return '#333333';
      default: return '#4A6A8A';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <AlertCircle size={18} />;
      case 'in-progress': return <Clock size={18} />;
      case 'completed': return <CheckCircle size={18} />;
      case 'cancelled': return <XCircle size={18} />;
      default: return <AlertCircle size={18} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFA500';
      case 'low': return '#4A6A8A';
      default: return '#4A6A8A';
    }
  };

  const filteredRequests = callbackRequests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id, newStatus) => {
    setCallbackRequests(callbackRequests.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));
  };

  const stats = {
    total: callbackRequests.length,
    pending: callbackRequests.filter(r => r.status === 'pending').length,
    inProgress: callbackRequests.filter(r => r.status === 'in-progress').length,
    completed: callbackRequests.filter(r => r.status === 'completed').length
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F4F7F9 0%, #FFFFFF 100%)' }}>
      <TopNavigationBar user={user} onLogout={handleLogout} navItems={navItems} />
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
        padding: '40px 20px',
        boxShadow: '0 4px 20px rgba(0, 51, 102, 0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ 
            color: '#FFFFFF',
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '10px'
          }}>
            Callback Requests Dashboard
          </h1>
          <p style={{ 
            color: '#22D3EE',
            fontSize: '16px',
            margin: 0
          }}>
            Manage and track customer callback requests
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0, 51, 102, 0.08)',
            borderLeft: '4px solid #003366'
          }}>
            <div style={{ color: '#4A6A8A', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Total Requests
            </div>
            <div style={{ color: '#003366', fontSize: '32px', fontWeight: '700' }}>
              {stats.total}
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0, 51, 102, 0.08)',
            borderLeft: '4px solid #00A79D'
          }}>
            <div style={{ color: '#4A6A8A', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Pending
            </div>
            <div style={{ color: '#00A79D', fontSize: '32px', fontWeight: '700' }}>
              {stats.pending}
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0, 51, 102, 0.08)',
            borderLeft: '4px solid #22D3EE'
          }}>
            <div style={{ color: '#4A6A8A', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              In Progress
            </div>
            <div style={{ color: '#22D3EE', fontSize: '32px', fontWeight: '700' }}>
              {stats.inProgress}
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0, 51, 102, 0.08)',
            borderLeft: '4px solid #4A6A8A'
          }}>
            <div style={{ color: '#4A6A8A', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Completed
            </div>
            <div style={{ color: '#4A6A8A', fontSize: '32px', fontWeight: '700' }}>
              {stats.completed}
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px',
          boxShadow: '0 4px 15px rgba(0, 51, 102, 0.08)',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={20} color="#4A6A8A" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 45px',
                border: '2px solid #F4F7F9',
                borderRadius: '10px',
                fontSize: '15px',
                color: '#333333',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00A79D'}
              onBlur={(e) => e.target.style.borderColor = '#F4F7F9'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Filter size={20} color="#4A6A8A" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px 40px 12px 16px',
                border: '2px solid #F4F7F9',
                borderRadius: '10px',
                fontSize: '15px',
                color: '#333333',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00A79D'}
              onBlur={(e) => e.target.style.borderColor = '#F4F7F9'}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredRequests.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '15px',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0, 51, 102, 0.08)'
            }}>
              <MessageSquare size={48} color="#4A6A8A" style={{ marginBottom: '15px' }} />
              <p style={{ color: '#4A6A8A', fontSize: '16px', margin: 0 }}>
                No callback requests found matching your criteria.
              </p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <div
                key={request.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '15px',
                  boxShadow: '0 4px 15px rgba(0, 51, 102, 0.08)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.3s ease',
                  border: expandedId === request.id ? `2px solid ${getStatusColor(request.status)}` : '2px solid transparent'
                }}
              >
                {/* Request Header */}
                <div
                  style={{
                    padding: '25px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '15px'
                  }}
                  onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 300px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '20px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      {request.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ 
                        color: '#003366',
                        fontSize: '18px',
                        fontWeight: '700',
                        marginBottom: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        {request.name}
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: getPriorityColor(request.priority) + '20',
                          color: getPriorityColor(request.priority),
                          textTransform: 'uppercase'
                        }}>
                          {request.priority}
                        </span>
                      </div>
                      <div style={{ color: '#4A6A8A', fontSize: '14px' }}>
                        {request.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(request.status) + '20',
                      color: getStatusColor(request.status)
                    }}>
                      {getStatusIcon(request.status)}
                      <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>
                        {request.status.replace('-', ' ')}
                      </span>
                    </div>
                    {expandedId === request.id ? <ChevronUp size={24} color="#4A6A8A" /> : <ChevronDown size={24} color="#4A6A8A" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === request.id && (
                  <div style={{
                    padding: '0 25px 25px 25px',
                    borderTop: '1px solid #F4F7F9',
                    animation: 'slideDown 0.3s ease'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '20px',
                      marginTop: '20px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                        <Phone size={20} color="#00A79D" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ color: '#4A6A8A', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                            Phone Number
                          </div>
                          <div style={{ color: '#003366', fontSize: '15px', fontWeight: '600' }}>
                            {request.phone}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                        <Clock size={20} color="#00A79D" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ color: '#4A6A8A', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                            Preferred Time
                          </div>
                          <div style={{ color: '#003366', fontSize: '15px', fontWeight: '600' }}>
                            {request.preferredTime}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                        <Calendar size={20} color="#00A79D" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ color: '#4A6A8A', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                            Submitted At
                          </div>
                          <div style={{ color: '#003366', fontSize: '15px', fontWeight: '600' }}>
                            {request.submittedAt}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      background: '#F4F7F9',
                      borderRadius: '10px',
                      padding: '15px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ 
                        color: '#4A6A8A',
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <MessageSquare size={16} color="#00A79D" />
                        Issue Description
                      </div>
                      <div style={{ color: '#333333', fontSize: '15px', lineHeight: '1.6' }}>
                        {request.issue}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => updateStatus(request.id, 'in-progress')}
                        disabled={request.status === 'in-progress' || request.status === 'completed'}
                        style={{
                          padding: '10px 20px',
                          background: request.status === 'in-progress' ? '#4A6A8A' : 'linear-gradient(135deg, #22D3EE 0%, #00A79D 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: request.status === 'in-progress' || request.status === 'completed' ? 'not-allowed' : 'pointer',
                          opacity: request.status === 'in-progress' || request.status === 'completed' ? 0.5 : 1,
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (request.status !== 'in-progress' && request.status !== 'completed') {
                            e.target.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        Mark In Progress
                      </button>

                      <button
                        onClick={() => updateStatus(request.id, 'completed')}
                        disabled={request.status === 'completed'}
                        style={{
                          padding: '10px 20px',
                          background: request.status === 'completed' ? '#4A6A8A' : 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: request.status === 'completed' ? 'not-allowed' : 'pointer',
                          opacity: request.status === 'completed' ? 0.5 : 1,
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (request.status !== 'completed') {
                            e.target.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        Mark Completed
                      </button>

                      <button
                        onClick={() => updateStatus(request.id, 'cancelled')}
                        disabled={request.status === 'completed' || request.status === 'cancelled'}
                        style={{
                          padding: '10px 20px',
                          background: '#FFFFFF',
                          color: '#333333',
                          border: '2px solid #F4F7F9',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: request.status === 'completed' || request.status === 'cancelled' ? 'not-allowed' : 'pointer',
                          opacity: request.status === 'completed' || request.status === 'cancelled' ? 0.5 : 1,
                          transition: 'transform 0.2s ease, border-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (request.status !== 'completed' && request.status !== 'cancelled') {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.borderColor = '#333333';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.borderColor = '#F4F7F9';
                        }}
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}