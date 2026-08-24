const DEFAULT_DELIVERY_FEE = 7000;

const deliveryFees = {
  Lagos: { DEFAULT: 6000, Ikeja: 6000, 'Lagos Island': 6000, 'Eti Osa': 6000 },
  Abuja: { DEFAULT: 8000, 'Municipal Area Council': 7000, Bwari: 7000, Gwagwalada:7000 },
  FCT: { DEFAULT: 7000, 'Municipal Area Council': 7000, Bwari: 7000, Gwagwalada: 7000 },
  Ogun: { DEFAULT: 7000, 'Ado-Odo': 7000, 'Ado-Odo/Ota': 7000 },
  Oyo: { DEFAULT: 3000, 'Ibadan North': 3000, 'Ibadan South-West': 3000, 'Ogbomosho North':2000 },
  Rivers: { DEFAULT: 7000, 'Port Harcourt': 7000,},
  Kano: 8000,
  Anambra: 8000,
  Enugu: 8000,
  Delta: 8000,
};

const normalise = (value) => String(value || '').trim().toLocaleLowerCase();
const findKey = (object, value) => Object.keys(object).find((key) => normalise(key) === normalise(value));

const getDeliveryFee = (state, lga) => {
  const stateKey = findKey(deliveryFees, state);
  const statePricing = stateKey && deliveryFees[stateKey];
  if (typeof statePricing === 'number') return statePricing;
  if (!statePricing) return DEFAULT_DELIVERY_FEE;
  const lgaKey = findKey(statePricing, lga);
  return (lgaKey && statePricing[lgaKey]) || statePricing.DEFAULT || DEFAULT_DELIVERY_FEE;
};

module.exports = { deliveryFees, DEFAULT_DELIVERY_FEE, getDeliveryFee };
