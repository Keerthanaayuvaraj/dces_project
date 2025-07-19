// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const mongoose = require('mongoose');
// const { authMiddleware } = require('./auth');
// const app = express();
// const PORT = 5000;

// // MongoDB connection
// mongoose.connect('mongodb://localhost:27017/studentRepository')
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('MongoDB connection error:', err));

// // Enable CORS
// app.use(cors());
// app.use(express.json());

// // Models
// const StudentAchievement = require('./model/studentAchievement');
// const Student = require('./model/student');

// // Configure multer to handle file in memory
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });


// // Upload endpoint
// // Update the upload endpoint to include fileType and studentId
// app.post('/upload', authMiddleware('student'), upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const { title, description, fromDate, toDate, shortDescription, category, companyName } = req.body;

//     if (toDate && new Date(toDate) < new Date(fromDate)) {
//       return res.status(400).json({ 
//         error: "End date cannot be before start date" 
//       });
//     }

//     const studentId = req.user.id;
//     console.log('Saving achievement for studentId:', studentId);
//     const achievement = new StudentAchievement({
//       title,
//       description,
//       fromDate,
//       toDate,
//       companyName, 
//       shortDescription,
//       category,
//       studentId,
//       file: {
//         filename: req.file.originalname,
//         data: req.file.buffer,
//         contentType: req.file.mimetype
//       },
//       fileType: req.file.mimetype.startsWith('image') ? 'image' : 'pdf'
//     });

//     await achievement.save();

//     // Auto-update hasInterned or isPlaced
//     if (category === 'Internships') {
//       await Student.findByIdAndUpdate(studentId, { hasInterned: true });
//     }
//     if (category === 'Placement') {
//       await Student.findByIdAndUpdate(studentId, { isPlaced: true });
//     }

//     res.status(201).json({
//       message: 'File uploaded and record created successfully',
//       achievement
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({ error: 'Server error during upload' });
//   }
// });

// // Get file endpoint
// app.get('/file/:id', async (req, res) => {
//   try {
//     const achievement = await StudentAchievement.findById(req.params.id);
    
//     if (!achievement || !achievement.file.data) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     res.set('Content-Type', achievement.file.contentType);
//     res.set('Content-Disposition', `inline; filename="${achievement.file.filename}"`);
//     res.send(achievement.file.data);
// }catch (error) {
//     console.error('Download error:', error);
//     res.status(500).json({ error: 'Server error during download' });
//   }
// });

// // Get achievements by student ID and category
// app.get('/achievements/:studentId/:category', authMiddleware('student'), async (req, res) => {
//   try {
//     // Verify the requesting student matches the requested studentId
//     if (req.user.id !== req.params.studentId && req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Unauthorized access' });
//     }

//     const achievements = await StudentAchievement.find({
//       studentId: req.params.studentId,
//       category: req.params.category
//     }).sort({ createdAt: -1 });

//     // Don't send file data in list view to reduce payload size
//     const achievementsWithoutFileData = achievements.map(ach => ({
//       ...ach.toObject(),
//       file: { 
//         filename: ach.file.filename,
//         contentType: ach.file.contentType,
//         id: ach._id 
//       }
//     }));

//     res.json(achievementsWithoutFileData);
//   } catch (error) {
//     console.error('Error fetching achievements:', error);
//     res.status(500).json({ error: 'Server error fetching data' });
//   }
// });

// // Update achievement
// app.put('/achievements/:id', authMiddleware('student'), upload.single('file'), async (req, res) => {
//   try {
//     const { title, description, fromDate, toDate, shortDescription, category, companyName } = req.body;
//     const updateData = {
//       title,
//       description,
//       fromDate,
//       toDate,
//       companyName,
//       shortDescription,
//       category,
//       studentId: req.user.id
//     };

//     if (req.file) {
//       updateData.file = {
//         filename: req.file.originalname,
//         data: req.file.buffer,
//         contentType: req.file.mimetype
//       };
//       updateData.fileType = req.file.mimetype.startsWith('image') ? 'image' : 'pdf';
//     }

//     const updatedAchievement = await StudentAchievement.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );

//     if (!updatedAchievement) {
//       return res.status(404).json({ error: 'Achievement not found' });
//     }

//     res.json(updatedAchievement);
//   } catch (error) {
//     console.error('Update error:', error);
//     res.status(500).json({ error: 'Server error during update' });
//   }
// });

