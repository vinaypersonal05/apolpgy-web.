document.addEventListener('DOMContentLoaded', () => {
  setupCursorGlow();
  setupStarfield();
  setupLoaderAndEnter();
  setupScrollReveal();
  setupEnvelopes();
  setupLastClick();
  setupBackgroundMusic();
});

/* =========================================================================
   1. CUSTOM CURSOR GLOW
   ========================================================================= */
function setupCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  // Track cursor position with a slight lag for high quality physics feel (lerp)
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    // Linear interpolation for smooth trailing effect
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;

    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }
  
  animateGlow();
}

/* =========================================================================
   2. CANVAS STARFIELD BACKGROUND (HIGH PERFORMANCE)
   ========================================================================= */
let triggerStarburst = false; // Triggered on final button click

function setupStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let stars = [];
  let burstStars = [];
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Star Class
  class Star {
    constructor(isBurst = false, angle = 0, speedFactor = 1) {
      this.isBurst = isBurst;
      this.reset(isBurst, angle, speedFactor);
    }

    reset(isBurst, angle, speedFactor) {
      if (isBurst) {
        // Starburst from center
        this.x = width / 2;
        this.y = height / 2;
        const velocity = (Math.random() * 5 + 2) * speedFactor;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        this.size = Math.random() * 2 + 1;
        this.color = `rgba(${170 + Math.random() * 85}, ${100 + Math.random() * 100}, 255, ${Math.random() * 0.5 + 0.5})`;
        this.alpha = 1;
        this.life = 0;
        this.maxLife = Math.random() * 100 + 50;
      } else {
        // Floating ambient stars
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.size = Math.random() * 1.5 + 0.3;
        this.alpha = Math.random() * 0.6 + 0.1;
        this.alphaDirection = Math.random() > 0.5 ? 0.005 : -0.005;
        this.color = '#ffffff';
      }
    }

    update() {
      if (this.isBurst) {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        // Fade out as it nears end of life
        this.alpha = 1 - (this.life / this.maxLife);
        if (this.life >= this.maxLife) {
          return false; // mark for deletion
        }
      } else {
        this.x += this.vx;
        this.y += this.vy;

        // Twinkle
        this.alpha += this.alphaDirection;
        if (this.alpha >= 0.8 || this.alpha <= 0.1) {
          this.alphaDirection = -this.alphaDirection;
        }

        // Keep inside screen bounds
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
      return true;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      if (this.isBurst) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.size * 5;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
  }

  // Initialize ambient stars
  const starCount = Math.floor((width * height) / 10000); // density scale
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star(false));
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = [];
    const newStarCount = Math.floor((width * height) / 10000);
    for (let i = 0; i < newStarCount; i++) {
      stars.push(new Star(false));
    }
  });

  // Main canvas animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw ambient stars
    stars.forEach(star => {
      star.update();
      star.draw();
    });

    // Draw burst stars if active
    if (triggerStarburst) {
      // Spawn burst stars
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        burstStars.push(new Star(true, angle, 1.5));
      }
      // Set trigger false once enough stars are spawned so it decays
      if (burstStars.length > 500) {
        triggerStarburst = false;
      }
    }

    // Filter out dead burst stars
    burstStars = burstStars.filter(star => {
      const active = star.update();
      if (active) star.draw();
      return active;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// Function to call to trigger burst
function triggerStarBurstExplosion() {
  triggerStarburst = true;
}

/* =========================================================================
   3. LOADER & PAGE ENTRANCE
   ========================================================================= */
function setupLoaderAndEnter() {
  const loader = document.getElementById('loader');
  const mainContent = document.getElementById('main-content');
  const heroReveal = document.querySelector('.hero-wrapper');
  
  if (!loader || !mainContent) return;

  // Let loading animation run for at least 3.2s to look authentic and beautiful
  setTimeout(() => {
    loader.classList.add('fade-out');
    mainContent.classList.remove('hidden');
    
    setTimeout(() => {
      mainContent.classList.add('visible');
      // Trigger Hero animations
      if (heroReveal) {
        heroReveal.classList.add('reveal-active');
      }
    }, 150);
  }, 3200);

  // Continue CTA scroll down
  const ctaBtn = document.getElementById('hero-cta');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      const targetSec = document.getElementById('realization');
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/* =========================================================================
   4. SCROLL REVEAL & COMPONENT ACTIVATIONS
   ========================================================================= */
function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        
        // Special animations depending on specific items revealed
        if (entry.target.classList.contains('realization-card')) {
          triggerTypewriter();
        }
        if (entry.target.classList.contains('system-card')) {
          triggerChangelogInstall();
        }
        
        // Unobserve to keep active
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

// Typewriting effect logic
let typewriterTriggered = false;
function triggerTypewriter() {
  if (typewriterTriggered) return;
  typewriterTriggered = true;

  const target = document.getElementById('typed-text');
  if (!target) return;

  const textToType = [
    "At that time, I thought I was just overthinking.",
    "Now I realize those repeated reassurance questions disturbed your personal space.",
    "I never wanted to make you uncomfortable.",
    "I'm genuinely sorry."
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let currentString = "";

  function typeChar() {
    if (lineIndex < textToType.length) {
      if (charIndex < textToType[lineIndex].length) {
        currentString += textToType[lineIndex].charAt(charIndex);
        target.innerHTML = currentString + '<span class="typed-cursor">|</span>';
        charIndex++;
        setTimeout(typeChar, Math.random() * 25 + 15); // realistic speeds
      } else {
        // Complete current line, append breaks
        currentString += "<br><br>";
        lineIndex++;
        charIndex = 0;
        setTimeout(typeChar, 700); // pause between statements
      }
    } else {
      // Remove typing cursor when done
      const cursor = target.querySelector('.typed-cursor');
      if (cursor) cursor.remove();
    }
  }

  // Small initial pause before typing begins
  setTimeout(typeChar, 800);
}

// OS system installation animation logic
let changelogTriggered = false;
function triggerChangelogInstall() {
  if (changelogTriggered) return;
  changelogTriggered = true;

  const listItems = document.querySelectorAll('.changelog-item');
  const progressFill = document.querySelector('.progress-bar-fill');
  
  if (!listItems.length || !progressFill) return;

  // Stagger item entry
  listItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add('reveal-list-item');
    }, index * 600 + 400);
  });

  // Fill up the progress bar
  setTimeout(() => {
    progressFill.classList.add('fill-active');
  }, listItems.length * 600 + 500);
}

