import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, MessageSquare, Send, Clock, Copy, ShieldCheck, Mail, MessageCircle } from 'lucide-react';

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
        
        // Setup a default polite message in the modal
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
        
        // Re-fetch reviews and profile to update ratings score
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

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Back to Match Hub */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="btn btn-secondary"
        style={{ border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', borderRadius: '30px' }}
      >
        <ArrowLeft size={16} />
        Back to Matches
      </button>

      {/* Main Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          position: 'relative'
        }}
      >
        {/* Banner Segment */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '110px',
          background: swapConnection?.status === 'ACCEPTED' 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(31, 41, 55, 0.02) 100%)',
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          borderBottom: '1px solid var(--border-color)',
          zIndex: 1
        }}></div>

        {/* Profile Info Row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1.5rem',
          marginTop: '45px', // Push down so it overlaps the banner
          position: 'relative',
          zIndex: 2,
          padding: '0 0.5rem'
        }} className="profile-header-row">
          
          <div style={{
            fontSize: '3.5rem',
            width: '90px',
            height: '90px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid var(--bg-secondary)',
            boxShadow: 'var(--shadow-md)'
          }}>
            {peer.avatar}
          </div>

          <div style={{ flexGrow: 1 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {peer.fullName}
              {peer.isExpert && (
                <span style={{
                  padding: '0.25rem 0.5rem',
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
              )}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {peer.major}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Class of {peer.gradYear} • Campus Student
            </p>
            {peer.isExpert && peer.averageRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.85rem', color: '#fbbf24', fontWeight: '700' }}>
                ★ {peer.averageRating} <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>({peer.reviewCount} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 2 }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            About Student
          </h4>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
            {peer.bio || "This student hasn't filled out their biography yet."}
          </p>
        </div>

        {/* Skills Tag lists */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="profile-skills-grid">
          
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.6rem' }}>
              Offered Skills (Can Teach)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {peer.teachSkills.map(s => (
                <div 
                  key={s.name} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{s.name}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', backgroundColor: 'var(--primary-glow)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    {s.level}
                  </span>
                </div>
              ))}
              {peer.teachSkills.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None listed.</p>}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--secondary)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.6rem' }}>
              Desired Skills (Want to Learn)
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {peer.learnSkills.map(s => (
                <span 
                  key={s.name}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
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
        <div>
          {/* STATE 1: Connected (Accepted) */}
          {swapConnection?.status === 'ACCEPTED' ? (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                <ShieldCheck size={20} />
                <span style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Connected! Swap Active
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Your swap request was accepted. You can coordinate your learning sessions by reaching out through the following channels:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {peer.contactInfo.discord && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MessageSquare size={16} style={{ color: '#5865F2' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{peer.contactInfo.discord}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(peer.contactInfo.discord, 'discord')}
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem', border: 'none', borderRadius: '4px' }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}

                {peer.contactInfo.whatsapp && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MessageCircle size={16} style={{ color: '#25D366' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{peer.contactInfo.whatsapp}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(peer.contactInfo.whatsapp, 'whatsapp')}
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem', border: 'none', borderRadius: '4px' }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}

                {peer.contactInfo.email && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: '500', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{peer.contactInfo.email}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(peer.contactInfo.email, 'email')}
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem', border: 'none', borderRadius: '4px' }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
              </div>
              {copiedField && (
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: '600', alignSelf: 'center' }}>
                  ✓ Copied {copiedField} handle to clipboard!
                </span>
              )}
            </div>
          ) : swapConnection?.status === 'PENDING' ? (
            /* STATE 2: Pending request */
            swapConnection.senderId === user.id ? (
              /* Case A: Current user sent it */
              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                  <Clock size={20} className="animate-pulse" />
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Swap Request Pending Approval</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Waiting for {peer.fullName} to accept the connection.
                </p>
              </div>
            ) : (
              /* Case B: Peer sent it (Current user can accept/decline) */
              <div style={{
                backgroundColor: 'var(--primary-glow)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Received Swap Request
                  </span>
                  <p style={{ fontSize: '0.9rem', fontStyle: 'italic', borderLeft: '3px solid var(--primary)', paddingLeft: '0.75rem', margin: '0.5rem 0', color: 'var(--text-main)' }}>
                    "{swapConnection.message}"
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => handleStatusUpdate('ACCEPTED')}
                    className="btn btn-teal" 
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '30px' }}
                  >
                    Accept Swap
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('DECLINED')}
                    className="btn btn-danger" 
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '30px' }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )
          ) : (
            /* STATE 3: No connection request yet (Decline also acts like no connection so they can re-request) */
            <button
              onClick={() => setShowRequestModal(true)}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '30px', padding: '0.8rem', fontSize: '0.95rem' }}
            >
              <Send size={16} />
              Request to Swap Skills
            </button>
          )}
        </div>

        {/* Divider */}
        {peer.isExpert && <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0' }}></div>}

        {/* REVIEWS & RATINGS SECTION */}
        {peer.isExpert && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                Reviews & Ratings
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Feedback from campus learners who swapped skills or booked office hours.
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
                  No reviews submitted yet. Be the first to write a review!
                </p>
              )}
            </div>

            {/* Submit Review Form (Only for other users) */}
            {user.id !== peer.id && (
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem' }}>Write a Review</h4>
                
                {/* Submit Success Message */}
                {reviewSuccess && (
                  <div style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success)', fontSize: '0.8rem', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '0.75rem' }}>
                    {reviewSuccess}
                  </div>
                )}

                {/* Submit Review Constraint Check */}
                {reviews.some(r => r.reviewerId === user.id) ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    ✓ You have already reviewed this mentor. To edit or post another, coordinate directly with the student.
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
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Feedback Comment</label>
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
                      className="btn btn-secondary-filled"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '20px', alignSelf: 'flex-end' }}
                    >
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>

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
                <label className="form-label">Message</label>
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

      <style>{`
        @media (max-width: 600px) {
          .profile-header-row {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .profile-skills-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
