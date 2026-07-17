const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  milestoneId: { type: String, required: true },
  stepNumber: { type: Number, required: true },
  instruction: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

const FeedbackSchema = new mongoose.Schema({
  engagementRating: { type: Number, min: 1, max: 5, required: true },
  classroomNotes: { type: String, maxlength: 1000 },
  feedbackSubmittedAt: { type: Number, required: true }
});

const LessonPlanSchema = new mongoose.Schema({
  // Unique client-side generated ID mapped to MongoDB _id key (enforces AC 3)
  _id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, index: true },
  grade: { type: String, required: true, index: true },
  description: { type: String },
  durationMinutes: { type: Number, default: 45 },
  scheduledDate: { type: String, required: true, index: true }, // Store as ISO String date
  teacherId: { type: String, required: true, index: true },
  status: { 
    type: String, 
    enum: ['planned', 'completed', 'postponed'], 
    default: 'planned' 
  },
  milestones: [MilestoneSchema],
  feedback: { type: FeedbackSchema, default: null },
  lastUpdated: { type: Number, required: true }
}, {
  timestamps: true,
  // Transform output to match frontend IndexedDB format (id instead of _id)
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('LessonPlan', LessonPlanSchema);
