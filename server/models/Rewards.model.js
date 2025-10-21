

const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    default: "Congratulations! You’ve received free goodies and gifts worth ₹50,000 🎁",
  },
  distributedAt: {
    type: Date,
    default: Date.now,
  },
  viewed: {
    type: Boolean,
    default: false, // track if user has seen the message
  },
});

module.exports = mongoose.model("Reward", rewardSchema);