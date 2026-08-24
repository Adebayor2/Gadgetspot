import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import api from '../../lib/apiConfig'
import { successToastOptions, errorToastOptions } from '../../lib/toastConfig'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setEmailError('')

        const normalizedEmail = email.trim()
        if (!normalizedEmail) {
            setEmailError('Email is required')
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setEmailError('Please enter a valid email address')
            return
        }

        try {
            setIsLoading(true)
            const response = await api.post('/auth/forgot-password', { email: normalizedEmail })
            toast.success(response.data.message || 'Reset link sent successfully!', successToastOptions)
            setEmail('')
            setTimeout(() => {
                navigate('/signin')
            }, 1000)
        } catch (error) {
            const message = error.response?.data?.message
            console.log(error)
            toast.error(message || 'Failed to send reset link. Please try again.', errorToastOptions)
        }
        finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Navbar />
            <div className='min-h-screen w-full bg-linear-to-br from-slate-100 via-sky-300 to-blue-500 px-4 py-12 sm:px-6 lg:px-8'>
                <div className='mx-auto max-w-md'>
                    <div className='mb-8 text-center'>
                        <h1 className='mb-2 text-4xl font-bold text-slate-900'>Forgot Password?</h1>
                        <p className='font-medium text-slate-600'>Enter the registered email and we will send you a reset link</p>
                    </div>

                    <div className='rounded-3xl border border-slate-100 bg-white p-8 shadow-xl'>
                        <form onSubmit={handleSubmit} className='space-y-6'>
                            <div>
                                <label className='mb-2.5 block text-sm font-semibold text-slate-800'>Email Address</label>
                                <div className='relative'>
                                    <FiMail className='absolute left-3.5 top-3.5 h-5 w-5 text-sky-400' />
                                    <input
                                        id="forgot-email"
                                        type='email'
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                                        onBlur={() => {
                                            const trimmed = email.trim();
                                            if (!trimmed) setEmailError('Email is required');
                                            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) setEmailError('Please enter a valid email address');
                                            else setEmailError('');
                                        }}
                                        placeholder='youremail.com'
                                        required
                                        className={`w-full rounded-xl border-2 py-3 pl-11 pr-4 font-medium text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${emailError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'}`}
                                    />
                                </div>
                                {emailError && <p className='text-red-500 text-xs font-semibold mt-1.5'>{emailError}</p>}
                            </div>

                            <button
                                type='submit'
                                disabled={isLoading}
                                className='w-full rounded-xl bg-linear-to-r from-sky-400 to-sky-500 px-6 py-3.5 font-bold text-white transition-all duration-300 hover:scale-105 hover:from-sky-500 hover:to-sky-600 hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100'
                            >
                                {isLoading ? 'Sending…' : 'Send Reset Link'}
                            </button>
                        </form>

                        <div className='mt-6 text-center text-sm text-slate-600'>
                            Remembered your password?{' '}
                            <Link to='/signin' className='font-bold text-amber-400 hover:text-amber-500'>Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ForgotPassword