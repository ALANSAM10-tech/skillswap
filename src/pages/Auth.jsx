import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, CheckCircle, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const AVATARS = ['🎓', '🎨', '✨', '📸', '⚙️', '🌍', '🎬', '📊', '🛠️', '💻', '💡', '✍️'];
const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Expert'];

export default function Auth() {
  const { login, register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Traditional Sign In State
  const [loginEmail, setLoginEmail] = useState('');

  // Registration Multi-step Form State
  const [step, setStep] = useState(1);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('2027');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('🎓');
  
  // Google OAuth flow flags
  const [isGoogleOAuth, setIsGoogleOAuth] = useState(false);
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Selected Skills State
  const [teachSkills, setTeachSkills] = useState([]); // Array of { name, level }
  const [learnSkills, setLearnSkills] = useState([]); // Array of { name, level }
  const [customSkill, setCustomSkill] = useState('');
  const [customSkillType, setCustomSkillType] = useState('teach'); // 'teach' or 'learn'

  // Predefined Skills Taxonomy from Backend
  const [skillsTaxonomy, setSkillsTaxonomy] = useState([]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load Skills Taxonomy
  useEffect(() => {
    fetch('/api/skills')
      .then(res => res.json())
      .then(data => setSkillsTaxonomy(data))
      .catch(err => console.error('Error loading skills taxonomy:', err));
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(loginEmail.trim());
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'No account found with this email. Please sign up.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!regEmail.toLowerCase().endsWith('.edu') && !regEmail.toLowerCase().endsWith('@gmail.com')) {
      setError('Please use a .edu institutional email or a Gmail address.');
      setLoading(false);
      return;
    }

    if (!fullName || !major || !gradYear) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const payload = {
      email: regEmail.trim(),
      fullName: fullName.trim(),
      major: major.trim(),
      gradYear,
      bio: bio.trim(),
      avatar,
      teachSkills,
      learnSkills,
      isGoogle: isGoogleOAuth,
      contactInfo: {
        discord: '',
        whatsapp: '',
        email: regEmail.trim().toLowerCase()
      }
    };

    if (!isGoogleOAuth) {
      payload.password = regPassword;
    }

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  // Google OAuth Login Simulation
  const handleGoogleOAuthSelect = async (email, defaultName = '', defaultAvatar = '✨') => {
    setShowGooglePopup(false);
    setError('');
    setLoading(true);

    const res = await loginWithGoogle({
      email: email.trim(),
      fullName: defaultName || email.split('@')[0],
      avatar: defaultAvatar
    });

    setLoading(false);

    if (res.success) {
      if (res.isNew) {
        setIsLoginTab(false);
        setIsGoogleOAuth(true);
        setRegEmail(email);
        setFullName(defaultName || email.split('@')[0]);
        setAvatar(defaultAvatar);
        setStep(1);
        setSuccess('Google account verified! Please complete your academic details to onboard.');
        setTimeout(() => setSuccess(''), 4000);
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.error || 'Google login failed.');
    }
  };

  // Add a skill to teach
  const toggleTeachSkill = (skill) => {
    const exists = teachSkills.find(s => s.name === skill);
    if (exists) {
      setTeachSkills(teachSkills.filter(s => s.name !== skill));
    } else {
      setTeachSkills([...teachSkills, { name: skill, level: 'Intermediate' }]);
    }
  };

  // Update proficiency level for a teaching skill
  const handleLevelChange = (skillName, level) => {
    setTeachSkills(teachSkills.map(s => 
      s.name === skillName ? { ...s, level } : s
    ));
  };

  // Add a skill to learn
  const toggleLearnSkill = (skill) => {
    const exists = learnSkills.find(s => s.name === skill);
    if (exists) {
      setLearnSkills(learnSkills.filter(s => s.name !== skill));
    } else {
      setLearnSkills([...learnSkills, { name: skill, level: 'Beginner' }]);
    }
  };

  // Submit custom skill suggested by "Other" option
  const handleAddCustomSkill = async (e) => {
    e.preventDefault();
    if (!customSkill.trim()) return;

    try {
      const res = await fetch('/api/skills/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: customSkill.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setSkillsTaxonomy(data.skills);
        
        // Auto-select the newly created skill
        const skillName = customSkill.trim();
        if (customSkillType === 'teach') {
          setTeachSkills([...teachSkills, { name: skillName, level: 'Intermediate' }]);
        } else {
          setLearnSkills([...learnSkills, { name: skillName, level: 'Beginner' }]);
        }
        
        setCustomSkill('');
      } else {
        setError(data.message || 'Failed to add custom skill');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error while adding custom skill.');
    }
  };

  return (
    <div style={{ maxWidth: '550px', margin: '1.5rem auto 3rem', padding: '0 1rem' }}>
      
      {/* Tab Selectors */}
      <div style={{
        display: 'flex',
        borderRadius: '50px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '0.35rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)'
      }}>
        <button
          onClick={() => { setIsLoginTab(true); setError(''); setSuccess(''); setIsGoogleOAuth(false); }}
          style={{
            flex: 1,
            padding: '0.65rem',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            backgroundColor: isLoginTab ? 'var(--bg-secondary)' : 'transparent',
            color: isLoginTab ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: '600',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            transition: 'var(--transition-fast)'
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => { setIsLoginTab(false); setError(''); setSuccess(''); setStep(1); }}
          style={{
            flex: 1,
            padding: '0.65rem',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            backgroundColor: !isLoginTab ? 'var(--bg-secondary)' : 'transparent',
            color: !isLoginTab ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: '600',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            transition: 'var(--transition-fast)'
          }}
        >
          Register & Onboard
        </button>
      </div>

      {/* Alert Notices */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'var(--danger-glow)',
          color: 'var(--danger)',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '0.9rem'
        }}>
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'var(--success-glow)',
          color: 'var(--success)',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* LOGIN VIEW */}
      {isLoginTab ? (
        <motion.div
          key="login"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel"
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter your campus email to access your account instantly.</p>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="email-login">Email Address</label>
              <input
                id="email-login"
                type="email"
                required
                autoFocus
                className="form-control"
                placeholder="e.g. student@university.edu or name@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '30px' }}
            >
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
          </form>

          {/* Google login divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>or</span>
            <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          </div>

          <button
            type="button"
            onClick={() => setShowGooglePopup(true)}
            className="btn btn-secondary"
            style={{ width: '100%', borderRadius: '30px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.57 2.69-3.88 2.69-6.57z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.23l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.59-5.05-3.73H.95v2.3C2.43 15.89 5.5 18 9 18z" fill="#34A853"/>
              <path d="M3.95 10.67c-.18-.54-.28-1.12-.28-1.67s.1-1.13.28-1.67V5.03H.95C.35 6.22 0 7.57 0 9s.35 2.78.95 3.97l3-2.3z" fill="#FBBC05"/>
              <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.5 0 2.43 2.11.95 5.03L3.95 7.33c.71-2.14 2.7-3.75 5.05-3.75z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </motion.div>
      ) : (
        /* REGISTER VIEW */
        <motion.div
          key="register"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel"
        >
          {/* Progress Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)' }}>
              Step {step} of 3
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {step === 1 ? 'Academic Profile' : step === 2 ? 'Skills You Can Teach' : 'Skills You Want to Learn'}
            </span>
          </div>

          {/* STEP 1: Core Profile */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Create Your Profile</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Use your .edu institutional email or Gmail address.</p>
              </div>

              {!isGoogleOAuth && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowGooglePopup(true)}
                    className="btn btn-secondary"
                    style={{ width: '100%', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 18 18">
                      <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.57 2.69-3.88 2.69-6.57z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.47-.8 5.96-2.23l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.59-5.05-3.73H.95v2.3C2.43 15.89 5.5 18 9 18z" fill="#34A853"/>
                      <path d="M3.95 10.67c-.18-.54-.28-1.12-.28-1.67s.1-1.13.28-1.67V5.03H.95C.35 6.22 0 7.57 0 9s.35 2.78.95 3.97l3-2.3z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.5 0 2.43 2.11.95 5.03L3.95 7.33c.71-2.14 2.7-3.75 5.05-3.75z" fill="#EA4335"/>
                    </svg>
                    Fast Sign-Up with Google
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0 0.5rem' }}>
                    <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or register traditionally</span>
                    <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                  </div>
                </div>
              )}

              {isGoogleOAuth && (
                <div style={{ backgroundColor: 'var(--primary-glow)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1.25rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✓ Authenticated via Google (<strong>{regEmail}</strong>)</span>
                  <button type="button" onClick={() => { setIsGoogleOAuth(false); setRegEmail(''); setFullName(''); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: '700', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Campus Email (.edu)</label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  disabled={isGoogleOAuth}
                  className="form-control"
                  placeholder="e.g. student@university.edu or name@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              {!isGoogleOAuth && (
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      required
                      className="form-control"
                      placeholder="•••••••• (Min 6 characters)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-major">Major</label>
                  <input
                    id="reg-major"
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Computer Science"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-year">Grad Year</label>
                  <select
                    id="reg-year"
                    className="form-control"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                  >
                    <option value="2026">2026 (Senior)</option>
                    <option value="2027">2027 (Junior)</option>
                    <option value="2028">2028 (Sophomore)</option>
                    <option value="2029">2029 (Freshman)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-bio">Short Bio</label>
                <textarea
                  id="reg-bio"
                  className="form-control"
                  rows="3"
                  placeholder="Briefly state your campus interests, objectives, and what you're looking to gain."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pick Profile Avatar</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      style={{
                        padding: '0.5rem',
                        fontSize: '1.25rem',
                        borderRadius: '8px',
                        border: '2px solid ' + (avatar === av ? 'var(--primary)' : 'var(--border-color)'),
                        backgroundColor: avatar === av ? 'var(--primary-glow)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (!fullName || !regEmail || !major) {
                    setError('Please complete all required profile fields.');
                    return;
                  }
                  if (!regEmail.toLowerCase().endsWith('.edu') && !regEmail.toLowerCase().endsWith('@gmail.com')) {
                    setError('Please use a .edu institutional email or a Gmail address.');
                    return;
                  }
                  if (!isGoogleOAuth && (!regPassword || regPassword.length < 6)) {
                    setError('Password must be at least 6 characters long.');
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
                style={{ width: '100%', borderRadius: '30px', marginTop: '1rem' }}
              >
                Continue to Skills
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: Skills You Can Teach */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Skills You Can Teach</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>What can you share? Select tags and assign your proficiency level.</p>
              </div>

              <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skillsTaxonomy.map((skill) => {
                    const selected = teachSkills.find(s => s.name === skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleTeachSkill(skill)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          border: '1px solid ' + (selected ? 'var(--primary)' : 'var(--border-color)'),
                          backgroundColor: selected ? 'var(--primary)' : 'var(--bg-secondary)',
                          color: selected ? 'white' : 'var(--text-main)',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Teach Skills Proficiency Controls */}
              {teachSkills.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Proficiency Levels</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {teachSkills.map((ts) => (
                      <div key={ts.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{ts.name}</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {PROFICIENCY_LEVELS.map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleLevelChange(ts.name, lvl)}
                              style={{
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.75rem',
                                borderRadius: '4px',
                                border: '1px solid ' + (ts.level === lvl ? 'var(--primary)' : 'var(--border-color)'),
                                backgroundColor: ts.level === lvl ? 'var(--primary-glow)' : 'transparent',
                                color: ts.level === lvl ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Skill Input */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                <label className="form-label">Can't find a skill? Add custom</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Webflow, Chess, Baking..."
                    value={customSkill}
                    onChange={(e) => { setCustomSkill(e.target.value); setCustomSkillType('teach'); }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="btn btn-secondary-filled"
                    style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                  style={{ flex: 1, borderRadius: '30px' }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep(3)}
                  style={{ flex: 1, borderRadius: '30px' }}
                >
                  Next Step
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Skills You Want to Learn */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Skills You Want to Learn</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>What do you want to learn? Select skills you'd like peers to teach you.</p>
              </div>

              <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skillsTaxonomy.map((skill) => {
                    const selected = learnSkills.some(s => s.name === skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleLearnSkill(skill)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          border: '1px solid ' + (selected ? 'var(--secondary)' : 'var(--border-color)'),
                          backgroundColor: selected ? 'var(--secondary)' : 'var(--bg-secondary)',
                          color: selected ? 'white' : 'var(--text-main)',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Skill Input */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                <label className="form-label">Can't find a skill? Add custom</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. UI Animation, Chess, Rust..."
                    value={customSkill}
                    onChange={(e) => { setCustomSkill(e.target.value); setCustomSkillType('learn'); }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="btn btn-secondary-filled"
                    style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(2)}
                  style={{ flex: 1, borderRadius: '30px' }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleRegisterSubmit}
                  disabled={loading}
                  className="btn btn-teal"
                  style={{ flex: 1, borderRadius: '30px' }}
                >
                  {loading ? 'Creating...' : 'Finish SignUp'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* SIMULATED GOOGLE OAUTH POPUP ACCOUNT CHOOSER */}
      <AnimatePresence>
        {showGooglePopup && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel" 
              style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-secondary)', padding: '1.75rem', position: 'relative' }}
            >
              {/* Google logo header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.57 2.69-3.88 2.69-6.57z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.47-.8 5.96-2.23l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.59-5.05-3.73H.95v2.3C2.43 15.89 5.5 18 9 18z" fill="#34A853"/>
                  <path d="M3.95 10.67c-.18-.54-.28-1.12-.28-1.67s.1-1.13.28-1.67V5.03H.95C.35 6.22 0 7.57 0 9s.35 2.78.95 3.97l3-2.3z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.5 0 2.43 2.11.95 5.03L3.95 7.33c.71-2.14 2.7-3.75 5.05-3.75z" fill="#EA4335"/>
                </svg>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>Sign in with Google</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Choose a Google account to continue to SkillSwap</p>
              </div>

              {/* Email input — enter any Google account email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    Enter your Google Account email
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. guest@university.edu"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    />
                    <button
                      onClick={() => {
                        if (!customGoogleEmail.trim()) return;
                        handleGoogleOAuthSelect(customGoogleEmail.trim());
                      }}
                      className="btn btn-primary"
                      style={{ padding: '0 1rem', fontSize: '0.8rem', borderRadius: '8px' }}
                    >
                      Login
                    </button>
                  </div>
              </div>

              {/* Cancel button */}
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowGooglePopup(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 1.5rem', fontSize: '0.8rem', borderRadius: '30px' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
