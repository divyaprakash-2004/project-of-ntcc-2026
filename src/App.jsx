import { useState, useEffect } from 'react';
import { getLessons, saveLesson, saveLessonsBulk, clearLessons } from './db';
import { useLanguage } from './LanguageContext';
import './App.css';

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
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { currentLang, changeLanguage, t } = useLanguage();

  // Dashboard states
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncMessage, setSyncMessage] = useState('Local database initialized.');

  const refreshLessons = () => {
    getLessons()
      .then((loadedLessons) => {
        const sorted = loadedLessons.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
        setLessons(sorted);
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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (isLoggedIn) {
      refreshLessons();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isLoggedIn]);

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

  const handleTestDeduplication = () => {
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
      syncStatus: 'pending_update'
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

  // Mock Login Execution
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  // Render Login Card if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <span className="logo-emoji">🏫</span>
            <h2>{t.title}</h2>
            <p className="subtitle">{t.welcome}</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="login-form">
            {/* Language Selector Dropdown (AC 1) */}
            <div className="form-group lang-select-group">
              <label htmlFor="lang-select">🌐 {t.select_lang}</label>
              <select
                id="lang-select"
                className="select-input"
                value={currentLang}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="username">{t.username}</label>
              <input
                id="username"
                type="text"
                className="text-input"
                placeholder={t.username}
                required
                disabled
                value="teacher_ramesh"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t.password}</label>
              <input
                id="password"
                type="password"
                className="text-input"
                placeholder="••••••••"
                required
                disabled
                value="password123"
              />
            </div>

            <p className="form-note">{t.enter_details}</p>

            <button type="submit" className="btn btn-primary btn-block">
              🔑 {t.login_btn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="app-header">
        <div className="logo-group">
          <span className="logo-icon">🏫</span>
          <h1>{t.title}</h1>
        </div>
        <div className="header-actions">
          <button className="btn-logout" onClick={() => setIsLoggedIn(false)}>
            🚪 Logout
          </button>
          <div className={`network-badge ${isOnline ? 'online' : 'offline'}`}>
            <span className="badge-dot"></span>
            {isOnline ? 'Online (System Connected)' : 'Offline Mode (Local Cache)'}
          </div>
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