/* =========================================================================
   5. INTERACTIVE ENVELOPES
   ========================================================================= */
function setupEnvelopes() {
  const wrappers = document.querySelectorAll('.envelope-wrapper');
  
  wrappers.forEach(wrap => {
    wrap.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent closure by body
      
      const isOpen = wrap.classList.contains('open');
      
      // Close all other open envelopes first
      wrappers.forEach(other => {
        if (other !== wrap) {
          other.classList.remove('open');
        }
      });

      // Toggle state
      if (isOpen) {
        wrap.classList.remove('open');
      } else {
        wrap.classList.add('open');
      }
    });
  });

  // Close envelopes on click outside
  document.body.addEventListener('click', () => {
    wrappers.forEach(wrap => wrap.classList.remove('open'));
  });
}

/* =========================================================================
   6. LAST CLICK BURST & FINAL OVERLAY MESSAGE
   ========================================================================= */
function setupLastClick() {
  const lastBtn = document.getElementById('last-click-btn');
  const overlay = document.getElementById('stars-overlay');
  const closeBtn = document.getElementById('overlay-close');

  if (!lastBtn || !overlay) return;

  lastBtn.addEventListener('click', () => {
    // 1. Fire canvas starburst
    triggerStarBurstExplosion();
    
    // Fade background music down to emphasize the final message
    if (window.fadeAudioDown) {
      window.fadeAudioDown(2000, 0.12);
    }
    
    // 2. Open overlay with smooth transition
    setTimeout(() => {
      overlay.classList.remove('hidden');
      setTimeout(() => {
        overlay.classList.add('visible');
      }, 50);
    }, 400);
  });

  const closeOverlay = () => {
    overlay.classList.remove('visible');
    
    // Fade music back up to regular volume
    if (window.fadeAudioUp) {
      window.fadeAudioUp(1500, 0.35);
    }
    
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 1500);
  };

  closeBtn.addEventListener('click', closeOverlay);
  
  // Close on Escape key press
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      closeOverlay();
    }
  });
}

/* =========================================================================
   7. BACKGROUND MUSIC (FADE-IN / FADE-OUT / INTERACTIVE CONTROLS)
   ========================================================================= */
function setupBackgroundMusic() {
  const music = document.getElementById('bg-music');
  const toggleBtn = document.getElementById('music-toggle');
  
  if (!music || !toggleBtn) return;
  
  // Set initial volume to 0 for smooth fade-in
  music.volume = 0;
  
  let musicStarted = false;

  // Fade-in audio
  function fadeInAudio(duration = 2000, targetVolume = 0.35) {
    music.play().then(() => {
      toggleBtn.classList.remove('paused');
      
      let start = null;
      function step(timestamp) {
        if (!start) start = timestamp;
        let progress = timestamp - start;
        let vol = Math.min((progress / duration) * targetVolume, targetVolume);
        music.volume = vol;
        if (progress < duration && !music.paused) {
          window.requestAnimationFrame(step);
        }
      }
      window.requestAnimationFrame(step);
    }).catch(err => {
      console.log("Autoplay blocked. Waiting for user interaction.");
    });
  }

  // Fade-out/down audio
  window.fadeAudioDown = function(duration = 2000, targetVolume = 0.12) {
    if (music.paused) return;
    let startVolume = music.volume;
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      let progress = timestamp - start;
      let vol = Math.max(startVolume - (progress / duration) * (startVolume - targetVolume), targetVolume);
      music.volume = vol;
      if (progress < duration && !music.paused) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  };

  // Fade audio up
  window.fadeAudioUp = function(duration = 2000, targetVolume = 0.35) {
    if (music.paused) return;
    let startVolume = music.volume;
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      let progress = timestamp - start;
      let vol = Math.min(startVolume + (progress / duration) * (targetVolume - startVolume), targetVolume);
      music.volume = vol;
      if (progress < duration && !music.paused) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  };

  // Start music on first interaction
  function startMusicOnInteraction() {
    if (musicStarted) return;
    musicStarted = true;
    fadeInAudio(2500, 0.35);
    
    // Remove listeners once music starts
    document.removeEventListener('click', startMusicOnInteraction);
    document.removeEventListener('keydown', startMusicOnInteraction);
    document.removeEventListener('touchstart', startMusicOnInteraction);
  }

  // Listen to user interaction to trigger audio
  document.addEventListener('click', startMusicOnInteraction);
  document.addEventListener('keydown', startMusicOnInteraction);
  document.addEventListener('touchstart', startMusicOnInteraction);

  // Manual Toggle Button
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent triggering body clicks
    if (music.paused) {
      fadeInAudio(1500, 0.35);
    } else {
      music.pause();
      toggleBtn.classList.add('paused');
    }
  });
}
