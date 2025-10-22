const Payment = require("../models/Payment.model");
const Property = require("../models/Rentalproperty.model");

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const {
      propertyId,
      amount,
      paymentMethod = "online",
      referenceNumber,
      notes,
    } = req.body;

    if (!propertyId || !amount) {
      return res
        .status(400)
        .json({ message: "Property ID and amount are required" });
    }

    // Optional: check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Create the payment record
    const payment = new Payment({
      property: propertyId,
      resident: req.user._id, // Assuming req.user is populated by auth middleware
      amount,
      paymentMethod,
      referenceNumber,
      notes,
      status: "pending", // default
    });

    const savedPayment = await payment.save();

    res
      .status(201)
      .json({
        message: "Payment recorded successfully",
        payment: savedPayment,
      });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Optional: get payments for a user
exports.getPaymentsForUser = async (req, res) => {
  try {
    const payments = await Payment.find({ resident: req.user._id })
      .populate("property", "address monthlyRent")
      .sort({ paymentDate: -1 });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
