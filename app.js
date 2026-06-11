document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const typewriterText = document.getElementById('typewriter-text');
  
  // Evasion Game Elements
  const noBtn = document.getElementById('no-btn');
  const yesBtn = document.getElementById('yes-btn');
  const evasionGame = document.getElementById('evasion-game');
  const successScreen = document.getElementById('success-screen');
  const windowContent = document.querySelector('.window-content');
  const canvas = document.getElementById('celebration-canvas');
  const ctx = canvas.getContext('2d');
  
  // Virtual Hug Elements
  const sendHugBtn = document.getElementById('send-hug-btn');
  const hugAvatar = document.getElementById('hug-avatar');
  const hugParticlesContainer = document.getElementById('hug-particles');

  // State
  let typewriterInterval = null;
  let hasTypewriterRun = false;
  let canvasAnimationId = null;
  let particles = [];

  // Tab switching logic
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Update buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update panes
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === targetTab) {
          pane.classList.add('active');
        }
      });

      // Special Tab Actions
      if (targetTab === 'letter-tab') {
        startTypewriter();
      } else {
        stopTypewriter();
      }

      // Resize canvas if switching to game tab
      if (targetTab === 'game-tab') {
        resizeCanvas();
      }
    });
  });

  // Typewriter Letter
  const letterMessage = `Dear Manu,\n\nI'm so incredibly sorry for upsetting you. I value our friendship more than anything in the world, and seeing you mad breaks my heart. 💔\n\nI really didn't mean to make you feel bad. You mean so much to me, and I want to make things right. Bohat badi galti ki hai ye jo bhi mein kar rha hu vo bohat chotti cheez hai lekin just remember one thing I will always have that love and care for u samjhi ? I am sorry for being rude itna bacchu i really didnt meant ..Tu sabse acchi hai sabse acchi ..Manudiii i am sorry for pushing u away i wont kabhi bhi ...Nver Fkin never .. Please *ho ske to mujhe maaf karna*\n\nTogether we stay\nTogether we fix\n\nGo to the next tab, I have a very important question for you...`;

  function startTypewriter() {
    if (hasTypewriterRun) return; // Only type once automatically, or let it finish
    stopTypewriter();
    
    let index = 0;
    typewriterText.innerHTML = '';
    
    typewriterInterval = setInterval(() => {
      if (index < letterMessage.length) {
        const char = letterMessage[index];
        if (char === '\n') {
          typewriterText.innerHTML += '<br>';
        } else {
          typewriterText.innerHTML += char;
        }
        index++;
      } else {
        clearInterval(typewriterInterval);
        hasTypewriterRun = true;
      }
    }, 35); // Fast, readable pace
  }

  function stopTypewriter() {
    if (typewriterInterval) {
      clearInterval(typewriterInterval);
    }
  }

  // Slap sound synthesis (Web Audio API)
  function playSlapSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Short white noise burst for slap splash
      const bufferSize = audioCtx.sampleRate * 0.08; // 80ms
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      noise.start();
      
      // Decaying triangle wave for physical impact punch
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + 0.08);
      
      oscGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      
      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.log("Web Audio not allowed until interaction", e);
    }
  }

  // Success arpeggio synthesizer
  function playUnlockSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C major arpeggio
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } catch (e) {
      console.log(e);
    }
  }

  // Slap Game Variables & Logic
  let slapCount = 0;
  const maxSlaps = 10;
  const slapScreen = document.getElementById('slap-screen');
  const slapContainer = document.querySelector('.slap-image-container');
  const slapCounter = document.getElementById('slap-counter');
  const slapProgress = document.getElementById('slap-progress');
  const mainApp = document.getElementById('main-app');

  if (slapContainer) {
    slapContainer.addEventListener('click', handleSlap);
    slapContainer.addEventListener('touchstart', (e) => {
      // Touchstart is used for immediate mobile feedback
      e.preventDefault();
      handleSlap(e);
    });
  }

  function handleSlap(e) {
    if (slapCount >= maxSlaps) return;
    
    slapCount++;
    playSlapSound();
    
    // Slap animation direction
    const direction = slapCount % 2 === 0 ? 'slap-left' : 'slap-right';
    slapContainer.classList.remove('slap-left', 'slap-right');
    void slapContainer.offsetWidth; // Force Reflow
    slapContainer.classList.add(direction);
    
    // Spawn slap emoji floating text
    spawnSlapHand(e);
    
    // Update progress elements
    slapCounter.textContent = `Slaps: ${slapCount} / ${maxSlaps}`;
    slapProgress.style.width = `${(slapCount / maxSlaps) * 100}%`;
    
    // Game completed trigger
    if (slapCount === maxSlaps) {
      setTimeout(() => {
        playUnlockSound();
      }, 150);
      
      setTimeout(() => {
        // Slide out slap game overlay
        slapScreen.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        slapScreen.style.opacity = '0';
        slapScreen.style.transform = 'scale(0.9)';
        
        // Unhide and slide in the main OS app
        mainApp.style.display = 'block';
        mainApp.style.opacity = '0';
        mainApp.style.transform = 'translateY(30px)';
        void mainApp.offsetWidth; // Reflow
        
        mainApp.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        mainApp.style.opacity = '1';
        mainApp.style.transform = 'translateY(0)';
        
        setTimeout(() => {
          slapScreen.remove();
          startTypewriter(); // Trigger typewriter now!
        }, 600);
      }, 800);
    }
  }

  function spawnSlapHand(e) {
    const rect = slapContainer.getBoundingClientRect();
    
    // Get click location relative to image box
    let clickX, clickY;
    if (e.touches && e.touches.length > 0) {
      clickX = e.touches[0].clientX - rect.left;
      clickY = e.touches[0].clientY - rect.top;
    } else if (e.clientX !== undefined) {
      clickX = e.clientX - rect.left;
      clickY = e.clientY - rect.top;
    } else {
      // Fallback if not click coordinates (e.g. keyboard triggers)
      clickX = rect.width / 2;
      clickY = rect.height / 2;
    }
    
    const hand = document.createElement('div');
    hand.className = 'slap-hand';
    
    const slapEffects = ['👋', '💥', 'SLAP!', 'Ouch!', '👋', '💥', '🤕'];
    hand.textContent = slapEffects[Math.floor(Math.random() * slapEffects.length)];
    
    const rotAngle = Math.random() * 60 - 30; // -30deg to 30deg
    hand.style.setProperty('--rot', `${rotAngle}deg`);
    hand.style.left = `${clickX}px`;
    hand.style.top = `${clickY}px`;
    
    document.getElementById('slap-effects').appendChild(hand);
    
    setTimeout(() => {
      hand.remove();
    }, 500);
  }

  // Runaway "No" Button Math & Logic
  function moveNoButton(e) {
    // We want the button to jump somewhere within the windowContent container
    const contentRect = windowContent.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    // Padding from the edge of the windowContent
    const padding = 15;
    
    // Bounds relative to the content area
    const minX = padding;
    const maxX = contentRect.width - btnRect.width - padding;
    const minY = padding;
    const maxY = contentRect.height - btnRect.height - padding;

    // Get pointer coordinates relative to content box
    let pointerX, pointerY;
    if (e.touches && e.touches.length > 0) {
      pointerX = e.touches[0].clientX - contentRect.left;
      pointerY = e.touches[0].clientY - contentRect.top;
    } else {
      pointerX = e.clientX - contentRect.left;
      pointerY = e.clientY - contentRect.top;
    }

    let newX, newY;
    let attempts = 0;
    const maxAttempts = 15;
    const minDistance = 80; // Distance to keep away from pointer

    // Evasion loop: find a point not too close to the mouse pointer
    do {
      newX = Math.random() * (maxX - minX) + minX;
      newY = Math.random() * (maxY - minY) + minY;
      attempts++;
    } while (
      attempts < maxAttempts &&
      Math.hypot(newX + btnRect.width / 2 - pointerX, newY + btnRect.height / 2 - pointerY) < minDistance
    );

    // Position the button absolutely
    noBtn.style.position = 'absolute';
    noBtn.style.transition = 'none'; // Instant movement so it's unclickable
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
  }

  // Evasion Triggers: Mouse hover (desktop) & Touch start (mobile)
  noBtn.addEventListener('mouseenter', moveNoButton);
  noBtn.addEventListener('mousemove', moveNoButton);
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Stop click emulation
    moveNoButton(e);
  });

  // Success Celebration: Canvas Confetti & Hearts
  yesBtn.addEventListener('click', () => {
    // Fade out game controls, show success card
    evasionGame.style.display = 'none';
    successScreen.style.display = 'flex';
    
    // Fire the confetti!
    resizeCanvas();
    initCelebration();
  });

  // Window resize handler for canvas
  function resizeCanvas() {
    const rect = windowContent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  window.addEventListener('resize', resizeCanvas);

  // Confetti Particle Class
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 8 + 6;
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * -8 - 4; // Shoot upwards
      this.gravity = 0.25;
      
      // Color Palette: Warm pinks, lavender, soft yellow
      const colors = ['#ff7597', '#ffb59f', '#a38bfc', '#ffd6e0', '#ffccd5', '#ffe5ec'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      // Shape: circle (confetti) or heart
      this.shape = Math.random() > 0.4 ? 'heart' : 'circle';
      this.opacity = 1;
      this.fade = Math.random() * 0.01 + 0.005;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = Math.random() * 0.1 - 0.05;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.opacity -= this.fade;
      this.rotation += this.rotationSpeed;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;

      if (this.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw heart
        ctx.beginPath();
        const topY = -this.size / 2;
        ctx.moveTo(0, topY + this.size / 4);
        // Left curve
        ctx.bezierCurveTo(-this.size/2, topY - this.size/4, -this.size, topY + this.size/3, 0, this.size/2 + topY);
        // Right curve
        ctx.bezierCurveTo(this.size, topY + this.size/3, this.size/2, topY - this.size/4, 0, topY + this.size/4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function initCelebration() {
    // Generate bursts of particles from the button group area (center-ish)
    const startX = canvas.width / 2;
    const startY = canvas.height * 0.7;
    
    particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle(startX, startY));
    }
    
    // Start loop
    if (canvasAnimationId) cancelAnimationFrame(canvasAnimationId);
    animateCelebration();
  }

  function animateCelebration() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw & update particles
    particles = particles.filter(p => p.opacity > 0);
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Spawn minor secondary particles from bottom edges for dynamic effect
    if (particles.length > 0) {
      if (Math.random() < 0.2) {
        particles.push(new Particle(Math.random() * canvas.width, canvas.height));
      }
      canvasAnimationId = requestAnimationFrame(animateCelebration);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Virtual Hug Emitter
  sendHugBtn.addEventListener('click', () => {
    // Bounce Mascot
    hugAvatar.style.transform = 'scale(0.85)';
    setTimeout(() => {
      hugAvatar.style.transform = 'scale(1.15) rotate(10deg)';
      setTimeout(() => {
        hugAvatar.style.transform = 'scale(1) rotate(0deg)';
      }, 200);
    }, 100);

    // Spawn floating HTML emojis
    const emojis = ['🤗', '💖', '🌸', '🧸', '✨', '💕', '💗', '🎈'];
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Random style variables
        const drift = Math.random() * 120 - 60; // -60px to 60px horizontal drift
        const rot = Math.random() * 90 - 45; // rotation angle
        const startLeft = Math.random() * 70 + 15; // 15% to 85% width
        const size = Math.random() * 0.8 + 0.8; // 0.8rem to 1.6rem
        
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.left = `${startLeft}%`;
        particle.style.fontSize = `${size}rem`;
        particle.style.setProperty('--drift', `${drift}px`);
        particle.style.setProperty('--rot', `${rot}deg`);
        
        // Spawn inside the container
        hugParticlesContainer.appendChild(particle);
        
        // Remove after animation finishes
        setTimeout(() => {
          particle.remove();
        }, 4000);
      }, i * 150); // Cascade spawn
    }
  });

  // Handle window control buttons close/minimize interactions
  const dots = document.querySelectorAll('.dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      // Add a cool window-shake animation
      const apologyWindow = document.getElementById('apology-window');
      apologyWindow.style.transform = 'scale(0.96) rotate(-1deg)';
      setTimeout(() => {
        apologyWindow.style.transform = 'scale(1.02) rotate(1deg)';
        setTimeout(() => {
          apologyWindow.style.transform = 'translateY(0) scale(1) rotate(0deg)';
        }, 150);
      }, 150);
    });
  });
});
