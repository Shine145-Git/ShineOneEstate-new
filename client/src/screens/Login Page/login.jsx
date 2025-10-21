import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginModal() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [time, setTime] = useState(180);
  const [message, setMessage] = useState(null); // { text: string, type: 'success' | 'error' }
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 'otp' && time > 0) {
      const timer = setTimeout(() => setTime(time - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, time]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      // API endpoint configurable via .env (REACT_APP_LOGIN_REQUEST_OTP_API)
      const response = await fetch(`${process.env.REACT_APP_LOGIN_REQUEST_OTP_API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // only send email for OTP
        credentials: "include" // to send/receive cookies
      });
      const data = await response.json();
      if (response.ok) {
        setStep('otp');
        setTime(180);
        setMessage({ text: data.message, type: 'success' });
      } else {
        setMessage({ text: data.message || "Error sending OTP", type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: "Error sending OTP", type: 'error' });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    try {
      // API endpoint configurable via .env (REACT_APP_LOGIN_VERIFY_OTP_API)
      const response = await fetch(`${process.env.REACT_APP_LOGIN_VERIFY_OTP_API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp , mobileNumber }), // send both email and mobileNumber for verification
        credentials: "include" // to send/receive cookies
      });
      const data = await response.json();
      if (response.ok) {
          setMessage({ text: "OTP Verified!", type: 'success' });
          if (data.role === 'admin') {
            navigate('/admin/properties'); // redirect admin users to admin dashboard
          } else if (data.role === 'renter') {
            navigate('/'); // redirect renter users to their dashboard
          } else {
            navigate('/'); // fallback
          }
          
        // TODO: redirect or store user info/token if needed
      } else {
        setMessage({ text: data.message || "OTP verification failed", type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: "Error verifying OTP", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = () => { const m = Math.floor(time / 60); const s = time % 60; return `${m}:${s.toString().padStart(2, '0')}`; };

  return (
    <div style={{position: 'fixed', inset: 0, background: 'rgba(0, 51, 102, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50}}>
      <div style={{background: '#F4F7F9', borderRadius: '16px', padding: '40px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0, 51, 102, 0.3)'}}>
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <h2 style={{color: '#003366', fontSize: '28px', fontWeight: '700', marginBottom: '8px', textAlign: 'center'}}>Welcome Back</h2>
            {message && (
              <div style={{
                color: message.type === 'success' ? '#16a34a' : '#dc2626',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                {message.text}
              </div>
            )}
            <p style={{color: '#4A6A8A', fontSize: '14px', marginBottom: '32px', textAlign: 'center'}}>Enter your email to continue</p>
            <input
              type="text"
              placeholder="Enter your mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #00A79D',
                borderRadius: '8px',
                fontSize: '16px',
                marginBottom: '24px',
                outline: 'none',
                background: '#FFFFFF',
                color: '#333333',
                transition: 'border 0.3s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#22D3EE')}
              onBlur={(e) => (e.target.style.borderColor = '#00A79D')}
            />
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{width: '100%', padding: '14px 16px', border: '2px solid #00A79D', borderRadius: '8px', fontSize: '16px', marginBottom: '24px', outline: 'none', background: '#FFFFFF', color: '#333333', transition: 'border 0.3s'}} onFocus={(e) => e.target.style.borderColor = '#22D3EE'} onBlur={(e) => e.target.style.borderColor = '#00A79D'} />
            <button type="submit" style={{width: '100%', padding: '14px', background: 'linear-gradient(135deg, #00A79D, #22D3EE)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(0, 167, 157, 0.3)'}} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(0, 167, 157, 0.4)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(0, 167, 157, 0.3)'; }}>Continue</button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <h2 style={{color: '#003366', fontSize: '28px', fontWeight: '700', marginBottom: '8px', textAlign: 'center'}}>Verify OTP</h2>
            {message && (
              <div style={{
                color: message.type === 'success' ? '#16a34a' : '#dc2626',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                {message.text}
              </div>
            )}
            <p style={{color: '#4A6A8A', fontSize: '14px', marginBottom: '24px', textAlign: 'center'}}>Code sent to {email}</p>
            <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required style={{width: '100%', padding: '14px 16px', border: '2px solid #00A79D', borderRadius: '8px', fontSize: '20px', marginBottom: '16px', outline: 'none', background: '#FFFFFF', color: '#333333', letterSpacing: '8px', textAlign: 'center', fontWeight: '600'}} onFocus={(e) => e.target.style.borderColor = '#22D3EE'} onBlur={(e) => e.target.style.borderColor = '#00A79D'} />
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px'}}>
              <span style={{color: time < 60 ? '#ef4444' : '#4A6A8A', fontSize: '14px', fontWeight: '600'}}>{formatTime()}</span>
              <button type="button" onClick={() => { setTime(180); setOtp(''); }} style={{color: '#00A79D', fontSize: '14px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>Resend OTP</button>
            </div>
            <button type="submit" disabled={time === 0 || loading} style={{width: '100%', padding: '14px', background: time === 0 ? '#4A6A8A' : 'linear-gradient(135deg, #00A79D, #22D3EE)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: time === 0 ? 'not-allowed' : 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(0, 167, 157, 0.3)', opacity: time === 0 ? 0.6 : 1}} onMouseEnter={(e) => { if (time !== 0) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(0, 167, 157, 0.4)'; } }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(0, 167, 157, 0.3)'; }}>{loading ? 'Verifying...' : 'Verify & Continue'}</button>
            <button type="button" onClick={() => { setStep('email'); setOtp(''); setTime(180); }} style={{width: '100%', marginTop: '12px', padding: '12px', background: 'transparent', color: '#4A6A8A', border: '2px solid #4A6A8A', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}>Back to Email</button>
          </form>
        )}
      </div>
    </div>
  );
}
