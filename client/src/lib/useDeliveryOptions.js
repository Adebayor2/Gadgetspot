import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from './apiConfig';

const useDeliveryOptions = (fulfillmentType, state, lga) => {
  const [locations, setLocations] = useState([]);
  const [pickupAddress, setPickupAddress] = useState('');
  const [feeQuote, setFeeQuote] = useState(null);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const quoteKey = fulfillmentType === 'delivery' && state && lga ? `${state}\u0000${lga}` : '';

  useEffect(() => {
    let active = true;
    api.get('/delivery-locations')
      .then(({ data }) => {
        if (!active) return;
        setLocations(data.locations || []);
        setPickupAddress(data.pickupAddress || '');
      })
      .catch(() => {
        if (active) toast.error('Unable to load delivery locations');
      })
      .finally(() => {
        if (active) setLocationsLoading(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!quoteKey) return undefined;

    let active = true;
    api.get('/delivery-fee', { params: { state, lga } })
      .then(({ data }) => {
        if (active) setFeeQuote({ key: quoteKey, fee: Number(data.deliveryFee) });
      })
      .catch((error) => {
        if (!active) return;
        setFeeQuote({ key: quoteKey, fee: null });
        toast.error(error.response?.data?.message || 'Unable to calculate delivery fee');
      });

    return () => { active = false; };
  }, [fulfillmentType, state, lga, quoteKey]);

  const deliveryFee = fulfillmentType === 'pickup'
    ? 0
    : feeQuote?.key === quoteKey ? feeQuote.fee : null;

  return { locations, pickupAddress, deliveryFee, locationsLoading };
};

export default useDeliveryOptions;
