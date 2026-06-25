import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
// NOTE: sqlite3 and sqlite are NOT statically imported here.
// They are loaded dynamically inside init() only when Firebase is not available.
// This prevents the native sqlite3 binary from crashing on environments
// that have an incompatible glibc version (e.g. Render's Linux runtime).
import { firestoreDb, isFirebaseConnected } from './firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SKILLS_FILE = path.join(DATA_DIR, 'skills_taxonomy.json');
const SWAPS_FILE = path.join(DATA_DIR, 'swap_requests.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'session_bookings.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial predefined skills taxonomy
const INITIAL_SKILLS = [
  // Tech
  "Python", "Javascript", "React", "Node.js", "HTML/CSS", "SQL", "Git", "Java", "C++", "3D Modeling",
  // Creative
  "Figma", "Adobe Premiere", "Photoshop", "Photography", "Video Editing", "UI/UX Design", "Graphic Design", "Music Production",
  // Academic
  "Calculus", "Linear Algebra", "Physics", "Chemistry", "Economics", "Statistics", "Spanish", "French", "Japanese",
  // Professional
  "Public Speaking", "Resume Writing", "Interview Prep", "Technical Writing", "Product Management"
];

const INITIAL_USERS = [];

class Database {
  constructor() {
    this.sqliteDb = null;
    this.initPromise = this.init();
  }

  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async init() {
    // If not using Firebase, initialize SQLite via dynamic import
    // (avoids loading the native binary on environments where it's incompatible)
    if (!isFirebaseConnected) {
      try {
        const sqlite3Mod = await import('sqlite3');
        const { open } = await import('sqlite');
        const sqlite3 = sqlite3Mod.default;

        this.sqliteDb = await open({
          filename: path.join(DATA_DIR, 'database.sqlite'),
          driver: sqlite3.Database
        });

        // Initialize SQLite Tables
        await this.sqliteDb.exec(`
          CREATE TABLE IF NOT EXISTS skills (
            name TEXT PRIMARY KEY
          );
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            data TEXT
          );
          CREATE TABLE IF NOT EXISTS swap_requests (
            id TEXT PRIMARY KEY,
            data TEXT
          );
          CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            reviewerId TEXT,
            mentorId TEXT,
            data TEXT
          );
          CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            data TEXT
          );
          CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            sessionId TEXT,
            studentId TEXT,
            data TEXT
          );
          CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            senderId TEXT,
            receiverId TEXT,
            data TEXT
          );
        `);

        // Migration logic from JSON files
        await this.migrateSkills();
        await this.migrateJsonData();

        console.log('Successfully initialized SQLite database!');
      } catch (err) {
        console.error('Failed to initialize SQLite database:', err);
      }
    }

    // Seed Firestore asynchronously in the background if connected
    if (isFirebaseConnected) {
      this.initFirestore().catch(err => console.error('Failed to init Firestore:', err));
    }
  }

  async migrateSkills() {
    try {
      if (fs.existsSync(SKILLS_FILE)) {
        const skillsData = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf8'));
        if (Array.isArray(skillsData) && skillsData.length > 0) {
          console.log(`Migrating ${skillsData.length} skills from JSON to SQLite...`);
          const stmt = await this.sqliteDb.prepare('INSERT OR IGNORE INTO skills (name) VALUES (?)');
          for (const skill of skillsData) {
            await stmt.run(skill);
          }
          await stmt.finalize();
          fs.renameSync(SKILLS_FILE, SKILLS_FILE + '.bak');
        }
      }

      // Check if skills table is empty, seed defaults
      const count = await this.sqliteDb.get('SELECT COUNT(*) as count FROM skills');
      if (count.count === 0) {
        const stmt = await this.sqliteDb.prepare('INSERT OR IGNORE INTO skills (name) VALUES (?)');
        for (const skill of INITIAL_SKILLS) {
          await stmt.run(skill);
        }
        await stmt.finalize();
      }
    } catch (err) {
      console.error('Failed to migrate/seed skills in SQLite:', err);
    }
  }

  async migrateJsonData() {
    const migrate = async (filePath, insertFn) => {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (!content.trim() || content.trim() === '[]') {
            fs.renameSync(filePath, filePath + '.bak');
            return;
          }
          const list = JSON.parse(content);
          if (Array.isArray(list) && list.length > 0) {
            console.log(`Migrating ${list.length} records from ${path.basename(filePath)} to SQLite...`);
            for (const item of list) {
              await insertFn(item);
            }
            fs.renameSync(filePath, filePath + '.bak');
          }
        } catch (err) {
          console.error(`Failed to migrate ${path.basename(filePath)}:`, err);
        }
      }
    };

    await migrate(USERS_FILE, async (user) => {
      await this.sqliteDb.run(
        'INSERT OR IGNORE INTO users (id, email, data) VALUES (?, ?, ?)',
        [user.id, user.email?.toLowerCase(), JSON.stringify(user)]
      );
    });

    await migrate(SWAPS_FILE, async (req) => {
      await this.sqliteDb.run(
        'INSERT OR IGNORE INTO swap_requests (id, data) VALUES (?, ?)',
        [req.id, JSON.stringify(req)]
      );
    });

    await migrate(REVIEWS_FILE, async (rev) => {
      await this.sqliteDb.run(
        'INSERT OR IGNORE INTO reviews (id, reviewerId, mentorId, data) VALUES (?, ?, ?, ?)',
        [rev.id, rev.reviewerId, rev.mentorId, JSON.stringify(rev)]
      );
    });

    await migrate(SESSIONS_FILE, async (sess) => {
      await this.sqliteDb.run(
        'INSERT OR IGNORE INTO sessions (id, data) VALUES (?, ?)',
        [sess.id, JSON.stringify(sess)]
      );
    });

    await migrate(BOOKINGS_FILE, async (book) => {
      await this.sqliteDb.run(
        'INSERT OR IGNORE INTO bookings (id, sessionId, studentId, data) VALUES (?, ?, ?, ?)',
        [book.id, book.sessionId, book.studentId, JSON.stringify(book)]
      );
    });

    await migrate(MESSAGES_FILE, async (msg) => {
      await this.sqliteDb.run(
        'INSERT OR IGNORE INTO messages (id, senderId, receiverId, data) VALUES (?, ?, ?, ?)',
        [msg.id, msg.senderId, msg.receiverId, JSON.stringify(msg)]
      );
    });
  }

  async getDb() {
    await this.initPromise;
    return this.sqliteDb;
  }

  async initFirestore() {
    try {
      const snapshot = await firestoreDb.collection('skills').limit(1).get();
      if (snapshot.empty) {
        console.log('Seeding initial skills & users to Firebase Firestore...');
        const batch = firestoreDb.batch();
        
        for (const skill of INITIAL_SKILLS) {
          const ref = firestoreDb.collection('skills').doc(skill.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
          batch.set(ref, { name: skill });
        }
        
        for (const user of INITIAL_USERS) {
          const ref = firestoreDb.collection('users').doc(user.id);
          batch.set(ref, user);
        }
        
        await batch.commit();
        console.log('Firestore skillswap database seeded successfully!');
      }
    } catch (err) {
      console.error('Error seeding Firestore:', err);
    }
  }

  // --- SKILLS taxonomy ---
  async getSkills() {
    if (isFirebaseConnected) {
      try {
        const snapshot = await firestoreDb.collection('skills').get();
        const list = [];
        snapshot.forEach(doc => list.push(doc.data().name));
        return list.length ? list : INITIAL_SKILLS;
      } catch (err) {
        console.error("Error reading skills from Firestore:", err);
      }
    }

    try {
      const db = await this.getDb();
      const rows = await db.all('SELECT name FROM skills');
      return rows.map(r => r.name);
    } catch (err) {
      console.error("Error reading skills from SQLite:", err);
      return INITIAL_SKILLS;
    }
  }

  async saveCustomSkill(skillName) {
    const skills = await this.getSkills();
    if (skills.some(s => s.toLowerCase() === skillName.toLowerCase())) {
      return skills;
    }
    
    if (isFirebaseConnected) {
      try {
        await firestoreDb.collection('skills').doc(skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).set({ name: skillName });
      } catch (err) {
        console.error(`Error saving skill ${skillName} to Firestore:`, err);
      }
    } else {
      try {
        const db = await this.getDb();
        await db.run('INSERT INTO skills (name) VALUES (?)', [skillName]);
      } catch (err) {
        console.error(`Error saving skill ${skillName} to SQLite:`, err);
      }
    }

    return this.getSkills();
  }

  // --- USERS CRUD ---
  async getUsers() {
    if (isFirebaseConnected) {
      try {
        const snapshot = await firestoreDb.collection('users').get();
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        return list;
      } catch (err) {
        console.error("Error reading users from Firestore:", err);
      }
    }

    try {
      const db = await this.getDb();
      const rows = await db.all('SELECT data FROM users');
      return rows.map(r => JSON.parse(r.data));
    } catch (err) {
      console.error("Error reading users from SQLite:", err);
      return [];
    }
  }

  async getUserById(id) {
    if (isFirebaseConnected) {
      try {
        const doc = await firestoreDb.collection('users').doc(id).get();
        return doc.exists ? doc.data() : null;
      } catch (err) {
        console.error(`Error reading user ${id} from Firestore:`, err);
      }
    }

    try {
      const db = await this.getDb();
      const row = await db.get('SELECT data FROM users WHERE id = ?', [id]);
      return row ? JSON.parse(row.data) : null;
    } catch (err) {
      console.error(`Error reading user ${id} from SQLite:`, err);
      return null;
    }
  }

  async getUserByEmail(email) {
    if (isFirebaseConnected) {
      try {
        const snapshot = await firestoreDb.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
        if (!snapshot.empty) {
          return snapshot.docs[0].data();
        }
        return null;
      } catch (err) {
        console.error(`Error querying user ${email} from Firestore:`, err);
      }
    }

    try {
      const db = await this.getDb();
      const row = await db.get('SELECT data FROM users WHERE email = ?', [email.toLowerCase()]);
      return row ? JSON.parse(row.data) : null;
    } catch (err) {
      console.error(`Error reading user ${email} from SQLite:`, err);
      return null;
    }
  }

  async saveUser(user) {
    if (!user.id) {
      user.id = 'user-' + Math.floor(1000 + Math.random() * 9000);
    }
    user.email = user.email.toLowerCase();
    
    if (isFirebaseConnected) {
      try {
        await firestoreDb.collection('users').doc(user.id).set(user, { merge: true });
        return user;
      } catch (err) {
        console.error(`Error saving user ${user.id} to Firestore:`, err);
      }
    }

    try {
      const db = await this.getDb();
      const dataStr = JSON.stringify(user);
      await db.run(
        `INSERT INTO users (id, email, data) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET email = excluded.email, data = excluded.data`,
        [user.id, user.email, dataStr]
      );
      return user;
    } catch (err) {
      console.error(`Error saving user ${user.id} to SQLite:`, err);
      return user;
    }
  }

  async deleteUser(id) {
    if (isFirebaseConnected) {
      try {
        await firestoreDb.collection('users').doc(id).delete();
        return true;
      } catch (err) {
        console.error(`Error deleting user ${id} from Firestore:`, err);
      }
    }

    try {
      const db = await this.getDb();
      await db.run('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } catch (err) {
      console.error(`Error deleting user ${id} from SQLite:`, err);
      return false;
    }
  }

  // --- SWAP REQUESTS WORKFLOW ---
  async getSwapRequests() {
    if (isFirebaseConnected) {
      try {
        const snapshot = await firestoreDb.collection('swap_requests').orderBy('createdAt', 'desc').get();
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        return list;
      } catch (err) {
        console.error("Error reading swap requests from Firestore:", err);
      }
    }

    try {
      const db = await this.getDb();
      const rows = await db.all('SELECT data FROM swap_requests');
      const list = rows.map(r => JSON.parse(r.data));
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error("Error reading swap requests from SQLite:", err);
      return [];
    }
  }

  async saveSwapRequest(request) {
    const requestId = request.id || 'swap-' + Math.floor(1000 + Math.random() * 9000);
    const newRequest = {
      id: requestId,
      status: request.status || 'PENDING',
      message: request.message || '',
      createdAt: request.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...request
    };

    if (isFirebaseConnected) {
      try {
        await firestoreDb.collection('swap_requests').doc(requestId).set(newRequest, { merge: true });
        return newRequest;
      } catch (err) {
        console.error("Error saving swap request to Firestore:", err);
      }
    }

    try {
      const db = await this.getDb();
      await db.run(
        `INSERT INTO swap_requests (id, data) VALUES (?, ?)
         ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
        [requestId, JSON.stringify(newRequest)]
      );
      return newRequest;
    } catch (err) {
      console.error("Error saving swap request to SQLite:", err);
      return newRequest;
    }
  }

  async updateSwapRequestStatus(id, status) {
    if (isFirebaseConnected) {
      try {
        const ref = firestoreDb.collection('swap_requests').doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
          throw new Error(`Swap request ${id} not found`);
        }
        await ref.update({ status, updatedAt: new Date().toISOString() });
        return { ...doc.data(), status, updatedAt: new Date().toISOString() };
      } catch (err) {
        console.error(`Error updating swap request ${id} in Firestore:`, err);
      }
    }

    try {
      const db = await this.getDb();
      const row = await db.get('SELECT data FROM swap_requests WHERE id = ?', [id]);
      if (!row) {
        throw new Error(`Swap request ${id} not found`);
      }
      const request = JSON.parse(row.data);
      request.status = status;
      request.updatedAt = new Date().toISOString();
      await db.run('UPDATE swap_requests SET data = ? WHERE id = ?', [JSON.stringify(request), id]);
      return request;
    } catch (err) {
      console.error(`Error updating swap request ${id} in SQLite:`, err);
      throw err;
    }
  }

  // --- REVIEWS & RATINGS METHODS ---
  async getReviews() {
    if (isFirebaseConnected) {
      try {
        const snapshot = await firestoreDb.collection('reviews').get();
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        return list;
      } catch (err) {
        console.error('Error reading reviews from Firestore:', err);
        return [];
      }
    }
    try {
      const db = await this.getDb();
      const rows = await db.all('SELECT data FROM reviews');
      return rows.map(r => JSON.parse(r.data));
    } catch (err) {
      console.error('Error reading reviews from SQLite:', err);
      return [];
    }
  }

  async saveReview(review) {
    const reviewId = 'review-' + Math.floor(1000 + Math.random() * 9000);
    const newReview = { id: reviewId, createdAt: new Date().toISOString(), ...review };

    if (isFirebaseConnected) {
      try {
        const existing = await firestoreDb.collection('reviews')
          .where('reviewerId', '==', review.reviewerId)
          .where('mentorId', '==', review.mentorId).limit(1).get();
        if (!existing.empty) throw new Error('You have already reviewed this mentor.');
        await firestoreDb.collection('reviews').doc(reviewId).set(newReview);
        return newReview;
      } catch (err) {
        console.error('Error saving review to Firestore:', err);
        throw err;
      }
    }
    try {
      const db = await this.getDb();
      const row = await db.get('SELECT id FROM reviews WHERE reviewerId = ? AND mentorId = ?', [review.reviewerId, review.mentorId]);
      if (row) throw new Error('You have already reviewed this mentor.');
      await db.run('INSERT INTO reviews (id, reviewerId, mentorId, data) VALUES (?, ?, ?, ?)', [reviewId, review.reviewerId, review.mentorId, JSON.stringify(newReview)]);
      return newReview;
    } catch (err) {
      console.error('Error saving review in SQLite:', err);
      throw err;
    }
  }

  // --- MENTOR SESSIONS METHODS ---
  async getSessions() {
    if (isFirebaseConnected) {
      try {
        const snapshot = await firestoreDb.collection('sessions').get();
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        return list;
      } catch (err) {
        console.error('Error reading sessions from Firestore:', err);
        return [];
      }
    }
    try {
      const db = await this.getDb();
      const rows = await db.all('SELECT data FROM sessions');
      return rows.map(r => JSON.parse(r.data));
    } catch (err) {
      console.error('Error reading sessions from SQLite:', err);
      return [];
    }
  }

  async saveSession(session) {
    const sessionId = session.id || 'session-' + Math.floor(1000 + Math.random() * 9000);
    const newSession = { id: sessionId, ...session };

    if (isFirebaseConnected) {
      try {
        await firestoreDb.collection('sessions').doc(sessionId).set(newSession, { merge: true });
        return newSession;
      } catch (err) {
        console.error('Error saving session to Firestore:', err);
        return session;
      }
    }
    try {
      const db = await this.getDb();
      await db.run(`INSERT INTO sessions (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`, [sessionId, JSON.stringify(newSession)]);
      return newSession;
    } catch (err) {
      console.error('Error saving session in SQLite:', err);
      return session;
    }
  }

  async deleteSession(id) {
    if (isFirebaseConnected) {
      try {
        await firestoreDb.collection('sessions').doc(id).delete();
        const bookingsSnap = await firestoreDb.collection('bookings').where('sessionId', '==', id).get();
        const batch = firestoreDb.batch();
        bookingsSnap.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return true;
      } catch (err) {
        console.error(`Error deleting session ${id} from Firestore:`, err);
        return false;
      }
    }
    try {
      const db = await this.getDb();
      await db.run('DELETE FROM sessions WHERE id = ?', [id]);
      await db.run('DELETE FROM bookings WHERE sessionId = ?', [id]);
      return true;
    } catch (err) {
      console.error(`Error deleting session ${id} in SQLite:`, err);
      return false;
    }
  }

  // --- SESSION BOOKINGS (RSVPs) ---
  async getSessionBookings() {
    if (isFirebaseConnected) {
      try {
        const snapshot = await firestoreDb.collection('bookings').get();
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        return list;
      } catch (err) {
        console.error('Error reading bookings from Firestore:', err);
        return [];
      }
    }
    try {
      const db = await this.getDb();
      const rows = await db.all('SELECT data FROM bookings');
      return rows.map(r => JSON.parse(r.data));
    } catch (err) {
      console.error('Error reading bookings from SQLite:', err);
      return [];
    }
  }

  async saveSessionBooking(booking) {
    if (isFirebaseConnected) {
      try {
        const existing = await firestoreDb.collection('bookings')
          .where('sessionId', '==', booking.sessionId)
          .where('studentId', '==', booking.studentId).limit(1).get();
        if (!existing.empty) return existing.docs[0].data();
        const bookingId = 'booking-' + Math.floor(1000 + Math.random() * 9000);
        const newBooking = { id: bookingId, bookedAt: new Date().toISOString(), ...booking };
        await firestoreDb.collection('bookings').doc(bookingId).set(newBooking);
        return newBooking;
      } catch (err) {
        console.error('Error saving session booking to Firestore:', err);
        return booking;
      }
    }
    try {
      const db = await this.getDb();
      const row = await db.get('SELECT data FROM bookings WHERE sessionId = ? AND studentId = ?', [booking.sessionId, booking.studentId]);
      if (row) return JSON.parse(row.data);
      const bookingId = 'booking-' + Math.floor(1000 + Math.random() * 9000);
      const newBooking = { id: bookingId, bookedAt: new Date().toISOString(), ...booking };
      await db.run('INSERT INTO bookings (id, sessionId, studentId, data) VALUES (?, ?, ?, ?)', [bookingId, booking.sessionId, booking.studentId, JSON.stringify(newBooking)]);
      return newBooking;
    } catch (err) {
      console.error('Error saving session booking in SQLite:', err);
      return booking;
    }
  }

  async deleteSessionBooking(id) {
    if (isFirebaseConnected) {
      try {
        await firestoreDb.collection('bookings').doc(id).delete();
        return true;
      } catch (err) {
        console.error(`Error deleting booking ${id} from Firestore:`, err);
        return false;
      }
    }
    try {
      const db = await this.getDb();
      await db.run('DELETE FROM bookings WHERE id = ?', [id]);
      return true;
    } catch (err) {
      console.error(`Error deleting session booking ${id} in SQLite:`, err);
      return false;
    }
  }

  async deleteSessionBookingByUserAndSession(userId, sessionId) {
    if (isFirebaseConnected) {
      try {
        const snapshot = await firestoreDb.collection('bookings')
          .where('studentId', '==', userId)
          .where('sessionId', '==', sessionId).get();
        const batch = firestoreDb.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return true;
      } catch (err) {
        console.error(`Error deleting booking for user ${userId} from Firestore:`, err);
        return false;
      }
    }
    try {
      const db = await this.getDb();
      await db.run('DELETE FROM bookings WHERE studentId = ? AND sessionId = ?', [userId, sessionId]);
      return true;
    } catch (err) {
      console.error(`Error deleting booking for user ${userId} in SQLite:`, err);
      return false;
    }
  }

  // --- MESSAGES ---
  async getAllMessages() {
    if (isFirebaseConnected) {
      try {
        const snapshot = await firestoreDb.collection('messages').get();
        const list = [];
        snapshot.forEach(doc => list.push(doc.data()));
        return list;
      } catch (err) {
        console.error('Error reading all messages from Firestore:', err);
        return [];
      }
    }
    try {
      const db = await this.getDb();
      const rows = await db.all('SELECT data FROM messages');
      return rows.map(r => JSON.parse(r.data));
    } catch (err) {
      console.error('Error reading all messages from SQLite:', err);
      return [];
    }
  }

  async getMessagesForUser(userId) {
    if (isFirebaseConnected) {
      try {
        const [sentSnap, recvSnap] = await Promise.all([
          firestoreDb.collection('messages').where('senderId', '==', userId).get(),
          firestoreDb.collection('messages').where('receiverId', '==', userId).get()
        ]);
        const msgs = {};
        sentSnap.forEach(doc => { msgs[doc.id] = doc.data(); });
        recvSnap.forEach(doc => { msgs[doc.id] = doc.data(); });
        return Object.values(msgs).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      } catch (err) {
        console.error(`Error reading messages for user ${userId} from Firestore:`, err);
        return [];
      }
    }
    try {
      const db = await this.getDb();
      const rows = await db.all('SELECT data FROM messages WHERE senderId = ? OR receiverId = ?', [userId, userId]);
      return rows.map(r => JSON.parse(r.data));
    } catch (err) {
      console.error(`Error reading messages for user ${userId} from SQLite:`, err);
      return [];
    }
  }

  async saveMessage(msg) {
    const messageId = 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const newMessage = { id: messageId, timestamp: new Date().toISOString(), read: false, ...msg };

    if (isFirebaseConnected) {
      try {
        await firestoreDb.collection('messages').doc(messageId).set(newMessage);
        return newMessage;
      } catch (err) {
        console.error('Error saving message to Firestore:', err);
        return msg;
      }
    }
    try {
      const db = await this.getDb();
      await db.run('INSERT INTO messages (id, senderId, receiverId, data) VALUES (?, ?, ?, ?)', [messageId, msg.senderId, msg.receiverId, JSON.stringify(newMessage)]);
      return newMessage;
    } catch (err) {
      console.error('Error saving message in SQLite:', err);
      return msg;
    }
  }
}

export default new Database();
