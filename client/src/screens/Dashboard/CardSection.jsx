import { User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CardSection = ({user}) => {
  const [cards, setCards] = useState([
    { id: 1, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', title: 'Buying a home', new: false },
    { id: 2, img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop', title: 'Renting a home', new: false },
    { id: 3, img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop', title: 'Invest in Real Estate', new: true },
    { id: 4, img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop', title: 'Sell/Rent your property', new: false },
   
  ]);
  const [hoveredCard, setHoveredCard] = useState(null);



  const cardStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    margin: '8px',
    width: '170px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    backgroundColor: '#fff',
  };

  const hoveredStyle = {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  };

  const imgStyle = {
    width: '100%',
    borderRadius: '4px',
    marginBottom: '12px',
  };

  const newBadgeStyle = {
    display: 'inline-block',
    backgroundColor: '#ff4757',
    color: '#fff',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    marginLeft: '8px',
  };

  const isMobile = window.innerWidth < 600;

  const containerStyle = isMobile
    ? {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1px',
        justifyContent: 'center',
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
      };

  const navigate = useNavigate();

  // Helper: fetch random sector from history
  const getRandomSectorFromHistory = async () => {
    try {
      const res = await fetch(process.env.REACT_APP_SEARCH_HISTORY_API, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      if (!list.length) return null;
      // Extract possible sector-like strings
      const candidates = list
        .map((item) => {
          const sector = item?.sector || item?.area || item?.location || item?.place || item?.query || item?.text;
          return typeof sector === 'string' ? sector.trim() : null;
        })
        .filter(Boolean);
      if (!candidates.length) return null;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      return pick;
    } catch (e) {
      console.error('history fetch error', e);
      return null;
    }
  };

  const openBuyFlow = async () => {
    const histSector = await getRandomSectorFromHistory();
    const fallback = localStorage.getItem('lastSector') || 'Gurgaon';
    const sector = (histSector || fallback).trim();
    localStorage.setItem('lastSector', sector);

    navigate(`/search?type=sale`);
  };

  const openRentFlow = async () => {
    const histSector = await getRandomSectorFromHistory();
    const fallback = localStorage.getItem('lastSector') || 'Gurgaon';
    const sector = (histSector || fallback).trim();
    localStorage.setItem('lastSector', sector);
    navigate(`/search?type=rent`);
  };

  return (
    <section style={{ padding: '20px', marginLeft: '30px', backgroundColor: '#FFFFFF' }}>
      <div style={containerStyle}>
        {cards.map((card) => (
          <div
            key={card.id}
            style={hoveredCard === card.id ? {...cardStyle, ...hoveredStyle} : cardStyle}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={async () => {
              if (card.id === 1) {
                await openBuyFlow();
                return;
              }
              if (card.id === 2) {
                await openRentFlow();
                return;
              }

              if (card.title === 'Buying a home') {
                await openBuyFlow();
              } else if (card.title === 'Renting a home') {
                await openRentFlow();
              } else if (card.title === 'Sell/Rent your property') {
                if(!user){navigate('/login'); return;}else{
                  navigate('/add-property')
                };
              } else if (card.title === 'Invest in Real Estate') {
                navigate('/investrealestate');
              } 
            }}
          >
            <img src={card.img} alt={card.title} style={imgStyle} />
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              {card.title}
              {card.new && <span style={newBadgeStyle}>New</span>}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CardSection;
