import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft, FiStar, FiTruck, FiShield, FiTag,
  FiBox, FiEdit2, FiBarChart2, FiCheckCircle, FiXCircle
} from 'react-icons/fi'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../lib/apiConfig'
import Loader from '../../components/Loader'

const RatingStars = ({ rating }) => {
  const stars = []
  const full = Math.floor(rating)
  const half = rating - full >= 0.3
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<FaStar key={i} className="text-amber-400 h-4 w-4" />)
    else if (i === full && half) stars.push(<FaStarHalfAlt key={i} className="text-amber-400 h-4 w-4" />)
    else stars.push(<FaRegStar key={i} className="text-amber-400 h-4 w-4" />)
  }
  return <div className="flex items-center gap-0.5">{stars}</div>
}

const Badge = ({ children, color = 'slate' }) => {
  const palette = {
    slate:   'bg-slate-100 text-slate-600',
    sky:     'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose:    'bg-rose-50 text-rose-600',
    amber:   'bg-amber-50 text-amber-600',
    purple:  'bg-purple-50 text-purple-600',
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${palette[color]}`}>
      {children}
    </span>
  )
}

const MetaRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
    <span className="text-slate-700 font-semibold text-sm">{value}</span>
  </div>
)

const AdminProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    setSelectedImageIndex(0)
    let active = true
    ;(async () => {
      try {
        const { data } = await api.get(`/products/${id}`)
        if (active) setProduct(data.product)
      } catch (err) {
        console.error('Failed to load product', err)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader text="Loading product details..." size="md" />
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-2">
            <FiXCircle className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Product not found</h2>
          <p className="text-slate-400 max-w-xs">The product you are looking for may have been deleted or does not exist.</p>
          <button
            onClick={() => navigate('/admin/products')}
            className="mt-2 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95"
          >
            <FiArrowLeft className="h-4 w-4" /> Back to Products
          </button>
        </div>
      </AdminLayout>
    )
  }

  const displayPrice = product.discountPrice || product.price
  const hasDiscount  = Boolean(product.discountPrice)
  const discountPct  = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  const images = (product.images || []).map((i) => i?.url || i).filter(Boolean)
  const image  = images[selectedImageIndex] || ''
  const inStock = Number(product.stock) > 0

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-500 font-medium text-sm transition-colors"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <FiEdit2 className="h-4 w-4 text-sky-500" />
            Edit Product
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Product Details</h1>
          <p className="text-slate-400 font-medium mt-1 text-sm">
            Viewing full details for product ID: <span className="font-mono text-slate-600">{id}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          <div className="xl:col-span-2 space-y-3">
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="aspect-square bg-slate-50 flex items-center justify-center relative">
                {image ? (
                  <img src={image} alt={product.title} className="h-full w-full object-cover transition-all duration-300" />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-slate-300">
                    <FiBox className="h-12 w-12" />
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}
                {hasDiscount && (
                  <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    -{discountPct}% OFF
                  </div>
                )}
                {images.length > 0 && (
                  <div className="absolute bottom-4 right-4 bg-slate-900/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-bold">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="p-4 bg-white border-t border-slate-100">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {images.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-sky-500 shadow-md shadow-sky-100'
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-3 space-y-5">

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <Badge color="sky">{product.category}</Badge>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-2 leading-tight">{product.title}</h2>
                </div>
                <Badge color={inStock ? 'emerald' : 'rose'}>
                  {inStock ? (
                    <><FiCheckCircle className="inline mr-1" /> In Stock</>
                  ) : (
                    <><FiXCircle className="inline mr-1" /> Out of Stock</>
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <RatingStars rating={product.rating || 0} />
                <span className="text-sm font-semibold text-slate-500">
                  {Number(product.rating || 0).toFixed(1)} out of 5
                </span>
              </div>

              <div className="flex items-end gap-3 pt-1">
                <span className="text-4xl font-black text-slate-900">₦{Number(displayPrice).toLocaleString()}</span>
                {hasDiscount && (
                  <div className="flex flex-col leading-none pb-1">
                    <span className="text-base font-medium text-slate-400 line-through">
                      ₦{Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-rose-500 mt-0.5">
                      Save ₦{(Number(product.price) - Number(product.discountPrice)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{product.description || 'No description provided.'}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Inventory & Details</h3>
              <MetaRow icon={FiBox}       label="Stock Level" value={`${product.stock ?? 0} units`} />
              <MetaRow icon={FiTag}       label="Category"    value={product.category || 'N/A'} />
              <MetaRow icon={FiBarChart2} label="Rating"      value={`${Number(product.rating || 0).toFixed(1)} / 5.0`} />
              <MetaRow icon={FiStar}      label="Featured"    value={product.featured ? 'Yes' : 'No'} />
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center justify-between py-3.5 border-b border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <span className="text-xs font-bold uppercase tracking-widest">Colors</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {product.colors.map((color) => (
                      <span key={color} className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 text-[10px] font-bold uppercase tracking-wider">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500 flex-shrink-0">
                  <FiTruck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Fast Delivery</p>
                  <p className="text-xs text-slate-400">Insured, nationwide shipping</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500 flex-shrink-0">
                  <FiShield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Warranty Included</p>
                  <p className="text-xs text-slate-400">Genuine and warrantied product</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

export default AdminProductDetail
