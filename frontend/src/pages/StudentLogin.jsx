import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaQuestionCircle } from 'react-icons/fa';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('login');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`http://localhost:5000/api/login/student`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', 'student');
      localStorage.setItem('userName', res.data.user?.name || 'Student');
      localStorage.setItem('studentId', res.data.user?._id || res.data.user?.id);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`http://localhost:5000/api/student/forgot-password`, { registerNo });
      setStep('verify');
      setMessage('OTP sent to your registered email');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`http://localhost:5000/api/student/verify-otp`, { registerNo, otp });
      setStep('reset');
      setMessage('OTP verified. Please set your new password');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`http://localhost:5000/api/student/reset-password`, { registerNo, newPassword });
      setStep('login');
      setMessage('Password reset successful! Please log in.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col relative overflow-hidden">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white shadow-xl rounded-xl p-8 max-w-md w-full">
          {/* Tooltip Icon */}
          <div className="absolute top-2 right-2">
            <div className="group relative cursor-pointer text-gray-500">
              <FaQuestionCircle size={18} />
              <div className="absolute right-0 top-6 hidden w-64 text-xs bg-black text-white p-2 rounded shadow-lg group-hover:block z-10">
                If you're logging in for the first time, your default password is: <strong>CegStud@ + last four digits of your roll number.</strong>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center">
            {step === 'login' && 'Student Login'}
            {step === 'forgot' && 'Forgot Password'}
            {step === 'verify' && 'Verify OTP'}
            {step === 'reset' && 'Reset Password'}
          </h2>

          {message && <div className="text-green-600 mb-4 text-sm">{message}</div>}
          {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Student Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border p-2 rounded pr-10"
                  required
                />
                <div
                  className="absolute text-xl top-2 right-2 text-blue-500 cursor-pointer hover:text-blue-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Login
              </button>

              <p 
                className="text-sm text-blue-600 cursor-pointer text-center hover:underline"
                onClick={() => setStep('forgot')}
              >
                Forgot password?
              </p>
            </form>
          )}

          {step === 'forgot' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <input
                type="text"
                placeholder="Register Number"
                value={registerNo}
                onChange={e => setRegisterNo(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Send OTP
              </button>
              <p 
                className="text-sm text-gray-600 text-center cursor-pointer hover:underline"
                onClick={() => setStep('login')}
              >
                Back to login
              </p>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Verify OTP
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;