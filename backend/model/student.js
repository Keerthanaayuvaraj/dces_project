const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  yearOfStudy: { type: String, required: true }, // e.g., "2020-2024"
  batch: { type: String, required: true }, // e.g., "N", "P", "Q"
  cgpa: { type: Number }, // optional, can be updated after registration
  hasInterned: { type: Boolean, default: false },
  isPlaced: { type: Boolean, default: false },
  internships: [{ type: String }],
  placements: [{ type: String }],
  courses: [{ type: String }],
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentAchievement' }],
  rollNumber: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema); 