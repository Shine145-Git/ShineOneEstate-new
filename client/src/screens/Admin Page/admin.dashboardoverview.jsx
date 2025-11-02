import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Home, DollarSign, Search, Award, Activity, Eye, Bookmark, Star, ChevronDown, ChevronUp } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    topProperties: false,
    recentActivity: true,
    approvedPayments: false,
    searchInsights: false,
    rewards: false
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch admin overview data
      const response = await fetch(`${process.env.REACT_APP_Base_API}/api/admin/overview`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("✅ Admin Overview Data:", data);
      setData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error("❌ Error fetching admin overview:", err);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
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
      backgroundColor: '#F4F7F9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      backgroundColor: '#003366',
      color: '#FFFFFF',
      padding: '24px 32px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: '700',
      margin: '0 0 8px 0'
    },
    headerSubtitle: {
      fontSize: '14px',
      opacity: '0.9',
      margin: 0
    },
    main: {
      padding: '32px',
      maxWidth: '1600px',
      margin: '0 auto'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    },
    statCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
    },
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    statTitle: {
      fontSize: '14px',
      color: '#4A6A8A',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#333333',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '13px',
      color: '#4A6A8A'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#003366',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      cursor: 'pointer',
      userSelect: 'none'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '12px',
      backgroundColor: '#F4F7F9',
      color: '#003366',
      fontWeight: '600',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #00A79D'
    },
    td: {
      padding: '16px 12px',
      borderBottom: '1px solid #F4F7F9',
      fontSize: '14px',
      color: '#333333'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    chartGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    chartBar: {
      height: '32px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: '14px',
      marginBottom: '12px',
      transition: 'transform 0.2s'
    },
    propertyCard: {
      backgroundColor: '#F4F7F9',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#F4F7F9'
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: '4px solid #F4F7F9',
      borderTop: '4px solid #003366',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    errorContainer: {
      padding: '32px',
      textAlign: 'center'
    },
    errorCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '48px',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    button: {
      backgroundColor: '#00A79D',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <h2 style={{ color: '#003366', marginBottom: '16px' }}>Error Loading Dashboard</h2>
          <p style={{ color: '#4A6A8A', marginBottom: '24px' }}>{error}</p>
          <button style={styles.button} onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, charts, recentActivity, approvedPayments } = data;

  const StatCard = ({ title, value, subtitle, icon: Icon, color, gradient }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div
        style={{
          ...styles.statCard,
          ...(isHovered ? styles.statCardHover : {})
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={styles.statHeader}>
          <div style={styles.statTitle}>{title}</div>
          <div style={{ ...styles.statIcon, background: gradient }}>
            <Icon size={20} color="#FFFFFF" />
          </div>
        </div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{subtitle}</div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Dashboard Overview</h1>
        <p style={styles.headerSubtitle}>
          Last updated: {new Date().toLocaleString('en-IN')}
        </p>
      </header>

      <main style={styles.main}>
        {/* Key Metrics */}
        <div style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={summary.totalUsers.toLocaleString()}
            subtitle={`${summary.renters} Renters • ${summary.owners} Owners • ${summary.admins} Admins`}
            icon={Users}
            gradient="linear-gradient(135deg, #003366 0%, #4A6A8A 100%)"
          />
          <StatCard
            title="Properties"
            value={summary.totalProperties.toLocaleString()}
            subtitle={`${summary.rentalCount} Rental • ${summary.saleCount} Sale`}
            icon={Home}
            gradient="linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(summary.totalRevenue)}
            subtitle={`${summary.completedPayments + summary.approvedPayments} Transactions`}
            icon={DollarSign}
            gradient="linear-gradient(135deg, #22D3EE 0%, #00A79D 100%)"
          />
          <StatCard
            title="Active Users"
            value={summary.activeUsersCount.toLocaleString()}
            subtitle={`${summary.inactiveUsersCount} Inactive Users`}
            icon={Activity}
            gradient="linear-gradient(135deg, #4A6A8A 0%, #003366 100%)"
          />
          <StatCard
            title="AI Users"
            value={summary.aiUsersCount.toLocaleString()}
            subtitle={`${summary.totalSearches} Total Searches`}
            icon={Search}
            gradient="linear-gradient(135deg, #003366 0%, #00A79D 100%)"
          />
          <StatCard
            title="Rewards"
            value={summary.totalRewardsDistributed.toLocaleString()}
            subtitle={`${charts.rewards.unclaimedRewards} Unclaimed`}
            icon={Award}
            gradient="linear-gradient(135deg, #00A79D 0%, #4A6A8A 100%)"
          />
          <StatCard
            title="Avg Property Rating"
            value={summary.averagePropertyRating.toFixed(1)}
            subtitle={`${charts.engagement.totalRatings} Total Ratings`}
            icon={Star}
            gradient="linear-gradient(135deg, #22D3EE 0%, #003366 100%)"
          />
          <StatCard
            title="Property Views"
            value={charts.engagement.totalViews.toLocaleString()}
            subtitle={`${charts.engagement.totalSaves} Saves`}
            icon={Eye}
            gradient="linear-gradient(135deg, #4A6A8A 0%, #22D3EE 100%)"
          />
        </div>

        {/* Payment Status Overview */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <DollarSign size={24} color="#00A79D" />
            Payment Overview
          </h2>
          <div style={styles.statsGrid}>
            <div style={{ ...styles.propertyCard, backgroundColor: '#FFF9E6', border: '2px solid #FFD700' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '4px' }}>Pending</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#333333' }}>
                  {summary.pendingPayments}
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#4A6A8A' }}>
                {formatCurrency(summary.totalRevenuePending)}
              </div>
            </div>
            <div style={{ ...styles.propertyCard, backgroundColor: '#E6F7FF', border: '2px solid #22D3EE' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '4px' }}>Approved</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#333333' }}>
                  {summary.approvedPayments}
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#4A6A8A' }}>
                {formatCurrency(summary.totalRevenueApproved)}
              </div>
            </div>
            <div style={{ ...styles.propertyCard, backgroundColor: '#E6FFF9', border: '2px solid #00A79D' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '4px' }}>Completed</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#333333' }}>
                  {summary.completedPayments}
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#4A6A8A' }}>
                {formatCurrency(summary.totalRevenueCompleted)}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={styles.chartGrid}>
          {/* Revenue by Method */}
          <div style={styles.card}>
            <h3 style={{ ...styles.sectionTitle, fontSize: '18px' }}>Revenue by Payment Method</h3>
            {Object.entries(charts.revenueByMethod).map(([method, data]) => {
              const maxRevenue = Math.max(...Object.values(charts.revenueByMethod).map(d => d.totalAmount));
              const percentage = (data.totalAmount / maxRevenue) * 100;
              
              return (
                <div key={method} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600', color: '#333333' }}>{method}</span>
                    <span style={{ color: '#00A79D', fontWeight: '600' }}>{formatCurrency(data.totalAmount)}</span>
                  </div>
                  <div style={{ backgroundColor: '#F4F7F9', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #00A79D 0%, #22D3EE 100%)',
                        borderRadius: '10px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#4A6A8A', marginTop: '4px' }}>
                    {data.count} transactions • Avg: {formatCurrency(data.avgAmount)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Growth */}
          <div style={styles.card}>
            <h3 style={{ ...styles.sectionTitle, fontSize: '18px' }}>User Growth (Last 12 Months)</h3>
            {charts.userGrowth.slice(-6).map((item, index) => {
              const maxUsers = Math.max(...charts.userGrowth.map(d => d.count));
              const percentage = (item.count / maxUsers) * 100;
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              
              return (
                <div key={index} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600', color: '#333333' }}>
                      {monthNames[item.month - 1]} {item.year}
                    </span>
                    <span style={{ color: '#003366', fontWeight: '600' }}>{item.count} users</span>
                  </div>
                  <div style={{ backgroundColor: '#F4F7F9', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #003366 0%, #4A6A8A 100%)',
                        borderRadius: '10px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Searches */}
        <div style={styles.card}>
          <div 
            style={styles.cardHeader}
            onClick={() => toggleSection('searchInsights')}
          >
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
              <Search size={24} color="#00A79D" />
              Search Insights
            </h2>
            {expandedSections.searchInsights ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
          
          {expandedSections.searchInsights && (
            <div style={styles.chartGrid}>
              <div>
                <h3 style={{ fontSize: '16px', color: '#003366', marginBottom: '16px' }}>Top Search Queries</h3>
                {charts.searchInsights.topSearches.slice(0, 10).map((search, index) => (
                  <div key={index} style={{ ...styles.propertyCard, marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#333333' }}>
                      {index + 1}. {search.query}
                    </span>
                    <span style={{ ...styles.badge, backgroundColor: '#22D3EE', color: '#FFFFFF' }}>
                      {search.count} searches
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', color: '#003366', marginBottom: '16px' }}>Most Searched Locations</h3>
                {charts.searchInsights.mostSearchedLocations.map((location, index) => (
                  <div key={index} style={{ ...styles.propertyCard, marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#333333' }}>
                      {index + 1}. {location.location}
                    </span>
                    <span style={{ ...styles.badge, backgroundColor: '#00A79D', color: '#FFFFFF' }}>
                      {location.count} searches
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#F4F7F9', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '4px' }}>
                    Average Searches per User
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#003366' }}>
                    {charts.searchInsights.avgSearchesPerUser.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div style={styles.card}>
          <div 
            style={styles.cardHeader}
            onClick={() => toggleSection('recentActivity')}
          >
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
              <Activity size={24} color="#00A79D" />
              Recent Activity
            </h2>
            {expandedSections.recentActivity ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
          
          {expandedSections.recentActivity && (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>Details</th>
                    <th style={styles.th}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.slice(0, 15).map((activity, index) => (
                    <tr key={index}>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: activity.type === 'user' ? '#003366' : 
                                         activity.type === 'property' ? '#00A79D' : '#22D3EE',
                          color: '#FFFFFF'
                        }}>
                          {activity.type}
                        </span>
                      </td>
                      <td style={styles.td}>{activity.user}</td>
                      <td style={styles.td}>{activity.action}</td>
                      <td style={styles.td}>{activity.location}</td>
                      <td style={styles.td}>{formatDate(activity.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Approved Payments */}
        {approvedPayments && approvedPayments.length > 0 && (
          <div style={styles.card}>
            <div 
              style={styles.cardHeader}
              onClick={() => toggleSection('approvedPayments')}
            >
              <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
                <DollarSign size={24} color="#00A79D" />
                Approved Payments ({summary.approvedPaymentsThisMonth} this month)
              </h2>
              {expandedSections.approvedPayments ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
            
            {expandedSections.approvedPayments && (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Resident</th>
                      <th style={styles.th}>Property</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Method</th>
                      <th style={styles.th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedPayments.map((payment, index) => (
                      <tr key={index}>
                        <td style={styles.td}>{payment.resident?.email || 'N/A'}</td>
                        <td style={styles.td}>
                          {payment.property ? 
                            `${payment.property.propertyType || 'Property'} - ${payment.property.Sector || payment.property.address || 'N/A'}` 
                            : 'N/A'}
                        </td>
                        <td style={styles.td}>
                          <strong style={{ color: '#00A79D' }}>{formatCurrency(payment.amount)}</strong>
                        </td>
                        <td style={styles.td}>{payment.paymentMethod || 'N/A'}</td>
                        <td style={styles.td}>{formatDate(payment.paymentDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Top Properties */}
        <div style={styles.card}>
          <div 
            style={styles.cardHeader}
            onClick={() => toggleSection('topProperties')}
          >
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
              <Star size={24} color="#00A79D" />
              Top Performing Properties
            </h2>
            {expandedSections.topProperties ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
          
          {expandedSections.topProperties && (
            <div style={styles.chartGrid}>
              {/* Rental Properties */}
              <div>
                <h3 style={{ fontSize: '16px', color: '#003366', marginBottom: '16px' }}>
                  Top Rental Properties
                </h3>
                
                <h4 style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '12px' }}>Most Viewed</h4>
                {charts.propertyStats.topViewedRental.map((item, index) => (
                  item.property && (
                    <div key={index} style={styles.propertyCard}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                          {item.property.propertyType || 'Property'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#4A6A8A' }}>
                          {item.property.Sector || item.property.address || 'N/A'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Eye size={16} color="#00A79D" />
                        <span style={{ fontWeight: '600', color: '#00A79D' }}>
                          {item.viewsCount}
                        </span>
                      </div>
                    </div>
                  )
                ))}

                <h4 style={{ fontSize: '14px', color: '#4A6A8A', margin: '20px 0 12px' }}>Most Saved</h4>
                {charts.propertyStats.topSavedRental.map((item, index) => (
                  item.property && (
                    <div key={index} style={styles.propertyCard}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                          {item.property.propertyType || 'Property'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#4A6A8A' }}>
                          {item.property.Sector || item.property.address || 'N/A'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bookmark size={16} color="#22D3EE" />
                        <span style={{ fontWeight: '600', color: '#22D3EE' }}>
                          {item.savesCount}
                        </span>
                      </div>
                    </div>
                  )
                ))}

                <h4 style={{ fontSize: '14px', color: '#4A6A8A', margin: '20px 0 12px' }}>Top Rated</h4>
                {charts.propertyStats.topRatedRental.map((item, index) => (
                  item.property && (
                    <div key={index} style={styles.propertyCard}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                          {item.property.propertyType || 'Property'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#4A6A8A' }}>
                          {item.property.Sector || item.property.address || 'N/A'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={16} color="#FFD700" />
                        <span style={{ fontWeight: '600', color: '#FFD700' }}>
                          {item.avgRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Sale Properties */}
              <div>
                <h3 style={{ fontSize: '16px', color: '#003366', marginBottom: '16px' }}>
                  Top Sale Properties
                </h3>
                
                <h4 style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '12px' }}>Most Viewed</h4>
                {charts.propertyStats.topViewedSale.map((item, index) => (
                  item.property && (
                    <div key={index} style={styles.propertyCard}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                          {item.property.propertyType || 'Property'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#4A6A8A' }}>
                          {item.property.Sector || item.property.address || 'N/A'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Eye size={16} color="#00A79D" />
                        <span style={{ fontWeight: '600', color: '#00A79D' }}>
                          {item.viewsCount}
                        </span>
                      </div>
                    </div>
                  )
                ))}

                <h4 style={{ fontSize: '14px', color: '#4A6A8A', margin: '20px 0 12px' }}>Most Saved</h4>
                {charts.propertyStats.topSavedSale.map((item, index) => (
                  item.property && (
                    <div key={index} style={styles.propertyCard}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                          {item.property.propertyType || 'Property'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#4A6A8A' }}>
                          {item.property.Sector || item.property.address || 'N/A'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bookmark size={16} color="#22D3EE" />
                        <span style={{ fontWeight: '600', color: '#22D3EE' }}>
                          {item.savesCount}
                        </span>
                      </div>
                    </div>
                  )
                ))}

                <h4 style={{ fontSize: '14px', color: '#4A6A8A', margin: '20px 0 12px' }}>Top Rated</h4>
                {charts.propertyStats.topRatedSale.map((item, index) => (
                  item.property && (
                    <div key={index} style={styles.propertyCard}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                          {item.property.propertyType || 'Property'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#4A6A8A' }}>
                          {item.property.Sector || item.property.address || 'N/A'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={16} color="#FFD700" />
                        <span style={{ fontWeight: '600', color: '#FFD700' }}>
                          {item.avgRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Engagement Metrics */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <Activity size={24} color="#00A79D" />
            Engagement Metrics
          </h2>
          <div style={styles.statsGrid}>
            <div style={styles.propertyCard}>
              <div>
                <div style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '4px' }}>
                  Total Views
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#003366' }}>
                  {charts.engagement.totalViews.toLocaleString()}
                </div>
              </div>
              <Eye size={32} color="#00A79D" />
            </div>
            <div style={styles.propertyCard}>
              <div>
                <div style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '4px' }}>
                  Total Saves
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#003366' }}>
                  {charts.engagement.totalSaves.toLocaleString()}
                </div>
              </div>
              <Bookmark size={32} color="#22D3EE" />
            </div>
            <div style={styles.propertyCard}>
              <div>
                <div style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '4px' }}>
                  Total Ratings
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#003366' }}>
                  {charts.engagement.totalRatings.toLocaleString()}
                </div>
              </div>
              <Star size={32} color="#FFD700" />
            </div>
            <div style={styles.propertyCard}>
              <div>
                <div style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '4px' }}>
                  Avg Engagement Time
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#003366' }}>
                  {charts.engagement.avgEngagementTime ? 
                    `${Math.round(charts.engagement.avgEngagementTime)}s` : 'N/A'}
                </div>
              </div>
              <Activity size={32} color="#4A6A8A" />
            </div>
          </div>
        </div>

        {/* Property Statistics */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <Home size={24} color="#00A79D" />
            Property Statistics
          </h2>
          <div style={styles.chartGrid}>
            <div>
              <h3 style={{ fontSize: '16px', color: '#003366', marginBottom: '16px' }}>
                Rental Properties
              </h3>
              <div style={{ ...styles.propertyCard, marginBottom: '12px' }}>
                <span style={{ color: '#4A6A8A' }}>Total Properties</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#003366' }}>
                  {summary.rentalCount}
                </span>
              </div>
              <div style={{ ...styles.propertyCard, marginBottom: '12px' }}>
                <span style={{ color: '#4A6A8A' }}>Total Views</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#00A79D' }}>
                  {charts.propertyStats.rental.totalViews.toLocaleString()}
                </span>
              </div>
              <div style={{ ...styles.propertyCard, marginBottom: '12px' }}>
                <span style={{ color: '#4A6A8A' }}>Total Saves</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#22D3EE' }}>
                  {charts.propertyStats.rental.totalSaves.toLocaleString()}
                </span>
              </div>
              <div style={{ ...styles.propertyCard, marginBottom: '12px' }}>
                <span style={{ color: '#4A6A8A' }}>Avg Engagement Time</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#4A6A8A' }}>
                  {charts.propertyStats.rental.avgEngagementTime ? 
                    `${Math.round(charts.propertyStats.rental.avgEngagementTime)}s` : 'N/A'}
                </span>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', color: '#003366', marginBottom: '16px' }}>
                Sale Properties
              </h3>
              <div style={{ ...styles.propertyCard, marginBottom: '12px' }}>
                <span style={{ color: '#4A6A8A' }}>Total Properties</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#003366' }}>
                  {summary.saleCount}
                </span>
              </div>
              <div style={{ ...styles.propertyCard, marginBottom: '12px' }}>
                <span style={{ color: '#4A6A8A' }}>Total Views</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#00A79D' }}>
                  {charts.propertyStats.sale.totalViews.toLocaleString()}
                </span>
              </div>
              <div style={{ ...styles.propertyCard, marginBottom: '12px' }}>
                <span style={{ color: '#4A6A8A' }}>Total Saves</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#22D3EE' }}>
                  {charts.propertyStats.sale.totalSaves.toLocaleString()}
                </span>
              </div>
              <div style={{ ...styles.propertyCard, marginBottom: '12px' }}>
                <span style={{ color: '#4A6A8A' }}>Avg Engagement Time</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#4A6A8A' }}>
                  {charts.propertyStats.sale.avgEngagementTime ? 
                    `${Math.round(charts.propertyStats.sale.avgEngagementTime)}s` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div style={styles.card}>
          <div 
            style={styles.cardHeader}
            onClick={() => toggleSection('rewards')}
          >
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
              <Award size={24} color="#00A79D" />
              Rewards System
            </h2>
            {expandedSections.rewards ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
          
          {expandedSections.rewards && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={styles.propertyCard}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '4px' }}>
                      Total Rewards
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#003366' }}>
                      {charts.rewards.totalRewards}
                    </div>
                  </div>
                </div>
                <div style={styles.propertyCard}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#4A6A8A', marginBottom: '4px' }}>
                      Unclaimed Rewards
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#00A79D' }}>
                      {charts.rewards.unclaimedRewards}
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', color: '#003366', marginBottom: '16px' }}>
                Recent Rewards
              </h3>
              {charts.rewards.recentRewards.map((reward, index) => (
                <div key={index} style={{ ...styles.propertyCard, marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333333', marginBottom: '4px' }}>
                      {reward.message}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4A6A8A' }}>
                      {formatDate(reward.createdAt)}
                    </div>
                  </div>
                  <Award size={20} color="#00A79D" />
                </div>
              ))}
            </>
          )}
        </div>

        {/* AI Usage by Role */}
        {Object.keys(charts.aiUsageByRole).length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <Users size={24} color="#00A79D" />
              AI Assistant Usage by Role
            </h2>
            <div style={styles.chartGrid}>
              {Object.entries(charts.aiUsageByRole).map(([role, count]) => {
                const totalAIUsers = Object.values(charts.aiUsageByRole).reduce((a, b) => a + b, 0);
                const percentage = (count / totalAIUsers) * 100;
                
                return (
                  <div key={role} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                      <span style={{ fontWeight: '600', color: '#333333', textTransform: 'capitalize' }}>
                        {role}
                      </span>
                      <span style={{ color: '#00A79D', fontWeight: '600' }}>
                        {count} users ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div style={{ backgroundColor: '#F4F7F9', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: role === 'admin' ? 'linear-gradient(90deg, #003366 0%, #4A6A8A 100%)' :
                                    role === 'owner' ? 'linear-gradient(90deg, #00A79D 0%, #22D3EE 100%)' :
                                    'linear-gradient(90deg, #22D3EE 0%, #4A6A8A 100%)',
                          borderRadius: '10px',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div style={{ 
          marginTop: '32px', 
          padding: '24px', 
          backgroundColor: '#003366', 
          borderRadius: '12px',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '8px' }}>
            Platform Overview
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>
            {summary.totalUsers.toLocaleString()} Users • {summary.totalProperties.toLocaleString()} Properties • {formatCurrency(summary.totalRevenue)} Revenue
          </div>
          <div style={{ fontSize: '12px', opacity: '0.8', marginTop: '8px' }}>
            Average Transaction: {formatCurrency(summary.avgTransactionAmount)}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;