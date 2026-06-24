/* global process */
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';
import db from './db.js';
import { generateLearningPath } from './services/aiService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Setup public directories if needed (for avatars/uploads)
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: check if email is an allowed domain (.edu or gmail.com)
const isValidEduEmail = (email) => {
  if (!email) return false;
  const lower = email.toLowerCase();
  return lower.endsWith('.edu') || lower.endsWith('@gmail.com');
};

// --- AUTHENTICATION ROUTES ---

// Register student
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, fullName, major, gradYear, bio, avatar, teachSkills, learnSkills, contactInfo, password, isGoogle } = req.body;

    if (!email || !fullName || !major || !gradYear) {
      return res.status(400).json({ success: false, message: 'Missing required onboarding profile fields' });
    }

    if (!isValidEduEmail(email)) {
      return res.status(400).json({ success: false, message: 'Only institutional .edu email addresses are permitted.' });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    let passwordHash = '';
    if (!isGoogle) {
      if (!password || password.trim().length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }
      passwordHash = db.hashPassword(password.trim());
    } else {
      passwordHash = db.hashPassword('google-auth-bypass-pass-' + Math.random());
    }

    const newUser = {
      email: email.toLowerCase(),
      fullName,
      major,
      gradYear,
      bio: bio || '',
      avatar: avatar || '🎓',
      teachSkills: teachSkills || [],
      learnSkills: learnSkills || [],
      contactInfo: contactInfo || { discord: '', whatsapp: '', email: email.toLowerCase() },
      passwordHash,
      createdAt: new Date().toISOString()
    };

    const savedUser = await db.saveUser(newUser);
    res.status(201).json({ success: true, user: savedUser, token: 'mock-jwt-' + savedUser.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// Login student (email-only — no password required for sign in)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    if (!isValidEduEmail(email)) {
      return res.status(400).json({ success: false, message: 'Only institutional .edu email addresses are permitted.' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No student profile found with this email. Please sign up first.' });
    }

    res.json({ success: true, user, token: 'mock-jwt-' + user.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Google Sign-In / OAuth
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required.' });
    }

    // Verify the ID token using google-auth-library
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const googleUser = ticket.getPayload();
    const { email, name: fullName, picture: avatar } = googleUser;

    const user = await db.getUserByEmail(email);
    if (user) {
      // User already exists, log them in instantly
      res.json({ success: true, isNew: false, user, token: 'mock-jwt-' + user.id });
    } else {
      // User does not exist, return isNew: true so client can proceed with onboarding
      const newUserDraft = {
        email: email.toLowerCase(),
        fullName: fullName || 'Google Learner',
        major: '',
        gradYear: '2027',
        bio: '',
        avatar: avatar || '✨',
        teachSkills: [],
        learnSkills: [],
        contactInfo: { discord: '', whatsapp: '', email: email.toLowerCase() },
        createdAt: new Date().toISOString()
      };
      
      res.json({ success: true, isNew: true, user: newUserDraft });
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: 'Google authentication failed', error: error.message });
  }
});

// --- USER DIRECTORY & MATCHING ROUTES ---

// Get all users with filters
app.get('/api/users', async (req, res) => {
  try {
    const { search, exclude, teach, learn } = req.query;
    let users = await db.getUsers();
    const reviews = await db.getReviews();

    // Map each user with their average rating and review count
    users = users.map(u => {
      const uReviews = reviews.filter(r => r.mentorId === u.id);
      const avg = uReviews.length
        ? parseFloat((uReviews.reduce((sum, r) => sum + r.rating, 0) / uReviews.length).toFixed(1))
        : 0;
      return {
        ...u,
        averageRating: avg,
        reviewCount: uReviews.length
      };
    });

    // Exclude a user (usually the current logged-in user)
    if (exclude) {
      users = users.filter(u => u.id !== exclude);
    }

    // Search query (names, bios, major, skills)
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => 
        u.fullName.toLowerCase().includes(q) ||
        u.major.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q) ||
        u.teachSkills.some(s => s.name.toLowerCase().includes(q)) ||
        u.learnSkills.some(s => s.name.toLowerCase().includes(q))
      );
    }

    // Filter by teaching skill
    if (teach) {
      users = users.filter(u => u.teachSkills.some(s => s.name.toLowerCase() === teach.toLowerCase()));
    }

    // Filter by learning skill
    if (learn) {
      users = users.filter(u => u.learnSkills.some(s => s.name.toLowerCase() === learn.toLowerCase()));
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve directory', error: error.message });
  }
});

