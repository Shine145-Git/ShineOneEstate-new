

const AiModel = require('../models/AiAssistant.model.js');
const User = require('../models/user.model.js');

// Save AI responses
const saveAiResponses = async (req, res) => {
  try {
    const { userEmail, sendType, responses } = req.body;

    if (!userEmail || !sendType || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ message: 'Missing required fields or invalid responses format.' });
    }

    const aiEntry = await AiModel.create({ userEmail, sendType, responses });

    res.status(201).json({ message: 'AI responses saved successfully.', data: aiEntry });
  } catch (error) {
    console.error('Error saving AI responses:', error);
    res.status(500).json({ message: 'Server error while saving AI responses.' });
  }
};

// Get AI responses for a user
const getAiResponses = async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) {
      return res.status(400).json({ message: 'userEmail query parameter is required.' });
    }

    const aiResponses = await AiModel.find({ userEmail }).populate('userEmail', 'email mobileNumber');

    res.status(200).json({ data: aiResponses });
  } catch (error) {
    console.error('Error fetching AI responses:', error);
    res.status(500).json({ message: 'Server error while fetching AI responses.' });
  }
};

module.exports = {
  saveAiResponses,
  getAiResponses
};