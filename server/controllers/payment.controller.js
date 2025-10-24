const Payment = require("../models/Payment.model");
const RentalProperty = require("../models/Rentalproperty.model");
const SaleProperty = require("../models/SaleProperty.model");

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

    // Check if property exists in RentalProperty
    let property = await RentalProperty.findById(propertyId);
    let propertyType = "rental";
    if (!property) {
      // Check in SaleProperty
      property = await SaleProperty.findById(propertyId);
      propertyType = "sale";
    }
    if (!property) {
      return res.status(404).json({ message: "Property not found in rental or sale properties" });
    }

    // Create the payment record
    const payment = new Payment({
      property: propertyId, // can be rental or sale
      propertyType, // "rental" or "sale"
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
      .populate({
        path: "property",
        select: "address monthlyRent price",
      })
      .sort({ paymentDate: -1 });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
