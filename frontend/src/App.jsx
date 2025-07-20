// import React, { useState, useEffect } from "react";
// import { jsPDF } from "jspdf";
// import { useNavigate } from 'react-router-dom';

// const studentRepoTiles = [
//   "Internships",
//   "Placement",
//   "Higher Education",
//   "Competitive Exams",
//   "Course",
//   "Achievements (Co-Curriculum)",
//   "Participation",
//   "Extra-Curricular Activities",
// ];

// const BACKEND_URL = "http://localhost:5000";

// export default function App() {
//   const [activeSection, setActiveSection] = useState("Student Repository");
//   const [activeTile, setActiveTile] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [uploads, setUploads] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [showReportModal, setShowReportModal] = useState(false);
//   const [selectedItems, setSelectedItems] = useState({});
//   const [cgpa, setCgpa] = useState(() => {
//     const saved = localStorage.getItem('cgpa');
//     return saved ? Number(saved) : '';
//   });
//   const navigate = useNavigate();

//   // Get user info from JWT
//   const token = localStorage.getItem('token');
//   const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
//   const userName = user?.name || 'Student';
//   const studentId = user?.id;

//   // Load saved data from localStorage
//   useEffect(() => {
//     const saved = localStorage.getItem("uploads");
//     if (saved) {
//       setUploads(JSON.parse(saved));
//     }
//   }, []);

//   // Save to localStorage when uploads change
//   useEffect(() => {
//     localStorage.setItem("uploads", JSON.stringify(uploads));
//   }, [uploads]);

//   // Fetch initial data from backend
//   useEffect(() => {
//     if (!studentId) return;

//     const fetchInitialData = async () => {
//       try {
//         const promises = studentRepoTiles.map(async (category) => {
//           const res = await fetch(`${BACKEND_URL}/achievements/${studentId}/${category}`, {
//             headers: {
//               'Authorization': Bearer `${token}`
//             }
//           });
//           if (res.ok) {
//             const data = await res.json();
//             return { category, data };
//           }
//           return { category, data: [] };
//         });
        
//         const results = await Promise.all(promises);
//         const newUploads = {};
//         results.forEach(({ category, data }) => {
//           newUploads[category] = data;
//         });
        
//         setUploads(newUploads);
//       } catch (err) {
//         console.error("Fetch error:", err);
//       }
//     };
    
//     fetchInitialData();
//   }, [studentId, token]);

//   // Fetch data when active tile changes
//   useEffect(() => {
//     if (!activeTile || !studentId) return;

//     const fetchAchievements = async () => {
//       try {
//         const res = await fetch(`${BACKEND_URL}/achievements/${studentId}/${activeTile}`, {
//           headers: {
//             'Authorization': Bearer `${token}`
//           }
//         });
//         if (!res.ok) throw new Error('Failed to fetch data');
//         const data = await res.json();
//         setUploads(prev => ({ ...prev, [activeTile]: data }));
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError('Failed to load achievements');
//       }
//     };
    
//     fetchAchievements();
//   }, [activeTile, studentId, token]);

//   const validateDates = (fromDate, toDate) => {
//     if (!fromDate) return true; // No from date selected yet
//     if (!toDate) return true; // No to date selected yet (optional field)

//     const from = new Date(fromDate);
//     const to = new Date(toDate);

//     return to >= from;
//   };

//   const handleSelect = (category, id) => {
//     setSelectedItems((prev) => {
//       const current = prev[category] || [];
//       return {
//         ...prev,
//         [category]: current.includes(id)
//           ? current.filter((i) => i !== id)
//           : [...current, id],
//       };
//     });
//   };

//   const generateReportFromSelection = () => {
//     const doc = new jsPDF();
//     let y = 20;

//     const drawBorder = () => {
//       doc.setDrawColor(0);
//       doc.rect(10, 10, 190, 277);
//     };

//     drawBorder();

//     // Add student info header
//     doc.setFont("times", "bold");
//     doc.setFontSize(16);
//     doc.text(`Student Achievement Report for ${userName}`, 105, y, { align: 'center' });
//     y += 10;
//     doc.setFontSize(12);
//     doc.text(`CGPA: ${cgpa || 'Not specified'}`, 105, y, { align: 'center' });
//     y += 15;

//     Object.entries(selectedItems).forEach(([category, ids]) => {
//       const items = (uploads[category] || []).filter((item) =>
//         ids.includes(item._id)
//       );
//       if (!items.length) return;

