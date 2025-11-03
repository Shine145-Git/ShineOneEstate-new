import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, User, Home, Search, DollarSign, Star, Award, Calendar, Phone, Mail } from 'lucide-react';

const UserManagementDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [expandedProperties, setExpandedProperties] = useState({});

  // Toggle state for expanded AI Assistant preferences per user
  const [expandedAIUsers, setExpandedAIUsers] = useState({});

  // State to store each user's reward activity summary
  const [userRewards, setUserRewards] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(process.env.REACT_APP_ADMIN_GET_USERS_API, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reward activity summary for a specific user
  const fetchUserRewards = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API}/api/admin/rewards/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setUserRewards(prev => ({
        ...prev,
        [userId]: {
          active: data.activeCount || 0,
          inactive: data.inactiveCount || 0,
          rewards: data.rewards || [],
        }
      }));
    } catch (error) {
      console.error("Error fetching rewards:", error);
    }
  };

  // Toggle expansion and fetch rewards if expanding
  const toggleUserExpansion = (index) => {
    setExpandedUsers(prev => {
      const isExpanding = !prev[index];
      if (isExpanding) {
        fetchUserRewards(users[index]._id);
      }
      return {
        ...prev,
        [index]: isExpanding
      };
    });
  };

  const togglePropertyExpansion = (userIndex, propertyIndex) => {
    const key = `${userIndex}-${propertyIndex}`;
    setExpandedProperties(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F4F7F9 0%, #FFFFFF 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      maxWidth: '1400px',
      margin: '0 auto 40px',
      textAlign: 'center'
    },
    title: {
      fontSize: '42px',
      fontWeight: '700',
      color: '#003366',
      marginBottom: '10px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
    },
    subtitle: {
      fontSize: '18px',
      color: '#4A6A8A',
      fontWeight: '400'
    },
    userGrid: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'grid',
      gap: '24px'
    },
    userCard: {
      background: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 51, 102, 0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      border: '2px solid transparent'
    },
    userCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 30px rgba(0, 51, 102, 0.15)',
      borderColor: '#22D3EE'
    },
    userHeader: {
      background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
      padding: '24px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    userHeaderContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flex: 1
    },
    userAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontSize: '24px',
      fontWeight: '700',
      boxShadow: '0 4px 12px rgba(34, 211, 238, 0.3)'
    },
    userInfo: {
      flex: 1
    },
    userName: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: '6px'
    },
    userRole: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      background: '#22D3EE',
      color: '#003366'
    },
    expandButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '8px',
      padding: '10px',
      cursor: 'pointer',
      color: '#FFFFFF',
      transition: 'all 0.3s ease'
    },
    userDetails: {
      padding: '0',
      maxHeight: '0',
      overflow: 'hidden',
      transition: 'all 0.4s ease'
    },
    userDetailsExpanded: {
      maxHeight: '5000px',
      padding: '24px'
    },
    section: {
      marginBottom: '28px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#003366',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      paddingBottom: '10px',
      borderBottom: '2px solid #22D3EE'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    },
    infoItem: {
      background: '#F4F7F9',
      padding: '16px',
      borderRadius: '10px',
      border: '1px solid #E0E7EE'
    },
    infoLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#4A6A8A',
      marginBottom: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoValue: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333'
    },
    propertyDropdown: {
      background: '#F4F7F9',
      borderRadius: '12px',
      marginBottom: '12px',
      overflow: 'hidden',
      border: '2px solid #E0E7EE',
      transition: 'all 0.3s ease'
    },
    propertyDropdownActive: {
      borderColor: '#00A79D'
    },
    propertyHeader: {
      padding: '16px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#FFFFFF'
    },
    propertyTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#003366',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    propertyType: {
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      marginLeft: '10px'
    },
    rentalType: {
      background: '#00A79D',
      color: '#FFFFFF'
    },
    saleType: {
      background: '#22D3EE',
      color: '#003366'
    },
    propertyDetails: {
      padding: '0 16px',
      maxHeight: '0',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    propertyDetailsExpanded: {
      maxHeight: '1000px',
      padding: '16px'
    },
    statBox: {
      background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
      padding: '20px',
      borderRadius: '12px',
      color: '#FFFFFF',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0, 167, 157, 0.3)'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '14px',
      fontWeight: '500',
      opacity: '0.9'
    },
    searchItem: {
      background: '#FFFFFF',
      padding: '14px',
      borderRadius: '8px',
      marginBottom: '10px',
      border: '1px solid #E0E7EE',
      transition: 'all 0.2s ease'
    },
    searchItemHover: {
      borderColor: '#00A79D',
      transform: 'translateX(4px)'
    },
    paymentItem: {
      background: '#FFFFFF',
      padding: '16px',
      borderRadius: '10px',
      marginBottom: '12px',
      border: '2px solid #E0E7EE'
    },
    loading: {
      textAlign: 'center',
      fontSize: '20px',
      color: '#4A6A8A',
      padding: '100px 20px'
    },
    error: {
      textAlign: 'center',
      fontSize: '18px',
      color: '#DC2626',
      padding: '50px 20px',
      background: '#FEE2E2',
      borderRadius: '12px',
      maxWidth: '600px',
      margin: '50px auto'
    },
    emptyState: {
      textAlign: 'center',
      padding: '50px 20px',
      color: '#4A6A8A',
      fontSize: '16px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          Loading user data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management Dashboard</h1>
        <p style={styles.subtitle}>Comprehensive overview of all registered users and their activities</p>
      </div>

      <div style={styles.userGrid}>
        {users.length === 0 ? (
          <div style={styles.emptyState}>No users found</div>
        ) : (
          users.map((user, userIndex) => (
            <div
              key={userIndex}
              style={{
                ...styles.userCard,
                ...(expandedUsers[userIndex] ? styles.userCardHover : {})
              }}
            >
              <div
                style={styles.userHeader}
                onClick={() => toggleUserExpansion(userIndex)}
              >
                <div style={styles.userHeaderContent}>
                  <div style={styles.userAvatar}>
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={styles.userInfo}>
                    <div style={styles.userName}>{user.email || 'No Email'}</div>
                    <span style={styles.userRole}>{user.role || 'User'}</span>
                  </div>
                </div>
                <button style={styles.expandButton}>
                  {expandedUsers[userIndex] ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              <div style={{
                ...styles.userDetails,
                ...(expandedUsers[userIndex] ? styles.userDetailsExpanded : {})
              }}>
                {/* Basic Information */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>
                    <User size={20} />
                    Basic Information
                  </h3>
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <div style={styles.infoLabel}>
                        <Phone size={14} style={{ display: 'inline', marginRight: '6px' }} />
                        Mobile Number
                      </div>
                      <div style={styles.infoValue}>{user.mobileNumber || 'Not provided'}</div>
                    </div>
                    <div style={styles.infoItem}>
                      <div style={styles.infoLabel}>
                        <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                        Registered At
                      </div>
                      <div style={styles.infoValue}>{formatDate(user.registeredAt)}</div>
                    </div>
                  </div>
                </div>

                {/* AI Assistant Usage */}
                {user.aiAssistantUsage && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                      🤖 AI Assistant Usage
                    </h3>
                    <div style={styles.infoGrid}>
                      <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Email</div>
                        <div style={styles.infoValue}>{user.aiAssistantUsage.email || 'N/A'}</div>
                      </div>
                      <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Last Used</div>
                        <div style={styles.infoValue}>
                          {user.aiAssistantUsage.updatedAt
                            ? formatDate(user.aiAssistantUsage.updatedAt)
                            : user.aiAssistantUsage.createdAt
                            ? formatDate(user.aiAssistantUsage.createdAt)
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                    {/* Preferences dropdown */}
                    {user.aiAssistantUsage.preferences && (
                      <div style={{
                        marginTop: '10px',
                        background: '#FFFFFF',
                        borderRadius: '10px',
                        border: '1px solid #E0E7EE',
                        overflow: 'hidden',
                      }}>
                        <div
                          style={{
                            padding: '10px 16px',
                            background: '#F4F7F9',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                          onClick={() =>
                            setExpandedAIUsers((prev) => ({
                              ...prev,
                              [user._id]: !prev[user._id],
                            }))
                          }
                        >
                          <div style={{ fontWeight: '600', color: '#003366' }}>User Preferences</div>
                          {expandedAIUsers[user._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>

                        <div
                          style={{
                            maxHeight: expandedAIUsers[user._id] ? '500px' : '0',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            padding: expandedAIUsers[user._id] ? '10px 16px' : '0 16px',
                            background: '#FFFFFF',
                          }}
                        >
                          {(user.aiAssistantUsage.preferences) ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                              {/* Rental Preferences */}
                              <div style={{ background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E0E7EE', padding: '12px' }}>
                                <h4 style={{ color: '#003366', fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>Rental Preferences</h4>
                                {user.aiAssistantUsage.assistantType === 'rental' ? (
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <tbody>
                                      {Object.entries(user.aiAssistantUsage.preferences).map(([key, value], idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #E0E7EE' }}>
                                          <td style={{ padding: '8px', fontWeight: '600', color: '#003366', textTransform: 'capitalize' }}>{key}</td>
                                          <td style={{ padding: '8px', color: '#4A6A8A' }}>{Array.isArray(value) ? value.join(', ') : value || 'N/A'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div style={{ color: '#4A6A8A', fontSize: '14px' }}>No rental preferences available</div>
                                )}
                              </div>

                              {/* Sale Preferences */}
                              <div style={{ background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E0E7EE', padding: '12px' }}>
                                <h4 style={{ color: '#003366', fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>Sale Preferences</h4>
                                {user.aiAssistantUsage.assistantType === 'sale' ? (
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <tbody>
                                      {Object.entries(user.aiAssistantUsage.preferences).map(([key, value], idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #E0E7EE' }}>
                                          <td style={{ padding: '8px', fontWeight: '600', color: '#003366', textTransform: 'capitalize' }}>{key}</td>
                                          <td style={{ padding: '8px', color: '#4A6A8A' }}>{Array.isArray(value) ? value.join(', ') : value || 'N/A'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div style={{ color: '#4A6A8A', fontSize: '14px' }}>No sale preferences available</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div style={{ color: '#4A6A8A', fontSize: '14px' }}>No preferences available</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Rewards */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>
                    <Award size={20} />
                    Rewards & Achievements
                  </h3>
                  <div style={styles.infoGrid}>
                    <div style={styles.statBox}>
                      <div style={styles.statValue}>{user.rewards?.count || 0}</div>
                      <div style={styles.statLabel}>Total Rewards</div>
                    </div>
                    {user.rewards?.latestMessage && (
                      <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Latest Reward</div>
                        <div style={styles.infoValue}>{user.rewards.latestMessage}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reward Activity (updated section) */}
                {userRewards[user._id] && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                      <Award size={20} />
                      Reward Activity
                    </h3>
                    <div style={styles.infoGrid}>
                      <div style={styles.statBox}>
                        <div style={styles.statValue}>{userRewards[user._id].active}</div>
                        <div style={styles.statLabel}>Active Rewards</div>
                      </div>
                      <div style={styles.statBox}>
                        <div style={{ ...styles.statValue, color: '#DC2626' }}>{userRewards[user._id].inactive}</div>
                        <div style={styles.statLabel}>Inactive Rewards</div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: '20px',
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #E0E7EE',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#003366',
                          marginBottom: '12px',
                        }}
                      >
                        Reward Details
                      </h4>

                      {userRewards[user._id].rewards && userRewards[user._id].rewards.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                              <tr style={{ background: '#F4F7F9', textAlign: 'left' }}>
                                <th style={{ padding: '10px', color: '#003366' }}>Message</th>
                                <th style={{ padding: '10px', color: '#003366' }}>Distributed At</th>
                                <th style={{ padding: '10px', color: '#003366' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userRewards[user._id].rewards.map((reward, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #E0E7EE' }}>
                                  <td style={{ padding: '10px', color: '#333' }}>{reward.message}</td>
                                  <td style={{ padding: '10px', color: '#4A6A8A' }}>
                                    {formatDate(reward.distributedAt)}
                                  </td>
                                  <td
                                    style={{
                                      padding: '10px',
                                      fontWeight: '600',
                                      color: reward.isActive ? '#00A79D' : '#DC2626',
                                    }}
                                  >
                                    {reward.isActive ? '🟢 Active' : '🔴 Inactive'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ color: '#4A6A8A', fontSize: '14px' }}>No rewards available</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Engagement Stats */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>
                    📊 Engagement Statistics
                  </h3>
                  <div style={styles.infoGrid}>
                    <div style={styles.statBox}>
                      <div style={styles.statValue}>{user.engagementStats?.totalViews || 0}</div>
                      <div style={styles.statLabel}>Total Views</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statValue}>{user.engagementStats?.totalSaves || 0}</div>
                      <div style={styles.statLabel}>Total Saves</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statValue}>{user.engagementStats?.ratingsCount || 0}</div>
                      <div style={styles.statLabel}>Ratings Count</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statValue}>
                        {user.averageRatingGiven ? user.averageRatingGiven.toFixed(1) : 'N/A'}
                      </div>
                      <div style={styles.statLabel}>Avg Rating Given</div>
                    </div>
                  </div>
                </div>

                {/* Search History */}
                {user.searchHistory && user.searchHistory.length > 0 && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                      <Search size={20} />
                      Search History ({user.searchHistory.length})
                    </h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {user.searchHistory.map((search, idx) => (
                        <div key={idx} style={styles.searchItem}>
                          <div style={{ fontWeight: '600', color: '#003366', marginBottom: '4px' }}>
                            {search.query}
                          </div>
                          <div style={{ fontSize: '13px', color: '#4A6A8A' }}>
                            {formatDate(search.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Properties Posted */}
                {user.propertiesPosted && user.propertiesPosted.length > 0 && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                      <Home size={20} />
                      Properties Posted ({user.propertiesPosted.length})
                    </h3>
                    {user.propertiesPosted.map((property, propIndex) => {
                      const key = `${userIndex}-${propIndex}`;
                      const isRental = property.monthlyRent !== undefined;
                      
                      return (
                        <div
                          key={propIndex}
                          style={{
                            ...styles.propertyDropdown,
                            ...(expandedProperties[key] ? styles.propertyDropdownActive : {})
                          }}
                        >
                          <div
                            style={styles.propertyHeader}
                            onClick={() => togglePropertyExpansion(userIndex, propIndex)}
                          >
                            <div style={styles.propertyTitle}>
                              <Home size={18} />
                              Property {propIndex + 1}
                              <span style={{
                                ...styles.propertyType,
                                ...(isRental ? styles.rentalType : styles.saleType)
                              }}>
                                {isRental ? 'RENTAL' : 'SALE'}
                              </span>
                            </div>
                            {expandedProperties[key] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                          <div style={{
                            ...styles.propertyDetails,
                            ...(expandedProperties[key] ? styles.propertyDetailsExpanded : {})
                          }}>
                            <div style={styles.infoGrid}>
                              {isRental ? (
                                <>
                                  <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>Monthly Rent</div>
                                    <div style={styles.infoValue}>
                                      ₹{property.monthlyRent?.toLocaleString() || 'N/A'}
                                    </div>
                                  </div>
                                  <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>Address</div>
                                    <div style={styles.infoValue}>{property.address  + property.Sector|| 'N/A'}</div>
                                  </div>
                                  {property.locality && (
                                    <div style={styles.infoItem}>
                                      <div style={styles.infoLabel}>Locality</div>
                                      <div style={styles.infoValue}>{property.locality}</div>
                                    </div>
                                  )}
                                  {property.propertyType && (
                                    <div style={styles.infoItem}>
                                      <div style={styles.infoLabel}>Property Type</div>
                                      <div style={styles.infoValue}>{property.propertyType}</div>
                                    </div>
                                  )}
                                  {property.bhkType && (
                                    <div style={styles.infoItem}>
                                      <div style={styles.infoLabel}>BHK Type</div>
                                      <div style={styles.infoValue}>{property.bhkType}</div>
                                    </div>
                                  )}
                                  {property.furnishing && (
                                    <div style={styles.infoItem}>
                                      <div style={styles.infoLabel}>Furnishing</div>
                                      <div style={styles.infoValue}>{property.furnishing}</div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>Price</div>
                                    <div style={styles.infoValue}>
                                      ₹{property.price?.toLocaleString() || 'N/A'}
                                    </div>
                                  </div>
                                  <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>Location</div>
                                    <div style={styles.infoValue}>{property.location || 'N/A'}</div>
                                  </div>
                                  {property.propertyType && (
                                    <div style={styles.infoItem}>
                                      <div style={styles.infoLabel}>Property Type</div>
                                      <div style={styles.infoValue}>{property.propertyType}</div>
                                    </div>
                                  )}
                                  {property.bhkType && (
                                    <div style={styles.infoItem}>
                                      <div style={styles.infoLabel}>BHK Type</div>
                                      <div style={styles.infoValue}>{property.bhkType}</div>
                                    </div>
                                  )}
                                  {property.area && (
                                    <div style={styles.infoItem}>
                                      <div style={styles.infoLabel}>Area</div>
                                      <div style={styles.infoValue}>{property.area} sq ft</div>
                                    </div>
                                  )}
                                </>
                              )}
                              {property.createdAt && (
                                <div style={styles.infoItem}>
                                  <div style={styles.infoLabel}>Posted On</div>
                                  <div style={styles.infoValue}>{formatDate(property.createdAt)}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Payments */}
                {user.payments && user.payments.length > 0 && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                      <DollarSign size={20} />
                      Payment History ({user.payments.length})
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {user.payments.map((payment, idx) => (
                        <div key={idx} style={styles.paymentItem}>
                          <div style={styles.infoGrid}>
                            <div style={styles.infoItem}>
                              <div style={styles.infoLabel}>Amount</div>
                              <div style={styles.infoValue}>₹{payment.amount?.toLocaleString() || 'N/A'}</div>
                            </div>
                            <div style={styles.infoItem}>
                              <div style={styles.infoLabel}>Status</div>
                              <div style={styles.infoValue}>{payment.status || 'N/A'}</div>
                            </div>
                            <div style={styles.infoItem}>
                              <div style={styles.infoLabel}>Payment Date</div>
                              <div style={styles.infoValue}>{formatDate(payment.createdAt)}</div>
                            </div>
                            <div style={styles.infoItem}>
                              <div style={styles.infoLabel}>Property Type</div>
                              <div style={styles.infoValue}>{payment.propertyModel || 'N/A'}</div>
                            </div>
                          </div>
                          {payment.property && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E0E7EE' }}>
                              <div style={{ fontWeight: '600', color: '#003366', marginBottom: '8px' }}>
                                Property Details:
                              </div>
                              <div style={styles.infoGrid}>
                                {payment.property.address && (
                                  <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>Address</div>
                                    <div style={styles.infoValue}>{payment.property.address}</div>
                                  </div>
                                )}
                                {payment.property.location && (
                                  <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>Location</div>
                                    <div style={styles.infoValue}>{payment.property.location}</div>
                                  </div>
                                )}
                                {payment.property.monthlyRent && (
                                  <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>Monthly Rent</div>
                                    <div style={styles.infoValue}>
                                      ₹{payment.property.monthlyRent.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                                {payment.property.price && (
                                  <div style={styles.infoItem}>
                                    <div style={styles.infoLabel}>Price</div>
                                    <div style={styles.infoValue}>
                                      ₹{payment.property.price.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManagementDashboard;