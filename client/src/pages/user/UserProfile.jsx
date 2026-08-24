import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDashboardLayout from '../../components/user/UserDashboardLayout';
import { FiUser, FiPhone, FiMail, FiMapPin, FiEdit2, FiSave, FiX, FiLock, FiLogOut, FiCheckCircle, FiAlertCircle, FiSend, FiKey } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useStore } from '../../lib/useStore';
import logoutUser from '../../lib/logOut';
import api from '../../lib/apiConfig';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useStore();

  const [editing, setEditing] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [emailForm, setEmailForm] = useState({
    currentPassword: '',
    newEmail: '',
    confirmEmail: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [emailErrors, setEmailErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

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

  const validateEmailField = (fieldName) => {
    let error = '';
    switch (fieldName) {
      case 'currentPassword':
        if (!emailForm.currentPassword) error = 'Current password is required';
        break;
      case 'newEmail':
        if (!emailForm.newEmail) error = 'New email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) error = 'Please enter a valid email address';
        break;
      case 'confirmEmail':
        if (!emailForm.confirmEmail) error = 'Please confirm your email';
        else if (emailForm.newEmail !== emailForm.confirmEmail) error = 'Emails do not match';
        break;
      default:
        break;
    }
    setEmailErrors((prev) => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  const validateEmailForm = () => {
    const fields = ['currentPassword', 'newEmail', 'confirmEmail'];
    let isValid = true;
    fields.forEach((field) => {
      if (!validateEmailField(field)) isValid = false;
    });
    return isValid;
  };

  const validatePasswordField = (fieldName) => {
    let error = '';
    switch (fieldName) {
      case 'currentPassword':
        if (!passwordForm.currentPassword) error = 'Current password is required';
        break;
      case 'newPassword':
        if (!passwordForm.newPassword) error = 'New password is required';
        else if (passwordForm.newPassword.length < 8) error = 'New password must be at least 8 characters';
        break;
      case 'confirmPassword':
        if (!passwordForm.confirmPassword) error = 'Please confirm your password';
        else if (passwordForm.newPassword !== passwordForm.confirmPassword) error = 'Passwords do not match';
        break;
      default:
        break;
    }
    setPasswordErrors((prev) => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  const validatePasswordForm = () => {
    const fields = ['currentPassword', 'newPassword', 'confirmPassword'];
    let isValid = true;
    fields.forEach((field) => {
      if (!validatePasswordField(field)) isValid = false;
    });
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    await logoutUser({ logout, navigate });
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const { data } = await api.post('/auth/resend-verification');
      toast.success(data.message || 'Verification email sent successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification email';
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailErrors({});

    if (!validateEmailForm()) {
      return;
    }

    setEmailLoading(true);
    try {
      const { data } = await api.post('/auth/change-email', {
        currentPassword: emailForm.currentPassword,
        newEmail: emailForm.newEmail,
      });
      updateUser(data.user);
      toast.success(data.message || 'Email changed successfully');
      setChangingEmail(false);
      setEmailForm({ currentPassword: '', newEmail: '', confirmEmail: '' });
      setEmailErrors({});
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change email';
      toast.error(message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrors({});

    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(data.message || 'Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
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
    <UserDashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-sm md:text-base font-medium text-slate-400 mt-1.5">
            Manage your personal information and account settings.
          </p>
        </div>

        {!user?.isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <FiAlertCircle className="text-amber-500 text-xl shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Please verify your email</p>
              <p className="text-xs text-amber-600 mt-1">
                We sent a verification link to <span className="font-semibold">{user?.email}</span>. Check your inbox and spam folder.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold text-amber-700 hover:text-amber-800 disabled:opacity-60 transition-colors"
              >
                <FiSend size={14} />
                {resendLoading ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 border-b border-slate-100 bg-slate-50/40">
            <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-sky-100 shrink-0">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-slate-800">{user?.fullName || 'User'}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-sm text-slate-500">{user?.email}</p>
                {user?.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <FiCheckCircle size={12} /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    <FiAlertCircle size={12} /> Unverified
                  </span>
                )}
              </div>
            </div>
            {!editing && (
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all active:scale-95 text-sm shrink-0"
              >
                <FiEdit2 size={16} /> Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form className="p-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={(e) => { handleChange(e); setFormErrors((prev) => ({ ...prev, fullName: '' })); }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${formErrors.fullName ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
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
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${formErrors.phone ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.phone}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Address</label>
                <textarea
                  rows="3"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Not provided"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm resize-none"
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
                  className="flex-1 px-6 py-3 rounded-xl bg-sky-500 text-white font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : (<><FiSave size={16} /> Save Changes</>)}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 grid gap-4 sm:grid-cols-2">
              <InfoCard icon={<FiUser size={18} />} label="Full Name" value={user?.fullName} />
              <InfoCard icon={<FiMail size={18} />} label="Email" value={user?.email} />
              <InfoCard icon={<FiPhone size={18} />} label="Phone" value={user?.phone} />
              <InfoCard icon={<FiMapPin size={18} />} label="Address" value={user?.address} />
              <InfoCard icon={<FiUser size={18} />} label="Account Type" value={user?.role} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-6 border-b border-slate-100 bg-slate-50/40">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Email Address</h2>
              <p className="text-sm text-slate-500 mt-1">Update your email address. You will need to verify the new email.</p>
            </div>
            <FiMail className="text-sky-500 text-2xl" />
          </div>

          {!changingEmail ? (
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current email</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={() => setChangingEmail(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all active:scale-95 text-sm"
                >
                  <FiMail size={16} /> Change Email
                </button>
              </div>
            </div>
          ) : (
            <form className="p-6 space-y-5" onSubmit={handleEmailSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Current Password</label>
                <div className="relative">
                  <FiKey className="absolute left-3.5 top-3.5 text-sky-400 h-5 w-5" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={emailForm.currentPassword}
                    onChange={(e) => { handleEmailChange(e); setEmailErrors((prev) => ({ ...prev, currentPassword: '' })); }}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${emailErrors.currentPassword ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                  />
                </div>
                {emailErrors.currentPassword && <p className="text-red-500 text-xs font-semibold mt-1">{emailErrors.currentPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">New Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 text-sky-400 h-5 w-5" />
                  <input
                    type="email"
                    name="newEmail"
                    value={emailForm.newEmail}
                    onChange={(e) => { handleEmailChange(e); setEmailErrors((prev) => ({ ...prev, newEmail: '' })); }}
                    placeholder="your@email.com"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${emailErrors.newEmail ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                  />
                </div>
                {emailErrors.newEmail && <p className="text-red-500 text-xs font-semibold mt-1">{emailErrors.newEmail}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 text-sky-400 h-5 w-5" />
                  <input
                    type="email"
                    name="confirmEmail"
                    value={emailForm.confirmEmail}
                    onChange={(e) => { handleEmailChange(e); setEmailErrors((prev) => ({ ...prev, confirmEmail: '' })); }}
                    placeholder="your@email.com"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${emailErrors.confirmEmail ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                  />
                </div>
                {emailErrors.confirmEmail && <p className="text-red-500 text-xs font-semibold mt-1">{emailErrors.confirmEmail}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setChangingEmail(false); setEmailForm({ currentPassword: '', newEmail: '', confirmEmail: '' }); setEmailErrors({}); }}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                  <FiX size={16} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-sky-500 text-white font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {emailLoading ? 'Updating...' : (<><FiSave size={16} /> Update Email</>)}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-6 border-b border-slate-100 bg-slate-50/40">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
              <p className="text-sm text-slate-500 mt-1">Update your password to keep your account secure.</p>
            </div>
            <FiLock className="text-sky-500 text-2xl" />
          </div>

          <form className="p-6 space-y-5" onSubmit={handlePasswordSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Current Password</label>
              <div className="relative">
                <FiKey className="absolute left-3.5 top-3.5 text-sky-400 h-5 w-5" />
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => { handlePasswordChange(e); setPasswordErrors((prev) => ({ ...prev, currentPassword: '' })); }}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${passwordErrors.currentPassword ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                />
              </div>
              {passwordErrors.currentPassword && <p className="text-red-500 text-xs font-semibold mt-1">{passwordErrors.currentPassword}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
              <div className="relative">
                <FiKey className="absolute left-3.5 top-3.5 text-sky-400 h-5 w-5" />
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => { handlePasswordChange(e); setPasswordErrors((prev) => ({ ...prev, newPassword: '' })); }}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${passwordErrors.newPassword ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                />
              </div>
              {passwordErrors.newPassword && <p className="text-red-500 text-xs font-semibold mt-1">{passwordErrors.newPassword}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
              <div className="relative">
                <FiKey className="absolute left-3.5 top-3.5 text-sky-400 h-5 w-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => { handlePasswordChange(e); setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' })); }}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${passwordErrors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-sky-500'}`}
                />
              </div>
              {passwordErrors.confirmPassword && <p className="text-red-500 text-xs font-semibold mt-1">{passwordErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full px-6 py-3 rounded-xl bg-sky-500 text-white font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all active:scale-95 text-sm disabled:opacity-60"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="flex justify-center">
          <button onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-rose-600 font-bold hover:bg-rose-50 transition-colors text-sm"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="h-8 lg:h-0"></div>
    </UserDashboardLayout>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 wrap-break-word">{value || 'N/A'}</p>
    </div>
  </div>
);

export default Profile;
