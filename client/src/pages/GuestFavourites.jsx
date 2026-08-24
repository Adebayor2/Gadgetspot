import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../lib/useStore'
import { toast } from 'react-hot-toast'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { FiTrash2 } from 'react-icons/fi'
import Loader from '../components/Loader'

const GuestFavourites = () => {
  const { favorites, removeFavorite, loadServerData, user } = useStore();
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

  const handleRemove = async (product) => {
    await removeFavorite(product);
    const productName = product.name || product.title || 'Item';
    toast.error(`${productName} removed from favourites`, {
      position: 'top-right',
      style: {
        background: '#0f172a',
        color: '#fff',
        borderRadius: '12px',
        fontSize: '14px',
      },
    
    });
  };

  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">My Favourites</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader text="Loading favourites..." size="md" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg mb-4">You have no favourites yet.</p>
            <Link to="/products" className="inline-block bg-sky-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-sky-600 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <div key={product._id || product.id} className="relative">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleRemove(product);
                    }}
                    className="rounded-full bg-white/90 p-2 shadow-sm hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                    aria-label="Remove from favourites"
                  >
                    <FiTrash2 className="h-4 w-4 text-slate-500 hover:text-red-500" />
                  </button>
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default GuestFavourites
