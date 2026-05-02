import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import '../styles/globals.css';

const PASSIONS = [
  { id: 'photography', emoji: '📸', label: 'Photography', desc: 'Capture the world through your lens', color: '#00d4ff' },
  { id: 'art', emoji: '🎨', label: 'Art', desc: 'Express your soul on the canvas', color: '#ff6b35' },
  { id: 'dancing', emoji: '💃', label: 'Dancing', desc: 'Move to the rhythm of your heart', color: '#c77dff' },
  { id: 'writing', emoji: '✍️', label: 'Writing', desc: 'Craft worlds with your words', color: '#58a6ff' },
  { id: 'music', emoji: '🎵', label: 'Music', desc: 'Feel every note, live every beat', color: '#00ff88' }
];

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPassion, setSelectedPassion] = useState('');
  const [hoveredPassion, setHoveredPassion] = useState('');
  const { login, register, isLoading, error, clearError, user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user]);

  useEffect(() => {
    clearError();
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch { }
  };

  const handleRegister = async () => {
    if (!selectedPassion) return;
    try {
      await register(name, email, password, selectedPassion);
    } catch { }
  };

  const previewPassion = hoveredPassion || selectedPassion;

  return (
    <div
      data-passion={previewPassion || 'photography'}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
    >
      {/* Animated background gradient */}
      <div style={{
        position: 'fixed', inset: 0,
        background: `radial-gradient(ellipse at 20% 20%, var(--passion-glow, rgba(0,212,255,0.15)) 0%, transparent 60%),
                     radial-gradient(ellipse at 80% 80%, var(--passion-glow, rgba(0,212,255,0.1)) 0%, transparent 60%),
                     var(--passion-primary)`,
        transition: 'all 1s ease',
        zIndex: 0
      }} />

      {/* Floating particles */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 4 + Math.random() * 8,
              height: 4 + Math.random() * 8,
              borderRadius: '50%',
              background: 'var(--passion-accent)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2
            }}
            animate={{
              y: [0, -30 - Math.random() * 50, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 500, padding: '0 20px' }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{
            fontSize: 48, marginBottom: 8,
            filter: `drop-shadow(0 0 20px var(--passion-accent))`
          }}>🌟</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 42, fontWeight: 900,
            background: 'linear-gradient(135deg, var(--passion-accent), var(--passion-text))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 8
          }}>PassionKeep</h1>
          <p style={{ color: 'var(--passion-muted)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
            Protect the joy of what you love
          </p>
        </motion.div>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex', background: 'var(--passion-card)',
            borderRadius: 50, padding: 4, marginBottom: 30,
            border: '1px solid var(--passion-border)'
          }}
        >
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setStep(1); }}
              style={{
                flex: 1, padding: '10px 20px', borderRadius: 50, border: 'none',
                background: mode === m ? 'var(--passion-accent)' : 'transparent',
                color: mode === m ? 'var(--passion-primary)' : 'var(--passion-muted)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600,
                fontSize: 14, transition: 'all 0.3s',
                textTransform: 'capitalize'
              }}
            >
              {m === 'login' ? 'Sign In' : 'Join Now'}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card"
              style={{ padding: 36 }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24, color: 'var(--passion-text)' }}>
                Welcome back
              </h2>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--passion-muted)', marginBottom: 6, display: 'block' }}>Email</label>
                  <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--passion-muted)', marginBottom: 6, display: 'block' }}>Password</label>
                  <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ color: '#ff6b6b', fontSize: 14, textAlign: 'center', background: 'rgba(255,107,107,0.1)', padding: 10, borderRadius: 8 }}>
                    {error}
                  </motion.p>
                )}
                <button className="btn-primary" type="submit" disabled={isLoading} style={{ marginTop: 8 }}>
                  {isLoading ? '✨ Entering...' : 'Enter Your World'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card"
              style={{ padding: 36 }}
            >
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>Create your account</h2>
                    <p style={{ color: 'var(--passion-muted)', fontSize: 13, marginBottom: 24 }}>Step 1 of 2 — Your details</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <input className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                      <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                      <input className="input-field" type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} />
                      <button
                        className="btn-primary"
                        onClick={() => {
                          if (name && email && password.length >= 6) setStep(2);
                        }}
                        style={{ opacity: name && email && password.length >= 6 ? 1 : 0.5 }}
                      >
                        Next →
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>What's your passion?</h2>
                    <p style={{ color: 'var(--passion-muted)', fontSize: 13, marginBottom: 20 }}>Step 2 of 2 — This shapes your entire experience</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                      {PASSIONS.map(p => (
                        <motion.button
                          key={p.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedPassion(p.id)}
                          onMouseEnter={() => setHoveredPassion(p.id)}
                          onMouseLeave={() => setHoveredPassion('')}
                          style={{
                            background: selectedPassion === p.id ? `${p.color}20` : 'var(--passion-card)',
                            border: `1px solid ${selectedPassion === p.id ? p.color : 'var(--passion-border)'}`,
                            borderRadius: 16, padding: '14px 10px', cursor: 'pointer',
                            textAlign: 'left', transition: 'all 0.3s',
                            boxShadow: selectedPassion === p.id ? `0 0 20px ${p.color}30` : 'none'
                          }}
                        >
                          <div style={{ fontSize: 24, marginBottom: 4 }}>{p.emoji}</div>
                          <div style={{ fontWeight: 600, color: selectedPassion === p.id ? p.color : 'var(--passion-text)', fontSize: 13 }}>{p.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--passion-muted)', marginTop: 2 }}>{p.desc}</div>
                        </motion.button>
                      ))}
                    </div>

                    {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 10 }}>{error}</p>}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 0.4 }}>← Back</button>
                      <button className="btn-primary" onClick={handleRegister} disabled={!selectedPassion || isLoading} style={{ flex: 1, opacity: selectedPassion ? 1 : 0.5 }}>
                        {isLoading ? '✨ Creating...' : '🚀 Begin Journey'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;