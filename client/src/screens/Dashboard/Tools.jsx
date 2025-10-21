import React, { useState } from 'react';
import { TrendingUp, ArrowRight, Sparkles, Zap, Target, BarChart3, Search, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ToolsShowcase() {
  const [hoveredTool, setHoveredTool] = useState(null);
const navigate = useNavigate();
  const tools = [
    {
      id: 1,
      name: 'Price Predictor',
      tagline: 'Predict market prices with AI-powered accuracy',
      description: 'Our advanced machine learning model analyzes historical data, market trends, and multiple variables to provide accurate price predictions. Make informed decisions with confidence.',
      icon: TrendingUp,
      color: '#00A79D',
      gradient: 'linear-gradient(135deg, #00A79D 0%, #22D3EE 100%)',
      features: [
        'Real-time price analysis',
        'Historical data insights',
        'AI-powered predictions',
        'Market trend visualization'
      ],
      stats: [
        { label: 'Accuracy', value: '94%' },
        { label: 'Predictions', value: '10K+' },
        { label: 'Users', value: '2.5K+' }
      ],
      badge: 'Most Popular',
      available: true
    }
  ];

  const upcomingTools = [
    {
      name: 'Inventory Manager',
      description: 'Track and manage your inventory in real-time',
      icon: BarChart3,
      status: 'Coming Soon'
    },
    {
      name: 'Market Analyzer',
      description: 'Deep dive into market trends and insights',
      icon: Target,
      status: 'Coming Soon'
    },
    {
      name: 'Smart Dashboard',
      description: 'Unified view of all your business metrics',
      icon: Sparkles,
      status: 'Coming Soon'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F4F7F9 0%, #FFFFFF 100%)' }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #003366 0%, #4A6A8A 100%)',
        padding: '80px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(0, 167, 157, 0.15) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(34, 211, 238, 0.2)',
              padding: '8px 20px',
              borderRadius: '25px',
              marginBottom: '20px'
            }}>
              <Zap size={18} color="#22D3EE" />
              <span style={{ color: '#22D3EE', fontSize: '14px', fontWeight: '600' }}>
                POWERFUL TOOLS
              </span>
            </div>
          </div>
          
          <h1 style={{ 
            color: '#FFFFFF',
            fontSize: '52px',
            fontWeight: '700',
            marginBottom: '20px',
            textAlign: 'center',
            lineHeight: '1.2'
          }}>
            Supercharge Your Business
          </h1>
          <p style={{ 
            color: '#22D3EE',
            fontSize: '20px',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Explore our suite of intelligent tools designed to help you make data-driven decisions and stay ahead of the market.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        {/* Main Tools Section */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ 
              color: '#003366',
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '15px'
            }}>
              Available Now
            </h2>
            <p style={{ 
              color: '#4A6A8A',
              fontSize: '18px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Start using our premium tools today and transform your workflow
            </p>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <div
                  key={tool.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: hoveredTool === tool.id 
                      ? '0 20px 60px rgba(0, 51, 102, 0.2)' 
                      : '0 10px 40px rgba(0, 51, 102, 0.1)',
                    transition: 'all 0.4s ease',
                    transform: hoveredTool === tool.id ? 'translateY(-10px)' : 'translateY(0)',
                    border: '1px solid #F4F7F9',
                    position: 'relative'
                  }}
                  onMouseEnter={() => setHoveredTool(tool.id)}
                  onMouseLeave={() => setHoveredTool(null)}
                >
                  {/* Badge */}
                  {tool.badge && (
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      color: '#FFFFFF',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 4px 12px rgba(255, 165, 0, 0.3)',
                      zIndex: 1
                    }}>
                      <Star size={14} />
                      {tool.badge}
                    </div>
                  )}

                  {/* Header with Gradient */}
                  <div style={{
                    background: tool.gradient,
                    padding: '40px 30px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-30px',
                      right: '-30px',
                      width: '150px',
                      height: '150px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%'
                    }}></div>
                    
                    <div style={{
                      width: '70px',
                      height: '70px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      <IconComponent size={36} color="#FFFFFF" />
                    </div>
                    
                    <h3 style={{ 
                      color: '#FFFFFF',
                      fontSize: '28px',
                      fontWeight: '700',
                      marginBottom: '10px'
                    }}>
                      {tool.name}
                    </h3>
                    <p style={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '16px',
                      margin: 0
                    }}>
                      {tool.tagline}
                    </p>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '30px' }}>
                    <p style={{ 
                      color: '#4A6A8A',
                      fontSize: '15px',
                      lineHeight: '1.7',
                      marginBottom: '25px'
                    }}>
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div style={{ marginBottom: '25px' }}>
                      <h4 style={{ 
                        color: '#003366',
                        fontSize: '16px',
                        fontWeight: '700',
                        marginBottom: '15px'
                      }}>
                        Key Features
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {tool.features.map((feature, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              background: tool.color,
                              borderRadius: '50%'
                            }}></div>
                            <span style={{ color: '#333333', fontSize: '14px' }}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '15px',
                      marginBottom: '25px',
                      padding: '20px',
                      background: '#F4F7F9',
                      borderRadius: '15px'
                    }}>
                      {tool.stats.map((stat, index) => (
                        <div key={index} style={{ textAlign: 'center' }}>
                          <div style={{ 
                            color: tool.color,
                            fontSize: '24px',
                            fontWeight: '700',
                            marginBottom: '5px'
                          }}>
                            {stat.value}
                          </div>
                          <div style={{ 
                            color: '#4A6A8A',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: tool.gradient,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.3s ease',
                        transform: hoveredTool === tool.id ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: hoveredTool === tool.id 
                          ? `0 8px 25px ${tool.color}40` 
                          : 'none'
                              }}
                              // Navigation URL configurable via .env
                              onClick={() => {
                                  navigate(`${process.env.REACT_APP_PRICE_PREDICTOR_PAGE}`);
                              }}
                    >
                      Try Price Predictor
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tools Section */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ 
              color: '#003366',
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '15px'
            }}>
              Coming Soon
            </h2>
            <p style={{ 
              color: '#4A6A8A',
              fontSize: '18px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Exciting new tools are in development. Stay tuned!
            </p>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px'
          }}>
            {upcomingTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <div
                  key={index}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '30px',
                    boxShadow: '0 8px 30px rgba(0, 51, 102, 0.08)',
                    border: '2px dashed #E0E7EE',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 51, 102, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 51, 102, 0.08)';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'linear-gradient(135deg, #4A6A8A 0%, #003366 100%)',
                    color: '#FFFFFF',
                    padding: '5px 12px',
                    borderRadius: '15px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {tool.status}
                  </div>

                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #F4F7F9 0%, #E0E7EE 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <IconComponent size={30} color="#4A6A8A" />
                  </div>

                  <h4 style={{ 
                    color: '#003366',
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '10px'
                  }}>
                    {tool.name}
                  </h4>
                  <p style={{ 
                    color: '#4A6A8A',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

       
      </div>
    </div>
  );
}