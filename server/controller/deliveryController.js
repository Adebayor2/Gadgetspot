const {
  getAdminDeliverySettings: readAdminSettings,
  getDeliveryFee,
  getDeliveryLocations: readLocations,
  saveDeliverySettings,
} = require('../services/deliverySettingsService');

const calculateDeliveryFee = async (req, res, next) => {
  const { state, lga } = req.query;
  if (!state?.trim() || !lga?.trim()) return res.status(400).json({ success: false, message: 'State and LGA are required' });
  try {
    return res.status(200).json({ success: true, deliveryFee: await getDeliveryFee(state, lga) });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

const getDeliveryLocations = (req, res) => res.status(200).json({ success: true, ...readLocations() });

const getAdminDeliverySettings = async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, settings: await readAdminSettings() });
  } catch (error) {
    return next(error);
  }
};

const updateAdminDeliverySettings = async (req, res, next) => {
  try {
    const settings = await saveDeliverySettings(req.body);
    return res.status(200).json({ success: true, message: 'Delivery fees updated', settings });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

module.exports = {
  calculateDeliveryFee,
  getAdminDeliverySettings,
  getDeliveryLocations,
  updateAdminDeliverySettings,
};
