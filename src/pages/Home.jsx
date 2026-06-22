import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen, ShieldCheck, Zap, Workflow } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}
    >
      {/* Hero Banner */}
      <section className="glass-panel" style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 2 }}>
          {/* Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Sparkles size={12} />
              AI-Driven Campus Matching
            </span>
          </div>

          <h1 style={{
            fontSize: '3rem',
            lineHeight: '1.15',
            fontWeight: '800',
            marginBottom: '1.5rem',
            letterSpacing: '-1px',
            fontFamily: 'var(--font-heading)'
          }}>
            Trade Your Skills.<br />
            Level Up with <span style={{ color: 'var(--primary)' }}>Campus Peers</span>
          </h1>
          
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            marginBottom: '2.5rem',
            lineHeight: '1.6'
          }}>
            SkillSwap is a decentralized, peer-to-peer knowledge network exclusive to university campuses. Teach what you excel at, learn what you want, and let AI build step-by-step roadmaps mapped to campus mentors.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleStart}
              className="btn btn-primary"
              style={{ padding: '0.8rem 2.25rem', fontSize: '0.95rem', borderRadius: '30px' }}
            >
              Get Started
              <ArrowRight size={18} />
            </button>
            
            <button
              onClick={() => navigate('/learning-path')}
              className="btn btn-secondary"
              style={{ padding: '0.8rem 2.25rem', fontSize: '0.95rem', borderRadius: '30px' }}
            >
              Build AI Roadmap
            </button>
          </div>
        </div>

        {/* Floating background graphic decoration */}
        <div style={{
          position: 'absolute',
          right: '-40px',
          bottom: '-40px',
          opacity: 0.08,
          pointerEvents: 'none',
          color: 'var(--primary)',
          zIndex: 1
        }} className="hero-decor-icon">
          <Workflow size={360} />
        </div>
      </section>

      {/* Platform Features Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '12px' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Verified Campus Network</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Exclusively restricted to students with institutional <strong>.edu</strong> email addresses. Share knowledge safely with your peers.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)', borderRadius: '12px' }}>
            <Zap size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Accurate Matchmaking</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Our engine identifies mutual matches ("Perfect Swaps") so you can teach each other, alongside lists of general mentors and learners.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderRadius: '12px' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>AI Learning Paths</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Input any complex learning objective, and our AI compiler creates a custom learning node tree and finds active student mentors for each node.
            </p>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>How College Skill Swap Works</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            A simple, secure, four-step loop to learn anything on campus.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              fontSize: '1.25rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>1</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.5rem' }}>Setup Profile</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Log in with your .edu email, detail your major and bio, and choose your skills.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              fontSize: '1.25rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>2</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.5rem' }}>Tag Your Skills</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Specify skills you can **Teach** (with levels) and skills you want to **Learn**.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              fontSize: '1.25rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>3</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.5rem' }}>Connect with Peers</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Discover partners, send a Swap Request, and once accepted, reveal contact handles.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              fontSize: '1.25rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>4</div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.5rem' }}>Map Learning Goals</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Input complex paths and let AI find sequential campus matches to guide your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Status Section */}
      <section className="glass-panel" style={{
        padding: '2.5rem',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)'
      }}>
        <BookOpen size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Ready to explore?</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          Log in or switch accounts using the swapper at the top to browse the directories and test connection requests instantly.
        </p>
        <button
          onClick={handleStart}
          className="btn btn-primary"
          style={{ padding: '0.75rem 2rem', borderRadius: '30px' }}
        >
          {user ? 'Enter Match Hub' : 'Sign In Now'}
        </button>
      </section>
    </motion.div>
  );
}
