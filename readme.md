# 🛠️ Shoppo Backend – E-commerce API

This is the **backend server** for the Shoppo e-commerce platform, built with **Node.js**, **Express**, and **TypeScript**. It powers the frontend by exposing RESTful APIs for features like authentication, product management, cart operations, order tracking, and user roles.

🌐 **Live Link**: [https://oms-backend-orz1.onrender.com](https://oms-backend-orz1.onrender.com)

---

## 🚀 Getting Started – Local Setup

### ✅ Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### 📦 Backend Installation Steps

```bash
# Clone the repository
git clone https://github.com/Bakhtiar2000/OMS-Backend.git
cd OMS-Backend

# Install dependencies
npm install
# or
yarn

# Provide required environment variables
cp .env.example .env

# Start the server in development mode
npm run start:dev

# To build the server for production
npm run build

# To start the production server
npm start
```

> The server will typically run on `http://localhost:5000` unless configured otherwise.

---

## 🧠 Modules Included

- **User Module** – Registration, login, password encryption, and role management
- **Auth Module** – JWT-based authentication
- **Product Module** – CRUD for product listings
- **Cart Module** – Add to cart, view/update cart items
- **Order Module** – Place and track orders, manage statuses

---

## 📬 API Documentation

Use the Postman collection linked below to explore the endpoints:

🔗 [API Documentation via Postman](https://documenter.getpostman.com/view/32926736/2sB2qai2Fn)

---

## ✅ Core Functionalities

These functionalities support the frontend of Shoppo:

### 👤 Users can:

- Register and login
- Browse and retrieve product listings
- Add products to their cart
- Create and view orders
- Track order status

### 🔐 Admins can:

- Manage products (CRUD)
- View and update order statuses (e.g., Pending, On-the-Way, Delivered)
- View and manage user accounts

---

## 🛠️ Environment Variables

You must provide required environment variables by creating a `.env` file based on `.env.example`.
