import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { FiHome, FiSearch, FiFrown } from 'react-icons/fi'

const NotFound = () => {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-b from-sky-50 to-white px-6 py-20">
        {/* Floating decorative orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-float absolute -left-16 top-24 h-56 w-56 rounded-full bg-brand-cyan/20 blur-3xl" />
          <div className="animate-float absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" style={{ animationDelay: '1.2s' }} />
        </div>

        {/* Orbiting dot around the 404 */}
        <div className="animate-spin-slow pointer-events-none absolute h-[320px] w-[320px] rounded-full border border-dashed border-brand-blue/30">
          <span className="animate-orbit absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-cyan shadow-[0_0_12px_4px_rgba(56,189,248,0.6)]" />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="animate-fade-up mb-6 flex items-center gap-3 text-brand-blue">
            <FiFrown className="h-8 w-8" />
            <span className="font-display font-normal text-2xl tracking-wide">Oops!</span>
          </div>

          <h1 className="animate-glitch font-display font-normal text-[8rem] leading-none text-brand-blue sm:text-[11rem]">
            404
          </h1>

          <p className="animate-fade-up mt-2 max-w-md text-lg font-medium text-slate-600" style={{ animationDelay: '0.15s' }}>
            The page you're looking for does not exist .
          </p>

          <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-7 py-3 font-semibold text-white shadow-lg shadow-brand-blue/30 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-cyan hover:shadow-brand-cyan/40"
            >
              <FiHome className="h-5 w-5 transition-transform group-hover:scale-110" />
              Back to Home
            </Link>
            <Link
              to="/products"
              className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-blue/40 px-7 py-3 font-semibold text-brand-blue transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan hover:text-brand-cyan"
            >
              <FiSearch className="h-5 w-5 transition-transform group-hover:scale-110" />
              Browse Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default NotFound
