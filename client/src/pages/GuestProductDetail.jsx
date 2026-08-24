import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiShoppingCart, FiArrowLeft, FiStar, FiTruck, FiShield, FiHeart, FiPlus, FiMinus, FiCheck } from 'react-icons/fi'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../lib/apiConfig'
import { useStore } from '../lib/useStore'
import { successToastOptions } from '../lib/toastConfig'
import Loader from '../components/Loader'

const RatingStars = ({ rating }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.3

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FaStar key={i} className="text-amber-400 h-4 w-4" />)
    } else if (i === fullStars && hasHalf) {
      stars.push(<FaStarHalfAlt key={i} className="text-amber-400 h-4 w-4" />)
    } else {
      stars.push(<FaRegStar key={i} className="text-amber-400 h-4 w-4" />)
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>
}

const GuestProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleFavorite, isFavorite } = useStore()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')

  useEffect(() => {
    setSelectedImageIndex(0)
    setSelectedColor('')
    let active = true
      ; (async () => {
        try {
          const { data } = await api.get(`/products/${id}`)
          if (active) setProduct(data.product)
        } catch (error) {
          console.error('Failed to load product', error)
        } finally {
          if (active) setLoading(false)
        }
      })()
    return () => { active = false }
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color')
      return
    }
    addToCart(product, quantity, selectedColor)
    toast.success(`${product.title} added to cart!`, successToastOptions)
    navigate('/cart')
  }

  const handleBuyNow = () => {
    if (!product) return
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color')
      return
    }
    addToCart(product, quantity, selectedColor)
    toast.success(`${product.title} added to cart!`, successToastOptions)
    navigate('/checkout')
  }

  const fav = product ? isFavorite(product) : false

  const handleToggleFavorite = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!product) return
    toggleFavorite(product)
    if (!fav) {
      toast.success(`${product.title} added to favourites!`, {
        position: 'top-right',
        style: { background: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '14px' },
        iconTheme: { primary: '#fbbf24', secondary: '#fff' },
      })
    } else {
      toast.error(`${product.title} removed from favourites!`, {
        position: 'top-right',
        style: { background: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '14px' },
        iconTheme: { primary: '#ef4444', secondary: '#fff' },
      })
    }
  }

  if (loading) {
     return (
       <>
         <Navbar />
         <div className="min-h-screen flex items-center justify-center bg-slate-50">
           <Loader text="Loading product..." size="md" />
         </div>
         <Footer />
       </>
     )
   }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Product not found</h2>
          <Link to="/products" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-xl transition-all">
            Back to Products
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const displayPrice = product.discountPrice || product.price
  const inStock = Number(product.stock) > 0
  const images = (product.images || []).map((i) => i?.url || i).filter(Boolean)
  const image = images[selectedImageIndex] || ''

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors text-sm font-medium"
            >
              <FiArrowLeft className="h-4 w-4" /> Back to Products
            </button>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="space-y-4">
                <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden relative">
                  {image ? (
                    <img src={image} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                  )}
                  {images.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-slate-900/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-bold">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {images.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-sky-500 shadow-lg shadow-sky-100'
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <img src={src} alt={`${product.title}-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                  {product.category}
                </span>

                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  {product.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <RatingStars rating={product.rating || 0} />
                    <span className="text-sm font-bold text-slate-700">
                      {Number(product.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  <span className="h-4 w-px bg-slate-200"></span>
                  {product.stock > 0 ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                      <FiCheck className="h-3.5 w-3.5" />
                      In Stock ({product.stock} left)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="mt-6 flex items-end gap-3">
                  <span className="text-4xl font-black text-slate-900">₦{Number(displayPrice).toLocaleString()}</span>
                  {product.discountPrice && (
                    <span className="text-lg font-medium text-slate-400 line-through">₦{Number(product.price).toLocaleString()}</span>
                  )}
                </div>

                {product.discountPrice && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-full w-fit">
                    Save ₦{(Number(product.price) - Number(product.discountPrice)).toLocaleString()}
                  </div>
                )}

                <p className="mt-6 text-slate-600 leading-relaxed">{product.description}</p>

                <div className="mt-8 space-y-5">
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Color</label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full max-w-xs px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm appearance-none cursor-pointer"
                      >
                        <option value="">Select a color</option>
                        {product.colors.map((color) => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white hover:text-sky-500 rounded-lg transition-all"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-slate-800 text-lg">{quantity}</span>
                        <button
                          onClick={() => setQuantity((q) => q + 1)}
                          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white hover:text-sky-500 rounded-lg transition-all"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={!inStock}
                      className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-8 py-4 font-bold text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-600 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      <FiShoppingCart className="h-5 w-5" /> Add to Cart
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={!inStock}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-600 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      Buy Now
                    </button>

                    <button
                      onClick={handleToggleFavorite}
                      className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-4 font-bold text-slate-700 shadow-sm hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all duration-200"
                    >
                      <FiHeart className={`h-5 w-5 ${fav ? 'text-rose-500 fill-current' : 'text-slate-400'}`} />
                    </button>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm">
                      <FiTruck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Fast, insured delivery</p>
                      <p className="text-xs text-slate-400">Nationwide shipping</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm">
                      <FiShield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Genuine &amp; warrantied</p>
                      <p className="text-xs text-slate-400">100% authentic products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default GuestProductDetail
