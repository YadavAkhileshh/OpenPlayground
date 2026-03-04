// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // Set initial canvas size
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.75;

  // DOM Elements - access them after DOM is loaded
  const gravitySlider = document.getElementById("gravitySlider");
  const addBallBtn = document.getElementById("addBall");
  const resetBtn = document.getElementById("reset");

  // Physics parameters
  let gravity = parseFloat(gravitySlider.value);
  let balls = [];
  let animationId = null;
  let isAnimating = false;

  // Update gravity from slider
  gravitySlider.addEventListener("input", () => {
    gravity = parseFloat(gravitySlider.value);
  });

  // Add ball with better visual feedback
  addBallBtn.addEventListener("click", () => {
    createBall();
    
    // Add click animation feedback
    addBallBtn.style.transform = "scale(0.95)";
    setTimeout(() => {
      addBallBtn.style.transform = "";
    }, 150);
    
    // Ensure animation is running
    if (!isAnimating) {
      startAnimation();
    }
  });

  // Reset with confirmation
  resetBtn.addEventListener("click", () => {
    if (balls.length > 0) {
      if (confirm("Are you sure you want to remove all balls?")) {
        balls = [];
        // Reset button animation
        resetBtn.style.transform = "scale(0.95)";
        setTimeout(() => {
          resetBtn.style.transform = "";
        }, 150);
      }
    }
  });

  // Ball class with improved physics
  class Ball {
    constructor(x, y, radius, color) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.dy = (Math.random() * 3) + 1; // Initial vertical velocity
      this.dx = (Math.random() - 0.5) * 6; // Initial horizontal velocity
      this.bounce = 0.7 + Math.random() * 0.2; // Random bounce between 0.7-0.9
      this.friction = 0.99; // Air resistance
      this.glow = false;
      this.glowTimer = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      
      // Add glow effect for new balls
      if (this.glow && this.glowTimer > 0) {
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        this.glowTimer--;
      }
      
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    }

    update() {
      // Apply gravity
      this.dy += gravity;
      
      // Apply air resistance
      this.dy *= this.friction;
      this.dx *= this.friction;
      
      // Update position
      this.y += this.dy;
      this.x += this.dx;

      // Floor collision with energy loss
      if (this.y + this.radius > canvas.height) {
        this.y = canvas.height - this.radius;
        this.dy *= -this.bounce;
        
        // Stop very small bounces
        if (Math.abs(this.dy) < 0.5) {
          this.dy = 0;
        }
        
        // Horizontal friction on bounce
        this.dx *= 0.95;
      }

      // Wall collision
      if (this.x + this.radius > canvas.width) {
        this.x = canvas.width - this.radius;
        this.dx *= -this.bounce;
      }
      
      if (this.x - this.radius < 0) {
        this.x = this.radius;
        this.dx *= -this.bounce;
      }

      // Prevent balls from getting stuck at bottom
      if (this.y >= canvas.height - this.radius && this.dy === 0) {
        this.dy = 0;
        this.y = canvas.height - this.radius;
      }

      this.draw();
    }
  }

  function randomColor() {
    const hue = Math.random() * 360;
    const saturation = 80 + Math.random() * 20;
    const lightness = 50 + Math.random() * 10;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  function createBall() {
    const radius = Math.random() * 25 + 15; // 15-40px radius
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = 50;
    const newBall = new Ball(x, y, radius, randomColor());
    newBall.glow = true;
    newBall.glowTimer = 30; // Glow for 0.5 seconds at 60fps
    
    balls.push(newBall);
    console.log(`Ball added! Total balls: ${balls.length}`);
    
    // Immediate visual feedback - draw the ball once
    newBall.draw();
  }

  function startAnimation() {
    if (!isAnimating) {
      isAnimating = true;
      animate();
    }
  }

  function animate() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw all balls
    balls.forEach(ball => ball.update());
    
    // Draw ball counter
    if (balls.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 14px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Balls: ${balls.length}`, 15, 25);
      ctx.fillText(`Gravity: ${gravity.toFixed(2)}`, 15, 45);
    } else {
      // Draw empty state message
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '20px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click "Add Ball" to start the animation!', canvas.width / 2, canvas.height / 2);
      ctx.font = '16px "Segoe UI", sans-serif';
      ctx.fillText('You can also press Space or A key', canvas.width / 2, canvas.height / 2 + 30);
      ctx.fillText('Use the slider to adjust gravity', canvas.width / 2, canvas.height / 2 + 60);
    }
    
    // Continue animation if we have balls
    if (balls.length > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      isAnimating = false;
    }
  }

  // Draw initial empty state
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '20px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Click "Add Ball" to start the animation!', canvas.width / 2, canvas.height / 2);
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText('You can also press Space or A key', canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText('Use the slider to adjust gravity', canvas.width / 2, canvas.height / 2 + 60);

  // Resize canvas with debouncing
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;
      
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.75;
      
      // Adjust ball positions to new canvas size
      if (balls.length > 0) {
        const scaleX = canvas.width / oldWidth;
        const scaleY = canvas.height / oldHeight;
        
        balls.forEach(ball => {
          ball.x *= scaleX;
          ball.y *= scaleY;
          
          // Ensure balls stay within bounds
          if (ball.x + ball.radius > canvas.width) ball.x = canvas.width - ball.radius;
          if (ball.x - ball.radius < 0) ball.x = ball.radius;
          if (ball.y + ball.radius > canvas.height) ball.y = canvas.height - ball.radius;
        });
      }
      
      // Redraw current state
      if (!isAnimating) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (balls.length > 0) {
          balls.forEach(ball => ball.draw());
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 14px "Segoe UI", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`Balls: ${balls.length}`, 15, 25);
          ctx.fillText(`Gravity: ${gravity.toFixed(2)}`, 15, 45);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '20px "Segoe UI", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Click "Add Ball" to start the animation!', canvas.width / 2, canvas.height / 2);
          ctx.font = '16px "Segoe UI", sans-serif';
          ctx.fillText('You can also press Space or A key', canvas.width / 2, canvas.height / 2 + 30);
          ctx.fillText('Use the slider to adjust gravity', canvas.width / 2, canvas.height / 2 + 60);
        }
      }
    }, 100);
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Prevent spacebar from scrolling page
    if (e.code === 'Space' || e.code === 'KeyA') {
      e.preventDefault();
      createBall();
      
      if (!isAnimating) {
        startAnimation();
      }
    }
    
    if (e.code === 'Escape') {
      balls = [];
      isAnimating = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // Redraw empty state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '20px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('All balls cleared!', canvas.width / 2, canvas.height / 2);
      ctx.font = '16px "Segoe UI", sans-serif';
      ctx.fillText('Click "Add Ball" or press Space/A to add new balls', canvas.width / 2, canvas.height / 2 + 30);
    }
  });

  // Initial tooltip
  console.log('Physics Animation Playground Ready!');
  console.log('Controls:');
  console.log('- Click "Add Ball" or press Space/A key to add balls');
  console.log('- Use slider to adjust gravity');
  console.log('- Press Escape to clear all balls');
});