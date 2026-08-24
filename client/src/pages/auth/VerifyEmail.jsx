import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi'
import Navbar from '../../components/Navbar'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')
  const [countdown, setCountdown] = useState(5)

  let title = 'Verifying your email...'
  let message = 'Please wait while we verify your email address.'
  let Icon = FiLoader
  let iconColor = 'text-sky-500'
  let bgColor = 'bg-sky-50'
  let borderColor = 'border-sky-200'
  let showLink = false
  let linkText = 'Go to Sign In'
  let linkTo = '/signin'

  if (status === 'success') {
    title = 'Email Verified!'
    message = 'Your email has been verified successfully. You can now sign in to your account.'
    Icon = FiCheckCircle
    iconColor = 'text-emerald-500'
    bgColor = 'bg-emerald-50'
    borderColor = 'border-emerald-200'
    showLink = true
  } else if (status === 'invalid' || status === 'expired') {
    title = 'Verification Failed'
    message = 'This verification link is invalid or has expired. Please request a new verification email.'
    Icon = FiAlertCircle
    iconColor = 'text-rose-500'
    bgColor = 'bg-rose-50'
    borderColor = 'border-rose-200'
    showLink = true
    linkText = 'Go to Profile'
    linkTo = '/user/profile'
  } else if (status === 'error') {
    title = 'Verification Error'
    message = 'Something went wrong while verifying your email. Please try again later.'
    Icon = FiAlertCircle
    iconColor = 'text-amber-500'
    bgColor = 'bg-amber-50'
    borderColor = 'border-amber-200'
    showLink = true
    linkText = 'Go to Profile'
    linkTo = '/user/profile'
  }

  useEffect(() => {
    if (status === 'success' || status === 'invalid' || status === 'expired' || status === 'error') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            if (status === 'success') {
              window.location.href = '/signin'
            } else {
              window.location.href = '/user/profile'
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [status])

  return (
    <>
      <Navbar />
      <div className='min-h-screen w-full bg-linear-to-br from-slate-100 via-sky-300 to-blue-500 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center'>
        <div className='mx-auto max-w-md w-full'>
          <div className={`rounded-3xl border ${borderColor} ${bgColor} p-8 text-center shadow-xl`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${bgColor} mb-4`}>
              <Icon className={`${iconColor} text-4xl`} />
            </div>
            <h1 className='text-2xl font-bold text-slate-900 mb-2'>{title}</h1>
            <p className='text-slate-600 font-medium mb-6'>{message}</p>

            {showLink && (
              <div className='space-y-3'>
                <Link
                  to={linkTo}
                  className='inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-sky-500 text-white font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all active:scale-95 text-sm'
                >
                  {linkText}
                </Link>
                <p className='text-xs text-slate-500'>
                  Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default VerifyEmail
