import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import api from '../lib/apiConfig'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { toast } from 'react-hot-toast'
import { FiTruck, FiAward, FiShield, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import appleLogo from '../assets/images/Apple-logo.png'
import sonyLogo from '../assets/images/sonyLogo.jfif'
import samsungLogo from '../assets/images/Samsung-logo.jpg'
import newAgeLogo from '../assets/images/NewAge-logo.jfif'
import oriamoLogo from '../assets/images/Oriamo-logo.png'
import tecnoLogo from '../assets/images/Tecno-logo.jfif'
import jblLogo from '../assets/images/Jbl-Logo.png'
import lgLogo from '../assets/images/LG-logo.png'
import HisenseLogo from '../assets/images/Hisense-Logo.png'



const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products', { params: { featured: 'true' } }),
          api.get('/categories'),
        ]);
        if (active) {
          setProducts(productsRes.data.products || []);
          const cats = categoriesRes.data.categories || [];
          setCategories(['All', ...cats.map((c) => c.name)]);
        }
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get('/categories');
        if (active && data.categories) {
          const names = data.categories.map((c) => c.name);
          setCategories(['All', ...names]);
        }
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    })();
    return () => { active = false; };
  }, []);

  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setIsSubscribing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success('Thanks for subscribing!');
    setEmail('');
    setIsSubscribing(false);
  };

  const featuredProducts = products.filter((p) => p.featured);

  const filteredProducts =
    activeCategory === 'All'
      ? featuredProducts
      : featuredProducts.filter((p) => p.category === activeCategory);

  const brandLogos = [
    { src: appleLogo, alt: 'Apple' },
    { src: sonyLogo, alt: 'Sony' },
    { src: samsungLogo, alt: 'Samsung' },
    { src: newAgeLogo, alt: 'NewAge' },
    { src: oriamoLogo, alt: 'Oriamo' },
    { src: tecnoLogo, alt: 'Tecno' },
    { src: jblLogo, alt: 'Jbl' },
    { src: lgLogo, alt: 'LG' },
    { src: HisenseLogo, alt: 'Hisense' },



  ];

  const marqueeBrands = [...brandLogos, ...brandLogos];


  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full">
        {/* ── Hero Section ── */}
        <section className='relative container px-4 mx-auto w-full h-full md:py-5'>
          <div className='absolute inset-0 opacity-20 pointer-events-none' style={{ backgroundImage: "url('/gadgetspot-bg.png')" }}></div>
          <div className='flex flex-col md:flex-col lg:flex-row items-center justify-center gap-6 lg:gap-28'>
            <div className=' relative z-10 text-center lg:text-start'>
              <div className='h-6 mb-3 max-w-fit px-3 border border-slate-200 rounded-full bg-sky-50 mt-2 mx-auto lg:mx-0'><span className='font-medium text-sm text-sky-500 text-center'>New arrivals every week</span></div>
              <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 font-display ' style={{ textShadow: '0 0 2px rgb(14, 165, 233)' }}>The Future of <br />
                Tech,  <span className='text-sky-500' style={ {textShadow:'0 0 8px white'}}  >Delivered.</span></h1>
              <p className='mt-5 font-medium text-slate-500 max-w-lg mx-auto lg:mx-0 text-sm md:text-base'>Discover hand-picked phones, laptops and accessories from the brands you love at prices that surprise you</p>


              <div className='mt-5 flex flex-wrap gap-3 sm:gap-5 content-center justify-center lg:justify-start '>
                <Link to='/signup' className='bg-sky-500 border text-white text-center md:w-50 w-70  border-slate-200 px-6 p-2 rounded-xl hover:bg-sky-400 transition-colors duration-200'>Shop Now</Link>
                <Link to='/products' className='bg-amber-400 border md:w-50 w-70 text-center  border-slate-200 px-6 p-2 rounded-xl hover:bg-amber-500  transition-colors duration-200'>View All Products</Link>
              </div>
            </div>
            <div className='w-full md:w-auto flex justify-center mt-5 relative z-10'>
              <div className='w-full sm:w-72 md:w-80 lg:w-96 h-64 sm:h-72 md:h-80 lg:h-[23rem] border rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-cover bg-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-y-105' style={{ backgroundImage: "url('/Hero-image.png')" }}>
              </div>
            </div>
          </div>
        </section>

    
        <section className="container mx-auto px-4 py-3">
          <div className="rounded-2xl bg-white p-5">
            <h1 className='lg:text-4xl md:text-3xl text-2xl font-display font-normal text-center mt-3 text-sky-500'>Brands We <span className='text-black'>Trust</span> </h1>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 py-4">
              <div className="brand-marquee-track flex w-max items-center gap-6">
                {marqueeBrands.map((brand, index) => (
                  <div
                    key={`${brand.alt}-${index}`}
                    className="flex h-20 w-36 flex-shrink-0 items-center justify-center rounded-xl bg-white px-4 shadow-sm"
                  >
                    <img src={brand.src} alt={brand.alt} className="h-12 w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ── Featured Products Section ── */}
        <section className="container mx-auto px-4 py-12 md:py-16 ">
          {/* Category Tabs */}
          <div className='bg-sky-50 p-4 my-5 rounded-xl'>
            <div className="flex flex-wrap gap-2.5 mb-10 ">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-normal text-slate-900">Featured Products</h2>
              <p className="mt-1.5 text-slate-400 font-medium">The most-loved picks.</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1 text-sky-500 font-semibold text-sm hover:text-sky-600 transition-colors">
              View all <span>→</span>
            </Link>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader text="Loading featured products..." size="md" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}

          {/* Mobile "View all" link */}
          <div className="mt-8 flex sm:hidden justify-center">
            <Link to="/products" className="text-sky-500 font-semibold text-sm hover:text-sky-600 transition-colors">
              View all →
            </Link>
          </div>
        </section>



        <section className='container mx-auto px-4 py-12 bg-sky-50 rounded-2xl'>
          <div className='text-center'>
            <h2 className='text-3xl md:text-4xl font-display font-normal text-sky-500'>Why Choose GadgetSpot?</h2>
            <p className='text-slate-400 font-medium'>premium tech, premium experience -every order</p>
          </div>


          <div className='flex flex-wrap gap-5 justify-center items-center mt-4 '>

          
            <div className='w-100 bg-white h-50 border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-6 group'>
              <div className='flex items-center justify-center w-16 h-16 rounded-full bg-sky-50 text-sky-500 mb-4 transition-transform duration-300 group-hover:scale-110'>
                <FiTruck className='h-8 w-8' />
              </div>
              <div className='text-center'>
                <h3 className='text-lg font-semibold text-slate-800 mb-2'>Fast Shipping</h3>
                <p className='text-sm text-slate-500'>Fast shipping and swift delivery on your all orders. <br /> Most orders ship same day</p>
              </div>
            </div>

            {/* Genuine Products */}
            <div className='w-100 h-50 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-6 group'>
              <div className='flex items-center justify-center w-16 h-16 rounded-full bg-sky-50 text-sky-500 mb-4 transition-transform duration-300 group-hover:scale-110'>
                <FiAward className='h-8 w-8' />
              </div>
              <div className='text-center'>
                <h3 className='text-lg font-semibold text-slate-800 mb-2'>Genuine Products</h3>
                <p className='text-sm text-slate-500'>100% authentic products, directly from <br /> authorised distributors</p>
              </div>
            </div>

            {/* Secured Payment */}
            <div className='w-100 bg-white h-50 border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-6 group'>
              <div className='flex items-center justify-center w-16 h-16 rounded-full bg-sky-50 text-sky-500 mb-4 transition-transform duration-300 group-hover:scale-110'>
                <FiShield className='h-8 w-8' />
              </div>
              <div className='text-center'>
                <h3 className='text-lg font-semibold text-slate-800 mb-2'>Secured Payment</h3>
                <p className='text-sm text-slate-500'>Bank-grade encryption with paystack, <br /> cards and trusted wallets</p>
              </div>
            </div>
          </div>

          <div className='w-full  bg-sky-400 rounded-2xl mt-8 lg:py-15 p-5 '>

            <form onSubmit={handleSubscribe} className='flex flex-wrap items-center justify-between  md:0 gap-2 '>
              <div className='ms-2'>
                <p className=' lg:text-3xl  text-1xl font-display font-normal text-slate-900 '>Get The Best Quality From us </p>
              </div>

              <div className=''>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='lg:w-90  w-50 h-10  border-2 border-slate-100 text-sky-500 shadow-lg hover:border-none  p-4 rounded-2xl bg-white '
                  type="email"
                  placeholder='you@gmail.com'
                  required
                />
              </div>

              <div className=''>
                <button
                  type='submit'
                  disabled={isSubscribing}
                  className='bg-amber-400 w-30 h-13  rounded-xl cursor-pointer me-2    shadow-sm hover:scale-x-80 disabled:opacity-70'
                >
                  {isSubscribing ? '...' : 'Suscribe'}
                </button>
              </div>

            </form>

          </div>



        </section>

        {/* ── FAQ Section ── */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-normal text-slate-900 text-center mb-3">
              Frequently Asked <span className="text-sky-500">Questions</span>
            </h2>
            <p className="text-slate-400 font-medium text-center mb-10">
              Quick answers to common questions about shopping with GadgetSpot.
            </p>

            <div className="space-y-3">
              {[
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept bank transfers, card payments, and mobile wallet payments via Paystack. All transactions are secure and encrypted.',
                },
                {
                  question: 'How long does delivery take?',
                  answer: 'Delivery times vary by location. Most orders within Lagos and major cities are delivered within 1–5 business days. You will receive tracking updates once your order ships.',
                },
                {
                  question: 'Are your products genuine?',
                  answer: 'Yes. We source all products directly from authorized distributors and brand partners. Every product comes with the manufacturer warranty where applicable.',
                },
                {
                  question: 'What is your return policy?',
                  answer: 'We accept returns within 7 days of delivery for unused items in original packaging. Products must be in resalable condition. Please contact our support team to initiate a return.',
                },
                {
                  question: 'How can I track my order?',
                  answer: 'After placing an order, you can track its status from your account dashboard under "My Orders when signed in, you can also go to track order page ". You will also receive email updates at key delivery stages.',
                },
                {
                  question: 'Do you accept payment on delivery?',
                  answer: 'No, We don not accept payment on delivery, you can pay after checking out with paystack',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-sky-200/30 rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-semibold text-slate-800 pr-4">
                      {item.question}
                    </span>
                    <span className="text-slate-400 shrink-0">
                      {openFaq === index ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </span>
                  </button>
                  <div
                    className={`px-5 transition-all duration-300 ease-in-out overflow-hidden ${
                      openFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />

      </div>
    </>
  )

}

export default Home