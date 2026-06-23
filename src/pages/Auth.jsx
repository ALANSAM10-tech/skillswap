import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const AVATARS = ['🎓', '🎨', '✨', '📸', '⚙️', '🌍', '🎬', '📊', '🛠️', '💻', '💡', '✍️'];
const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Expert'];

export default function Auth() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');

  // Registration Multi-step Form State
  const [step, setStep] = useState(1);
  const [regEmail, setRegEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('2027');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('🎓');
  
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

    if (!loginEmail.toLowerCase().endsWith('.edu')) {
      setError('Only institutional .edu email addresses are permitted.');
      setLoading(false);
      return;
    }

    const res = await login(loginEmail.trim());
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Login failed. Make sure you entered a registered email.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!regEmail.toLowerCase().endsWith('.edu')) {
      setError('Only institutional .edu email addresses are permitted.');
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
      contactInfo: {
        discord: '',
        whatsapp: '',
        email: regEmail.trim().toLowerCase()
      }
    };

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
          onClick={() => { setIsLoginTab(true); setError(''); setSuccess(''); }}
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
          onClick={() => { setIsLoginTab(false); setError(''); setSuccess(''); }}
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
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel"
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter your registered campus email to sign in.</p>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-login">Campus Email (.edu)</label>
              <input
                id="email-login"
                type="email"
                required
                className="form-control"
                placeholder="e.g. student@university.edu"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '30px', marginTop: '0.5rem' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Note: Testing accounts? You can switch profiles instantly using the <strong>Swap User</strong> dropdown at the top navigation once you enter the Match Hub!
            </p>
          </div>
        </motion.div>
      ) : (
        /* REGISTER VIEW */
        <motion.div
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
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Only institutional .edu emails are permitted.</p>
              </div>

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
                  className="form-control"
                  placeholder="e.g. student@university.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

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
                  if (!regEmail.toLowerCase().endsWith('.edu')) {
                    setError('Verification failed: Email must end in .edu');
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
    </div>
  );
}
