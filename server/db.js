import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Initial mock students for the platform
const INITIAL_USERS = [
  {
    id: "user-1",
    email: "alex@university.edu",
    fullName: "Alex Rivera",
    major: "Computer Science",
    gradYear: "2026",
    bio: "Passionate about full-stack web development and cloud engineering. Looking to learn photography and design theory to improve my UI work.",
    avatar: "🎨",
    teachSkills: [
      { name: "React", level: "Expert" },
      { name: "Node.js", level: "Expert" },
      { name: "Python", level: "Intermediate" }
    ],
    learnSkills: [
      { name: "Photography", level: "Beginner" },
      { name: "Figma", level: "Beginner" }
    ],
    contactInfo: {
      discord: "alex_dev#1234",
      whatsapp: "+1-555-0192",
      email: "alex@university.edu"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "user-2",
    email: "emma@university.edu",
    fullName: "Emma Watson",
    major: "Design & Media",
    gradYear: "2027",
    bio: "UI/UX designer. I love creating beautiful, user-centered apps. Looking to learn React to bridge the gap between design and front-end coding.",
    avatar: "✨",
    teachSkills: [
      { name: "Figma", level: "Expert" },
      { name: "Graphic Design", level: "Expert" },
      { name: "UI/UX Design", level: "Expert" }
    ],
    learnSkills: [
      { name: "React", level: "Beginner" },
      { name: "Javascript", level: "Beginner" }
    ],
    contactInfo: {
      discord: "emma_pixels",
      whatsapp: "",
      email: "emma@university.edu"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "user-3",
    email: "chloe@university.edu",
    fullName: "Chloe Chen",
    major: "Finance & Economics",
    gradYear: "2027",
    bio: "Finance student and amateur photographer. Looking to learn Python and SQL to automate data analysis and build stock dashboards.",
    avatar: "📸",
    teachSkills: [
      { name: "Photography", level: "Expert" },
      { name: "Economics", level: "Expert" },
      { name: "Resume Writing", level: "Expert" }
    ],
    learnSkills: [
      { name: "Python", level: "Beginner" },
      { name: "SQL", level: "Beginner" }
    ],
    contactInfo: {
      discord: "",
      whatsapp: "+1-555-0143",
      email: "chloe@university.edu"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "user-4",
    email: "david@university.edu",
    fullName: "David Kim",
    major: "Mechanical Engineering",
    gradYear: "2028",
    bio: "Studying engineering. Learning Spanish for my study abroad semester in Madrid next year. Happy to teach math and programming.",
    avatar: "⚙️",
    teachSkills: [
      { name: "Python", level: "Expert" },
      { name: "C++", level: "Expert" },
      { name: "Linear Algebra", level: "Expert" }
    ],
    learnSkills: [
      { name: "Spanish", level: "Beginner" },
      { name: "Public Speaking", level: "Intermediate" }
    ],
    contactInfo: {
      discord: "david_k_eng",
      whatsapp: "+1-555-0155",
      email: "david@university.edu"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "user-5",
    email: "sofia@university.edu",
    fullName: "Sofia Martinez",
    major: "Modern Languages",
    gradYear: "2026",
    bio: "Native Spanish speaker. Love traveling and meeting new people. I want to learn web development basics to publish my bilingual travel blog.",
    avatar: "🌍",
    teachSkills: [
      { name: "Spanish", level: "Expert" },
      { name: "Public Speaking", level: "Expert" }
    ],
    learnSkills: [
      { name: "HTML/CSS", level: "Beginner" },
      { name: "Javascript", level: "Beginner" }
    ],
    contactInfo: {
      discord: "sofia_travels",
      whatsapp: "+1-555-0187",
      email: "sofia@university.edu"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "user-6",
    email: "marcus@university.edu",
    fullName: "Marcus Johnson",
    major: "Film & Television",
    gradYear: "2028",
    bio: "Video editor and filmmaker. Happy to teach Adobe Premiere, Photoshop, and video production. Looking to learn Spanish and basic coding.",
    avatar: "🎬",
    teachSkills: [
      { name: "Adobe Premiere", level: "Expert" },
      { name: "Video Editing", level: "Expert" },
      { name: "Photoshop", level: "Intermediate" }
    ],
    learnSkills: [
      { name: "Spanish", level: "Beginner" },
      { name: "Python", level: "Beginner" }
    ],
    contactInfo: {
      discord: "marcus_cuts",
      whatsapp: "",
      email: "marcus@university.edu"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "user-7",
    email: "sarah@university.edu",
    fullName: "Sarah Jenkins",
    major: "Data Science",
    gradYear: "2027",
    bio: "Statistics and ML enthusiast. Want to learn UI/UX design to make my dashboard tools look clean, intuitive, and highly professional.",
    avatar: "📊",
    teachSkills: [
      { name: "SQL", level: "Expert" },
      { name: "Statistics", level: "Expert" },
      { name: "Python", level: "Expert" }
    ],
    learnSkills: [
      { name: "UI/UX Design", level: "Beginner" },
      { name: "Figma", level: "Beginner" }
    ],
    contactInfo: {
      discord: "sarah_data",
      whatsapp: "",
      email: "sarah@university.edu"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "user-8",
    email: "ryan@university.edu",
    fullName: "Ryan Patel",
    major: "Mechanical Engineering",
    gradYear: "2026",
    bio: "CAD design expert. Looking to practice public speaking and resume writing for upcoming campus job fairs.",
    avatar: "🛠️",
    teachSkills: [
      { name: "3D Modeling", level: "Expert" },
      { name: "Calculus", level: "Expert" }
    ],
    learnSkills: [
      { name: "Public Speaking", level: "Beginner" },
      { name: "Resume Writing", level: "Intermediate" }
    ],
    contactInfo: {
      discord: "ryan_patel_eng",
      whatsapp: "+1-555-0101",
      email: "ryan@university.edu"
    },
    createdAt: new Date().toISOString()
  }
];

// Seed arrays for Expert Mentorship features
const INITIAL_REVIEWS = [
  {
    id: "review-1",
    reviewerId: "user-3", // Chloe Chen
    mentorId: "user-1", // Alex Rivera
    rating: 5,
    feedback: "Alex explained React component hooks perfectly. He is very patient and knowledgeable!",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "review-2",
    reviewerId: "user-5", // Sofia Martinez
    mentorId: "user-1", // Alex Rivera
    rating: 4,
    feedback: "Great sessions on Node.js backend. Really helped me structure my travel blog server.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "review-3",
    reviewerId: "user-1", // Alex Rivera
    mentorId: "user-2", // Emma Watson
    rating: 5,
    feedback: "Emma's Figma workshop was awesome! The auto-layout design tips saved me so much time.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_SESSIONS = [
  {
    id: "session-1",
    mentorId: "user-2", // Emma Watson
    title: "Intro to Figma Auto-Layout & Design Systems",
    description: "Learn how to build responsive UI components, buttons, grids, and typography structures in Figma.",
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    maxAttendees: 6,
    sessionType: "WORKSHOP"
  },
  {
    id: "session-2",
    mentorId: "user-1", // Alex Rivera
    title: "1-on-1 Office Hours: React State & Custom Hooks",
    description: "Bring your React questions! We can debug state management issues, contexts, or custom hooks together.",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
    maxAttendees: 1,
    sessionType: "1_ON_1"
  },
  {
    id: "session-3",
    mentorId: "user-7", // Sarah Jenkins
    title: "SQL Joins and Subqueries Crash Course",
    description: "Master complex SQL joins, nested subqueries, and grouping logic. Perfect for data analysts.",
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
    maxAttendees: 15,
    sessionType: "WORKSHOP"
  }
];

const INITIAL_BOOKINGS = [
  {
    id: "booking-1",
    sessionId: "session-1",
    studentId: "user-3",
    bookedAt: new Date().toISOString()
  },
  {
    id: "booking-2",
    sessionId: "session-1",
    studentId: "user-4",
    bookedAt: new Date().toISOString()
  }
];

// Helper to write file atomically
function writeFileAtomic(filePath, data) {
  const tempPath = filePath + '.tmp';
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

class Database {
  constructor() {
    this.init();
  }

  init() {
    // Initialize local database files
    if (!fs.existsSync(SKILLS_FILE)) {
      writeFileAtomic(SKILLS_FILE, INITIAL_SKILLS);
    }
    
    // Seed/update users.json
    if (!fs.existsSync(USERS_FILE)) {
      // Ensure initial users arrays have isExpert flags
      INITIAL_USERS.forEach(u => {
        if (['user-1', 'user-2', 'user-7'].includes(u.id)) {
          u.isExpert = true;
        } else {
          u.isExpert = false;
        }
      });
      writeFileAtomic(USERS_FILE, INITIAL_USERS);
    } else {
      // Load and make sure isExpert is set on initial profiles
      try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        let changed = false;
        users.forEach(u => {
          if (['user-1', 'user-2', 'user-7'].includes(u.id)) {
            if (!u.isExpert) {
              u.isExpert = true;
              changed = true;
            }
          } else {
            if (u.isExpert === undefined) {
              u.isExpert = false;
              changed = true;
            }
          }
        });
        if (changed) {
          writeFileAtomic(USERS_FILE, users);
        }
      } catch (err) {
        console.error("Error updating users with isExpert flags in init:", err);
      }
    }

    if (!fs.existsSync(SWAPS_FILE)) {
      writeFileAtomic(SWAPS_FILE, []);
    }

    if (!fs.existsSync(REVIEWS_FILE)) {
      writeFileAtomic(REVIEWS_FILE, INITIAL_REVIEWS);
    }

    if (!fs.existsSync(SESSIONS_FILE)) {
      writeFileAtomic(SESSIONS_FILE, INITIAL_SESSIONS);
    }

    if (!fs.existsSync(BOOKINGS_FILE)) {
      writeFileAtomic(BOOKINGS_FILE, INITIAL_BOOKINGS);
    }

    // Seed Firestore asynchronously in the background if connected
    if (isFirebaseConnected) {
      this.initFirestore().catch(err => console.error('Failed to init Firestore:', err));
    }
  }

  async initFirestore() {
    try {
      const snapshot = await firestoreDb.collection('skills').limit(1).get();
      if (snapshot.empty) {
        console.log('Seeding initial skills & users to Firebase Firestore...');
        const batch = firestoreDb.batch();
        
        // Seed Skills
        for (const skill of INITIAL_SKILLS) {
          const ref = firestoreDb.collection('skills').doc(skill.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
          batch.set(ref, { name: skill });
        }
        
        // Seed Users
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
      if (!fs.existsSync(SKILLS_FILE)) {
        writeFileAtomic(SKILLS_FILE, INITIAL_SKILLS);
      }
      const data = fs.readFileSync(SKILLS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading skills from local file:", err);
      return INITIAL_SKILLS;
    }
  }

  async saveCustomSkill(skillName) {
    const skills = await this.getSkills();
    // Case insensitive duplicate check
    if (skills.some(s => s.toLowerCase() === skillName.toLowerCase())) {
      return skills;
    }
    
    // Add new skill
    skills.push(skillName);
    
    if (isFirebaseConnected) {
      try {
        await firestoreDb.collection('skills').doc(skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).set({ name: skillName });
      } catch (err) {
        console.error(`Error saving skill ${skillName} to Firestore:`, err);
      }
    }

    writeFileAtomic(SKILLS_FILE, skills);
    return skills;
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
      if (!fs.existsSync(USERS_FILE)) {
        writeFileAtomic(USERS_FILE, INITIAL_USERS);
      }
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading users from local file:", err);
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

    const users = await this.getUsers();
    return users.find(u => u.id === id);
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

    const users = await this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
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

    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);

    if (index !== -1) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }

    writeFileAtomic(USERS_FILE, users);
    return user;
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

    const users = await this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    writeFileAtomic(USERS_FILE, filtered);
    return true;
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
      if (!fs.existsSync(SWAPS_FILE)) {
        writeFileAtomic(SWAPS_FILE, []);
      }
      const data = fs.readFileSync(SWAPS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading swap requests from local file:", err);
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

    const requests = await this.getSwapRequests();
    const index = requests.findIndex(r => r.id === requestId);

    if (index !== -1) {
      requests[index] = { ...requests[index], ...newRequest };
    } else {
      requests.push(newRequest);
    }

    writeFileAtomic(SWAPS_FILE, requests);
    return newRequest;
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

    const requests = await this.getSwapRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Swap request ${id} not found`);
    }
    requests[index].status = status;
    requests[index].updatedAt = new Date().toISOString();
    writeFileAtomic(SWAPS_FILE, requests);
    return requests[index];
  }

  // --- REVIEWS & RATINGS METHODS ---
  async getReviews() {
    try {
      if (!fs.existsSync(REVIEWS_FILE)) {
        writeFileAtomic(REVIEWS_FILE, INITIAL_REVIEWS);
      }
      const data = fs.readFileSync(REVIEWS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading reviews from local file:", err);
      return [];
    }
  }

  async saveReview(review) {
    const reviews = await this.getReviews();
    
    // Check constraint: unique reviewer-mentor pair
    const duplicate = reviews.find(r => r.reviewerId === review.reviewerId && r.mentorId === review.mentorId);
    if (duplicate) {
      throw new Error("You have already reviewed this mentor.");
    }

    const reviewId = 'review-' + Math.floor(1000 + Math.random() * 9000);
    const newReview = {
      id: reviewId,
      createdAt: new Date().toISOString(),
      ...review
    };

    reviews.push(newReview);
    writeFileAtomic(REVIEWS_FILE, reviews);
    return newReview;
  }

  // --- MENTOR SESSIONS METHODS ---
  async getSessions() {
    try {
      if (!fs.existsSync(SESSIONS_FILE)) {
        writeFileAtomic(SESSIONS_FILE, INITIAL_SESSIONS);
      }
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading sessions from local file:", err);
      return [];
    }
  }

  async saveSession(session) {
    const sessions = await this.getSessions();
    const sessionId = session.id || 'session-' + Math.floor(1000 + Math.random() * 9000);
    const newSession = {
      id: sessionId,
      ...session
    };

    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index] = newSession;
    } else {
      sessions.push(newSession);
    }

    writeFileAtomic(SESSIONS_FILE, sessions);
    return newSession;
  }

  async deleteSession(id) {
    const sessions = await this.getSessions();
    const filtered = sessions.filter(s => s.id !== id);
    writeFileAtomic(SESSIONS_FILE, filtered);
    
    // Clean up bookings for this session as well
    const bookings = await this.getSessionBookings();
    const remainingBookings = bookings.filter(b => b.sessionId !== id);
    writeFileAtomic(BOOKINGS_FILE, remainingBookings);
    return true;
  }

  // --- SESSION BOOKINGS (RSVPs) ---
  async getSessionBookings() {
    try {
      if (!fs.existsSync(BOOKINGS_FILE)) {
        writeFileAtomic(BOOKINGS_FILE, INITIAL_BOOKINGS);
      }
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading bookings from local file:", err);
      return [];
    }
  }

  async saveSessionBooking(booking) {
    const bookings = await this.getSessionBookings();
    
    // Check if student already booked this session
    const duplicate = bookings.find(b => b.sessionId === booking.sessionId && b.studentId === booking.studentId);
    if (duplicate) {
      return duplicate;
    }

    const bookingId = 'booking-' + Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id: bookingId,
      bookedAt: new Date().toISOString(),
      ...booking
    };

    bookings.push(newBooking);
    writeFileAtomic(BOOKINGS_FILE, bookings);
    return newBooking;
  }

  async deleteSessionBooking(id) {
    const bookings = await this.getSessionBookings();
    const filtered = bookings.filter(b => b.id !== id);
    writeFileAtomic(BOOKINGS_FILE, filtered);
    return true;
  }

  async deleteSessionBookingByUserAndSession(userId, sessionId) {
    const bookings = await this.getSessionBookings();
    const filtered = bookings.filter(b => !(b.studentId === userId && b.sessionId === sessionId));
    writeFileAtomic(BOOKINGS_FILE, filtered);
    return true;
  }
}

export default new Database();
