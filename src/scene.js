// TableScene - renders the wooden table surface with dynamic lighting

export class TableScene {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    
    // Generate wood texture
    this.woodTexture = this.generateWoodTexture();
  }
  
  generateWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base dark wood color
    const baseGrad = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
    baseGrad.addColorStop(0, '#3a2820');
    baseGrad.addColorStop(1, '#1a1210');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 512, 512);
    
    // Wood grain lines
    for (let i = 0; i < 100; i++) {
      const y = Math.random() * 512;
      const thickness = 0.5 + Math.random() * 2;
      const alpha = 0.05 + Math.random() * 0.1;
      
      ctx.strokeStyle = `rgba(${80 + Math.random() * 40}, ${50 + Math.random() * 30}, 
                               ${30 + Math.random() * 20}, ${alpha})`;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      
      // Wavy grain line
      let x = 0;
      while (x < 512) {
        const yOffset = Math.sin(x * 0.02 + i) * 5 + Math.sin(x * 0.05) * 3;
        if (x === 0) {
          ctx.moveTo(x, y + yOffset);
        } else {
          ctx.lineTo(x, y + yOffset);
        }
        x += 2;
      }
      ctx.stroke();
    }
    
    // Add some knots/imperfections
    for (let i = 0; i < 8; i++) {
      const kx = Math.random() * 512;
      const ky = Math.random() * 512;
      const kr = 5 + Math.random() * 15;
      
      const knotGrad = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
      knotGrad.addColorStop(0, 'rgba(60, 40, 30, 0.3)');
      knotGrad.addColorStop(0.7, 'rgba(50, 35, 25, 0.15)');
      knotGrad.addColorStop(1, 'rgba(40, 30, 20, 0)');
      
      ctx.fillStyle = knotGrad;
      ctx.beginPath();
      ctx.ellipse(kx, ky, kr, kr * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Subtle noise for texture
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.03;
      ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${70 + Math.random() * 40}, 
                           ${50 + Math.random() * 30}, ${alpha})`;
      ctx.fillRect(x, y, 2, 2);
    }
    
    return canvas;
  }
  
  resize(width, height) {
    this.width = width;
    this.height = height;
  }
  
  draw(ctx, flames) {
    // Draw base wood texture (tiled)
    const pattern = ctx.createPattern(this.woodTexture, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Apply vignette (darker edges)
    const vignetteGrad = ctx.createRadialGradient(
      this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.3,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7
    );
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Dynamic lighting from flames
    if (flames && flames.length > 0) {
      for (const flame of flames) {
        if (!flame.isDead && flame.life < flame.maxLife * 0.95) {
          this.drawFlameLighting(ctx, flame);
        }
      }
    }
  }
  
  drawFlameLighting(ctx, flame) {
    ctx.save();
    
    // Create warm glow from flame
    const intensity = 1 - (flame.life / flame.maxLife);
    
    // Main warm light
    const lightGrad = ctx.createRadialGradient(
      flame.x, flame.y, 10,
      flame.x, flame.y, 200
    );
    lightGrad.addColorStop(0, `rgba(255, 180, 100, ${0.15 * intensity})`);
    lightGrad.addColorStop(0.4, `rgba(255, 140, 60, ${0.08 * intensity})`);
    lightGrad.addColorStop(0.7, `rgba(255, 100, 30, ${0.03 * intensity})`);
    lightGrad.addColorStop(1, 'rgba(255, 50, 10, 0)');
    
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.arc(flame.x, flame.y, 200, 0, Math.PI * 2);
    ctx.fill();
    
    // Subtle highlight on "surface" below flame
    const highlightGrad = ctx.createRadialGradient(
      flame.x, flame.y + 30, 5,
      flame.x, flame.y + 30, 80
    );
    highlightGrad.addColorStop(0, `rgba(255, 200, 120, ${0.08 * intensity})`);
    highlightGrad.addColorStop(1, 'rgba(255, 150, 80, 0)');
    
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.ellipse(flame.x, flame.y + 30, 60, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}
