import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronRight, FiCreditCard, FiLock, FiMapPin, FiShield, FiTruck, FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useStore } from '../lib/useStore';
import { checkoutSchema } from '../lib/validationSchemas';
import api from '../lib/apiConfig';
import useDeliveryOptions from '../lib/useDeliveryOptions';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';

const initialForm = { customerName: '', customerEmail: '', customerPhone: '', shippingAddress: '', state: '', lga: '', fulfillmentType: 'delivery' };

const GuestCheckout = () => {
  const { cart } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [guestCheckoutSelected, setGuestCheckoutSelected] = useState(false);

  const getItemPrice = (item) => Number(item.discountPrice > 0 ? item.discountPrice : item.price || 0);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + getItemPrice(item) * Number(item.quantity || 1), 0), [cart]);
  const { locations, pickupAddress, deliveryFee, locationsLoading } = useDeliveryOptions(form.fulfillmentType, form.state, form.lga);
  const selectedLocation = locations.find((location) => location.state === form.state);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value, ...(name === 'state' ? { lga: '' } : {}) }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const schema = form.fulfillmentType === 'pickup'
      ? checkoutSchema.omit({ shippingAddress: true, state: true, lga: true })
      : checkoutSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
    if (form.fulfillmentType === 'delivery' && deliveryFee === null) return toast.error('Choose a state and LGA to calculate delivery');
    if (form.fulfillmentType === 'pickup' && !pickupAddress) return toast.error('Store pickup location is unavailable. Please try again.');
    if (!cart.length) return toast.error('Your cart is empty');
    setLoading(true);
    try {
      const { data } = await api.post('/payments/initialize', {
        email: form.customerEmail,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        fulfillmentType: form.fulfillmentType,
        ...(form.fulfillmentType === 'delivery' && {
          address: { line1: form.shippingAddress, state: form.state, lga: form.lga },
        }),
        items: cart.map((item) => ({ product: item.id || item._id, quantity: item.quantity, color: item.color || '' })),
      });
      if (!data.data?.authorization_url) throw new Error('Paystack did not return a payment link');
      window.location.assign(data.data.authorization_url);
    } catch (error) { toast.error(error.response?.data?.message || error.message || 'Unable to start payment'); } finally { setLoading(false); }
  };
  const fieldClass = (name) => `w-full rounded-xl border bg-white px-4 py-3.5 text-sm outline-none transition ${errors[name] ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-50'}`;

  if (!cart.length) {
    return (
      <>
        <Navbar />
        <main className="min-h-[65vh] grid place-items-center p-6">
          <section className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sky-50 text-sky-500">
              <FiCreditCard size={28} />
            </div>
            <h1 className="mt-5 text-3xl font-extrabold">Your checkout is empty</h1>
            <p className="mt-2 text-slate-500">Add a product to continue.</p>
            <Link to="/products" className="inline-block mt-6 rounded-xl bg-sky-500 px-6 py-3 font-bold text-white">Browse products</Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (locationsLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50/70 py-8 sm:py-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-center py-20">
              <Loader text="Loading delivery locations..." size="md" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/70 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4">
          <button onClick={() => navigate('/products')} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600">
            <FiArrowLeft /> Continue shopping
          </button>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-sky-500">Secure checkout</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Complete your order</h1>
              <p className="mt-2 text-slate-500">Choose how you would like to continue.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <FiShield /> Encrypted and secure
            </div>
          </div>
          {!guestCheckoutSelected ? (
            <section className="mx-auto max-w-3xl rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
              <h2 className="text-2xl font-extrabold text-slate-900">Before you check out</h2>
              <p className="mt-2 text-slate-500">Choose whether to continue without an account or sign in first.</p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setGuestCheckoutSelected(true)}
                  className="rounded-2xl border-2 border-sky-200 p-5 text-left transition hover:border-sky-500 hover:bg-sky-50"
                >
                  <span className="block text-lg font-bold text-slate-900">Continue as guest</span>
                  <span className="mt-2 block text-sm text-slate-500">Enter your contact and delivery details to place this order.</span>
                  <span className="mt-5 inline-flex rounded-xl bg-sky-500 px-4 py-2.5 font-bold text-white">Continue as guest</span>
                </button>
                <Link
                  to="/signin?redirect=%2Fcheckout"
                  className="rounded-2xl border-2 border-slate-200 p-5 transition hover:border-sky-500 hover:bg-sky-50"
                >
                  <span className="block text-lg font-bold text-slate-900">Sign in</span>
                  <span className="mt-2 block text-sm text-slate-500">Sign in to your account and continue checkout.</span>
                  <span className="mt-5 inline-flex rounded-xl border border-sky-200 px-4 py-2.5 font-bold text-sky-700">Sign in to your account</span>
                </Link>
              </div>
            </section>
          ) : (
          <>
          <button
            type="button"
            onClick={() => setGuestCheckoutSelected(false)}
            className="mb-5 text-sm font-semibold text-slate-500 hover:text-sky-600"
          >
            ← Back to checkout options
          </button>
          <div className="grid items-start gap-7 lg:grid-cols-[1fr_380px]">
            <form onSubmit={submit} className="space-y-6">
              <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600"><FiUser /></span>
                  Contact details
                </h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" error={errors.customerName}>
                    <input name="customerName" value={form.customerName} onChange={change} className={fieldClass('customerName')} placeholder=" name" />
                  </Field>
                  <Field label="Email address" error={errors.customerEmail}>
                    <input name="customerEmail" type="email" value={form.customerEmail} onChange={change} className={fieldClass('customerEmail')} placeholder="you@example.com" />
                  </Field>
                  <Field label="Phone number" error={errors.customerPhone}>
                    <input name="customerPhone" value={form.customerPhone} onChange={change} className={fieldClass('customerPhone')} placeholder="0801 234 5678" />
                  </Field>
                </div>
              </section>
              <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="flex items-center gap-3 text-xl font-bold text-slate-900">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600"><FiMapPin /></span>
                  How would you like to receive your order?
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${form.fulfillmentType === 'delivery' ? 'border-sky-400 bg-sky-50' : 'border-slate-200'}`}>
                    <input type="radio" name="fulfillmentType" value="delivery" checked={form.fulfillmentType === 'delivery'} onChange={change} className="mt-1 accent-sky-500" />
                    <span><span className="block font-bold text-slate-800">Deliver to me</span><span className="mt-1 block text-xs text-slate-500">Delivery fee is based on your location.</span></span>
                  </label>
                  <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${form.fulfillmentType === 'pickup' ? 'border-sky-400 bg-sky-50' : 'border-slate-200'}`}>
                    <input type="radio" name="fulfillmentType" value="pickup" checked={form.fulfillmentType === 'pickup'} onChange={change} className="mt-1 accent-sky-500" />
                    <span><span className="block font-bold text-slate-800">Pick up from store</span><span className="mt-1 block text-xs text-slate-500">No delivery fee.</span></span>
                  </label>
                </div>
                {form.fulfillmentType === 'delivery' ? (
                  <>
                    <h3 className="mt-7 text-sm font-bold text-slate-700">Delivery address</h3>
                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <Field label="State" error={errors.state}>
                    <select name="state" value={form.state} onChange={change} className={fieldClass('state')}>
                      <option value="">Select state</option>
                      {locations.map(({ state }) => <option key={state}>{state}</option>)}
                    </select>
                  </Field>
                  <Field label="LGA" error={errors.lga}>
                    <select name="lga" value={form.lga} onChange={change} disabled={!form.state} className={fieldClass('lga')}>
                      <option value="">Select LGA</option>
                      {selectedLocation?.lgas?.map((lga) => <option key={lga}>{lga}</option>)}
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Full delivery address" error={errors.shippingAddress}>
                      <textarea name="shippingAddress" value={form.shippingAddress} onChange={change} className={`${fieldClass('shippingAddress')} min-h-28 resize-none`} placeholder="House number, street and nearby landmark" />
                    </Field>
                  </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                    <p className="font-bold">Store pickup location</p>
                    <p className="mt-1">{pickupAddress || 'Loading store address...'}</p>
                    <p className="mt-2 font-semibold">Delivery fee: ₦0</p>
                  </div>
                )}
              </section>
            </form>
            <aside className="sticky top-6 rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-7">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Order summary</h2>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="my-6 max-h-56 space-y-3 overflow-auto pr-1">
                {cart.map((item) => {
                  const itemPrice = getItemPrice(item);
                  return (
                    <div key={`${item.id || item._id}-${item.color || ''}`} className="flex gap-3 text-sm">
                      <img className="h-12 w-12 rounded-xl object-cover bg-white/10" src={item.image} alt="" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{item.name || item.title}</p>
                        <p className="text-slate-400">Qty {item.quantity}</p>
                      </div>
                      <strong>₦{(itemPrice * item.quantity).toLocaleString()}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3 border-y border-white/10 py-5 text-sm">
                <Row label="Subtotal" value={`₦${subtotal.toLocaleString()}`} />
                <Row label={form.fulfillmentType === 'pickup' ? 'Store pickup' : 'Delivery'} value={deliveryFee === null ? 'Select location' : `₦${deliveryFee.toLocaleString()}`} />
              </div>
              <div className="flex justify-between py-5 text-lg font-extrabold">
                <span>Total</span>
                <span className="text-sky-300">₦{(subtotal + (deliveryFee ?? 0)).toLocaleString()}</span>
              </div>
              <button form="" onClick={submit} disabled={loading || (form.fulfillmentType === 'pickup' && !pickupAddress)} className="w-full rounded-2xl bg-sky-400 px-5 py-4 font-bold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60">
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Opening Paystack…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">Pay with Paystack <FiChevronRight /></span>
                )}
              </button>
              <div className="mt-5 space-y-2 text-xs text-slate-400">
                <p className="flex items-center gap-2"><FiLock /> Card details are handled by Paystack.</p>
                <p className="flex items-center gap-2"><FiTruck /> {form.fulfillmentType === 'pickup' ? 'Store pickup has no delivery fee.' : 'Delivery is calculated from your location.'}</p>
              </div>
            </aside>
          </div>
          </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

const Field = ({ label, error, children }) => (
  <label className="block text-sm font-bold text-slate-700">
    <span className="mb-2 block">{label}</span>
    {children}
    {error && <span className="mt-1.5 block text-xs font-semibold text-rose-500">{error}</span>}
  </label>
);
const Row = ({ label, value }) => (
  <div className="flex justify-between text-slate-300">
    <span>{label}</span>
    <span className="font-semibold text-white">{value}</span>
  </div>
);

export default GuestCheckout;
