// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const Register = () => {
//   const [role, setRole] = useState('student');
//   const [form, setForm] = useState({
//     name: '', email: '', password: '', yearOfStudy: '', batch: '', rollNumber: ''
//   });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleRegister = async (e) => {
//   e.preventDefault();
//   setError('');

//   try {
//     let payload = { name: form.name, email: form.email, password: form.password };

//     if (role === 'student') {
//       payload = { ...payload, yearOfStudy: form.yearOfStudy, batch: form.batch, rollNumber: form.rollNumber };
//     }

//     const res = await axios.post(`/api/register/${role}`, payload);

//     if (role === 'admin') {
//       // If you're creating a new admin account, log in as that new admin:
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('role', role);
//       localStorage.setItem('userName', res.data[role]?.name || 'Admin');
//       navigate('/admin');
//     } else {
//       // ✅ For student registration, DO NOT replace admin session:
//       alert('Student registered successfully!');
//       navigate('/admin');  // Simply return to admin dashboard
//     }

//   } catch (err) {
//     setError(err.response?.data?.error || 'Registration failed');
//   }
// };


//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-80">
//         <h2 className="text-2xl font-bold mb-4">Register</h2>

//         <select value={role} onChange={e => setRole(e.target.value)} className="mb-4 w-full p-2 border rounded">
//           <option value="student">Student</option>
//           <option value="admin">Admin</option>
//         </select>

//         <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />
//         <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />
//         <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />

//         {role === 'student' && (
//           <>
//             <input name="yearOfStudy" type="text" placeholder="Year of Study (e.g. 2020-2024)" value={form.yearOfStudy} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />
//             <input name="batch" type="text" placeholder="Batch (e.g. N, P, Q)" value={form.batch} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />
//             <input name="rollNumber" type="text" placeholder="Roll Number" value={form.rollNumber} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />
//           </>
//         )}

//         {error && <div className="text-red-500 mb-2">{error}</div>}

//         <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
//           Register
//         </button>

//         <div className="mt-4 text-center">
//           <a href="/login" className="text-blue-500 hover:underline">Already have an account? Login</a>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Register;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [registerType, setRegisterType] = useState('single'); // 'single' or 'bulk'
  const [form, setForm] = useState({
    name: '', email: '', password: '', yearOfStudy: '', batch: '', rollNumber: ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSingleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        yearOfStudy: form.yearOfStudy,
        batch: form.batch,
        rollNumber: form.rollNumber
      };

      await axios.post('/api/register/student', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Student registered successfully!');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select an Excel file.');

    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post('/api/register/students-bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      alert('Students uploaded successfully!');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'File upload failed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">

      <div className="flex space-x-4 mb-6">
        <button onClick={() => setRegisterType('single')} className={`p-2 rounded ${registerType === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
          Register Single Student
        </button>
        <button onClick={() => setRegisterType('bulk')} className={`p-2 rounded ${registerType === 'bulk' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
          Upload Excel (Bulk)
        </button>
      </div>

      {registerType === 'single' ? (
        <form onSubmit={handleSingleRegister} className="bg-white p-8 rounded shadow-md w-80">
          <h2 className="text-xl font-bold mb-4">Register Student</h2>

          <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />
          <input name="yearOfStudy" type="text" placeholder="Year of Study" value={form.yearOfStudy} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />
          <input name="batch" type="text" placeholder="Batch" value={form.batch} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />
          <input name="rollNumber" type="text" placeholder="Roll Number" value={form.rollNumber} onChange={handleChange} required className="mb-4 w-full p-2 border rounded" />

          {error && <div className="text-red-500 mb-2">{error}</div>}

          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Register Student
          </button>
        </form>
      ) : (
        <form onSubmit={handleFileUpload} className="bg-white p-8 rounded shadow-md w-80">
          <h2 className="text-xl font-bold mb-4">Upload Students Excel File</h2>

          <input type="file" accept=".xlsx, .xls" onChange={e => setFile(e.target.files[0])} className="mb-4 w-full p-2 border rounded" />

          {error && <div className="text-red-500 mb-2">{error}</div>}

          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Upload File
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;