// // Delete achievement
// app.delete('/achievements/:id', async (req, res) => {
//   try {
//     const deletedAchievement = await StudentAchievement.findByIdAndDelete(req.params.id);
    
//     if (!deletedAchievement) {
//       return res.status(404).json({ error: 'Achievement not found' });
//     }

//     res.json({ message: 'Achievement deleted successfully' });
//   } catch (error) {
//     console.error('Delete error:', error);
//     res.status(500).json({ error: 'Server error during deletion' });
//   }
// });

// // Start server
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// app.use('/api', require('./routes/studentRoutes'));

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { authMiddleware } = require('./auth');
const app = express();
const PORT = 5000;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/studentRepository')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Enable CORS
app.use(cors());
app.use(express.json());

// Models
const StudentAchievement = require('./model/studentAchievement');
const Student = require('./model/student');

// Configure multer to handle file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});



// Upload endpoint
// Update the upload endpoint to include fileType and studentId
app.post('/upload', authMiddleware('student'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, fromDate, toDate, shortDescription, category, companyName } = req.body;
    const studentId = req.user.id;
    console.log('Saving achievement for studentId:', studentId);
    const achievement = new StudentAchievement({
      title,
      description,
      fromDate,
      toDate,
      companyName, 
      shortDescription,
      category,
      studentId,
      file: {
        filename: req.file.originalname,
        data: req.file.buffer,
        contentType: req.file.mimetype
      },
      fileType: req.file.mimetype.startsWith('image') ? 'image' : 'pdf'
    });

    await achievement.save();

    // Auto-update hasInterned or isPlaced
    if (category === 'Internships') {
      await Student.findByIdAndUpdate(studentId, { hasInterned: true });
    }
    if (category === 'Placement') {
      await Student.findByIdAndUpdate(studentId, { isPlaced: true });
    }

    res.status(201).json({
      message: 'File uploaded and record created successfully',
      achievement
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// Get file endpoint
app.get('/file/:id', async (req, res) => {
  try {
    const achievement = await StudentAchievement.findById(req.params.id);
    
    if (!achievement || !achievement.file.data) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.set('Content-Type', achievement.file.contentType);
    res.set('Content-Disposition', `inline; filename="${achievement.file.filename}"`);
    res.send(achievement.file.data);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Server error during download' });
  }
});

// Get achievements by student ID and category
app.get('/achievements/:studentId/:category', authMiddleware('student'), async (req, res) => {
  try {
    // Verify the requesting student matches the requested studentId
    if (req.user.id !== req.params.studentId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const achievements = await StudentAchievement.find({
      studentId: req.params.studentId,
      category: req.params.category
    }).sort({ createdAt: -1 });

    // Don't send file data in list view to reduce payload size
    const achievementsWithoutFileData = achievements.map(ach => ({
      ...ach.toObject(),
      file: { 
        filename: ach.file.filename,
        contentType: ach.file.contentType,
        id: ach._id 
      }
    }));

    res.json(achievementsWithoutFileData);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Server error fetching data' });
  }
});

// Update achievement
app.put('/achievements/:id', authMiddleware('student'), upload.single('file'), async (req, res) => {
  try {
    const { title, description, fromDate, toDate, shortDescription, category, companyName } = req.body;
    const updateData = {
      title,
      description,
      fromDate,
      toDate,
      companyName,
      shortDescription,
      category,
      studentId: req.user.id
    };

    if (req.file) {
      updateData.file = {
        filename: req.file.originalname,
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
      updateData.fileType = req.file.mimetype.startsWith('image') ? 'image' : 'pdf';
    }

    const updatedAchievement = await StudentAchievement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedAchievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json(updatedAchievement);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Server error during update' });
  }
});

// Delete achievement
app.delete('/achievements/:id', async (req, res) => {
  try {
    const deletedAchievement = await StudentAchievement.findByIdAndDelete(req.params.id);
    
    if (!deletedAchievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error during deletion' });
  }
});

app.put('/change-password', authMiddleware('student'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const studentId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Both current and new password are required' 
      });
    }

    //Abi add proper password validation here
    /*
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 8 characters long' 
      });
    }
    */

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        error: 'Student not found' 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Current password is incorrect' 
      });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    student.password = hashedPassword;
    await student.save();

    res.json({ 
      success: true,
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ 
      success: false,
      error: 'An error occurred while changing password' 
    });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

app.use('/api', require('./routes/studentRoutes'));