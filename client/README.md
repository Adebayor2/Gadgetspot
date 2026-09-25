# GadgetSpot

GadgetSpot is a modern electronics and gadgets e-commerce platform built for browsing products, managing a cart, placing orders, tracking purchases, and handling admin operations from a single storefront.

This project combines a React + Vite frontend with an Express + MongoDB backend, supporting both customer and administrator flows.

## Overview

GadgetSpot allows users to:

- Browse featured gadgets and product collections
- Search, filter, and view product details
- Add products to favourites and cart
- Check out as a registered user or guest
- Track order status and view order history
- Sign in with email/password or Google authentication
- Receive account verification, password reset, and order-related email updates

Admins can:

- Manage products, categories, and inventory
- Review customer orders and revenue data
- Manage users and platform settings
- View performance metrics from the admin dashboard

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Zustand for state management
- Tailwind CSS
- React Hook Form + Zod validation
- Firebase Authentication
- React Hot Toast
- Axios

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Cloudinary for media uploads
- Firebase Admin SDK
- Brevo / Resend email services
- Paystack integration for payments
- Helmet, CORS, rate limiting, and sanitization middleware

## Project Structure

```bash
Gadgetspot/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── vite.config.js
├── server/                  # Express backend
│   ├── config/
│   ├── controller/
│   ├── middleWares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env
│   ├── index.js
│   └── package.json
├── .gitignore
└── README.md
```

## Features

### Customer Experience
- Homepage with hero section and featured categories
- Product browsing and detail pages
- Wishlist and guest favourites support
- Cart and checkout flows for signed-in and guest shoppers
- Order tracking and payment callback support
- Account registration, login, email verification, and password reset
- Responsive design for desktop and mobile layouts

### Admin Experience
- Admin dashboard with summary cards and analytics
- Product management with CRUD capabilities
- Category management
- User management and role-based routing
- Revenue reports and order overview
- Platform settings and profile management

### Security & Reliability
- JWT-based session handling
- Role-based route protection
- Secure HTTP headers with Helmet
- Request rate limiting
- MongoDB sanitization and XSS protection
- Environment-based configuration for production deployments

## Prerequisites

Before running the project locally, ensure you have:

- Node.js 18 or newer
- npm or yarn
- MongoDB Atlas or a local MongoDB instance
- Firebase project credentials
- Cloudinary account
- Paystack secret key if payment testing is enabled
- Brevo or Resend API key for transactional emails



## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/gadgetspot.git
cd gadgetspot
```

### 2. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 3. Start the backend

```bash
cd server
npm run dev
```

The API will run on the port defined in the server environment file, typically `http://localhost:5000`.

### 4. Start the frontend

```bash
cd client
npm run dev
```

The frontend will usually run on `http://localhost:5173`.

### 5. Build for production

```bash
cd client
npm run build
```

## Available Scripts

### Client
```bash
npm run dev      # Start Vite development server
npm run build    # Build the production bundle
npm run preview  # Preview the production build
npm run lint     # Run ESLint checks
```

### Server
```bash
npm run dev      # Start the server with nodemon
npm start        # Start the production server
```

## API Overview

The backend exposes routes under `/api` for:

- Authentication: `/api/auth`
- Products: `/api/products`
- Categories: `/api/categories`
- Carts: `/api/carts`
- Orders: `/api/orders`
- Favourites: `/api/favourites`
- Users: `/api/users`
- Payments: `/api/payments`
- Contact: `/api/contact`
- Delivery: `/api`

## Deployment Notes

This app is structured for deployment as two separate services:

- Frontend: Vercel or any static hosting compatible with Vite
- Backend: Render, Railway, or any Node.js hosting service

Make sure to configure your production environment variables for both the client and server, and set the correct API base URL and CORS origins.

## License

This project is currently distributed for educational and portfolio use unless otherwise specified by the project owner.

## Contributing

Contributions are welcome. If you want to improve the platform, please open an issue or submit a pull request with a clear explanation of the change.

## Contact

For business, partnership, or support inquiries, use the contact details available in the storefront or the project’s configured support email.