//       // Category Heading
//       doc.setFont("times", "bold");
//       doc.setFontSize(14);
//       doc.setTextColor(0, 0, 0);
//       doc.text(category, 15, y);
//       const textWidth = doc.getTextWidth(category);
//       doc.line(15, y + 1, 15 + textWidth, y + 1);
//       y += 10;

//       items.forEach((item) => {
//         doc.setFont("times", "bold");
//         doc.setFontSize(12);
        
//         doc.text(`• ${item.title}${item.companyName ? ` at ${item.companyName}` : ''}`, 20, y);
//         y += 6;
//         doc.text(`From: ${new Date(item.fromDate).toLocaleDateString()} To: ${item.toDate ? new Date(item.toDate).toLocaleDateString() : 'Present'}`, 20, y);
//         y += 6;

//         doc.setFont("times", "normal");
//         doc.setFontSize(10);
//         const splitText = doc.splitTextToSize(item.shortDescription, 170);
//         doc.text(splitText, 25, y);
//         y += splitText.length * 5 + 3;

//         if (y > 270) {
//           doc.addPage();
//           drawBorder();
//           y = 20;
//         }
//       });

//       y += 5;
//     });

//     doc.save(`${userName}_achievements_report.pdf`);
//     setShowReportModal(false);
//   };

//   const generateFullReport = () => {
//     const doc = new jsPDF();
//     let y = 20;

//     const drawBorder = () => {
//       doc.setDrawColor(0);
//       doc.rect(10, 10, 190, 277);
//     };

//     drawBorder();

//     // Add student info header
//     doc.setFont("times", "bold");
//     doc.setFontSize(16);
//     doc.text(`Complete Achievement Report for ${userName}`, 105, y, { align: 'center' });
//     y += 10;
//     doc.setFontSize(12);
//     doc.text(`CGPA: ${cgpa || 'Not specified'}`, 105, y, { align: 'center' });
//     y += 15;

//     Object.entries(uploads).forEach(([category, items]) => {
//       if (!items.length) return;

//       doc.setFont("times", "bold");
//       doc.setFontSize(14);
//       doc.setTextColor(0, 0, 0);
//       doc.text(category, 15, y);
//       const textWidth = doc.getTextWidth(category);
//       doc.line(15, y + 1, 15 + textWidth, y + 1);
//       y += 10;

//       items.forEach((item) => {
//         doc.setFont("times", "bold");
//         doc.setFontSize(12);
      
//         doc.text(`• ${item.title}${item.companyName ? ` at ${item.companyName}` : ''}`, 20, y);
//         y += 6;
//         doc.text(`From: ${new Date(item.fromDate).toLocaleDateString()} To: ${item.toDate ? new Date(item.toDate).toLocaleDateString() : 'Present'}`, 20, y);
//         y += 6;

//         doc.setFont("times", "normal");
//         doc.setFontSize(10);
//         const splitText = doc.splitTextToSize(item.shortDescription, 170);
//         doc.text(splitText, 25, y);
//         y += splitText.length * 5 + 3;

//         if (y > 270) {
//           doc.addPage();
//           drawBorder();
//           y = 20;
//         }
//       });

//       y += 5;
//     });

//     doc.save(`${userName}_complete_achievements_report.pdf`);
//   };

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     const form = e.target;
//     const file = form.file.files[0];  
//     const fromDate = e.target.fromDate.value;
//     const toDate = e.target.toDate.value || null; // Handle empty toDate

//     //Validate date
//     if (toDate && !validateDates(fromDate, toDate)) {
//       setError("End date cannot be before start date");
//       return;
//     }
    
//     // Validate inputs
//     if (!file && !editingId) {
//       setError("Please select a file");
//       return;
//     }

