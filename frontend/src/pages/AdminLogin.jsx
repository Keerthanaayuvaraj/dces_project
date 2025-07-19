// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const AdminLogin = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const res = await axios.post(`/api/adminlogin`, { email, password });
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('role', 'admin');
//       localStorage.setItem('userName', res.data.user?.name || 'Admin');
//       navigate('/admin');
//     } catch (err) {
//       setError(err.response?.data?.error || 'Login failed');
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80">
//         <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
//         <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="mb-4 w-full p-2 border rounded" />
//         <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="mb-4 w-full p-2 border rounded" />
//         {error && <div className="text-red-500 mb-2">{error}</div>}
//         <button type="submit" className="w-full bg-gray-700 text-white p-2 rounded hover:bg-black">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AdminLogin;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`http://localhost:5000/api/login/admin`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('userName', res.data.user?.name || 'Admin');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="mb-4 w-full p-2 border rounded" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="mb-4 w-full p-2 border rounded" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button type="submit" className="w-full bg-gray-700 text-white p-2 rounded hover:bg-black">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
