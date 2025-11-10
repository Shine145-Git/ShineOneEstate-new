// server/controllers/newsController.js
const axios = require('axios');

const getNews = async (req, res) => {
    try {
      
    const response = await axios.get('https://gnews.io/api/v4/search', {
      params: {
        q: 'real estate news',
        token: process.env.GNEWS_API_KEY,
        lang: 'en',
        max: 10
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { getNews };