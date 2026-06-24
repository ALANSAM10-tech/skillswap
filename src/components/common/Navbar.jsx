import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Workflow, MessageSquare, MessageCircle, Settings, Menu, X, LogOut, RefreshCw, GraduationCap, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, switchUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  // Load all users for the Quick Profile Swapper dropdown
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setAllUsers(data))
      .catch(err => console.error('Error fetching users for nav swapper:', err));
  }, [user]); // Re-fetch to keep names sync'd if edited

  // Fetch pending swap requests to show a notification badge in Navbar
  useEffect(() => {
    if (!user) return;
    fetch(`/api/swaps?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        // Count swap requests where user is receiver AND status is PENDING
        const count = data.filter(r => r.receiverId === user.id && r.status === 'PENDING').length;
        setPendingCount(count);
      })
      .catch(err => console.error('Error fetching swaps for nav badge:', err));
  }, [user]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleProfileSwitch = async (e) => {
    const targetUserId = e.target.value;
    if (targetUserId) {
      await switchUser(targetUserId);
      navigate('/dashboard');
      closeMobileMenu();
    }
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '0.75rem 2rem',
      backgroundColor: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
        
        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }} onClick={closeMobileMenu}>
          <div style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={20} />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: '800',
            color: 'var(--text-main)',
            letterSpacing: '-0.5px'
          }}>
            Skill<span style={{ color: 'var(--primary)' }}>Swap</span>
          </span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="nav-desktop-container">
          {user ? (
            <>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <NavLink to="/dashboard" className={({ isActive }) => `btn ${isActive ? 'btn-secondary-filled' : 'btn-secondary'}`} style={{ border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={16} />
                  Match Hub
                </NavLink>

                <NavLink to="/learning-path" className={({ isActive }) => `btn ${isActive ? 'btn-secondary-filled' : 'btn-secondary'}`} style={{ border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Workflow size={16} />
                  AI Learning Path
                </NavLink>

                <NavLink to="/mentorship" className={({ isActive }) => `btn ${isActive ? 'btn-secondary-filled' : 'btn-secondary'}`} style={{ border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <GraduationCap size={16} />
                  Mentorship Hub
                </NavLink>
                
                <NavLink to="/connections" className={({ isActive }) => `btn ${isActive ? 'btn-secondary-filled' : 'btn-secondary'}`} style={{ border: 'none', padding: '0.5rem 1rem', position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={16} />
                  Connections
                  {pendingCount > 0 && (
                    <span className="animate-pulse" style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      borderRadius: '10px',
                      padding: '1px 6px',
                      marginLeft: '2px'
                    }}>
                      {pendingCount}
                    </span>
                  )}
                </NavLink>

                <NavLink to="/messages" className={({ isActive }) => `btn ${isActive ? 'btn-secondary-filled' : 'btn-secondary'}`} style={{ border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageCircle size={16} />
                  Messages
                </NavLink>

                <NavLink to="/settings" className={({ isActive }) => `btn ${isActive ? 'btn-secondary-filled' : 'btn-secondary'}`} style={{ border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Settings size={16} />
                  Settings
                </NavLink>

                <NavLink to={`/profile/${user.id}`} className={({ isActive }) => `btn ${isActive ? 'btn-secondary-filled' : 'btn-secondary'}`} style={{ border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Award size={16} style={{ color: 'var(--primary)' }} />
                  My Profile
                </NavLink>
              </div>

              {/* Demo Account Swapper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem 0.75rem', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
                <RefreshCw size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Swap User:</span>
                <select
                  value={user.id}
                  onChange={handleProfileSwitch}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    outline: 'none',
                    paddingRight: '0.5rem'
                  }}
                  id="profile-swapper"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id} style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}>
                      {u.fullName} {u.avatar && !u.avatar.startsWith('http') ? `(${u.avatar})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Profile Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <NavLink 
                  to={`/profile/${user.id}`} 
                  title="My Profile Dashboard" 
                  style={{ 
                    fontSize: '1.25rem', 
                    textDecoration: 'none', 
                    cursor: 'pointer', 
                    padding: '0.2rem', 
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Avatar src={user.avatar} size="1.2rem" />
                </NavLink>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="btn btn-secondary"
                  style={{ border: 'none', padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <NavLink to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '30px' }}>
                Sign In
              </NavLink>
            </div>
          )}

          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)' }}></div>
          
          <ThemeToggle />
        </div>

        {/* Mobile menu trigger */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }} className="nav-mobile-trigger">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary-filled"
            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Slide Down */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-md)',
          zIndex: 99
        }}>
          {user ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Logged in as:</span>
                <span style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Avatar src={user.avatar} size="1.2rem" /> {user.fullName} ({user.major})
                </span>
              </div>

              {/* Demo Account Swapper Mobile */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Switch Active Student Profile:</span>
                <select
                  value={user.id}
                  onChange={handleProfileSwitch}
                  className="form-control"
                  style={{ borderRadius: '30px' }}
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} {u.avatar && !u.avatar.startsWith('http') ? `(${u.avatar})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <NavLink to={`/profile/${user.id}`} className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary-filled'}`} style={{ justifyContent: 'flex-start' }} onClick={closeMobileMenu}>
                <Award size={16} /> My Profile
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary-filled'}`} style={{ justifyContent: 'flex-start' }} onClick={closeMobileMenu}>
                <Users size={16} /> Match Hub
              </NavLink>
              <NavLink to="/learning-path" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary-filled'}`} style={{ justifyContent: 'flex-start' }} onClick={closeMobileMenu}>
                <Workflow size={16} /> AI Learning Path
              </NavLink>
              <NavLink to="/connections" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary-filled'}`} style={{ justifyContent: 'flex-start' }} onClick={closeMobileMenu}>
                <MessageSquare size={16} /> Connections {pendingCount > 0 && `(${pendingCount} Pending)`}
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary-filled'}`} style={{ justifyContent: 'flex-start' }} onClick={closeMobileMenu}>
                <Settings size={16} /> Settings
              </NavLink>
              <button
                onClick={() => { logout(); navigate('/'); closeMobileMenu(); }}
                className="btn btn-danger"
                style={{ justifyContent: 'flex-start' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <NavLink to="/auth" className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={closeMobileMenu}>
              Sign In
            </NavLink>
          )}
        </div>
      )}

      {/* Inline styles for media query responsive selectors */}
      <style>{`
        @media (max-width: 900px) {
          .nav-desktop-container {
            display: none !important;
          }
          .nav-mobile-trigger {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
