import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';

const AIInsightPanel: React.FC = () => {
  const { getWeeklyReport, getBurnoutCheck, user } = useStore();
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [burnoutResult, setBurnoutResult] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingBurnout, setLoadingBurnout] = useState(false);

  const handleWeeklyReport = async () => {
    setLoadingReport(true);
    try {
      const result = await getWeeklyReport();
      setWeeklyReport(result);
    } catch (e) { console.error(e); }
    setLoadingReport(false);
  };

  const handleBurnoutCheck = async () => {
    setLoadingBurnout(true);
    try {
      const result = await getBurnoutCheck();
      setBurnoutResult(result);
    } catch (e) { console.error(e); }
    setLoadingBurnout(false);
  };

  const RISK_COLORS: Record<string, string> = { low: '#00ff88', medium: '#ffd700', high: '#ff6b6b' };
  const RISK_EMOJIS: Record<string, string> = { low: '🟢', medium: '🟡', high: '🔴' };

  return (
    <div>
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 8 }}>
        AI Insights
      </motion.h1>
      <p style={{ color: 'var(--passion-muted)', marginBottom: 40 }}>
        Powered by <strong style={{ color: 'var(--passion-accent)' }}>Llama 3.3 70B</strong> — personalized just for your {user?.passion} journey
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Weekly Report Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>Weekly Reflection</h2>
              <p style={{ color: 'var(--passion-muted)', fontSize: 14 }}>A personalized letter about your week's passion journey</p>
            </div>
            <span style={{ fontSize: 36 }}>📖</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-primary"
            onClick={handleWeeklyReport}
            disabled={loadingReport}
            style={{ marginBottom: weeklyReport ? 20 : 0 }}
          >
            {loadingReport ? '✨ Generating your reflection...' : '📝 Generate Weekly Reflection'}
          </motion.button>

          <AnimatePresence>
            {weeklyReport && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 20 }}
              >
                {weeklyReport.stats && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: 'Sessions', value: weeklyReport.stats.sessions },
                      { label: 'Avg Joy', value: `${weeklyReport.stats.avgJoy}/10` },
                      { label: 'Avg Stress', value: `${weeklyReport.stats.avgStress}/10` },
                      { label: 'Minutes', value: weeklyReport.stats.totalMinutes }
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--passion-card)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--passion-accent)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: 'var(--passion-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{
                  background: 'var(--passion-card)', border: '1px solid var(--passion-border)',
                  borderRadius: 16, padding: 24,
                  borderLeft: '4px solid var(--passion-accent)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 18 }}>🧠</span>
                    <span style={{ fontSize: 12, color: 'var(--passion-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Your Weekly Story
                    </span>
                  </div>
                  <p style={{ color: 'var(--passion-text)', lineHeight: 1.8, fontSize: 15, fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                    {weeklyReport.report}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Burnout Check Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>Burnout Check-In</h2>
              <p style={{ color: 'var(--passion-muted)', fontSize: 14 }}>AI analysis of your recent patterns with recovery suggestions</p>
            </div>
            <span style={{ fontSize: 36 }}>🔥</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-primary"
            onClick={handleBurnoutCheck}
            disabled={loadingBurnout}
            style={{ marginBottom: burnoutResult ? 20 : 0 }}
          >
            {loadingBurnout ? '🔍 Analyzing your patterns...' : '🔍 Check My Burnout Risk'}
          </motion.button>

          <AnimatePresence>
            {burnoutResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
                  borderRadius: 12, marginBottom: 16,
                  background: `${RISK_COLORS[burnoutResult.risk]}15`,
                  border: `1px solid ${RISK_COLORS[burnoutResult.risk]}40`
                }}>
                  <span style={{ fontSize: 28 }}>{RISK_EMOJIS[burnoutResult.risk]}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: RISK_COLORS[burnoutResult.risk], fontSize: 16 }}>
                      {burnoutResult.risk.charAt(0).toUpperCase() + burnoutResult.risk.slice(1)} Burnout Risk
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--passion-muted)' }}>
                      {burnoutResult.risk === 'low' ? 'You\'re doing great! Keep this balance.' :
                        burnoutResult.risk === 'medium' ? 'Some warning signs detected. Time to check in.' :
                          'High stress patterns detected. Please take care of yourself.'}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: 'var(--passion-card)', borderRadius: 16, padding: 20,
                  borderLeft: `4px solid ${RISK_COLORS[burnoutResult.risk]}`
                }}>
                  <p style={{ color: 'var(--passion-text)', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>
                    {burnoutResult.message}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tips card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>
            Keep Your Passion Alive
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { emoji: '🌅', title: 'Morning rituals', desc: 'Small daily practices keep your passion warm without pressure' },
              { emoji: '📵', title: 'Offline days', desc: 'Create without sharing. Not everything needs an audience.' },
              { emoji: '🎲', title: 'Experiment freely', desc: 'Try something new in your passion purely for fun' },
              { emoji: '💬', title: 'Find your tribe', desc: 'Connect with others who do it for love, not metrics' }
            ].map(tip => (
              <div key={tip.title} style={{ background: 'var(--passion-card)', borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{tip.emoji}</div>
                <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>{tip.title}</div>
                <div style={{ fontSize: 13, color: 'var(--passion-muted)', lineHeight: 1.5 }}>{tip.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIInsightPanel;
