// models/ShareToken.js
const mongoose = require('mongoose');

const shareTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // 30 days from now
});



module.exports = mongoose.model('ShareToken', shareTokenSchema);