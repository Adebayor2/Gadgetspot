import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Terms = () => {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-slate-50 py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="space-y-3 text-center">
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Legal</p>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Terms and Conditions</h1>
                                <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                                    These terms govern your use of GadgetSpot and the services we provide to customers.
                                </p>
                            </div>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">Acceptance of terms</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    By visiting GadgetSpot and placing orders, you agree to follow these terms. If you do not agree, please do not use the site.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">Account use</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    You are responsible for maintaining your account security and for all activity that occurs under your login credentials.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">Orders and payments</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    All orders are subject to product availability and confirmation of payment. Prices, offers, and shipping terms may change at any time.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">Returns and refunds</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    We strive to make returns simple. If your item is eligible, follow the return instructions or contact support for assistance.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900">Intellectual property</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    GadgetSpot and its content are protected by copyright and trademark laws. You may not reuse brand assets without our permission.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <p className="text-sm font-medium text-slate-500">
                                    If you have questions about these terms, please contact us through the support page. We reserve the right to update these terms at any time.
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

export default Terms;
