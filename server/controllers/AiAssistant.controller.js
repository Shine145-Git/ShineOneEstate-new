const AiModel = require('../models/AiAssistant.model.js');
const User = require('../models/user.model.js');

// Save AI responses
const saveAiResponses = async (req, res) => {
  try {
    const { userEmail, sendType, responses } = req.body;

    if (!userEmail || !sendType || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ message: 'Missing required fields or invalid responses format.' });
    }

    // Find user by email to get ObjectId
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found for provided email.' });
    }

    // Check if an existing entry exists for this user
    let aiEntry = await AiModel.findOne({ userEmail: user._id });

    if (aiEntry) {
      aiEntry.responses = responses;
      aiEntry.sendType = sendType;
      await aiEntry.save();
    } else {
      aiEntry = await AiModel.create({ userEmail: user._id, sendType, responses });
    }

    res.status(201).json({ message: 'AI responses saved successfully.', data: aiEntry });
  } catch (error) {
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
    res.status(500).json({ message: 'Server error while fetching AI responses.' });
  }
};

module.exports = {
  saveAiResponses,
  getAiResponses
};