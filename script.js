/* ========================================================
   CRAFTING SCRAPBOOK ENGINE - MEN'S DAY SPECIAL
   ======================================================== */

// Global State
let currentStep = 1;
const totalSteps = 5;
let isAudioPlaying = false;
let isMuted = false;
let audioContext = null;
let synthInterval = null;

// DOM Elements
const audioElement = document.getElementById('audioElement');
const playIcon = document.getElementById('playIcon');
const vinylDisc = document.getElementById('vinylDisc');
const soundWaves = document.getElementById('soundWaves');
const progressBarFill = document.getElementById('progressBarFill');
const progressHandle = document.getElementById('progressHandle');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const soundBtn = document.getElementById('bgSoundBtn');

// ========================================================
// 1. STEP NAVIGATION & TABS
// ========================================================

function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > totalSteps) return;

  // Sound effect
  playChimeSound(440, 'triangle', 0.15);

  // Hide all steps
  document.querySelectorAll('.scrapbook-page').forEach(page => {
    page.classList.remove('active');
  });

  // Remove active from all tabs
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.classList.remove('active');
  });

  // Activate target step
  const targetPage = document.getElementById(`step${stepNumber}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Activate target tab button
  const targetTab = document.querySelector(`.tab-btn[data-step="${stepNumber}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  currentStep = stepNumber;

  // Smooth scroll up to top of scrapbook
  window.scrollTo({
    top: 50,
    behavior: 'smooth'
  });

  // Trigger special animations based on step
  if (stepNumber === 1) {
    // Little sparkle
  } else if (stepNumber === 3) {
    // Sparkle prompt
  } else if (stepNumber === 5) {
    // Gentle confetti welcome to gallery
    fireLittleSparkles();
  }
}

// Click on tab buttons directly
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const step = parseInt(btn.getAttribute('data-step'));
    goToStep(step);
  });
});

// Interactive Gift Box on Slide 1
const giftBoxTrigger = document.getElementById('giftBoxTrigger');
if (giftBoxTrigger) {
  giftBoxTrigger.addEventListener('click', () => {
    // Fire confetti from gift box
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ff7597', '#ffb3c6', '#ffffff', '#ff4d6d']
    });
    playCelebrationChime();

    setTimeout(() => {
      goToStep(2);
    }, 700);
  });
}

// ========================================================
// 2. PROMISE CARDS FLIP INTERACTION
// ========================================================

function flipPromise(cardElement) {
  cardElement.classList.toggle('flipped');
  playChimeSound(587.33, 'sine', 0.2); // D5 note
}

// ========================================================
// 3. SPOTIFY PLAYER & AUDIO SYSTEM
// ========================================================

function toggleAudioPlay() {
  if (isAudioPlaying) {
    pauseAudio();
  } else {
    startAudio();
  }
}

function startAudio() {
  isAudioPlaying = true;
  playIcon.classList.remove('fa-play');
  playIcon.classList.add('fa-pause');
  vinylDisc.classList.add('playing');
  soundWaves.classList.add('active');

  // If a real audio source is set, play it
  if (audioElement.src && audioElement.src !== window.location.href) {
    audioElement.play().catch(e => {
      console.log('Autoplay restriction or file not found, running web-audio lofi synth');
      startLofiSynth();
    });
  } else {
    // Fallback: Synthesize a sweet relaxing lo-fi background melody
    startLofiSynth();
  }
}

function pauseAudio() {
  isAudioPlaying = false;
  playIcon.classList.remove('fa-pause');
  playIcon.classList.add('fa-play');
  vinylDisc.classList.remove('playing');
  soundWaves.classList.remove('active');

  if (audioElement) {
    audioElement.pause();
  }
  stopLofiSynth();
}

function restartTrack() {
  if (audioElement && audioElement.src) {
    audioElement.currentTime = 0;
  }
  updateProgressBar(0, 100);
  playChimeSound(523.25, 'sine', 0.1);
}

function toggleLoop() {
  if (audioElement) {
    audioElement.loop = !audioElement.loop;
    showToast(audioElement.loop ? 'Looping track: ON 🔁' : 'Looping track: OFF');
  }
}

function triggerShuffle() {
  showToast('Shuffling all our sweetest memories! 🎲✨');
  playChimeSound(659.25, 'triangle', 0.15);
}

