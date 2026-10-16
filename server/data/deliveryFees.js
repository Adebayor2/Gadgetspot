const DEFAULT_DELIVERY_FEE = 7000;

const deliveryFees = {
  Lagos: { DEFAULT: 6000, Ikeja: 6000, 'Lagos Island': 6000, 'Eti Osa': 6000 },
  'Federal Capital Territory': { DEFAULT: 7000, 'Abuja Municipal Area Council': 7000, Bwari: 7000, Gwagwalada: 7000 },
  Ogun: { DEFAULT: 7000, 'Ado-Odo/Ota': 7000 },
  Oyo: { DEFAULT: 3000, 'Ibadan North': 3000, 'Ibadan South-West': 3000, 'Ogbomosho North':2000 },
  Rivers: { DEFAULT: 7000, 'Port Harcourt': 7000,},
  Kano: 8000,
  Anambra: 8000,
  Enugu: 8000,
  Delta: 8000,
};

module.exports = { deliveryFees, DEFAULT_DELIVERY_FEE };
