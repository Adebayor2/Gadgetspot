import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useStore } from '../lib/useStore';
import ColorSelectionModal from './ColorSelectionModal';

const RatingStars = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FaStar key={i} className="text-amber-400 h-3.5 w-3.5" />);
    } else if (i === fullStars && hasHalf) {
      stars.push(<FaStarHalfAlt key={i} className="text-amber-400 h-3.5 w-3.5" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-amber-400 h-3.5 w-3.5" />);
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
};

const normalizeProduct = (product) => {
  if (!product) return product;
  const image =
    product.image ||
    (Array.isArray(product.images) && product.images[0]?.url) ||
    '';
  const images = Array.isArray(product.images)
    ? product.images.map((i) => i?.url || i).filter(Boolean)
    : image ? [image] : [];
  return {
    ...product,
    id: product.id || product._id,
    name: product.name || product.title,
    image,
    images,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    featured: product.featured || false,
    colors: product.colors || [],
  };
};

const ProductCard = ({ product }) => {
  const p = normalizeProduct(product);
  const { name, category, price, discountPrice, stock, rating, reviews, image, images: imgList = [], badge, colors } = p;
  const { toggleFavorite, isFavorite, addToCart } = useStore();
  const navigate = useNavigate();

  const fav = isFavorite(p);
  const inStock = Number(stock) > 0;
  const hasDiscount = Number(discountPrice) > 0 && Number(discountPrice) < Number(price);
  const displayPrice = hasDiscount ? Number(discountPrice) : Number(price || 0);

  const [showColorModal, setShowColorModal] = useState(false);
  const [heartScale, setHeartScale] = useState(1);

  const animateHeart = () => {
    setHeartScale(1.4);
    setTimeout(() => setHeartScale(1), 200);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    e.preventDefault();
    animateHeart();
    const wasFavorite = fav;
    toggleFavorite(p);
    if (!wasFavorite) {
      toast.success(`${name} added to favourites!`, {
        position: 'top-right',
        style: {
          background: '#0f172a',
          color: '#fff',
          borderRadius: '12px',
          fontSize: '14px',
        },
        iconTheme: {
          primary: '#fbbf24',
          secondary: '#fff',
        },
      });
    } else {
      toast.error(`${name} removed from favourites!`, {
        position: 'top-right',
        style: {
          background: '#0f172a',
          color: '#fff',
          borderRadius: '12px',
          fontSize: '14px',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      });
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!inStock) return;
    if (colors && colors.length > 0) {
      setShowColorModal(true);
    } else {
      addToCart(p, 1);
      toast.success(`${name} added to cart!`, {
        position: 'top-right',
        style: {
          background: '#0f172a',
          color: '#fff',
          borderRadius: '12px',
          fontSize: '14px',
        },
        iconTheme: {
          primary: '#38bdf8',
          secondary: '#fff',
        },
      });
    }
  };

  const handleColorConfirm = (selectedColor) => {
    addToCart(p, 1, selectedColor);
    toast.success(`${name} (${selectedColor}) added to cart!`, {
      position: 'top-right',
      style: {
        background: '#0f172a',
        color: '#fff',
        borderRadius: '12px',
        fontSize: '14px',
      },
      iconTheme: {
        primary: '#38bdf8',
        secondary: '#fff',
      },
    });
    navigate('/cart');
  };

  const badgeClasses = badge === 'PREMIUM'
    ? 'bg-[#fbf6eb] text-[#b88c3a] border border-[#f5ebd5]'
    : 'bg-emerald-50 text-emerald-700 border border-emerald-100';

  return (
    <>
      <Link
        to={`/products/${p.id || p._id}`}
        className="group bg-white overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          {/* Image */}
          <div className="relative h-60 overflow-hidden bg-slate-50">
            <HoverSwap images={imgList} altText={name} />
            {!inStock && <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Out of stock</span>}
            {hasDiscount && <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">-{Math.round(((Number(price) - Number(discountPrice)) / Number(price)) * 100)}%</span>}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                animateHeart();
                handleToggleFavorite(e);
              }}
              className="absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white transition-colors duration-200 cursor-pointer"
              aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
            >
              <FiHeart
                style={{ transform: `scale(${heartScale})` }}
                className={`h-4 w-4 transition-colors duration-200 ${fav ? 'text-amber-400 fill-current' : 'text-slate-400'
                  }`}
              />
            </button>
          </div>

          {/* Info */}
          <div className="p-5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#38bdf8]">
                {category}
              </span>
              {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${badgeClasses}`}>
                  {badge}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1.5 group-hover:text-sky-500 transition-colors duration-200 line-clamp-1">
              {name}
            </h3>

            <div className="flex items-center gap-2 ">
              <RatingStars rating={rating} />
              <span className="text-xs font-medium text-slate-400">({reviews.toLocaleString()})</span>
            </div>
          </div>
        </div>

        {/* Footer / Price */}
        <div className="p-5 pt-0 bg-slate-50/50 mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base md:text-xl font-bold text-slate-900">₦{displayPrice.toLocaleString()}</span>
            {hasDiscount && <span className="text-xs text-slate-400 line-through">₦{Number(price).toLocaleString()}</span>}
          </div>
          <button
            onClick={handleAddToCart}
            type="button"
            disabled={!inStock}
            className="inline-flex items-center justify-center cursor-pointer rounded-full bg-sky-400 text-white p-2 text-sm font-semibold shadow-md shadow-amber-100 transition-all duration-200 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            aria-label={inStock ? `Add ${name} to cart` : `${name} is out of stock`}
          >
            <FiShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </Link>

      <ColorSelectionModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        colors={colors}
        productName={name}
        onConfirm={handleColorConfirm}
      />
    </>
  );
};

const HoverSwap = ({ images = [], altText = '' }) => {
  const [idx, setIdx] = useState(0);
  const list = Array.isArray(images) ? images : [];

  const handleMouseEnter = () => {
    if (list.length > 1) setIdx(1);
  };
  const handleMouseLeave = () => setIdx(0);
  const handleClick = () => {
    if (list.length > 1) setIdx((i) => (i + 1) % list.length);
  };

  const src = list[idx] || '';

  return (
    <div className="relative h-60 overflow-hidden bg-slate-50" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
      {src ? (
        <img src={src} alt={altText} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
      )}
    </div>
  );
};

export default ProductCard;
