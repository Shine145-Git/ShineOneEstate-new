import React, { useState } from 'react';

const CardSection = () => {
  const [cards, setCards] = useState([
    { id: 1, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', title: 'Buying a home', new: false },
    { id: 2, img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop', title: 'Renting a home', new: false },
    { id: 3, img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop', title: 'Invest in Real Estate', new: true },
    { id: 4, img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop', title: 'Sell/Rent your property', new: false },
    { id: 5, img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop', title: 'Plots/Land', new: false },
    { id: 6, img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', title: 'Explore Insights', new: true },
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

  return (
    <section style={{ padding: '90px', marginTop: '50px', backgroundColor: '#FFFFFF' }}>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {cards.map((card) => (
          <div
            key={card.id}
            style={hoveredCard === card.id ? {...cardStyle, ...hoveredStyle} : cardStyle}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
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
