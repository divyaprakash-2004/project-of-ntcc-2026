const express = require('express');
const router = express.Router();

const LessonPlan = require('../models/Lesson');
const Curriculum = require('../models/Curriculum');
const TeacherAssignment = require('../models/TeacherAssignment');

/**
 * Helper to calculate Monday-to-Friday ISO date strings for a given week start date.
 * @param {string} startStr Monday start date string (e.g. "2026-07-20")
 * @returns {Array<string>} Array of 5 date strings
 */
function getWeekDates(startStr) {
  const dates = [];
  const monday = new Date(startStr);
  
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    // Format to YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  
  return dates;
}

/**
 * POST /api/schedules/generate
 * Idempotently generates tailored weekly lesson plans for a teacher's classes/subjects.
 * Input body: { teacherId: "teacher_ramesh_01", startDate: "2026-07-20" }
 */
router.post('/generate', async (req, res) => {
  try {
    const { teacherId, startDate } = req.body;

    if (!teacherId || !startDate) {
      return res.status(400).json({ error: 'Missing teacherId or startDate parameters.' });
    }

    // 1. Fetch teacher assignments
    const teacherData = await TeacherAssignment.findById(teacherId);
    if (!teacherData || !teacherData.assignments || teacherData.assignments.length === 0) {
      return res.status(404).json({ error: `No class/subject assignments found for teacher ${teacherId}.` });
    }

    const weekDates = getWeekDates(startDate);
    const generatedPlans = [];

    // 2. Loop through each assigned class/subject
    for (const assign of teacherData.assignments) {
      const { grade, subject } = assign;

      // Check if plans already exist for this week/teacher/grade/subject to ensure uniqueness (AC 2)
      const existing = await LessonPlan.find({
        teacherId,
        grade,
        subject,
        scheduledDate: { $in: weekDates }
      });

      // If plans are already generated, collect them and skip regeneration
      if (existing && existing.length > 0) {
        generatedPlans.push(...existing);
        continue;
      }

      // 3. Query baseline Curriculum topics
      const curriculumMap = await Curriculum.findOne({ grade, subject });
      if (!curriculumMap || !curriculumMap.topics || curriculumMap.topics.length === 0) {
        console.warn(`No curriculum found for ${grade} ${subject}. Skipping.`);
        continue;
      }

      // 4. Determine curriculum progression count (where we left off)
      const completedCount = await LessonPlan.countDocuments({
        teacherId,
        grade,
        subject,
        status: 'completed'
      });

      // Sort topics by sequence number to ensure curriculum progression
      const sortedTopics = [...curriculumMap.topics].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

      // 5. Generate lesson plan for each school day (Monday to Friday)
      for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
        const topicIndex = completedCount + dayIndex;
        const targetDate = weekDates[dayIndex];

        // If curriculum has more topics to teach
        if (topicIndex < sortedTopics.length) {
          const topic = sortedTopics[topicIndex];
          
          // Construct unique lesson ID based on teacher, grade, subject, and date to prevent duplication (AC 2)
          const lessonId = `lesson_${teacherId}_${grade.replace(/\s+/g, '_')}_${subject}_${targetDate}`;

          const lessonPlanData = {
            _id: lessonId,
            title: topic.title,
            subject,
            grade,
            description: topic.description,
            durationMinutes: topic.durationMinutes,
            scheduledDate: targetDate,
            teacherId,
            status: 'planned',
            milestones: topic.milestones.map(m => ({
              milestoneId: m.milestoneId,
              stepNumber: m.stepNumber,
              instruction: m.instruction,
              isCompleted: false
            })),
            lastUpdated: Date.now()
          };

          // Idempotent upsert
          const savedPlan = await LessonPlan.findOneAndUpdate(
            { _id: lessonId },
            lessonPlanData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          generatedPlans.push(savedPlan);
        }
      }
    }

    res.json({
      message: 'Weekly schedule generation completed successfully.',
      startDate,
      endDate: weekDates[4],
      plansCount: generatedPlans.length,
      plans: generatedPlans
    });

  } catch (err) {
    console.error('Error generating weekly schedules:', err);
    res.status(500).json({ error: 'Server error during schedule generation.' });
  }
});

/**
 * GET /api/schedules/teacher/:teacherId
 * Fetch all generated schedules for a teacher.
 */
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const plans = await LessonPlan.find({ teacherId });
    res.json(plans);
  } catch (err) {
    console.error('Error retrieving teacher plans:', err);
    res.status(500).json({ error: 'Error retrieving lesson plans.' });
  }
});

module.exports = router;
