import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/useStore';
import api from '../lib/apiConfig';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const { user, clearCart } = useStore();
  const [result, setResult] = useState({ loading: true, success: false, message: 'Verifying your payment...' });

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (!reference) return setResult({ loading: false, success: false, message: 'Missing payment reference.' });
    api.get(user ? `/payments/verify/${encodeURIComponent(reference)}` : `/payments/guest/verify/${encodeURIComponent(reference)}`)
      .then(async ({ data }) => {
        await clearCart();
        setResult({ loading: false, success: true, message: data.message || 'Payment confirmed.' });
      })
      .catch((error) => setResult({ loading: false, success: false, message: error.response?.data?.message || 'We could not verify this payment.' }));
  }, [searchParams, user, clearCart]);

  return <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50"><section className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-sm"><h1 className="text-2xl font-bold text-slate-900">{result.loading ? 'Processing payment' : result.success ? 'Payment successful' : 'Payment not confirmed'}</h1><p className="mt-3 text-slate-500">{result.message}</p>{!result.loading && <Link to={result.success ? (user ? '/user/orders' : '/guestorder') : '/checkout'} className="inline-block mt-6 bg-sky-500 text-white font-bold py-3 px-6 rounded-xl">{result.success ? (user ? 'View orders' : 'Track order') : 'Return to checkout'}</Link>}</section></main>;
};

export default PaymentCallback;
