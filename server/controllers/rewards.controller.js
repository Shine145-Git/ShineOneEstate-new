const Reward = require("../models/Rewards.model");
const User = require("../models/user.model");

// Function to distribute a reward to a specific user
exports.distributeReward = async (req, res) => {
  try {
    const { userId, email, message, adminId } = req.body;

    let targetUserId = userId;
    if (email && !userId) {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      targetUserId = user._id;
    }

    if (!targetUserId)
      return res.status(400).json({ success: false, message: "User ID or Email is required" });

    const reward = new Reward({
      userId: targetUserId,
      distributedBy: adminId || null,
      message: message || undefined,
    });

    await reward.save();
    res.status(201).json({ success: true, message: "Reward distributed successfully", reward });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Function to check if user is eligible for a reward
// Function to check if user is eligible for a reward
exports.checkEligibility = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ success: false, message: "Logged-in user not found or token invalid" });
    }

    const targetUserId = req.user._id;

    // ✅ Fetch the latest reward (most recent)
    const latestReward = await Reward.findOne({ userId: targetUserId }).sort({ distributedAt: -1 });

    if (latestReward) {
      return res.status(200).json({
        success: true,
        eligible: false,
        message: "User already received a reward",
        reward: latestReward, // 🧩 send only the most recent reward
      });
    }

    res.status(200).json({
      success: true,
      eligible: true,
      message: "User is eligible for the reward",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};