// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaUserGraduate, FaUserCog } from 'react-icons/fa';
// //import Home from './pages/Home'; // This is Home.jsx
// // import LoginPage from './pages/LoginPage';
// // import StudentDashboard from './pages/StudentDashboard';

// export default function Home() {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
//       {/* Short Intro Note */}
//       <div className="text-center mb-10">
//         <h1 className="text-3xl font-bold text-blue-800 mb-4">
//           Welcome to DCSE Achievements Portal
//         </h1>
//         <p className="text-gray-600 max-w-xl mx-auto">
//           This portal is designed to help students manage their academic and extracurricular achievements.
//           Admins have the authority to register and manage student accounts. Please proceed to login below.
//         </p>
//       </div>

//       {/* Login Options */}
//       <div className="flex flex-wrap justify-center gap-8">
//         {/* Student Login */}
//         <div
//           onClick={() => navigate('/login')}
//           className="bg-white shadow-md rounded-lg p-8 w-72 flex flex-col items-center hover:shadow-xl cursor-pointer transform hover:scale-105 transition"
//         >
//           <FaUserGraduate className="text-6xl text-blue-600 mb-4" />
//           <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded">
//             Student Login
//           </button>
//         </div>

//         {/* Admin Login */}
//         <div
//           onClick={() => navigate('/login')}
//           className="bg-white shadow-md rounded-lg p-8 w-72 flex flex-col items-center hover:shadow-xl cursor-pointer transform hover:scale-105 transition"
//         >
//           <FaUserCog className="text-6xl text-gray-700 mb-4" />
//           <button className="bg-gray-700 hover:bg-black text-white font-semibold py-2 px-6 rounded">
//             Admin Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }




// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaUserGraduate, FaUserCog } from 'react-icons/fa';

// export default function Home() {
//   const navigate = useNavigate();

//   return (
//     <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 overflow-hidden px-4">
      
//       {/* Animated Circles Background */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {[...Array(20)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute bg-blue-200 rounded-full opacity-40 animate-pulse"
//             style={{
//               width: `${10 + Math.random() * 30}px`,
//               height: `${10 + Math.random() * 30}px`,
//               top: `${Math.random() * 100}%`,
//               left: `${Math.random() * 100}%`,
//               animationDuration: `${4 + Math.random() * 4}s`
//             }}
//           />
//         ))}
//       </div>

//       {/* Intro Section */}
//       <div className="text-center mb-10 animate-fade-in">
//         <h1 className="text-4xl font-extrabold text-blue-800 mb-4 drop-shadow-sm animate-fadeIn">
//   Welcome to DCSE Achievements Portal
// </h1>

// <FaUserGraduate className="text-6xl text-blue-500 mb-4 animate-bounceSlow" />
//         <p className="text-gray-600 max-w-xl mx-auto text-lg">
//           A centralized platform for managing and celebrating academic & extracurricular milestones.
//         </p>
//       </div>

//       {/* Login Cards */}
//       <div className="flex flex-wrap justify-center gap-10 z-10">
//         {/* Student Login */}
//         <div
//           onClick={() => navigate('/login')}
//           className="bg-white shadow-lg rounded-xl p-8 w-72 flex flex-col items-center hover:shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
//         >
//           <FaUserGraduate className="text-6xl text-blue-500 mb-4 animate-bounce-slow" />
//           <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-sm transition-all duration-300">
//             Student Login
//           </button>
//         </div>

//         {/* Admin Login */}
//         <div
//           onClick={() => navigate('/login')}
//           className="bg-white shadow-lg rounded-xl p-8 w-72 flex flex-col items-center hover:shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
//         >
//           <FaUserCog className="text-6xl text-gray-700 mb-4 animate-bounce-slow" />
//           <button className="bg-gray-700 hover:bg-black text-white font-semibold py-2 px-6 rounded-full shadow-sm transition-all duration-300">
//             Admin Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }




import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaUserCog } from 'react-icons/fa';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white overflow-hidden">

      {/* Background Floating Circles */}
      <div className="absolute top-10 left-10 w-56 h-56 bg-blue-200 opacity-30 rounded-full animate-pulseSlow"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-300 opacity-20 rounded-full animate-pulseSlow"></div>

      {/* Portal Title */}
      <h1 className="text-4xl font-extrabold text-blue-800 mb-4 drop-shadow-lg animate-fadeIn">
        Welcome to DCSE Achievements Portal
      </h1>

      {/* Short Description */}
      <p className="text-gray-600 max-w-xl text-center mb-10 px-4 animate-fadeIn delay-200">
        Empowering students and administrators to manage academic and extracurricular achievements seamlessly.
      </p>

      {/* Login Cards */}
      <div className="flex flex-wrap justify-center gap-8 animate-fadeIn delay-300">
        
        {/* Student Card */}
        <div
          onClick={() => navigate('/studentlogin')}
          className="bg-white bg-opacity-70 backdrop-blur-md shadow-xl rounded-xl p-8 w-72 cursor-pointer transition transform hover:scale-105 hover:shadow-blue-300 border border-blue-100"
        >
          <FaUserGraduate className="text-6xl text-blue-600 mb-4 mx-auto animate-bounceSlow" />
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded w-full">
            Student Login
          </button>
        </div>

        {/* Admin Card */}
        <div
          onClick={() => navigate('/adminlogin')}
          className="bg-white bg-opacity-70 backdrop-blur-md shadow-xl rounded-xl p-8 w-72 cursor-pointer transition transform hover:scale-105 hover:shadow-blue-300 border border-blue-100"
        >
          <FaUserCog className="text-6xl text-gray-700 mb-4 mx-auto animate-bounceSlow" />
          <button className="bg-gray-700 hover:bg-black text-white font-semibold py-2 px-6 rounded w-full">
            Admin Login
          </button>
        </div>
      </div>

      {/* Footer Light Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-100 to-transparent"></div>
    </div>
  );
}
