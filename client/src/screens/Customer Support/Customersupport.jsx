import React, { useState } from 'react';
import axios from 'axios';
import { Phone, Clock, CheckCircle, MessageSquare, Headphones, Mail } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../Dashboard/TopNavigationBar';

export default function CustomerSupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredTime: '',
    issue: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_REQUEST_CALLBACK_API}`,
        formData,
        { withCredentials: true }
      );
      if (res.status === 201) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: '', phone: '', email: '', preferredTime: '', issue: '' });
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting callback request:", error);
      alert("Failed to submit callback request. Please try again later.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <> <TopNavigationBar user={user} handleLogout={handleLogout} navItems={navItems} />
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F4F7F9 0%, #FFFFFF 100%)' }}>

      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(34, 211, 238, 0.1)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          background: 'rgba(0, 167, 157, 0.1)',
          borderRadius: '50%'
        }}></div>
        <h1 style={{ 
          color: '#FFFFFF',
          fontSize: '42px',
          fontWeight: '700',
          marginBottom: '15px',
          position: 'relative',
          zIndex: 1
        }}>
          Customer Support
        </h1>
        <p style={{ 
          color: '#22D3EE',
          fontSize: '18px',
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          We're here to help! Reach out directly or request a callback at your convenience.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '-40px auto 0',
        padding: '0 20px 60px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {/* Direct Contact Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0, 51, 102, 0.1)',
            border: '1px solid #F4F7F9',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 51, 102, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 51, 102, 0.1)';
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '25px'
            }}>
              <Phone size={32} color="#FFFFFF" />
            </div>
            
            <h2 style={{ 
              color: '#003366',
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '15px'
            }}>
              Call Us Directly
            </h2>
            
            <p style={{ 
              color: '#4A6A8A',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              Speak with our support team immediately. We're available to assist you with any questions or concerns.
            </p>

            <div style={{ 
              background: 'linear-gradient(135deg, #F4F7F9 0%, #FFFFFF 100%)',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '20px',
              border: '2px solid #00A79D'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <Headphones size={24} color="#00A79D" style={{ marginRight: '12px' }} />
                <span style={{ color: '#333333', fontSize: '15px', fontWeight: '600' }}>
                  Customer Care
                </span>
              </div>
              <a href="tel:+18005551234" style={{
                color: '#003366',
                fontSize: '32px',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '10px'
              }}>
                9310994032
              </a>
              <p style={{ color: '#4A6A8A', fontSize: '14px', margin: 0 }}>
                Toll-free • Available 24/7
              </p>
            </div>

            <div style={{ 
              display: 'flex',
              alignItems: 'start',
              background: '#F4F7F9',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '10px'
            }}>
              <Clock size={20} color="#00A79D" style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ color: '#333333', fontSize: '14px', fontWeight: '600', margin: '0 0 5px 0' }}>
                  Business Hours
                </p>
                <p style={{ color: '#4A6A8A', fontSize: '14px', margin: 0 }}>
                  Mon-Fri: 9:00 AM - 6:00 PM EST
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'flex',
              alignItems: 'start',
              background: '#F4F7F9',
              padding: '15px',
              borderRadius: '12px'
            }}>
              <Mail size={20} color="#00A79D" style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ color: '#333333', fontSize: '14px', fontWeight: '600', margin: '0 0 5px 0' }}>
                  Email Support
                </p>
                <a href="mailto:support@company.com" style={{ 
                  color: '#00A79D', 
                  fontSize: '14px',
                  textDecoration: 'none'
                }}>
                  ggnrentaldeals@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Callback Request Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0, 51, 102, 0.1)',
            border: '1px solid #F4F7F9',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 51, 102, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 51, 102, 0.1)';
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '25px'
            }}>
              <MessageSquare size={32} color="#FFFFFF" />
            </div>
            
            <h2 style={{ 
              color: '#003366',
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '15px'
            }}>
              Request a Callback
            </h2>
            
            <p style={{ 
              color: '#4A6A8A',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              Can't talk right now? Fill out the form and we'll call you back at your preferred time.
            </p>

            {submitted ? (
              <div style={{
                background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
                borderRadius: '15px',
                padding: '40px',
                textAlign: 'center',
                animation: 'fadeIn 0.5s ease'
              }}>
                <CheckCircle size={60} color="#FFFFFF" style={{ marginBottom: '20px' }} />
                <h3 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>
                  Request Submitted!
                </h3>
                <p style={{ color: '#FFFFFF', fontSize: '16px', margin: 0 }}>
                  We'll call you back soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    color: '#333333',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
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

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    color: '#333333',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
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

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    color: '#333333',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
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

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    color: '#333333',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Preferred Call Time *
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #F4F7F9',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#333333',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00A79D'}
                    onBlur={(e) => e.target.style.borderColor = '#F4F7F9'}
                  >
                    <option value="">Select a time...</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 3 PM)</option>
                    <option value="evening">Evening (3 PM - 6 PM)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block',
                    color: '#333333',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    Brief Description of Issue
                  </label>
                  <textarea
                    name="issue"
                    value={formData.issue}
                    onChange={handleChange}
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #F4F7F9',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#333333',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00A79D'}
                    onBlur={(e) => e.target.style.borderColor = '#F4F7F9'}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0, 51, 102, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Additional Info Section */}
        <div style={{
          background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
          borderRadius: '20px',
          padding: '40px',
          marginTop: '40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          <h3 style={{ 
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '15px',
            position: 'relative',
            zIndex: 1
          }}>
            We're Here to Help
          </h3>
          <p style={{ 
            color: '#22D3EE',
            fontSize: '16px',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6',
            position: 'relative',
            zIndex: 1
          }}>
            Our dedicated support team is committed to providing you with the best service possible. 
            Whether you choose to call us directly or request a callback, we'll make sure your concerns are addressed promptly.
          </p>
        </div>
      </div>
      </div>
      </>
  );
}
