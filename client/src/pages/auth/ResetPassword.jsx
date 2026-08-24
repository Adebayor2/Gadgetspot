import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiLock } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { successToastOptions, errorToastOptions } from '../../lib/toastConfig'
import api from '../../lib/apiConfig'
import Navbar from '../../components/Navbar'
import { calcPasswordStrength } from '../../lib/constants'
import {
  PasswordStrengthBar,
  inputClass,
  FormField,
  TogglePasswordButton,
} from '../../lib/authUi'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const passwordVal = watch('password', '')
  const passwordStrength = calcPasswordStrength(passwordVal)

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/reset-password', {
        token: token,
        password: data.password,
      })
      toast.success(response.data.message || 'Password has been reset successfully!', successToastOptions)
      reset()
      setTimeout(() => {
        navigate('/signin')
      }, 1500)
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to reset password. Please try again.'
      toast.error(errMsg, errorToastOptions)
      console.error('Password reset error:', err)

    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className='min-h-screen w-full bg-linear-to-br from-slate-100 via-sky-300 to-blue-500 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md mx-auto'>

          {/* ── Page Heading ── */}
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold text-slate-900'>Reset Password</h1>
            <p className='text-slate-600 font-medium mt-2'>Set your new password below</p>
          </div>

          {/* ── Card ── */}
          <div className='bg-white rounded-3xl shadow-xl p-8 border border-slate-100'>

            {/* Warning if no token is present */}
            {!token && (
              <div className='mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium leading-relaxed'>
                <span className='font-bold block mb-1 text-amber-900'>Security Notice:</span>
                No reset token was detected in the URL. You can still test the interface validation, but an actual reset request requires a link sent by email.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-5'>

              {/* Password */}
              <FormField label='New Password' error={errors.password}>
                <div className='relative'>
                  <FiLock className='absolute left-3.5 top-3.5 text-sky-400 h-5 w-5' />
                   <input
                     type={showPassword ? 'text' : 'password'}
                     placeholder='Enter new password'
                     {...register('password', {
                       required: 'Password is required',
                       minLength: {
                         value: 8,
                         message: 'Password must be at least 8 characters'
                       }
                     })}
                     className={inputClass(errors.password, true)}
                   />
                  <TogglePasswordButton
                    show={showPassword}
                    onToggle={() => setShowPassword((prev) => !prev)}
                  />
                </div>
                {/* Password strength indicator */}
                {passwordVal && (
                  <PasswordStrengthBar strength={passwordStrength} />
                )}
              </FormField>

              {/* Confirm Password */}
              <FormField label='Confirm New Password' error={errors.confirmPassword}>
                <div className='relative'>
                  <FiLock className='absolute left-3.5 top-3.5 text-sky-400 h-5 w-5' />
                   <input
                     type={showConfirmPassword ? 'text' : 'password'}
                     placeholder='Confirm new password'
                     {...register('confirmPassword', {
                       required: 'Please confirm your password',
                       validate: (value) => value === watch('password') || 'Passwords do not match'
                     })}
                     className={inputClass(errors.confirmPassword, true)}
                   />
                  <TogglePasswordButton
                    show={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((prev) => !prev)}
                  />
                </div>
              </FormField>

              {/* Submit */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full cursor-pointer bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 mt-4'
              >
                {isLoading ? 'Resetting Password…' : 'Reset Password'}
              </button>

              {/* Back to sign in */}
              <div className='text-center text-sm text-slate-600 mt-6'>
                Remembered your password?{' '}
                <Link to='/signin' className='text-amber-400 hover:text-amber-500 font-bold'>
                  Sign In
                </Link>
              </div>

            </form>
          </div>

          {/* ── Footer ── */}
          <p className='text-center text-sm text-slate-600 mt-8 font-medium'>
            By resetting your password, you agree to secure your credentials and abide by our{' '}
            <Link to='/terms' className='text-white hover:text-amber-500 font-semibold'>Terms</Link> and{' '}
            <Link to='/privacy-policy' className='text-white hover:text-sky-900 font-semibold'>Privacy Policy</Link>
          </p>

        </div>
      </div>
    </>
  )

}


// ─── Helper Components ───

export default ResetPassword
