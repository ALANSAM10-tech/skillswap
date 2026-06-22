import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, Check, X, Clock, Copy } from 'lucide-react';

export default function SwapRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending'
  const [copiedField, setCopiedField] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Load swaps
  const loadSwaps = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/swaps?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch connection requests.');
      const data = await res.json();
      setSwaps(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading inbox.');
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (user) {
      fetch(`/api/swaps?userId=${user.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch connection requests.');
          return res.json();
        })
        .then(data => {
          if (active) {
            setSwaps(data);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error(err);
          if (active) {
            setError(err.message || 'Error loading inbox.');
            setLoading(false);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [user]);

  if (!user) return null;

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`/api/swaps/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadSwaps();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update connection.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    }
  };

  const copyToClipboard = (text, label, id) => {
    navigator.clipboard.writeText(text);
    setCopiedField(`${label}-${id}`);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Group swaps
  const activeSwaps = swaps.filter(s => s.status === 'ACCEPTED');
  
  // Pending swaps divided into received vs sent
  const receivedRequests = swaps.filter(s => s.receiverId === user.id && s.status === 'PENDING');
  const sentRequests = swaps.filter(s => s.senderId === user.id && s.status === 'PENDING');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Your Connection Hub</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Review pending trade requests, approve matches, and coordinate sessions with active partners.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderRadius: '50px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '0.35rem',
        border: '1px solid var(--border-color)',
        alignSelf: 'flex-start'
      }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '0.5rem 1.5rem',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'active' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'active' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: '600',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            transition: 'var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          Active Connections ({activeSwaps.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '0.5rem 1.5rem',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'pending' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'pending' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: '600',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            transition: 'var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          Pending Requests ({receivedRequests.length + sentRequests.length})
        </button>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div style={{ backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      {/* LOADING INDICATOR */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>Loading connection logs...</div>
      ) : (
        <div>
          {/* TAB 1: ACTIVE SWAPS */}
          {activeTab === 'active' && (
            <div>
              {activeSwaps.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                  <MessageSquare size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.7 }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Active Swaps</h3>
                  <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                    You haven't established any mutual trading connections yet. Check your matches, send a request, or accept one to get started!
                  </p>
                  <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '30px' }}>
                    Find Peers to Swap
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  {activeSwaps.map(swap => {
                    // Partner is whoever is NOT the current logged-in user
                    const isSender = swap.senderId === user.id;
                    const partner = isSender ? swap.receiver : swap.sender;
                    
                    if (!partner) return null;

                    // Figure out matching swap skills details
                    const partnerTeach = partner.teachSkills?.map(s => s.name) || [];
                    const partnerLearn = partner.learnSkills || [];
                    const userTeach = user.teachSkills.map(s => s.name);
                    const userLearn = user.learnSkills;

                    const learningSkills = partnerTeach.filter(s => userLearn.some(ls => ls.name.toLowerCase() === s.toLowerCase()));
                    const teachingSkills = userTeach.filter(s => partnerLearn.some(pls => pls.name.toLowerCase() === s.toLowerCase()));

                    return (
                      <motion.div
                        key={swap.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr auto',
                          gap: '1.5rem',
                          alignItems: 'center',
                          borderLeft: '4px solid var(--secondary)',
                          backgroundColor: 'var(--bg-secondary)'
                        }}
                        className="active-swap-card"
                      >
                        {/* Profile Avatar */}
                        <div style={{
                          fontSize: '2.5rem',
                          width: '65px',
                          height: '65px',
                          backgroundColor: 'var(--bg-tertiary)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid var(--border-color)'
                        }}>
                          {partner.avatar}
                        </div>

                        {/* Middle info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{partner.fullName}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{partner.major}</p>
                          </div>
                          
                          {/* Swap Details */}
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                            <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                              📖 You Learn: {learningSkills.join(', ') || 'Various'}
                            </div>
                            <div style={{ backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                              🎓 You Teach: {teachingSkills.join(', ') || 'Various'}
                            </div>
                          </div>
                        </div>

                        {/* Contact Widget column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '220px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                            Contact Coordinates:
                          </span>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {partner.contactInfo?.discord && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                                <span style={{ fontWeight: '500' }}>{partner.contactInfo.discord}</span>
                                <button 
                                  onClick={() => copyToClipboard(partner.contactInfo.discord, 'discord', swap.id)}
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.15rem', border: 'none', borderRadius: '4px' }}
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            )}

                            {partner.contactInfo?.whatsapp && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                                <span style={{ fontWeight: '500' }}>{partner.contactInfo.whatsapp}</span>
                                <button 
                                  onClick={() => copyToClipboard(partner.contactInfo.whatsapp, 'whatsapp', swap.id)}
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.15rem', border: 'none', borderRadius: '4px' }}
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            )}

                            {partner.contactInfo?.email && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                                <span style={{ fontWeight: '500', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{partner.contactInfo.email}</span>
                                <button 
                                  onClick={() => copyToClipboard(partner.contactInfo.email, 'email', swap.id)}
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.15rem', border: 'none', borderRadius: '4px' }}
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                          {copiedField?.endsWith(swap.id) && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: '700', textAlign: 'right' }}>
                              ✓ Copied {copiedField.split('-')[0]} handle!
                            </span>
                          )}
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING REQUESTS */}
          {activeTab === 'pending' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
              
              {/* Received Requests */}
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Received Requests ({receivedRequests.length})
                </h3>
                
                {receivedRequests.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    No incoming requests pending.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {receivedRequests.map(req => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-panel"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr auto',
                          gap: '1.5rem',
                          alignItems: 'center',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)'
                        }}
                        className="pending-received-card"
                      >
                        <div style={{ fontSize: '2.25rem', width: '55px', height: '55px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '1px solid var(--border-color)' }}>
                          {req.sender?.avatar}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{req.sender?.fullName} ({req.sender?.major})</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', margin: '0.4rem 0', borderLeft: '2px solid var(--primary)', paddingLeft: '0.5rem' }}>
                            "{req.message}"
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Sent: {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                            className="btn btn-teal"
                            style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem' }}
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'DECLINED')}
                            className="btn btn-danger"
                            style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem' }}
                          >
                            <X size={14} /> Decline
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
                  Sent Requests ({sentRequests.length})
                </h3>

                {sentRequests.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    No outgoing requests pending.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sentRequests.map(req => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-panel"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '1.75rem' }}>{req.receiver?.avatar}</span>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{req.receiver?.fullName}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Requested to learn: {req.receiver?.major}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', backgroundColor: 'var(--warning-glow)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
                          <Clock size={12} className="animate-pulse" />
                          <span>Pending Approval</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .active-swap-card {
            grid-template-columns: 1fr !important;
            text-align: center !important;
            justify-items: center !important;
          }
          .pending-received-card {
            grid-template-columns: 1fr !important;
            text-align: center !important;
            justify-items: center !important;
          }
        }
      `}</style>

    </div>
  );
}
