import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import UserDashboardLayout from '../../components/user/UserDashboardLayout';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import { FiSearch, FiChevronDown, FiFilter, FiX, FiRefreshCw } from 'react-icons/fi';
import api from '../../lib/apiConfig';

const UserProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [sortBy, setSortBy] = useState('Featured');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 15;

  useEffect(() => {
    const paramQuery = searchParams.get('search') || '';
    setSearchQuery(paramQuery);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);
        if (active) {
          const allProducts = productsRes.data.products || [];
          const cats = categoriesRes.data.categories || [];
          setCategories(['All', ...cats.map((c) => c.name)]);
          const uniqueBrands = [...new Set(allProducts.map((p) => p.brand).filter(Boolean))];
          setBrands(uniqueBrands.sort());
        }
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: productsPerPage,
          sort: sortBy === 'Featured' ? 'featured' : sortBy === 'PriceLowHigh' ? 'price_asc' : sortBy === 'PriceHighLow' ? 'price_desc' : sortBy === 'Rating' ? 'rating' : undefined,
        };
        if (searchQuery) params.search = searchQuery;
        if (selectedCategories.length > 0) params.category = selectedCategories;
        if (selectedBrands.length > 0) params.brand = selectedBrands;
        if (maxPrice < 2000000) params.maxPrice = maxPrice;

        const { data } = await api.get('/products', { params });
        if (active) {
          setDisplayProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.totalProducts || 0);
        }
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [searchQuery, selectedCategories, selectedBrands, maxPrice, sortBy, currentPage]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaxPrice(2000000);
    setSortBy('Featured');
    setCurrentPage(1);
    setSearchParams({});
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const renderFiltersContent = () => (
    <div className="space-y-8">
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
          Category
        </h4>
        {categoriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader text="Loading categories..." size="sm" />
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <div
                  key={cat}
                  onClick={() => handleCategoryToggle(cat)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                      ? 'border-[#38bdf8] bg-white'
                      : 'border-slate-200 group-hover:border-[#38bdf8]/60 bg-white'
                      }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-scaleIn" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-500 group-hover:text-slate-900'
                      }`}
                  >
                    {cat}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Price
          </h4>
          <span className="text-xs font-bold text-sky-500 bg-sky-50 px-2.5 py-0.5 rounded-full">
            Up to ₦{maxPrice.toLocaleString()}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="2000000"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#38bdf8] transition-all"
            style={{
              background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${(maxPrice / 2000000) * 100}%, #e2e8f0 ${(maxPrice / 2000000) * 100}%, #e2e8f0 100%)`,
            }}
          />
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>₦0</span>
            <span>₦2,000,000</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
          Brand
        </h4>
        {brands.length === 0 && !loading ? (
          <p className="text-xs text-slate-400 font-medium">No brands available</p>
        ) : (
          <div className="space-y-3">
            {brands.map((brand) => {
              const isSelected = selectedBrands.includes(brand);
              return (
                <div
                  key={brand}
                  onClick={() => handleBrandToggle(brand)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                      ? 'border-[#38bdf8] bg-white'
                      : 'border-slate-200 group-hover:border-[#38bdf8]/60 bg-white'
                      }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-scaleIn" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-500 group-hover:text-slate-900'
                      }`}
                  >
                    {brand}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(selectedCategories.length > 0 ||
        selectedBrands.length > 0 ||
        maxPrice < 2000000 ||
        searchQuery !== '') && (
          <button
            onClick={handleResetFilters}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-2xl text-xs font-bold transition-all duration-250 border border-slate-100 hover:border-rose-100 uppercase tracking-widest cursor-pointer"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
    </div>
  );

  return (
    <UserDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            All Products
          </h1>
          <p className="text-sm md:text-base font-medium text-slate-400 mt-1.5">
            Browse our complete catalog.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-64 shrink-0 hidden lg:block bg-white rounded-3xl border border-slate-100 p-6 shadow-xs sticky top-24">
            {renderFiltersContent()}
          </aside>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-3 flex-1 max-w-lg">
                <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2.5 w-full focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 transition-all shadow-xs">
                  <FiSearch className="text-slate-400 mr-2.5 w-5 h-5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const q = (searchQuery || '').trim();
                        if (q) setSearchParams({ search: q });
                        else setSearchParams({});
                      }
                    }}
                    className="bg-transparent text-sm text-slate-700 placeholder-slate-400 border-none outline-none w-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchParams({});
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:border-slate-300 transition-all shrink-0 active:scale-95 cursor-pointer shadow-xs"
                >
                  <FiFilter className="w-4 h-4 text-slate-500" />
                  <span>Filters</span>
                  {(selectedCategories.length > 0 ||
                    selectedBrands.length > 0 ||
                    maxPrice < 2000000) && (
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    )}
                </button>
              </div>

               <div className="flex items-center justify-between sm:justify-end gap-5">
                 <span className="text-sm font-semibold text-slate-400 shrink-0">
                   {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                 </span>

                <div className="relative shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-slate-200 rounded-2xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-600 outline-none cursor-pointer hover:border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all appearance-none shadow-xs"
                  >
                    <option value="Featured">Featured</option>
                    <option value="PriceLowHigh">Price: Low to High</option>
                    <option value="PriceHighLow">Price: High to Low</option>
                    <option value="Rating">Customer Rating</option>
                  </select>
                  <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                </div>
              </div>
            </div>

             {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader text="Loading products..." size="md" />
                </div>
             ) : displayProducts.length > 0 ? (
              <div className="space-y-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsRange={{
                    start: indexOfFirstProduct + 1,
                    end: Math.min(indexOfLastProduct, totalProducts),
                  }}
                  totalItems={totalProducts}
                />
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs max-w-md mx-auto my-12">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <FiSearch className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
                <p className="text-sm text-slate-400 font-medium mb-6">
                  We couldn't find anything matching your filters or search terms.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-sky-100 cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isFilterDrawerOpen ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'
            }`}
        >
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
          />
          <div
            className={`absolute inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-out transform ${isFilterDrawerOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-bold text-slate-800">Filters</h3>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-90"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(100vh-160px)] pr-2 scrollbar-thin">
                {renderFiltersContent()}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6">
                 <button
                   onClick={() => setIsFilterDrawerOpen(false)}
                   className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl text-sm transition-all duration-200 active:scale-95 shadow-md shadow-sky-100 cursor-pointer"
                 >
                   Show {totalProducts} Results
                 </button>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default UserProducts;
