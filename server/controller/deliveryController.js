const { getDeliveryFee } = require('../data/deliveryFees');
const nigeria = require('nigerian-states-and-lgas');

const calculateDeliveryFee = (req, res) => {
  const { state, lga } = req.query;
  if (!state?.trim() || !lga?.trim()) return res.status(400).json({ success: false, message: 'State and LGA are required' });
  return res.status(200).json({ success: true, deliveryFee: getDeliveryFee(state, lga) });
};

const getDeliveryLocations = (req, res) => res.status(200).json({ success: true, locations: nigeria.all() });

module.exports = { calculateDeliveryFee, getDeliveryLocations };
