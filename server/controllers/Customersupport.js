const CustomerSupport = require("../models/CustomerSupport.model.js");

exports.requestCallback = async (req, res) => {
  try {
    const { name, phone, email, preferredTime, issue } = req.body;
    if (!name || !phone || !email || !preferredTime) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const newRequest = new CustomerSupport({
      name,
      phone,
      email,
      preferredTime,
      issue,
      createdAt: new Date()
    });

    await newRequest.save();
    res.status(201).json({ message: "Callback request submitted successfully", data: newRequest });
  } catch (error) {
    console.error("Error saving callback request:", error);
    res.status(500).json({ message: "Server error while submitting callback request" });
  }
};


exports.getCallbackRequests = async (req, res) => {
  try {
    const requests = await CustomerSupport.find().sort({ createdAt: -1 });
      console.log(requests);
      res.status(200).json({ data: requests });
      
  } catch (error) {
    console.error("Error fetching callback requests:", error);
    res.status(500).json({ message: "Server error while fetching callback requests" });
  }
};