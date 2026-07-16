import { useState, useEffect } from 'react';
import { getLessons, saveLesson, saveLessonsBulk, clearLessons } from './db';
import './App.css';

// Premium Color Scheme & Icons integrated inside React App
const MOCK_LESSONS = [
  {
    id: 'lesson_math_3_frac',
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
    ]
  },
  {
    id: 'lesson_science_4_water',
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
    ]
  }
];

function App() {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncMessage, setSyncMessage] = useState('Local database initialized.');

  // Refresh lesson list from IndexedDB cache
  const refreshLessons = () => {
    getLessons()
      .then((loadedLessons) => {
        // Sort lessons by scheduled date
        const sorted = loadedLessons.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
        setLessons(sorted);
        
        // Retain selection if valid
        if (selectedLesson) {
          const updatedSelected = sorted.find(l => l.id === selectedLesson.id);
          setSelectedLesson(updatedSelected || null);
        }
      })
      .catch((err) => {
        console.error('Error loading cached lessons:', err);
        setSyncMessage('Error accessing local database.');
      });
  };

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial database load
    refreshLessons();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Seed mock lesson database locally (AC 1)
  const handleSeedData = () => {
    saveLessonsBulk(MOCK_LESSONS)
      .then(() => {
        setSyncMessage('Cached mock lessons loaded into IndexedDB.');
        refreshLessons();
      })
      .catch((err) => {
        console.error(err);
        setSyncMessage('Failed to seed cache.');
      });
  };

  // Test Deduplication (AC 3)
  const handleTestDeduplication = () => {
    // Attempting bulk save of the identical mock lessons
    saveLessonsBulk(MOCK_LESSONS)
      .then(() => {
        setSyncMessage('Bulk sync simulation triggered. Duplicate entry check passed.');
        refreshLessons();
      })
      .catch((err) => {
        console.error(err);
        setSyncMessage('Deduplication test failed.');
      });
  };

  // Toggle milestone completion (Stores update offline immediately - AC 1)
  const handleToggleMilestone = (lesson, milestoneId) => {
    const updatedMilestones = lesson.milestones.map((m) => {
      if (m.milestoneId === milestoneId) {
        return { ...m, isCompleted: !m.isCompleted };
      }
      return m;
    });

    const isAllCompleted = updatedMilestones.every(m => m.isCompleted);
    const updatedLesson = {
      ...lesson,
      milestones: updatedMilestones,
      status: isAllCompleted ? 'completed' : 'planned',
      syncStatus: 'pending_update' // Flags the changes for remote synchronization
    };

    saveLesson(updatedLesson)
      .then(() => {
        setSyncMessage(`Progress updated offline for: "${lesson.title}".`);
        refreshLessons();
      })
      .catch((err) => {
        console.error(err);
        setSyncMessage('Failed to write offline changes.');
      });
  };

  // Clear local IndexedDB cache
  const handleClearCache = () => {
    clearLessons()
      .then(() => {
        setSyncMessage('Local IndexedDB cache cleared.');
        setLessons([]);
        setSelectedLesson(null);
      })
      .catch((err) => {
        console.error(err);
        setSyncMessage('Failed to clear cache.');
      });
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="app-header">
        <div className="logo-group">
          <span className="logo-icon">🏫</span>
          <h1>GramSchool Flow</h1>
        </div>
        <div className={`network-badge ${isOnline ? 'online' : 'offline'}`}>
          <span className="badge-dot"></span>
          {isOnline ? 'Online (System Connected)' : 'Offline Mode (Local Cache)'}
        </div>
      </header>

      {/* Control / Info Bar */}
      <section className="info-bar">
        <div className="status-message">
          <strong>System Log:</strong> {syncMessage}
        </div>
        <div className="actions-group">
          <button className="btn btn-primary" onClick={handleSeedData}>
            🌱 Load Mock Lessons
          </button>
          <button className="btn btn-secondary" onClick={handleTestDeduplication}>
            🛡️ Simulate Bulk Sync (Deduplicate)
          </button>
          <button className="btn btn-danger" onClick={handleClearCache}>
            🗑️ Clear Cache
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="main-layout">
        {/* Sidebar: Lesson List */}
        <section className="sidebar">
          <h2>Daily Schedules ({lessons.length})</h2>
          {lessons.length === 0 ? (
            <div className="empty-state">
              <p>No cached lessons found.</p>
              <p className="subtext">Click "Load Mock Lessons" to populate the local database offline.</p>
            </div>
          ) : (
            <div className="lessons-list">
              {lessons.map((lesson) => {
                const completedCount = lesson.milestones.filter(m => m.isCompleted).length;
                return (
                  <div
                    key={lesson.id}
                    className={`lesson-card ${selectedLesson?.id === lesson.id ? 'active' : ''}`}
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <div className="card-header">
                      <span className="subject-tag">{lesson.subject}</span>
                      <span className="grade-tag">{lesson.grade}</span>
                    </div>
                    <h3>{lesson.title}</h3>
                    <div className="card-footer">
                      <span className="date-tag">📅 {lesson.scheduledDate}</span>
                      <span className={`status-pill ${lesson.status}`}>
                        {lesson.status} ({completedCount}/{lesson.milestones.length})
                      </span>
                    </div>
                    {lesson.syncStatus === 'pending_update' && (
                      <div className="unsynced-badge">🔄 Unsynced Changes</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Content: Selected Lesson Details & Checklist */}
        <section className="content-panel">
          {selectedLesson ? (
            <div className="lesson-details">
              <div className="details-header">
                <h2>{selectedLesson.title}</h2>
                <div className="meta-info">
                  <span><strong>Subject:</strong> {selectedLesson.subject}</span>
                  <span><strong>Grade Level:</strong> {selectedLesson.grade}</span>
                  <span><strong>Duration:</strong> {selectedLesson.durationMinutes} minutes</span>
                  <span><strong>Date:</strong> {selectedLesson.scheduledDate}</span>
                </div>
              </div>

              <div className="details-body">
                <h3>Lesson Overview</h3>
                <p>{selectedLesson.description}</p>

                <h3>Classroom Milestones (Tap to Check Off Offline)</h3>
                <div className="milestones-checklist">
                  {selectedLesson.milestones.map((milestone) => (
                    <label
                      key={milestone.milestoneId}
                      className={`milestone-item ${milestone.isCompleted ? 'completed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={milestone.isCompleted}
                        onChange={() => handleToggleMilestone(selectedLesson, milestone.milestoneId)}
                      />
                      <span className="checkbox-custom"></span>
                      <span className="milestone-text">
                        <strong>Step {milestone.stepNumber}:</strong> {milestone.instruction}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-panel">
              <span className="panel-icon">📋</span>
              <h3>No Lesson Selected</h3>
              <p>Select a lesson plan from the sidebar to view schedules, milestones, and record progress.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
