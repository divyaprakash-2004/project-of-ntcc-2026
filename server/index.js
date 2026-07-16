const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const LessonPlan = require('./models/Lesson');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gramschool_flow';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB database connection error:', err));

// API Routes

// 1. GET /api/lessons: Fetch all lesson plans (AC 1 & AC 2)
app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await LessonPlan.find({});
    res.json(lessons);
  } catch (err) {
    console.error('Error fetching lessons:', err);
    res.status(500).json({ error: 'Server error fetching lesson plans.' });
  }
});

// 2. POST /api/lessons/sync: Idempotently upsert synced data arrays (AC 2 & AC 3)
app.post('/api/lessons/sync', async (req, res) => {
  try {
    const { lessons } = req.body;
    if (!Array.isArray(lessons)) {
      return res.status(400).json({ error: 'Payload must contain a lessons array.' });
    }

    const syncPromises = lessons.map(async (lesson) => {
      const { id, ...lessonData } = lesson;
      if (!id) return null;

      // Upsert using the frontend 'id' mapped to MongoDB '_id' (AC 3)
      return LessonPlan.findOneAndUpdate(
        { _id: id },
        { 
          _id: id,
          ...lessonData,
          lastUpdated: lessonData.lastUpdated || Date.now()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    });

    await Promise.all(syncPromises);
    const updatedLessons = await LessonPlan.find({});
    res.json({ message: 'Sync successful.', lessons: updatedLessons });
  } catch (err) {
    console.error('Error syncing lessons:', err);
    res.status(500).json({ error: 'Server error during sync.' });
  }
});

// 3. POST /api/lessons/seed: Seed endpoint to populate DB
app.post('/api/lessons/seed', async (req, res) => {
  try {
    const count = await LessonPlan.countDocuments({});
    if (count > 0) {
      return res.json({ message: 'Database already seeded.', count });
    }

    const defaultLessons = [
      {
        _id: 'lesson_math_3_frac',
        title: 'Intro to Fractions',
        subject: 'Mathematics',
        grade: 'Grade 3',
        description: 'Learn fractions through physical block models and simple shapes.',
        durationMinutes: 45,
        scheduledDate: '2026-07-20',
        teacherId: 'teacher_ramesh_01',
        status: 'planned',
        milestones: [
          { milestoneId: 'm1', stepNumber: 1, instruction: 'Distribute visual fraction cards (halves and quarters).', isCompleted: false },
          { milestoneId: 'm2', stepNumber: 2, instruction: 'Demonstrate folding paper into equal shares.', isCompleted: false },
          { milestoneId: 'm3', stepNumber: 3, instruction: 'Complete class workbook page 12.', isCompleted: false }
        ],
        lastUpdated: Date.now()
      },
      {
        _id: 'lesson_science_4_water',
        title: 'Water Cycle Basics',
        subject: 'Science',
        grade: 'Grade 4',
        description: 'Understand evaporation, condensation, and precipitation.',
        durationMinutes: 50,
        scheduledDate: '2026-07-21',
        teacherId: 'teacher_ramesh_01',
        status: 'planned',
        milestones: [
          { milestoneId: 'w1', stepNumber: 1, instruction: 'Illustrate water cycle stages on the board.', isCompleted: false },
          { milestoneId: 'w2', stepNumber: 2, instruction: 'Run simple solar cup evaporation experiment.', isCompleted: false }
        ],
        lastUpdated: Date.now()
      }
    ];

    await LessonPlan.insertMany(defaultLessons);
    res.json({ message: 'Default lessons seeded successfully.' });
  } catch (err) {
    console.error('Error seeding DB:', err);
    res.status(500).json({ error: 'Error seeding database.' });
  }
});

// App listener
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
