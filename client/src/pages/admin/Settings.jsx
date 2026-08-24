import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiMail, FiKey, FiX, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useStore } from '../../lib/useStore';
import api from '../../lib/apiConfig';

const PasswordInput = ({ name, placeholder, field, icon, form, show, handleChange, toggleShow, error }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700 ml-1">{placeholder}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input
        type={show[field] ? 'text' : 'password'}
        name={name}
        value={form[name]}
        onChange={(e) => { handleChange(e); }}
        placeholder={placeholder}
        className={`w-full pl-11 pr-11 py-2.5 rounded-xl bg-amber-50/50 border focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${error ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-amber-500'}`}
      />
      <button
        type="button"
        onClick={() => toggleShow(field)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show[field] ? <FiEye size={18} /> : <FiEyeOff size={18} />}
      </button>
    </div>
    {error && <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>}
  </div>
);

const Settings = () => {
  const { user, updateUser } = useStore();

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const [changingEmail, setChangingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '', confirmEmail: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailErrors, setEmailErrors] = useState({});

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordShow = (field) => setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

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

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
          <p className="text-slate-400 font-medium mt-1">Manage your account security.</p>
        </div>

        {/* Change Email Card */}
        <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 max-w-2xl">
          <div className="flex items-center gap-3 pb-6 border-b border-amber-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <FiMail size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Change Email</h2>
              <p className="text-xs text-slate-400 font-medium">Update your email address.</p>
            </div>
          </div>

          {!changingEmail ? (
            <div className="mt-6">
              <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current email</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={() => setChangingEmail(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-white font-bold shadow-sm shadow-amber-200 hover:bg-amber-500 transition-all active:scale-95 text-sm"
                >
                  <FiMail size={16} /> Change Email
                </button>
              </div>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleEmailSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Current Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><FiKey size={16} /></span>
                  <input
                    type="password"
                    name="currentPassword"
                    value={emailForm.currentPassword}
                    onChange={(e) => { handleEmailChange(e); setEmailErrors((prev) => ({ ...prev, currentPassword: '' })); }}
                    placeholder="Enter current password"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-amber-50/50 border focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${emailErrors.currentPassword ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-amber-500'}`}
                  />
                </div>
                {emailErrors.currentPassword && <p className="text-red-500 text-xs font-semibold mt-1">{emailErrors.currentPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">New Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><FiMail size={16} /></span>
                  <input
                    type="email"
                    name="newEmail"
                    value={emailForm.newEmail}
                    onChange={(e) => { handleEmailChange(e); setEmailErrors((prev) => ({ ...prev, newEmail: '' })); }}
                    placeholder="your@email.com"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-amber-50/50 border focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${emailErrors.newEmail ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-amber-500'}`}
                  />
                </div>
                {emailErrors.newEmail && <p className="text-red-500 text-xs font-semibold mt-1">{emailErrors.newEmail}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><FiMail size={16} /></span>
                  <input
                    type="email"
                    name="confirmEmail"
                    value={emailForm.confirmEmail}
                    onChange={(e) => { handleEmailChange(e); setEmailErrors((prev) => ({ ...prev, confirmEmail: '' })); }}
                    placeholder="your@email.com"
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-amber-50/50 border focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all outline-none font-medium text-slate-700 text-sm ${emailErrors.confirmEmail ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-amber-500'}`}
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
                  className="flex-1 px-6 py-3 rounded-xl bg-amber-400 text-white font-bold shadow-sm shadow-amber-200 hover:bg-amber-500 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {emailLoading ? 'Updating...' : (<><FiSave size={16} /> Update Email</>)}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 max-w-2xl">
          <div className="flex items-center gap-3 pb-6 border-b border-amber-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <FiLock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
              <p className="text-xs text-slate-400 font-medium">Update your login password.</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
            <PasswordInput name="currentPassword" placeholder="Current Password" field="current" icon={<FiLock size={16} />} form={passwordForm} show={showPassword} handleChange={handlePasswordChange} toggleShow={togglePasswordShow} error={passwordErrors.currentPassword} />
            <PasswordInput name="newPassword" placeholder="New Password" field="next" icon={<FiLock size={16} />} form={passwordForm} show={showPassword} handleChange={handlePasswordChange} toggleShow={togglePasswordShow} error={passwordErrors.newPassword} />
            <PasswordInput name="confirmPassword" placeholder="Confirm New Password" field="confirm" icon={<FiCheck size={16} />} form={passwordForm} show={showPassword} handleChange={handlePasswordChange} toggleShow={togglePasswordShow} error={passwordErrors.confirmPassword} />

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full px-6 py-3 rounded-xl bg-amber-400 text-white font-bold shadow-sm shadow-amber-200 hover:bg-amber-500 transition-all active:scale-95 text-sm disabled:opacity-60"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;