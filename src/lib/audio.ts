export const playSound = (type: 'success' | 'error' | 'cheer') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'success') {
      // Success chime (higher pitched, quick)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'error') {
      // Error buzz (lower pitched, saw-like)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime); // Low freq
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'cheer') {
      // Simulate celebration chord
      const chords = [523.25, 659.25, 783.99]; // C Major chord
      chords.forEach(freq => {
        const oscNode = ctx.createOscillator();
        const gain = ctx.createGain();
        oscNode.type = 'sine';
        oscNode.frequency.setValueAtTime(freq, ctx.currentTime);
        
        oscNode.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        
        oscNode.start(ctx.currentTime);
        oscNode.stop(ctx.currentTime + 1.5);
      });
    }
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};
