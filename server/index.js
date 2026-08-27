const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const dbConnect = require('./config/db')
const errorMiddleware = require('./middleWares/errorMiddleware')
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productsRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const userRoutes = require('./routes/userRoutes')
const contactRoutes = require('./routes/contactRoutes')
const orderRoutes = require('./routes/orderRoutes')
const favouriteRoutes = require('./routes/favouriteRoutes')
const cartRoutes = require('./routes/cartRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const deliveryRoutes = require('./routes/deliveryRoutes')

dotenv.config()

const app = express()
const PORT = process.env.PORT
const CLIENT_URL = process.env.CLIENT_URL
const admin = require('firebase-admin')

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  })
}
const allowedOrigins = [
 'https://gadgetspot-tau.vercel.app',
 'http://localhost:5173'
]

if (CLIENT_URL) {
  allowedOrigins.push(CLIENT_URL)
}

app.use(helmet())
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

app.use(express.json({ limit: '10mb' }))


app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/users', userRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/favourites', favouriteRoutes)
app.use('/api/carts', cartRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api', deliveryRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` })
})

app.use(errorMiddleware)

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  })
