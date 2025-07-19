import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentDetail from './pages/StudentDetail.jsx';
import ShareView from './pages/ShareView.jsx';
import Home from './pages/Home.jsx';
import './index.css';

// const PrivateRoute = ({ children, role }) => {
//   const token = localStorage.getItem('token');
//   const userRole = localStorage.getItem('role');
//   if (!token || (role && userRole !== role)) {
//     return <Navigate to="/admin" />;
//   }
//   return children;
// };

// const PrivateRoute = ({ children, role }) => {
//   const token = localStorage.getItem('token');
//   const userRole = localStorage.getItem('role');

//   if (!token || (role && userRole !== role)) {
//     return <Navigate to="/admin" />;
//   }
//   return children;
// };
const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/home" />;  // Redirect to homepage or login
  }

  if (role && userRole !== role) {
    return <Navigate to="/home" />;  // Prevent role mismatch from causing redirect loops
  }

  return children;
};

// Redirect root to login or dashboard based on auth
// const RootRedirect = () => {
//   const token = localStorage.getItem('token');
//   const role = localStorage.getItem('role');
//   if (!token) return <Navigate to="/login" />;
//   if (role === 'admin') return <Navigate to="/admin" />;
//   if (role === 'student') return <Navigate to="/student" />;
//   return <Navigate to="/login" />;
// };
const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token) {
    if (role === 'admin') return <Navigate to="/admin" />;
    if (role === 'student') return <Navigate to="/student" />;
  }

  // No token → Show homepage
  return <Navigate to="/home" />;
};
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/home" element={<Home />} />
         <Route path="/studentlogin" element={<StudentLogin />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
        <Route path="/student/:id" element={<PrivateRoute role="admin"><StudentDetail /></PrivateRoute>} />
        <Route path="/share/:token" element={<ShareView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
