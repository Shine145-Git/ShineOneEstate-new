import { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, TrendingUp, CheckCircle } from 'lucide-react';
import TopNavigationBar from '../Dashboard/TopNavigationBar';

export default function PropertySearchInterface() {
  const [started, setStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleStart = () => { setStarted(true); };
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

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setTimeout(() => {
      if (option === 'Rental') {
        navigate('/AIassistant-Rent');
      } else if (option === 'Sale') {
        navigate('/AIassistant-Sale');
      }
    }, 500);
  };

  // Responsive styles for buttons
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
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

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>ggnHomes Property Search</h1>
          <p style={{ fontSize: '1.25rem', color: '#F4F7F9', lineHeight: '1.8', opacity: 0.9 }}>We will help you find the perfect property for rent or sale, and guide you through every step of your property search journey.</p>
        </div>

        {!started ? (
          <div style={{ position: 'relative', marginBottom: '4rem' }}>
            <button onClick={handleStart} style={{ width: '180px', height: '180px', borderRadius: '20px', background: 'linear-gradient(145deg, #333333, #4A6A8A)', border: 'none', cursor: 'pointer', boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 25px 70px rgba(34,211,238,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'; }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#22D3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(34,211,238,0.5)' }}>
                <div style={{ width: '28px', height: '36px', borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderBottom: '20px solid #003366', transform: 'rotate(-90deg)', marginLeft: '4px' }}></div>
              </div>
              <span style={{ color: '#F4F7F9', fontSize: '1rem', fontWeight: '600', letterSpacing: '1px' }}>Press To Start</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '3rem', marginBottom: '4rem', animation: 'fadeIn 0.5s ease-in', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => handleOptionSelect('Rental')} style={{ width: isMobile ? '200px' : '280px', padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '16px', background: selectedOption === 'Rental' ? '#00A79D' : 'rgba(255,255,255,0.1)', border: '2px solid #22D3EE', cursor: 'pointer', transition: 'all 0.3s', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(34,211,238,0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#22D3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}><Home size={36} color="#003366" /></div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '0.75rem' }}>Rental Property</h3>
              <p style={{ fontSize: '0.95rem', color: '#F4F7F9', lineHeight: '1.6', opacity: 0.9 }}>Search for properties available for rent with flexible terms and conditions</p>
            </button>

            <button onClick={() => handleOptionSelect('Sale')} style={{ width: isMobile ? '200px' : '280px', padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '16px', background: selectedOption === 'Sale' ? '#00A79D' : 'rgba(255,255,255,0.1)', border: '2px solid #22D3EE', cursor: 'pointer', transition: 'all 0.3s', backdropFilter: 'blur(10px)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(34,211,238,0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#22D3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}><Building2 size={36} color="#003366" /></div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '0.75rem' }}>Sale Property</h3>
              <p style={{ fontSize: '0.95rem', color: '#F4F7F9', lineHeight: '1.6', opacity: 0.9 }}>Browse properties available for purchase and find your dream home</p>
            </button>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          maxWidth: '1200px',
          marginTop: '2rem',
          justifyContent: 'center'
        }}>
          <div style={{
            flex: isMobile ? '0 1 calc(50% - 1rem)' : '1',
            textAlign: 'center',
            padding: isMobile ? '1rem' : '1.5rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(34,211,238,0.2)',
            boxSizing: 'border-box'
          }}>
            <div style={{
              width: isMobile ? '50px' : '60px',
              height: isMobile ? '50px' : '60px',
              borderRadius: '12px',
              background: '#22D3EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 15px rgba(34,211,238,0.3)'
            }}>
              <div style={{
                fontSize: isMobile ? '1.25rem' : '1.75rem',
                fontWeight: '700',
                color: '#003366'
              }}>01</div>
            </div>
            <h4 style={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              fontWeight: '600',
              color: '#22D3EE',
              marginBottom: '0.5rem',
              letterSpacing: '1px'
            }}>EXPERT GUIDANCE</h4>
            <p style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              color: '#F4F7F9',
              lineHeight: '1.6',
              opacity: 0.8
            }}>Our team of property experts will guide you through the entire search process</p>
          </div>

          <div style={{
            flex: isMobile ? '0 1 calc(50% - 1rem)' : '1',
            textAlign: 'center',
            padding: isMobile ? '1rem' : '1.5rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(34,211,238,0.2)',
            boxSizing: 'border-box'
          }}>
            <div style={{
              width: isMobile ? '50px' : '60px',
              height: isMobile ? '50px' : '60px',
              borderRadius: '12px',
              background: '#22D3EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 15px rgba(34,211,238,0.3)'
            }}>
              <div style={{
                fontSize: isMobile ? '1.25rem' : '1.75rem',
                fontWeight: '700',
                color: '#003366'
              }}>02</div>
            </div>
            <h4 style={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              fontWeight: '600',
              color: '#22D3EE',
              marginBottom: '0.5rem',
              letterSpacing: '1px'
            }}>VERIFIED LISTINGS</h4>
            <p style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              color: '#F4F7F9',
              lineHeight: '1.6',
              opacity: 0.8
            }}>Browse through verified property listings with accurate details and pricing</p>
          </div>

          <div style={{
            flex: isMobile ? '0 1 calc(50% - 1rem)' : '1',
            textAlign: 'center',
            padding: isMobile ? '1rem' : '1.5rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(34,211,238,0.2)',
            boxSizing: 'border-box'
          }}>
            <div style={{
              width: isMobile ? '50px' : '60px',
              height: isMobile ? '50px' : '60px',
              borderRadius: '12px',
              background: '#22D3EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 15px rgba(34,211,238,0.3)'
            }}>
              <div style={{
                fontSize: isMobile ? '1.25rem' : '1.75rem',
                fontWeight: '700',
                color: '#003366'
              }}>03</div>
            </div>
            <h4 style={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              fontWeight: '600',
              color: '#22D3EE',
              marginBottom: '0.5rem',
              letterSpacing: '1px'
            }}>94% SUCCESS RATE</h4>
            <p style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              color: '#F4F7F9',
              lineHeight: '1.6',
              opacity: 0.8
            }}>Property seekers using our platform have a higher chance of finding their ideal property</p>
          </div>
        </div>

        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </main>
    </div>
  );
}