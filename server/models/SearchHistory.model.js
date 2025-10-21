const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  query: { type: String, required: true }, // e.g. "sector 9"
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SearchHistory", SearchHistorySchema);