const nigeria = require('nigerian-states-and-lgas');
const DeliverySettings = require('../models/deliverySettingsModel');
const { deliveryFees, DEFAULT_DELIVERY_FEE } = require('../data/deliveryFees');

const PICKUP_ADDRESS = 'No 12 Inuofebi, Yoaco, Ogbomoso, Oyo, Nigeria';
const SETTINGS_KEY = 'default';
const locations = nigeria.all();
const normalize = (value) => String(value || '').trim().toLocaleLowerCase();

const createInitialStateFees = () => Object.entries(deliveryFees).map(([state, pricing]) => {
  if (typeof pricing === 'number') return { state, fee: pricing, lgaFees: [] };
  return {
    state,
    fee: pricing.DEFAULT ?? null,
    lgaFees: Object.entries(pricing)
      .filter(([lga]) => lga !== 'DEFAULT')
      .map(([lga, fee]) => ({ lga, fee })),
  };
});

const getSettings = async () => {
  const current = await DeliverySettings.findOne({ key: SETTINGS_KEY }).lean();
  if (current) return current;

  try {
    return await DeliverySettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $setOnInsert: { defaultFee: DEFAULT_DELIVERY_FEE, stateFees: createInitialStateFees() } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
  } catch (error) {
    if (error.code !== 11000) throw error;
    return DeliverySettings.findOne({ key: SETTINGS_KEY }).lean();
  }
};

const getAdminDeliverySettings = async () => {
  const settings = await getSettings();
  return {
    defaultFee: settings.defaultFee,
    stateFees: settings.stateFees.map(({ state, fee, lgaFees }) => ({
      state,
      fee: fee ?? null,
      lgaFees: lgaFees.map(({ lga, fee: lgaFee }) => ({ lga, fee: lgaFee })),
    })),
  };
};

const getDeliveryLocations = () => ({
  locations,
  pickupAddress: PICKUP_ADDRESS,
});

const getDeliveryFee = async (state, lga) => {
  const location = locations.find((entry) => normalize(entry.state) === normalize(state));
  if (!location || !location.lgas.some((entry) => normalize(entry) === normalize(lga))) {
    const error = new Error('Choose a valid state and LGA');
    error.statusCode = 400;
    throw error;
  }

  const settings = await getSettings();
  const stateSettings = settings.stateFees.find((entry) => normalize(entry.state) === normalize(location.state));
  const lgaSettings = stateSettings?.lgaFees.find((entry) => normalize(entry.lga) === normalize(lga));
  return lgaSettings?.fee ?? stateSettings?.fee ?? settings.defaultFee;
};

const saveDeliverySettings = async ({ defaultFee, stateFees }) => {
  const isValidFee = (fee) => Number.isSafeInteger(fee) && fee >= 0;
  if (!isValidFee(defaultFee) || !Array.isArray(stateFees)) {
    const error = new Error('A non-negative whole-number default fee and state fee list are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedStates = new Set();
  const validatedStateFees = stateFees.map((entry) => {
    const location = locations.find((candidate) => normalize(candidate.state) === normalize(entry?.state));
    const normalizedState = normalize(location?.state);
    if (!location || normalizedStates.has(normalizedState)) {
      const error = new Error('Each state must be valid and appear only once');
      error.statusCode = 400;
      throw error;
    }
    normalizedStates.add(normalizedState);

    if (entry.fee !== null && entry.fee !== undefined && !isValidFee(entry.fee)) {
      const error = new Error(`The delivery fee for ${location.state} must be a non-negative whole number`);
      error.statusCode = 400;
      throw error;
    }
    if (!Array.isArray(entry.lgaFees || [])) {
      const error = new Error(`LGA fees for ${location.state} must be a list`);
      error.statusCode = 400;
      throw error;
    }

    const normalizedLgas = new Set();
    const lgaFees = (entry.lgaFees || []).map((lgaEntry) => {
      const actualLga = location.lgas.find((candidate) => normalize(candidate) === normalize(lgaEntry?.lga));
      const normalizedLga = normalize(actualLga);
      if (!actualLga || normalizedLgas.has(normalizedLga) || !isValidFee(lgaEntry.fee)) {
        const error = new Error(`Each LGA fee for ${location.state} must have a valid, unique LGA and non-negative whole-number fee`);
        error.statusCode = 400;
        throw error;
      }
      normalizedLgas.add(normalizedLga);
      return { lga: actualLga, fee: lgaEntry.fee };
    });

    return {
      state: location.state,
      fee: entry.fee ?? null,
      lgaFees,
    };
  });

  const settings = await DeliverySettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: { defaultFee, stateFees: validatedStateFees } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();

  return {
    defaultFee: settings.defaultFee,
    stateFees: settings.stateFees.map(({ state, fee, lgaFees }) => ({
      state,
      fee: fee ?? null,
      lgaFees: lgaFees.map(({ lga, fee: lgaFee }) => ({ lga, fee: lgaFee })),
    })),
  };
};

module.exports = {
  PICKUP_ADDRESS,
  getAdminDeliverySettings,
  getDeliveryFee,
  getDeliveryLocations,
  saveDeliverySettings,
};
