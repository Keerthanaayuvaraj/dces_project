import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [step, setStep] = useState('login'); // 'login' | 'forgot' | 'verify' | 'reset'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/login/admin', { email, password });
      //setMessage('Login successful');
      // optionally store token or redirect
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('userName', res.data.user?.name || 'Admin');
      localStorage.setItem('adminId', res.data.user?._id || res.data.user?.id);

      // Redirect to admin dashboard
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const sendOtp = async () => {
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/admin/forgot-password', { email });
      setMessage('OTP sent to your email');
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/admin/verify-otp', { email, otp });
      setMessage('OTP verified');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP');
    }
  };

  const resetPassword = async () => {
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/admin/reset-password', {
        email,
        newPassword,
      });
      setMessage('Password reset successful');
      setStep('login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {step === 'login'
            ? 'Admin Login'
            : step === 'forgot'
            ? 'Forgot Password'
            : step === 'verify'
            ? 'Verify OTP'
            : 'Reset Password'}
        </h2>

        {message && <div className="text-green-600 mb-4">{message}</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Login
            </button>
            <p className="text-sm text-blue-600 cursor-pointer text-center" onClick={() => setStep('forgot')}>
              Forgot password?
            </p>
          </form>
        )}

        {step === 'forgot' && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <button onClick={sendOtp} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Send OTP
            </button>
            <p className="text-sm text-gray-600 text-center cursor-pointer" onClick={() => setStep('login')}>
              Back to login
            </p>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <button onClick={verifyOtp} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Verify OTP
            </button>
          </div>
        )}

        {step === 'reset' && (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <button
              onClick={resetPassword}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
