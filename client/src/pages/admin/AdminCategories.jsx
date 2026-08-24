import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../lib/apiConfig';
import Loader from '../../components/Loader';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAdd = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '' });
    setNameError('');
    setIsModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setForm({ name: category.name || '', description: category.description || '' });
    setNameError('');
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError('');
    if (!form.name.trim()) {
      setNameError('Category name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        const { data } = await api.put(`/categories/${editingCategory._id}`, form);
        setCategories((prev) => prev.map((c) => (c._id === editingCategory._id ? data.category : c)));
        toast.success('Category updated successfully');
      } else {
        const { data } = await api.post('/categories', form);
        setCategories((prev) => [...prev, data.category]);
        toast.success('Category added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save category';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await api.delete(`/categories/${category._id}`);
      setCategories((prev) => prev.filter((c) => c._id !== category._id));
      toast.success('Category deleted successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete category';
      toast.error(message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-sky-500 tracking-tight">Category <span className='text-slate-900'>Management</span></h1>
            <p className="text-slate-400 font-medium mt-1">Create and organize product categories.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-amber-400 text-slate-800 font-bold shadow-sm shadow-amber-100 hover:bg-amber-500 hover:-translate-y-1 transition-all active:scale-95 whitespace-nowrap"
          >
            <FiPlus size={20} />
            <span>Add New Category</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-amber-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-bold text-slate-800 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-800 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-800 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10">
                      <div className="flex items-center justify-center">
                        <Loader text="Loading categories..." size="sm" />
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-400 font-medium">No categories found.</td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category._id} className="group hover:bg-amber-50/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                            <FiTag size={18} />
                          </div>
                          <p className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">{category.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{category.description || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(category)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <p className="text-slate-400 text-xs font-medium mt-1">
                    {editingCategory ? 'Update this category.' : 'Create a new product category.'}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all">
                  <FiTag size={20} />
                </button>
              </div>

              <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={(e) => { handleChange(e); setNameError(''); }}
                    placeholder="e.g. Laptops"
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${nameError ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
                  />
                  {nameError && <p className="text-red-500 text-xs font-semibold mt-1">{nameError}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                  <textarea
                    rows="3"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Optional description..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-medium text-slate-700 text-sm resize-none"
                  ></textarea>
                </div>
              </form>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-xl bg-amber-400 text-white font-bold shadow-lg shadow-amber-200 hover:bg-amber-500 transition-all active:scale-95 text-sm disabled:opacity-60"
                >
                  {saving ? 'Saving...' : (editingCategory ? 'Save Changes' : 'Add Category')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
