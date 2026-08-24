import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { FiUser, FiPhone, FiMapPin, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useStore } from '../../lib/useStore';
import api from '../../lib/apiConfig';

const Profile = () => {
  const { user, updateUser } = useStore();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateProfileField = (fieldName) => {
    let error = '';
    switch (fieldName) {
      case 'fullName':
        if (!form.fullName.trim()) error = 'Full name is required';
        else if (form.fullName.trim().length < 2) error = 'Full name must be at least 2 characters';
        break;
      case 'phone':
        if (form.phone.trim() && form.phone.trim().length < 10) error = 'Phone number must be at least 10 digits';
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  const validateProfileForm = () => {
    const fields = ['fullName', 'phone'];
    let isValid = true;
    fields.forEach((field) => {
      if (!validateProfileField(field)) isValid = false;
    });
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = () => {
    setForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!validateProfileForm()) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', {
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
      });
      updateUser(data.user);
      toast.success(data.message || 'Profile updated successfully');
      setEditing(false);
      setFormErrors({});
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Profile</h1>
          <p className="text-slate-400 font-medium mt-1">View and edit your personal information.</p>
        </div>

        <div className="bg-white rounded-3xl border border-amber-100 shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 border-b border-slate-100 bg-amber-50/40">
            <div className="w-20 h-20 rounded-4xl bg-amber-400  flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-amber-100">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">{user?.fullName || 'Admin'}</h2>
              <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
            </div>
            {!editing && (
              <button
                onClick={startEdit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-black font-bold shadow-xl shadow-amber-100 hover:bg-amber-500 transition-all active:scale-95 text-sm"
              >
                <FiEdit2 size={16} /> Edit Profile
              </button>
            )}
          </div>

          {/* Body */}
          {editing ? (
            <form className="p-6 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={(e) => { handleChange(e); setFormErrors((prev) => ({ ...prev, fullName: '' })); }}
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${formErrors.fullName ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-amber-500'}`}
                />
                {formErrors.fullName && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.fullName}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => { handleChange(e); setFormErrors((prev) => ({ ...prev, phone: '' })); }}
                  placeholder="Not provided"
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${formErrors.phone ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-amber-500'}`}
                />
                {formErrors.phone && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Address</label>
                <textarea
                  rows="3"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Not provided"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-medium text-slate-700 text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                  <FiX size={16} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-xl bg-amber-400 text-white font-bold shadow-lg shadow-amber-200 hover:bg-amber-500 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : (<><FiSave size={16} /> Save Changes</>)}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 grid gap-4 sm:grid-cols-2">
              <InfoCard icon={<FiUser size={18} />} label="Full Name" value={user?.fullName} />
              <InfoCard icon={<FiPhone size={18} />} label="Phone" value={user?.phone} />
              <div className="sm:col-span-2">
                <InfoCard icon={<FiMapPin size={18} />} label="Address" value={user?.address} />
              </div>
              <InfoCard icon={<FiUser size={18} />} label="Email" value={user?.email} />
              <InfoCard icon={<FiUser size={18} />} label="Account Type" value={user?.role} />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 break-words">{value || 'N/A'}</p>
    </div>
  </div>
);

export default Profile;
