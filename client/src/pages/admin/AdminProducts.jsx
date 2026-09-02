import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductModal from '../../components/admin/AddProductModal';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiExternalLink, FiStar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../lib/apiConfig';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 20;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: productsPerPage,
      };
      if (searchQuery) {
        params.search = searchQuery;
      }
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const openAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreated = () => {
    fetchProducts();
  };

  const handleUpdated = (product) => {
    setProducts((prev) => prev.map((p) => (p._id === product._id ? product : p)));
  };

  const promptDelete = (product) => {
    setProductToDelete(product);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/products/${productToDelete._id}`);
      toast.success('Product deleted successfully');
      closeDeleteModal();
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchProducts();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete product';
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleFeatured = async (product) => {
    try {
      const { data } = await api.put(`/products/${product._id}`, {
        featured: !product.featured,
      });
      setProducts((prev) => prev.map((p) => (p._id === product._id ? data.product : p)));
      toast.success(data.product.featured ? 'Product marked as featured' : 'Product removed from featured');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update featured status';
      toast.error(message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-sky-500 tracking-tight">Products <span className='text-slate-900'>Management</span></h1>
            <p className="text-slate-400 font-medium mt-1">Manage, edit and add new items to your store catalog.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-amber-400 text-black font-bold shadow-xl shadow-amber-100 hover:bg-amber-500 hover:-translate-y-1 transition-all active:scale-95 whitespace-nowrap"
          >
            <FiPlus size={20} />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200/50 focus-within:bg-white focus-within:border-amber-300 transition-all group">
            <FiSearch className="text-slate-400 group-focus-within:text-amber-500" />
            <input
              type="text"
              placeholder="Search by product name, brand or category..."
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-50 text-slate-00 font-bold border border-slate-200 hover:bg-slate-100 transition-all">
            <FiFilter />
            <span>Filter</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-amber-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-bold text-slate-900 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-900 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-900 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-900 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-900 uppercase tracking-wider">Colors</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-900 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-900 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-900 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loading ? (
                   <tr>
                     <td colSpan={8} className="px-6 py-10">
                       <div className="flex items-center justify-center">
                         <Loader text="Loading products..." size="sm" />
                       </div>
                     </td>
                   </tr>
                 ) : products.length === 0 ? (
                   <tr>
                     <td colSpan={8} className="px-6 py-10 text-center text-slate-400 font-medium">No products found.</td>
                   </tr>
                 ) : (
                   products.map((product) => (
                    <tr key={product._id} className="group hover:bg-amber-50/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <ImageSwap images={product.images} altText={product.title} />
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">{product.title}</p>
                            <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none">ID: #{product._id.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold uppercase tracking-wider">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-600">{product.brand}</span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-800 text-sm">
                        {product.discountPrice ? (
                          <span>
                            <span className="text-slate-400 line-through mr-2 text-xs">₦{product.price}</span>
                            ₦{product.discountPrice}
                          </span>
                        ) : (
                          `₦${product.price}`
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.colors && product.colors.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.colors.map((color) => (
                              <span key={color} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                {color}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400">★</span>
                          <span className="text-sm font-bold text-slate-600">{product.rating || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 ">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-green-600 font-bold uppercase tracking-wider ${product.featured ? 'bg-green-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                          {product.featured ? <FiStar className="text-xs" /> : null}
                          {product.featured ? 'Featured' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleFeatured(product)}
                            className={`p-2 rounded-lg transition-all ${product.featured ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'}`}
                            title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            {product.featured ? <FiStar size={18} /> : <FiStar size={18} />}
                          </button>
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => promptDelete(product)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/products/${product._id}`)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                            title="View details"
                          >
                            <FiExternalLink size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/30">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsRange={{
                start: totalProducts > 0 ? (currentPage - 1) * productsPerPage + 1 : 0,
                end: Math.min(currentPage * productsPerPage, totalProducts),
              }}
              totalItems={totalProducts}
            />
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="fixed inset-0 bg-slate-900/50" onClick={closeDeleteModal} />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl">
                <FiTrash2 />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Confirm Deletion</h3>
                <p className="mt-2 text-sm text-slate-500">Are you sure you want to delete this product before be able to delete?</p>
                <p className="mt-3 text-sm text-slate-600 font-medium">{productToDelete.title}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition disabled:opacity-60"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const getImageUrl = (img) => {
  if (!img) return '';
  return typeof img === 'string' ? img : (img.url || img.path || '');
};

const ImageSwap = ({ images = [], altText = '' }) => {
  const [index, setIndex] = useState(0);
  const imgList = (Array.isArray(images) ? images : []).map(getImageUrl).filter(Boolean);

  const handleMouseEnter = () => {
    if (imgList.length > 1) setIndex((i) => (i + 1) % imgList.length);
  };

  const handleMouseLeave = () => setIndex(0);

  const handleClick = () => {
    if (imgList.length > 1) setIndex((i) => (i + 1) % imgList.length);
  };

  const src = imgList[index] || '';

  return (
    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 group-hover:scale-105 transition-transform cursor-pointer" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
      {src ? <img src={src} alt={altText} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>}
    </div>
  );
};

export default AdminProducts;
