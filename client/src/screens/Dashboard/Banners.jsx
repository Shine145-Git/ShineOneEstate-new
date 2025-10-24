import React, { useState, useEffect } from 'react';
import { Shield, Gift, CheckCircle, Sparkles, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Banners(user) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper: mobile or desktop spacing
  const outerPadding = isMobile ? '18px 4px' : '40px 20px';
  const bannerPadding = isMobile ? '18px' : '40px';
  const banner2Padding = isMobile ? '18px' : '40px';
  const banner3Padding = isMobile ? '22px 10px' : '50px 40px';
  const gapMain = isMobile ? '18px' : '30px';
  const iconSize = isMobile ? 28 : 40;
  const statIconSize = isMobile ? 22 : 32;
  const circleSize = isMobile ? 52 : 80;
  const statCardPadding = isMobile ? '12px 8px' : '20px 28px';
  const statCardMinWidth = isMobile ? '100px' : '180px';
  const statCard2Padding = isMobile ? '18px' : '30px';
  const statCard2MinWidth = isMobile ? '120px' : '250px';
  const h2FontSize = isMobile ? '18px' : '28px';
  const pFontSize = isMobile ? '14px' : '18px';
  const statNumberFontSize = isMobile ? '20px' : '32px';
  const statNumber2FontSize = isMobile ? '28px' : '48px';
  const statSubFontSize = isMobile ? '10px' : '14px';
  const stat2FontSize = isMobile ? '14px' : '24px';
  const stat2SubFontSize = isMobile ? '9px' : '12px';
  const btnFontSize = isMobile ? '15px' : '18px';
  const btnPadding = isMobile ? '12px 18px' : '18px 40px';
  const btnGap = isMobile ? '8px' : '12px';
  const banner3h2FontSize = isMobile ? '20px' : '32px';
  const banner3pFontSize = isMobile ? '13px' : '18px';
  const banner3LeftMinWidth = isMobile ? '170px' : '280px';
  const banner3Gap = isMobile ? '18px' : '40px';
  const banner3FeatureFontSize = isMobile ? '12px' : '15px';
  const banner3FeatureGap = isMobile ? '8px' : '10px';
  const banner3FeatureDot = isMobile ? '6px' : '8px';
  const banner3CardStatFontSize = isMobile ? '15px' : '24px';
  const banner3CardStatSubFontSize = isMobile ? '9px' : '12px';
  const banner3CardStatNumFontSize = isMobile ? '20px' : '48px';

  return (
    <div style={{
      padding: outerPadding,
      backgroundColor: '#F4F7F9',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Banner 1: Legal Documentation & Verification */}
      <div style={{
        background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
        borderRadius: '16px',
        padding: bannerPadding,
        marginBottom: isMobile ? '18px' : '30px',
        boxShadow: '0 10px 30px rgba(0, 51, 102, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: isMobile ? '-24px' : '-50px',
          right: isMobile ? '-24px' : '-50px',
          width: isMobile ? '90px' : '200px',
          height: isMobile ? '90px' : '200px',
          background: 'rgba(0, 167, 157, 0.1)',
          borderRadius: '50%',
          filter: isMobile ? 'blur(16px)' : 'blur(40px)'
        }} />
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: gapMain,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            backgroundColor: '#00A79D',
            borderRadius: '50%',
            width: circleSize + 'px',
            height: circleSize + 'px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 15px rgba(0, 167, 157, 0.3)',
            margin: isMobile ? '0 auto 10px auto' : 0
          }}>
            <Shield size={iconSize} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div style={{
            flex: 1,
            minWidth: isMobile ? '120px' : '250px',
            marginBottom: isMobile ? '12px' : 0
          }}>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: h2FontSize,
              fontWeight: '700',
              marginBottom: isMobile ? '7px' : '12px',
              letterSpacing: '-0.5px'
            }}>
              Ironclad Legal Protection
            </h2>
            <p style={{
              color: '#F4F7F9',
              fontSize: pFontSize,
              lineHeight: '1.6',
              marginBottom: isMobile ? '6px' : '8px'
            }}>
              Every property deal backed by thorough legal paper verification & expertly drafted agreements
            </p>
            <div style={{
              display: 'flex',
              gap: isMobile ? '7px' : '15px',
              flexWrap: 'wrap',
              marginTop: isMobile ? '10px' : '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px' }}>
                <CheckCircle size={isMobile ? 16 : 20} color="#22D3EE" />
                <span style={{ color: '#22D3EE', fontSize: isMobile ? '12px' : '15px', fontWeight: '600' }}>
                  Title Verification
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px' }}>
                <CheckCircle size={isMobile ? 16 : 20} color="#22D3EE" />
                <span style={{ color: '#22D3EE', fontSize: isMobile ? '12px' : '15px', fontWeight: '600' }}>
                  Agreement Drafting
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px' }}>
                <CheckCircle size={isMobile ? 16 : 20} color="#22D3EE" />
                <span style={{ color: '#22D3EE', fontSize: isMobile ? '12px' : '15px', fontWeight: '600' }}>
                  Expert Consultation
                </span>
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: statCardPadding,
            borderRadius: '12px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            minWidth: statCardMinWidth,
            margin: isMobile ? '0 auto' : 0,
            marginTop: isMobile ? '8px' : 0
          }}>
            <div style={{
              color: '#22D3EE',
              fontSize: isMobile ? '11px' : '14px',
              fontWeight: '600',
              marginBottom: isMobile ? '2px' : '4px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Trusted By
            </div>
            <div style={{
              color: '#FFFFFF',
              fontSize: statNumberFontSize,
              fontWeight: '800',
              lineHeight: '1'
            }}>
              500+
            </div>
            <div style={{
              color: '#F4F7F9',
              fontSize: isMobile ? '11px' : '14px',
              marginTop: isMobile ? '2px' : '4px'
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
        padding: banner2Padding,
        marginBottom: isMobile ? '18px' : '30px',
        boxShadow: '0 10px 30px rgba(0, 167, 157, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '-36px' : '-80px',
          left: isMobile ? '-36px' : '-80px',
          width: isMobile ? '100px' : '250px',
          height: isMobile ? '100px' : '250px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: isMobile ? 'blur(16px)' : 'blur(50px)'
        }} />
        <div style={{
          position: 'absolute',
          top: isMobile ? '10px' : '20px',
          right: isMobile ? '12px' : '40px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          <Sparkles size={isMobile ? 30 : 60} color="rgba(255, 255, 255, 0.3)" />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: gapMain,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            width: circleSize + 'px',
            height: circleSize + 'px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 20px rgba(0, 51, 102, 0.15)',
            margin: isMobile ? '0 auto 10px auto' : 0
          }}>
            <Gift size={iconSize} color="#003366" strokeWidth={2.5} />
          </div>
          <div style={{
            flex: 1,
            minWidth: isMobile ? '120px' : '250px',
            marginBottom: isMobile ? '12px' : 0
          }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              padding: isMobile ? '3px 9px' : '6px 16px',
              borderRadius: '20px',
              fontSize: isMobile ? '10px' : '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: isMobile ? '7px' : '12px'
            }}>
              🎉 Limited Time Offer
            </div>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: h2FontSize,
              fontWeight: '700',
              marginBottom: isMobile ? '7px' : '12px',
              letterSpacing: '-0.5px'
            }}>
              Celebrate Your New Beginning!
            </h2>
            <p style={{
              color: '#003366',
              fontSize: pFontSize,
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Close the deal and unlock exclusive cashback rewards plus premium goodies worth thousands
            </p>
          </div>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: isMobile ? '12px 10px' : '24px 32px',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0, 51, 102, 0.2)',
            textAlign: 'center',
            minWidth: statCardMinWidth,
            margin: isMobile ? '0 auto' : 0,
            marginTop: isMobile ? '8px' : 0
          }}>
            <div style={{
              color: '#4A6A8A',
              fontSize: isMobile ? '11px' : '14px',
              fontWeight: '600',
              marginBottom: isMobile ? '4px' : '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Get Up To
            </div>
            <div style={{
              color: '#003366',
              fontSize: isMobile ? '22px' : '36px',
              fontWeight: '900',
              lineHeight: '1',
              marginBottom: isMobile ? '4px' : '8px'
            }}>
              ₹5K
            </div>
            <div style={{
              color: '#00A79D',
              fontSize: isMobile ? '12px' : '15px',
              fontWeight: '700'
            }}>
              Cashback*
            </div>
            <div style={{
              marginTop: isMobile ? '7px' : '12px',
              paddingTop: isMobile ? '7px' : '12px',
              borderTop: '1px solid #F4F7F9',
              color: '#4A6A8A',
              fontSize: isMobile ? '9px' : '12px'
            }}>
              + Free Goodies
            </div>
          </div>
        </div>
        <div style={{
          marginTop: isMobile ? '12px' : '20px',
          padding: isMobile ? '6px' : '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#003366',
          fontSize: isMobile ? '10px' : '13px',
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
        padding: banner3Padding,
        boxShadow: '0 10px 30px rgba(0, 51, 102, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '-40px' : '-100px',
          right: isMobile ? '-40px' : '-100px',
          width: isMobile ? '120px' : '300px',
          height: isMobile ? '120px' : '300px',
          background: 'rgba(34, 211, 238, 0.1)',
          borderRadius: '50%',
          filter: isMobile ? 'blur(20px)' : 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '-36px' : '-80px',
          left: isMobile ? '-36px' : '-80px',
          width: isMobile ? '100px' : '250px',
          height: isMobile ? '100px' : '250px',
          background: 'rgba(0, 167, 157, 0.1)',
          borderRadius: '50%',
          filter: isMobile ? 'blur(16px)' : 'blur(50px)'
        }} />
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          gap: banner3Gap,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Left Content */}
          <div style={{ flex: 1, minWidth: banner3LeftMinWidth, marginBottom: isMobile ? '18px' : 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '15px',
              marginBottom: isMobile ? '12px' : '20px'
            }}>
              <div style={{
                backgroundColor: '#22D3EE',
                borderRadius: '12px',
                width: isMobile ? '34px' : '60px',
                height: isMobile ? '34px' : '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(34, 211, 238, 0.3)'
              }}>
                <Home size={statIconSize} color="#003366" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{
                  backgroundColor: '#00A79D',
                  color: '#FFFFFF',
                  padding: isMobile ? '2px 6px' : '4px 12px',
                  borderRadius: '6px',
                  fontSize: isMobile ? '8px' : '11px',
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
              fontSize: banner3h2FontSize,
              fontWeight: '800',
              marginBottom: isMobile ? '8px' : '16px',
              letterSpacing: '-0.5px',
              lineHeight: '1.2'
            }}>
              Post Your Property for Free
            </h2>
            <p style={{
              color: '#F4F7F9',
              fontSize: banner3pFontSize,
              lineHeight: '1.6',
              marginBottom: isMobile ? '12px' : '24px',
              maxWidth: isMobile ? '100%' : '500px'
            }}>
              List it on Magicbricks and get genuine leads from verified buyers actively searching for properties
            </p>
            <div style={{
              display: 'flex',
              gap: isMobile ? '10px' : '20px',
              flexWrap: 'wrap',
              marginBottom: isMobile ? '18px' : '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: banner3FeatureGap }}>
                <div style={{
                  width: banner3FeatureDot,
                  height: banner3FeatureDot,
                  backgroundColor: '#22D3EE',
                  borderRadius: '50%'
                }} />
                <span style={{ color: '#22D3EE', fontSize: banner3FeatureFontSize, fontWeight: '600' }}>
                  Reach Lakhs of Buyers
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: banner3FeatureGap }}>
                <div style={{
                  width: banner3FeatureDot,
                  height: banner3FeatureDot,
                  backgroundColor: '#22D3EE',
                  borderRadius: '50%'
                }} />
                <span style={{ color: '#22D3EE', fontSize: banner3FeatureFontSize, fontWeight: '600' }}>
                  Verified Leads Only
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: banner3FeatureGap }}>
                <div style={{
                  width: banner3FeatureDot,
                  height: banner3FeatureDot,
                  backgroundColor: '#22D3EE',
                  borderRadius: '50%'
                }} />
                <span style={{ color: '#22D3EE', fontSize: banner3FeatureFontSize, fontWeight: '600' }}>
                  Quick & Easy Setup
                </span>
              </div>
            </div>
            <button
              style={{
                backgroundColor: '#00A79D',
                color: '#FFFFFF',
                padding: btnPadding,
                fontSize: btnFontSize,
                fontWeight: '700',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: btnGap,
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
              <ArrowRight size={isMobile ? 15 : 22} strokeWidth={3} />
            </button>
          </div>
          {/* Right Stats Card */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: statCard2Padding,
            border: '2px solid rgba(255, 255, 255, 0.2)',
            minWidth: statCard2MinWidth,
            margin: isMobile ? '0 auto' : 0
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: isMobile ? '10px' : '20px'
            }}>
              <div style={{
                color: '#22D3EE',
                fontSize: isMobile ? '11px' : '15px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: isMobile ? '6px' : '10px'
              }}>
                Properties Listed
              </div>
              <div style={{
                color: '#FFFFFF',
                fontSize: banner3CardStatNumFontSize,
                fontWeight: '900',
                lineHeight: '1',
                marginBottom: isMobile ? '2px' : '5px'
              }}>
                10L+
              </div>
              <div style={{
                color: '#F4F7F9',
                fontSize: statSubFontSize
              }}>
                On Magicbricks
              </div>
            </div>
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              paddingTop: isMobile ? '10px' : '20px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: isMobile ? 'center' : 'space-around',
              alignItems: isMobile ? 'center' : 'flex-start',
              gap: isMobile ? '8px' : '0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: '#FFFFFF',
                  fontSize: banner3CardStatFontSize,
                  fontWeight: '800'
                }}>
                  2Cr+
                </div>
                <div style={{
                  color: '#F4F7F9',
                  fontSize: banner3CardStatSubFontSize,
                  marginTop: isMobile ? '1px' : '4px'
                }}>
                  Monthly Visits
                </div>
              </div>
              <div style={{
                width: isMobile ? '100%' : '1px',
                height: isMobile ? '1px' : 'auto',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                margin: isMobile ? '5px 0' : '0 10px'
              }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  color: '#FFFFFF',
                  fontSize: banner3CardStatFontSize,
                  fontWeight: '800'
                }}>
                  50K+
                </div>
                <div style={{
                  color: '#F4F7F9',
                  fontSize: banner3CardStatSubFontSize,
                  marginTop: isMobile ? '1px' : '4px'
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