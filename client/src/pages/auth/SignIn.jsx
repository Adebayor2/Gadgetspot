import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { signInWithPopup } from 'firebase/auth'

import { successToastOptions, errorToastOptions } from '../../lib/toastConfig'
import { useStore } from '../../lib/useStore'
import api, { setAccessToken } from '../../lib/apiConfig'
import Navbar from '../../components/Navbar'
import { auth, googleProvider } from './firebaseConfig'
import { GoogleButton } from '../../lib/authUi'



const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setUser } = useStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })



  const onSubmit = async (data) => {
    try {
      setIsLoading(true)

      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      })

      const { accessToken, user } = response.data
      setAccessToken(accessToken)
      setUser(user)

      const successMessage = response.data.message || 'Signed in successfully!'
      toast.success(successMessage, successToastOptions)
      reset()

      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to sign in. Please try again.';
      toast.error(message, errorToastOptions)
      console.error('Sign in error:', error);

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
      const message = error.response?.data?.message || 'Error logging in with Google'
      console.log('Authentication Error:', error)
      toast.error(message, errorToastOptions)
    }
  }

  return (
    <>
      <Navbar />
      <div className='min-h-screen w-full bg-linear-to-br from-slate-100 via-sky-300 to-blue-500 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md mx-auto'>


          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold text-slate-900 mb-2'>Welcome Back!</h1>
            <p className='text-slate-600 font-medium'>Sign in to your Gadgetspot account</p>
          </div>


          <div className='bg-white rounded-3xl shadow-xl p-8 border border-slate-100'>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-6'>


              <div>
                <label className='block text-sm font-semibold text-slate-800 mb-2.5'>
                  Email Address
                </label>
                <div className='relative'>
                  <FiMail className='absolute left-3.5 top-3.5 text-sky-400 h-5 w-5' />
                  <input
                    id="signin-email"
                    type='email'
                    placeholder='you@example.com'
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-slate-900 placeholder-slate-400 ${errors.email
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className='text-red-500 text-xs font-semibold mt-1.5'>{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className='block text-sm font-semibold text-slate-800 mb-2.5'>
                  Password
                </label>
                <div className='relative'>
                  <FiLock className='absolute left-3.5 top-3.5 text-sky-400 h-5 w-5' />
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-slate-900 placeholder-slate-400 ${errors.password
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                      }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword((prev) => !prev)}
                    className=' absolute right-3.5 top-3.5 text-slate-400 hover:text-sky-500 transition-colors duration-200'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEye className='h-5 w-5' /> : <FiEyeOff className='h-5 w-5' />}
                  </button>
                </div>
                {errors.password && (
                  <p className='text-red-500 text-xs font-semibold mt-1.5'>{errors.password.message}</p>
                )}
              </div>


              <div className='flex items-center justify-between pt-2'>
                <label className='flex items-center gap-2.5 cursor-pointer'>
                  <input
                    type='checkbox'
                    className='w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400'
                  />
                  <span className='text-sm font-medium text-slate-600'>Remember me</span>
                </label>
                <Link to='/forgotpassword'
                  className='text-sm cursor-pointer font-semibold text-sky-500 hover:text-sky-600 transition-colors duration-200'
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full cursor-pointer  bg-linear-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 mt-4'
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className='relative my-6'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-slate-200' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-3 bg-white text-slate-500 font-medium'>
                    New to Gadgetspot?
                  </span>

                  <span><Link to="/signup" className='text-amber-400 font-bold'>Sign Up</Link></span>
                </div>
              </div>


            </form>

            {/* ── Social Login ── */}
            <div className='mt-8 pt-6 border-t border-slate-200'>
              <p className='text-center text-sm text-slate-600 font-medium mb-4'>Or continue with</p>
              <GoogleButton label='Sign in with Google' onClick={handleGoogleSignIn} />
            </div>
          </div>

          {/* ── Footer ── */}
          <p className='text-center text-sm text-slate-600 mt-8 font-medium'>
            By signing in, you agree to our{' '}
            <Link to='/terms' className='text-slate-100 hover:text-slate-900 font-semibold'>Terms</Link> and{' '}
            <Link to='/privacy-policy' className='text-slate-100 hover:text-slate-900 font-semibold'>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default SignIn