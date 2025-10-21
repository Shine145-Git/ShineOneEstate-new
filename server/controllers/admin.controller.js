const Payment = require('../models/Payment.model');

const getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ status: 'pending' }).populate('property').populate('resident');
    res.status(200).json(pendingPayments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending payments', error });
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
    const approvedPayments = await Payment.find({ status: 'approved' })
      .populate('property')
      .populate('resident');
    res.status(200).json(approvedPayments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching approved payments', error });
  }
};

module.exports = { getPendingPayments, updatePaymentStatus, getApprovedPayments };
