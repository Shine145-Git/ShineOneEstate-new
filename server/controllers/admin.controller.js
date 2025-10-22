const Payment = require('../models/Payment.model');
const mongoose = require('mongoose');
const RentalProperty = mongoose.models.RentalProperty || require('../models/RentalProperty.model');
const SaleProperty = mongoose.models.SaleProperty || require('../models/SaleProperty.model');

const getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ status: 'pending' }).populate('resident');

    // Dynamically populate property based on propertyModel field
    const populatedPayments = await Promise.all(
      pendingPayments.map(async (payment) => {
        let property;
        if (payment.propertyModel === 'RentalProperty') {
          property = await RentalProperty.findById(payment.property);
        } else if (payment.propertyModel === 'SaleProperty') {
          property = await SaleProperty.findById(payment.property);
        }
        return {
          ...payment.toObject(),
          property,
        };
      })
    );

    res.status(200).json(populatedPayments);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ message: 'Error fetching pending payments', error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  const { paymentId, status } = req.body;
  try {
    const payment = await Payment.findByIdAndUpdate(paymentId, { status }, { new: true });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error });
  }
};


const getApprovedPayments = async (req, res) => {
  try {
    const approvedPayments = await Payment.find({ status: 'approved' }).populate('resident');

    const populatedPayments = await Promise.all(
      approvedPayments.map(async (payment) => {
        let property;
        if (payment.propertyModel === 'RentalProperty') {
          property = await RentalProperty.findById(payment.property);
        } else if (payment.propertyModel === 'SaleProperty') {
          property = await SaleProperty.findById(payment.property);
        }
        return {
          ...payment.toObject(),
          property,
        };
      })
    );

    res.status(200).json(populatedPayments);
  } catch (error) {
    console.error('Error fetching approved payments:', error);
    res.status(500).json({ message: 'Error fetching approved payments', error: error.message });
  }
};

module.exports = { getPendingPayments, updatePaymentStatus, getApprovedPayments };
