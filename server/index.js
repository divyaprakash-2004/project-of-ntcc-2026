const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const LessonPlan = require('./models/Lesson');
const Curriculum = require('./models/Curriculum');
const TeacherAssignment = require('./models/TeacherAssignment');
const schedulesRouter = require('./routes/schedules');

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
app.use('/api/schedules', schedulesRouter);

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
    // 1. Seed Curriculum
    const currCount = await Curriculum.countDocuments({});
    if (currCount === 0) {
      const curriculums = [
        {
          _id: 'curriculum_math_grade3',
          subject: 'Mathematics',
          grade: 'Grade 3',
          topics: [
            {
              topicId: 'math_3_t1',
              sequenceNumber: 1,
              title: 'Intro to Fractions',
              description: 'Learn fractions through physical block models and simple shapes.',
              durationMinutes: 45,
              milestones: [
                { milestoneId: 'm1', stepNumber: 1, instruction: 'Distribute visual fraction cards.' },
                { milestoneId: 'm2', stepNumber: 2, instruction: 'Demonstrate folding paper into equal shares.' },
                { milestoneId: 'm3', stepNumber: 3, instruction: 'Complete workbook page 12.' }
              ]
            },
            {
              topicId: 'math_3_t2',
              sequenceNumber: 2,
              title: 'Fractions on a Number Line',
              description: 'Locating halves, thirds, and quarters on a linear scale.',
              durationMinutes: 45,
              milestones: [
                { milestoneId: 'm4', stepNumber: 1, instruction: 'Draw number lines on board.' },
                { milestoneId: 'm5', stepNumber: 2, instruction: 'Place fractional intervals.' }
              ]
            },
            {
              topicId: 'math_3_t3',
              sequenceNumber: 3,
              title: 'Equivalent Fractions',
              description: 'Identify fractions with the same size values.',
              durationMinutes: 45,
              milestones: [
                { milestoneId: 'm6', stepNumber: 1, instruction: 'Compare fraction circles.' }
              ]
            },
            {
              topicId: 'math_3_t4',
              sequenceNumber: 4,
              title: 'Comparing Fractions',
              description: 'Using greater than or less than operators on fractions.',
              durationMinutes: 45,
              milestones: [
                { milestoneId: 'm7', stepNumber: 1, instruction: 'Work on compare exercises.' }
              ]
            },
            {
              topicId: 'math_3_t5',
              sequenceNumber: 5,
              title: 'Fractions of a Whole Group',
              description: 'Find half of 6 objects, quarter of 8 blocks.',
              durationMinutes: 45,
              milestones: [
                { milestoneId: 'm8', stepNumber: 1, instruction: 'Group count blocks.' }
              ]
            }
          ]
        },
        {
          _id: 'curriculum_science_grade4',
          subject: 'Science',
          grade: 'Grade 4',
          topics: [
            {
              topicId: 'sci_4_t1',
              sequenceNumber: 1,
              title: 'Water Cycle Basics',
              description: 'Understand evaporation, condensation, and precipitation.',
              durationMinutes: 50,
              milestones: [
                { milestoneId: 'w1', stepNumber: 1, instruction: 'Illustrate water cycle stages.' },
                { milestoneId: 'w2', stepNumber: 2, instruction: 'Run simple cup experiment.' }
              ]
            },
            {
              topicId: 'sci_4_t2',
              sequenceNumber: 2,
              title: 'Evaporation Experiment',
              description: 'Observe heat causing water levels to drop.',
              durationMinutes: 50,
              milestones: [
                { milestoneId: 'w3', stepNumber: 1, instruction: 'Place solar cups in windows.' }
              ]
            },
            {
              topicId: 'sci_4_t3',
              sequenceNumber: 3,
              title: 'Condensation in a Bottle',
              description: 'Demonstrating cloud creation inside a closed plastic container.',
              durationMinutes: 50,
              milestones: [
                { milestoneId: 'w4', stepNumber: 1, instruction: 'Fill bottles with warm water and match smoke.' }
              ]
            },
            {
              topicId: 'sci_4_t4',
              sequenceNumber: 4,
              title: 'Precipitation Types',
              description: 'Differentiating rain, snow, sleet, and hail.',
              durationMinutes: 50,
              milestones: [
                { milestoneId: 'w5', stepNumber: 1, instruction: 'Review weather chart cards.' }
              ]
            },
            {
              topicId: 'sci_4_t5',
              sequenceNumber: 5,
              title: 'Collection and Runoff',
              description: 'How water flows back to oceans and reservoirs.',
              durationMinutes: 50,
              milestones: [
                { milestoneId: 'w6', stepNumber: 1, instruction: 'Model soil absorption rates.' }
              ]
            }
          ]
        }
      ];
      await Curriculum.insertMany(curriculums);
    }

    // 2. Seed Teacher Assignments
    const assignCount = await TeacherAssignment.countDocuments({});
    if (assignCount === 0) {
      const defaultAssignment = {
        _id: 'teacher_ramesh_01',
        teacherId: 'teacher_ramesh_01',
        assignments: [
          { classId: 'class_grade_3', grade: 'Grade 3', subject: 'Mathematics' },
          { classId: 'class_grade_4', grade: 'Grade 4', subject: 'Science' }
        ]
      };
      await TeacherAssignment.create(defaultAssignment);
    }

    // 3. Seed Default Lesson Plans
    const count = await LessonPlan.countDocuments({});
    if (count === 0) {
      const defaultLessons = [
        {
          _id: 'lesson_teacher_ramesh_01_Grade_3_Mathematics_2026-07-13',
          title: 'Initial Overview',
          subject: 'Mathematics',
          grade: 'Grade 3',
          description: 'Baseline assessment of numerical skills.',
          durationMinutes: 45,
          scheduledDate: '2026-07-13',
          teacherId: 'teacher_ramesh_01',
          status: 'completed',
          milestones: [
            { milestoneId: 'm0', stepNumber: 1, instruction: 'Baseline test sheet completion.', isCompleted: true }
          ],
          lastUpdated: Date.now()
        }
      ];
      await LessonPlan.insertMany(defaultLessons);
    }

    res.json({ message: 'Curriculum, Assignments, and initial Lesson Logs seeded successfully.' });
  } catch (err) {
    console.error('Error seeding DB:', err);
    res.status(500).json({ error: 'Error seeding database.' });
  }
});

// 4. GET /api/teachers: Retrieve all active teacher IDs for n8n workflow loops
app.get('/api/teachers', async (req, res) => {
  try {
    const teachers = await TeacherAssignment.distinct('teacherId');
    res.json(teachers);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ error: 'Server error fetching teacher list.' });
  }
});

// App listener
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
