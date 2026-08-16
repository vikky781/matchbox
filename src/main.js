// Matchbox - A virtual matchbox experience
// No external dependencies, no network requests

import { initAudio } from './audio.js';
import { Matchbox } from './matchbox.js';
import { Match } from './match.js';
import { Flame } from './flame.js';
import { Smoke } from './smoke.js';
import { TableScene } from './scene.js';

const canvas = document.getElementById('main');
const ctx = canvas.getContext('2d');

// State
let width, height;
let muted = false;
let audioCtx = null;

// Scene objects
let tableScene;
let matchbox;
let matches = [];
let flames = [];
let smokes = [];
let spentMatches = [];

// Interaction state
let draggedObject = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseX = 0;
let mouseY = 0;

// Resize handling
function resize() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);
  
  if (tableScene) tableScene.resize(width, height);
  if (matchbox) matchbox.resize(width, height);
}

window.addEventListener('resize', resize);

// Mouse events
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mouseleave', () => {
  if (draggedObject && draggedObject.release) {
    draggedObject.release();
  }
  draggedObject = null;
});

// Touch events for mobile/tablet
canvas.addEventListener('touchstart', onTouchStart, { passive: false });
canvas.addEventListener('touchmove', onTouchMove, { passive: false });
canvas.addEventListener('touchend', onTouchEnd);

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function onMouseDown(e) {
  const pos = getCanvasPos(e);
  mouseX = pos.x;
  mouseY = pos.y;
  
  // Check for interactions in reverse order (top to bottom)
  // Check flames first (to blow them out)
  for (let i = flames.length - 1; i >= 0; i--) {
    const flame = flames[i];
    if (flame.contains(pos.x, pos.y)) {
      flame.blowOut();
      return;
    }
  }
  
  // Check matches
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    if (match.contains(pos.x, pos.y)) {
      draggedObject = match;
      const localPos = match.worldToLocal(pos.x, pos.y);
      dragOffsetX = localPos.x;
      dragOffsetY = localPos.y;
      match.pickUp();
      if (!muted && audioCtx) audioCtx.playPickup();
      return;
    }
  }
  
  // Check spent matches
  for (let i = spentMatches.length - 1; i >= 0; i--) {
    const match = spentMatches[i];
    if (match.contains(pos.x, pos.y)) {
      draggedObject = match;
      const localPos = match.worldToLocal(pos.x, pos.y);
      dragOffsetX = localPos.x;
      dragOffsetY = localPos.y;
      match.pickUp();
      if (!muted && audioCtx) audioCtx.playPickup();
      return;
    }
  }
  
  // Check matchbox tray
  if (matchbox && matchbox.trayContains(pos.x, pos.y)) {
    draggedObject = matchbox;
    matchbox.startDrag(pos.x, pos.y);
    return;
  }
}

function onMouseMove(e) {
  const pos = getCanvasPos(e);
  const dx = pos.x - lastMouseX;
  const dy = pos.y - lastMouseY;
  mouseX = pos.x;
  mouseY = pos.y;
  
  if (draggedObject) {
    if (draggedObject === matchbox) {
      matchbox.drag(pos.x, pos.y, dx, dy);
    } else if (draggedObject.drag) {
      draggedObject.drag(pos.x - dragOffsetX, pos.y - dragOffsetY, dx, dy);
    }
  }
  
  lastMouseX = pos.x;
  lastMouseY = pos.y;
}

function onMouseUp(e) {
  if (draggedObject && draggedObject.release) {
    draggedObject.release();
  }
  draggedObject = null;
}

function onTouchStart(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const event = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    onMouseDown(event);
  }
}

function onTouchMove(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const event = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    onMouseMove(event);
  }
}

function onTouchEnd(e) {
  e.preventDefault();
  onMouseUp();
}

// Keyboard controls
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Reset scene
    resetScene();
  } else if (e.key.toLowerCase() === 'm') {
    muted = !muted;
  } else if (e.key.toLowerCase() === 'r') {
    resetScene();
  }
});

