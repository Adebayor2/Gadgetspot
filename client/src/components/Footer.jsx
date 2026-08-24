import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa'
const Footer = ({ className = 'mt-20' }) => {
  return (

     <footer className={`w-full h-full bg-[#00496e] text-white py-12 px-4 ${className}`}>
       <div className='container mx-auto flex flex-wrap justify-between gap-6'>
         <div className='col-span-2'>
           <div className="flex items-center gap-3">
             <img src="/gadgetspot-logo.png" alt="GadgetSpot" className="h-10 w-10 object-contain brightness-0 invert" />
             <h1 className='text-md font-bold'>Gadget<span className="text-sky-500">Spot</span></h1>
           </div>
           <p className='text-sm text-slate-200'>Premium technology products for your everyday needs. </p>



        </div>
        <div>
          <h1 className='font-extrabold'>Shop</h1>
          <ul className='mt-2 text-slate-200 font-medium text-sm'>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/products">Phones</Link></li>
            <li><Link to="/products">Computers</Link></li>
            <li><Link to="/products">Accessories</Link></li>
            <li><Link to="/guestorder">Track order</Link></li>

          </ul>
        </div>
        <div>
          <h1 className='font-extrabold'>Company</h1>
          <ul className='mt-2 text-slate-200 font-medium text-sm'>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
          </ul>
        </div>
        <div>
          <h1 className='font-extrabold'>Support</h1>
          <ul className='mt-2 text-slate-200 font-medium text-sm'>
            <li><Link to="">Help Center</Link></li>
            <li><Link to="">Shipping Information</Link></li>

            <li><Link to="">Return Policy</Link></li>
          </ul>
        </div>
        <div>
          <h1 className='font-bold'>Follow Us</h1>
          <ul className='mt-2 flex gap-4 '>
            <li>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebook className='h-5 w-5' />
              </a>
            </li>
            <li>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <FaTwitter className='h-5 w-5' />
              </a>
            </li>
            <li>
              <a href="https://instagram.com/gadgetspot_ng" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram className='h-5 w-5' />
              </a>
            </li>
            <li>
              <a href="https://wa.me/+2348066186996" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <FaWhatsapp className='h-5 w-5' />
              </a>
            </li>
          </ul>
        </div>

      </div>
      <p className='mt-15 text-center text-slate-400 font-medium text-sm'>© 2026 GadgetSpot. All rights reserved.</p>
    </footer>
  )
}

export default Footer