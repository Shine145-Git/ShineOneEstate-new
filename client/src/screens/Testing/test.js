import React, { useState } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';

const PropertyHeroSection = () => {
  const [activeTab, setActiveTab] = useState('News');

  // Article images URLs configurable via .env
  const newsArticles = [
    {
      id: 1,
      title: 'Unified RERA Portal: How It Benefits Homebuyers',
      date: 'Sep 05, 2025',
      image: `${process.env.REACT_APP_NEWS_IMAGE_1}`,
      category: 'News'
    },
    {
      id: 2,
      title: 'No stamp duty on small housing plots in Haryana',
      date: 'Aug 28, 2025',
      image: `${process.env.REACT_APP_NEWS_IMAGE_2}`,
      category: 'News'
    },
    {
      id: 3,
      title: 'Demolition Drive at Emaar Palm Hills, Gurgaon',
      date: 'Aug 20, 2025',
      image: `${process.env.REACT_APP_NEWS_IMAGE_3}`,
      category: 'Investment'
    },
    {
      id: 4,
      title: 'UP women homebuyers get 1% stamp duty rebate',
      date: 'Jul 28, 2025',
      image: `${process.env.REACT_APP_NEWS_IMAGE_4}`,
      category: 'Tax & Legal'
    },
    {
      id: 5,
      title: 'Oberoi Realty to enter Gurgaon market',
      date: 'May 20, 2025',
      image: `${process.env.REACT_APP_NEWS_IMAGE_5}`,
      category: 'Investment'
    },
    {
      id: 6,
      title: "Prestige Group's new launch in Ghaziabad",
      date: 'May 08, 2025',
      image: `${process.env.REACT_APP_NEWS_IMAGE_6}`,
      category: 'Investment'
    }
  ];

  const tabs = ['News', 'Tax & Legal', 'Help Guides', 'Investment'];

  const containerStyle = {
    backgroundColor: '#F4F7F9',
    padding: '40px 20px'
  };

  const topTagStyle = {
    textAlign: 'center',
    color: '#4A6A8A',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '2px',
    marginBottom: '8px',
    textTransform: 'uppercase'
  };

  const mainTitleStyle = {
    textAlign: 'center',
    fontSize: '42px',
    fontWeight: '800',
    color: '#003366',
    marginBottom: '40px',
    lineHeight: '1.2',
    fontFamily: "'Inter', sans-serif"
  };

  const mainWrapperStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start'
  };

  const leftColumnStyle = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '0'
  };

  const rightColumnStyle = {
    width: '420px',
    flexShrink: 0
  };

  const buyCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(0, 51, 102, 0.08)',
    position: 'sticky',
    top: '20px'
  };

  const buyImageStyle = {
    width: '100%',
    height: '260px',
    objectFit: 'cover'
  };

  const buyContentStyle = {
    padding: '30px'
  };

  const buyTagStyle = {
    color: '#4A6A8A',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    marginBottom: '10px',
    textTransform: 'uppercase'
  };

  const buyTitleStyle = {
    fontSize: '28px',
    fontWeight: '800',
    color: '#003366',
    marginBottom: '15px',
    lineHeight: '1.3'
  };

  const buyDescStyle = {
    fontSize: '15px',
    color: '#333333',
    marginBottom: '25px',
    lineHeight: '1.5'
  };

  const exploreButtonStyle = {
    backgroundColor: '#0066CC',
    color: '#FFFFFF',
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: '700',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    justifyContent: 'center'
  };

  const articlesCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 16px rgba(0, 51, 102, 0.08)'
  };

  const articlesHeaderStyle = {
    fontSize: '24px',
    fontWeight: '800',
    color: '#003366',
    marginBottom: '8px',
    lineHeight: '1.3'
  };

  const articlesSubtitleStyle = {
    fontSize: '14px',
    color: '#4A6A8A',
    marginBottom: '24px',
    fontWeight: '500'
  };

  const tabsContainerStyle = {
    display: 'flex',
    gap: '24px',
    marginBottom: '0',
    borderBottom: '1px solid #E5E7EB',
    position: 'relative'
  };

  const tabStyle = (isActive) => ({
    fontSize: '14px',
    fontWeight: isActive ? '700' : '600',
    color: isActive ? '#003366' : '#4A6A8A',
    padding: '0 0 14px 0',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid #00A79D' : '3px solid transparent',
    transition: 'all 0.3s ease',
    position: 'relative',
    whiteSpace: 'nowrap'
  });

  const articlesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginTop: '20px'
  };

  const articleCardStyle = {
    display: 'flex',
    gap: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    padding: '8px',
    borderRadius: '8px'
  };

  const articleImageStyle = {
    width: '80px',
    height: '60px',
    borderRadius: '4px',
    objectFit: 'cover',
    flexShrink: 0
  };

  const articleContentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '60px'
  };

  const articleTitleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#003366',
    marginBottom: '6px',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const articleDateStyle = {
    fontSize: '12px',
    color: '#4A6A8A',
    fontWeight: '500'
  };

  const readMoreLinkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#003366',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none'
  };

  return (
    <div style={containerStyle}>
      <div style={topTagStyle}>ALL PROPERTY NEEDS - ONE PORTAL</div>
      <h1 style={mainTitleStyle}>
        Find Better Places to Live, Work and Wonder...
      </h1>

      <div style={mainWrapperStyle}>
        {/* Left Column */}
        <div style={leftColumnStyle}>
          {/* Articles Section */}
          <div style={articlesCardStyle}>
            <h2 style={articlesHeaderStyle}>Top articles on home buying</h2>
            <p style={articlesSubtitleStyle}>Read from Beginners check-list to Pro Tips</p>

            {/* Tabs */}
            <div style={tabsContainerStyle}>
              {tabs.map((tab) => (
                <div
                  key={tab}
                  style={tabStyle(activeTab === tab)}
                  onClick={() => setActiveTab(tab)}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      e.target.style.color = '#00A79D';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      e.target.style.color = '#4A6A8A';
                    }
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Articles Grid */}
            <div style={articlesGridStyle}>
              {newsArticles.map((article) => (
                <div
                  key={article.id}
                  style={articleCardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.backgroundColor = '#F4F7F9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <img src={article.image} alt={article.title} style={articleImageStyle} />
                  <div style={articleContentStyle}>
                    <div style={articleTitleStyle}>{article.title}</div>
                    <div style={articleDateStyle}>{article.date}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Read More Link */}
            <a
              style={readMoreLinkStyle}
              onMouseEnter={(e) => {
                e.target.style.color = '#00A79D';
                e.target.style.gap = '10px';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#003366';
                e.target.style.gap = '6px';
              }}
            >
              Read realty news, guides & articles <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div style={rightColumnStyle}>
          <div style={buyCardStyle}>
            <img 
              src="https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&h=500&fit=crop" 
              alt="Buy a home" 
              style={buyImageStyle}
            />
            <div style={buyContentStyle}>
              <div style={buyTagStyle}>BUY A HOME</div>
              <h2 style={buyTitleStyle}>
                Find, Buy & Own Your Dream Home
              </h2>
              <p style={buyDescStyle}>
                Explore from Apartments, land, builder floors, villas and more
              </p>
              <button
                style={exploreButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#003366';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 51, 102, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0066CC';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Explore Buying <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeroSection;