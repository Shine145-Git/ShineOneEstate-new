import axios from "axios";
import { useState, useEffect } from 'react';
import { Award, Gift, ArrowRight, Sparkles, Star, Zap } from 'lucide-react';
import TopNavigationBar from "../Dashboard/TopNavigationBar";
import { useNavigate } from "react-router-dom";

export default function RewardsPage() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

const handleLogout = async () => {
    await fetch(process.env.REACT_APP_LOGOUT_API, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/");
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


  // Simulated API calls - replace with your actual API calls
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // const res = await fetch(process.env.REACT_APP_USER_ME_API, {
        //   method: "GET",
        //   credentials: "include",
        // });
        // const data = await res.json();
        // if (res.ok) setUser(data);
        
        // Simulated user data
        setUser({ name: "User" });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchReward = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_CHECK_ELIGIBILITY_API}`, { withCredentials: true });
        if (res.data && res.data.reward) {
          const reward = res.data.reward;
          const formLinkMatch = reward.message.match(/https:\/\/docs\.google\.com\/forms[^\s)]+/);
          const formLink = formLinkMatch ? formLinkMatch[0] : null;

          setNotifications([{
            id: reward._id,
            title: "Reward",
            description: reward.message,
            type: "gift",
            time: reward.distributedAt
              ? new Date(reward.distributedAt).toLocaleString()
              : "N/A",
            read: reward.viewed || false,
            isActive: reward.isActive,
            formLink,
          }]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reward:', err);
        setLoading(false);
      }
    };
    fetchReward();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
        color: '#FFFFFF',
        fontFamily: 'system-ui, sans-serif',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>

  
        {/* Animated background circles */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,167,157,0.2) 0%, transparent 70%)',
          animation: 'pulse 6s ease-in-out infinite',
          animationDelay: '2s',
        }} />
        
        <div style={{
          border: '6px solid rgba(34,211,238,0.3)',
          borderTop: '6px solid #22D3EE',
          borderRadius: '50%',
          width: 70,
          height: 70,
          animation: 'spin 1s linear infinite',
          boxShadow: '0 0 30px rgba(34,211,238,0.5)',
        }} />
        <p style={{ marginTop: 24, fontSize: 20, fontWeight: 600, letterSpacing: '0.5px' }}>
          Loading Your Rewards...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F4F7F9 0%, #FFFFFF 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
     
      position: 'relative',
      overflow: 'hidden',
    }}>
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
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '5%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
        animation: 'float 8s ease-in-out infinite',
        pointerEvents: 'none',
        marginTop: '50px',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: 350,
        height: 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,167,157,0.1) 0%, transparent 70%)',
        animation: 'float 10s ease-in-out infinite',
        animationDelay: '3s',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1200,
        margin: '50 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Split Screen Banner and Expired/No Reward States */}
        {notifications.length > 0 && notifications[0].isActive ? (
          // Active Reward Banner
          <div style={{
            background: '#FFFFFF',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,51,102,0.15)',
            display: 'flex',
            flexDirection: 'row',
            minHeight: 500,
            position: 'relative',
            border: '1px solid rgba(34,211,238,0.2)',
            maxWidth: '100%',
            overflowX: 'hidden',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}>
            {/* Left Side - Visual (60%) */}
            <div style={{
              flex: '0 0 60%',
              background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Animated Background Shapes */}
              <div style={{
                position: 'absolute',
                top: '15%',
                left: '10%',
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(34,211,238,0.15)',
                animation: 'float 6s ease-in-out infinite',
                transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
                transition: 'transform 0.3s ease-out',
              }} />
              <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '15%',
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'rgba(0,167,157,0.15)',
                animation: 'float 8s ease-in-out infinite',
                animationDelay: '2s',
                transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`,
                transition: 'transform 0.3s ease-out',
              }} />
              <div style={{
                position: 'absolute',
                top: '40%',
                right: '20%',
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(244,247,249,0.1)',
                animation: 'float 7s ease-in-out infinite',
                animationDelay: '4s',
              }} />

              {/* Glowing Particles */}
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#22D3EE',
                  top: `${20 + i * 10}%`,
                  left: `${10 + i * 8}%`,
                  animation: `twinkle ${2 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  boxShadow: '0 0 10px #22D3EE',
                }} />
              ))}
              
              {/* Main Gift Illustration */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                animation: 'bounce 3s ease-in-out infinite',
                transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px)`,
                transition: 'transform 0.3s ease-out',
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
                  width: 220,
                  height: 220,
                  borderRadius: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.4), 0 0 60px rgba(34,211,238,0.4)',
                  position: 'relative',
                  transform: 'rotate(45deg)',
                  border: '4px solid rgba(255,255,255,0.2)',
                }}>
                  <Gift style={{
                    width: 110,
                    height: 110,
                    color: '#FFFFFF',
                    transform: 'rotate(-45deg)',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  }} />
                  
                  {/* Ribbon effect */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: 8,
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-50%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: 8,
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateX(-50%)',
                  }} />
                </div>
                
                {/* Orbiting Sparkles */}
                <Sparkles style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 50,
                  height: 50,
                  color: '#22D3EE',
                  animation: 'sparkleOrbit 3s ease-in-out infinite',
                  filter: 'drop-shadow(0 0 8px #22D3EE)',
                }} />
                <Star style={{
                  position: 'absolute',
                  bottom: -25,
                  left: -25,
                  width: 40,
                  height: 40,
                  color: '#00A79D',
                  animation: 'sparkleOrbit 3s ease-in-out infinite',
                  animationDelay: '1.5s',
                  filter: 'drop-shadow(0 0 8px #00A79D)',
                }} />
                <Zap style={{
                  position: 'absolute',
                  top: -20,
                  left: -35,
                  width: 35,
                  height: 35,
                  color: '#F4F7F9',
                  animation: 'sparkleOrbit 3s ease-in-out infinite',
                  animationDelay: '0.75s',
                  filter: 'drop-shadow(0 0 6px #F4F7F9)',
                }} />
              </div>

              {/* Decorative Text with Glow */}
              <div style={{
                position: 'absolute',
                bottom: 50,
                left: 0,
                right: 0,
                textAlign: 'center',
                color: '#FFFFFF',
                fontSize: 20,
                fontWeight: 700,
                opacity: 0.9,
                textShadow: '0 0 20px rgba(34,211,238,0.6), 0 2px 4px rgba(0,0,0,0.3)',
                animation: 'glow 2s ease-in-out infinite',
              }}>
                ✨ Exclusive Goodies Await ✨
              </div>

              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-25px); }
                }
                @keyframes bounce {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-20px); }
                }
                @keyframes sparkleOrbit {
                  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
                  50% { opacity: 0.6; transform: scale(0.8) rotate(180deg); }
                }
                @keyframes twinkle {
                  0%, 100% { opacity: 0.3; transform: scale(1); }
                  50% { opacity: 1; transform: scale(1.5); }
                }
                @keyframes glow {
                  0%, 100% { opacity: 0.9; }
                  50% { opacity: 1; text-shadow: 0 0 30px rgba(34,211,238,0.8), 0 2px 4px rgba(0,0,0,0.3); }
                }
                @keyframes shimmer {
                  0% { background-position: -1000px 0; }
                  100% { background-position: 1000px 0; }
                }
              `}</style>
            </div>

            {/* Right Side - Content (40%) */}
            <div style={{
              flex: '0 0 40%',
              padding: 60,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: '#FFFFFF',
              position: 'relative',
              maxWidth: '100%',
              overflowWrap: 'break-word',
              boxSizing: 'border-box',
              alignItems: 'center',
              textAlign: 'center',
              wordBreak: 'break-word',
            }}>
              {/* Decorative corner element */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                background: 'linear-gradient(135deg, transparent 50%, rgba(34,211,238,0.1) 50%)',
                borderRadius: '0 24px 0 0',
              }} />

              <div style={{
                maxWidth: 400,
                margin: '0 auto',
                width: '100%',
              }}>
                <div style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 24,
                  alignSelf: 'flex-start',
                  boxShadow: '0 4px 15px rgba(34,211,238,0.3)',
                  animation: 'pulse 2s ease-in-out infinite',
                  letterSpacing: '0.5px',
                }}>
                  🎁 NEW REWARD
                </div>

                <h1 style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: '#003366',
                  margin: 0,
                  marginBottom: 24,
                  lineHeight: 1.2,
                  background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  textAlign: 'center',
                }}>
                  Here's something special for you!
                </h1>

                <p style={{
                  fontSize: 17,
                  color: '#333333',
                  lineHeight: 1.8,
                  margin: 0,
                  marginBottom: 32,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}>
                  {notifications[0].description}
                </p>

                <div style={{
                  background: 'linear-gradient(135deg, #F4F7F9 0%, #FFFFFF 100%)',
                  padding: 20,
                  borderRadius: 12,
                  marginBottom: 32,
                  borderLeft: '4px solid #22D3EE',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}>
                  <p style={{
                    fontSize: 14,
                    color: '#4A6A8A',
                    margin: 0,
                    fontWeight: 500,
                  }}>
                    <strong style={{ color: '#003366' }}>Distributed:</strong> {notifications[0].time}
                  </p>
                </div>

                <button
                  disabled={!notifications[0].isActive}
                  style={{
                    background: notifications[0].isActive
                      ? 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)'
                      : '#CBD5E0',
                    color: notifications[0].isActive ? '#FFFFFF' : '#718096',
                    border: 'none',
                    padding: '18px 36px',
                    borderRadius: 12,
                    fontSize: 17,
                    fontWeight: 700,
                    cursor: notifications[0].isActive ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    transition: 'all 0.4s ease',
                    boxShadow: notifications[0].isActive
                      ? '0 6px 20px rgba(34,211,238,0.4)'
                      : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    letterSpacing: '0.5px',
                    width: '100%',
                    maxWidth: 300,
                    alignSelf: 'center',
                  }}
                  onClick={() => {
                    if (notifications[0].isActive && notifications[0].formLink)
                      window.open(notifications[0].formLink, "_blank");
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {notifications[0].isActive ? "Claim Your Reward" : "Reward Expired"}
                  </span>
                  {notifications[0].isActive && (
                    <ArrowRight style={{ width: 22, height: 22, position: 'relative', zIndex: 1 }} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : notifications.length > 0 && !notifications[0].isActive ? (
          // Expired Reward State
          <div style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 80,
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}>
            <Gift style={{ width: 80, height: 80, color: '#cbd5e0', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a202c', marginBottom: 12 }}>Reward Expired</h2>
            <p style={{ fontSize: 16, color: '#718096' }}>This reward is no longer active. Please check back later for new goodies!</p>
          </div>
        ) : (
          // No Rewards State
          <div style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 80,
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,51,102,0.1)',
            border: '1px solid #F4F7F9',
          }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Award style={{
                width: 90,
                height: 90,
                color: '#4A6A8A',
                margin: '0 auto 28px',
                animation: 'float 3s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 140,
                height: 140,
                borderRadius: '50%',
                border: '2px dashed #22D3EE',
                transform: 'translate(-50%, -50%)',
                animation: 'rotate 20s linear infinite',
              }} />
            </div>
            <h2 style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#003366',
              margin: 0,
              marginBottom: 16,
            }}>
              No Rewards Yet
            </h2>
            <p style={{
              fontSize: 17,
              color: '#4A6A8A',
              margin: 0,
            }}>
              Keep completing tasks to unlock exclusive rewards and goodies!
            </p>
            <style>{`
              @keyframes rotate {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Quick Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          marginTop: 50,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
            padding: 35,
            borderRadius: 20,
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.4s ease',
            boxShadow: '0 10px 30px rgba(0,51,102,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,51,102,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,51,102,0.3)';
          }}>
            <div style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(34,211,238,0.1)',
            }} />
            <div style={{ fontSize: 40, marginBottom: 16, position: 'relative', zIndex: 1 }}>🏠</div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, marginBottom: 10, position: 'relative', zIndex: 1 }}>
              Post Your Property
            </h3>
            <p style={{ margin: 0, fontSize: 15, opacity: 0.9, position: 'relative', zIndex: 1 }}>
              List your property in minutes
            </p>
          </div>

          <div style={{
            background: '#FFFFFF',
            padding: 35,
            borderRadius: 20,
            color: '#003366',
            cursor: 'pointer',
            transition: 'all 0.4s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '2px solid #F4F7F9',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.12)';
            e.currentTarget.style.borderColor = '#22D3EE';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
            e.currentTarget.style.borderColor = '#F4F7F9';
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🛠️</div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
              Support
            </h3>
            <p style={{ margin: 0, fontSize: 15, color: '#4A6A8A' }}>
              Need help? Contact support
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
            padding: 35,
            borderRadius: 20,
            color: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(34,211,238,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }} />
            <div style={{ fontSize: 40, marginBottom: 16, position: 'relative', zIndex: 1 }}>🎁</div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, marginBottom: 10, position: 'relative', zIndex: 1 }}>
              Goodies Worth ₹2,000
            </h3>
            <p style={{ margin: 0, fontSize: 15, opacity: 0.95, position: 'relative', zIndex: 1 }}>
              Exclusive for verified users
            </p>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 968px) {
          div[style*="flex: 0 0 60%"] {
            flex: 0 0 100% !important;
            min-height: 350px !important;
          }
          div[style*="flex: 0 0 40%"] {
            flex: 0 0 100% !important;
            padding: 40px 30px !important;
          }
          div[style*="flexDirection: 'row'"] {
            flex-direction: column !important;
          }
        }
        @media (max-width: 640px) {
          h1 {
            font-size: 30px !important;
          }
          div[style*="padding: 60"] {
            padding: 40px 30px !important;
          }
          div[style*="padding: 35"] {
            padding: 25px !important;
          }
        }
      `}</style>
    </div>
  );
}