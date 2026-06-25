import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Clock, Users, Plus, ShieldCheck, Trash2, Star, CheckCircle } from 'lucide-react';

export default function Mentorship() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'directory' | 'schedule'
  const [sessions, setSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Scheduler Form State
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [sessionType, setSessionType] = useState('WORKSHOP'); // '1_ON_1' | 'WORKSHOP'
  const [sessionDate, setSessionDate] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState('');
  const [sessionEndTime, setSessionEndTime] = useState('');
  const [sessionMaxAttendees, setSessionMaxAttendees] = useState(5);
  const [submittingSession, setSubmittingSession] = useState(false);

  // Fetch all mentorship data
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      Promise.resolve().then(() => {
        setError('');
      });
      
      // Fetch sessions
      const sessionsRes = await fetch('/api/sessions');
      const sessionsData = await sessionsRes.json();
      
      // Fetch mentors (users with isExpert === true or rated highly)
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      
      Promise.resolve().then(() => {
        setSessions(sessionsData);
        setMentors(usersData.filter(u => u.isExpert));
        setLoading(false);
      });
    } catch (err) {
      console.error(err);
      Promise.resolve().then(() => {
        setError('Could not retrieve mentorship details. Please try again.');
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchData();
      }
    });
    return () => {
      active = false;
    };
  }, [fetchData]);

  if (!user) return null;

  // Handle RSVP / Session Booking
  const handleBookSession = async (sessionId) => {
    try {
      setError('');
      const res = await fetch(`/api/sessions/${sessionId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Successfully booked slot! See you there.');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to book slot.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure booking session.');
    }
  };

  // Handle Cancel RSVP / Booking
  const handleCancelBooking = async (sessionId) => {
    try {
      setError('');
      const res = await fetch(`/api/sessions/${sessionId}/book`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id })
      });
      if (res.ok) {
        setSuccessMessage('Your RSVP has been cancelled.');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to cancel RSVP.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure cancelling booking.');
    }
  };

  // Handle Create Session (Expert Mentors Only)
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSubmittingSession(true);
    setError('');

    const startDateTime = new Date(`${sessionDate}T${sessionStartTime}`);
    const endDateTime = new Date(`${sessionDate}T${sessionEndTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setError('Please provide valid date and time slots.');
      setSubmittingSession(false);
      return;
    }

    if (startDateTime >= endDateTime) {
      setError('Start time must be before end time.');
      setSubmittingSession(false);
      return;
    }

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: user.id,
          title: sessionTitle.trim(),
          description: sessionDesc.trim(),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          maxAttendees: sessionType === '1_ON_1' ? 1 : parseInt(sessionMaxAttendees),
          sessionType
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Mentorship session scheduled successfully!');
        setSessionTitle('');
        setSessionDesc('');
        setSessionDate('');
        setSessionStartTime('');
        setSessionEndTime('');
        setSessionMaxAttendees(5);
        setActiveTab('sessions');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to create session.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create session due to a network error.');
    } finally {
      setSubmittingSession(false);
    }
  };

  // Handle Delete Session (Owners Only)
  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel and delete this session?")) return;
    try {
      setError('');
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: user.id })
      });
      if (res.ok) {
        setSuccessMessage('Mentorship session cancelled and deleted.');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to cancel session.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error cancelling session.');
    }
  };

  // Formatter helper
  const formatSessionTime = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    return `${start.toLocaleDateString(undefined, dateOptions)} • ${start.toLocaleTimeString(undefined, timeOptions)} - ${end.toLocaleTimeString(undefined, timeOptions)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '2.5rem 2rem',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(99, 102, 241, 0.03) 100%)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '550px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#d97706',
              fontSize: '0.7rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Star size={12} />
              1-on-1 Guidance & Masterclasses
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Verified Mentorship Hub
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.6' }}>
            Get expert guidance from TAs, Alumni, or top-rated seniors. Book office hours, join interactive workshops, or schedule structured sessions.
          </p>
        </div>
        
        {user.isExpert ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            alignItems: 'center'
          }}>
            <ShieldCheck size={28} style={{ color: '#fbbf24' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fbbf24' }}>Verified Expert Mentor</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>You can schedule masterclasses!</span>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/settings')}
            className="btn btn-secondary-filled" 
            style={{ borderRadius: '30px', padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
          >
            Become a Verified Mentor
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'var(--success-glow)',
          color: 'var(--success)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-glow)',
          color: 'var(--danger)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          {error}
        </div>
      )}

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`btn ${activeTab === 'sessions' ? 'btn-secondary-filled' : 'btn-secondary'}`}
          style={{ border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '20px' }}
        >
          <Calendar size={14} />
          Workshops & Office Hours
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`btn ${activeTab === 'directory' ? 'btn-secondary-filled' : 'btn-secondary'}`}
          style={{ border: 'none', padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '20px' }}
        >
          <Users size={14} />
          Expert Directory
        </button>

        {user.isExpert && (
          <button
            onClick={() => setActiveTab('schedule')}
            className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              border: 'none', 
              padding: '0.5rem 1.25rem', 
              fontSize: '0.85rem', 
              borderRadius: '20px',
              background: activeTab === 'schedule' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--bg-tertiary)'
            }}
          >
            <Plus size={14} />
            Schedule Availability
          </button>
        )}
      </div>

      {/* LOADING INDICATOR */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Retrieving schedules and verified credentials...
        </div>
      ) : (
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SESSIONS LIST */}
          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {sessions.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                  <Calendar size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.7 }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Upcoming Sessions</h3>
                  <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                    There are no office hours or workshops scheduled for the next few days. Please check back later or contact experts to schedule a session!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                  {sessions.map(session => {
                    const isBooked = session.attendees.some(a => a.id === user.id);
                    const isMentor = session.mentorId === user.id;
                    const isFull = session.attendeeCount >= session.maxAttendees;

                    return (
                      <div
                        key={session.id}
                        className="glass-panel"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '1.5rem',
                          alignItems: 'center',
                          borderLeft: '4px solid ' + (session.sessionType === 'WORKSHOP' ? 'var(--primary)' : '#f59e0b'),
                          backgroundColor: 'var(--bg-secondary)',
                          padding: '1.5rem'
                        }}
                      >
                        {/* Session Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '0.15rem 0.5rem',
                              fontSize: '0.65rem',
                              fontWeight: '700',
                              borderRadius: '4px',
                              backgroundColor: session.sessionType === 'WORKSHOP' ? 'var(--primary-glow)' : 'rgba(245, 158, 11, 0.15)',
                              color: session.sessionType === 'WORKSHOP' ? 'var(--primary)' : '#d97706'
                            }}>
                              {session.sessionType === 'WORKSHOP' ? '🎨 WORKSHOP' : '☕ 1-ON-1 OFFICE HOUR'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Host: <strong>{session.mentorName}</strong> ({session.mentorMajor})
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{session.title}</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{session.description}</p>
                          
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={14} />
                              {formatSessionTime(session.startTime, session.endTime)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Users size={14} />
                              {session.attendeeCount} / {session.maxAttendees} spots booked
                            </div>
                          </div>

                          {/* Show Attendee Avatars */}
                          {session.attendees.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Attendees:</span>
                              <div style={{ display: 'flex', gap: '0.2rem' }}>
                                {session.attendees.map(attendee => (
                                  <span
                                    key={attendee.id}
                                    style={{
                                      width: '26px',
                                      height: '26px',
                                      borderRadius: '50%',
                                      backgroundColor: 'var(--bg-tertiary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.9rem',
                                      border: '1px solid var(--border-color)'
                                    }}
                                    title={attendee.fullName}
                                  >
                                    {attendee.avatar}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '130px' }}>
                          {isMentor ? (
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="btn btn-danger"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}
                            >
                              <Trash2 size={14} />
                              Cancel Session
                            </button>
                          ) : isBooked ? (
                            <button
                              onClick={() => handleCancelBooking(session.id)}
                              className="btn btn-secondary-filled"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '30px', width: '100%' }}
                            >
                              Cancel RSVP
                            </button>
                          ) : isFull ? (
                            <button
                              disabled
                              className="btn btn-secondary"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '30px', width: '100%', cursor: 'not-allowed' }}
                            >
                              Fully Booked
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBookSession(session.id)}
                              className="btn btn-primary"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '30px', width: '100%' }}
                            >
                              Book Slot
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: MENTOR DIRECTORY */}
          {activeTab === 'directory' && (
            <motion.div
              key="directory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="products-grid">
                {mentors.map(mentor => (
                  <div
                    key={mentor.id}
                    className="food-card"
                    style={{
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Gold verified badge */}
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                      zIndex: 10
                    }}>
                      ⭐ EXPERT
                    </div>

                    {/* Profile Header */}
                    <div style={{
                      padding: '1.5rem 1.25rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-tertiary)'
                    }}>
                      <div style={{
                        fontSize: '2.5rem',
                        width: '60px',
                        height: '60px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--border-color)'
                      }}>
                        {mentor.avatar}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{mentor.fullName}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{mentor.major}</p>
                        {mentor.averageRating > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2(10)rem', marginTop: '0.1rem', fontSize: '0.75rem', color: '#fbbf24', fontWeight: '700' }}>
                            ★ {mentor.averageRating} <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>({mentor.reviewCount} reviews)</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No reviews yet</span>
                        )}
                      </div>
                    </div>

                    {/* Mentor Info */}
                    <div className="food-info" style={{ padding: '1.25rem', gap: '1rem' }}>
                      <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        lineHeight: '1.5',
                        height: '3.6em',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {mentor.bio || "No biography provided by mentor."}
                      </p>

                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                          Expert Areas:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {mentor.teachSkills.map(s => (
                            <span
                              key={s.name}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-main)'
                              }}
                            >
                              {s.name} <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>({s.level})</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="food-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                        <button
                          onClick={() => navigate(`/profile/${mentor.id}`)}
                          className="btn btn-primary"
                          style={{ width: '100%', borderRadius: '30px', fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                        >
                          View Reviews & Profile
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: SCHEDULE OFFICE HOURS (Experts Only) */}
          {activeTab === 'schedule' && user.isExpert && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel"
              style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Schedule a Mentorship Session</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Offer structured workshops or individual office hours availability.</p>
              </div>

              <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div className="form-group">
                  <label className="form-label">Session Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Figma Layouts Masterclass, Python Homework Help..."
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Objectives <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea
                    className="form-control"
                    rows="3"
                    required
                    placeholder="Describe what will be covered and who should attend..."
                    value={sessionDesc}
                    onChange={(e) => setSessionDesc(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Session Type <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select
                      className="form-control"
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                    >
                      <option value="WORKSHOP">Group Workshop</option>
                      <option value="1_ON_1">1-on-1 Office Hour</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Max Attendees <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input
                      type="number"
                      required
                      disabled={sessionType === '1_ON_1'}
                      className="form-control"
                      min="1"
                      max="100"
                      value={sessionType === '1_ON_1' ? 1 : sessionMaxAttendees}
                      onChange={(e) => setSessionMaxAttendees(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Session Date <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Time <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input
                      type="time"
                      required
                      className="form-control"
                      value={sessionStartTime}
                      onChange={(e) => setSessionStartTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Time <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input
                      type="time"
                      required
                      className="form-control"
                      value={sessionEndTime}
                      onChange={(e) => setSessionEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingSession}
                  className="btn btn-primary"
                  style={{ borderRadius: '30px', padding: '0.75rem', marginTop: '1rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', color: 'white' }}
                >
                  {submittingSession ? 'Scheduling session...' : 'Publish Session'}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      )}

    </div>
  );
}
