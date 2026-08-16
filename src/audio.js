// Audio system using Web Audio API
// All sounds are procedurally generated - no external files

export function initAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContext();
  
  return {
    playSlide: () => playSlideSound(ctx),
    playFriction: () => playFrictionSound(ctx),
    playSpark: () => playSparkSound(ctx),
    playIgnition: () => playIgnitionSound(ctx),
    playCrackle: () => playCrackleSound(ctx),
    playPickup: () => playPickupSound(ctx),
    playTap: () => playTapSound(ctx),
    playExtinguish: () => playExtinguishSound(ctx)
  };
}

function playSlideSound(ctx) {
  const t = ctx.currentTime;
  const duration = 0.15;
  
  // Create noise buffer for cardboard friction
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  // Filter to make it sound like cardboard
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.5;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(t);
  noise.stop(t + duration);
}

function playFrictionSound(ctx) {
  const t = ctx.currentTime;
  const duration = 0.08;
  
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1500;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(t);
  noise.stop(t + duration);
}

function playSparkSound(ctx) {
  const t = ctx.currentTime;
  const duration = 0.05;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2000 + Math.random() * 500, t);
  osc.frequency.exponentialRampToValueAtTime(4000, t + duration);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + duration);
}

function playIgnitionSound(ctx) {
  const t = ctx.currentTime;
  
  // Quick whoosh sound
  const bufferSize = ctx.sampleRate * 0.2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.4;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, t);
  filter.frequency.linearRampToValueAtTime(2000, t + 0.1);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(t);
  noise.stop(t + 0.2);
  
  // Add a small pop
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
  
  const popGain = ctx.createGain();
  popGain.gain.setValueAtTime(0.3, t);
  popGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  
  osc.connect(popGain);
  popGain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + 0.1);
}

function playCrackleSound(ctx) {
  const t = ctx.currentTime;
  const duration = 0.03;
  
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.2;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(t);
  noise.stop(t + duration);
}

function playPickupSound(ctx) {
  const t = ctx.currentTime;
  const duration = 0.05;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(600, t + duration);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + duration);
}

function playTapSound(ctx) {
  const t = ctx.currentTime;
  const duration = 0.03;
  
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(150, t + duration);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + duration);
}

function playExtinguishSound(ctx) {
  const t = ctx.currentTime;
  const duration = 0.15;
  
  // Hissing sound
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1000;
  filter.Q.value = 1;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(t);
  noise.stop(t + duration);
}
