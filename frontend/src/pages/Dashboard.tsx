import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import PassionBackground from '../components/backgrounds/PassionBackground';
import SessionForm from '../components/session/SessionForm';
import SessionCard from '../components/session/SessionCard';
import StatsPanel from '../components/dashboard/StatsPanel';
import AIInsightPanel from '../components/dashboard/AIInsightPanel';
import JournalView from '../components/dashboard/JournalView';
import '../styles/globals.css';

const PASSION_LABELS: Record<string, { title: string; emoji: string; tagline: string }> = {
  photography: { title: 'Photographer', emoji: '📸', tagline: 'Every frame tells your story' },
  art: { title: 'Artist', emoji: '🎨', tagline: 'Your canvas, your rules' },
  dancing: { title: 'Dancer', emoji: '💃', tagline: 'Let the music move your soul' },
  writing: { title: 'Writer', emoji: '✍️', tagline: 'Words are your superpower' },
  music: { title: 'Musician', emoji: '🎵', tagline: 'Feel every beat of life' }
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'log', label: 'Log Session', icon: '➕' },
  { id: 'journal', label: 'Journal', icon: '📖' },
  { id: 'insights', label: 'AI Insights', icon: '🧠' },
  { id: 'stats', label: 'Stats', icon: '📊' }
];

