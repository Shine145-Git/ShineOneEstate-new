const fs = require("fs");
const path = require("path");

const savePreferences = (req, res) => {
  try {
    const { username, email, preferences } = req.body;
    if (!email || !preferences || !Array.isArray(preferences)) {
      return res.status(400).json({ message: "Missing or invalid data" });
    }

    // Server-side storage for preferences
    const dataDir = path.join(__dirname, "../data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    // This path is server-side and secure
    const filePath = path.join(dataDir, "preferences.txt");
    const prefText = preferences.map(p => `${p.question} : ${p.answer}`).join("\n");
    const content = `Username: ${username}\nEmail: ${email}\nPreferences:\n${prefText}\n\n`;
    fs.appendFileSync(filePath, content);

    res.status(200).json({ message: "Preferences saved successfully", preferences });
  } catch (err) {
    res.status(500).json({ message: "Failed to save preferences" });
  }
};



module.exports = { savePreferences};