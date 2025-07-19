import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';

const BACKEND_URL = "http://localhost:5000";

const studentRepoTiles = [
  "Internships",
  "Placement",
  "Higher Education",
  "Competitive Exams",
  "Course",
  "Achievements (Co-Curriculum)",
  "Participation",
  "Extra-Curricular Activities",
];

export default function ShareView() {
  const { token } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [achievements, setAchievements] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/share/${token}`);
        if (!res.ok) throw new Error('Invalid or expired share link');
        
        const data = await res.json();
        setStudentData(data.student);
        
        // Organize achievements by category
        const organized = {};
        studentRepoTiles.forEach(category => {
          organized[category] = data.achievements.filter(a => a.category === category);
        });
        setAchievements(organized);
      } catch (err) {
        console.error('Error fetching shared data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSharedData();
  }, [token]);

  const generateReport = () => {
    if (!studentData || !achievements) return;

    const doc = new jsPDF();
    let y = 20;

    const drawBorder = () => {
      doc.setDrawColor(0);
      doc.rect(10, 10, 190, 277);
    };

    drawBorder();

    // Add student info header
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text(`Student Achievement Report for ${studentData.name}`, 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);
    doc.text(`CGPA: ${studentData.cgpa || 'Not specified'}`, 105, y, { align: 'center' });
    y += 15;

    Object.entries(achievements).forEach(([category, items]) => {
      if (!items.length) return;

      // Category Heading
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(category, 15, y);
      const textWidth = doc.getTextWidth(category);
      doc.line(15, y + 1, 15 + textWidth, y + 1);
      y += 10;

      items.forEach((item) => {
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        
        doc.text(`• ${item.title}${item.companyName ? ` at ${item.companyName}` : ''}`, 20, y);
        y += 6;
        doc.text(`From: ${new Date(item.fromDate).toLocaleDateString()} To: ${item.toDate ? new Date(item.toDate).toLocaleDateString() : 'Present'}`, 20, y);
        y += 6;

        doc.setFont("times", "normal");
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(item.shortDescription, 170);
        doc.text(splitText, 25, y);
        y += splitText.length * 5 + 3;

        if (y > 270) {
          doc.addPage();
          drawBorder();
          y = 20;
        }
      });

      y += 5;
    });

    doc.save(`${studentData.name}_achievements_report.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading shared portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {studentData?.name}'s Portfolio
          </h1>
          <button
            onClick={generateReport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Download Full Report
          </button>
        </div>

        {studentData?.cgpa && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800">Academic Information</h2>
            <p className="mt-2"><span className="font-medium">CGPA:</span> {studentData.cgpa}</p>
          </div>
        )}

        <div className="space-y-8">
          {studentRepoTiles.map((category) => {
            const categoryItems = achievements[category] || [];
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="border rounded-lg overflow-hidden">
                <h2 className="bg-gray-800 text-white p-3 text-xl font-semibold">
                  {category}
                </h2>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryItems.map((item, idx) => {
                    const isImage = item.file?.contentType?.startsWith('image') || 
                                  (item.fileType && item.fileType === 'image');

                    return (
                      <div key={idx} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                          {isImage ? (
                            <img
                              src={`${BACKEND_URL}/file/${item._id}`}
                              alt={item.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="text-gray-500 text-center text-sm">
                              <span className="text-6xl">📄</span>
                              <p>PDF Document</p>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{item.title}</h3>
                          {item.companyName && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Company:</span> {item.companyName}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Period:</span> {new Date(item.fromDate).toLocaleDateString()} -{' '}
                            {item.toDate ? new Date(item.toDate).toLocaleDateString() : 'Present'}
                          </p>
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {item.description}
                          </p>
                          <a
                            href={`${BACKEND_URL}/file/${item._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Document →
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {Object.values(achievements).every(arr => arr.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              This portfolio doesn't have any achievements yet.
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
          <p>This is a view-only link to {studentData?.name}'s portfolio.</p>
          <p className="mt-1">The link will expire after 30 days.</p>
        </div>
      </div>
    </div>
  );
}