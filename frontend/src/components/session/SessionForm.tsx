import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';

const MOODS = [
  { id: 'amazing', emoji: '🤩', label: 'Amazing' },
  { id: 'good', emoji: '😊', label: 'Good' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'frustrated', emoji: '😤', label: 'Frustrated' }
];

interface Props {
  onClose: () => void;
}

const SessionForm: React.FC<Props> = ({ onClose }) => {
  const { createSession, getAIInsight } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [joyLevel, setJoyLevel] = useState(7);
  const [stressLevel, setStressLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState('good');
  const [tags, setTags] = useState('');
  const [step, setStep] = useState(1);
  const [aiInsight, setAiInsight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async () => {
    if (!title) return;
    setIsSubmitting(true);
    try {
      const sessionData = {
        title, description, duration, joyLevel, stressLevel,
        energyLevel, reflection, mood,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await createSession(sessionData);
      // Get AI insight
      const insight = await getAIInsight({ title, joyLevel, stressLevel, energyLevel, reflection, duration });
      setAiInsight(insight);
      setIsDone(true);
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const SliderField = ({ label, value, setValue, emoji, color }: any) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={{ fontSize: 14, color: 'var(--passion-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {emoji} {label}
        </label>
        <span style={{ fontSize: 20, fontWeight: 800, color: color || 'var(--passion-accent)', fontFamily: 'var(--font-display)' }}>
          {value}
        </span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={e => setValue(Number(e.target.value))}
        className="passion-slider"
        style={{ '--slider-color': color } as any}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--passion-muted)', marginTop: 4 }}>
        <span>1 — Low</span><span>10 — High</span>
      </div>
    </div>
  );

  if (isDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ padding: 40, textAlign: 'center' }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.8 }}
          style={{ fontSize: 64, marginBottom: 20 }}
        >
          ✨
        </motion.div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Session Logged!</h2>
        <p style={{ color: 'var(--passion-muted)', marginBottom: 24 }}>Your journey continues...</p>

        {aiInsight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'var(--passion-card)', border: '1px solid var(--passion-border)',
              borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🧠</span>
              <span style={{ fontWeight: 600, color: 'var(--passion-accent)', fontSize: 14 }}>AI Insight</span>
            </div>
            <p style={{ color: 'var(--passion-text)', lineHeight: 1.7, fontSize: 15, fontStyle: 'italic' }}>
              "{aiInsight}"
            </p>
          </motion.div>
        )}

        {/* Joy/Stress visual */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Joy', value: joyLevel, emoji: '😊', color: '#00ff88' },
            { label: 'Stress', value: stressLevel, emoji: '😤', color: '#ff6b6b' },
            { label: 'Energy', value: energyLevel, emoji: '⚡', color: '#ffd700' }
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--passion-card)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 24 }}>{m.emoji}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: m.color, fontFamily: 'var(--font-display)' }}>{m.value}</div>
              <div style={{ fontSize: 11, color: 'var(--passion-muted)' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onClose}>Back to Dashboard</button>
      </motion.div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 36 }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: s <= step ? 'var(--passion-accent)' : 'var(--passion-border)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}>What did you do today?</h2>
          <p style={{ color: 'var(--passion-muted)', fontSize: 13, marginBottom: 24 }}>Log your passion session</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--passion-muted)', marginBottom: 6, display: 'block' }}>Session title *</label>
              <input className="input-field" placeholder={`e.g., "Golden hour shoot at the park"`} value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--passion-muted)', marginBottom: 6, display: 'block' }}>Description (optional)</label>
              <textarea className="input-field" placeholder="What happened? What did you create?" value={description} onChange={e => setDescription(e.target.value)}
                style={{ resize: 'vertical', minHeight: 80 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--passion-muted)', marginBottom: 8, display: 'block' }}>
                Duration: <strong style={{ color: 'var(--passion-accent)' }}>{duration} mins</strong>
              </label>
              <input type="range" min={5} max={480} step={5} value={duration}
                onChange={e => setDuration(Number(e.target.value))} className="passion-slider" />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--passion-muted)', marginBottom: 10, display: 'block' }}>How were you feeling?</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {MOODS.map(m => (
                  <button key={m.id} onClick={() => setMood(m.id)}
                    style={{
                      padding: '8px 14px', borderRadius: 50, border: `1px solid ${mood === m.id ? 'var(--passion-accent)' : 'var(--passion-border)'}`,
                      background: mood === m.id ? 'var(--passion-card)' : 'transparent',
                      color: mood === m.id ? 'var(--passion-accent)' : 'var(--passion-muted)',
                      cursor: 'pointer', fontSize: 13, transition: 'all 0.2s'
                    }}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-primary" onClick={() => title && setStep(2)} style={{ opacity: title ? 1 : 0.5 }}>
              Next → Rate Your Session
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}>How did it feel?</h2>
          <p style={{ color: 'var(--passion-muted)', fontSize: 13, marginBottom: 28 }}>Honest tracking builds real insights</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <SliderField label="Joy Level" value={joyLevel} setValue={setJoyLevel} emoji="😊" color="#00ff88" />
            <SliderField label="Stress Level" value={stressLevel} setValue={setStressLevel} emoji="😤" color="#ff6b6b" />
            <SliderField label="Energy Level" value={energyLevel} setValue={setEnergyLevel} emoji="⚡" color="#ffd700" />

            {/* Joy vs Stress visual */}
            <div style={{ background: 'var(--passion-card)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--passion-muted)', marginBottom: 8 }}>Session vibe</div>
              <div style={{ fontSize: 32 }}>
                {joyLevel > 7 && stressLevel < 4 ? '🌟 Thriving' :
                  joyLevel > 5 && stressLevel < 6 ? '😊 Good flow' :
                    joyLevel < 4 && stressLevel > 6 ? '⚠️ Burnout risk' :
                      stressLevel > 6 ? '😤 Stressful' : '😐 Neutral'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 0.4 }}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 1 }}>Next → Reflect</button>
            </div>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}>Capture your thoughts</h2>
          <p style={{ color: 'var(--passion-muted)', fontSize: 13, marginBottom: 24 }}>What will you remember about today?</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--passion-muted)', marginBottom: 6, display: 'block' }}>
                Reflection <span style={{ color: 'var(--passion-accent)' }}>(AI reads this for personalized insights)</span>
              </label>
              <textarea
                className="input-field"
                placeholder="What inspired you? What felt hard? What surprised you?"
                value={reflection} onChange={e => setReflection(e.target.value)}
                style={{ resize: 'vertical', minHeight: 120 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--passion-muted)', marginBottom: 6, display: 'block' }}>Tags (comma separated)</label>
              <input className="input-field" placeholder="e.g., landscape, golden hour, experiment" value={tags} onChange={e => setTags(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setStep(2)} style={{ flex: 0.4 }}>← Back</button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ flex: 1 }}
              >
                {isSubmitting ? '✨ Saving & getting AI insight...' : '🚀 Save Session'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SessionForm;