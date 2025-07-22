
const express = require('express');
const router = express.Router();
const Student = require('../model/student');
const Admin = require('../model/admin');
const { registerStudent, registerAdmin, login, authMiddleware } = require('../auth');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const StudentAchievement = require('../model/studentAchievement');
const archiver = require('archiver');
const multer = require('multer');
const xlsx = require('xlsx');


// Registration & Login
router.post('/register/student', registerStudent);
router.post('/register/admin', registerAdmin);
router.post('/login/student', (req, res) => login(req, res, 'student'));
router.post('/login/admin', (req, res) => login(req, res, 'admin'));

// GET ALL STUDENTS WITH FILTERS
router.get('/students', authMiddleware('admin'), async (req, res) => {
  try {
    const {
      fromYear, toYear, batch, cgpaMin, cgpaMax, search,
      hasInterned, isPlaced, isHigherEd, isCompExam,
      isCourse, isAchievement, isParticipation, isExtraC
    } = req.query;

    // const pf = fromYear ? parseInt(fromYear) : null;
    // const pt = toYear ? parseInt(toYear) : null;
    const pf = fromYear ? new Date(fromYear + '-02') : null;
    const pt = toYear ? new Date(toYear + '-02') : null;

    const baseFilter = {};
    if (batch) baseFilter.batch = batch;
   
    if (cgpaMin || cgpaMax) {
      baseFilter.cgpa = {};
      if (cgpaMin) baseFilter.cgpa.$gte = parseFloat(cgpaMin);
      if (cgpaMax) baseFilter.cgpa.$lte = parseFloat(cgpaMax);
    }

    let students = await Student.find(baseFilter);

    // 🟡 Full-text search on student + achievement fields
    if (search) {
      const regex = new RegExp(search, 'i');
      const matchedAchievements = await StudentAchievement.find({
        $or: [
          { title: regex },
          { description: regex },
          { shortDescription: regex },
          { companyName: regex }
        ]
      });

      const matchedIds = new Set(matchedAchievements.map(a => a.studentId.toString()));
      students = students.filter(s =>
        regex.test(s.name) ||
        regex.test(s.email) ||
        regex.test(s.rollNumber) ||
        matchedIds.has(s._id.toString())
      );
    }

    // 🟢 Define category filter
    const selectedCategories = [];
    if (hasInterned === 'true') selectedCategories.push('Internships');
    if (isPlaced === 'true') selectedCategories.push('Placement');
    if (isHigherEd === 'true') selectedCategories.push('Higher Education');
    if (isCompExam === 'true') selectedCategories.push('Competitive Exams');
    if (isCourse === 'true') selectedCategories.push('Course');
    if (isAchievement === 'true') selectedCategories.push('Achievements (Co-Curriculum)');
    if (isParticipation === 'true') selectedCategories.push('Participation');
    if (isExtraC === 'true') selectedCategories.push('Extra-Curricular Activities');

    const isCategoryFilterActive = selectedCategories.length > 0;

    // 🟠 CASE 2: Year-only filter
    // if (pf && pt && !isCategoryFilterActive) {
    //   students = students.filter(student => {
    //     const [start, end] = student.yearOfStudy.split('-').map(Number);
    //     return (
    //       (start >= pf && start <= pt) ||
    //       (end >= pf && end <= pt) ||
    //       (start < pf && end > pt)
    //     );
    //   });
    // }
    if (pf && pt && !isCategoryFilterActive) {
  students = students.filter(student => {
    const [start, end] = student.yearOfStudy.split('-').map(y => new Date(`${y}-01-01`));
    return (
      (start >= pf && start <= pt) ||
      (end >= pf && end <= pt) ||
      (start < pf && end > pt)
    );
  });
}

    // 🟣 Attach filtered achievements
    const studentsWithAchievements = await Promise.all(students.map(async student => {
      let allAchievements = await StudentAchievement.find({ studentId: student._id });

      if (isCategoryFilterActive) {
  allAchievements = allAchievements.filter(ach => {
    const matchesCategory = selectedCategories.includes(ach.category);
    if (!matchesCategory) return false;

    if (pf && pt) {
      // const sy = new Date(ach.fromDate).getFullYear();
      // const ey = ach.toDate ? new Date(ach.toDate).getFullYear() : sy;
      const sy = new Date(ach.fromDate);
      const ey = ach.toDate ? new Date(ach.toDate) : sy;

      return (
        (sy >= pf && sy <= pt) ||
        (ey >= pf && ey <= pt) ||
        (sy < pf && ey > pt)
      );
    }

    return true; // ✅ category matches and no year filter
  });

  if (allAchievements.length === 0) return null;
}


      const grouped = allAchievements.reduce((acc, ach) => {
        acc[ach.category] = acc[ach.category] || [];
        acc[ach.category].push(ach);
        return acc;
      }, {});

      return { ...student.toObject(), achievementsByCategory: grouped };
    }));

    const finalFilteredStudents = studentsWithAchievements.filter(s => s !== null);
    res.json(finalFilteredStudents);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});


// Single Student Details
router.get('/students/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const achievements = await StudentAchievement.find({ studentId: student._id });
    const grouped = achievements.reduce((acc, ach) => {
      acc[ach.category] = acc[ach.category] || [];
      acc[ach.category].push(ach);
      return acc;
    }, {});

    res.json({ ...student.toObject(), achievementsByCategory: grouped });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// PDF for Single Student
router.get('/students/:id/report', authMiddleware('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const achievements = await StudentAchievement.find({ studentId: student._id });
    const grouped = achievements.reduce((acc, ach) => {
      acc[ach.category] = acc[ach.category] || [];
      acc[ach.category].push(ach);
      return acc;
    }, {});

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="student_${student._id}_report.pdf"`);
    doc.pipe(res);

    // Title
    doc.font('Times-Bold').fontSize(22).text('Student Achievement Report', { align: 'center', underline: true });
    doc.moveDown(1.5);

    // Student Details
    const info = [
      ['Name', student.name],
      ['Email', student.email],
      ['Year of Study', student.yearOfStudy],
      ['Batch', student.batch],
      ['CGPA', student.cgpa || ''],
      ['Interned', student.hasInterned ? 'Yes' : 'No'],
      ['Placed', student.isPlaced ? 'Yes' : 'No']
    ];

    doc.fontSize(13).text('Student Details', { underline: true }).moveDown(0.5);
    info.forEach(([label, value]) => {
      doc.font('Times-Bold').text(`${label}: `, { continued: true });
      doc.font('Times-Roman').text(value);
    });

    // Achievements Section
    doc.moveDown(1).fontSize(13).text('Achievements & Uploads', { underline: true }).moveDown(0.5);

    if (Object.keys(grouped).length === 0) {
      doc.font('Times-Roman').text('No uploads/achievements found.');
    } else {
      Object.entries(grouped).forEach(([category, items]) => {
        doc.font('Times-Bold').fontSize(12).fillColor('blue').text(category).moveDown(0.2);

        items.forEach((a, idx) => {
          const formatMonthYear = (dateStr) => {
            if (!dateStr) return null;
            const options = { year: 'numeric', month: 'short' };
            return new Date(dateStr).toLocaleDateString('en-US', options);
          };

          const from = formatMonthYear(a.fromDate);
          const to = a.toDate ? formatMonthYear(a.toDate) : 'Present';
          const timePeriod = from && to ? `${from} – ${to}` : a.timePeriod || 'N/A';


          doc.font('Times-Bold').fontSize(11).fillColor('black').text(`${idx + 1}. ${a.title} (${timePeriod})`);
          doc.font('Times-Roman').text(`Description: ${a.description}`);
          doc.text(`Short Description: ${a.shortDescription}`);
          doc.text(`File: ${a.file?.filename || 'N/A'}`).moveDown(0.5);
        });

        // Add light gray divider between categories
        doc.moveDown(0.3);
        doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor('#cccccc').stroke();
        doc.moveDown(0.5);
      });
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

const upload = multer({ dest: 'uploads/' });

// Bulk Student Registration (Excel Upload)
router.post('/register/students-bulk', authMiddleware('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const students = xlsx.utils.sheet_to_json(sheet);

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Uploaded file is empty or invalid format' });
    }

    let insertedCount = 0;
    for (const student of students) {
      const {
        name,
        email,
        password,
        yearOfStudy,
        batch,
        rollNumber
      } = student;

      if (!name || !email || !password || !yearOfStudy || !batch || !rollNumber) {
        continue;  // Skip invalid rows
      }

      const hashedPassword = await require('../auth').hashPassword(password);

      await Student.create({
        name,
        email,
        password: hashedPassword,
        yearOfStudy,
        batch,
        rollNumber
      });

      insertedCount++;
    }

    res.json({ message: `${insertedCount} students registered successfully.` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Bulk student upload failed' });
  }
});
router.get('/students/report/excel', authMiddleware('admin'), async (req, res) => {
  try {
    const {
      fromYear, toYear, batch, cgpaMin, cgpaMax, search,
      hasInterned, isPlaced, isHigherEd, isCompExam,
      isCourse, isAchievement, isParticipation, isExtraC,
      columns = ''
    } = req.query;

    let selectedColumns = columns.split(',');

    // ✅ Auto-include Internship columns if internship checkbox is checked
    if (hasInterned === 'true') {
      if (!selectedColumns.includes('Internships')) selectedColumns.push('Internships');
      if (!selectedColumns.includes('Internships_timeline')) selectedColumns.push('Internships_timeline');
    }

    const pf = fromYear ? new Date(fromYear + '-02') : null;
    const pt = toYear ? new Date(toYear + '-02') : null;

    const baseFilter = {};
    if (batch) baseFilter.batch = batch;
    if (cgpaMin || cgpaMax) {
      baseFilter.cgpa = {};
      if (cgpaMin) baseFilter.cgpa.$gte = parseFloat(cgpaMin);
      if (cgpaMax) baseFilter.cgpa.$lte = parseFloat(cgpaMax);
    }

    let students = await Student.find(baseFilter);

    if (search) {
      const regex = new RegExp(search, 'i');
      const matchedAchievements = await StudentAchievement.find({
        $or: [
          { title: regex },
          { description: regex },
          { shortDescription: regex },
          { companyName: regex }
        ]
      });
      const matchedIds = new Set(matchedAchievements.map(a => a.studentId.toString()));
      students = students.filter(s =>
        regex.test(s.name) ||
        regex.test(s.email) ||
        regex.test(s.rollNumber) ||
        matchedIds.has(s._id.toString())
      );
    }

    const selectedCategories = [];
    if (hasInterned === 'true') selectedCategories.push('Internships');
    if (isPlaced === 'true') selectedCategories.push('Placement');
    if (isHigherEd === 'true') selectedCategories.push('Higher Education');
    if (isCompExam === 'true') selectedCategories.push('Competitive Exams');
    if (isCourse === 'true') selectedCategories.push('Course');
    if (isAchievement === 'true') selectedCategories.push('Achievements (Co-Curriculum)');
    if (isParticipation === 'true') selectedCategories.push('Participation');
    if (isExtraC === 'true') selectedCategories.push('Extra-Curricular Activities');

    const isCategoryFilterActive = selectedCategories.length > 0;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Filtered Students');

    const allFieldsMap = {
      name: { header: 'Name', width: 25 },
      email: { header: 'Email', width: 30 },
      rollNumber: { header: 'Roll Number', width: 20 },
      yearOfStudy: { header: 'Year of Study', width: 20 },
      batch: { header: 'Batch', width: 10 },
      cgpa: { header: 'CGPA', width: 10 },
      createdAt: { header: 'Created At', width: 25 },
      Internships: { header: 'Internship (Companies)', width: 40 },
      Internships_timeline: { header: 'Internship (Timeline)', width: 40 },
      Placement: { header: 'Placement (Companies)', width: 40 },
      'Higher Education': { header: 'Higher Education', width: 40 },
      'Competitive Exams': { header: 'Competitive Exams', width: 40 },
      Course: { header: 'Courses', width: 40 },
      'Achievements (Co-Curriculum)': { header: 'Achievements (Co-Curriculum)', width: 40 },
      Participation: { header: 'Participation', width: 40 },
      'Extra-Curricular Activities': { header: 'Extra-Curricular Activities', width: 40 }
    };

    worksheet.columns = selectedColumns.map(key => ({
      key,
      ...allFieldsMap[key]
    })).filter(Boolean);

    for (const student of students) {
      let achievements = await StudentAchievement.find({ studentId: student._id });

      if (isCategoryFilterActive) {
        achievements = achievements.filter(a => {
          if (!selectedCategories.includes(a.category)) return false;

          if (pf && pt) {
            const sy = new Date(a.fromDate);
            const ey = a.toDate ? new Date(a.toDate) : sy;
            return (
              (sy >= pf && sy <= pt) ||
              (ey >= pf && ey <= pt) ||
              (sy < pf && ey > pt)
            );
          }

          return true;
        });

        if (achievements.length === 0) continue;
      }

      if (pf && pt && !isCategoryFilterActive) {
        const [start, end] = student.yearOfStudy.split('-').map(y => new Date(`${y}-01-01`));
        if (
          !(start >= pf && start <= pt) &&
          !(end >= pf && end <= pt) &&
          !(start < pf && end > pt)
        ) continue;
      }

      const row = {};
      selectedColumns.forEach(key => {
        if (['name', 'email', 'rollNumber', 'yearOfStudy', 'batch', 'cgpa', 'createdAt'].includes(key)) {
          row[key] = key === 'createdAt'
            ? new Date(student.createdAt).toLocaleString()
            : student[key] ?? '';
        } else if (key === 'Internships') {
          const relevant = achievements.filter(a => a.category === 'Internships');
          row[key] = relevant.map(a => a.companyName || a.title).join(', ') || '-';
        } else if (key === 'Internships_timeline') {
          const relevant = achievements.filter(a => a.category === 'Internships');
          row[key] = relevant.map(a => {
            const from = a.fromDate ? new Date(a.fromDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '';
            const to = a.toDate ? new Date(a.toDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '';
            return from && to ? `${from} - ${to}` : from || to || '-';
          }).join('; ') || '-';
        } else {
          const relevant = achievements.filter(a => a.category === key);
          row[key] = relevant.map(a => a.companyName || a.title).join(', ') || '-';
        }
      });

      worksheet.addRow(row);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Student_Report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate Excel report' });
  }
});

router.put('/student/cgpa', authMiddleware('student'), async (req, res) => {
  try {
    const { cgpa } = req.body;
    if (typeof cgpa !== 'number' || cgpa < 0 || cgpa > 10) {
      return res.status(400).json({ error: 'Invalid CGPA' });
    }
    const student = await Student.findByIdAndUpdate(req.user.id, { cgpa }, { new: true });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'CGPA updated', cgpa: student.cgpa });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update CGPA' });
  }
});
router.get('/students/documents/zip', authMiddleware('admin'), async (req, res) => {
  try {
    const {
      fromYear, toYear, batch, cgpaMin, cgpaMax, search,
      hasInterned, isPlaced, isHigherEd, isCompExam,
      isCourse, isAchievement, isParticipation, isExtraC
    } = req.query;

    const pf = fromYear ? new Date(fromYear + '-02') : null;
    const pt = toYear ? new Date(toYear + '-02') : null;

    const baseFilter = {};
    if (batch) baseFilter.batch = batch;
    if (cgpaMin || cgpaMax) {
      baseFilter.cgpa = {};
      if (cgpaMin) baseFilter.cgpa.$gte = parseFloat(cgpaMin);
      if (cgpaMax) baseFilter.cgpa.$lte = parseFloat(cgpaMax);
    }

    let students = await Student.find(baseFilter);

    const searchRegex = search ? new RegExp(search, 'i') : null;
    let matchedAchievements = [];

    if (searchRegex) {
      matchedAchievements = await StudentAchievement.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { shortDescription: searchRegex },
          { companyName: searchRegex }
        ]
      });
    }

    const matchedStudentIds = new Set(matchedAchievements.map(a => a.studentId.toString()));
    students = students.filter(s =>
      !searchRegex ||
      searchRegex.test(s.name) ||
      searchRegex.test(s.email) ||
      searchRegex.test(s.rollNumber) ||
      matchedStudentIds.has(s._id.toString())
    );

    const selectedCategories = [];
    if (hasInterned === 'true') selectedCategories.push('Internships');
    if (isPlaced === 'true') selectedCategories.push('Placement');
    if (isHigherEd === 'true') selectedCategories.push('Higher Education');
    if (isCompExam === 'true') selectedCategories.push('Competitive Exams');
    if (isCourse === 'true') selectedCategories.push('Course');
    if (isAchievement === 'true') selectedCategories.push('Achievements (Co-Curriculum)');
    if (isParticipation === 'true') selectedCategories.push('Participation');
    if (isExtraC === 'true') selectedCategories.push('Extra-Curricular Activities');

    const isCategoryFilterActive = selectedCategories.length > 0;

    const archive = archiver('zip', { zlib: { level: 9 } });
    res.setHeader('Content-Disposition', 'attachment; filename=Filtered_Documents.zip');
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    for (const student of students) {
      let achievements = await StudentAchievement.find({
        studentId: student._id,
        file: { $exists: true, $ne: null }
      });

      if (isCategoryFilterActive) {
        achievements = achievements.filter(a => selectedCategories.includes(a.category));
      }

      if (pf && pt) {
        achievements = achievements.filter(a => {
          const sy = new Date(a.fromDate);
          const ey = a.toDate ? new Date(a.toDate) : sy;
          return (
            (sy >= pf && sy <= pt) ||
            (ey >= pf && ey <= pt) ||
            (sy < pf && ey > pt)
          );
        });
      }

      // if (searchRegex) {
      //   achievements = achievements.filter(a =>
      //     searchRegex.test(a.title) ||
      //     searchRegex.test(a.description) ||
      //     searchRegex.test(a.shortDescription) ||
      //     searchRegex.test(a.companyName)
      //   );
      // }

      for (const ach of achievements) {
        if (ach.file?.data && ach.file?.filename) {
          const ext = ach.file.filename.split('.').pop();
          const safeTitle = ach.title.replace(/[^a-z0-9]/gi, '_');
          const fileName = `${student.name.replace(/\s+/g, '_')}_${safeTitle}.${ext}`;
          archive.append(ach.file.data, { name: fileName });
        }
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate ZIP file' });
  }
});
// POST Selective PDF Report
router.post('/students/:id/selective-report', authMiddleware('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { categories } = req.body;
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'No categories selected' });
    }
  //   console.log("Selected categories:", categories);
  // console.log("Found achievements:", allAchievements.map(a => ({ title: a.title, category: a.category })));

    const allAchievements = await StudentAchievement.find({ studentId: student._id });
    //const filteredAchievements = allAchievements.filter(a => categories.includes(a.category));
    const filteredAchievements = allAchievements.filter(a =>
  categories.some(cat => cat.toLowerCase() === a.category.toLowerCase())
);

    const grouped = filteredAchievements.reduce((acc, ach) => {
      acc[ach.category] = acc[ach.category] || [];
      acc[ach.category].push(ach);
      return acc;
    }, {});

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="student_${student._id}_selective_report.pdf"`);
    doc.pipe(res);

    // Title
    doc.font('Times-Bold').fontSize(22).text('Selective Achievement Report', { align: 'center', underline: true });
    doc.moveDown(1.5);

    // Student Details
    const info = [
      ['Name', student.name],
      ['Email', student.email],
      ['Year of Study', student.yearOfStudy],
      ['Batch', student.batch],
      ['CGPA', student.cgpa || ''],
      ['Interned', student.hasInterned ? 'Yes' : 'No'],
      ['Placed', student.isPlaced ? 'Yes' : 'No']
    ];

    doc.fontSize(13).text('Student Details', { underline: true }).moveDown(0.5);
    info.forEach(([label, value]) => {
      doc.font('Times-Bold').text(`${label}: `, { continued: true });
      doc.font('Times-Roman').text(value);
    });

    // Achievements
    doc.moveDown(1).fontSize(13).text('Selected Achievements & Uploads', { underline: true }).moveDown(0.5);
    if (Object.keys(grouped).length === 0) {
      doc.font('Times-Roman').text('No achievements found for selected categories.');
    } else {
      Object.entries(grouped).forEach(([category, items]) => {
        doc.font('Times-Bold').fontSize(12).fillColor('blue').text(category).moveDown(0.2);

        items.forEach((a, idx) => {
          const formatMonthYear = (dateStr) => {
            if (!dateStr) return null;
            const options = { year: 'numeric', month: 'short' };
            return new Date(dateStr).toLocaleDateString('en-US', options);
          };

          const from = formatMonthYear(a.fromDate);
          const to = a.toDate ? formatMonthYear(a.toDate) : 'Present';
          const timePeriod = from && to ? `${from} – ${to}` : a.timePeriod || 'N/A';

          doc.font('Times-Bold').fontSize(11).fillColor('black').text(`${idx + 1}. ${a.title} (${timePeriod})`);
          doc.font('Times-Roman').text(`Description: ${a.description}`);
          doc.text(`Short Description: ${a.shortDescription}`);
          doc.text(`File: ${a.file?.filename || 'N/A'}`).moveDown(0.5);
        });

        doc.moveDown(0.3);
        doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor('#cccccc').stroke();
        doc.moveDown(0.5);
      });
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate selective PDF' });
  }
});

module.exports = router;

