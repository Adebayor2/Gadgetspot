import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
const PrivacyPolicy = () => {
    const navigate = useNavigate()

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-slate-50 py-20">
                    <button
                            onClick={() => navigate(-1)}
                            className="flex items-center md:ms-10 sm:mx-auto text-slate-500 hover:text-sky-500 transition-colors"
                          >
                            <FiArrowLeft className="h-4 w-4" /> Back
                          </button>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="space-y-3 text-center">
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Legal</p>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Privacy Policy</h1>
                                <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                                    We respect your privacy and handle the personal information you share with GadgetSpot responsibly.
                                </p>
                            </div>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">Information we collect</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We collect the details you provide when you create an account, place an order, or contact support. This includes name, email, phone number, shipping address, and payment data needed to fulfill purchases.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">How we use your data</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Your information is used to process orders, provide customer service, deliver updates and offers, and personalize your experience on GadgetSpot.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">Sharing and disclosures</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We do not sell your personal information. We may share data with trusted service providers who help us operate the site, process payments, ship orders, or send notifications.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">Cookies and tracking</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    GadgetSpot uses cookies and similar technologies to support authentication, improve the site experience, and measure performance. You can manage cookie preferences through your browser settings.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">Your rights</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    You can review, correct, or update your account details by signing in and editing your profile. Contact us if you want to delete your account or have questions about the information we store.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <p className="text-sm font-medium text-slate-500">
                                    By using GadgetSpot, you agree to the terms of this Privacy Policy. You can return to the homepage or reach out to support anytime with privacy questions.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
