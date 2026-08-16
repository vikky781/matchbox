// Smoke class - procedural smoke simulation

export class Smoke {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    this.isDead = false;
    this.age = 0;
    this.maxAge = 120 + Math.random() * 60; // 2-3 seconds
    
    // Smoke particles
    this.particles = [];
    const numParticles = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numParticles; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + Math.random() * 10,
        vx: (Math.random() - 0.5) * 15,
        vy: -20 - Math.random() * 20,
        radius: 3 + Math.random() * 6,
        alpha: 0.15 + Math.random() * 0.15,
        age: i * 5, // Staggered start
        maxAge: 60 + Math.random() * 40
      });
    }
    
    // Curl direction
    this.curlDirection = Math.random() < 0.5 ? 1 : -1;
    this.curlSpeed = 0.5 + Math.random() * 0.5;
  }
  
  update(dt) {
    this.age += dt;
    
    if (this.age >= this.maxAge) {
      this.isDead = true;
      return;
    }
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      
      if (p.age >= p.maxAge) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Rise upward with curl
      p.y += p.vy * dt * 0.016;
      p.x += p.vx * dt * 0.016;
      
      // Add curl/wobble
      const curl = Math.sin(p.age * 0.05) * this.curlDirection * this.curlSpeed;
      p.x += curl * dt;
      
      // Slow down horizontal movement
      p.vx *= 0.98;
      
      // Expand slightly
      p.radius += 0.02 * dt;
      
      // Fade out
      p.alpha = (1 - p.age / p.maxAge) * 0.2;
    }
    
    // Check if all particles are gone
    if (this.particles.length === 0 && this.age > 30) {
      this.isDead = true;
    }
  }
  
  draw(ctx) {
    ctx.save();
    
    // Soft blending for smoke
    ctx.globalCompositeOperation = 'screen';
    
    for (const p of this.particles) {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, `rgba(180, 180, 185, ${p.alpha})`);
      grad.addColorStop(0.5, `rgba(150, 150, 155, ${p.alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(100, 100, 105, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}
