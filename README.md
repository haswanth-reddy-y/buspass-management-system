# Bus Pass Management System (MERN Stack)

A modern, full-stack digital bus pass management web application built using the MERN stack (MongoDB, Express.js, React + Vite, Node.js).

## Project Directory Structure

```
bus-pass-management/
│
├── client/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ApplyPass.jsx
│   │   │   ├── RenewPass.jsx
│   │   │   ├── ApplicationStatus.jsx
│   │   │   ├── DigitalPass.jsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ManageApplications.jsx
│   │   │       ├── ManageUsers.jsx
│   │   │       └── Reports.jsx
│   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PassCard.jsx
│   │   │   ├── ApplicationCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │
│   │   ├── services/
│   │   │   ├── authService.jsx
│   │   │   ├── passService.jsx
│   │   │   └── adminService.jsx
│   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── login.css
│   │   │   ├── dashboard.css
│   │   │   ├── application.css
│   │   │   ├── digitalPass.css
│   │   │   └── admin.css
│   │
│   │   └── assets/
│   │       ├── images/
│   │       └── icons/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── server.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── BusPass.js
│   │   └── Application.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── passController.js
│   │   ├── applicationController.js
│   │   └── adminController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── passRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   └── utils/
│       └── generatePassId.js
│
├── .env
├── package.json
├── README.md
└── .gitignore
```

## Features

- **Student Portal**:
  - Account registration and login
  - Apply for new bus pass (Route selection, source, destination, duration)
  - Renew expired bus pass
  - Track application status in real-time
  - Instant digital bus pass ticket generation with QR code scan placeholder
- **Admin Control Center**:
  - Overall system metrics & analytics dashboard
  - Approve or reject bus pass applications with reason/remarks
  - Manage student accounts
  - Issuance reports with CSV export
- **Security & UI**:
  - JWT Authentication & Bcrypt password hashing
  - Role-based route protection
  - Glassmorphic UI with CSS animations and responsive design

## Getting Started

### 1. Install Dependencies
In the root directory, run:
```bash
npm install
npm --prefix client install
```

### 2. Configure Environment
Check `.env` in the root folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/buspass_db
JWT_SECRET=super_secure_buspass_secret_key_2026
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Development Server
To start both backend server and frontend client concurrently:
```bash
npm run dev
```

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:3000`

### Default Admin Credentials
- **Email**: `admin@buspass.com`
- **Password**: `admin123`
