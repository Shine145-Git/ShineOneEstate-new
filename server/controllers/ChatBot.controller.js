const fs = require('fs');
const path = require('path');

exports.getChatResponse = (req, res) => {
  const { message, parentId } = req.body;

  // Load the JSON dataset
  const datasetPath = path.join(__dirname, '../utils/Dataset.json');
  const rawData = fs.readFileSync(datasetPath);
  const dataset = JSON.parse(rawData);

  // Find the matching question
  let rule;
  if (parentId) {
    // If a parentId is provided, search in its followUps
    const parentNode = dataset.find(q => q.id === parentId);
    if (parentNode && parentNode.followUps) {
      rule = parentNode.followUps
        .map(f => dataset.find(d => d.id === f.id))
        .find(r => r && r.question.toLowerCase() === message.toLowerCase());
    }
  } else {
    // Top-level search
    rule = dataset.find(r => r.question.toLowerCase() === message.toLowerCase());
  }

  // Fallback if not found
  if (!rule) {
    return res.json({
      reply: "Sorry, I don’t understand that yet. Please contact support or check our FAQ.",
      options: []
    });
  }

  // Return the bot response and follow-ups
  res.json({
    reply: rule.response,
    options: rule.followUps || []  // array of next questions
  });
};