function resetScene() {
  matches = [];
  flames = [];
  smokes = [];
  spentMatches = [];
  if (matchbox) matchbox.reset();
  initMatches();
}

function initMatches() {
  // Create initial matches inside the box
  const boxPos = matchbox.getInnerTrayPosition();
  for (let i = 0; i < 5; i++) {
    const match = new Match(
      boxPos.x + (Math.random() - 0.5) * 60,
      boxPos.y + (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 0.3
    );
    matches.push(match);
  }
}

function spawnSmoke(x, y) {
  const smoke = new Smoke(x, y);
  smokes.push(smoke);
}

function checkStrike(match) {
  if (!match.isHeld || !matchbox) return false;
  
  const strikeArea = matchbox.getStrikeArea();
  const matchHead = match.getHeadPosition();
  
  // Check if match head is near strike area
  const dx = matchHead.x - strikeArea.x;
  const dy = matchHead.y - strikeArea.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist > 40) return false;
  
  // Check velocity
  const velocity = match.getVelocity();
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  // Need minimum speed to ignite
  if (speed < 2) return false;
  
  // Check direction (should be roughly horizontal)
  const horizontalRatio = Math.abs(velocity.x) / speed;
  if (horizontalRatio < 0.5) return false;
  
  // Success! Ignite the match
  return true;
}

// Main render loop
let lastTime = performance.now();

function render(now) {
  const dt = (now - lastTime) / 16.67; // Normalize to ~60fps
  lastTime = now;
  
  // Clear canvas
  ctx.fillStyle = '#1a1614';
  ctx.fillRect(0, 0, width, height);
  
  // Draw table surface
  if (tableScene) {
    tableScene.draw(ctx, flames);
  }
  
  // Update and draw matchbox
  if (matchbox) {
    matchbox.update(dt);
    matchbox.draw(ctx);
  }
  
  // Update matches
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    match.update(dt, matchbox);
    
    // Check for strike attempt
    if (match.isHeld && !match.isLit && checkStrike(match)) {
      match.ignite();
      if (!muted && audioCtx) audioCtx.playIgnition();
      
      // Create flame
      const headPos = match.getHeadPosition();
      const flame = new Flame(headPos.x, headPos.y, match);
      flames.push(flame);
    }
    
    match.draw(ctx);
    
    // Remove burnt out matches from active list
    if (match.isBurntOut) {
      matches.splice(i, 1);
      spentMatches.push(match);
      spawnSmoke(match.getHeadPosition().x, match.getHeadPosition().y);
    }
  }
  
  // Update spent matches
  for (const match of spentMatches) {
    match.update(dt, matchbox);
    match.draw(ctx);
  }
  
  // Update and draw flames
  for (let i = flames.length - 1; i >= 0; i--) {
    const flame = flames[i];
    flame.update(dt);
    flame.draw(ctx);
    
    if (flame.isDead) {
      flames.splice(i, 1);
      // Find associated match and mark as burnt
      if (flame.matchRef && !flame.matchRef.isBurntOut) {
        flame.matchRef.extinguish();
      }
    }
  }
  
  // Update and draw smoke
  for (let i = smokes.length - 1; i >= 0; i--) {
    const smoke = smokes[i];
    smoke.update(dt);
    smoke.draw(ctx);
    
    if (smoke.isDead) {
      smokes.splice(i, 1);
    }
  }
  
  requestAnimationFrame(render);
}

// Initialize
function init() {
  resize();
  
  // Initialize audio (user gesture required)
  const initAudioHandler = () => {
    if (!audioCtx) {
      audioCtx = initAudio();
    }
    window.removeEventListener('click', initAudioHandler);
    window.removeEventListener('keydown', initAudioHandler);
  };
  window.addEventListener('click', initAudioHandler);
  window.addEventListener('keydown', initAudioHandler);
  
  // Create scene
  tableScene = new TableScene(width, height);
  matchbox = new Matchbox(width * 0.5, height * 0.6, width, height);
  
  // Create initial matches
  initMatches();
  
  // Start render loop
  requestAnimationFrame(render);
}

init();
