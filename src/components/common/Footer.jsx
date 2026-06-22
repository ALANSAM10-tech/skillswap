import { NavLink } from 'react-router-dom';
import { HelpCircle, Shield, Sparkles, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 0 2rem',
      color: 'var(--text-muted)',
      fontSize: '0.85rem',
      transition: 'var(--transition-smooth)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              color: 'var(--text-main)',
              marginBottom: '1rem',
              fontWeight: '700'
            }}>
              Skill<span style={{ color: 'var(--primary)' }}>Swap</span>
            </h4>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
              Bridges the gap between knowledge-seeking and knowledge-sharing students on campus. Share your expertise, pick up new skills, and construct AI learning pathways with peers.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} style={{ color: 'var(--primary)' }} />
              <span>Campus Exclusive (.edu only)</span>
            </div>
          </div>
          
          <div>
            <h5 style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Discover
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><NavLink to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Match Hub</NavLink></li>
              <li><NavLink to="/learning-path" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>AI Roadmaps</NavLink></li>
              <li><NavLink to="/connections" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Your Inbox</NavLink></li>
              <li><NavLink to="/settings" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Profile Settings</NavLink></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Info
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} />
                <span>AI-Driven Goal Pathing</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} />
                <span>Standardized Skill Taxonomy</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={16} />
                <span>support@skillswap.edu</span>
              </li>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p>© {new Date().getFullYear()} SkillSwap Network. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Built exclusively for peer-to-peer college learning</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
