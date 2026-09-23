import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { restoreSession, useStore } from '../lib/useStore';
import api, { getAccessToken } from '../lib/apiConfig';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, clearCart } = useStore();
  const verifiedReference = useRef('');
  const [result, setResult] = useState(() => (searchParams.get('reference') || searchParams.get('trxref'))
    ? { loading: true, success: false, message: 'Verifying your payment...' }
    : { loading: false, success: false, message: 'Missing payment reference.' });

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) return;
    if (verifiedReference.current === reference) return;
    verifiedReference.current = reference;
    const verify = async () => {
      if (user && !getAccessToken() && !(await restoreSession())) {
        throw new Error('Your sign-in session has expired. Please sign in again to view this order.');
      }

      const { data } = await api.get(`/payments/verify/${encodeURIComponent(reference)}`, { skipAuthRefresh: true });
      await clearCart({ skipAuthRefresh: true });
      const isAuthenticatedOrder = Boolean(data.order?.user);
      const destination = isAuthenticatedOrder
        ? '/user/orders'
        : `/guestorder?reference=${encodeURIComponent(data.order?.reference || reference)}`;
      navigate(destination, { replace: true });
    };
    verify()
      .catch((error) => {
        verifiedReference.current = '';
        setResult({ loading: false, success: false, message: error.response?.data?.message || error.message || 'We could not verify this payment.' });
      });
  }, [searchParams, user, clearCart, navigate]);

  return <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50"><section className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-sm"><h1 className="text-2xl font-bold text-slate-900">{result.loading ? 'Processing payment' : result.success ? 'Payment successful' : 'Payment not confirmed'}</h1><p className="mt-3 text-slate-500">{result.message}</p>{!result.loading && <Link to={result.success ? (user ? '/user/orders' : '/guestorder') : '/checkout'} className="inline-block mt-6 bg-sky-500 text-white font-bold py-3 px-6 rounded-xl">{result.success ? (user ? 'View orders' : 'Track order') : 'Return to checkout'}</Link>}</section></main>;
};

export default PaymentCallback;
