const mongoose = require('mongoose');

const lgaFeeSchema = new mongoose.Schema({
  lga: { type: String, required: true, trim: true },
  fee: { type: Number, required: true, min: 0 },
}, { _id: false });

const stateFeeSchema = new mongoose.Schema({
  state: { type: String, required: true, trim: true },
  fee: { type: Number, default: null, min: 0 },
  lgaFees: { type: [lgaFeeSchema], default: [] },
}, { _id: false });

const deliverySettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'default' },
  defaultFee: { type: Number, required: true, min: 0 },
  stateFees: { type: [stateFeeSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('DeliverySettings', deliverySettingsSchema);
