import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/common/Avatar';
import { 
  ArrowLeft, MessageSquare, Send, Clock, Copy, ShieldCheck, Mail, MessageCircle, 
  Award, Trophy, CheckCircle, RefreshCw, Calendar, Sparkles
} from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [peer, setPeer] = useState(null);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reviews & ratings state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  // Action simulation state
  const [simulating, setSimulating] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch peer profile & swap requests
  useEffect(() => {
    if (!user || !id) return;
    
    Promise.resolve().then(() => {
      setLoading(true);
    });

    const fetchProfile = fetch(`/api/users/${id}`).then(res => {
      if (!res.ok) throw new Error('Student profile not found.');
      return res.json();
    });

    const fetchSwaps = fetch(`/api/swaps?userId=${user.id}`).then(res => res.json());
    const fetchReviews = fetch(`/api/reviews/${id}`).then(res => res.json());

    Promise.all([fetchProfile, fetchSwaps, fetchReviews])
      .then(([profileData, swapData, reviewData]) => {
        setPeer(profileData);
        setSwaps(swapData);
        setReviews(reviewData);
        
        // Setup a default message in the modal
        setRequestMessage(`Hi ${profileData.fullName}! I noticed you teach ${profileData.teachSkills.map(s => s.name).slice(0, 2).join(', ')} which I want to learn. Let's swap skills!`);
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Error loading profile.');
        setLoading(false);
      });
  }, [user, id]);

  if (!user) return null;
  if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading peer credentials...</div>;
  if (error || !peer) return <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--danger)' }}>{error || 'Student not found.'}</div>;

  // Find if there is an existing swap request with this user
  const swapConnection = swaps.find(s => 
    (s.senderId === user.id && s.receiverId === peer.id) || 
    (s.senderId === peer.id && s.receiverId === user.id)
  );

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewSuccess('');
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerId: user.id,
          mentorId: peer.id,
          rating: reviewRating,
          feedback: reviewFeedback.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReviewSuccess('Thank you! Your feedback has been posted.');
        setReviewFeedback('');
        
        // Re-fetch reviews and profile to update ratings/scores
        const profileRes = await fetch(`/api/users/${peer.id}`);
        const profileData = await profileRes.json();
        setPeer(profileData);

        const reviewsRes = await fetch(`/api/reviews/${peer.id}`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
      } else {
        setError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSendSwapRequest = async (e) => {
    e.preventDefault();
    setSendingRequest(true);
    setError('');

    try {
      const res = await fetch('/api/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: peer.id,
          message: requestMessage.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Re-fetch swaps to update state
        const swapRes = await fetch(`/api/swaps?userId=${user.id}`);
        const swapData = await swapRes.json();
        setSwaps(swapData);
        setShowRequestModal(false);
      } else {
        setError(data.message || 'Failed to submit request.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!swapConnection) return;
    try {
      const res = await fetch(`/api/swaps/${swapConnection.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Re-fetch swaps
        const swapRes = await fetch(`/api/swaps?userId=${user.id}`);
        const swapData = await swapRes.json();
        setSwaps(swapData);
      }
    } catch (err) {
      console.error('Failed to update swap status:', err);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Gamified Simulator Handler
  const handleSimulateAction = async (actionType) => {
    setSimulating(true);
    setError('');
    try {
      const res = await fetch(`/api/users/${peer.id}/simulate-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType })
      });
      const data = await res.json();
      if (res.ok) {
        setPeer(data.user);
        
        // Synchronize local storage user if viewing own profile
        if (user.id === peer.id) {
          const stored = localStorage.getItem('skillswap_user');
          if (stored) {
            const u = JSON.parse(stored);
            localStorage.setItem('skillswap_user', JSON.stringify({ ...u, ...data.user }));
          }
        }
      } else {
        setError(data.message || 'Simulation failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Simulation connection failed.');
    } finally {
      setSimulating(false);
    }
  };

  // Level Logic Calculation
  const getLevelInfo = (score) => {
    if (score < 50) {
      return { level: "Beginner", icon: "🌱", min: 0, max: 50, currentProgress: score, range: 50, nextLevel: "Contributor 📚" };
    } else if (score < 150) {
      return { level: "Contributor", icon: "📚", min: 50, max: 150, currentProgress: score - 50, range: 100, nextLevel: "Mentor 🌟" };
    } else if (score < 300) {
      return { level: "Mentor", icon: "🌟", min: 150, max: 300, currentProgress: score - 150, range: 150, nextLevel: "Expert Mentor 🎓" };
    } else if (score < 500) {
      return { level: "Expert Mentor", icon: "🎓", min: 300, max: 500, currentProgress: score - 300, range: 200, nextLevel: "Campus Legend 👑" };
    } else {
      return { level: "Campus Legend", icon: "👑", min: 500, max: 500, currentProgress: 1, range: 1, nextLevel: "Max Level Reached!" };
    }
  };

  const levelInfo = getLevelInfo(peer.knowledgeScore || 0);
  const xpPercentage = levelInfo.range > 0 ? Math.min((levelInfo.currentProgress / levelInfo.range) * 100, 100) : 100;
  const remainingXP = levelInfo.max === 500 ? 0 : levelInfo.max - (peer.knowledgeScore || 0);

  // SVG Circular progress configurations
  const radius = 60;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (xpPercentage / 100) * circumference;

  // Profile Completion Checklist
  const completionItems = [
    { label: "Avatar uploaded", isDone: !!peer.avatar },
    { label: "Bio completed", isDone: !!peer.bio && peer.bio.trim().length > 0 },
    { label: "Skills to Teach added", isDone: peer.teachSkills && peer.teachSkills.length > 0 },
    { label: "Skills to Learn selected", isDone: peer.learnSkills && peer.learnSkills.length > 0 },
    { label: "Availability configured", isDone: !!peer.availability && peer.availability.trim().length > 0 }
  ];
  const completedCount = completionItems.filter(item => item.isDone).length;
  const completionPercent = Math.round((completedCount / completionItems.length) * 100);

  // Badge list and unlocking states
  const badges = [
    { id: "first_teacher", name: "First Teacher", emoji: "🥇", desc: "Complete 1st session", isUnlocked: (peer.impactMetrics?.teachingHours > 0 || (peer.swapHistory && peer.swapHistory.length > 0)), progressText: (peer.impactMetrics?.teachingHours > 0 || (peer.swapHistory && peer.swapHistory.length > 0)) ? "1/1 Done" : "0/1 Session" },
    { id: "consistent_mentor", name: "Consistent Mentor", emoji: "⏱️", desc: "Teach for 5.0 hours", isUnlocked: (peer.impactMetrics?.teachingHours >= 5), progressText: `${Math.min(peer.impactMetrics?.teachingHours || 0, 5).toFixed(1)}/5.0 hrs` },
    { id: "top_contributor", name: "Top Contributor", emoji: "🌟", desc: "Receive 5-star feedback", isUnlocked: (peer.averageRating >= 4.8 && peer.reviewCount >= 1), progressText: peer.reviewCount >= 1 ? `${peer.averageRating}★ (${peer.reviewCount} reviews)` : "0/1 Review" },
    { id: "knowledge_exchanger", name: "Knowledge Exchanger", emoji: "🔄", desc: "Complete 5 swaps", isUnlocked: (peer.impactMetrics?.successfulSwaps >= 5), progressText: `${Math.min(peer.impactMetrics?.successfulSwaps || 0, 5)}/5 swaps` },
    { id: "expert_mentor_badge", name: "Expert Mentor", emoji: "🎓", desc: "Reach 300 XP", isUnlocked: (peer.knowledgeScore >= 300), progressText: `${Math.min(peer.knowledgeScore || 0, 300)}/300 XP` },
    { id: "campus_legend_badge", name: "Campus Legend", emoji: "👑", desc: "Reach 500 XP", isUnlocked: (peer.knowledgeScore >= 500), progressText: `${Math.min(peer.knowledgeScore || 0, 500)}/500 XP` }
  ];

  // College Email Campus Verification flag
  const isVerified = peer.email?.toLowerCase().endsWith('.edu');

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Back to Match Hub */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="btn btn-secondary"
        style={{ border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', borderRadius: '30px' }}
      >
        <ArrowLeft size={16} />
        Back to Matches
      </button>

      {/* Main Grid: Left column for profile details & tracker, Right for gamification dashboards */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }} className="profile-layout-grid">
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* User Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Banner Segment */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '90px',
              background: swapConnection?.status === 'ACCEPTED' 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)' 
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(31, 41, 55, 0.02) 100%)',
              borderBottom: '1px solid var(--border-color)',
              zIndex: 1
            }}></div>

            {/* Profile Info Row */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '35px',
              position: 'relative',
              zIndex: 2,
              textAlign: 'center'
            }}>
              
              <div style={{
                fontSize: '3.5rem',
                width: '100px',
                height: '100px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px solid var(--bg-secondary)',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '1rem'
              }}>
                <Avatar src={peer.avatar} size="3rem" />
              </div>

              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {peer.fullName}
                </h2>
                
                {isVerified && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.4rem', marginBottom: '0.4rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--primary)',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px',
                      border: '1px solid var(--primary-glow)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <ShieldCheck size={12} /> Campus Verified
                    </span>
                  </div>
                )}

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', margin: '0.2rem 0' }}>
                  {peer.major}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Class of {peer.gradYear} • Student
                </p>
                {peer.isExpert && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      boxShadow: '0 4px 8px rgba(245, 158, 11, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}>
                      ⭐ VERIFIED EXPERT MENTOR
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', zIndex: 2 }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                About Student
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-main)', textAlign: 'left' }}>
                {peer.bio || "This student hasn't filled out their biography yet."}
              </p>
            </div>

            {/* Availability info if set */}
            {peer.availability && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', zIndex: 2, textAlign: 'left', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                  📅 Weekly Availability
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  {peer.availability}
                </span>
              </div>
            )}

            {/* Skills Tag lists */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                  Offered Skills (Can Teach)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {peer.teachSkills.map(s => (
                    <div 
                      key={s.name} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        padding: '0.4rem 0.6rem', 
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{s.name}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', backgroundColor: 'var(--primary-glow)', padding: '0.05rem 0.3rem', borderRadius: '4px' }}>
                        {s.level}
                      </span>
                    </div>
                  ))}
                  {peer.teachSkills.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed.</p>}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--secondary)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                  Desired Skills (Want to Learn)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {peer.learnSkills.map(s => (
                    <span 
                      key={s.name}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {s.name}
                    </span>
                  ))}
                  {peer.learnSkills.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed.</p>}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--border-color)' }}></div>

            {/* CONNECTION WORKFLOW WIDGET */}
            <div style={{ textAlign: 'left' }}>
              {/* STATE 1: Connected */}
              {swapConnection?.status === 'ACCEPTED' ? (
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary)' }}>
                    <ShieldCheck size={18} />
                    <span style={{ fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Connected! Swap Active
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Coordinate your learning session using the following coords:
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {peer.contactInfo.discord && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MessageSquare size={14} style={{ color: '#5865F2' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{peer.contactInfo.discord}</span>
                        </div>
                        <button onClick={() => copyToClipboard(peer.contactInfo.discord, 'discord')} className="btn btn-secondary" style={{ padding: '0.15rem', border: 'none', borderRadius: '4px' }}>
                          <Copy size={12} />
                        </button>
                      </div>
                    )}

                    {peer.contactInfo.whatsapp && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MessageCircle size={14} style={{ color: '#25D366' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{peer.contactInfo.whatsapp}</span>
                        </div>
                        <button onClick={() => copyToClipboard(peer.contactInfo.whatsapp, 'whatsapp')} className="btn btn-secondary" style={{ padding: '0.15rem', border: 'none', borderRadius: '4px' }}>
                          <Copy size={12} />
                        </button>
                      </div>
                    )}

                    {peer.contactInfo.email && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Mail size={14} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: '500', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{peer.contactInfo.email}</span>
                        </div>
                        <button onClick={() => copyToClipboard(peer.contactInfo.email, 'email')} className="btn btn-secondary" style={{ padding: '0.15rem', border: 'none', borderRadius: '4px' }}>
                          <Copy size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  {copiedField && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: '600', alignSelf: 'center' }}>
                      ✓ Copied {copiedField}!
                    </span>
                  )}
                </div>
              ) : swapConnection?.status === 'PENDING' ? (
                /* STATE 2: Pending request */
                swapConnection.senderId === user.id ? (
                  <div style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)' }}>
                      <Clock size={16} className="animate-pulse" />
                      <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Swap Request Sent Pending Approval</span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: 'var(--primary-glow)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <span style={{ fontWeight: '800', fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Received Swap Request
                    </span>
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', borderLeft: '3px solid var(--primary)', paddingLeft: '0.5rem', color: 'var(--text-main)' }}>
                      "{swapConnection.message}"
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleStatusUpdate('ACCEPTED')} className="btn btn-teal" style={{ flex: 1, padding: '0.4rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                        Accept Swap
                      </button>
                      <button onClick={() => handleStatusUpdate('DECLINED')} className="btn btn-danger" style={{ flex: 1, padding: '0.4rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                        Decline
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* STATE 3: No connection request yet */
                user.id !== peer.id && (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="btn btn-primary"
                    style={{ width: '100%', borderRadius: '30px', padding: '0.6rem', fontSize: '0.85rem' }}
                  >
                    <Send size={14} />
                    Request to Swap Skills
                  </button>
                )
              )}
            </div>
          </motion.div>

          {/* Profile Completion Tracker Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel"
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} style={{ color: 'var(--primary)' }} />
                Profile Completion
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Complete your profile to build trust in the community.
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                <span>Progress</span>
                <span style={{ color: 'var(--primary)' }}>{completionPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${completionPercent}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease-in-out' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {completionItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <span style={{ color: item.isDone ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                    {item.isDone ? "✓" : "○"}
                  </span>
                  <span style={{ color: item.isDone ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {user.id === peer.id && completionPercent < 100 && (
              <button 
                onClick={() => navigate('/settings')}
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', borderRadius: '20px', marginTop: '0.5rem' }}
              >
                Complete Profile Settings
              </button>
            )}
          </motion.div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Knowledge Score System & Level Board */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} style={{ color: 'var(--primary)' }} />
                Knowledge Score & Level System
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Earn points by completing teaching sessions, uploading resources, and receiving stellar reviews!
              </p>
            </div>

            {/* Circular charts & Horizontal Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '12px' }} className="level-flex-row">
              <div style={{ position: 'relative', width: radius * 2, height: radius * 2, flexShrink: 0 }}>
                <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    stroke="var(--border-color)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  <circle
                    stroke="var(--primary)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>
                    {peer.knowledgeScore || 0}
                  </span>
                  <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-muted)' }}>
                    XP
                  </span>
                </div>
              </div>
              
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{levelInfo.icon}</span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{levelInfo.level} Rank</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {peer.knowledgeScore >= 500 
                    ? "Maximum rank reached! You are officially a Campus Legend 👑" 
                    : `Needs ${remainingXP} more XP to reach the next level: ${levelInfo.nextLevel}`
                  }
                </p>
                
                {/* Horizontal Progress bar */}
                {peer.knowledgeScore < 500 && (
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginTop: '0.75rem', overflow: 'hidden' }}>
                    <div style={{ width: `${xpPercentage}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease-in-out' }}></div>
                  </div>
                )}
              </div>
            </div>

            {/* Level System reference table (collapsible or small helper text) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>🌱 Beginner (0-49)</span>
              <span>📚 Contributor (50-149)</span>
              <span>🌟 Mentor (150-299)</span>
              <span>🎓 Expert Mentor (300-499)</span>
              <span>👑 Legend (500+)</span>
            </div>
          </motion.div>

          {/* Action Simulator Board (only visible if looking at own profile) */}
          {user.id === peer.id && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-panel" 
              style={{
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                border: '1px dashed var(--primary)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(16, 185, 129, 0.01) 100%)'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={18} className={simulating ? "animate-spin" : ""} style={{ color: 'var(--primary)' }} />
                  Simulate Community Activity (XP Console)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Click buttons to simulate teaching, learning, or note uploads to watch the XP increase and unlock achievements in real-time!
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                <button 
                  onClick={() => handleSimulateAction('first_teach')} 
                  disabled={simulating}
                  className="btn btn-secondary-filled"
                  style={{ padding: '0.5rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center', borderRadius: '12px' }}
                >
                  <span style={{ fontWeight: '500' }}>First Teach Session</span>
                  <strong style={{ color: 'var(--primary)' }}>+20 XP</strong>
                </button>

                <button 
                  onClick={() => handleSimulateAction('teach_30')} 
                  disabled={simulating}
                  className="btn btn-secondary-filled"
                  style={{ padding: '0.5rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center', borderRadius: '12px' }}
                >
                  <span style={{ fontWeight: '500' }}>Teach 30m Session</span>
                  <strong style={{ color: 'var(--primary)' }}>+10 XP</strong>
                </button>

                <button 
                  onClick={() => handleSimulateAction('teach_60')} 
                  disabled={simulating}
                  className="btn btn-secondary-filled"
                  style={{ padding: '0.5rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center', borderRadius: '12px' }}
                >
                  <span style={{ fontWeight: '500' }}>Teach 1h Session</span>
                  <strong style={{ color: 'var(--primary)' }}>+20 XP</strong>
                </button>

                <button 
                  onClick={() => handleSimulateAction('upload_notes')} 
                  disabled={simulating}
                  className="btn btn-secondary-filled"
                  style={{ padding: '0.5rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center', borderRadius: '12px' }}
                >
                  <span style={{ fontWeight: '500' }}>Upload Study Notes</span>
                  <strong style={{ color: 'var(--primary)' }}>+5 XP</strong>
                </button>

                <button 
                  onClick={() => handleSimulateAction('complete_swap')} 
                  disabled={simulating}
                  className="btn btn-secondary-filled"
                  style={{ padding: '0.5rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center', borderRadius: '12px' }}
                >
                  <span style={{ fontWeight: '500' }}>Log 5 Successful Swaps</span>
                  <strong style={{ color: 'var(--primary)' }}>+30 XP</strong>
                </button>
              </div>
            </motion.div>
          )}

          {/* Achievement Badges Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel" 
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} style={{ color: 'var(--warning)' }} />
                Milestone Achievement Badges
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Earn badges by swapping skills, helping peers, and climbing the ranking ladder.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }} className="badges-grid">
              {badges.map((b) => (
                <div 
                  key={b.id} 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '1rem 0.5rem',
                    borderRadius: '12px',
                    border: '1px solid ' + (b.isUnlocked ? 'var(--warning)' : 'var(--border-color)'),
                    boxShadow: b.isUnlocked ? '0 0 10px rgba(245, 158, 11, 0.15)' : 'none',
                    opacity: b.isUnlocked ? 1 : 0.45,
                    transition: 'var(--transition-smooth)'
                  }}
                  className={b.isUnlocked ? 'badge-card-glow' : ''}
                  title={`${b.desc} (${b.progressText})`}
                >
                  {/* Badge Icon */}
                  <div style={{ 
                    fontSize: '2rem', 
                    marginBottom: '0.4rem',
                    filter: b.isUnlocked ? 'none' : 'grayscale(100%)'
                  }}>
                    {b.emoji}
                  </div>
                  
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', lineHeight: '1.2' }}>
                    {b.name}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem', padding: '0 0.25rem', height: '2.5em', overflow: 'hidden' }}>
                    {b.desc}
                  </span>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: '700', 
                    color: b.isUnlocked ? 'var(--warning)' : 'var(--text-muted)', 
                    marginTop: '0.5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)'
                  }}>
                    {b.progressText}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Impact Metrics Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-panel" 
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                Campus Impact Metrics
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Aggregate metrics showing your dedication to peer learning.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }} className="metrics-grid">
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', display: 'block' }}>
                  {peer.impactMetrics?.studentsHelped || 0}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Students Helped
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', display: 'block' }}>
                  {peer.impactMetrics?.teachingHours ? peer.impactMetrics.teachingHours.toFixed(1) : "0.0"}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Teaching Hours
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', display: 'block' }}>
                  {peer.impactMetrics?.successfulSwaps || 0}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Successful Swaps
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fbbf24', display: 'block' }}>
                  {peer.averageRating > 0 ? `${peer.averageRating} ★` : "—"}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Average Rating
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary)', display: 'block' }}>
                  {peer.impactMetrics?.learningSessionsCompleted || 0}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Learning Sessions
                </span>
              </div>
            </div>
          </motion.div>

          {/* Swap History log */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel" 
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                Swap History Registry
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Detailed logs of past swaps completed with peer students.
              </p>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem', fontWeight: '700' }}>Partner</th>
                    <th style={{ padding: '0.75rem', fontWeight: '700' }}>Taught</th>
                    <th style={{ padding: '0.75rem', fontWeight: '700' }}>Learned</th>
                    <th style={{ padding: '0.75rem', fontWeight: '700' }}>Date</th>
                    <th style={{ padding: '0.75rem', fontWeight: '700' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {peer.swapHistory && peer.swapHistory.map((sh, idx) => (
                    <tr key={sh.id || idx} style={{ borderBottom: idx === peer.swapHistory.length - 1 ? 'none' : '1px solid var(--border-color)' }} className="history-row">
                      <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: 'none' }}>
                        <span style={{ fontSize: '1.1rem' }}>{sh.partnerAvatar}</span>
                        <span style={{ fontWeight: '700' }}>{sh.partnerName}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {sh.skillsTaught.map(s => (
                          <span key={s} style={{ display: 'inline-block', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '600', padding: '0.1rem 0.35rem', borderRadius: '4px', marginRight: '0.2rem', whiteSpace: 'nowrap' }}>
                            {s}
                          </span>
                        ))}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {sh.skillsLearned.map(s => (
                          <span key={s} style={{ display: 'inline-block', backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)', fontSize: '0.7rem', fontWeight: '600', padding: '0.1rem 0.35rem', borderRadius: '4px', marginRight: '0.2rem', whiteSpace: 'nowrap' }}>
                            {s}
                          </span>
                        ))}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                        {sh.date}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: '700', 
                          padding: '0.1rem 0.4rem', 
                          borderRadius: '4px',
                          backgroundColor: sh.status === 'COMPLETED' ? 'var(--success-glow)' : 'var(--warning-glow)',
                          color: sh.status === 'COMPLETED' ? 'var(--success)' : 'var(--warning)',
                          textTransform: 'uppercase'
                        }}>
                          {sh.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!peer.swapHistory || peer.swapHistory.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No swaps recorded yet. Begin swapping skills on campus to fill this registry!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* REVIEWS & RATINGS SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-panel" 
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                Peer Recommendations & Reviews
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Feedback left by campus learners after skill exchange sessions or office hours.
              </p>
            </div>

            {/* List Reviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(r => (
                <div key={r.id} style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{r.reviewerAvatar}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{r.reviewerName}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: '800' }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.4' }}>
                    "{r.feedback}"
                  </p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                    Posted {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}

              {reviews.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>
                  No reviews submitted yet.
                </p>
              )}
            </div>

            {/* Submit Review Form (Only for other users) */}
            {user.id !== peer.id && (
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem' }}>Submit a Review</h4>
                
                {reviewSuccess && (
                  <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success)', fontSize: '0.8rem', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '0.75rem' }}>
                    {reviewSuccess}
                  </div>
                )}

                {reviews.some(r => r.reviewerId === user.id) ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    ✓ You have already reviewed this peer. To update feedback, coordinate directly.
                  </p>
                ) : (
                  <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Rating:</span>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {[1, 2, 3, 4, 5].map(stars => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setReviewRating(stars)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
                          >
                            <span style={{ color: stars <= reviewRating ? '#fbbf24' : 'var(--text-muted)' }}>★</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Feedback Comment <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        placeholder="Detail your learning experience, clarity, and guidance..."
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value)}
                        style={{ resize: 'none', fontSize: '0.8rem' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 1.25rem', fontSize: '0.8rem', borderRadius: '20px', alignSelf: 'flex-end' }}
                    >
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </motion.div>

        </div>
      </div>

      {/* SWAP REQUEST MESSAGE MODAL */}
      {showRequestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', backgroundColor: 'var(--bg-secondary)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Send Swap Request</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Add a personal message explaining what skills you'd like to exchange.
            </p>

            <form onSubmit={handleSendSwapRequest}>
              <div className="form-group">
                <label className="form-label">Message <span style={{ color: 'var(--danger)' }}>*</span></label>
                <textarea
                  className="form-control"
                  rows="4"
                  required
                  placeholder="Introduce yourself and specify which skills you want to learn..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, borderRadius: '30px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingRequest}
                  className="btn btn-primary"
                  style={{ flex: 1, borderRadius: '30px' }}
                >
                  {sendingRequest ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responsive adjustments & interactive animations */}
      <style>{`
        .badge-card-glow {
          box-shadow: 0 0 14px rgba(245, 158, 11, 0.3) !important;
          animation: badge-unlock-pulse 2s infinite ease-in-out;
        }
        @keyframes badge-unlock-pulse {
          0%, 100% { border-color: var(--warning); }
          50% { border-color: var(--warning-glow); }
        }
        
        @media (max-width: 900px) {
          .profile-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .level-flex-row {
            flex-direction: column !important;
            text-align: center !important;
          }
        }
      `}</style>

    </div>
  );
}
