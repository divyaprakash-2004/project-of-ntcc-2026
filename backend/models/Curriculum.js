const mongoose = require('mongoose');

const CurriculumMilestoneSchema = new mongoose.Schema({
  milestoneId: { type: String, required: true },
  stepNumber: { type: Number, required: true },
  instruction: { type: String, required: true }
});

const CurriculumTopicSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  sequenceNumber: { type: Number, required: true }, // Order of execution in the school year
  title: { type: String, required: true },
  description: { type: String },
  durationMinutes: { type: Number, default: 45 },
  milestones: [CurriculumMilestoneSchema]
});

const CurriculumSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "curriculum_math_grade3"
  subject: { type: String, required: true, index: true },
  grade: { type: String, required: true, index: true },
  topics: [CurriculumTopicSchema]
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

module.exports = mongoose.model('Curriculum', CurriculumSchema);
