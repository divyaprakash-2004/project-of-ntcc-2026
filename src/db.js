const DB_NAME = 'GramSchoolFlowDB';
const DB_VERSION = 1;
const STORE_NAME = 'lessons';

/**
 * Initializes the IndexedDB instance for GramSchool Flow.
 * Creates the 'lessons' object store with 'id' as primary key if it does not exist.
 * @returns {Promise<IDBDatabase>}
 */
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database failed to open:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // 'id' is the unique primary key, which prevents duplicates on upsert (AC 3)
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('subject', 'subject', { unique: false });
        objectStore.createIndex('grade', 'grade', { unique: false });
        objectStore.createIndex('scheduledDate', 'scheduledDate', { unique: false });
        objectStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }
    };
  });
}

/**
 * Retrieves all lesson plans stored in local IndexedDB.
 * @returns {Promise<Array>} List of cached lesson plans.
 */
export function getLessons() {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Failed to get lessons:', event.target.error);
        reject(event.target.error);
      };
    });
  });
}

/**
 * Saves or updates a single lesson plan in IndexedDB.
 * Since keyPath is 'id', saving a lesson with an existing id will overwrite it (idempotent upsert).
 * @param {Object} lesson The lesson object to save.
 * @returns {Promise<Object>} The saved lesson object.
 */
export function saveLesson(lesson) {
  if (!lesson.id) {
    return Promise.reject(new Error('Lesson object must have a unique id field'));
  }
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const lessonToSave = {
        syncStatus: 'synced',
        lastUpdated: Date.now(),
        ...lesson
      };

      const request = store.put(lessonToSave);

      request.onsuccess = () => {
        resolve(lessonToSave);
      };

      request.onerror = (event) => {
        console.error(`Failed to save lesson with ID ${lesson.id}:`, event.target.error);
        reject(event.target.error);
      };
    });
  });
}

/**
 * Saves a list of lesson plans in bulk inside a single transaction.
 * Performs idempotent upserts by matching the primary key 'id' (AC 3).
 * @param {Array} lessonsArray The array of lesson objects to cache.
 * @returns {Promise<Array>} The cached array of lesson plans.
 */
export function saveLessonsBulk(lessonsArray) {
  if (!Array.isArray(lessonsArray)) {
    return Promise.reject(new Error('Input to saveLessonsBulk must be an array'));
  }
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => {
        resolve(lessonsArray);
      };

      transaction.onerror = (event) => {
        console.error('Bulk save transaction failed:', event.target.error);
        reject(event.target.error);
      };

      lessonsArray.forEach((lesson) => {
        if (!lesson.id) {
          console.warn('Skipping lesson due to missing ID:', lesson);
          return;
        }
        const lessonToSave = {
          syncStatus: 'synced',
          lastUpdated: Date.now(),
          ...lesson
        };
        store.put(lessonToSave); // put updates if key exists, inserts if not (AC 3)
      });
    });
  });
}

/**
 * Clears all cached lesson plans from local IndexedDB.
 * @returns {Promise<void>}
 */
export function clearLessons() {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Failed to clear lessons store:', event.target.error);
        reject(event.target.error);
      };
    });
  });
}
