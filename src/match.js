// Match class - represents a single matchstick

export class Match {
  constructor(x, y, rotation = 0) {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    
    // Dimensions
    this.length = 70;
    this.width = 4;
    this.headRadius = 5;
    
    // State
    this.isHeld = false;
    this.isLit = false;
    this.isBurntOut = false;
    this.burnProgress = 0;
    
    // Physics
    this.velocityX = 0;
    this.velocityY = 0;
    this.angularVelocity = 0;
    this.lastX = x;
    this.lastY = y;
    
    // Burn characteristics
    this.burnRate = 0.0003; // How fast it burns
    this.maxBurnLength = 50; // How much of the stick can burn
  }
  
  pickUp() {
    this.isHeld = true;
  }
  
  release() {
    this.isHeld = false;
    // Add slight throw velocity based on recent movement
  }
  
  drag(x, y, dx, dy) {
    if (!this.isHeld) return;
    
    this.x = x;
    this.y = y;
    
    // Track velocity for strike detection
    this.velocityX = dx * 0.5;
    this.velocityY = dy * 0.5;
    
    // Slight rotation based on movement
    this.rotation += dx * 0.002;
  }
  
  update(dt, matchbox) {
    // Store last position for velocity calculation
    const prevX = this.x;
    const prevY = this.y;
    
    if (!this.isHeld) {
      // Apply friction when not held
      this.velocityX *= 0.92;
      this.velocityY *= 0.92;
      this.angularVelocity *= 0.9;
      
      // Move based on velocity
      this.x += this.velocityX * dt;
      this.y += this.velocityY * dt;
      this.rotation += this.angularVelocity * dt;
      
      // Table friction
      if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
      if (Math.abs(this.velocityY) < 0.1) this.velocityY = 0;
    }
    
    // Update last position
    this.lastX = prevX;
    this.lastY = prevY;
    
    // Handle burning
    if (this.isLit && !this.isBurntOut) {
      this.burnProgress += dt * this.burnRate;
      
      if (this.burnProgress >= 1) {
        this.extinguish();
        this.isBurntOut = true;
      }
    }
  }
  
  ignite() {
    this.isLit = true;
    this.burnProgress = 0;
  }
  
  extinguish() {
    this.isLit = false;
    this.isBurntOut = true;
  }
  
  getVelocity() {
    return {
      x: this.velocityX,
      y: this.velocityY
    };
  }
  
  getHeadPosition() {
    // Head is at one end of the match
    const headOffset = this.length / 2 - 5;
    return {
      x: this.x + Math.cos(this.rotation) * headOffset,
      y: this.y + Math.sin(this.rotation) * headOffset
    };
  }
  
  contains(mx, my) {
    // Simple bounding box check with rotation consideration
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    
    // Transform point to match's local space
    const dx = mx - this.x;
    const dy = my - this.y;
    
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    
    return Math.abs(localX) < this.length / 2 + 5 && 
           Math.abs(localY) < this.width / 2 + 5;
  }
  
  worldToLocal(wx, wy) {
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    
    const dx = wx - this.x;
    const dy = wy - this.y;
    
    return {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos
    };
  }
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Draw stick
    const stickGrad = ctx.createLinearGradient(-this.length/2, 0, this.length/2, 0);
    
    if (this.isBurntOut) {
      // Charred stick
      const burntLength = this.burnProgress * this.maxBurnLength;
      
      // Burnt portion (black/dark gray)
      stickGrad.addColorStop(0, '#1a1a1a');
      stickGrad.addColorStop(Math.min(1, burntLength / this.length), '#2a2a2a');
      
      // Unburnt portion (if any remains)
      if (burntLength < this.length) {
        stickGrad.addColorStop(burntLength / this.length + 0.05, '#D4A574');
        stickGrad.addColorStop(1, '#C49564');
      }
    } else {
      // Fresh wooden stick
      stickGrad.addColorStop(0, '#E8C890');
      stickGrad.addColorStop(0.5, '#D4A574');
      stickGrad.addColorStop(1, '#C49564');
    }
    
    ctx.fillStyle = stickGrad;
    ctx.beginPath();
    ctx.roundRect(-this.length/2, -this.width/2, this.length, this.width, 2);
    ctx.fill();
    
    // Wood grain lines
    ctx.strokeStyle = 'rgba(100, 70, 40, 0.2)';
    ctx.lineWidth = 0.5;
    for (let i = -this.length/2 + 5; i < this.length/2 - 5; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, -this.width/4);
      ctx.lineTo(i + 3, this.width/4);
      ctx.stroke();
    }
    
    // Draw match head
    const headX = this.length/2 - 5;
    
    if (this.isLit && !this.isBurntOut) {
      // Glowing ember at head
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.arc(headX, 0, this.headRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner glow
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.arc(headX, 0, this.headRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.isBurntOut) {
      // Burnt head
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(headX, 0, this.headRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Subtle red glow if recently extinguished
      if (this.burnProgress < 0.1) {
        ctx.fillStyle = 'rgba(255, 100, 50, 0.3)';
        ctx.beginPath();
        ctx.arc(headX, 0, this.headRadius * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Fresh match head (dark red/brown)
      const headGrad = ctx.createRadialGradient(headX - 1, 0, 0, headX, 0, this.headRadius);
      headGrad.addColorStop(0, '#8B3528');
      headGrad.addColorStop(0.7, '#6B2518');
      headGrad.addColorStop(1, '#4B1510');
      
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(headX, 0, this.headRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 200, 180, 0.2)';
      ctx.beginPath();
      ctx.arc(headX - 1.5, -1.5, this.headRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}
