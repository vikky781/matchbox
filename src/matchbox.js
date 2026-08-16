// Matchbox class - handles the outer sleeve and inner tray

export class Matchbox {
  constructor(x, y, screenWidth, screenHeight) {
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    // Dimensions (in pixels)
    this.sleeveWidth = 140;
    this.sleeveHeight = 55;
    this.sleeveDepth = 25;
    
    this.trayWidth = 130;
    this.trayHeight = 50;
    this.trayDepth = 22;
    
    // Tray slide state (0 = closed, 1 = fully open)
    this.traySlide = 0;
    this.trayTargetSlide = 0;
    this.trayVelocity = 0;
    
    // Interaction
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartSlide = 0;
    
    // Strike area (side of box)
    this.strikeAreaX = x - this.sleeveWidth / 2 + 15;
    this.strikeAreaY = y - this.sleeveHeight / 2 + 10;
    this.strikeWidth = 50;
    this.strikeHeight = 35;
    
    // Texture noise (generated once)
    this.textureNoise = this.generateTexture();
  }
  
  generateTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Base cardboard color
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 0, 200, 100);
    
    // Add subtle noise/texture
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 200;
      const y = Math.random() * 100;
      const alpha = Math.random() * 0.15;
      ctx.fillStyle = `rgba(${60 + Math.random() * 40}, ${40 + Math.random() * 30}, ${20 + Math.random() * 20}, ${alpha})`;
      ctx.fillRect(x, y, 2, 2);
    }
    
    // Add some fiber-like lines
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 200;
      const y = Math.random() * 100;
      const len = 5 + Math.random() * 15;
      const angle = Math.random() * Math.PI;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = `rgba(40, 30, 20, ${Math.random() * 0.1})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.restore();
    }
    
    return canvas;
  }
  
  resize(screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    // Reposition based on new screen size
    this.baseX = screenWidth * 0.5;
    this.baseY = screenHeight * 0.6;
    this.x = this.baseX;
    this.y = this.baseY;
    this.strikeAreaX = this.x - this.sleeveWidth / 2 + 15;
    this.strikeAreaY = this.y - this.sleeveHeight / 2 + 10;
  }
  
  reset() {
    this.x = this.baseX;
    this.y = this.baseY;
    this.traySlide = 0;
    this.trayTargetSlide = 0;
    this.trayVelocity = 0;
  }
  
  update(dt) {
    // Smooth tray sliding with physics
    const springForce = (this.trayTargetSlide - this.traySlide) * 0.15;
    this.trayVelocity += springForce;
    this.trayVelocity *= 0.85; // Damping
    this.traySlide += this.trayVelocity * dt;
    
    // Clamp
    if (this.traySlide < 0) {
      this.traySlide = 0;
      this.trayVelocity = 0;
    }
    if (this.traySlide > 1) {
      this.traySlide = 1;
      this.trayVelocity = 0;
    }
    
    // Update strike area position
    this.strikeAreaX = this.x - this.sleeveWidth / 2 + 15;
    this.strikeAreaY = this.y - this.sleeveHeight / 2 + 10;
  }
  
  startDrag(mouseX, mouseY) {
    const trayPos = this.getTrayPosition();
    const dx = mouseX - trayPos.x;
    const dy = mouseY - trayPos.y;
    
    // Check if clicking on tray
    if (Math.abs(dx) < this.trayWidth / 2 && Math.abs(dy) < this.trayHeight / 2) {
      this.isDragging = true;
      this.dragStartX = mouseX;
      this.dragStartSlide = this.traySlide;
    }
  }
  
  drag(mouseX, mouseY, dx, dy) {
    if (!this.isDragging) return;
    
    // Convert horizontal movement to slide amount
    const sensitivity = 0.005;
    this.trayTargetSlide = this.dragStartSlide + (mouseX - this.dragStartX) * sensitivity;
    this.trayTargetSlide = Math.max(0, Math.min(1, this.trayTargetSlide));
    
    // Play slide sound when moving
    if (Math.abs(dx) > 0.5 && this.trayVelocity > 0.01) {
      // Sound handled by main loop
    }
  }
  
  release() {
    this.isDragging = false;
  }
  
  getTrayPosition() {
    const slideOffset = this.traySlide * 80;
    return {
      x: this.x - slideOffset,
      y: this.y
    };
  }
  
  getInnerTrayPosition() {
    const trayPos = this.getTrayPosition();
    return {
      x: trayPos.x,
      y: trayPos.y + 5
    };
  }
  
  trayContains(mx, my) {
    const trayPos = this.getTrayPosition();
    const dx = mx - trayPos.x;
    const dy = my - trayPos.y;
    return Math.abs(dx) < this.trayWidth / 2 && Math.abs(dy) < this.trayHeight / 2;
  }
  
  getStrikeArea() {
    return {
      x: this.strikeAreaX + this.strikeWidth / 2,
      y: this.strikeAreaY + this.strikeHeight / 2
    };
  }
  
  draw(ctx) {
    const sleeveX = this.x;
    const sleeveY = this.y;
    
    // Calculate tray position
    const trayPos = this.getTrayPosition();
    
    // Draw shadow first
    this.drawShadow(ctx, sleeveX, sleeveY);
    
    // Draw inner tray (behind sleeve when closed, visible when open)
    this.drawTray(ctx, trayPos.x, trayPos.y);
    
    // Draw outer sleeve
    this.drawSleeve(ctx, sleeveX, sleeveY);
    
    // Draw strike area on side of sleeve
    this.drawStrikeArea(ctx, sleeveX, sleeveY);
  }
  
  drawShadow(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y + this.sleeveHeight / 2 + 5);
    
    const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 100);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 90, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  drawTray(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    
    // Tray body (wood/cardboard color)
    const trayGrad = ctx.createLinearGradient(-this.trayWidth/2, -this.trayHeight/2, 
                                               -this.trayWidth/2, this.trayHeight/2);
    trayGrad.addColorStop(0, '#A08060');
    trayGrad.addColorStop(1, '#705540');
    
    ctx.fillStyle = trayGrad;
    
    // Draw tray shape (open top box)
    ctx.beginPath();
    ctx.moveTo(-this.trayWidth/2, -this.trayHeight/2);
    ctx.lineTo(this.trayWidth/2, -this.trayHeight/2);
    ctx.lineTo(this.trayWidth/2 + 5, -this.trayHeight/2 + 10);
    ctx.lineTo(this.trayWidth/2 + 5, this.trayHeight/2);
    ctx.lineTo(-this.trayWidth/2 - 5, this.trayHeight/2);
    ctx.lineTo(-this.trayWidth/2 - 5, -this.trayHeight/2 + 10);
    ctx.closePath();
    ctx.fill();
    
    // Inner shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }
  
  drawSleeve(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    
    // Main sleeve body with gradient
    const sleeveGrad = ctx.createLinearGradient(-this.sleeveWidth/2, -this.sleeveHeight/2,
                                                 -this.sleeveWidth/2, this.sleeveHeight/2);
    sleeveGrad.addColorStop(0, '#C44536');
    sleeveGrad.addColorStop(0.5, '#A33226');
    sleeveGrad.addColorStop(1, '#8B251E');
    
    ctx.fillStyle = sleeveGrad;
    
    // Draw sleeve shape
    ctx.beginPath();
    ctx.rect(-this.sleeveWidth/2, -this.sleeveHeight/2, this.sleeveWidth, this.sleeveHeight);
    ctx.fill();
    
    // Add texture overlay
    ctx.globalAlpha = 0.3;
    ctx.drawImage(this.textureNoise, -this.sleeveWidth/2, -this.sleeveHeight/2, 
                  this.sleeveWidth, this.sleeveHeight);
    ctx.globalAlpha = 1;
    
    // Edge highlights/wear
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-this.sleeveWidth/2 + 2, -this.sleeveHeight/2 + 2, 
                   this.sleeveWidth - 4, this.sleeveHeight - 4);
    
    // Dark edge
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-this.sleeveWidth/2, -this.sleeveHeight/2, 
                   this.sleeveWidth, this.sleeveHeight);
    
    // Branding/label area (subtle)
    ctx.fillStyle = 'rgba(255, 240, 200, 0.15)';
    ctx.fillRect(-20, -8, 40, 16);
    
    // Subtle text suggestion (no actual readable text)
    ctx.strokeStyle = 'rgba(100, 80, 60, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();
    
    ctx.restore();
  }
  
  drawStrikeArea(ctx, x, y) {
    ctx.save();
    ctx.translate(x - this.sleeveWidth/2 + 15, y - this.sleeveHeight/2 + 10);
    
    // Dark rough striking surface
    const strikeGrad = ctx.createLinearGradient(0, 0, 0, this.strikeHeight);
    strikeGrad.addColorStop(0, '#2A1810');
    strikeGrad.addColorStop(0.5, '#3D2418');
    strikeGrad.addColorStop(1, '#2A1810');
    
    ctx.fillStyle = strikeGrad;
    ctx.fillRect(0, 0, this.strikeWidth, this.strikeHeight);
    
    // Add gritty texture
    for (let i = 0; i < 100; i++) {
      const px = Math.random() * this.strikeWidth;
      const py = Math.random() * this.strikeHeight;
      ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${60 + Math.random() * 30}, 
                           ${40 + Math.random() * 20}, ${0.3 + Math.random() * 0.3})`;
      ctx.fillRect(px, py, 2, 2);
    }
    
    // Rough edge
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.strikeWidth, this.strikeHeight);
    
    ctx.restore();
  }
}
