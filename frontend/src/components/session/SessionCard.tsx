import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';

interface Props {
  session: any;
}

const MOOD_EMOJI: Record<string, string> = {
  amazing: '🤩', good: '😊', neutral: '😐', tired: '😴', frustrated: '😤'
};

const RISK_COLOR: Record<string, string> = {
  low: '#00ff88', medium: '#ffd700', high: '#ff6b6b'
};

const SessionCard: React.FC<Props> = ({ session }) => {
  const { deleteSession } = useStore();
  const date = new Date(session.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card"
      style={{ padding: '24px 28px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{MOOD_EMOJI[session.mood] || '😊'}</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--passion-text)' }}>
              {session.title}
            </h3>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 20,
              background: `${RISK_COLOR[session.burnoutRisk]}20`,
              color: RISK_COLOR[session.burnoutRisk],
              border: `1px solid ${RISK_COLOR[session.burnoutRisk]}40`,
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5
            }}>
              {session.burnoutRisk} risk
            </span>
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--passion-muted)' }}>⏱ {session.duration} mins</span>
            <span style={{ fontSize: 13, color: 'var(--passion-muted)' }}>📅 {dateStr} · {timeStr}</span>
          </div>

          {/* Metrics bar */}
          <div style={{ display: 'flex', gap: 16, marginBottom: session.aiInsight ? 14 : 0 }}>
            {[
              { label: 'Joy', value: session.joyLevel, color: '#00ff88' },
              { label: 'Stress', value: session.stressLevel, color: '#ff6b6b' },
              { label: 'Energy', value: session.energyLevel, color: '#ffd700' }
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 60, height: 5, borderRadius: 3,
                  background: 'var(--passion-border)', overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${m.value * 10}%`, height: '100%',
                    background: m.color, borderRadius: 3,
                    transition: 'width 1s ease'
                  }} />
                </div>
                <span style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>{m.value}</span>
                <span style={{ fontSize: 10, color: 'var(--passion-muted)' }}>{m.label}</span>
              </div>
            ))}
          </div>

          {session.aiInsight && (
            <div style={{
              background: 'var(--passion-card)', borderLeft: '3px solid var(--passion-accent)',
              padding: '10px 14px', borderRadius: '0 8px 8px 0', marginTop: 10
            }}>
              <span style={{ fontSize: 12, color: 'var(--passion-muted)' }}>🧠 </span>
              <span style={{ fontSize: 13, color: 'var(--passion-text)', fontStyle: 'italic' }}>{session.aiInsight}</span>
            </div>
          )}

          {session.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {session.tags.map((tag: string) => (
                <span key={tag} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 20,
                  background: 'var(--passion-card)', border: '1px solid var(--passion-border)',
                  color: 'var(--passion-muted)'
                }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => deleteSession(session._id)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--passion-muted)', fontSize: 16, padding: 4,
            transition: 'color 0.2s', flexShrink: 0
          }}
          title="Delete session"
        >
          🗑
        </button>
      </div>
    </motion.div>
  );
};

export default SessionCard;