function toggleSpotifyHeart() {
  const heartBtn = document.getElementById('spotifyLikeBtn');
  heartBtn.classList.toggle('active');
  const icon = heartBtn.querySelector('i');

  if (heartBtn.classList.contains('active')) {
    icon.style.color = '#ff4d6d';
    showToast('Saved to your liked songs in my heart! 💕');
    playChimeSound(783.99, 'sine', 0.25);
  } else {
    icon.style.color = '#888';
  }
}

// Audio Progress & Seek
if (audioElement) {
  audioElement.addEventListener('loadedmetadata', () => {
    if (audioElement.duration) {
      totalDurationEl.innerText = formatTime(audioElement.duration);
    }
  });

  audioElement.addEventListener('timeupdate', () => {
    if (!audioElement.duration) return;
    const current = audioElement.currentTime;
    const total = audioElement.duration;
    updateProgressBar(current, total);
  });

  audioElement.addEventListener('ended', () => {
    pauseAudio();
  });
}

function updateProgressBar(current, total) {
  const percent = (current / total) * 100;
  progressBarFill.style.width = `${percent}%`;
  progressHandle.style.left = `${percent}%`;

  currentTimeEl.innerText = formatTime(current);
  if (!isNaN(total) && total > 0) {
    totalDurationEl.innerText = formatTime(total);
  }
}

function seekAudio(event) {
  const barBg = document.getElementById('progressBarBg');
  const rect = barBg.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));

  if (audioElement && audioElement.duration) {
    audioElement.currentTime = ratio * audioElement.duration;
  } else {
    updateProgressBar(ratio * 204, 204);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Synthetic Sweet Lo-fi Chords Generator (Web Audio API)
// Ensures the user always hears a soothing romantic tune even without uploading an mp3!
function startLofiSynth() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === 'suspended') audioContext.resume();

    // Notes of lovely romantic progression: Fmaj7 -> G -> Em7 -> Am
    const chords = [
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [392.00, 493.88, 587.33, 783.99], // G
      [329.63, 392.00, 493.88, 659.25], // Em7
      [440.00, 523.25, 659.25, 880.00]  // Am
    ];

    let chordIndex = 0;
    let mockSeconds = 0;

    synthInterval = setInterval(() => {
      if (!isAudioPlaying) return;

      const currentChord = chords[chordIndex % chords.length];
      currentChord.forEach((freq, i) => {
        setTimeout(() => {
          if (!isAudioPlaying) return;
          playSoftTone(freq, 1.2, 0.04);
        }, i * 220);
      });

      chordIndex++;
      mockSeconds += 2;
      if (mockSeconds > 204) mockSeconds = 0;
      updateProgressBar(mockSeconds, 204);
    }, 2400);

  } catch (err) {
    console.log('Web audio synth error:', err);
  }
}

function stopLofiSynth() {
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
}

function playSoftTone(freq, duration, volume) {
  if (isMuted || !audioContext) return;
  try {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);

    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + duration);
  } catch (e) {}
}

function playChimeSound(freq, type = 'sine', duration = 0.2) {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === 'suspended') audioContext.resume();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);

    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + duration);
  } catch (e) {}
}

function playCelebrationChime() {
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playChimeSound(freq, 'triangle', 0.25);
    }, idx * 90);
  });
}

// Sound toggle button in header
if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
      soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span>Sound: OFF</span>';
      if (isAudioPlaying) pauseAudio();
    } else {
      soundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Sound: ON</span>';
      playChimeSound(523.25, 'sine', 0.2);
    }
  });
}

// ========================================================
// 4. SPECIAL PHOTOS GALLERY & INTERACTIVE LIKES
// ========================================================

function hitLike(buttonEl, counterId) {
  const counterEl = document.getElementById(counterId);
  if (!counterEl) return;

  let currentLikes = parseInt(counterEl.innerText) || 0;
  currentLikes += 1;
  counterEl.innerText = currentLikes;

  // Button bounce animation
  buttonEl.style.transform = 'scale(1.25)';
  setTimeout(() => {
    buttonEl.style.transform = 'scale(1)';
  }, 180);

  // Sound
  playChimeSound(600 + Math.random() * 200, 'triangle', 0.18);

  // Spawn floating heart particles at click position
  const rect = buttonEl.getBoundingClientRect();
  createHeartBurst(rect.left + rect.width / 2, rect.top);

  // Random cute toasts
  const cuteCompliments = [
    "Aww, 100% handsome duffer! 💕",
    "Best photographer ever! 📸",
    "This picture has my whole heart! 💖",
    "Sending 1000x love to you! ✨",
    "Cutest smile in the universe! 🌸"
  ];
  if (currentLikes % 5 === 0) {
    const randomMsg = cuteCompliments[Math.floor(Math.random() * cuteCompliments.length)];
    showToast(randomMsg);
  }
}