const Dashboard: React.FC = () => {
  const { user, sessions, fetchSessions, logout } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [scrollY, setScrollY] = useState(0);
  const [showLogForm, setShowLogForm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchSessions();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  const passion = user.passion || 'photography';
  const passionInfo = PASSION_LABELS[passion];
  const recentSessions = sessions.slice(0, 3);
  const burnoutRisk = sessions.length > 3
    ? sessions.slice(0, 5).filter(s => s.burnoutRisk === 'high').length > 2 ? 'high'
      : sessions.slice(0, 5).filter(s => s.burnoutRisk === 'medium').length > 2 ? 'medium' : 'low'
    : 'low';

  const scrollDepth = Math.min(scrollY / 800, 1);

  return (
    <div data-passion={passion} style={{ minHeight: '100vh', position: 'relative' }}>
      <PassionBackground passion={passion} scrollY={scrollY} />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Scroll depth fog */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(to bottom, transparent 30%, rgba(0,0,0,${scrollDepth * 0.4}) 100%)`
      }} />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 30px',
          background: `rgba(${passion === 'music' ? '10,26,10' : passion === 'art' ? '26,10,10' : '10,10,26'},${0.7 + scrollDepth * 0.2})`,
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--passion-border)',
          transition: 'background 0.3s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>{passionInfo.emoji}</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--passion-accent)' }}>
              PassionKeep
            </div>
            <div style={{ fontSize: 11, color: 'var(--passion-muted)' }}>{passionInfo.tagline}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: activeTab === item.id ? 'var(--passion-accent)' : 'transparent',
                border: activeTab === item.id ? 'none' : '1px solid var(--passion-border)',
                borderRadius: 50, padding: '6px 14px',
                color: activeTab === item.id ? 'var(--passion-primary)' : 'var(--passion-muted)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-body)', transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', gap: 5
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{ display: window.innerWidth < 768 ? 'none' : 'inline' }}>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--passion-text)' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--passion-accent)', textTransform: 'capitalize' }}>{passionInfo.title}</div>
          </div>
          <button
            onClick={logout}
            style={{ background: 'transparent', border: '1px solid var(--passion-border)', borderRadius: 8, padding: '6px 12px', color: 'var(--passion-muted)', cursor: 'pointer', fontSize: 12 }}
          >
            Logout
          </button>
        </div>
      </motion.nav>

      {/* Main content */}
      <div style={{ paddingTop: 80, position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Hero section */}
              <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '60px 40px 40px' }}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{ maxWidth: 700 }}
                >
                  <div style={{ fontSize: 14, color: 'var(--passion-accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
                    Welcome back
                  </div>
                  <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(36px, 6vw, 72px)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    marginBottom: 20
                  }}>
                    Hey, <span style={{ color: 'var(--passion-accent)' }}>{user.name}</span>.<br />
                    How's your {passionInfo.title.toLowerCase()} journey today?
                  </h1>
                  <p style={{ color: 'var(--passion-muted)', fontSize: 18, lineHeight: 1.6, marginBottom: 40 }}>
                    You've logged <strong style={{ color: 'var(--passion-accent)' }}>{user.stats?.totalSessions || 0}</strong> sessions.
                    {user.stats?.avgJoy ? ` Your average joy score is ${user.stats.avgJoy}/10.` : ' Start logging to see your patterns.'}
                  </p>

                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary"
                      onClick={() => setShowLogForm(true)}
                      style={{ fontSize: 16, padding: '16px 40px' }}
                    >
                      ✨ Log Today's Session
                    </motion.button>
                    <button className="btn-ghost" onClick={() => setActiveTab('insights')}>
                      🧠 Get AI Insights
                    </button>
                  </div>
                </motion.div>

                {/* Quick stats */}
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginTop: 60, maxWidth: 900 }}
                >
                  {[
                    { label: 'Total Sessions', value: user.stats?.totalSessions || 0, icon: '📝', suffix: '' },
                    { label: 'Avg Joy', value: user.stats?.avgJoy || '--', icon: '😊', suffix: '/10' },
                    { label: 'Avg Stress', value: user.stats?.avgStress || '--', icon: '😤', suffix: '/10' },
                    { label: 'Burnout Risk', value: burnoutRisk, icon: burnoutRisk === 'high' ? '🔴' : burnoutRisk === 'medium' ? '🟡' : '🟢', suffix: '' }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      className="glass-card"
                      style={{ padding: 24 }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--passion-accent)', fontFamily: 'var(--font-display)' }}>
                        {stat.value}{stat.suffix}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--passion-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', color: 'var(--passion-muted)', fontSize: 12, textAlign: 'center' }}
                >
                  <div>Scroll to explore deeper</div>
                  <div style={{ fontSize: 20, marginTop: 4 }}>↓</div>
                </motion.div>
              </div>

              {/* Recent sessions (appears as you scroll) */}
              <div style={{ padding: '60px 40px', minHeight: '100vh' }}>
                <motion.h2
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 30 }}
                >
                  Recent Sessions
                </motion.h2>

                {recentSessions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="glass-card"
                    style={{ padding: 60, textAlign: 'center' }}
                  >
                    <div style={{ fontSize: 60, marginBottom: 20 }}>✨</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 12 }}>Your journey begins here</h3>
                    <p style={{ color: 'var(--passion-muted)', marginBottom: 24 }}>Log your first session and let PassionKeep track the joy in your journey</p>
                    <button className="btn-primary" onClick={() => setShowLogForm(true)}>Log First Session</button>
                  </motion.div>
                ) : (
                  <div style={{ display: 'grid', gap: 20 }}>
                    {recentSessions.map((s, i) => (
                      <motion.div
                        key={s._id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <SessionCard session={s} />
                      </motion.div>
                    ))}
                    {sessions.length > 3 && (
                      <button className="btn-ghost" onClick={() => setActiveTab('journal')} style={{ width: 'fit-content' }}>
                        View all {sessions.length} sessions →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Burnout awareness section */}
              <div style={{ padding: '80px 40px', background: 'rgba(0,0,0,0.3)' }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}
                >
                  <div style={{ fontSize: 60, marginBottom: 20 }}>💡</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 20 }}>
                    Remember why you started
                  </h2>
                  <p style={{ color: 'var(--passion-muted)', fontSize: 18, lineHeight: 1.8, fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
                    "When my passion merges with expectations, it stops being mine. Keep it yours."
                  </p>
                  <p style={{ color: 'var(--passion-muted)', fontSize: 14, marginTop: 12 }}>— PassionKeep Survey, 200 responses</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'log' && (
            <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '40px', maxWidth: 700, margin: '0 auto' }}>
              <SessionForm onClose={() => setActiveTab('overview')} />
            </motion.div>
          )}

          {activeTab === 'journal' && (
            <motion.div key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '40px' }}>
              <JournalView />
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
              <AIInsightPanel />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '40px' }}>
              <StatsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating log button */}
      <AnimatePresence>
        {activeTab === 'overview' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setActiveTab('log')}
            style={{
              position: 'fixed', bottom: 70, right: 20, zIndex: 40,
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--passion-accent), var(--passion-accent2, var(--passion-accent)))',
              border: 'none', cursor: 'pointer', fontSize: 24,
              boxShadow: '0 8px 30px var(--passion-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ➕
          </motion.button>
        )}
      </AnimatePresence>

      {/* Session form modal */}
      <AnimatePresence>
        {showLogForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}
            onClick={() => setShowLogForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <SessionForm onClose={() => setShowLogForm(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
