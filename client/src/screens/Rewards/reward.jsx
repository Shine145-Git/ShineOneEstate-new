import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Award, Gift, Trophy, Star, X, ArrowLeft } from 'lucide-react';

export default function RewardsPage() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={28} color="#22D3EE" />
          </button>
          <h1 style={{ fontSize: 48, fontWeight: 700, color: '#FFFFFF', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>Rewards</h1>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 18, color: '#22D3EE', margin: 0 }}>You have {notifications.filter(n => !n.read).length} new rewards</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {notifications.map(notif => (
            <div key={notif.id} onClick={() => markAsRead(notif.id)} style={{ background: notif.read ? '#F4F7F9' : '#FFFFFF', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: notif.read ? 'none' : '2px solid #22D3EE', position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease', transform: 'translateY(0)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}>
              <button onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: '#4A6A8A', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#F4F7F9'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <X style={{ width: 20, height: 20 }} />
              </button>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)', borderRadius: 12, padding: 12, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getIcon(notif.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#003366', margin: 0 }}>{notif.title}</h3>
                    {!notif.read && <span style={{ background: '#22D3EE', color: '#FFFFFF', fontSize: 12, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>NEW</span>}
                  </div>
                  
                  <p style={{ fontSize: 15, color: '#333333', margin: 0, marginBottom: 12, lineHeight: 1.5 }}>{notif.description}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   
                    <span style={{ fontSize: 13, color: '#4A6A8A' }}>{notif.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, background: '#FFFFFF', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Award style={{ width: 64, height: 64, color: '#4A6A8A', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 24, fontWeight: 600, color: '#003366', margin: 0, marginBottom: 8 }}>No Rewards Yet</h3>
            <p style={{ fontSize: 16, color: '#333333', margin: 0 }}>Keep completing tasks to earn rewards!</p>
          </div>
        )}
      </div>
    </div>
  );
}