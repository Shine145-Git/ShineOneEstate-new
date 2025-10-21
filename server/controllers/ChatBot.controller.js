exports.getChatResponse = (req, res) => {
  const { message } = req.body;

  // Define Neo-Urban specific rule-based responses
  const rules = [
    { pattern: /hello|hi|hey|good morning|good afternoon/i, response: "Hello! Welcome to Neo-Urban. How can I help you today?" },
    { pattern: /services|what do you offer|platform/i, response: "Neo-Urban helps you find rental homes, buy or sell properties, and get support for property transactions." },
    { pattern: /buy|sell|rent|properties|houses/i, response: "You can browse available properties on our website. Would you like me to guide you to Buy, Sell, or Rent?" },
    { pattern: /pricing|fees|cost|charges/i, response: "Neo-Urban charges a small service fee depending on the transaction type. For more details, visit our Pricing page." },
    { pattern: /contact|support|help|customer care/i, response: "You can reach our support team at +91-9310994032 or email support@neourban.in. You can also request a callback." },
    { pattern: /hours|timings|open|close/i, response: "Our customer support is available Monday to Saturday, 9 AM to 6 PM IST." },
    { pattern: /location|cities|area|where/i, response: "Neo-Urban operates across multiple cities. You can check available properties in your city from the homepage." },
    { pattern: /thank|thanks|thx/i, response: "You're welcome! 😊 Feel free to ask any other questions." },
  ];

  // Find the first matching rule
  const rule = rules.find(r => r.pattern.test(message));

  if (rule) {
    res.json({ reply: rule.response });
  } else {
    res.json({ reply: "Sorry, I don’t understand that yet. Please contact support or check our FAQ." });
  }
};

