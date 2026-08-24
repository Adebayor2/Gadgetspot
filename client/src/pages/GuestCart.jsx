import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight, FiHome, FiMessageCircle } from 'react-icons/fi'
import { useStore } from '../lib/useStore'
import { toast } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'

const GuestCart = () => {
  const { cart, removeFromCart, updateQuantity, loadServerData, user } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (user?._id) {
          await loadServerData();
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false };
  }, [user?._id, loadServerData]);

  const subtotal = cart.reduce((acc, item) => acc + (item.discountPrice > 0 ? item.discountPrice : item.price || 0) * item.quantity, 0);
  const total = subtotal;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    if (!cart.length) return;

    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
    if (!whatsappNumber) {
      toast.error('WhatsApp number is not configured');
      return;
    }

    const customerName = 'Customer';
    let message = `*New Order from ${customerName}*\n\n`;
    message += `*Items:*\n`;

    cart.forEach((item, index) => {
      const itemPrice = item.discountPrice > 0 ? item.discountPrice : item.price || 0;
      const itemTotal = itemPrice * item.quantity;
      message += `${index + 1}. *${item.name}*\n`;
      if (item.color) {
        message += `   Color: ${item.color}\n`;
      }
      message += `   Qty: ${item.quantity}\n`;
      message += `   Price: ₦${Number(itemPrice).toLocaleString()}\n`;
      message += `   Total: ₦${itemTotal.toLocaleString()}\n`;
      if (item.image) {
        message += `   Image: ${item.image}\n`;
      }
      message += `\n`;
    });

    message += `*Subtotal:* ₦${subtotal.toLocaleString()}\n`;
    message += `*Total:* ₦${total.toLocaleString()}\n\n`;
    message += `Please confirm this order. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleUpdateQuantity = async (item, delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      await handleRemove(item);
    } else {
      await updateQuantity(item.id || item._id, newQuantity, item.color);
    }
  };

  const handleRemove = async (item) => {
    await removeFromCart(item.id || item._id, item.color);
    toast.error(`Item removed from cart`, {
      position: 'top-right',
      style: {
        background: '#0f172a',
        color: '#fff',
        borderRadius: '12px',
        fontSize: '14px',
      },
      iconTheme: { primary: '#EF4444', secondary: '#fff' },
    });
  };

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 mb-6">
            <FiShoppingBag size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8 max-w-md text-center">
            Looks like you haven't added anything to your cart yet. Discover our latest gadgets and start shopping!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/products"
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-sky-100 hover:scale-105"
            >
              Browse Products
            </Link>
            <Link
              to="/"
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all duration-300 border border-slate-200 flex items-center justify-center gap-2"
            >
              <FiHome size={18} />
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader text="Loading cart..." size="md" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-2 text-sky-500 font-semibold text-sm hover:text-sky-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id || item._id} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex gap-4 md:gap-6 items-center group transition-all duration-300 hover:shadow-md">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                    <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight truncate">{item.name}</h3>
                      <p className="text-xs md:text-sm text-slate-400 font-medium">{item.category} • {item.brand}</p>
                      {item.color && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Color: {item.color}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 shrink-0"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button
                          onClick={() => handleUpdateQuantity(item, -1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:text-sky-500 rounded-lg transition-all"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item, 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:text-sky-500 rounded-lg transition-all"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <p className="text-lg md:text-xl font-extrabold text-slate-900">₦{((item.discountPrice > 0 ? item.discountPrice : item.price || 0) * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 sticky top-24">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-900">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Shipping</span>
                  <span className="text-slate-500 text-sm">
                    Calculated at checkout
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                <span className="text-slate-900 font-bold text-lg">Total</span>
                <span className="text-3xl font-black text-sky-500 tracking-tighter">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-sky-100 flex items-center justify-center gap-3 group active:scale-95"
            >
              Checkout Now
              <FiArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-4">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-green-100 flex items-center justify-center gap-3 group active:scale-95"
              >
                <FiMessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                Send Order to WhatsApp
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest justify-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Secure checkout guaranteed
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Continue Shopping */}
        <div className="mt-6 sm:hidden">
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all duration-300 border border-slate-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GuestCart;