// Get user profile details
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (user) {
      const reviews = await db.getReviews();
      const userReviews = reviews.filter(r => r.mentorId === user.id);
      const averageRating = userReviews.length
        ? parseFloat((userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1))
        : 0;

      res.json({
        ...user,
        averageRating,
        reviewCount: userReviews.length
      });
    } else {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving profile', error: error.message });
  }
});

// Update user profile details
app.put('/api/users/:id', async (req, res) => {
  try {
    const existing = await db.getUserById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const { fullName, major, gradYear, bio, avatar, teachSkills, learnSkills, contactInfo, isExpert, availability } = req.body;

    const updatedUser = {
      ...existing,
      fullName: fullName || existing.fullName,
      major: major || existing.major,
      gradYear: gradYear || existing.gradYear,
      bio: bio !== undefined ? bio : existing.bio,
      avatar: avatar || existing.avatar,
      teachSkills: teachSkills || existing.teachSkills,
      learnSkills: learnSkills || existing.learnSkills,
      contactInfo: contactInfo || existing.contactInfo,
      isExpert: isExpert !== undefined ? isExpert : existing.isExpert,
      availability: availability !== undefined ? availability : existing.availability
    };

    const saved = await db.saveUser(updatedUser);
    res.json({ success: true, user: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
});

// Simulate a community action to test scoring/levels
app.post('/api/users/:id/simulate-action', async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.body;

    const user = await db.getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    if (!user.impactMetrics) {
      user.impactMetrics = { studentsHelped: 0, teachingHours: 0, successfulSwaps: 0, learningSessionsCompleted: 0 };
    }
    if (!user.swapHistory) {
      user.swapHistory = [];
    }
    if (user.knowledgeScore === undefined) {
      user.knowledgeScore = 0;
    }
    if (user.uploadedNotesCount === undefined) {
      user.uploadedNotesCount = 0;
    }

    let pointsEarned = 0;
    let message = '';

    switch (actionType) {
      case 'first_teach':
        pointsEarned = 20;
        user.impactMetrics.teachingHours = (user.impactMetrics.teachingHours || 0) + 1.0;
        user.impactMetrics.studentsHelped = (user.impactMetrics.studentsHelped || 0) + 1;
        user.impactMetrics.successfulSwaps = (user.impactMetrics.successfulSwaps || 0) + 1;
        user.swapHistory.unshift({
          id: 'sh-sim-' + Date.now(),
          partnerName: 'Mock Student ' + (user.impactMetrics.studentsHelped),
          partnerAvatar: '🎓',
          skillsTaught: [user.teachSkills[0]?.name || 'Skills Exchange'],
          skillsLearned: [user.learnSkills[0]?.name || 'New Skill'],
          date: new Date().toISOString().split('T')[0],
          status: 'COMPLETED'
        });
        message = 'Completed first teaching session! +20 points';
        break;

      case 'teach_30':
        pointsEarned = 10;
        user.impactMetrics.teachingHours = (user.impactMetrics.teachingHours || 0) + 0.5;
        user.impactMetrics.studentsHelped = (user.impactMetrics.studentsHelped || 0) + 1;
        user.swapHistory.unshift({
          id: 'sh-sim-' + Date.now(),
          partnerName: 'Mock Student ' + (user.impactMetrics.studentsHelped),
          partnerAvatar: '✨',
          skillsTaught: [user.teachSkills[0]?.name || 'Skills Exchange'],
          skillsLearned: [user.learnSkills[0]?.name || 'New Skill'],
          date: new Date().toISOString().split('T')[0],
          status: 'COMPLETED'
        });
        message = 'Completed a 30-minute teaching session! +10 points';
        break;

      case 'teach_60':
        pointsEarned = 20;
        user.impactMetrics.teachingHours = (user.impactMetrics.teachingHours || 0) + 1.0;
        user.impactMetrics.studentsHelped = (user.impactMetrics.studentsHelped || 0) + 1;
        user.swapHistory.unshift({
          id: 'sh-sim-' + Date.now(),
          partnerName: 'Mock Student ' + (user.impactMetrics.studentsHelped),
          partnerAvatar: '🎨',
          skillsTaught: [user.teachSkills[0]?.name || 'Skills Exchange'],
          skillsLearned: [user.learnSkills[0]?.name || 'New Skill'],
          date: new Date().toISOString().split('T')[0],
          status: 'COMPLETED'
        });
        message = 'Completed a 1-hour teaching session! +20 points';
        break;

      case 'upload_notes':
        pointsEarned = 5;
        user.uploadedNotesCount = (user.uploadedNotesCount || 0) + 1;
        message = 'Uploaded study notes/resources! +5 points';
        break;

      case 'complete_swap':
        pointsEarned = 30;
        user.impactMetrics.successfulSwaps = (user.impactMetrics.successfulSwaps || 0) + 5;
        // Seed 5 historical swaps
        for (let i = 0; i < 5; i++) {
          user.swapHistory.unshift({
            id: 'sh-sim-swap-' + i + '-' + Date.now(),
            partnerName: 'Swap Peer ' + (user.impactMetrics.successfulSwaps - 4 + i),
            partnerAvatar: '💡',
            skillsTaught: [user.teachSkills[0]?.name || 'Skills Exchange'],
            skillsLearned: [user.learnSkills[0]?.name || 'New Skill'],
            date: new Date().toISOString().split('T')[0],
            status: 'COMPLETED'
          });
        }
        message = 'Completed 5 successful skill swaps! +30 points';
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid action type.' });
    }

    user.knowledgeScore += pointsEarned;
    const saved = await db.saveUser(user);
    
    // Fetch user with fresh average reviews
    const reviews = await db.getReviews();
    const userReviews = reviews.filter(r => r.mentorId === saved.id);
    const averageRating = userReviews.length
      ? parseFloat((userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1))
      : 0;

    res.json({
      success: true,
      message,
      user: {
        ...saved,
        averageRating,
        reviewCount: userReviews.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to simulate action', error: error.message });
  }
});

// --- SKILLS TAXONOMY ROUTES ---

// Get all predefined skills
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await db.getSkills();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve skills taxonomy', error: error.message });
  }
});

// Add custom skill tag
app.post('/api/skills/custom', async (req, res) => {
  try {
    const { skillName } = req.body;
    if (!skillName || skillName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Skill name cannot be empty.' });
    }
    const updatedSkills = await db.saveCustomSkill(skillName.trim());
    res.json({ success: true, skills: updatedSkills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add custom skill tag', error: error.message });
  }
});

// --- SWAP REQUEST ROUTES ---

// Get swap requests for a specific user
app.get('/api/swaps', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId query parameter is required.' });
    }

    const requests = await db.getSwapRequests();
    // Filter requests where the user is either the sender or receiver
    const filteredRequests = requests.filter(r => r.senderId === userId || r.receiverId === userId);

    // Populate sender and receiver profiles to avoid client-side double requests
    const users = await db.getUsers();
    const populated = filteredRequests.map(reqData => {
      const sender = users.find(u => u.id === reqData.senderId);
      const receiver = users.find(u => u.id === reqData.receiverId);
      return {
        ...reqData,
        sender: sender ? { id: sender.id, fullName: sender.fullName, major: sender.major, avatar: sender.avatar, email: sender.email } : null,
        receiver: receiver ? { id: receiver.id, fullName: receiver.fullName, major: receiver.major, avatar: receiver.avatar, email: receiver.email } : null
      };
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to query connection inbox', error: error.message });
  }
});

// Submit a swap request
app.post('/api/swaps', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ success: false, message: 'Sender and Receiver IDs are required.' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: 'You cannot request to swap skills with yourself.' });
    }

    const sender = await db.getUserById(senderId);
    const receiver = await db.getUserById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, message: 'Sender or Receiver student profile does not exist.' });
    }

    // Check for existing connection request
    const existingRequests = await db.getSwapRequests();
    const duplicate = existingRequests.find(r => 
      (r.senderId === senderId && r.receiverId === receiverId && r.status === 'PENDING')
    );

    if (duplicate) {
      return res.status(400).json({ success: false, message: 'A pending swap request is already active with this student.' });
    }

    const swapRequest = {
      senderId,
      receiverId,
      message: message || `Hi! I'd love to trade skills with you. Let me know if you are interested!`,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    const saved = await db.saveSwapRequest(swapRequest);
    res.status(201).json({ success: true, request: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create swap connection', error: error.message });
  }
});

