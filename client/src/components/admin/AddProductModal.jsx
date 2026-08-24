import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiPlus, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../lib/apiConfig';

const ProductForm = ({ product, onClose, onCreated, onUpdated }) => {
  const isEdit = Boolean(product);

  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get('/categories');
        const fetched = (data.categories || []).map((c) => c.name);
        if (active && fetched.length > 0) setCategoryOptions(fetched);
      } catch {
        // keep static fallback
      }
    })();
    return () => { active = false; };
  }, []);

  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    category: product?.category || '',
    brand: product?.brand || '',
    price: product?.price ?? '',
    discountPrice: product?.discountPrice > 0 && product?.price > 0
      ? Number((((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100).toFixed(2))
      : '',
    stock: product?.stock ?? '',
    colors: product?.colors?.join(', ') || '',
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(product?.images?.map((img) => img.url) || []);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const originalPrice = Number(form.price) || 0;
  const discountPercent = Number(form.discountPrice) || 0;
  const discountedPrice = originalPrice > 0 && discountPercent > 0
    ? Math.max(0, originalPrice * (1 - Math.min(discountPercent, 100) / 100))
    : 0;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    if (files.length === 0) return;

    // Append new files to existing selected files (limit to 5 total)
    const combinedFiles = [...images, ...files].slice(0, 5);
    setImages(combinedFiles);

    // Create previews for newly added files and append to existing previews (limit to 5)
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreview((prev) => [...(prev || []), ...newPreviews].slice(0, 5));

    // Clear the input so same file can be selected again if needed
    e.target.value = null;
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: '',
      brand: '',
      price: '',
      discountPrice: '',
      stock: '',
      colors: '',
    });
    setImages([]);
    setImagePreview([]);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.title.trim()) errors.title = 'Product name is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (!form.category.trim()) errors.category = 'Category is required';
    if (!form.brand.trim()) errors.brand = 'Brand is required';
    if (!form.price || Number(form.price) <= 0) errors.price = 'Valid price is required';
    if (discountPercent < 0 || discountPercent > 100) errors.discountPrice = 'Discount must be between 0 and 100';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('brand', form.brand);
      formData.append('price', form.price);
      formData.append('discountPrice', discountedPrice || 0);
      formData.append('stock', form.stock);
      formData.append('colors', form.colors);
      images.forEach((file) => formData.append('images', file));

      if (isEdit) {
        const { data } = await api.put(`/products/${product._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully');
        onClose();
        if (onUpdated) onUpdated(data.product);
      } else {
        if (images.length === 0) {
          toast.error('Please upload at least one image');
          setLoading(false);
          return;
        }
        const { data } = await api.post('/products/createproducts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product added successfully');
        resetForm();
        onClose();
        if (onCreated) onCreated(data.product);
      }
    } catch (error) {
      const message = error.response?.data?.message || (isEdit ? 'Failed to update product' : 'Failed to add product');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-slate-400 text-xs font-medium mt-1">
            {isEdit ? 'Update the details of this gadget.' : 'Fill in the details to list a new gadget.'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Form */}
      <form className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Product Images</label>
          <label className="border-2 border-dashed border-amber-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-amber-50/50 hover:bg-amber-50/50 hover:border-amber-500 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <FiUpload size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">Drop files or click to upload</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">PNG, JPG or WebP up to 5MB (max 5)</p>
            </div>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          {imagePreview.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreview.map((src, idx) => (
                <img key={idx} src={src} alt={`preview-${idx}`} className="h-16 w-16 rounded-xl object-cover border border-slate-200" />
              ))}
            </div>
          )}
          {isEdit && (
            <p className="text-[11px] text-slate-400">Existing images are kept; new uploads are added.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Product Name</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. iPhone 15 Pro"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${formErrors.title ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
            />
            {formErrors.title && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.title}</p>}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Price (₦)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${formErrors.price ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
            />
            {formErrors.price && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.price}</p>}
          </div>

          {/* Discount Price */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Discount (%) <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="number"
              name="discountPrice"
              value={form.discountPrice}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder="e.g. 15"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm"
            />
            {originalPrice > 0 && discountPercent > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
                <span className="text-slate-400 line-through">₦{originalPrice.toLocaleString()}</span>
                <span className="text-emerald-600">₦{discountedPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            )}
            {formErrors.discountPrice && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.discountPrice}</p>}
          </div>

          {/* Stock */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm"
            />
          </div>

          {/* Colors */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Colors <span className="text-slate-400 font-normal">(optional, comma separated)</span></label>
            <input
              type="text"
              name="colors"
              value={form.colors}
              onChange={handleChange}
              placeholder="e.g. Red, Blue, Black"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={(e) => { handleChange(e); setFormErrors((prev) => ({ ...prev, category: '' })); }}
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm appearance-none ${formErrors.category ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
            >
              <option value="">Select Category</option>
              {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {formErrors.category && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.category}</p>}
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={(e) => { handleChange(e); setFormErrors((prev) => ({ ...prev, brand: '' })); }}
              placeholder="e.g. Apple"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${formErrors.brand ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
            />
            {formErrors.brand && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.brand}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
          <textarea
            rows="3"
            name="description"
            value={form.description}
            onChange={(e) => { handleChange(e); setFormErrors((prev) => ({ ...prev, description: '' })); }}
            placeholder="Write product specifications..."
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm resize-none ${formErrors.description ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
          ></textarea>
          {formErrors.description && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.description}</p>}
        </div>
      </form>

      {/* Footer */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95 text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-6 py-3 rounded-xl bg-amber-400 text-slate-800 font-bold shadow-sm shadow-amber-200 hover:bg-amber-500 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
        >
          {loading ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? (<><FiSave size={18} />Save Changes</>) : (<><FiPlus size={18} />Add Product</>))}
        </button>
      </div>
    </>
  );
};

const ProductModal = ({ isOpen, onClose, product, onCreated, onUpdated }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
          <ProductForm
            key={product?._id || 'new'}
            product={product}
            onClose={onClose}
            onCreated={onCreated}
            onUpdated={onUpdated}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
