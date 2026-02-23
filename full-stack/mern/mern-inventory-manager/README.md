# InvenFlow - Advanced Inventory Management System

A professional, full-stack inventory management solution built with the MERN stack.

## 🚀 Features

- **Authentication & RBAC**: Secure JWT-based auth with Admin, Manager, and Staff roles.
- **Product Catalog**: Full CRUD operations with SKU tracking and category management.
- **Real-time Inventory**: Automatic stock deduction on orders and manual adjustments with logs.
- **Order Management**: Comprehensive order lifecycle from creation to delivery tracking.
- **Supplier Tracking**: Manage business partners and link them to products.
- **Data Analytics**: Interactive dashboard with sales trends and stock distribution charts.
- **Premium UI**: Modern dark theme with glassmorphism and smooth animations using Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React, Recharts, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt.
- **Tools**: Postman, MongoDB Compass.

## 🏁 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository** (optional)
2. **Setup Backend**:
   ```bash
   cd server
   npm install
   # Create .env file or use existing
   # Run seed script to populate sample data
   node seed.js
   # Start dev server
   npm run start (or nodemon index.js)
   ```

3. **Setup Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Default Credentials (after seeding)
- **Admin**: `admin@example.com` / `password123`

## 📂 Project Structure

```text
Day 133/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI pieces
│   │   ├── context/    # AuthContext
│   │   ├── pages/      # View components
│   │   └── services/   # API logic
│   └── ...
└── server/             # Node.js backend
    ├── controllers/    # Route handlers
    ├── models/         # Mongoose schemas
    ├── routes/         # Express routes
    └── ...
```

## 📝 License
MIT
