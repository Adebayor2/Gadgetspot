import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiPackage, FiHeart, FiUser, FiArrowRight, FiLogOut, FiHome, FiMail, FiAlertTriangle } from 'react-icons/fi'
import { useStore } from '../../lib/useStore'
import logoutUser from '../../lib/logOut'
import api from '../../lib/apiConfig'
import ProductCard from '../../components/ProductCard'
import UserDashboardLayout from '../../components/user/UserDashboardLayout'
import Loader from '../../components/Loader'

const UserDashboard = () => {
    const { user, cart = [], favorites = [] } = useStore()

    const navigate = useNavigate()

    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        (async () => {
            try {
                const [{ data: productsData }, { data: ordersData }] = await Promise.all([
                    api.get('/products', { params: { featured: 'true' } }),
                    api.get('/orders/my-orders').catch(() => ({ data: { orders: [] } })),
                ])
                setProducts(productsData.products || [])
                setOrders(ordersData.orders || [])
            } catch (error) {
                console.log('Failed to load dashboard data', error)
            } finally {
                setLoading(false)
            }
        })()

    }, [])

    const colorClasses = {
        sky: 'bg-sky-500/20 text-sky-50',
        green: 'bg-emerald-500/20 text-emerald-50',
        rose: 'bg-rose-500/20 text-rose-50',
        amber: 'bg-amber-500/20 text-amber-50',
    }

    const cartItemCount = (cart || []).reduce((total, item) => total + (item?.quantity || 1), 0)

    const stats = [
        { title: 'Cart items', value: cartItemCount.toString(), icon: <FiShoppingCart />, color: 'sky' },
        { title: 'Orders placed', value: orders.length.toString(), icon: <FiPackage />, color: 'green' },
        { title: 'Saved items', value: (favorites?.length ?? 0).toString(), icon: <FiHeart />, color: 'rose' },
        { title: 'Account type', value: user?.role === 'admin' ? 'Admin' : 'Member', icon: <FiUser />, color: 'amber' },
    ]

    return (
        <UserDashboardLayout>
            <>
                <div className='min-h-screen bg-slate-50'>
                    <div className='container mx-auto px-4 pt-4 pb-8'>
                        <div className='mb-8 rounded-4xl bg-linear-to-r from-sky-500 to-blue-600 p-8 text-white shadow-2xl shadow-sky-200/30'>
                            <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
                                <div className='max-w-2xl'>
                                    <h1 className='mt-4 text-4xl text-slate-700 font-bold tracking-tight'>Welcome back, <span className='text-white'>{user?.fullName}</span> </h1>
                                    <p className='mt-4 max-w-xl text-slate-100/90 text-base sm:text-lg'>Manage your orders, saved items, and continue shopping from one place. Your recommendations are ready below.</p>
                                    <div className='mt-6 flex flex-wrap gap-3'>
                                        <Link to='/user/products' className='inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-white/20'>
                                            Browse products <FiArrowRight className='h-4 w-4' />
                                        </Link>
                                        <Link to='/cart' className='inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-white/20'>
                                            View cart <FiShoppingCart className='h-4 w-4' />
                                        </Link>
                                           <Link to='/user/orders' className='inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-white/20'>
                                            Track 0rder <FiPackage className='h-4 w-4' />
                                        </Link>

                                    </div>
                                </div>
                                <div className='grid gap-4 sm:grid-cols-2 lg:flex lg:gap-4'>
                                    {stats.map((item) => (
                                        <div key={item.title} className='rounded-3xl bg-white/10 p-5 backdrop-blur-xl border border-white/10 min-w-48'>
                                            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${colorClasses[item.color]}`}>
                                                {item.icon}
                                            </div>
                                            <p className='mt-4 text-sm text-slate-100/80'>{item.title}</p>
                                            <p className='mt-2 text-3xl font-bold text-white'>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {!user?.isVerified && (
                            <div className='mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3'>
                                <FiAlertTriangle className='text-amber-500 text-xl shrink-0 mt-0.5' />
                                <div className='flex-1'>
                                    <p className='text-sm font-bold text-amber-800'>Please verify your email</p>
                                    <p className='text-xs text-amber-600 mt-1'>
                                        We sent a verification link to <span className='font-semibold'>{user?.email}</span>. Check your inbox and spam folder.
                                    </p>
                                    <Link
                                        to='/user/profile'
                                        className='inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors'
                                    >
                                        <FiMail size={14} />
                                        Verify now
                                    </Link>
                                </div>
                            </div>
                        )}


                        <section>
                            <div className='mb-6 flex items-end justify-between'>
                                <div>
                                    <h2 className='text-2xl font-extrabold text-slate-900'>Featured Products</h2>
                                    <p className='mt-1 text-slate-400 font-medium'>The most loved pick.</p>
                                </div>
                                <Link to='/user/products' className='hidden sm:flex items-center gap-1 text-sky-500 font-semibold text-sm hover:text-sky-600 transition-colors'>
                                    View all <FiArrowRight className='h-4 w-4' />
                                </Link>
                            </div>

                            {loading ? (
                                <div className='flex items-center justify-center py-10'>
                                  <Loader text="Loading dashboard..." size="md" />
                                </div>
                            ) : products.length > 0 ? (
                                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                                    {products.map((product) => (
                                        <ProductCard key={product._id || product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <p className='py-10 text-center text-slate-400 font-medium'>No products available right now.</p>
                            )}
                        </section>
                    </div>
                </div>
            </>
        </UserDashboardLayout>
    )
}

export default UserDashboard
