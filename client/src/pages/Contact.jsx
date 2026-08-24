import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiLoader } from 'react-icons/fi';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

import { successToastOptions, errorToastOptions } from '../lib/toastConfig';
import api from '../lib/apiConfig';

const Contact = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/contact', data);
      toast.success('Your message has been sent successfully!', successToastOptions);
      setIsSuccess(true);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Something went wrong. Please try again.';
      toast.error(message, errorToastOptions);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    reset();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-sky-50/40 via-white to-white py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header section */}
          <div className="text-center max-w-2xl mx-auto mb-5 md:mb-16">
            <h1 className="text-4xl md:text-5xl text-slate-900 font-display font-normal tracking-tight mb-4">
              Get in <span className="bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-semibold leading-relaxed">
              Questions about an order or a product? We usually reply within a few hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact details on the left */}
            <div className="lg:col-span-4 space-y-4">
              {/* Email Card */}
              <a
                href="mailto:hello@gadgetspot.com"
                className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-1 hover:border-sky-200/40 transition-all duration-300 group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                  <FiMail className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">Email</span>
                  <span className="block text-sm font-bold text-slate-700 mt-1 group-hover:text-sky-600 transition-colors">
                    support@gadgetspot.com.ng
                  </span>
                  <span className="block text-xs text-slate-400 mt-0.5">Send a message anytime</span>
                </div>
              </a>

              {/* Phone Card */}
              <a
                href="tel:+2348066186996"
                className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-1 hover:border-sky-200/40 transition-all duration-300 group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                  <FiPhone className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">Phone</span>
                  <span className="block text-sm font-bold text-slate-700 mt-1 group-hover:text-sky-600 transition-colors">
                    +234 806 618 6996
                  </span>
                  <span className="block text-xs text-slate-400 mt-0.5">Mon-Fri from 9am to 6pm</span>
                </div>
              </a>

              {/* Office Card */}
              <a
                href="https://maps.google.com/?"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-1 hover:border-sky-200/40 transition-all duration-300 group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                  <FiMapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">Office</span>
                  <span className="block text-sm font-bold text-slate-700 mt-1 leading-snug group-hover:text-sky-600 transition-colors">
                    No 12 inuofebi yoaco<br />
                    ogbomoso,Oyo, NG
                  </span>
                  <span className="block text-xs text-slate-400 mt-1">Come visit our workspace</span>
                </div>
              </a>
            </div>

            {/* Contact Form on the right */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-10 px-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-6 border border-emerald-100">
                    <FiCheckCircle className="h-10 w-10 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message sent successfully!</h3>
                  <p className="text-slate-500 text-xs md:text-sm font-semibold max-w-sm mb-8 leading-relaxed">
                    Thank you for reaching out. A GadgetSpot representative will review your message and reply via email within a few hours.
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Name
                      </label>
                       <input
                         id="name"
                         type="text"
                         {...register('name', {
                           required: 'Name is required',
                           minLength: {
                             value: 2,
                             message: 'Name must be at least 2 characters'
                           }
                         })}
                         className={`w-full py-3 px-4 rounded-xl border ${errors.name
                             ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                             : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100'
                           } focus:ring-4 outline-none text-slate-700 text-sm font-medium transition-all placeholder:text-slate-400 bg-slate-50/20`}
                         placeholder="Your name"
                       />
                      {errors.name && (
                        <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 mt-1">
                          <span className="shrink-0"></span> {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Email
                      </label>
                       <input
                         id="email"
                         type="email"
                         {...register('email', {
                           required: 'Email is required',
                           pattern: {
                             value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                             message: 'Please enter a valid email address'
                           }
                         })}
                         className={`w-full py-3 px-4 rounded-xl border ${errors.email
                             ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                             : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100'
                           } focus:ring-4 outline-none text-slate-700 text-sm font-medium transition-all placeholder:text-slate-400 bg-slate-50/20`}
                         placeholder="you@email.com"
                       />
                      {errors.email && (
                        <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 mt-1">
                          <span className="shrink-0"></span> {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Subject
                    </label>
                     <input
                       id="subject"
                       type="text"
                       {...register('subject', {
                         required: 'Subject is required',
                         minLength: {
                           value: 3,
                           message: 'Subject must be at least 3 characters'
                         }
                       })}
                       className={`w-full py-3 px-4 rounded-xl border ${errors.subject
                           ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                           : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100'
                         } focus:ring-4 outline-none text-slate-700 text-sm font-medium transition-all placeholder:text-slate-400 bg-slate-50/20`}
                       placeholder="What's this about?"
                     />
                    {errors.subject && (
                      <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 mt-1">
                        <span className="shrink-0"></span> {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Message
                    </label>
                     <textarea
                       id="message"
                       rows="5"
                       {...register('message', {
                         required: 'Message is required',
                         minLength: {
                           value: 10,
                           message: 'Message must be at least 10 characters'
                         }
                       })}
                       className={`w-full py-3 px-4 rounded-xl border ${errors.message
                           ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                           : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100'
                         } focus:ring-4 outline-none text-slate-700 text-sm font-medium transition-all placeholder:text-slate-400 bg-slate-50/20 resize-y min-h-[120px]`}
                       placeholder="Tell us more..."
                     />
                    {errors.message && (
                      <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 mt-1">
                        <span className="shrink-0"></span> {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 shadow-md shadow-sky-500/10 hover:shadow-lg hover:shadow-sky-500/20 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer className="mt-0" />
      </div>
    </>
  );
};

export default Contact;