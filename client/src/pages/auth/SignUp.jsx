import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { signInWithPopup } from 'firebase/auth'
import { successToastOptions, errorToastOptions } from '../../lib/toastConfig'
import api, { setAccessToken } from '../../lib/apiConfig'
import { useStore } from '../../lib/useStore'
import Navbar from '../../components/Navbar'
import { auth, googleProvider } from './firebaseConfig'
import { calcPasswordStrength } from '../../lib/constants'
import {
  PasswordStrengthBar,
  inputClass,
  FormField,
  TogglePasswordButton,
  GoogleButton,
} from '../../lib/authUi'


// ─── Component ──

const SignUp = () => {

  const navigate = useNavigate()
  const { setUser } = useStore()
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
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  })

  const passwordVal = watch('password', '')
  const passwordStrength = calcPasswordStrength(passwordVal)




  const onSubmit = async (data) => {
    try {
      setIsLoading(true)

      const response = await api.post('/auth/register', {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      if (response.status === 201) {
        toast.success(response.data.message, successToastOptions)
        reset()
        setTimeout(() => {
          navigate('/signin')
        }, 1000)
      }
      else {
        toast.error(response.data.message, errorToastOptions)
      }
    } catch (err) {
      if (err?.response?.status === 400 || err?.response?.status === 500) {
        toast.error(err?.response?.data?.message, errorToastOptions)
      }
      else {
        toast.error("Something went wrong please try again", errorToastOptions)
        console.log("Unexpected error:", err);
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const res = await api.post('/auth/google-signin', {
        token: idToken,
      })

      const { accessToken, token, user } = res.data
      const finalAccessToken = accessToken || token
      setAccessToken(finalAccessToken)
      setUser(user)

      const successMessage = res.data.message || 'Signed in successfully!'
      toast.success(successMessage, successToastOptions)
      reset()

      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Error logging in with Google'
      console.error('Authentication Error:', error)
      toast.error(message, errorToastOptions)
    }
  }

  return (
    <>
      <Navbar />
      <div className='min-h-screen w-full bg-gradient-to-br from-slate-100 via-sky-300 to-blue-500 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md mx-auto'>

          {/* ── Page Heading ── */}
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold text-slate-900'>Join Gadgetspot</h1>
            <p className='text-slate-600 font-medium mt-2'>Create your account and start shopping</p>
          </div>

          {/* ── Card ── */}
          <div className='bg-white rounded-3xl shadow-xl p-8 border border-slate-100'>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-5'>

              {/* Full Name */}
              <FormField label='Full Name' error={errors.fullName}>
                <div className='relative'>
                  <FiUser className='absolute left-3.5 top-3.5 text-sky-400 h-5 w-5' />
                  <input
                    type='text'
                    placeholder='Full Name'
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Full name must be at least 2 characters'
                      }
                    })}
                    className={inputClass(errors.fullName)}
                  />
                </div>
              </FormField>

              {/* Email */}
              <FormField label='Email Address' error={errors.email}>
                <div className='relative'>
                  <FiMail className='absolute left-3.5 top-3.5 text-sky-400 h-5 w-5' />
                  <input
                    type='email'
                    placeholder='your@email.com'
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className={inputClass(errors.email)}
                  />
                </div>
              </FormField>

              {/* Phone (optional) */}
              <FormField label='Phone Number' error={errors.phone}>
                <div className='relative'>
                  <FiPhone className='absolute left-3.5 top-3.5 text-sky-400 h-5 w-5' />
                  <input
                    type='tel'
                    placeholder='+(234) 80 9818 6177'
                    {...register('phone', {
                      validate: (value) => !value || value.trim().length >= 10 || 'Phone number must be at least 10 digits'
                    })}
                    className={inputClass(errors.phone)}
                  />
                </div>
              </FormField>

              {/* Password */}
              <FormField label='Password' error={errors.password}>
                <div className='relative'>
                  <FiLock className='absolute left-3.5 top-3.5 text-sky-400 h-5 w-5' />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Create a strong password'
                   {...register('password', {
                     required: 'Password is required',
                     minLength: {
                       value: 6,
                       message: 'Password must be at least 6 characters'
                     },
                     validate: {
                       hasUpperCase: (value) => /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                       hasNumber: (value) => /[0-9]/.test(value) || 'Password must contain at least one number',
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
              <FormField label='Confirm Password' error={errors.confirmPassword}>
                <div className='relative'>
                  <FiLock className='absolute left-3.5 top-3.5 text-sky-400 h-5 w-5' />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Confirm your password'
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

              {/* Terms & Conditions */}
              <div>
                <label className='flex items-start gap-3 pt-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    {...register('agreeToTerms', {
                      validate: (value) => value === true || 'You must agree to the Terms and Conditions'
                    })}
                    className={`w-5 h-5 rounded mt-0.5 cursor-pointer focus:ring-2 ${errors.agreeToTerms
                      ? 'border-red-400 focus:ring-red-100'
                      : 'border-slate-300 text-sky-500 focus:ring-sky-400'
                      }`}
                  />
                  <span className='text-sm font-medium text-slate-600'>
                    I agree to the{' '}
                    <Link to='/terms' className='text-sky-500 hover:text-sky-600 font-semibold'>Terms and Conditions</Link>
                    {' '}and{' '}
                    <Link to='/privacy-policy' className='text-sky-500 hover:text-sky-600 font-semibold'>Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className='text-red-500 text-xs font-semibold mt-1.5'>{errors.agreeToTerms.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full cursor-pointer  bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 mt-4'
              >
                {isLoading ? 'Creating Account…' : 'Create Account'}
              </button>

              {/* Divider + Sign In link */}
              <div className='relative my-6'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-slate-200' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-3 bg-white text-slate-600 font-medium'>
                    Already have an account?{' '}
                    <Link to='/signin' className='text-amber-400 hover:text-amber-500 font-bold'>
                      Sign In
                    </Link>
                  </span>
                </div>
              </div>
            </form>

            {/* ── Social Sign Up ── */}
            <div className='mt-2 pt-6 border-t border-slate-200'>
              <p className='text-center text-sm text-slate-600 font-medium mb-4'>Or sign up with</p>
              <GoogleButton label='Sign up with Google' onClick={handleGoogleSignIn} />
            </div>
          </div>

          {/* ── Footer ── */}
          <p className='text-center text-sm text-slate-600 mt-8 font-medium'>
            By creating an account, you agree to our{' '}
            <Link to='/terms' className='text-white hover:text-amber-500 font-semibold'>Terms</Link> and{' '}
            <Link to='/privacy-policy' className='text-white hover:text-sky-900 font-semibold'>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </>
  )
}



export default SignUp
