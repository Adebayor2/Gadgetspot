import React from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { FiCpu, FiShield, FiHeadphones, FiTruck } from 'react-icons/fi';

const About = () => {
  const services = [
    {
      icon: <FiCpu className="w-6 h-6 text-[#38bdf8]" />,
      title: "Expert Device Setup",
      description: "Get your new laptop or smartphone fully pre-configured and optimized by our certified technicians so you are ready to go immediately."
    },
    {
      icon: <FiShield className="w-6 h-6 text-[#38bdf8]" />,
      title: "Official Brand Warranty",
      description: "Every purchase comes backed with genuine authorized manufacturer coverage, plus our dedicated GadgetSpot extended support."
    },
    {
      icon: <FiHeadphones className="w-6 h-6 text-[#38bdf8]" />,
      title: "24/7 Tech Assistance",
      description: "Experience reliable support from live tech specialists available day or night to assist you with configurations and troubleshooting."
    },
    {
      icon: <FiTruck className="w-6 h-6 text-[#38bdf8]" />,
      title: "Insured Rapid Delivery",
      description: "Fast, double-packaged, and fully insured shipping across the region with live tracking codes sent directly to your inbox."
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen  flex flex-col">
      {/* Hero Section */}
      <section className="  py-10 md:py-24 px-4 text-center  overflow-hidden"  style={{ backgroundImage: "url('/About-Background.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>

        <div className="max-w-4xl mx-auto  mb-30">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl  text-black tracking-tight leading-tight md:leading-none drop-shadow-sm font-display font-normal">
            Built for people who <span className="text-sky-500">love Tech.</span>
          </h1>
          <p className="max-w-xl mx-auto mt-6 text-sm md:text-base font-medium text-black/90 leading-relaxed drop-shadow-xs">
            GadgetSpot is an independent gadgets and electronics store on a mission to make premium
            tech accessible without the markup, without the gimmicks.
          </p>
           <p className="max-w-xl mx-auto mt-6 text-md font-bold text-black leading-relaxed drop-shadow-xs">
            We <span className='text-black font-display font-normal'> BUY</span>, <span className='text-black font-display font-normal'>SELL</span>  and <span className='text-black font-display font-normal'> SWAP</span>
          </p>
        </div>
      </section>

      {/* Narrative Story Section */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
      
          <div className="w-full relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-slate-950 group">
            <img
              src="/Gadgetspot-store.png"
              alt="Gadgetspot store"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          </div>

          {/* Narrative Content */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-normal text-sky-500 tracking-tight">
              Our story
            </h2>
            <div className="space-y-4 text-sm font-medium text-slate-500 leading-relaxed">
              <p>
                We started GadgetSpot in 2021 with one belief, shopping for tech should feel
                as good as unboxing it. We obsess over the catalog so you don't have to,
                every product is hand-picked, tested, and backed by real humans.
              </p>
              <p>
                Today, GadgetSpot serves customers across the country with a
                curated catalog of the best phones, laptops, audio gear and accessories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services We Offer Section */}
      <section className="relative py-20 md:py-28 text-white bg-slate-400 overflow-hidden">
        {/* Tech Background Image */}
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/049/191/168/small/a-modern-workspace-featuring-advanced-technology-including-a-holographic-calendar-and-illuminated-data-streams-creating-an-innovative-and-dynamic-environment-for-productivity-photo.jpg"
          alt="Tech background"
          className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none select-none"
        />
        {/* Gradient Fades */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 pointer-events-none" />

        <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 md:mb-18">
            <h2 className="text-3xl md:text-4xl font-display font-normal tracking-tight text-white mb-4">
              Services We Offer
            </h2>
            <p className="text-slate-200 max-w-xl mx-auto text-sm md:text-base font-semibold leading-relaxed">
              Beyond bringing you premium gear, we provide dedicated support to guarantee the absolute best experience with your setup.
            </p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/10 hover:border-[#38bdf8]/40 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/15"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-5 border border-white/10">
                  {service.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2.5">
                  {service.title}
                </h3>
                <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer className="mt-0" />
      </div>
    </>
  );
};

export default About;