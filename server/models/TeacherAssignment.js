const mongoose = require('mongoose');

const AssignmentItemSchema = new mongoose.Schema({
  classId: { type: String, required: true },
  grade: { type: String, required: true },
  subject: { type: String, required: true }
});

const TeacherAssignmentSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Mapped to teacherId, e.g., "teacher_ramesh_01"
  teacherId: { type: String, required: true, index: true },
  assignments: [AssignmentItemSchema]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('TeacherAssignment', TeacherAssignmentSchema);
