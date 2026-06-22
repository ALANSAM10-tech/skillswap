import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, Compass, GraduationCap, Award, HelpCircle } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and Tabs
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'perfect' | 'mentors' | 'students'
  const [selectedMajor, setSelectedMajor] = useState('All');
  const [majors, setMajors] = useState([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch peers from directory
  useEffect(() => {
    if (!user) return;
    
    let active = true;
    // Exclude current user from the listing
    fetch(`/api/users?exclude=${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load student directory.');
        return res.json();
      })
      .then(data => {
        if (active) {
          setPeers(data);
          
          // Get unique majors for filter
          const uniqueMajors = ['All', ...new Set(data.map(p => p.major))];
          setMajors(uniqueMajors);
          
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (active) {
          setError('Could not retrieve student directory. Please try again.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!user) return null;

  // --- MATCHING ENGINE LOGIC ---

  // Helper: check if there's overlap in skills
  const getMutualMatch = (peer) => {
    // 1. Peer teaches something I want to learn
    const peerCanTeachMe = peer.teachSkills.some(ps => 
      user.learnSkills.some(ls => ls.name.toLowerCase() === ps.name.toLowerCase())
    );
    // 2. I teach something the peer wants to learn
    const iCanTeachPeer = user.teachSkills.some(ts => 
      peer.learnSkills.some(pls => pls.name.toLowerCase() === ts.name.toLowerCase())
    );
    
    if (peerCanTeachMe && iCanTeachPeer) {
      // Find what we can swap
      const skillsIWillLearn = peer.teachSkills
        .filter(ps => user.learnSkills.some(ls => ls.name.toLowerCase() === ps.name.toLowerCase()))
        .map(s => s.name);
      
      const skillsIWillTeach = user.teachSkills
        .filter(ts => peer.learnSkills.some(pls => pls.name.toLowerCase() === ts.name.toLowerCase()))
        .map(s => s.name);

      return {
        isMutual: true,
        willLearn: skillsIWillLearn,
        willTeach: skillsIWillTeach
      };
    }
    return { isMutual: false };
  };

  const isMentor = (peer) => {
    // Peer teaches something I want to learn
    return peer.teachSkills.some(ps => 
      user.learnSkills.some(ls => ls.name.toLowerCase() === ps.name.toLowerCase())
    );
  };

  const isStudent = (peer) => {
    // Peer wants to learn something I can teach
    return peer.learnSkills.some(pls => 
      user.teachSkills.some(ts => ts.name.toLowerCase() === pls.name.toLowerCase())
    );
  };

  // Filter peers by search, major, and matching categories
  const filteredPeers = peers.filter(peer => {
    // 1. Search Query
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      peer.fullName.toLowerCase().includes(searchLower) ||
      peer.major.toLowerCase().includes(searchLower) ||
      peer.bio.toLowerCase().includes(searchLower) ||
      peer.teachSkills.some(s => s.name.toLowerCase().includes(searchLower)) ||
      peer.learnSkills.some(s => s.name.toLowerCase().includes(searchLower));

    // 2. Major Filter
    const matchesMajor = selectedMajor === 'All' || peer.major === selectedMajor;

    // 3. Tab Filter
    const mutualInfo = getMutualMatch(peer);
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'perfect' && mutualInfo.isMutual) ||
      (activeTab === 'mentors' && isMentor(peer) && !mutualInfo.isMutual) ||
      (activeTab === 'students' && isStudent(peer) && !mutualInfo.isMutual);

    return matchesSearch && matchesMajor && matchesTab;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>
            Hello, {user.fullName} {user.avatar}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Major: <strong>{user.major}</strong> • Grad Class: <strong>{user.gradYear}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
            TEACHING: {user.teachSkills.map(s => s.name).join(', ') || 'None'}
          </div>
          <div style={{ backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
            LEARNING: {user.learnSkills.map(s => s.name).join(', ') || 'None'}
          </div>
        </div>
      </div>

      {/* Directory Filter Toolbar */}
      <div className="glass-panel" style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        
        {/* Search & Major Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '1rem',
          alignItems: 'center'
        }} className="menu-toolbar-row">
          
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search peers by name, major, bio, or skills (e.g. Python, Figma)..."
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
            <GraduationCap size={18} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="form-control"
              style={{
                height: '46px',
                borderRadius: '30px',
                padding: '0 1rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              id="major-select"
            >
              <option value="All">All Majors</option>
              {majors.filter(m => m !== 'All').map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-color)' }}></div>

        {/* Matching Segments Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginRight: '0.5rem', letterSpacing: '0.05em' }}>
            Filter Matches:
          </span>
          <button
            onClick={() => setActiveTab('all')}
            className={`btn ${activeTab === 'all' ? 'btn-secondary-filled' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '20px' }}
          >
            <Compass size={14} />
            All Directory ({peers.length})
          </button>
          
          <button
            onClick={() => setActiveTab('perfect')}
            className={`btn ${activeTab === 'perfect' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              border: activeTab === 'perfect' ? 'none' : '1px solid var(--border-color)', 
              padding: '0.4rem 1rem', 
              fontSize: '0.8rem', 
              borderRadius: '20px',
              boxShadow: activeTab === 'perfect' ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <Sparkles size={14} />
            Perfect Swaps ({peers.filter(p => getMutualMatch(p).isMutual).length})
          </button>

          <button
            onClick={() => setActiveTab('mentors')}
            className={`btn ${activeTab === 'mentors' ? 'btn-secondary-filled' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '20px' }}
          >
            <Award size={14} />
            Mentors For You ({peers.filter(p => isMentor(p) && !getMutualMatch(p).isMutual).length})
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`btn ${activeTab === 'students' ? 'btn-secondary-filled' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '20px' }}
          >
            <GraduationCap size={14} />
            Students For You ({peers.filter(p => isStudent(p) && !getMutualMatch(p).isMutual).length})
          </button>
        </div>

      </div>

      {/* Peers Matches Grid */}
      <div style={{ marginTop: '0.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Analyzing campus skill directories and scoring matches...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--danger)' }}>
            {error}
          </div>
        ) : filteredPeers.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <HelpCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.7 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Compatible Match Found</h3>
            <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
              Try adjusting your search queries, removing major filters, or updating your desired/offered skills under <strong>Settings</strong> to find more matches!
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredPeers.map(peer => {
              const mutualInfo = getMutualMatch(peer);
              return (
                <motion.div
                  key={peer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="food-card"
                  style={{
                    border: mutualInfo.isMutual ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    boxShadow: mutualInfo.isMutual ? '0 10px 20px rgba(99, 102, 241, 0.12)' : 'var(--shadow-sm)'
                  }}
                >
                  {/* Glowing Mutual Match Badge */}
                  {mutualInfo.isMutual && (
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                      color: 'white',
                      boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Sparkles size={12} />
                      MUTUAL SWAP
                    </div>
                  )}

                  {/* Glowing Expert Mentor Badge */}
                  {peer.isExpert && (
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
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      ⭐ EXPERT MENTOR
                    </div>
                  )}

                  {/* Profile Header Block */}
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
                      {peer.avatar}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{peer.fullName}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{peer.major}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class of {peer.gradYear}</p>
                      {peer.isExpert && peer.averageRating > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.75rem', color: '#fbbf24', fontWeight: '700' }}>
                          ★ {peer.averageRating} <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>({peer.reviewCount} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills Section */}
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
                      {peer.bio || "No biography provided by user."}
                    </p>

                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                        Can Teach:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {peer.teachSkills.map(s => {
                          const isDesired = user.learnSkills.some(ls => ls.name.toLowerCase() === s.name.toLowerCase());
                          return (
                            <span
                              key={s.name}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: isDesired ? 'var(--primary-glow)' : 'var(--bg-tertiary)',
                                color: isDesired ? 'var(--primary)' : 'var(--text-main)',
                                border: isDesired ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent'
                              }}
                            >
                              {s.name} <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>({s.level})</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--secondary)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                        Wants to Learn:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {peer.learnSkills.map(s => {
                          const isOffered = user.teachSkills.some(ts => ts.name.toLowerCase() === s.name.toLowerCase());
                          return (
                            <span
                              key={s.name}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: isOffered ? 'var(--secondary-glow)' : 'var(--bg-tertiary)',
                                color: isOffered ? 'var(--secondary)' : 'var(--text-main)',
                                border: isOffered ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
                              }}
                            >
                              {s.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mutual Exchange Quick Summary */}
                    {mutualInfo.isMutual && (
                      <div style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        border: '1px dashed rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '0.6rem 0.8rem',
                        fontSize: '0.75rem',
                        marginTop: 'auto',
                        color: 'var(--secondary)',
                        fontWeight: '500'
                      }}>
                        💡 Swap: Learn <strong>{mutualInfo.willLearn.join(', ')}</strong> & Teach <strong>{mutualInfo.willTeach.join(', ')}</strong>
                      </div>
                    )}

                    <div className="food-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: mutualInfo.isMutual ? '0.25rem' : 'auto' }}>
                      <button
                        onClick={() => navigate(`/profile/${peer.id}`)}
                        className="btn btn-primary"
                        style={{ width: '100%', borderRadius: '30px', fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                      >
                        View Profile
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .menu-toolbar-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