//     // File validation
//     if (file) {
//       const validTypes = ["application/pdf", "image/jpeg", "image/png"];
//       if (!validTypes.includes(file.type)) {
//         setError("Only PDF, JPEG, and PNG files are allowed");
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) {
//         setError("File size must be less than 5MB");
//         return;
//       }
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       let formData = new FormData();
//       const jsonData = {
//         title: form.title.value.trim(),
//         description: form.description.value.trim(),
//         fromDate: form.fromDate.value,
//         toDate: form.toDate.value || null,
//         shortDescription: form.shortDescription.value.trim(),
//         category: activeTile
//       };

//       if (activeTile === 'Internships' || activeTile === 'Placement') {
//         jsonData.companyName = form.companyName.value.trim();
//       }

//       if (file) {
//         formData.append('file', file);
//         Object.entries(jsonData).forEach(([key, value]) => {
//           formData.append(key, value);
//         });

//         const res = await fetch(
//           editingId ? `${BACKEND_URL}/achievements/${editingId}` : `${BACKEND_URL}/upload`, 
//           {
//             method: editingId ? 'PUT' : 'POST',
//             body: formData,
//             headers: {
//               'Authorization': `Bearer ${token}`
//             }
//           }
//         );

//         if (!res.ok) throw new Error(editingId ? "Update failed" : "Upload failed");
//         const data = await res.json();

//         setUploads(prev => {
//           const newUploads = { ...prev };
//           if (editingId) {
//             newUploads[activeTile] = newUploads[activeTile].map(item => 
//               item._id === editingId ? data.achievement || data : item
//             );
//           } else {
//             newUploads[activeTile] = [...(newUploads[activeTile] || []), data.achievement || data];
//           }
//           return newUploads;
//         });
//       } else {
//         const res = await fetch(`${BACKEND_URL}/achievements/${editingId}`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//           body: JSON.stringify(jsonData),
//         });

//         if (!res.ok) throw new Error("Update failed");
//         const data = await res.json();

//         setUploads(prev => ({
//           ...prev,
//           [activeTile]: prev[activeTile].map(item => 
//             item._id === editingId ? data.achievement || data : item
//           ),
//         }));
//       }

//       setShowForm(false);
//       setEditingId(null);
//       form.reset();
//     } catch (err) {
//       console.error("Operation failed", err);
//       setError(err.message || (editingId ? "Update failed" : "Upload failed") + ". Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEdit = (id) => {
//     setEditingId(id);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this entry?')) {
//       try {
//         const res = await fetch(`${BACKEND_URL}/achievements/${id}`, {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });

//         if (!res.ok) throw new Error('Delete failed');

//         setUploads(prev => {
//           const updatedUploads = { ...prev };
//           Object.keys(updatedUploads).forEach(category => {
//             updatedUploads[category] = updatedUploads[category].filter(item => item._id !== id);
//           });
//           return updatedUploads;
//         });

//       } catch (err) {
//         console.error("Delete failed", err);
//         setError(err.message || "Delete failed. Please try again.");
//       }
//     }
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate('/login');
//   };

//   const handleCgpaSave = async () => {
//     if (!cgpa || cgpa < 0 || cgpa > 10) {
//       alert('Please enter a valid CGPA (0-10)');
//       return;
//     }
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/student/cgpa`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ cgpa: Number(cgpa) })
//       });
//       if (!res.ok) throw new Error('Failed to update CGPA');
//       const data = await res.json();
//       localStorage.setItem('cgpa', data.cgpa);
//       alert('CGPA updated!');
//     } catch (err) {
//       alert('Failed to update CGPA');
//     }
//   };

//   // Redirect to login if no token
//   if (!token) {
//     navigate('/login');
//     return null;
//   }

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-64 bg-white shadow-lg">
//         <h2 className="text-2xl font-bold p-4 border-b">Dashboard</h2>
//         <ul>
//           {["Student Repository", "Feedback"].map((item) => (
//             <li
//               key={item}
//               className={`p-4 cursor-pointer hover:bg-blue-100 ${
//                 activeSection === item
//                   ? "bg-blue-200 font-semibold text-blue-600"
//                   : ""
//               }`}
//               onClick={() => {
//                 setActiveSection(item);
//                 setActiveTile(null);
//               }}
//             >
//               {item}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-6 relative overflow-auto">
//         {/* Welcome and Logout */}
//         <div className="flex justify-between items-center mb-4">
//           <div className="text-xl font-semibold">Welcome, {userName}</div>
//           <div className="flex gap-4 items-center">
//             <div className="flex items-center gap-2">
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 max="10"
//                 value={cgpa}
//                 onChange={e => setCgpa(e.target.value)}
//                 placeholder="Enter CGPA"
//                 className="p-2 border rounded w-32"
//               />
//               <button
//                 onClick={handleCgpaSave}
//                 className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
//               >
//                 Save CGPA
//               </button>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//         <h1 className="text-3xl font-semibold mb-6">
//           {activeTile || activeSection}
//         </h1>

//         {/* Tile View */}
//         {activeSection === "Student Repository" && !activeTile && (
//           <>
//             <div className="flex justify-end mb-4 gap-2">
//               <button
//                 onClick={() => setShowReportModal(true)}
//                 className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
//               >
//                 Generate Selective Report
//               </button>
//               <button
//                 onClick={generateFullReport}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//               >
//                 Generate Full Report
//               </button>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//               {studentRepoTiles.map((title) => (
//                 <div
//                   key={title}
//                   className="bg-white rounded-xl shadow-md p-6 text-center text-lg font-medium hover:shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300"
//                   onClick={() => setActiveTile(title)}
//                 >
//                   {title}
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* Upload View */}
//         {activeTile && (
//           <>
//             <button
//               className="mb-4 text-white bg-blue-500 p-2 rounded hover:bg-blue-700 transition-colors"
//               onClick={() => setActiveTile(null)}
//             >
//               Back
//             </button>
            
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//               {(uploads[activeTile] || []).map((item, idx) => {
//                 const isImage = item.file?.contentType?.startsWith('image') || 
//                               (item.fileType && item.fileType === 'image');

//                 return (
//                   <div key={idx} className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
//                     <div className="h-40 bg-gray-100 flex items-center justify-center">
//                       {isImage ? (
//                         <img
//                           src={`${BACKEND_URL}/file/${item._id}`}
//                           alt={item.title}
//                           className="h-full w-full object-cover"
//                           loading="lazy"
//                         />
//                       ) : (
//                         <div className="text-gray-500 text-center text-sm">
//                           <span className="text-6xl">📄</span>
//                           <p>PDF Document</p>
//                         </div>
//                       )}
//                     </div>

//                     <div className="p-4 space-y-2 flex-1">
//                       <h3 className="font-semibold text-xl text-center">{item.title}</h3>
//                         <p className="text-sm text-gray-600">
//                           <strong>Period:</strong> {new Date(item.fromDate).toLocaleDateString()} - 
//                           {item.toDate ? new Date(item.toDate).toLocaleDateString() : 'Present'}
//                         </p>
//                         {item.companyName && (
//                           <p className="text-sm text-gray-600">
//                             <strong>Company:</strong> {item.companyName}
//                           </p>
//                         )}  
//                       <p className="text-sm text-gray-600 line-clamp-2">
//                         <strong>Description:</strong> {item.description}
//                       </p>
//                       <div className="flex gap-2 mt-2">
//                         <a
//                           href={`${BACKEND_URL}/file/${item._id}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="flex-1 bg-blue-500 text-white rounded p-1 hover:bg-blue-700 transition-colors text-sm text-center"
//                         >
//                           View File
//                         </a>
//                         <button
//                           onClick={() => handleEdit(item._id)}
//                           className="flex-1 bg-yellow-500 text-white rounded p-1 hover:bg-yellow-600 transition-colors text-sm"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(item._id)}
//                           className="flex-1 bg-red-500 text-white rounded p-1 hover:bg-red-600 transition-colors text-sm"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}

//               {uploads[activeTile]?.length === 0 && (
//                 <p className="text-gray-500 col-span-full text-center py-8">
//                   No uploads yet. Click the + button to add one.
//                 </p>
//               )}
//             </div>

//             <div className="fixed bottom-6 right-28 flex gap-4">
//               <button
//                 onClick={() => setShowReportModal(true)}
//                 className="bg-green-500 font-bold text-white px-4 py-2 rounded-full shadow-2xl hover:bg-green-600 hover:scale-105 transform transition duration-300 ease-in-out"
//                 aria-label="Generate report"
//               >
//                 Generate Report
//               </button>
              
//               <button
//                 className="bg-blue-500 font-bold text-white w-16 h-16 flex items-center justify-center rounded-full text-2xl shadow-2xl 
//                           hover:bg-blue-600 hover:scale-110 transform transition duration-300 ease-in-out"
//                 onClick={() => {
//                   setShowForm(true);
//                   setEditingId(null);
//                 }}
//                 aria-label="Add new upload"
//               >
//                 +
//               </button>
//             </div>
//           </>
//         )}

//         {/* Report Selection Modal */}
//         {showReportModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
//             <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-full overflow-y-auto">
//               <h2 className="text-2xl font-bold mb-4">Select Items for Report</h2>
//               <div className="space-y-4">
//                 {studentRepoTiles.map((category) => {
//                   const items = uploads[category] || [];
//                   return (
//                     <div key={category}>
//                       <h3 className="text-lg font-semibold text-blue-600 mb-2">{category}</h3>
//                       {items.length > 0 ? (
//                         <div className="space-y-2 pl-4">
//                           {items.map((item) => (
//                             <label key={item._id} className="flex items-start gap-2">
//                               <input
//                                 type="checkbox"
//                                 checked={selectedItems[category]?.includes(item._id) || false}
//                                 onChange={() => handleSelect(category, item._id)}
//                                 className="mt-1"
//                               />
//                               <div>
//                                 <span>{item.title}</span>
//                                 {item.companyName && <span className="text-xs block">Company: {item.companyName}</span>}
//                                 <span className="text-xs text-gray-500 block">
//                                   {new Date(item.fromDate).toLocaleDateString()} - {item.toDate ? new Date(item.toDate).toLocaleDateString() : 'Present'}
//                                 </span>
//                               </div>
//                             </label>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="text-sm text-gray-500 pl-4">No items available.</p>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//               <div className="mt-6 flex justify-end gap-2">
//                 <button
//                   onClick={() => setShowReportModal(false)}
//                   className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={generateReportFromSelection}
//                   className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                 >
//                   Generate
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Upload/Edit Modal */}
//         {showForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
//             <form
//               className="bg-white p-6 rounded-lg w-full max-w-md space-y-4"
//               onSubmit={handleUpload}
//             >
//               <h2 className="text-xl font-semibold">
//                 {editingId ? "Edit Achievement" : "Upload Achievement"}
//               </h2>
              
