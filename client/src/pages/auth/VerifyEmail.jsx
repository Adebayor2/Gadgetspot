import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiLoader,
  FiArrowRight,
  FiRefreshCw,
  FiHome,
  FiUser,
  FiLogIn,
  FiMail,
  FiPause,
  FiPlay,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { successToastOptions, errorToastOptions } from '../../lib/toastConfig'
import api from '../../lib/apiConfig'
import { useStore } from '../../lib/useStore'
import Navbar from '../../components/Navbar'

const COUNTDOWN_SECONDS = 5

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, updateUser } = useStore()

  const tokenParam = searchParams.get('token')
  const statusParam = searchParams.get('status')

  // Verification state: 'loading' | 'success' | 'invalid' | 'expired' | 'error' | 'no_token'
  const [state, setState] = useState(() => {
    if (tokenParam) return 'loading'
    if (statusParam === 'success') return 'success'
    if (statusParam === 'expired') return 'expired'
    if (statusParam === 'invalid') return 'invalid'
    if (statusParam === 'error') return 'error'
    return 'no_token'
  })

  const [message, setMessage] = useState(() => {
    if (tokenParam) return 'Please wait while we verify your email address...'
    if (statusParam === 'success') return 'Your email has been verified successfully. You can now access all features.'
    if (statusParam === 'expired') return 'This verification link has expired. Please request a new verification email.'
    if (statusParam === 'invalid') return 'This verification link is invalid or has already been used.'
    if (statusParam === 'error') return 'Something went wrong while verifying your email. Please try again later.'
    return 'No verification token was provided in the link. Please check the link in your email or request a new one.'
  })

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [isPaused, setIsPaused] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const verificationAttempted = useRef(false)

  // Determine redirect target based on user auth status
  const getRedirectDestination = useCallback(() => {
    if (state === 'success') {
      if (user) {
        return user.role === 'admin' ? '/admin/dashboard' : '/dashboard'
      }
      return '/signin'
    }
    // For failed states
    if (user) {
      return '/user/profile'
    }
    return '/signin'
  }, [state, user])

  const destinationLabel =
    state === 'success'
      ? user
        ? user.role === 'admin'
          ? 'Admin Dashboard'
          : 'Dashboard'
        : 'Sign In'
      : user
        ? 'Profile'
        : 'Sign In'

  // Call the backend API to verify email
  const verifyToken = useCallback(
    async (tokenToVerify) => {
      try {
        setState('loading')
        setMessage('Verifying your email token with the server...')

        const response = await api.post('/auth/verify-email', { token: tokenToVerify })
        const data = response.data

        setState('success')
        const successMsg = data.message || 'Your email has been verified successfully!'
        setMessage(successMsg)

        // If user is logged in, sync store state
        if (user) {
          updateUser({ isVerified: true, ...(data.user || {}) })
        }

        toast.success(successMsg, successToastOptions)
      } catch (error) {
        console.error('Email verification error:', error)
        const errorStatus = error.response?.data?.status || 'invalid'
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          'Verification failed. The link may be invalid or expired.'

        setState(errorStatus === 'expired' ? 'expired' : errorStatus === 'error' ? 'error' : 'invalid')
        setMessage(errorMsg)
        toast.error(errorMsg, errorToastOptions)
      }
    },
    [user, updateUser]
  )

  // Trigger verification on mount if token is present
  useEffect(() => {
    if (tokenParam && !verificationAttempted.current) {
      verificationAttempted.current = true
      verifyToken(tokenParam)
    } else if (!tokenParam && statusParam === 'success' && user && !user.isVerified) {
      updateUser({ isVerified: true })
    }
  }, [tokenParam, statusParam, user, updateUser, verifyToken])

  // Countdown timer and auto-redirect
  useEffect(() => {
    if (state === 'loading' || isPaused) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          const target = getRedirectDestination()
          navigate(target)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [state, isPaused, getRedirectDestination, navigate])

  // Handle manual resend verification
  const handleResend = async () => {
    if (!user) {
      navigate('/signin')
      return
    }

    try {
      setResendLoading(true)
      const res = await api.post('/auth/resend-verification')
      setResendSuccess(true)
      toast.success(res.data?.message || 'New verification email sent!', successToastOptions)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend verification email.'
      toast.error(msg, errorToastOptions)
    } finally {
      setResendLoading(false)
    }
  }

  // UI Configuration based on state
  let config = {
    title: 'Verifying your email...',
    badge: 'Verifying',
    Icon: FiLoader,
    iconBg: 'bg-sky-100 text-sky-600 ring-8 ring-sky-50',
    cardBorder: 'border-sky-200',
    primaryColor: 'from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-200',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  }

  if (state === 'success') {
    config = {
      title: 'Email Verified Successfully!',
      badge: 'Verified',
      Icon: FiCheckCircle,
      iconBg: 'bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50',
      cardBorder: 'border-emerald-200',
      primaryColor: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }
  } else if (state === 'expired') {
    config = {
      title: 'Verification Link Expired',
      badge: 'Expired',
      Icon: FiAlertTriangle,
      iconBg: 'bg-amber-100 text-amber-600 ring-8 ring-amber-50',
      cardBorder: 'border-amber-200',
      primaryColor: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-200',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    }
  } else if (state === 'invalid' || state === 'no_token') {
    config = {
      title: 'Verification Failed',
      badge: state === 'no_token' ? 'Missing Token' : 'Invalid Link',
      Icon: FiAlertCircle,
      iconBg: 'bg-rose-100 text-rose-600 ring-8 ring-rose-50',
      cardBorder: 'border-rose-200',
      primaryColor: 'from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-rose-200',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    }
  } else if (state === 'error') {
    config = {
      title: 'Verification Error',
      badge: 'Server Error',
      Icon: FiAlertCircle,
      iconBg: 'bg-red-100 text-red-600 ring-8 ring-red-50',
      cardBorder: 'border-red-200',
      primaryColor: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-200',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
    }
  }

  const { Icon } = config
  const progressPercent = Math.max(0, Math.min(100, (countdown / COUNTDOWN_SECONDS) * 100))

  return (
    <>
      <Navbar />
      <main
        id='verify-email-page'
        className='min-h-[calc(100vh-80px)] w-full bg-linear-to-br from-slate-100 via-sky-300 to-blue-500 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center'
      >
        <div className='mx-auto max-w-md w-full'>
          <div
            id='verify-email-card'
            className={`bg-white/95 backdrop-blur-md rounded-3xl border ${config.cardBorder} p-8 text-center shadow-2xl transition-all duration-300`}
          >
            {/* ── Status Icon ── */}
            <div className='flex justify-center mb-5'>
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${config.iconBg} transition-all duration-500`}
              >
                <Icon
                  className={`text-4xl ${state === 'loading' ? 'animate-spin' : 'transition-transform duration-300 hover:scale-110'}`}
                />
              </div>
            </div>

            {/* ── Status Badge ── */}
            <div className='mb-3'>
              <span
                id='verify-email-badge'
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${config.badgeColor}`}
              >
                {config.badge}
              </span>
            </div>

            {/* ── Title & Message ── */}
            <h1 id='verify-email-title' className='text-2xl font-black text-slate-900 mb-2 tracking-tight'>
              {config.title}
            </h1>
            <p id='verify-email-message' className='text-slate-600 font-medium text-sm sm:text-base mb-6 leading-relaxed'>
              {message}
            </p>

            {/* ── Loading Spinner State ── */}
            {state === 'loading' && (
              <div className='space-y-4 py-2'>
                <div className='flex items-center justify-center gap-2 text-sky-600 font-semibold text-sm'>
                  <FiRefreshCw className='animate-spin text-lg' />
                  <span>Contacting authentication server...</span>
                </div>
                <div className='w-full bg-slate-100 h-2 rounded-full overflow-hidden'>
                  <div className='bg-sky-500 h-full rounded-full animate-pulse w-3/4'></div>
                </div>
              </div>
            )}

            {/* ── Non-Loading Active States ── */}
            {state !== 'loading' && (
              <div className='space-y-4'>
                {/* ── Countdown & Auto-Redirect Bar ── */}
                <div className='p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2'>
                  <div className='flex items-center justify-between text-xs font-semibold text-slate-600'>
                    <span>
                      Redirecting to <strong className='text-slate-900'>{destinationLabel}</strong>
                    </span>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200'>
                        {countdown}s
                      </span>
                      <button
                        id='verify-email-pause-btn'
                        type='button'
                        onClick={() => setIsPaused((prev) => !prev)}
                        className='cursor-pointer text-slate-400 hover:text-slate-700 p-1 rounded transition-colors'
                        title={isPaused ? 'Resume countdown' : 'Pause countdown'}
                        aria-label={isPaused ? 'Resume countdown' : 'Pause countdown'}
                      >
                        {isPaused ? <FiPlay className='w-3.5 h-3.5 text-emerald-600' /> : <FiPause className='w-3.5 h-3.5' />}
                      </button>
                    </div>
                  </div>

                  {/* Visual progress bar */}
                  <div className='w-full bg-slate-200 h-1.5 rounded-full overflow-hidden'>
                    <div
                      className={`h-full transition-all duration-1000 ease-linear ${state === 'success' ? 'bg-emerald-500' : 'bg-sky-500'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {isPaused && (
                    <p className='text-[11px] text-amber-700 font-medium text-center pt-0.5'>
                      Auto-redirect paused. Click play or use the button below to navigate.
                    </p>
                  )}
                </div>

                {/* ── Primary Action Button ── */}
                <button
                  id='verify-email-action-btn'
                  type='button'
                  onClick={() => navigate(getRedirectDestination())}
                  className={`cursor-pointer inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-gradient-to-r ${config.primaryColor} text-white font-bold shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 text-sm`}
                >
                  {state === 'success' ? (
                    user ? (
                      <>
                        <FiUser className='text-lg' />
                        Go to Dashboard
                      </>
                    ) : (
                      <>
                        <FiLogIn className='text-lg' />
                        Continue to Sign In
                      </>
                    )
                  ) : user ? (
                    <>
                      <FiUser className='text-lg' />
                      Go to Profile
                    </>
                  ) : (
                    <>
                      <FiLogIn className='text-lg' />
                      Go to Sign In
                    </>
                  )}
                  <FiArrowRight className='text-base' />
                </button>

                {/* ── Secondary Actions for Expired/Failed ── */}
                {state !== 'success' && (
                  <div className='space-y-2 pt-1'>
                    {user ? (
                      <button
                        id='verify-email-resend-btn'
                        type='button'
                        disabled={resendLoading || resendSuccess}
                        onClick={handleResend}
                        className='cursor-pointer inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-xs disabled:opacity-50'
                      >
                        {resendLoading ? (
                          <>
                            <FiLoader className='animate-spin' />
                            Sending new link...
                          </>
                        ) : resendSuccess ? (
                          <>
                            <FiCheckCircle className='text-emerald-500' />
                            Verification email sent!
                          </>
                        ) : (
                          <>
                            <FiMail />
                            Request New Verification Email
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        id='verify-email-signin-link'
                        to='/signin'
                        className='inline-flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors py-1'
                      >
                        <FiLogIn />
                        Sign in to request a new verification link
                      </Link>
                    )}
                  </div>
                )}

                {/* ── Back to Home Link ── */}
                <div className='pt-2 border-t border-slate-100'>
                  <Link
                    id='verify-email-home-btn'
                    to='/'
                    className='inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors'
                  >
                    <FiHome className='text-sm' />
                    Back to Homepage
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default VerifyEmail
