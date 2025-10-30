import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Award, Gift, Trophy, Star, X, ArrowLeft } from 'lucide-react';
import TopNavigationBar from '../Dashboard/TopNavigationBar';

export default function RewardsPage() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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



  useEffect(() => {
    const fetchReward = async () => {
      try {
        // Reward eligibility endpoint configurable via .env
        const res = await axios.get(`${process.env.REACT_APP_CHECK_ELIGIBILITY_API}`, { withCredentials: true });
        if (res.data && res.data.reward) {
          setNotifications([{
            id: res.data.reward._id,
            title: "Reward",
            description: res.data.reward.message,
            type: "gift",
            
            time: new Date(res.data.reward.distributedAt).toLocaleString(),
            read: false,
          }]);
        }
      } catch (err) {
        console.error('Error fetching reward:', err);
      }
    };
    fetchReward();
  }, []);

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type) => {
    const iconStyle = { width: 24, height: 24 };
    switch(type) {
      case 'trophy': return <Trophy style={iconStyle} />;
      case 'gift': return <Gift style={iconStyle} />;
      case 'star': return <Star style={iconStyle} />;
      default: return <Award style={iconStyle} />;
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
    
    fontFamily: 'system-ui, -apple-system, sans-serif',
    '@media (max-width: 768px)': {
      padding: '20px 10px',
    },
  };

  const innerWrapperStyle = {
    maxWidth: 800,
    margin: '0 auto',
    '@media (max-width: 768px)': {
      maxWidth: '100%',
    },
  };

  const headerStyle = {
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '@media (max-width: 768px)': {
      marginBottom: 16,
      gap: '8px',
    },
  };

  const backButtonStyle = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    '@media (max-width: 768px)': {
      padding: 4,
    },
  };

  const arrowLeftStyle = {
    size: 28,
    color: "#22D3EE",
    '@media (max-width: 768px)': {
      size: 22,
    },
  };

  const titleStyle = {
    fontSize: 48,
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
    '@media (max-width: 768px)': {
      fontSize: 32,
    },
  };

  const newRewardsTextStyle = {
    fontSize: 18,
    color: '#22D3EE',
    margin: 0,
    '@media (max-width: 768px)': {
      fontSize: 14,
    },
  };

  const notificationsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    '@media (max-width: 768px)': {
      gap: 12,
    },
  };

  const getNotificationStyle = (read) => ({
    background: read ? '#F4F7F9' : '#FFFFFF',
    borderRadius: 16,
    padding: '24px 24px 28px 24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: read ? 'none' : '2px solid #22D3EE',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
    '@media (max-width: 768px)': {
      padding: 16,
      borderRadius: 12,
    },
  });

  const removeButtonStyle = {
    position: 'absolute',
    top: 16,
    right: 16,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#4A6A8A',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s',
    '@media (max-width: 768px)': {
      top: 12,
      right: 12,
      padding: 2,
    },
  };

  const iconWrapperStyle = {
    background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    '@media (max-width: 768px)': {
      padding: 8,
      borderRadius: 8,
    },
  };

  const notificationContentStyle = {
    flex: 1,
  };

  const notificationHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    '@media (max-width: 768px)': {
      gap: 8,
      marginBottom: 6,
    },
  };

  const notificationTitleStyle = {
    fontSize: 20,
    fontWeight: 600,
    color: '#003366',
    margin: 0,
    '@media (max-width: 768px)': {
      fontSize: 16,
    },
  };

  const newBadgeStyle = {
    background: '#22D3EE',
    color: '#FFFFFF',
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 12,
    fontWeight: 600,
    '@media (max-width: 768px)': {
      fontSize: 10,
      padding: '1px 6px',
    },
  };

  const notificationDescriptionStyle = {
    fontSize: 15,
    color: '#333333',
    margin: 0,
    marginBottom: 12,
    lineHeight: 1.5,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    maxWidth: '100%',
    display: 'block',
    whiteSpace: 'pre-wrap',
    '@media (max-width: 768px)': {
      fontSize: 13,
      marginBottom: 8,
    },
  };

  const notificationFooterStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const notificationTimeStyle = {
    fontSize: 13,
    color: '#4A6A8A',
    '@media (max-width: 768px)': {
      fontSize: 11,
    },
  };

  const noRewardsContainerStyle = {
    textAlign: 'center',
    padding: 60,
    background: '#FFFFFF',
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    '@media (max-width: 768px)': {
      padding: 40,
      borderRadius: 12,
    },
  };

  const noRewardsIconStyle = {
    width: 64,
    height: 64,
    color: '#4A6A8A',
    margin: '0 auto 16px',
    '@media (max-width: 768px)': {
      width: 48,
      height: 48,
      marginBottom: 12,
    },
  };

  const noRewardsTitleStyle = {
    fontSize: 24,
    fontWeight: 600,
    color: '#003366',
    margin: 0,
    marginBottom: 8,
    '@media (max-width: 768px)': {
      fontSize: 18,
      marginBottom: 6,
    },
  };

  const noRewardsTextStyle = {
    fontSize: 16,
    color: '#333333',
    margin: 0,
    '@media (max-width: 768px)': {
      fontSize: 14,
    },
  };

  return (
    <div style={containerStyle}>
      <TopNavigationBar user={user} onLogout={handleLogout} navItems={navItems} />
      <style>
        {`
          @media (max-width: 768px) {
            div[style*="min-height: 100vh"] {
              padding: 20px 10px !important;
            }
            div[style*="max-width: 800px"] {
              max-width: 100% !important;
            }
            h1 {
              font-size: 32px !important;
            }
            p {
              font-size: 14px !important;
            }
            button[style*="padding: 0"] {
              padding: 4px !important;
            }
            div[style*="padding: 24px"] {
              padding: 16px !important;
              border-radius: 12px !important;
            }
            button[style*="top: 16px"] {
              top: 12px !important;
              right: 12px !important;
              padding: 2px !important;
            }
            h3 {
              font-size: 16px !important;
            }
            span[style*="font-size: 12px"] {
              font-size: 10px !important;
              padding: 1px 6px !important;
            }
            p[style*="font-size: 15px"] {
              font-size: 13px !important;
              margin-bottom: 8px !important;
            }
            span[style*="font-size: 13px"] {
              font-size: 11px !important;
            }
            div[style*="padding: 60px"] {
              padding: 40px !important;
              border-radius: 12px !important;
            }
            svg[style*="width: 64px"] {
              width: 48px !important;
              height: 48px !important;
              margin-bottom: 12px !important;
            }
            h3[style*="font-size: 24px"] {
              font-size: 18px !important;
              margin-bottom: 6px !important;
            }
            p[style*="font-size: 16px"] {
              font-size: 14px !important;
            }
          }
        `}
      </style>
      <div style={innerWrapperStyle}>
        <div style={headerStyle}>
          <button onClick={() => navigate('/')} style={backButtonStyle}>
            <ArrowLeft size={window.innerWidth <= 768 ? 22 : 28} color="#22D3EE" />
          </button>
          <h1 style={titleStyle}>Rewards</h1>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 40, '@media (max-width: 768px)': { marginBottom: 24 } }}>
          <p style={newRewardsTextStyle}>You have {notifications.filter(n => !n.read).length} new rewards</p>
        </div>

        <div style={notificationsContainerStyle}>
          {notifications.map(notif => (
            <div key={notif.id} onClick={() => markAsRead(notif.id)} style={getNotificationStyle(notif.read)} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}>
              <button onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }} style={removeButtonStyle} onMouseEnter={(e) => { e.currentTarget.style.background = '#F4F7F9'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <X style={{ width: 20, height: 20 }} />
              </button>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, '@media (max-width: 768px)': { gap: 12 } }}>
                <div style={iconWrapperStyle}>
                  {getIcon(notif.type)}
                </div>

                <div style={notificationContentStyle}>
                  <div style={notificationHeaderStyle}>
                    <h3 style={notificationTitleStyle}>{notif.title}</h3>
                    {!notif.read && <span style={newBadgeStyle}>NEW</span>}
                  </div>
                  
                  <p style={notificationDescriptionStyle}>{notif.description}</p>
                  
                  <div style={notificationFooterStyle}>
                   
                    <span style={notificationTimeStyle}>{notif.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div style={noRewardsContainerStyle}>
            <Award style={noRewardsIconStyle} />
            <h3 style={noRewardsTitleStyle}>No Rewards Yet</h3>
            <p style={noRewardsTextStyle}>Keep completing tasks to earn rewards!</p>
          </div>
        )}
      </div>
    </div>
  );
}