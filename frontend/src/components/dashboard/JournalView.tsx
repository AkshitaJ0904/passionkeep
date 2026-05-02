import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import SessionCard from '../session/SessionCard';

const JournalView: React.FC = () => {
  const { sessions } = useStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filtered = sessions
    .filter(s => {
      if (filter === 'high-joy') return s.joyLevel >= 7;
      if (filter === 'high-stress') return s.stressLevel >= 7;
      if (filter === 'burnout-risk') return s.burnoutRisk === 'high';
      return true;
    })
    .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.reflection?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'joy-high') return b.joyLevel - a.joyLevel;
      if (sortBy === 'stress-high') return b.stressLevel - a.stressLevel;
      return 0;
    });

  // Group by month
  const grouped = filtered.reduce((acc: Record<string, any[]>, s) => {
    const key = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div>
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 8 }}>
        Your Journey
      </motion.h1>
      <p style={{ color: 'var(--passion-muted)', marginBottom: 30 }}>
        {sessions.length} sessions logged
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        <input
          className="input-field"
          placeholder="🔍 Search sessions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'high-joy', label: '😊 High Joy' },
            { id: 'high-stress', label: '😤 High Stress' },
            { id: 'burnout-risk', label: '🔴 Burnout Risk' }
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                padding: '8px 16px', borderRadius: 50, border: `1px solid ${filter === f.id ? 'var(--passion-accent)' : 'var(--passion-border)'}`,
                background: filter === f.id ? 'var(--passion-accent)' : 'transparent',
                color: filter === f.id ? 'var(--passion-primary)' : 'var(--passion-muted)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{
            background: 'var(--passion-card)', border: '1px solid var(--passion-border)',
            borderRadius: 10, color: 'var(--passion-text)', padding: '8px 14px',
            fontFamily: 'var(--font-body)', cursor: 'pointer', fontSize: 13, outline: 'none'
          }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="joy-high">Highest joy</option>
          <option value="stress-high">Highest stress</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>No sessions found</h3>
          <p style={{ color: 'var(--passion-muted)' }}>Try adjusting your filters or log a new session</p>
        </motion.div>
      ) : (
        <div>
          {Object.entries(grouped).map(([month, monthSessions], gi) => (
            <motion.div key={month} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: gi > 0 ? 36 : 0 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--passion-accent)' }}>{month}</h2>
                <div style={{ flex: 1, height: 1, background: 'var(--passion-border)' }} />
                <span style={{ fontSize: 12, color: 'var(--passion-muted)' }}>{monthSessions.length} sessions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <AnimatePresence>
                  {monthSessions.map((s, si) => (
                    <motion.div key={s._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: si * 0.03 }}>
                      <SessionCard session={s} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalView;
