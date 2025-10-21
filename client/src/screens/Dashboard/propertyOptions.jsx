import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const PropertyCitiesComponent = () => {
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cities = [
    'Bangalore', 'Mumbai', 'Hyderabad', 'Thane', 'Pune', 'New Delhi', 
    'Chennai', 'Ahmedabad', 'Kolkata', 'Gurgaon', 'Noida', 'Navi Mumbai'
  ];

  const cityData = {
    Bangalore: {
      flats: ['Whitefield', 'Sarjapur Road', 'Electronic City', 'Koramangala', 'HSR Layout', 'Marathahalli', 'Hebbal', 'Kanakapura Road', 'Bellandur', 'Varthur'],
      houses: ['Whitefield', 'HSR Layout', 'JP Nagar', 'Koramangala', 'Sarjapur Road', 'Hebbal', 'Yelahanka', 'Electronic City', 'Marathahalli', 'Bellandur'],
      properties: ['Whitefield', 'Sarjapur Road', 'Electronic City', 'Yelahanka', 'HSR Layout', 'Koramangala', 'Marathahalli', 'Hebbal', 'JP Nagar', 'Bellandur'],
      plots: ['Whitefield', 'Sarjapur Road', 'Yelahanka', 'Electronic City', 'HSR Layout', 'Kanakapura Road', 'Marathahalli', 'JP Nagar', 'Sarjapur', 'Bellandur']
    },
    Mumbai: {
      flats: ['Andheri', 'Bandra', 'Powai', 'Goregaon', 'Malad', 'Borivali', 'Thane West', 'Kandivali', 'Chembur', 'Mulund'],
      houses: ['Andheri', 'Bandra', 'Juhu', 'Goregaon', 'Borivali', 'Powai', 'Thane West', 'Mulund', 'Chembur', 'Kandivali'],
      properties: ['Andheri', 'Bandra', 'Powai', 'Goregaon', 'Malad', 'Borivali', 'Thane West', 'Kandivali', 'Chembur', 'Mulund'],
      plots: ['Panvel', 'Kharghar', 'Goregaon', 'Borivali', 'Malad', 'Andheri', 'Thane West', 'Mulund', 'Powai', 'Kandivali']
    },
    Hyderabad: {
      flats: ['Gachibowli', 'Madhapur', 'Hitech City', 'Kukatpally', 'Kondapur', 'Miyapur', 'Manikonda', 'Bachupally', 'Uppal', 'LB Nagar'],
      houses: ['Gachibowli', 'Madhapur', 'Hitech City', 'Kondapur', 'Kukatpally', 'Miyapur', 'Manikonda', 'Kompally', 'Uppal', 'Bachupally'],
      properties: ['Gachibowli', 'Madhapur', 'Hitech City', 'Kondapur', 'Kukatpally', 'Miyapur', 'Manikonda', 'Bachupally', 'Uppal', 'LB Nagar'],
      plots: ['Gachibowli', 'Madhapur', 'Kondapur', 'Kukatpally', 'Miyapur', 'Manikonda', 'Kompally', 'Bachupally', 'Uppal', 'Shamshabad']
    },
    Thane: {
      flats: ['Thane West', 'Ghodbunder Road', 'Majiwada', 'Kasarvadavali', 'Pokhran Road', 'Kolshet Road', 'Vartak Nagar', 'Naupada', 'Wagle Estate', 'Manpada'],
      houses: ['Thane West', 'Ghodbunder Road', 'Majiwada', 'Kasarvadavali', 'Pokhran Road', 'Kolshet Road', 'Vartak Nagar', 'Naupada', 'Wagle Estate', 'Manpada'],
      properties: ['Thane West', 'Ghodbunder Road', 'Majiwada', 'Kasarvadavali', 'Pokhran Road', 'Kolshet Road', 'Vartak Nagar', 'Naupada', 'Wagle Estate', 'Manpada'],
      plots: ['Thane West', 'Ghodbunder Road', 'Majiwada', 'Kasarvadavali', 'Pokhran Road', 'Kolshet Road', 'Vartak Nagar', 'Naupada', 'Wagle Estate', 'Manpada']
    },
    Pune: {
      flats: ['Hinjewadi', 'Wakad', 'Baner', 'Kharadi', 'Viman Nagar', 'Hadapsar', 'Pimple Saudagar', 'Aundh', 'Magarpatta', 'Kothrud'],
      houses: ['Hinjewadi', 'Wakad', 'Baner', 'Kharadi', 'Viman Nagar', 'Hadapsar', 'Aundh', 'Kothrud', 'Magarpatta', 'Pimple Saudagar'],
      properties: ['Hinjewadi', 'Wakad', 'Baner', 'Kharadi', 'Viman Nagar', 'Hadapsar', 'Pimple Saudagar', 'Aundh', 'Magarpatta', 'Kothrud'],
      plots: ['Hinjewadi', 'Wakad', 'Baner', 'Kharadi', 'Talegaon', 'Chakan', 'Wagholi', 'Pimple Saudagar', 'Hadapsar', 'Undri']
    },
    'New Delhi': {
      flats: ['Dwarka', 'Rohini', 'Pitampura', 'Janakpuri', 'Vasant Kunj', 'Saket', 'Greater Kailash', 'Lajpat Nagar', 'Mayur Vihar', 'Nehru Place'],
      houses: ['Dwarka', 'Rohini', 'Vasant Kunj', 'Greater Kailash', 'Saket', 'Defence Colony', 'Pitampura', 'Janakpuri', 'Mayur Vihar', 'Lajpat Nagar'],
      properties: ['Dwarka', 'Rohini', 'Pitampura', 'Janakpuri', 'Vasant Kunj', 'Saket', 'Greater Kailash', 'Lajpat Nagar', 'Mayur Vihar', 'Nehru Place'],
      plots: ['Dwarka', 'Rohini', 'Chattarpur', 'Mehrauli', 'Vasant Kunj', 'Pitampura', 'Nangloi', 'Bawana', 'Najafgarh', 'Narela']
    },
    Chennai: {
      flats: ['OMR', 'Velachery', 'Anna Nagar', 'T Nagar', 'Adyar', 'Porur', 'Tambaram', 'Chromepet', 'Pallikaranai', 'Perungudi'],
      houses: ['OMR', 'Velachery', 'Anna Nagar', 'T Nagar', 'Adyar', 'Porur', 'ECR', 'Tambaram', 'Chromepet', 'Perungudi'],
      properties: ['OMR', 'Velachery', 'Anna Nagar', 'T Nagar', 'Adyar', 'Porur', 'Tambaram', 'Chromepet', 'Pallikaranai', 'Perungudi'],
      plots: ['OMR', 'ECR', 'Tambaram', 'Chengalpattu', 'Porur', 'Velachery', 'Red Hills', 'Poonamallee', 'Avadi', 'Guduvanchery']
    },
    Ahmedabad: {
      flats: ['Satellite', 'Bodakdev', 'Vastrapur', 'Prahlad Nagar', 'Maninagar', 'Gota', 'Chandkheda', 'Thaltej', 'Naranpura', 'Bopal'],
      houses: ['Satellite', 'Bodakdev', 'Vastrapur', 'Prahlad Nagar', 'Thaltej', 'Gota', 'Bopal', 'Chandkheda', 'Maninagar', 'Naranpura'],
      properties: ['Satellite', 'Bodakdev', 'Vastrapur', 'Prahlad Nagar', 'Maninagar', 'Gota', 'Chandkheda', 'Thaltej', 'Naranpura', 'Bopal'],
      plots: ['Sanand', 'Dholera', 'Gota', 'Chandkheda', 'Bopal', 'Thaltej', 'Satellite', 'Bodakdev', 'South Bopal', 'Shela']
    },
    Kolkata: {
      flats: ['Salt Lake', 'New Town', 'Rajarhat', 'Ballygunge', 'Park Street', 'Alipore', 'Jadavpur', 'Behala', 'Dum Dum', 'Howrah'],
      houses: ['Salt Lake', 'Ballygunge', 'Alipore', 'Park Street', 'New Town', 'Rajarhat', 'Jadavpur', 'Behala', 'Tollygunge', 'Dum Dum'],
      properties: ['Salt Lake', 'New Town', 'Rajarhat', 'Ballygunge', 'Park Street', 'Alipore', 'Jadavpur', 'Behala', 'Dum Dum', 'Howrah'],
      plots: ['New Town', 'Rajarhat', 'Barasat', 'Narendrapur', 'Joka', 'Sonarpur', 'Madhyamgram', 'Behala', 'Dum Dum', 'Baruipur']
    },
    Gurgaon: {
      flats: ['DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'Golf Course Road', 'Sohna Road', 'Sector 56', 'Sector 57', 'MG Road', 'New Gurgaon', 'Sector 82'],
      houses: ['DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'Golf Course Road', 'Sohna Road', 'Sector 56', 'Sector 57', 'MG Road', 'New Gurgaon', 'Sector 82'],
      properties: ['DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'Golf Course Road', 'Sohna Road', 'Sector 56', 'Sector 57', 'MG Road', 'New Gurgaon', 'Sector 82'],
      plots: ['Sohna Road', 'New Gurgaon', 'Sector 82', 'Sector 89', 'Golf Course Extension', 'Manesar', 'Pataudi Road', 'Dwarka Expressway', 'Sector 95', 'Sector 99']
    },
    Noida: {
      flats: ['Sector 62', 'Sector 137', 'Greater Noida West', 'Sector 76', 'Sector 78', 'Sector 121', 'Sector 168', 'Sector 150', 'Sector 144', 'Sector 75'],
      houses: ['Sector 62', 'Sector 137', 'Greater Noida West', 'Sector 76', 'Sector 78', 'Sector 121', 'Sector 168', 'Sector 150', 'Sector 144', 'Sector 75'],
      properties: ['Sector 62', 'Sector 137', 'Greater Noida West', 'Sector 76', 'Sector 78', 'Sector 121', 'Sector 168', 'Sector 150', 'Sector 144', 'Sector 75'],
      plots: ['Greater Noida', 'Greater Noida West', 'Sector 150', 'Sector 144', 'Sector 168', 'Yamuna Expressway', 'Sector 137', 'Tech Zone', 'Knowledge Park', 'Jewar']
    },
    'Navi Mumbai': {
      flats: ['Kharghar', 'Panvel', 'Nerul', 'Vashi', 'Airoli', 'Ghansoli', 'Kamothe', 'Seawoods', 'Belapur', 'Ulwe'],
      houses: ['Kharghar', 'Panvel', 'Nerul', 'Vashi', 'Airoli', 'Kamothe', 'Ulwe', 'Seawoods', 'Belapur', 'Ghansoli'],
      properties: ['Kharghar', 'Panvel', 'Nerul', 'Vashi', 'Airoli', 'Ghansoli', 'Kamothe', 'Seawoods', 'Belapur', 'Ulwe'],
      plots: ['Kharghar', 'Panvel', 'Ulwe', 'Kamothe', 'Taloja', 'Kalamboli', 'Dronagiri', 'Nerul', 'Vashi', 'Uran']
    }
  };

  const scrollContainer = (direction) => {
    const container = document.getElementById('city-scroll');
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '600', 
          color: '#333333',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Property Options in Top Cities for Buy
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronDown size={24} color="#333333" />
          </button>
        </h2>
        <div style={{ 
          width: '60px', 
          height: '4px', 
          background: '#FDB913',
          borderRadius: '2px'
        }} />
      </div>

      {/* City Navigation */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '8px'
        }}>
          <div 
            id="city-scroll"
            style={{ 
              display: 'flex', 
              gap: '24px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              flex: 1,
              paddingBottom: '12px'
            }}
          >
            <style>
              {`
                #city-scroll::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: selectedCity === city ? '#333333' : '#666666',
                  cursor: 'pointer',
                  padding: '8px 0',
                  whiteSpace: 'nowrap',
                  borderBottom: selectedCity === city ? '3px solid #D32F2F' : '3px solid transparent',
                  transition: 'all 0.3s'
                }}
              >
                {city}
              </button>
            ))}
          </div>
          <button
            onClick={() => scrollContainer('right')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E0E0E0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              flexShrink: 0
            }}
          >
            <ChevronRight size={20} color="#333333" />
          </button>
        </div>
      </div>

      // Use environment variable for property search URLs
      {/* Property Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '40px',
        marginTop: '30px'
      }}>
        {/* Flats Column */}
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#333333',
            marginBottom: '20px'
          }}>
            Flats in {selectedCity}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cityData[selectedCity].flats.map((area, index) => (
              <a
                key={index}
                href={`${process.env.REACT_APP_PROPERTY_SEARCH_URL}?city=${encodeURIComponent(area)}&type=flats`}
                style={{
                  fontSize: '15px',
                  color: '#666666',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#003366'}
                onMouseOut={(e) => e.target.style.color = '#666666'}
              >
                Flats in {area}
              </a>
            ))}
          </div>
        </div>

        {/* Houses Column */}
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#333333',
            marginBottom: '20px'
          }}>
            House for Sale in {selectedCity}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cityData[selectedCity].houses.map((area, index) => (
              <a
                key={index}
                href={`${process.env.REACT_APP_PROPERTY_SEARCH_URL}?city=${encodeURIComponent(area)}&type=houses`}
                style={{
                  fontSize: '15px',
                  color: '#666666',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#003366'}
                onMouseOut={(e) => e.target.style.color = '#666666'}
              >
                House for Sale in {area}
              </a>
            ))}
          </div>
        </div>

        {/* Property Column */}
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#333333',
            marginBottom: '20px'
          }}>
            Property in {selectedCity}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cityData[selectedCity].properties.map((area, index) => (
              <a
                key={index}
                href={`${process.env.REACT_APP_PROPERTY_SEARCH_URL}?city=${encodeURIComponent(area)}&type=properties`}
                style={{
                  fontSize: '15px',
                  color: '#666666',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#003366'}
                onMouseOut={(e) => e.target.style.color = '#666666'}
              >
                Property in {area}
              </a>
            ))}
          </div>
        </div>

        {/* Plots Column */}
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#333333',
            marginBottom: '20px'
          }}>
            Plots in {selectedCity}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cityData[selectedCity].plots.map((area, index) => (
              <a
                key={index}
                href={`${process.env.REACT_APP_PROPERTY_SEARCH_URL}?city=${encodeURIComponent(area)}&type=plots`}
                style={{
                  fontSize: '15px',
                  color: '#666666',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#003366'}
                onMouseOut={(e) => e.target.style.color = '#666666'}
              >
                Plots in {area}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCitiesComponent;