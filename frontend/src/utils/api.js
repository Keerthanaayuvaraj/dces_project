// import axios from 'axios';

// const api = axios.create({
//   baseURL: '/api',
// });

// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api; 

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Adjust if your backend route is different
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
