import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API, useStore } from '../../store';

const StatsPanel: React.FC = () => {
  const { sessions, user } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/sessions/stats');
        setStats(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchStats();
  }, [sessions]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 40 }}>⚙️</motion.div>
    </div>
  );

  const trendData = stats?.trendData || [];
  const maxJoy = 10;

  // Simple inline bar chart
  const BarChart = ({ data, key1, key2, label1, label2, color1, color2 }: any) => {
    if (!data.length) return <p style={{ color: 'var(--passion-muted)', textAlign: 'center', padding: 30 }}>No data yet — log some sessions!</p>;
    const last15 = data.slice(-15);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, padding: '0 4px' }}>
        {last15.map((d: any, i: number) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: '100%', width: '100%' }}>
              <div style={{ flex: 1, background: color1, borderRadius: '3px 3px 0 0', height: `${(d[key1] / maxJoy) * 100}%`, opacity: 0.8, transition: 'height 1s ease', minHeight: 2 }} title={`${label1}: ${d[key1]}`} />
              <div style={{ flex: 1, background: color2, borderRadius: '3px 3px 0 0', height: `${(d[key2] / maxJoy) * 100}%`, opacity: 0.8, transition: 'height 1s ease', minHeight: 2 }} title={`${label2}: ${d[key2]}`} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Donut chart via SVG
  const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((a, d) => a + d.value, 0);
    if (total === 0) return <p style={{ color: 'var(--passion-muted)', textAlign: 'center' }}>No data</p>;
    let cumulative = 0;
    const r = 60, cx = 80, cy = 80;
    const paths = data.map(d => {
      const startAngle = (cumulative / total) * 360 - 90;
      cumulative += d.value;
      const endAngle = (cumulative / total) * 360 - 90;
      const startRad = startAngle * Math.PI / 180;
      const endRad = endAngle * Math.PI / 180;
      const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad);
      const large = endAngle - startAngle > 180 ? 1 : 0;
      return { path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: d.color, label: d.label, value: d.value };
    });
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <svg width={160} height={160}>
          <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="var(--passion-border)" strokeWidth={1} />
          {paths.map((p, i) => <path key={i} d={p.path} fill={p.color} opacity={0.8} />)}
          <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--passion-primary)" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="var(--passion-text)" fontSize={14} fontWeight="bold">{total}</text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill="var(--passion-muted)" fontSize={9}>sessions</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {paths.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color }} />
              <span style={{ fontSize: 12, color: 'var(--passion-muted)' }}>{p.label}: <strong style={{ color: 'var(--passion-text)' }}>{p.value}</strong></span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 8 }}>
        Your Stats
      </motion.h1>
      <p style={{ color: 'var(--passion-muted)', marginBottom: 40 }}>Track the health of your passion over time</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {/* Joy vs Stress Trend */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>Joy vs Stress Trend</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--passion-muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#00ff88' }} /> Joy
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--passion-muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#ff6b6b' }} /> Stress
            </span>
          </div>
          <BarChart data={trendData} key1="joy" key2="stress" label1="Joy" label2="Stress" color1="#00ff88" color2="#ff6b6b" />
          <p style={{ fontSize: 11, color: 'var(--passion-muted)', marginTop: 8, textAlign: 'center' }}>Last 15 sessions</p>
        </motion.div>

        {/* Burnout distribution */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20 }}>Burnout Distribution</h3>
          <DonutChart data={[
            { label: 'Low Risk', value: stats?.burnoutDistribution?.low || 0, color: '#00ff88' },
            { label: 'Medium Risk', value: stats?.burnoutDistribution?.medium || 0, color: '#ffd700' },
            { label: 'High Risk', value: stats?.burnoutDistribution?.high || 0, color: '#ff6b6b' }
          ]} />
        </motion.div>

        {/* Summary cards */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20 }}>Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Total Sessions', value: user?.stats?.totalSessions || 0, emoji: '📝' },
              { label: 'Average Joy', value: `${user?.stats?.avgJoy || 0}/10`, emoji: '😊' },
              { label: 'Average Stress', value: `${user?.stats?.avgStress || 0}/10`, emoji: '😤' },
              { label: 'Total Time', value: `${Math.round(sessions.reduce((a, s) => a + s.duration, 0) / 60)}h`, emoji: '⏱' }
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--passion-border)' }}>
                <span style={{ fontSize: 14, color: 'var(--passion-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.emoji} {item.label}
                </span>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--passion-accent)', fontFamily: 'var(--font-display)' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Energy trend */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>Energy Trend</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--passion-muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#ffd700' }} /> Energy
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
            {trendData.slice(-15).map((d: any, i: number) => (
              <div key={i} style={{
                flex: 1, background: 'linear-gradient(to top, #ffd700, #ff8c00)',
                borderRadius: '3px 3px 0 0',
                height: `${(d.energy / 10) * 100}%`,
                opacity: 0.7, minHeight: 2, transition: 'height 1s ease'
              }} title={`Energy: ${d.energy}`} />
            ))}
          </div>
          {trendData.length === 0 && <p style={{ color: 'var(--passion-muted)', textAlign: 'center', padding: 30 }}>No data yet</p>}
        </motion.div>
      </div>
    </div>
  );
};

export default StatsPanel;
