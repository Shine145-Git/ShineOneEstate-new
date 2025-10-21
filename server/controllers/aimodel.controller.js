const axios = require('axios');

const validCities = ['delhi', 'gurgaon'];

const cityFeatureKeys = {
  delhi: ['Area', 'BHK', 'Bathroom', 'Furnishing', 'Locality', 'Parking', 'Type'],
  gurgaon: ['areaWithType', 'address'],
};

const predictPrice = async (req, res) => {
  try {
    const { city, features } = req.body;
    if (!city || !features) {
      return res.status(400).json({ error: 'City and features are required' });
    }

    const cityLower = city.toLowerCase();
    if (!validCities.includes(cityLower)) {
      return res.status(404).json({ error: `City ${city} not supported` });
    }

    // Prepare payload for Flask API
    let payload = { city: cityLower };

    if (cityLower === 'delhi') {
      // Delhi requires full features
      payload = { ...payload, ...features };
    } else if (cityLower === 'gurgaon') {
      // Gurgaon requires areaWithType as numeric and address separately
      if (features.areaWithType === undefined || !features.address) {
        return res.status(400).json({ error: 'Both areaWithType and address are required for Gurgaon' });
      }
      payload.areaWithType = Number(features.areaWithType); // numeric
      payload.address = features.address; // text
    }

    // Call Flask API
    // Flask API URL configurable via .env
    try {
      const response = await axios.post(`${process.env.FLASK_API_URL}/predict`, payload);
      if (response.data && response.data.predicted_price !== undefined) {
        return res.json({ predictedPrice: response.data.predicted_price });
      } else {
        console.error('Flask API response invalid:', response.data);
        return res.status(500).json({ error: 'Flask API did not return a valid prediction', details: response.data });
      }
    } catch (flaskError) {
      console.error('Error calling Flask API:', flaskError.response?.data || flaskError.message || flaskError);
      return res.status(500).json({ error: 'Failed to call Flask API', details: flaskError.response?.data || flaskError.message });
    }

  } catch (error) {
    console.error('Prediction controller error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { predictPrice };