import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { Settings as SettingsIcon, Sun, Moon, CheckCircle, ShieldAlert } from 'lucide-react';

const AVATARS = ['🎓', '🎨', '✨', '📸', '⚙️', '🌍', '🎬', '📊', '🛠️', '💻', '💡', '✍️'];
const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Expert'];

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { preferences, toggleTheme } = usePreferences();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [major, setMajor] = useState(user?.major || '');
  const [gradYear, setGradYear] = useState(user?.gradYear || '2027');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '🎓');
  const [isExpert, setIsExpert] = useState(user?.isExpert || false);
  const [availability, setAvailability] = useState(user?.availability || '');
  
  // Contact Info State
  const [discord, setDiscord] = useState(user?.contactInfo?.discord || '');
  const [whatsapp, setWhatsapp] = useState(user?.contactInfo?.whatsapp || '');
  const [email, setEmail] = useState(user?.contactInfo?.email || user?.email || '');

  // Skills State
  const [teachSkills, setTeachSkills] = useState(user?.teachSkills || []); // Array of { name, level }
  const [learnSkills, setLearnSkills] = useState(user?.learnSkills || []); // Array of { name, level }
  const [skillsTaxonomy, setSkillsTaxonomy] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [customSkillType, setCustomSkillType] = useState('teach');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load User Data & Taxonomy
  useEffect(() => {
    if (!user) return;
    
    Promise.resolve().then(() => {
      setFullName(user.fullName || '');
      setMajor(user.major || '');
      setGradYear(user.gradYear || '2027');
      setBio(user.bio || '');
      setAvatar(user.avatar || '🎓');
      setDiscord(user.contactInfo?.discord || '');
      setWhatsapp(user.contactInfo?.whatsapp || '');
      setEmail(user.contactInfo?.email || user.email || '');
      setTeachSkills(user.teachSkills || []);
      setLearnSkills(user.learnSkills || []);
      setIsExpert(user.isExpert || false);
      setAvailability(user.availability || '');
    });

    fetch('/api/skills')
      .then(res => res.json())
      .then(data => setSkillsTaxonomy(data))
      .catch(err => console.error('Error fetching skills taxonomy in settings:', err));
  }, [user]);

  if (!user) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    const updatedData = {
      fullName,
      major,
      gradYear,
      bio,
      avatar,
      teachSkills,
      learnSkills,
      isExpert,
      availability: availability.trim(),
      contactInfo: {
        discord: discord.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim().toLowerCase()
      }
    };

    const res = await updateProfile(updatedData);
    setSaving(false);

    if (res.success) {
      setMessage('Profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMessage(''), 3000);
    } else {
      setError(res.error || 'Failed to update profile.');
    }
  };

  const toggleTeachSkill = (skill) => {
    const exists = teachSkills.find(s => s.name === skill);
    if (exists) {
      setTeachSkills(teachSkills.filter(s => s.name !== skill));
    } else {
      setTeachSkills([...teachSkills, { name: skill, level: 'Intermediate' }]);
    }
  };

  const handleLevelChange = (skillName, level) => {
    setTeachSkills(teachSkills.map(s => 
      s.name === skillName ? { ...s, level } : s
    ));
  };

  const toggleLearnSkill = (skill) => {
    const exists = learnSkills.find(s => s.name === skill);
    if (exists) {
      setLearnSkills(learnSkills.filter(s => s.name !== skill));
    } else {
      setLearnSkills([...learnSkills, { name: skill, level: 'Beginner' }]);
    }
  };

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
      setError('Connection failure adding custom skill.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <SettingsIcon size={28} style={{ color: 'var(--primary)' }} />
          Account & Profile Settings
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Customize your matching preferences, update your campus skills, and edit your contact coordinates.
        </p>
      </div>

      {/* Notifications */}
      {message && (
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
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'var(--danger-glow)',
          color: 'var(--danger)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-panel" style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        padding: '2rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        
        {/* Theme Preference */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Theme Preference</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Switch between Light and Dark interface modes.
            </p>
          </div>
          
          <button
            onClick={toggleTheme}
            className="btn btn-secondary-filled"
            style={{
              padding: '0.6rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              borderRadius: '30px'
            }}
          >
            {preferences.theme === 'dark' ? (
              <>
                <Sun size={18} style={{ color: 'var(--warning)' }} />
                Light Mode
              </>
            ) : (
              <>
                <Moon size={18} style={{ color: 'var(--text-main)' }} />
                Dark Mode
              </>
            )}
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)' }}></div>

        {/* Expert Mentor Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Become an Expert Mentor</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Unlock scheduling controls to offer workshops and office hours on campus.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsExpert(!isExpert)}
            className={`btn ${isExpert ? 'btn-primary' : 'btn-secondary-filled'}`}
            style={{
              padding: '0.6rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              borderRadius: '30px',
              border: 'none',
              boxShadow: isExpert ? '0 0 12px rgba(245, 158, 11, 0.3)' : 'none',
              background: isExpert ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--bg-tertiary)',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {isExpert ? "⭐ Verified Expert Active" : "Enable Expert Status"}
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)' }}></div>

        {/* PROFILE EDIT FORM */}
        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Academic & Bio */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>1. Basic Profile</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="settings-split-row">
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Campus Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  className="form-control"
                  value={email}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem' }} className="settings-split-row">
              <div className="form-group">
                <label className="form-label">Major <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grad Year <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select
                  className="form-control"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio (Introduce Yourself)</label>
              <textarea
                className="form-control"
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Avatar Emoji</label>
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
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)' }}></div>

          {/* Section 2: Contact Coordinates & Availability */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.25rem' }}>2. Contact Details & Weekly Availability</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              These coordinates will only be visible to peers whose swap requests you have accepted.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="settings-split-row">
              <div className="form-group">
                <label className="form-label">Discord Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. username#1234 or username"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. +1-555-0100"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="form-label">Weekly Availability</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mon/Wed 2:00 PM - 5:00 PM, Fridays 10:00 AM - 1:00 PM"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Specifying your availability helps peers coordinate swap requests and schedules.
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)' }}></div>

          {/* Section 3: Skill Tags */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem' }}>3. Skills Management</h3>
            
            {/* Teach Skills */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ color: 'var(--primary)', fontWeight: '700' }}>Skills You Can Teach</label>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', marginBottom: '1rem', marginTop: '0.5rem' }}>
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

              {/* Levels controls */}
              {teachSkills.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Adjust teaching proficiencies:</span>
                  {teachSkills.map(ts => (
                    <div key={ts.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{ts.name}</span>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {PROFICIENCY_LEVELS.map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleLevelChange(ts.name, lvl)}
                            style={{
                              padding: '0.15rem 0.4rem',
                              fontSize: '0.7rem',
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
              )}
            </div>

            {/* Learn Skills */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ color: 'var(--secondary)', fontWeight: '700' }}>Skills You Want to Learn</label>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', marginBottom: '1rem', marginTop: '0.5rem' }}>
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
            </div>

            {/* Add Custom Skill Option */}
            <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Can't find a skill in catalog? Suggest a new one</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Next.js, Chess, Public Speaking..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ maxWidth: '120px' }}
                  value={customSkillType}
                  onChange={(e) => setCustomSkillType(e.target.value)}
                >
                  <option value="teach">Teach</option>
                  <option value="learn">Learn</option>
                </select>
                <button
                  onClick={handleAddCustomSkill}
                  className="btn btn-secondary-filled"
                  style={{ padding: '0 1.25rem', borderRadius: 'var(--radius-sm)' }}
                >
                  Add
                </button>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '30px', padding: '0.8rem', fontSize: '0.95rem' }}
            >
              {saving ? 'Saving changes...' : 'Save Profile Settings'}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .settings-split-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