// Update swap connection status (Accept / Decline)
app.patch('/api/swaps/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Choose ACCEPTED or DECLINED.' });
    }

    const updated = await db.updateSwapRequestStatus(id, status);
    
    // Fetch detailed sender/receiver profiles to return fully populated object
    const users = await db.getUsers();
    const sender = users.find(u => u.id === updated.senderId);
    const receiver = users.find(u => u.id === updated.receiverId);

    res.json({
      success: true,
      request: {
        ...updated,
        sender: sender ? { id: sender.id, fullName: sender.fullName, major: sender.major, avatar: sender.avatar, contactInfo: sender.contactInfo } : null,
        receiver: receiver ? { id: receiver.id, fullName: receiver.fullName, major: receiver.major, avatar: receiver.avatar, contactInfo: receiver.contactInfo } : null
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// --- AI LEARNING PATHS ROUTE ---

// Generate step-by-step roadmap and map to mentors on campus
app.post('/api/ai/learning-path', async (req, res) => {
  try {
    const { goal } = req.body;

    if (!goal || goal.trim() === '') {
      return res.status(400).json({ success: false, message: 'A learning goal is required.' });
    }

    // Get available campus skills
    const skills = await db.getSkills();
    
    // Call AI roadmap generation service
    const rawRoadmap = await generateLearningPath(goal.trim(), skills);

    // Fetch campus users
    const users = await db.getUsers();

    // Map each step's skill to campus users who offer it (can teach it)
    const roadmapWithMentors = rawRoadmap.map(node => {
      const skillName = node.subSkill;
      
      // Find campus students who teach this skill
      const mentors = users
        .filter(u => u.teachSkills.some(s => s.name.toLowerCase() === skillName.toLowerCase()))
        .map(u => {
          const teachInfo = u.teachSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
          return {
            id: u.id,
            fullName: u.fullName,
            major: u.major,
            avatar: u.avatar,
            proficiency: teachInfo ? teachInfo.level : 'Intermediate'
          };
        });

      return {
        ...node,
        mentors
      };
    });

    res.json({
      success: true,
      goal: goal.trim(),
      roadmap: roadmapWithMentors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate learning roadmap', error: error.message });
  }
});

// --- REVIEWS & MENTORSHIP ROUTES ---

// Get reviews for a mentor
app.get('/api/reviews/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const reviews = await db.getReviews();
    const mentorReviews = reviews.filter(r => r.mentorId === mentorId);
    
    // Join with reviewer's name and avatar
    const users = await db.getUsers();
    const populated = mentorReviews.map(r => {
      const reviewer = users.find(u => u.id === r.reviewerId);
      return {
        ...r,
        reviewerName: reviewer ? reviewer.fullName : 'Anonymous Student',
        reviewerAvatar: reviewer ? reviewer.avatar : '🎓'
      };
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve reviews', error: error.message });
  }
});

// Submit a review
app.post('/api/reviews', async (req, res) => {
  try {
    const { reviewerId, mentorId, rating, feedback } = req.body;

    if (!reviewerId || !mentorId || !rating) {
      return res.status(400).json({ success: false, message: 'Reviewer, mentor, and rating (1-5) are required.' });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    const review = {
      reviewerId,
      mentorId,
      rating: ratingNum,
      feedback: feedback || ''
    };

    const newReview = await db.saveReview(review);

    // Update mentor score and stats
    try {
      const mentor = await db.getUserById(mentorId);
      if (mentor) {
        if (!mentor.impactMetrics) {
          mentor.impactMetrics = { studentsHelped: 0, teachingHours: 0, successfulSwaps: 0, learningSessionsCompleted: 0 };
        }
        mentor.impactMetrics.studentsHelped = (mentor.impactMetrics.studentsHelped || 0) + 1;
        if (ratingNum === 5) {
          mentor.knowledgeScore = (mentor.knowledgeScore || 0) + 15;
        }
        await db.saveUser(mentor);
      }
    } catch (err) {
      console.error('Failed to update mentor stats after review:', err);
    }

    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get scheduled mentorship sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await db.getSessions();
    const bookings = await db.getSessionBookings();
    const users = await db.getUsers();

    // Join mentor details and attendees
    const populated = sessions.map(session => {
      const mentor = users.find(u => u.id === session.mentorId);
      const sessionBookings = bookings.filter(b => b.sessionId === session.id);
      
      const attendees = sessionBookings.map(b => {
        const student = users.find(u => u.id === b.studentId);
        return student ? { id: student.id, fullName: student.fullName, avatar: student.avatar, major: student.major } : null;
      }).filter(Boolean);

      return {
        ...session,
        mentorName: mentor ? mentor.fullName : 'Unknown Mentor',
        mentorAvatar: mentor ? mentor.avatar : '🎓',
        mentorMajor: mentor ? mentor.major : '',
        attendees,
        attendeeCount: attendees.length
      };
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve sessions', error: error.message });
  }
});

// Create a new mentorship session/workshop
app.post('/api/sessions', async (req, res) => {
  try {
    const { mentorId, title, description, startTime, endTime, maxAttendees, sessionType } = req.body;

    if (!mentorId || !title || !startTime || !endTime || !sessionType) {
      return res.status(400).json({ success: false, message: 'Mentor ID, title, start time, end time, and session type are required.' });
    }

    if (!['1_ON_1', 'WORKSHOP'].includes(sessionType)) {
      return res.status(400).json({ success: false, message: 'Session type must be 1_ON_1 or WORKSHOP.' });
    }

    // Verify mentor is verified
    const mentor = await db.getUserById(mentorId);
    if (!mentor || !mentor.isExpert) {
      return res.status(403).json({ success: false, message: 'Only Verified Expert Mentors can schedule sessions.' });
    }

    const session = {
      mentorId,
      title,
      description: description || '',
      startTime,
      endTime,
      maxAttendees: parseInt(maxAttendees) || 1,
      sessionType
    };

    const newSession = await db.saveSession(session);
    res.status(201).json({ success: true, session: newSession });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create session', error: error.message });
  }
});

// Delete a session
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId } = req.body; // To verify ownership

    const sessions = await db.getSessions();
    const session = sessions.find(s => s.id === id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (session.mentorId !== mentorId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this session.' });
    }

    await db.deleteSession(id);
    res.json({ success: true, message: 'Session successfully deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete session', error: error.message });
  }
});

// Book a session slot (RSVP)
app.post('/api/sessions/:id/book', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    const sessions = await db.getSessions();
    const session = sessions.find(s => s.id === id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Check if session has space
    const bookings = await db.getSessionBookings();
    const sessionBookings = bookings.filter(b => b.sessionId === id);
    if (sessionBookings.length >= session.maxAttendees) {
      return res.status(400).json({ success: false, message: 'This session is already fully booked.' });
    }

    // Check if mentor is trying to book their own session
    if (session.mentorId === studentId) {
      return res.status(400).json({ success: false, message: 'Mentors cannot book their own sessions.' });
    }

    const booking = {
      sessionId: id,
      studentId
    };

    const newBooking = await db.saveSessionBooking(booking);
    res.status(201).json({ success: true, booking: newBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to book session', error: error.message });
  }
});

// Cancel a session booking (RSVP)
app.delete('/api/sessions/:id/book', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    await db.deleteSessionBookingByUserAndSession(studentId, id);
    res.json({ success: true, message: 'Booking canceled successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking', error: error.message });
  }
});

// --- MESSAGING ROUTES ---

app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await db.getMessagesForUser(userId);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Missing required message fields' });
    }
    
    const newMsg = await db.saveMessage({ senderId, receiverId, content });
    res.status(201).json({ success: true, message: newMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
});

// Serve static frontend in production
const DIST_PATH = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*splat', (req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

// Start backend server
app.listen(PORT, () => {
  console.log(`College Skill Swap Backend Server running on port ${PORT}`);
});