function createHeartBurst(x, y) {
  const heartEmojis = ['💖', '💕', '💗', '✨', '❤️', '🌸'];
  for (let i = 0; i < 4; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart-burst';
    heart.innerText = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty('--rx', `${(Math.random() - 0.5) * 80}px`);

    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1000);
  }
}

// Gallery Filtering
function filterGallery(category) {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => btn.classList.remove('active'));

  event.target.classList.add('active');

  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    const itemCat = item.getAttribute('data-category');
    if (category === 'all' || itemCat === category) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });

  playChimeSound(500, 'sine', 0.1);
}

// Grand Finale Confetti
function triggerGrandConfetti() {
  playCelebrationChime();

  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio, opts) {
    confetti(Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio)
    }));
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#ff4d6d', '#ff7597']
  });
  fire(0.2, {
    spread: 60,
    colors: ['#ffffff', '#ffb3c6']
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#ff7597', '#ffd1dc', '#1ed760']
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#ffe5ec', '#ff4d6d']
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#ffffff', '#ff8fab']
  });

  showToast('Happy Men\'s Day to the most amazing person! 🥳🎉');
}

function fireLittleSparkles() {
  confetti({
    particleCount: 30,
    spread: 40,
    origin: { y: 0.4 },
    colors: ['#ff7597', '#ffe5ec']
  });
}

// ========================================================
// 5. LIGHTBOX MODAL & IMAGE ZOOM
// ========================================================

function previewImage(el) {
  const img = el.querySelector('img');
  const caption = el.querySelector('.polaroid-caption') || el.querySelector('h4');
  
  if (!img) return;

  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCap = document.getElementById('lightboxCaption');

  modalImg.src = img.src;
  modalCap.innerText = caption ? caption.innerText : '';
  modal.classList.add('active');

  playChimeSound(600, 'sine', 0.15);
}

function closeLightbox() {
  document.getElementById('lightboxModal').classList.remove('active');
}

// ========================================================
// 6. LIVE PHOTO & SONG CUSTOMIZER (Direct Preview Helper)
// ========================================================

const photoHelpBtn = document.getElementById('photoHelpBtn');
const customizerModal = document.getElementById('customizerModal');

if (photoHelpBtn && customizerModal) {
  photoHelpBtn.addEventListener('click', () => {
    customizerModal.classList.add('active');
    playChimeSound(520, 'sine', 0.15);
  });
}

function closeCustomizer() {
  customizerModal.classList.remove('active');
}

function handleLiveImageUpload(inputEl, targetImgId) {
  const file = inputEl.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const targetImg = document.getElementById(targetImgId);
      if (targetImg) {
        targetImg.src = e.target.result;
        showToast('Photo updated successfully! ✨');
      }
    };
    reader.readAsDataURL(file);
  }
}

function handleLiveAudioUpload(inputEl) {
  const file = inputEl.files[0];
  if (file) {
    const fileUrl = URL.createObjectURL(file);
    audioElement.src = fileUrl;
    audioElement.load();
    showToast(`Loaded song: ${file.name} 🎵`);
    
    // Auto update title with file name without extension
    const title = file.name.replace(/\.[^/.]+$/, "");
    updateSongTitle(title);
  }
}

function updateSongTitle(title) {
  if (title.trim()) {
    document.getElementById('trackTitle').innerText = title;
  }
}

function updateArtist(artist) {
  if (artist.trim()) {
    document.getElementById('trackArtist').innerText = artist;
  }
}

// Toast notification helper
function showToast(message) {
  const oldToast = document.querySelector('.scrapbook-toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = 'scrapbook-toast';
  toast.innerText = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: rgba(28, 24, 36, 0.95);
    color: #ffb3c6;
    border: 1px solid #ff7597;
    padding: 10px 22px;
    border-radius: 25px;
    font-family: 'Patrick Hand', cursive;
    font-size: 1.25rem;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    z-index: 99999;
    opacity: 0;
    transition: all 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

// Initial spark on page load
window.addEventListener('DOMContentLoaded', () => {
  console.log('Men\'s Day Scrapbook initialized with love! 💕');
});
