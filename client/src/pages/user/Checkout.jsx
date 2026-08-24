import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import UserDashboardLayout from '../../components/user/UserDashboardLayout';
import { useStore } from '../../lib/useStore';
import api from '../../lib/apiConfig';

const Checkout = () => {
  const { user, cart, clearCart } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: user?.fullName || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    shippingAddress: user?.address || '',
    state: '',
    lga: '',
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [locations, setLocations] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.discountPrice > 0 ? item.discountPrice : item.price || 0) * item.quantity, 0);
  const shipping = deliveryFee ?? 0;
  const total = subtotal + shipping;

  useEffect(() => {
    api.get('/delivery-locations').then(({ data }) => setLocations(data.locations || [])).catch(() => toast.error('Unable to load delivery locations'));
  }, []);

  useEffect(() => {
    if (!form.state || !form.lga) return setDeliveryFee(null);
    api.get('/delivery-fee', { params: { state: form.state, lga: form.lga } })
      .then(({ data }) => setDeliveryFee(data.deliveryFee))
      .catch(() => { setDeliveryFee(null); toast.error('Unable to calculate delivery fee'); });
  }, [form.state, form.lga]);

  const validateField = (fieldName) => {
    let error = '';
    switch (fieldName) {
      case 'customerName':
        if (!form.customerName.trim()) error = 'Full name is required';
        else if (form.customerName.trim().length < 2) error = 'Full name must be at least 2 characters';
        break;
      case 'customerEmail':
        if (!form.customerEmail.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) error = 'Please enter a valid email address';
        break;
      case 'customerPhone':
        if (!form.customerPhone.trim()) error = 'Phone number is required';
        else if (form.customerPhone.trim().length < 10) error = 'Phone number must be at least 10 digits';
        break;
      case 'shippingAddress':
        if (!form.shippingAddress.trim()) error = 'Shipping address is required';
        else if (form.shippingAddress.trim().length < 5) error = 'Shipping address must be at least 5 characters';
        break;
      case 'state':
      case 'lga':
        if (!form[fieldName]) error = `${fieldName === 'lga' ? 'LGA' : 'State'} is required`;
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ['customerName', 'customerEmail', 'customerPhone', 'shippingAddress', 'state', 'lga'];
    let isValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) isValid = false;
    });
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    if (cart.length === 0) {
      setFormErrors((prev) => ({ ...prev, cart: 'Your cart is empty' }));
      return;
    }

    setLoading(true);
    try {
      if (deliveryFee === null) {
        toast.error('Select your state and LGA to calculate delivery');
        return;
      }
      const items = cart.map((item) => ({
        product: item.id || item._id,
        quantity: item.quantity,
        color: item.color || '',
      }));

      const { data } = await api.post('/payments/initialize', {
        email: form.customerEmail,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        items,
        address: { line1: form.shippingAddress, state: form.state, lga: form.lga },
      });
      if (!data.data?.authorization_url) throw new Error('Paystack did not return a checkout link');
      window.location.assign(data.data.authorization_url);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <UserDashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 mb-6">
            <FiLock size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Nothing to checkout</h2>
          <p className="text-slate-500 mb-8 max-w-md text-center">
            Your cart is empty. Add some products before checking out.
          </p>
          <Link
            to="/user/products"
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-sky-100 hover:scale-105"
          >
            Browse Products
          </Link>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-slate-50/70">
         <div className="max-w-6xl mx-auto pt-4 pb-8 sm:pb-12 px-4">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <FiArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Checkout
              </h1>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Complete your order
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {formErrors.cart && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                {formErrors.cart}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="state" className="block text-sm font-bold text-slate-700 mb-2">State *</label>
                          <select id="state" name="state" value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value, lga: '' }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 outline-none font-medium text-slate-700 text-sm">
                            <option value="">Select state</option>
                            {locations.map((location) => <option key={location.state} value={location.state}>{location.state}</option>)}
                          </select>
                          {formErrors.state && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.state}</p>}
                        </div>
                        <div>
                          <label htmlFor="lga" className="block text-sm font-bold text-slate-700 mb-2">LGA *</label>
                          <select id="lga" name="lga" value={form.lga} disabled={!form.state} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 outline-none font-medium text-slate-700 text-sm disabled:opacity-60">
                            <option value="">Select LGA</option>
                            {locations.find((location) => location.state === form.state)?.lgas?.map((lga) => <option key={lga} value={lga}>{lga}</option>)}
                          </select>
                          {formErrors.lga && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.lga}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="customerName" className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                      <input
                        id="customerName"
                        type="text"
                        name="customerName"
                        value={form.customerName}
                        onChange={(e) => { handleChange(e); setFormErrors((prev) => ({ ...prev, customerName: '' })); }}
                        onBlur={() => validateField('customerName')}
                        placeholder="Enter your full name"
                        required
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50 border focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${formErrors.customerName ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
                      />
                      {formErrors.customerName && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.customerName}</p>}
                    </div>
                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
                      <input
                        id="customerEmail"
                        type="email"
                        name="customerEmail"
                        value={form.customerEmail}
                        onChange={(e) => { handleChange(e); setFormErrors((prev) => ({ ...prev, customerEmail: '' })); }}
                        onBlur={() => validateField('customerEmail')}
                        placeholder="you@example.com"
                        required
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50 border focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${formErrors.customerEmail ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
                      />
                      {formErrors.customerEmail && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.customerEmail}</p>}
                    </div>
                    <div>
                      <label htmlFor="customerPhone" className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
                      <input
                        id="customerPhone"
                        type="tel"
                        name="customerPhone"
                        value={form.customerPhone}
                        onChange={(e) => { handleChange(e); setFormErrors((prev) => ({ ...prev, customerPhone: '' })); }}
                        onBlur={() => validateField('customerPhone')}
                        placeholder="+234 800 000 0000"
                        required
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50 border focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${formErrors.customerPhone ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
                      />
                      {formErrors.customerPhone && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.customerPhone}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="shippingAddress" className="block text-sm font-bold text-slate-700 mb-2">Shipping Address *</label>
                      <textarea
                        id="shippingAddress"
                        name="shippingAddress"
                        value={form.shippingAddress}
                        onChange={(e) => { handleChange(e); setFormErrors((prev) => ({ ...prev, shippingAddress: '' })); }}
                        onBlur={() => validateField('shippingAddress')}
                        placeholder="Enter your delivery address"
                        rows="3"
                        required
                        className={`w-full px-4 py-3 rounded-xl bg-slate-50 border focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm resize-none ${formErrors.shippingAddress ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
                      ></textarea>
                      {formErrors.shippingAddress && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.shippingAddress}</p>}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id || item._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 truncate">{item.name || item.title}</h3>
                          <p className="text-xs text-slate-400 font-medium">Qty: {item.quantity}</p>
                          {item.color && (
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Color: {item.color}</p>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900">₦{((item.discountPrice > 0 ? item.discountPrice : item.price || 0) * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="lg:col-span-1">
                <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl sticky top-24 text-white">
                  <h2 className="text-2xl font-bold mb-6">Payment</h2>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>Subtotal</span>
                      <span className="text-white">₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? "text-emerald-400 font-bold" : "text-white"}>
                        {deliveryFee === null ? 'Select delivery location' : `₦${shipping.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                      <span className="text-white font-bold text-lg">Total</span>
                      <span className="text-3xl font-black text-sky-300 tracking-tighter">₦{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading || deliveryFee === null}
                      className="w-full bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-60"
                    >
                      {loading ? 'Opening Paystack...' : deliveryFee === null ? 'Enter delivery details' : (
                        <span className="flex items-center justify-center gap-2">
                          Pay with Paystack
                          <FiLock size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="mt-6 space-y-2 text-xs text-slate-400">
                    <p className="flex items-center gap-2">
                      <FiLock /> Card details are handled by Paystack.
                    </p>
                    <p className="flex items-center gap-2">
                      <FiArrowLeft size={12} /> Delivery is calculated from your location.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default Checkout;
