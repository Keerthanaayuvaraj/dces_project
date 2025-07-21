import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('login'); // login, forgot, verify, reset
  const [error, setError] = useState('');
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
      setError('Password reset successful! Please log in.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={
          step === 'login' ? handleLogin :
          step === 'forgot' ? handleSendOtp :
          step === 'verify' ? handleVerifyOtp :
          handleResetPassword
        }
        className="bg-white p-8 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4">
          {step === 'login' && 'Student Login'}
          {step === 'forgot' && 'Forgot Password'}
          {step === 'verify' && 'Enter OTP'}
          {step === 'reset' && 'Reset Password'}
        </h2>

        {step === 'login' && (
          <>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="mb-4 w-full p-2 border rounded" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="mb-4 w-full p-2 border rounded" />
          </>
        )}

        {step === 'forgot' && (
          <input type="text" placeholder="Register Number" value={registerNo} onChange={e => setRegisterNo(e.target.value)} required className="mb-4 w-full p-2 border rounded" />
        )}

        {step === 'verify' && (
          <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required className="mb-4 w-full p-2 border rounded" />
        )}

        {step === 'reset' && (
          <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mb-4 w-full p-2 border rounded" />
        )}

        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          {step === 'login' && 'Login'}
          {step === 'forgot' && 'Send OTP'}
          {step === 'verify' && 'Verify OTP'}
          {step === 'reset' && 'Reset Password'}
        </button>

        {step === 'login' && (
          <button
            type="button"
            onClick={() => setStep('forgot')}
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            Forgot Password?
          </button>
        )}

        {(step !== 'login') && (
          <button
            type="button"
            onClick={() => setStep('login')}
            className="mt-4 text-gray-600 hover:underline text-sm"
          >
            Back to Login
          </button>
        )}
      </form>
    </div>
  );
};

export default StudentLogin;
