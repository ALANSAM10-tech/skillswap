import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Sparkles, BookOpen, ShieldCheck, Zap, Workflow, 
  MessageSquare, GraduationCap, ChevronDown, Check, User, 
  Share2, Compass, Star, Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';

export default function Home() {
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await loginWithGoogle({ credential: credentialResponse.credential });
    if (res.success) {
      if (res.isNew) {
        navigate('/auth', { state: { isNewGoogle: true, userDraft: res.user } });
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/auth', { state: { error: res.error || 'Google sign in failed.' } });
    }
  };

  const handleGoogleError = () => {
    navigate('/auth', { state: { error: 'Google sign in failed. Please verify your internet connection or Google credentials.' } });
  };

  // State for Match Simulator
  const [teachSkill, setTeachSkill] = useState('Python');
  const [learnSkill, setLearnSkill] = useState('Figma');
  const [simulating, setSimulating] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // State for Tab App Preview
  const [activeTab, setActiveTab] = useState('dashboard');

  // State for FAQ Accordion
  const [openFaq, setOpenFaq] = useState(null);

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  // Run simulated matchmaker
  const runMatchmaker = () => {
    setSimulating(true);
    setMatchResult(null);
    setTimeout(() => {
      setSimulating(false);
      // Generate different mock students based on choices
      const mockProfiles = [
        {
          name: 'Alex Rivera',
          major: 'Cognitive Science',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80',
          teaches: learnSkill,
          learns: teachSkill,
          gradYear: 2027,
          matchScore: 98
        },
        {
          name: 'Sarah Chen',
          major: 'Computer Science & Design',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
          teaches: learnSkill,
          learns: teachSkill,
          gradYear: 2026,
          matchScore: 95
        },
        {
          name: 'Marcus Brody',
          major: 'Mechanical Engineering',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
          teaches: learnSkill,
          learns: teachSkill,
          gradYear: 2028,
          matchScore: 92
        }
      ];
      // Select random profile
      const selected = mockProfiles[Math.floor(Math.random() * mockProfiles.length)];
      setMatchResult(selected);
    }, 1200);
  };

  const faqData = [
    {
      q: "Is SkillSwap really free?",
      a: "Yes, 100% free! SkillSwap operates on a decentralized, peer-to-peer barter model. You use your own knowledge and skills as currency. No transactions, subscriptions, or fees."
    },
    {
      q: "How does the matching algorithm work?",
      a: "Our system analyzes the skills you list under 'Skills to Teach' and 'Skills to Learn'. It automatically finds 'Perfect Swaps' (students who teach what you want, and want to learn what you teach) as well as recommended mentors."
    },
    {
      q: "Do I need a university email (.edu) to register?",
      a: "To maintain campus trust and security, registration is locked to verified student email addresses from partner institutions. This ensures you are always swapping with actual campus peers."
    },
    {
      q: "What are AI Learning Paths?",
      a: "If you want to achieve a complex goal (e.g., 'Build a SaaS app'), our AI constructs a customized learning roadmap broken into sequential topics. It then links each node in the path to actual students on your campus who teach that specific topic."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '5.5rem', paddingBottom: '4rem' }}
    >
      {/* 1. Hero Section */}
      <section className="glass-panel hero-grid-pattern" style={{
        padding: '5rem 2.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.07) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(16, 185, 129, 0.03) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 2 }}>
          {/* Animated Badge Tagline */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
          >
            <span style={{
              padding: '0.35rem 1rem',
              borderRadius: '30px',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: '1px solid rgba(99, 102, 241, 0.25)'
            }}>
              <Sparkles size={12} className="animate-pulse" />
              Verified P2P Campus Exchange
            </span>
          </motion.div>

          <h1 style={{
            fontSize: '3.75rem',
            lineHeight: '1.1',
            fontWeight: '800',
            marginBottom: '1.5rem',
            letterSpacing: '-1.5px',
            fontFamily: 'var(--font-heading)'
          }}>
            Learn Anything on Campus.<br />
            No Money. <span className="hero-gradient-text">Just Skills.</span>
          </h1>
          
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            marginBottom: '2.5rem',
            lineHeight: '1.65',
            maxWidth: '680px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            SkillSwap is a secure peer-to-peer knowledge network exclusively for college students. Swap your strengths for new skills, coordinate meetings, and map your learning journey using AI roadmaps.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button
              onClick={handleStart}
              className="btn btn-primary"
              style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', borderRadius: '30px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.25)' }}
            >
              Get Started Now
              <ArrowRight size={18} />
            </button>
            
            <button
              onClick={() => navigate('/learning-path')}
              className="btn btn-secondary"
              style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', borderRadius: '30px', backgroundColor: 'var(--bg-secondary)' }}
            >
              Build AI Roadmap
            </button>
          </div>

          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '3.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>or swap instantly with</span>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="pill"
              />
            </div>
          )}
        </div>

        {/* Stats Strip */}
        <div style={{
          width: '100%',
          maxWidth: '850px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '2.5rem',
          marginTop: '1rem',
          zIndex: 2
        }}>
          <div>
            <h3 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>4,800+</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Swappers</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--secondary)', margin: 0 }}>12,400+</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills Exchanged</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#8b5cf6', margin: 0 }}>98.4%</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Match Satisfaction</p>
          </div>
        </div>

        {/* Floating background graphics */}
        <div style={{ position: 'absolute', left: '-50px', top: '10%', opacity: 0.05, pointerEvents: 'none', color: 'var(--primary)' }}>
          <Workflow size={280} />
        </div>
        <div style={{ position: 'absolute', right: '-50px', bottom: '10%', opacity: 0.05, pointerEvents: 'none', color: 'var(--secondary)' }}>
          <Compass size={280} />
        </div>
      </section>

      {/* 2. Interactive Match Simulator */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Test the Matchmaker</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Choose a skill you can teach and one you want to learn to see our algorithm run a live search!
          </p>
        </div>

        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '750px',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Teach Column */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                <Share2 size={16} className="text-primary" /> I can teach:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Python', 'Figma', 'Calculus', 'Guitar', 'Photography'].map(skill => (
                  <button 
                    key={skill}
                    onClick={() => { setTeachSkill(skill); setMatchResult(null); }}
                    className={`sim-select-btn ${teachSkill === skill ? 'active' : ''}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Learn Column */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                <GraduationCap size={16} className="text-secondary" /> I want to learn:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['React', 'Video Editing', 'Spanish', 'SQL', 'Music Production'].map(skill => (
                  <button 
                    key={skill}
                    onClick={() => { setLearnSkill(skill); setMatchResult(null); }}
                    className={`sim-select-btn ${learnSkill === skill ? 'active' : ''}`}
                    style={{
                      backgroundColor: learnSkill === skill ? 'var(--secondary)' : '',
                      borderColor: learnSkill === skill ? 'var(--secondary)' : ''
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button 
              onClick={runMatchmaker}
              disabled={simulating}
              className="btn btn-primary"
              style={{
                padding: '0.8rem 3rem',
                borderRadius: '30px',
                minWidth: '220px'
              }}
            >
              {simulating ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />
                  Searching Campus...
                </div>
              ) : (
                'Find Perfect Swap'
              )}
            </button>
          </div>

          {/* Animated Results Display */}
          <AnimatePresence mode="wait">
            {matchResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(16,185,129,0.05) 100%)',
                  border: '2px dashed var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  position: 'relative'
                }}
              >
                {/* Match Score Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'var(--success)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '20px'
                }}>
                  {matchResult.matchScore}% Match
                </div>

                <img 
                  src={matchResult.avatar} 
                  alt={matchResult.name}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--primary-glow)'
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {matchResult.name} 
                    <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>• {matchResult.major} (Class of {matchResult.gradYear})</span>
                  </h4>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Teaches: <strong className="text-secondary">{matchResult.teaches}</strong>
                    </span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--border-color)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Wants to learn: <strong className="text-primary">{matchResult.learns}</strong>
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    "Hey! I can help you with {matchResult.teaches} in exchange for some guidance in {matchResult.learns}!"
                  </p>
                </div>
                
                <button
                  onClick={handleStart}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', borderRadius: '20px' }}
                >
                  Swap Skills
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. Feature Bento Grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Why Campus SkillSwap?</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            We've combined college community trust with artificial intelligence to create a seamless learning layer.
          </p>
        </div>

        <div className="bento-grid">
          {/* Bento 1: AI Roadmap Compiler */}
          <div className="bento-card bento-card-large" style={{ minHeight: '320px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '8px' }}>
                  <Sparkles size={20} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>AI Learning Roadmap Compiler</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '500px' }}>
                Don't know where to start? Enter any complex skill objective. Our AI decomposes it into a custom step-by-step roadmap node tree and automatically links peer mentors to each node.
              </p>
              
              {/* Mini Interactive Roadmap Simulator */}
              <div className="glass-panel" style={{ padding: '1rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Preview: Python Roadmap</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>3 Mentors Available</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.8rem', fontWeight: '600', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                    <Check size={12} className="text-success" /> 1. Variables & Loops
                  </div>
                  <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.8rem', fontWeight: '600', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                    <Zap size={12} className="text-primary" /> 2. Functions & OOP
                  </div>
                  <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.8rem', fontWeight: '600', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                    <User size={12} className="text-secondary" /> 3. Flask APIs
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento 2: Verified .edu Community */}
          <div className="bento-card bento-card-small">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)', borderRadius: '8px' }}>
                  <ShieldCheck size={20} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Verified .edu Network</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Zero spam. Only verified accounts from your institution's email domain can access the directory, providing safety and direct accountability.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
                <Lock size={14} /> Domain Locked
              </div>
            </div>
          </div>

          {/* Bento 3: Decentralized Trading */}
          <div className="bento-card bento-card-small">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', borderRadius: '8px' }}>
                  <Zap size={20} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Decentralized Barter</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                No currency or tokens are exchanged. Your capacity to teach acts as the only transactional value, bringing mutual learning back to its pure form.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', color: 'var(--warning)', fontSize: '0.8rem', fontWeight: '600' }}>
                <Star size={14} /> Rep-Based Reviewing
              </div>
            </div>
          </div>

          {/* Bento 4: Interactive Mentorship & Chat */}
          <div className="bento-card bento-card-large" style={{ minHeight: '320px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderRadius: '8px' }}>
                  <MessageSquare size={20} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Integrated Messages & Sessions</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '500px' }}>
                Connect directly with our integrated chat. Propose a skill swap request, text in real-time, coordinate local campus meetups, and leave reviews to build your mentorship rating.
              </p>
              
              {/* Mock Chat Snippet */}
              <div className="glass-panel" style={{ padding: '1rem', marginTop: 'auto', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: '700' }}>JD</div>
                  <div style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem', borderRadius: '15px', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                    I can show you how to use CSS Grid tomorrow if we can practice Spanish!
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <div style={{ backgroundColor: 'var(--primary)', padding: '0.5rem 0.75rem', borderRadius: '15px', fontSize: '0.8rem', color: 'white' }}>
                    Deal! Let's meet at the library study room B at 2 PM.
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: '700' }}>ME</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Tabbed App Preview */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Peek Inside the App</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Take a look at the dashboard and toolsets waiting for you inside the verified platform.
          </p>
        </div>

        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '850px',
          padding: '0',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border-color)'
        }}>
          {/* Tab Selector */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', padding: '0 1rem' }}>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`tab-preview-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              Peers Directory
            </button>
            <button 
              onClick={() => setActiveTab('roadmap')}
              className={`tab-preview-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
            >
              AI Learning Paths
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`tab-preview-btn ${activeTab === 'chat' ? 'active' : ''}`}
            >
              Active Swap Chats
            </button>
          </div>

          {/* Tab Content Display */}
          <div style={{ padding: '2.5rem', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Active Campus Peers</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing 3 recommendations</span>
                  </div>
                  
                  {/* Mock User List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { name: 'Chloe Miller', major: 'Graphic Design', teach: 'Figma & UI Design', learn: 'Javascript', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80' },
                      { name: 'Dave Patel', major: 'Electrical Engineering', teach: 'Arduino & C++', learn: 'Python Basics', rating: 4.8, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&h=80&q=80' },
                      { name: 'Sofia Rodriguez', major: 'Economics', teach: 'Data Analysis & SQL', learn: 'Photography', rating: 4.7, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80' }
                    ].map((p, idx) => (
                      <div key={idx} className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                        <img src={p.avatar} alt={p.name} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>{p.name} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>• {p.major}</span></h5>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>Teach: <strong className="text-secondary">{p.teach}</strong></span>
                            <span>Learn: <strong className="text-primary">{p.learn}</strong></span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontSize: '0.85rem', fontWeight: '700', marginRight: '1rem' }}>
                          <Star size={14} fill="var(--warning)" /> {p.rating}
                        </div>
                        <button onClick={handleStart} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '20px' }}>
                          View Swap
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'roadmap' && (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>AI Roadmaps Interface</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Goal: Learn Fullstack Development</p>
                    </div>
                    <button onClick={() => navigate('/learning-path')} className="btn btn-primary" style={{ padding: '0.4rem 1.25rem', fontSize: '0.8rem', borderRadius: '20px' }}>
                      Create Path
                    </button>
                  </div>
                  
                  {/* Mock Node Tree */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '2rem' }}>
                    <div style={{ position: 'absolute', left: '11px', top: '15px', bottom: '15px', width: '2px', backgroundColor: 'var(--border-color)', borderStyle: 'dashed' }} />
                    
                    {[
                      { node: 'Phase 1: React & UI Basics', desc: 'Setup elements and component hooks', mentor: 'Chloe Miller (Graphic Design)' },
                      { node: 'Phase 2: Node.js Server Architecture', desc: 'Create REST endpoints and middleware', mentor: 'Sarah Chen (Computer Science)' },
                      { node: 'Phase 3: Database Integration', desc: 'Configure SQLite connections and storage', mentor: 'Sofia Rodriguez (Economics)' }
                    ].map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? 'var(--success)' : 'var(--bg-secondary)',
                          border: `2px solid ${idx === 0 ? 'var(--success)' : 'var(--primary)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          color: idx === 0 ? 'white' : 'var(--primary)',
                          position: 'relative',
                          zIndex: 2,
                          flexShrink: 0
                        }}>
                          {idx === 0 ? <Check size={12} /> : idx + 1}
                        </div>
                        <div className="glass-panel" style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', marginTop: '-0.25rem' }}>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>{step.node}</h5>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '0.5rem' }}>{step.desc}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mentor: <strong>{step.mentor}</strong></span>
                            <button onClick={handleStart} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '15px' }}>
                              Request Mentorship
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Active Conversation with Chloe</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>● Online</span>
                  </div>
                  
                  {/* Mock Message View */}
                  <div className="glass-panel" style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '220px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&h=60&q=80" alt="Chloe" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.6rem 1rem', borderRadius: '18px', fontSize: '0.85rem', color: 'var(--text-main)', maxWidth: '75%' }}>
                        I'd love to help you build some Figma prototypes for your product! Let's arrange a time.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <div style={{ backgroundColor: 'var(--primary)', padding: '0.6rem 1rem', borderRadius: '18px', fontSize: '0.85rem', color: 'white', maxWidth: '75%' }}>
                        That would be awesome! I can walk you through Javascript React components on Wednesday.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: 'auto' }}>
                      <input type="text" placeholder="Type a message..." className="form-control" style={{ borderRadius: '20px', padding: '0.5rem 1rem', flex: 1 }} disabled />
                      <button onClick={handleStart} className="btn btn-primary" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Four Simple Steps</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Getting connected and exchanging skills is straightforward.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          {[
            { step: '1', title: 'Verify & Sign In', desc: 'Securely authenticate using your institutional student account to access the directory.' },
            { step: '2', title: 'List Your Skills', desc: 'Specify skills you teach (strengths) and skills you want to learn (objectives).' },
            { step: '3', title: 'Request Swap', desc: 'Review matching profiles on campus, send connection requests, and unlock communication.' },
            { step: '4', title: 'Meet & Learn', desc: 'Arrange local face-to-face sessions, trade insights, and build campus reputation.' }
          ].map((item, idx) => (
            <div key={idx} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-glow)',
                color: 'var(--primary)',
                fontSize: '1.5rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>{item.step}</div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>{item.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '240px' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Student Success Stories</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Hear from college swappers who traded knowledge to build projects.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              name: 'Liam Reynolds',
              role: 'Computer Engineering Major',
              quote: "I needed guidance on UI/UX mockups for my startup app. Swapped 3 Python lessons for 3 design review sessions with a graphic design major. Absolute game changer!",
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
              rating: 5
            },
            {
              name: 'Elena Rostova',
              role: 'Marketing Junior',
              quote: "The AI Learning Path plotted out what I needed to master SQL. Found a peer in Economics who walked me through joins in exchange for French conversation prep.",
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
              rating: 5
            },
            {
              name: 'Tyler Vance',
              role: 'Biology Senior',
              quote: "Wanted to learn video editing for my YouTube channel. Hooked up with a media major who wanted biology tutoring. Great community of helpful students.",
              avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80',
              rating: 5
            }
          ].map((t, idx) => (
            <div key={idx} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '0.25rem', color: 'var(--warning)' }}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="var(--warning)" />
                ))}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', fontStyle: 'italic' }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <img src={t.avatar} alt={t.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0 }}>{t.name}</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '750px', width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Everything you need to know about SkillSwap.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqData.map((faq, idx) => (
            <div key={idx} className="faq-accordion">
              <div 
                className="faq-header"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                {faq.q}
                <motion.div
                  animate={{ rotate: openFaq === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </div>
              <div className={`faq-content ${openFaq === idx ? 'open' : ''}`}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Call to Action (CTA) Banner */}
      <section className="glass-panel" style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
        border: 'none',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <BookOpen size={48} style={{ color: 'white', opacity: 0.9, marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '1rem', letterSpacing: '-1px' }}>
            Ready to Swap Your Strengths?
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.85, marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Join thousands of students trading skills daily. Create your free profile and connect with peer mentors today.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleStart}
              className="btn"
              style={{
                backgroundColor: 'white',
                color: 'var(--primary)',
                padding: '0.85rem 2.5rem',
                fontSize: '1rem',
                borderRadius: '30px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }}
            >
              {user ? 'Enter Hub' : 'Register with .edu'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', left: '-50px', bottom: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      </section>
    </motion.div>
  );
}
