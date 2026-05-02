import React, { useState, useEffect, useRef, useCallback } from 'react';
import PhotographyBackground from './PhotographyBg';
import ArtBackground from './ArtBg';
import DancingBackground from './DancingBg';
import WritingBackground from './WritingBg';
import MusicBackground from './MusicBg';

interface Props {
  passion: string;
  scrollY: number;
}

const PassionBackground: React.FC<Props> = ({ passion, scrollY }) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<any[]>([]);

  const createAmbientSound = useCallback((p: string) => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.08;
    masterGain.connect(ctx.destination);

    if (p === 'music') {
      const notes = [261.63, 329.63, 392, 523.25];
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.5;
        lfoGain.gain.value = 2;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        nodesRef.current.push(osc, lfo);
      });
    } else if (p === 'writing') {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      source.connect(filter);
      filter.connect(masterGain);
      source.start();
      nodesRef.current.push(source);
    } else if (p === 'dancing') {
      const kick = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      };
      const interval = setInterval(kick, 500);
      nodesRef.current.push({ stop: () => clearInterval(interval) });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 60;
      osc.type = 'sine';
      gain.gain.value = 0.03;
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      nodesRef.current.push(osc);
    }
  }, []);

  useEffect(() => {
    if (soundEnabled) {
      createAmbientSound(passion);
    }
    return () => {
      nodesRef.current.forEach(n => { try { n.stop?.(); } catch { } });
      nodesRef.current = [];
      audioCtxRef.current?.close();
    };
  }, [soundEnabled, passion, createAmbientSound]);

  const BgComponent = ({
    photography: PhotographyBackground,
    art: ArtBackground,
    dancing: DancingBackground,
    writing: WritingBackground,
    music: MusicBackground
  } as Record<string, React.FC<{ scrollY: number }>>)[passion] || PhotographyBackground;

  return (
    <>
      <BgComponent scrollY={scrollY} />
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 100,
          background: 'var(--passion-card)', border: '1px solid var(--passion-border)',
          borderRadius: '50px', color: 'var(--passion-text)', cursor: 'pointer',
          padding: '8px 16px', fontSize: '12px', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s'
        }}
      >
        {soundEnabled ? '🔊' : '🔇'} Ambient Sound
      </button>
    </>
  );
};

export default PassionBackground;