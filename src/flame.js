// Flame class - procedural flame simulation

export class Flame {
  constructor(x, y, matchRef) {
    this.x = x;
    this.y = y;
    this.matchRef = matchRef;
    
    this.isDead = false;
    this.life = 0;
    this.maxLife = 1800; // Frames until burnout (~30 seconds at 60fps)
    
    // Flame layers (for multi-layer rendering)
    this.layers = [];
    for (let i = 0; i < 5; i++) {
      this.layers.push({
        offsetX: (Math.random() - 0.5) * 4,
        offsetY: Math.random() * 8,
        width: 12 + i * 4,
        height: 20 + i * 8,
        phase: Math.random() * Math.PI * 2,
        speed: 0.05 + Math.random() * 0.03
      });
    }
    
    // Flicker state
    this.flickerPhase = Math.random() * Math.PI * 2;
    this.flickerSpeed = 0.15;
    
    // Spark particles
    this.sparks = [];
    
    // Blow out state
    this.blowingOut = false;
    this.blowProgress = 0;
  }
  
  update(dt) {
    this.life += dt;
    
    if (this.life >= this.maxLife) {
      this.isDead = true;
      return;
    }
    
    // Update flicker
    this.flickerPhase += this.flickerSpeed * dt;
    
    // Update layers
    for (const layer of this.layers) {
      layer.phase += layer.speed * dt;
      layer.offsetX = (Math.sin(layer.phase) + Math.sin(layer.phase * 2.3) * 0.5) * 3;
    }
    
    // Generate occasional sparks
    if (Math.random() < 0.02 * dt) {
      this.sparks.push({
        x: this.x + (Math.random() - 0.5) * 8,
        y: this.y - Math.random() * 15,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 30 - 10,
        life: 1,
        maxLife: 15 + Math.random() * 10
      });
    }
    
    // Update sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const spark = this.sparks[i];
      spark.x += spark.vx * dt * 0.016;
      spark.y += spark.vy * dt * 0.016;
      spark.vy += 5 * dt * 0.016; // Gravity
      spark.life += dt;
      
      if (spark.life >= spark.maxLife) {
        this.sparks.splice(i, 1);
      }
    }
    
    // Handle blow out
    if (this.blowingOut) {
      this.blowProgress += dt * 0.15;
      if (this.blowProgress >= 1) {
        this.isDead = true;
      }
    }
    
    // Update match reference position
    if (this.matchRef && !this.matchRef.isBurntOut) {
      const headPos = this.matchRef.getHeadPosition();
      // Smooth follow
      this.x += (headPos.x - this.x) * 0.3 * dt;
      this.y += (headPos.y - this.y) * 0.3 * dt;
    }
  }
  
  blowOut() {
    this.blowingOut = true;
  }
  
  contains(mx, my) {
    const dx = mx - this.x;
    const dy = my - (this.y - 20);
    return Math.abs(dx) < 20 && dy > -40 && dy < 20;
  }
  
  draw(ctx) {
    // Calculate flame intensity based on life
    const lifeRatio = 1 - (this.life / this.maxLife);
    const intensity = this.blowingOut ? (1 - this.blowProgress) : 1;
    const alpha = intensity * lifeRatio;
    
    if (alpha < 0.01) return;
    
    ctx.save();
    
    // Additive blending for glow effect
    ctx.globalCompositeOperation = 'screen';
    
    // Draw outer glow/aura
    const glowGrad = ctx.createRadialGradient(
      this.x, this.y - 15, 0,
      this.x, this.y - 10, 50
    );
    glowGrad.addColorStop(0, `rgba(255, 150, 50, ${0.15 * alpha})`);
    glowGrad.addColorStop(0.5, `rgba(255, 100, 30, ${0.08 * alpha})`);
    glowGrad.addColorStop(1, 'rgba(255, 50, 10, 0)');
    
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - 10, 35, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw flame layers from back to front
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      const flicker = Math.sin(this.flickerPhase + i) * 2 + Math.sin(this.flickerPhase * 1.7) * 1.5;
      
      const layerHeight = layer.height * (0.7 + flicker * 0.03) * intensity;
      const layerWidth = layer.width * (0.8 + Math.sin(this.flickerPhase * 2 + i) * 0.1);
      
      // Create gradient for this layer
      const grad = ctx.createLinearGradient(
        this.x + layer.offsetX, this.y,
        this.x + layer.offsetX, this.y - layerHeight
      );
      
      if (i === 0) {
        // Innermost layer - blue base
        grad.addColorStop(0, `rgba(100, 150, 255, ${0.6 * alpha})`);
        grad.addColorStop(0.3, `rgba(255, 200, 100, ${0.7 * alpha})`);
        grad.addColorStop(1, `rgba(255, 150, 50, ${0.3 * alpha})`);
      } else if (i === 1) {
        // Core - bright yellow
        grad.addColorStop(0, `rgba(255, 220, 100, ${0.8 * alpha})`);
        grad.addColorStop(0.5, `rgba(255, 180, 50, ${0.6 * alpha})`);
        grad.addColorStop(1, `rgba(255, 120, 30, ${0.2 * alpha})`);
      } else {
        // Outer layers - orange/red
        const r = 255;
        const g = 140 - i * 15;
        const b = 50 - i * 10;
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.5 * alpha})`);
        grad.addColorStop(1, `rgba(${r}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 20)}, 0)`);
      }
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      
      // Teardrop shape with wavy edges
      const baseY = this.y + layer.offsetY;
      const tipY = this.y - layerHeight + layer.offsetY;
      const centerX = this.x + layer.offsetX;
      
      ctx.moveTo(centerX, tipY);
      
      // Right side with waviness
      for (let t = 0; t <= 1; t += 0.1) {
        const wave = Math.sin(t * Math.PI * 3 + this.flickerPhase + i) * (2 + i * 0.5);
        const px = centerX + layerWidth * t + wave * (1 - t);
        const py = tipY + (baseY - tipY) * t;
        ctx.lineTo(px, py);
      }
      
      // Left side with waviness
      for (let t = 1; t >= 0; t -= 0.1) {
        const wave = Math.sin(t * Math.PI * 3 - this.flickerPhase - i) * (2 + i * 0.5);
        const px = centerX - layerWidth * t + wave * (1 - t);
        const py = tipY + (baseY - tipY) * t;
        ctx.lineTo(px, py);
      }
      
      ctx.closePath();
      ctx.fill();
    }
    
    // Draw sparks
    for (const spark of this.sparks) {
      const sparkAlpha = (1 - spark.life / spark.maxLife) * alpha;
      ctx.fillStyle = `rgba(255, 200, 100, ${sparkAlpha})`;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Bright core
    const coreGrad = ctx.createRadialGradient(
      this.x, this.y - 20, 0,
      this.x, this.y - 20, 15
    );
    coreGrad.addColorStop(0, `rgba(255, 255, 200, ${0.9 * alpha})`);
    coreGrad.addColorStop(0.5, `rgba(255, 200, 100, ${0.4 * alpha})`);
    coreGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');
    
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(this.x, this.y - 20, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}