//               {error && (
//                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//                   {error}
//                 </div>
//               )}

//               <div className="space-y-4">
//                 <input 
//                   type="text" 
//                   name="title" 
//                   placeholder="Title" 
//                   required 
//                   className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   defaultValue={editingId ? uploads[activeTile]?.find(item => item._id === editingId)?.title : ''}
//                 />
//                 <input 
//                   type="text" 
//                   name="description" 
//                   placeholder="Description" 
//                   required 
//                   className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   defaultValue={editingId ? uploads[activeTile]?.find(item => item._id === editingId)?.description : ''}
//                 />
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
//                     <input
//                       type="date"
//                       name="fromDate"
//                       required
//                       className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       defaultValue={editingId ? uploads[activeTile]?.find(item => item._id === editingId)?.fromDate : ''}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
//                     <input
//                       type="date"
//                       name="toDate"
//                       className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       defaultValue={editingId ? uploads[activeTile]?.find(item => item._id === editingId)?.toDate : ''}
//                     />
//                   </div>
//                 </div>

//                 {(activeTile === 'Internships' || activeTile === 'Placement') && (
//                   <input
//                     type="text"
//                     name="companyName"
//                     placeholder="Company Name"
//                     required={activeTile === 'Internships' || activeTile === 'Placement'}
//                     className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     defaultValue={editingId ? uploads[activeTile]?.find(item => item._id === editingId)?.companyName : ''}
//                   />
//                 )}
//                 <input 
//                   type="text" 
//                   name="shortDescription" 
//                   placeholder="Short Description (for report)" 
//                   required 
//                   className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   defaultValue={editingId ? uploads[activeTile]?.find(item => item._id === editingId)?.shortDescription : ''}
//                 />
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     File (PDF, JPG, PNG) {editingId && '(Leave empty to keep current file)'}
//                   </label>
//                   <input 
//                     type="file" 
//                     name="file" 
//                     accept=".pdf,.jpg,.jpeg,.png" 
//                     required={!editingId}
//                     className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2 pt-4">
//                 <button 
//                   type="button" 
//                   onClick={() => {
//                     setShowForm(false);
//                     setEditingId(null);
//                     setError(null);
//                   }} 
//                   className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
//                   disabled={isLoading}
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit" 
//                   className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       {editingId ? "Updating..." : "Uploading..."}
//                     </>
//                   ) : editingId ? "Update" : "Upload"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';  
import StudentDashboard from './pages/StudentDashboard';

function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Welcome to DCSE Achievements Portal</h1>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/studentlogin')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Student Login
        </button>
        <button
          onClick={() => navigate('/adminlogin')}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-black"
        >
          Admin Login
        </button>
      </div>
    </div>
  );
}

// function LoginPage() {
//   const navigate = useNavigate();
//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
//       <h1 className="text-2xl font-bold mb-4">Login Page</h1>
//       <button
//         onClick={() => navigate('/studentdashboard')}
//         className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//       >
//         Simulate Login (Go to Dashboard)
//       </button>
//     </div>
//   );
// }


function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/studentlogin" element={<StudentLogin />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
  );
}

export default App;