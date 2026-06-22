import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';

const LOADING_PHRASES = [
  "Consulting predefined campus taxonomy...",
  "Scanning active student directory...",
  "Analyzing mutual match scores...",
  "Assembling learning nodes...",
  "Mapping campus experts to roadmap steps...",
  "Finalizing customized path..."
];

export default function LearningPaths() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [roadmap, setRoadmap] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < LOADING_PHRASES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [loading]);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoadingStep(0);
    setLoading(true);
    setError('');
    setRoadmap(null);

    try {
      const res = await fetch('/api/ai/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        // Artificially delay a tiny bit to make sure they see the cool loading step details!
        setTimeout(() => {
          setRoadmap(data.roadmap);
          setLoading(false);
        }, 1500);
      } else {
        setError(data.message || 'Failed to assemble roadmap.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check backend status.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Title Header */}
      <div style={{ textAlignment: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <Sparkles style={{ color: 'var(--primary)' }} />
          AI Learning Paths
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
          Define a macro learning goal, and our AI compiler will build a custom roadmap mapped directly to peer mentors on campus.
        </p>
      </div>

      {/* Goal Prompt Form */}
      <div className="glass-panel" style={{ backgroundColor: 'var(--bg-secondary)', marginBottom: '2rem', padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">What is your learning objective?</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. I want to design wireframes in Figma and build a React web app..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={loading}
              style={{
                height: '52px',
                borderRadius: '30px',
                padding: '0 1.5rem',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Suggestions:</span>
            {["Learn Video Editing", "Fullstack Developer", "Resume & Interviews"].map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setGoal(`I want to learn skills to: ${sug}`)}
                className="btn btn-secondary"
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', borderRadius: '15px', border: '1px solid var(--border-color)' }}
              >
                {sug}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !goal.trim()}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end', padding: '0.75rem 2rem', borderRadius: '30px', fontWeight: '700' }}
          >
            {loading ? 'Analyzing...' : 'Generate Roadmap'}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>

      {/* ERROR DISPLAY */}
      {error && (
        <div style={{ backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* LOADING ANTIMATION TERMINAL */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-panel"
            style={{
              padding: '2.5rem 2rem',
              backgroundColor: '#0a0e17',
              borderColor: '#1e293b',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <RefreshCw size={14} className="animate-spin" />
              <span>SKILLSWAP AI PATH COMPILER</span>
            </div>
            <div>&gt; Initializing learning roadmap generation...</div>
            <div>&gt; Objective: "{goal}"</div>
            
            {LOADING_PHRASES.slice(0, loadingStep + 1).map((phrase, idx) => (
              <div key={idx} style={{ color: idx === loadingStep ? '#38bdf8' : '#64748b' }}>
                &gt; {phrase} {idx === loadingStep ? '...' : '✓ Done'}
              </div>
            ))}
          </motion.div>
        )}

        {/* ROADMAP RESULTS TREE */}
        {!loading && roadmap && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Your Personalized Roadmap</h3>
              <button 
                onClick={() => { setRoadmap(null); setGoal(''); }}
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '20px' }}
              >
                Clear Roadmap
              </button>
            </div>

            {/* Path Nodes List */}
            <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
              
              {/* Vertical Connector Line */}
              <div style={{
                position: 'absolute',
                top: '20px',
                bottom: '20px',
                left: '17px',
                width: '4px',
                backgroundColor: 'var(--border-color)',
                zIndex: 1
              }}></div>

              {roadmap.map((stepNode, index) => {
                const hasMentors = stepNode.mentors && stepNode.mentors.length > 0;
                
                return (
                  <motion.div
                    key={stepNode.step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                    style={{ position: 'relative', marginBottom: '2.5rem' }}
                  >
                    {/* Circle Node Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '0px',
                      left: '-40px',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: hasMentors ? 'var(--primary)' : 'var(--bg-tertiary)',
                      border: '4px solid var(--bg-primary)',
                      color: hasMentors ? 'white' : 'var(--text-muted)',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: hasMentors ? '0 0 10px rgba(99, 102, 241, 0.3)' : 'none'
                    }}>
                      {stepNode.step}
                    </div>

                    {/* Step Card Body */}
                    <div className="glass-panel" style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                          {stepNode.subSkill}
                        </h4>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: hasMentors ? 'var(--secondary-glow)' : 'var(--danger-glow)',
                          color: hasMentors ? 'var(--secondary)' : 'var(--danger)'
                        }}>
                          {hasMentors ? `${stepNode.mentors.length} Mentors Available` : 'No Campus Mentors'}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                        {stepNode.description}
                      </p>

                      {/* Mentors Segment */}
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        {hasMentors ? (
                          <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                              Recommended Campus Mentors:
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {stepNode.mentors.map(mentor => (
                                <div
                                  key={mentor.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)'
                                  }}
                                  className="mentor-list-item"
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{mentor.avatar}</span>
                                    <div>
                                      <h5 style={{ fontSize: '0.85rem', fontWeight: '700' }}>{mentor.fullName}</h5>
                                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {mentor.major} • {mentor.proficiency} Level
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => navigate(`/profile/${mentor.id}`)}
                                    className="btn btn-secondary"
                                    style={{
                                      padding: '0.25rem 0.75rem',
                                      fontSize: '0.75rem',
                                      borderRadius: '15px',
                                      border: '1px solid var(--border-color)',
                                      backgroundColor: 'var(--bg-secondary)'
                                    }}
                                  >
                                    View & Connect
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: '8px',
                            padding: '0.75rem 1rem',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            ⚠️ No registered peers offer this skill yet. Try adding it to your <strong>Teach Skills</strong> in Settings to help others!
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Roadmap Footer */}
            <div className="glass-panel" style={{
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              padding: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <CheckCircle size={32} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Ready to start swap connections?</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto' }}>
                Use the quick actions on each node card to message mentors on campus and schedule peer tutoring exchanges.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 600px) {
          .mentor-list-item {
            flex-direction: column !important;
            gap: 0.75rem !important;
            text-align: center !important;
            align-items: center !important;
          }
        }
      `}</style>
      
    </div>
  );
}
