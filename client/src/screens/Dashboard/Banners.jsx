import React from 'react';
import { Shield, Gift, CheckCircle, Sparkles, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Banners(user) {
    const navigate = useNavigate();
    return (
    <div style={{ 
      padding: '40px 20px', 
      backgroundColor: '#F4F7F9',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Banner 1: Legal Documentation & Verification */}
      <div style={{
        background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0, 51, 102, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(0, 167, 157, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '30px',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            backgroundColor: '#00A79D',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 15px rgba(0, 167, 157, 0.3)'
          }}>
            <Shield size={40} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              Ironclad Legal Protection
            </h2>
            <p style={{
              color: '#F4F7F9',
              fontSize: '18px',
              lineHeight: '1.6',
              marginBottom: '8px'
            }}>
              Every property deal backed by thorough legal paper verification & expertly drafted agreements
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color="#22D3EE" />
                <span style={{ color: '#22D3EE', fontSize: '15px', fontWeight: '600' }}>
                  Title Verification
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color="#22D3EE" />
                <span style={{ color: '#22D3EE', fontSize: '15px', fontWeight: '600' }}>
                  Agreement Drafting
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color="#22D3EE" />
                <span style={{ color: '#22D3EE', fontSize: '15px', fontWeight: '600' }}>
                  Expert Consultation
                </span>
              </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '20px 28px',
            borderRadius: '12px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ 
              color: '#22D3EE', 
              fontSize: '14px', 
              fontWeight: '600',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Trusted By
            </div>
            <div style={{ 
              color: '#FFFFFF', 
              fontSize: '32px', 
              fontWeight: '800',
              lineHeight: '1'
            }}>
              500+
            </div>
            <div style={{ 
              color: '#F4F7F9', 
              fontSize: '14px',
              marginTop: '4px'
            }}>
              Happy Clients
            </div>
          </div>
        </div>
      </div>

      {/* Banner 2: Cashback & Rewards */}
      <div style={{
        background: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0, 167, 157, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '250px',
          height: '250px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(50px)'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '40px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          <Sparkles size={60} color="rgba(255, 255, 255, 0.3)" />
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '30px',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 20px rgba(0, 51, 102, 0.15)'
          }}>
            <Gift size={40} color="#003366" strokeWidth={2.5} />
          </div>
          
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px'
            }}>
              🎉 Limited Time Offer
            </div>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              Celebrate Your New Beginning!
            </h2>
            <p style={{
              color: '#003366',
              fontSize: '18px',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Close the deal and unlock exclusive cashback rewards plus premium goodies worth thousands
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px 32px',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0, 51, 102, 0.2)',
            textAlign: 'center',
            minWidth: '180px'
          }}>
            <div style={{ 
              color: '#4A6A8A', 
              fontSize: '14px', 
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Get Up To
            </div>
            <div style={{ 
              color: '#003366', 
              fontSize: '36px', 
              fontWeight: '900',
              lineHeight: '1',
              marginBottom: '8px'
            }}>
              ₹50K
            </div>
            <div style={{ 
              color: '#00A79D', 
              fontSize: '15px',
              fontWeight: '700'
            }}>
              Cashback*
            </div>
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #F4F7F9',
              color: '#4A6A8A',
              fontSize: '12px'
            }}>
              + Free Goodies
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#003366',
          fontSize: '13px',
          fontWeight: '500',
          position: 'relative',
          zIndex: 1
        }}>
          *Terms & conditions apply. Offer valid on successful deal closure.
        </div>
      </div>

      {/* Banner 3: Post Property - Magicbricks Style */}
      <div style={{
        background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
        borderRadius: '16px',
        padding: '50px 40px',
        boxShadow: '0 10px 30px rgba(0, 51, 102, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(34, 211, 238, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '250px',
          height: '250px',
          background: 'rgba(0, 167, 157, 0.1)',
          borderRadius: '50%',
          filter: 'blur(50px)'
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '40px',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Left Content */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                backgroundColor: '#22D3EE',
                borderRadius: '12px',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(34, 211, 238, 0.3)'
              }}>
                <Home size={32} color="#003366" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{
                  backgroundColor: '#00A79D',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'inline-block'
                }}>
                  100% FREE
                </div>
              </div>
            </div>

            <h2 style={{
              color: '#FFFFFF',
              fontSize: '32px',
              fontWeight: '800',
              marginBottom: '16px',
              letterSpacing: '-0.5px',
              lineHeight: '1.2'
            }}>
              Post Your Property for Free
            </h2>
            
            <p style={{
              color: '#F4F7F9',
              fontSize: '18px',
              lineHeight: '1.6',
              marginBottom: '24px',
              maxWidth: '500px'
            }}>
              List it on Magicbricks and get genuine leads from verified buyers actively searching for properties
            </p>

            <div style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#22D3EE',
                  borderRadius: '50%'
                }} />
                <span style={{ color: '#22D3EE', fontSize: '15px', fontWeight: '600' }}>
                  Reach Lakhs of Buyers
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#22D3EE',
                  borderRadius: '50%'
                }} />
                <span style={{ color: '#22D3EE', fontSize: '15px', fontWeight: '600' }}>
                  Verified Leads Only
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#22D3EE',
                  borderRadius: '50%'
                }} />
                <span style={{ color: '#22D3EE', fontSize: '15px', fontWeight: '600' }}>
                  Quick & Easy Setup
                </span>
              </div>
            </div>

            <button
              style={{
                backgroundColor: '#00A79D',
                color: '#FFFFFF',
                padding: '18px 40px',
                fontSize: '18px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 20px rgba(0, 167, 157, 0.4)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#22D3EE';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 25px rgba(34, 211, 238, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#00A79D';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(0, 167, 157, 0.4)';
              }}
            onClick={() => { if (user) navigate("/add-property"); else navigate("/login"); }}
            >
              Post Property
              <ArrowRight size={22} strokeWidth={3} />
            </button>
          </div>

          {/* Right Stats Card */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '30px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            minWidth: '250px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                color: '#22D3EE',
                fontSize: '15px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '10px'
              }}>
                Properties Listed
              </div>
              <div style={{
                color: '#FFFFFF',
                fontSize: '48px',
                fontWeight: '900',
                lineHeight: '1',
                marginBottom: '5px'
              }}>
                10L+
              </div>
              <div style={{
                color: '#F4F7F9',
                fontSize: '14px'
              }}>
                On Magicbricks
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'space-around'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: '#FFFFFF',
                  fontSize: '24px',
                  fontWeight: '800'
                }}>
                  2Cr+
                </div>
                <div style={{
                  color: '#F4F7F9',
                  fontSize: '12px',
                  marginTop: '4px'
                }}>
                  Monthly Visits
                </div>
              </div>
              <div style={{
                width: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: '#FFFFFF',
                  fontSize: '24px',
                  fontWeight: '800'
                }}>
                  50K+
                </div>
                <div style={{
                  color: '#F4F7F9',
                  fontSize: '12px',
                  marginTop: '4px'
                }}>
                  Daily Leads
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
}