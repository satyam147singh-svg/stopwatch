/**
 * ChronoSync - Pro Time Suite
 * Features: World Clock, Smart Alarm, Precision Stopwatch, Countdown Timer
 * Audio: Synthesized Web Audio API Engine
 */

// ==========================================
// 1. SOUND & AUDIO SYNTHESIS ENGINE
// ==========================================
class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = localStorage.getItem('chronosync_sound') !== 'false';
    this.currentAlarmLoop = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('chronosync_sound', this.soundEnabled);
    if (!this.soundEnabled) {
      this.stopAlarmSound();
    }
    return this.soundEnabled;
  }

  playClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  playChirp(up = true) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;
      osc.type = 'triangle';

      if (up) {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      } else {
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
      }

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn(e);
    }
  }

  // Play alarm sound once or loop
  playTone(toneType) {
    this.init();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    switch (toneType) {
      case 'celestial': {
        // Melodic arpeggio chime (C5, E5, G5, B5, C6)
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.65);
        });
        break;
      }
      case 'pulse': {
        // Crisp dual-tone synth pulse
        for (let i = 0; i < 3; i++) {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(950, now + i * 0.16);

          gain.gain.setValueAtTime(0.15, now + i * 0.16);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.1);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now + i * 0.16);
          osc.stop(now + i * 0.16 + 0.12);
        }
        break;
      }
      case 'siren': {
        // Sci-fi sweep
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.3);
        osc.frequency.linearRampToValueAtTime(400, now + 0.6);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
        break;
      }
      case 'sunrise': {
        // Warm ambient chords
        const freqs = [329.63, 440.0, 554.37, 659.25];
        freqs.forEach((freq) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 1.25);
        });
        break;
      }
      case 'classic':
      default: {
        // Classic mechanical twin bell ringing
        for (let i = 0; i < 6; i++) {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(i % 2 === 0 ? 1200 : 1600, now + i * 0.09);

          gain.gain.setValueAtTime(0.2, now + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.08);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.09);
        }
        break;
      }
    }
  }

  startAlarmLoop(toneType = 'celestial') {
    this.stopAlarmSound();
    this.playTone(toneType);
    this.currentAlarmLoop = setInterval(() => {
      this.playTone(toneType);
    }, 1800);
  }

  stopAlarmSound() {
    if (this.currentAlarmLoop) {
      clearInterval(this.currentAlarmLoop);
      this.currentAlarmLoop = null;
    }
  }
}

const sounds = new SoundEngine();

// ==========================================
// 2. STATE & PERSISTENCE
// ==========================================
const AppState = {
  is24Hour: localStorage.getItem('chronosync_24h') === 'true',
  activeTheme: localStorage.getItem('chronosync_theme') || 'cyber',
  alarms: JSON.parse(localStorage.getItem('chronosync_alarms') || 'null') || [
    {
      id: 'alarm_1',
      hours: 7,
      minutes: 0,
      label: 'Morning Workout',
      days: [1, 2, 3, 4, 5], // Mon-Fri
      enabled: true,
      sound: 'celestial',
      snoozeMins: 10
    },
    {
      id: 'alarm_2',
      hours: 8,
      minutes: 30,
      label: 'Standup Sync',
      days: [1, 2, 3, 4, 5],
      enabled: false,
      sound: 'pulse',
      snoozeMins: 5
    }
  ],
  worldCities: JSON.parse(localStorage.getItem('chronosync_cities') || 'null') || [
    { name: 'London', tz: 'Europe/London' },
    { name: 'New York', tz: 'America/New_York' },
    { name: 'Tokyo', tz: 'Asia/Tokyo' },
    { name: 'Sydney', tz: 'Australia/Sydney' }
  ],
  ringingAlarm: null
};

// Preset available world cities for modal
const AVAILABLE_CITIES = [
  { name: 'London, UK', tz: 'Europe/London' },
  { name: 'New York, USA', tz: 'America/New_York' },
  { name: 'San Francisco, USA', tz: 'America/Los_Angeles' },
  { name: 'Tokyo, Japan', tz: 'Asia/Tokyo' },
  { name: 'Paris, France', tz: 'Europe/Paris' },
  { name: 'Berlin, Germany', tz: 'Europe/Berlin' },
  { name: 'Sydney, Australia', tz: 'Australia/Sydney' },
  { name: 'Dubai, UAE', tz: 'Asia/Dubai' },
  { name: 'Singapore', tz: 'Asia/Singapore' },
  { name: 'Hong Kong', tz: 'Asia/Hong_Kong' },
  { name: 'New Delhi / Mumbai, India', tz: 'Asia/Kolkata' },
  { name: 'Toronto, Canada', tz: 'America/Toronto' },
  { name: 'São Paulo, Brazil', tz: 'America/Sao_Paulo' },
  { name: 'Cairo, Egypt', tz: 'Africa/Cairo' },
  { name: 'Seoul, South Korea', tz: 'Asia/Seoul' }
];

// ==========================================
// 3. CLOCK MODULE (ANALOG + DIGITAL)
// ==========================================
const Clock = {
  canvas: null,
  ctx: null,

  init() {
    this.canvas = document.getElementById('analog-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.setupCanvasDPI();
    }
    this.updateClock();
    setInterval(() => this.updateClock(), 1000 / 30); // 30fps smooth analog sweep
    this.renderWorldCities();
    setInterval(() => this.renderWorldCities(), 1000);
  },

  setupCanvasDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  },

  updateClock() {
    const now = new Date();
    this.renderDigital(now);
    this.renderAnalog(now);
  },

  renderDigital(now) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    let displayHours = hours;
    let ampm = '';

    if (!AppState.is24Hour) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      displayHours = hours % 12 || 12;
    }

    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)}`;

    const digitalEl = document.getElementById('clock-digital-time');
    const ampmEl = document.getElementById('clock-digital-ampm');
    const dateEl = document.getElementById('clock-digital-date');

    if (digitalEl) digitalEl.textContent = timeStr;
    if (ampmEl) {
      ampmEl.textContent = ampm;
      ampmEl.style.display = AppState.is24Hour ? 'none' : 'inline-block';
    }

    if (dateEl) {
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      dateEl.textContent = now.toLocaleDateString(undefined, options);
    }
  },

  renderAnalog(now) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const width = 270;
    const height = 270;
    const radius = width / 2;

    ctx.clearRect(0, 0, width, height);

    // Center offset
    ctx.save();
    ctx.translate(radius, radius);

    // 1. Draw Dial Tick Marks
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI) / 30;
      const isMajor = i % 5 === 0;
      const tickLength = isMajor ? 12 : 5;
      const tickWidth = isMajor ? 2.5 : 1;
      const outerR = radius - 16;
      const innerR = outerR - tickLength;

      ctx.beginPath();
      ctx.moveTo(Math.sin(angle) * outerR, -Math.cos(angle) * outerR);
      ctx.lineTo(Math.sin(angle) * innerR, -Math.cos(angle) * innerR);
      ctx.lineWidth = tickWidth;
      ctx.strokeStyle = isMajor ? 'rgba(56, 189, 248, 0.7)' : 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();
    }

    // 2. Draw Numerals (12, 3, 6, 9)
    ctx.font = '700 13px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('12', 0, -radius + 40);
    ctx.fillText('3', radius - 40, 0);
    ctx.fillText('6', 0, radius - 40);
    ctx.fillText('9', -radius + 40, 0);

    // Calculate Hand Angles with smooth fractions
    const ms = now.getMilliseconds();
    const sec = now.getSeconds() + ms / 1000;
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;

    const hourAngle = (hr * Math.PI) / 6;
    const minuteAngle = (min * Math.PI) / 30;
    const secondAngle = (sec * Math.PI) / 30;

    // 3. Hour Hand (Warm glow)
    ctx.save();
    ctx.rotate(hourAngle);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -radius * 0.48);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f8fafc';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();

    // 4. Minute Hand (Cyan Accent)
    ctx.save();
    ctx.rotate(minuteAngle);
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(0, -radius * 0.7);
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    // 5. Second Hand (Solar Amber Neon needle)
    ctx.save();
    ctx.rotate(secondAngle);
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(0, -radius * 0.82);
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f59e0b';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Tail counter-balance
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.restore();

    // 6. Center Jewel Cap
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  },

  renderWorldCities() {
    const container = document.getElementById('world-cities-list');
    if (!container) return;

    const now = new Date();
    const localOffset = -now.getTimezoneOffset(); // in minutes

    container.innerHTML = AppState.worldCities.map((city, idx) => {
      let cityTimeStr = '--:--';
      let diffStr = '';
      try {
        const d = new Date(now.toLocaleString('en-US', { timeZone: city.tz }));
        const pad = (n) => String(n).padStart(2, '0');
        let h = d.getHours();
        const m = d.getMinutes();
        let ampm = '';

        if (!AppState.is24Hour) {
          ampm = h >= 12 ? ' PM' : ' AM';
          h = h % 12 || 12;
        }
        cityTimeStr = `${pad(h)}:${pad(m)}${ampm}`;

        // Compute relative time difference
        const targetDiffMin = Math.round((d.getTime() - now.getTime()) / 60000);
        const diffHrs = Math.floor(Math.abs(targetDiffMin) / 60);
        const remMins = Math.abs(targetDiffMin) % 60;
        const sign = targetDiffMin >= 0 ? '+' : '-';
        const label = targetDiffMin >= 0 ? 'ahead' : 'behind';

        if (diffHrs === 0 && remMins === 0) {
          diffStr = 'Same time as local';
        } else {
          diffStr = `${sign}${diffHrs}h ${remMins ? remMins + 'm' : ''} ${label}`;
        }
      } catch (e) {
        cityTimeStr = 'Invalid TZ';
      }

      return `
        <div class="world-city-card" data-index="${idx}">
          <div class="city-info-col">
            <span class="city-name">${city.name}</span>
            <span class="city-diff">${diffStr}</span>
          </div>
          <div class="city-time-col">
            <span class="city-digital">${cityTimeStr}</span>
            <button class="city-delete-btn" data-del-city="${idx}" title="Remove city">
              <svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach delete handlers
    container.querySelectorAll('[data-del-city]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-del-city'), 10);
        AppState.worldCities.splice(index, 1);
        localStorage.setItem('chronosync_cities', JSON.stringify(AppState.worldCities));
        this.renderWorldCities();
        sounds.playClick();
      };
    });
  }
};

// ==========================================
// 4. STOPWATCH MODULE
// ==========================================
const Stopwatch = {
  startTime: 0,
  elapsedTime: 0,
  timerInterval: null,
  isRunning: false,
  laps: [],
  lastLapTime: 0,

  init() {
    this.bindEvents();
    this.updateDisplay(0);
  },

  bindEvents() {
    const startBtn = document.getElementById('sw-start-btn');
    const lapBtn = document.getElementById('sw-lap-btn');
    const resetBtn = document.getElementById('sw-reset-btn');
    const copyBtn = document.getElementById('copy-laps-btn');
    const clearBtn = document.getElementById('clear-laps-btn');

    startBtn?.addEventListener('click', () => this.toggleStart());
    lapBtn?.addEventListener('click', () => this.recordLap());
    resetBtn?.addEventListener('click', () => this.reset());
    copyBtn?.addEventListener('click', () => this.copyLaps());
    clearBtn?.addEventListener('click', () => this.clearLaps());
  },

  toggleStart() {
    if (this.isRunning) {
      // Pause
      this.pause();
    } else {
      // Start / Resume
      this.start();
    }
  },

  start() {
    this.isRunning = true;
    sounds.playChirp(true);
    this.startTime = performance.now() - this.elapsedTime;
    this.timerInterval = requestAnimationFrame(() => this.tick());

    document.getElementById('sw-start-label').textContent = 'Pause';
    document.getElementById('sw-start-btn').classList.add('running');
    document.getElementById('sw-lap-btn').disabled = false;
    document.getElementById('sw-reset-btn').disabled = false;
    document.querySelector('.stopwatch-display-card')?.classList.add('running');
  },

  pause() {
    this.isRunning = false;
    sounds.playChirp(false);
    cancelAnimationFrame(this.timerInterval);

    document.getElementById('sw-start-label').textContent = 'Resume';
    document.getElementById('sw-start-btn').classList.remove('running');
    document.getElementById('sw-lap-btn').disabled = true;
    document.querySelector('.stopwatch-display-card')?.classList.remove('running');
  },

  reset() {
    this.pause();
    sounds.playClick();
    this.elapsedTime = 0;
    this.lastLapTime = 0;
    this.laps = [];
    this.updateDisplay(0);
    this.renderLaps();

    document.getElementById('sw-start-label').textContent = 'Start';
    document.getElementById('sw-lap-btn').disabled = true;
    document.getElementById('sw-reset-btn').disabled = true;
    document.getElementById('sw-current-lap-time').textContent = 'Lap: 00:00:00.00';
  },

  tick() {
    if (!this.isRunning) return;
    this.elapsedTime = performance.now() - this.startTime;
    this.updateDisplay(this.elapsedTime);

    const currentLapDuration = this.elapsedTime - this.lastLapTime;
    document.getElementById('sw-current-lap-time').textContent = `Lap: ${this.formatTime(currentLapDuration)}`;

    this.timerInterval = requestAnimationFrame(() => this.tick());
  },

  formatTime(ms) {
    const pad = (n, len = 2) => String(Math.floor(n)).padStart(len, '0');
    const totalSecs = ms / 1000;
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = Math.floor(totalSecs % 60);
    const hundredths = Math.floor((ms % 1000) / 10);

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
  },

  updateDisplay(ms) {
    const formatted = this.formatTime(ms);
    const parts = formatted.split('.');
    const mainTimeEl = document.getElementById('sw-display');
    const msEl = document.getElementById('sw-display-ms');

    if (mainTimeEl && parts[0]) {
      mainTimeEl.firstChild.textContent = parts[0];
    }
    if (msEl && parts[1]) {
      msEl.textContent = `.${parts[1]}`;
    }
  },

  recordLap() {
    if (!this.isRunning) return;
    sounds.playClick();

    const currentLapTime = this.elapsedTime - this.lastLapTime;
    this.lastLapTime = this.elapsedTime;

    this.laps.unshift({
      lapNum: this.laps.length + 1,
      split: currentLapTime,
      total: this.elapsedTime
    });

    this.renderLaps();
  },

  renderLaps() {
    const tbody = document.getElementById('laps-tbody');
    const emptyState = document.getElementById('empty-laps-state');
    const countEl = document.getElementById('laps-count');

    if (countEl) countEl.textContent = this.laps.length;

    if (!tbody || !emptyState) return;

    if (this.laps.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    // Determine fastest and slowest
    let fastestLap = Infinity;
    let slowestLap = -Infinity;

    if (this.laps.length > 1) {
      this.laps.forEach(l => {
        if (l.split < fastestLap) fastestLap = l.split;
        if (l.split > slowestLap) slowestLap = l.split;
      });
    }

    tbody.innerHTML = this.laps.map(lap => {
      let highlightClass = '';
      if (this.laps.length > 1) {
        if (lap.split === fastestLap) highlightClass = 'lap-fastest';
        else if (lap.split === slowestLap) highlightClass = 'lap-slowest';
      }

      return `
        <tr class="${highlightClass}">
          <td>#${String(lap.lapNum).padStart(2, '0')}</td>
          <td>+${this.formatTime(lap.split)}</td>
          <td>${this.formatTime(lap.total)}</td>
        </tr>
      `;
    }).join('');
  },

  copyLaps() {
    if (this.laps.length === 0) return;
    const text = this.laps.map(l => `Lap ${l.lapNum}: Split +${this.formatTime(l.split)} | Total: ${this.formatTime(l.total)}`).join('\n');
    navigator.clipboard?.writeText(text);
    alert('Laps copied to clipboard!');
  },

  clearLaps() {
    this.laps = [];
    this.renderLaps();
    sounds.playClick();
  }
};

// ==========================================
// 5. TIMER MODULE (COUNTDOWN WITH CIRCULAR SVG)
// ==========================================
const Timer = {
  totalSeconds: 300, // 5 min default
  remainingSeconds: 300,
  intervalId: null,
  isRunning: false,
  targetTimestamp: null,
  circumference: 2 * Math.PI * 140, // r = 140

  init() {
    this.bindEvents();
    this.setProgress(1);
    this.updateDisplay(this.totalSeconds);
  },

  bindEvents() {
    const startBtn = document.getElementById('timer-start-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const addMinBtn = document.getElementById('timer-add-min-btn');

    startBtn?.addEventListener('click', () => this.toggleStart());
    resetBtn?.addEventListener('click', () => this.reset());
    addMinBtn?.addEventListener('click', () => this.addMinute());

    // Preset chips
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const secs = parseInt(chip.getAttribute('data-seconds'), 10);
        this.setCustomDuration(secs);
        sounds.playClick();
      });
    });

    // Custom time inputs
    const hInput = document.getElementById('timer-input-hours');
    const mInput = document.getElementById('timer-input-mins');
    const sInput = document.getElementById('timer-input-secs');

    const handleInputChange = () => {
      const h = Math.max(0, parseInt(hInput.value, 10) || 0);
      const m = Math.max(0, parseInt(mInput.value, 10) || 0);
      const s = Math.max(0, parseInt(sInput.value, 10) || 0);
      const total = h * 3600 + m * 60 + s;
      if (total > 0) {
        this.setCustomDuration(total);
      }
    };

    [hInput, mInput, sInput].forEach(inp => inp?.addEventListener('change', handleInputChange));
  },

  setCustomDuration(secs) {
    if (this.isRunning) this.pause();
    this.totalSeconds = secs;
    this.remainingSeconds = secs;
    this.updateDisplay(secs);
    this.setProgress(1);

    // Sync input boxes
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const hInput = document.getElementById('timer-input-hours');
    const mInput = document.getElementById('timer-input-mins');
    const sInput = document.getElementById('timer-input-secs');
    if (hInput) hInput.value = h;
    if (mInput) mInput.value = m;
    if (sInput) sInput.value = s;

    document.getElementById('timer-reset-btn').disabled = true;
    document.getElementById('timer-add-min-btn').disabled = true;
  },

  toggleStart() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  },

  start() {
    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = this.totalSeconds;
    }

    this.isRunning = true;
    sounds.playChirp(true);
    this.targetTimestamp = Date.now() + this.remainingSeconds * 1000;

    document.getElementById('timer-start-label').textContent = 'Pause';
    document.getElementById('timer-start-btn').classList.add('running');
    document.getElementById('timer-reset-btn').disabled = false;
    document.getElementById('timer-add-min-btn').disabled = false;
    document.getElementById('timer-status-caption').textContent = 'Counting Down';

    this.intervalId = setInterval(() => this.tick(), 250);
  },

  pause() {
    this.isRunning = false;
    sounds.playChirp(false);
    clearInterval(this.intervalId);

    document.getElementById('timer-start-label').textContent = 'Resume';
    document.getElementById('timer-start-btn').classList.remove('running');
    document.getElementById('timer-status-caption').textContent = 'Paused';
  },

  reset() {
    this.pause();
    sounds.playClick();
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay(this.remainingSeconds);
    this.setProgress(1);

    document.getElementById('timer-start-label').textContent = 'Start';
    document.getElementById('timer-reset-btn').disabled = true;
    document.getElementById('timer-add-min-btn').disabled = true;
    document.getElementById('timer-status-caption').textContent = 'Ready';
  },

  addMinute() {
    sounds.playClick();
    this.remainingSeconds += 60;
    this.totalSeconds += 60;
    if (this.isRunning) {
      this.targetTimestamp += 60000;
    }
    this.updateDisplay(this.remainingSeconds);
  },

  tick() {
    const diffMs = this.targetTimestamp - Date.now();
    const remaining = Math.max(0, Math.ceil(diffMs / 1000));

    this.remainingSeconds = remaining;
    this.updateDisplay(remaining);
    this.setProgress(this.remainingSeconds / this.totalSeconds);

    if (remaining <= 0) {
      this.complete();
    }
  },

  complete() {
    this.pause();
    this.setProgress(0);
    document.getElementById('timer-status-caption').textContent = "Time's Up!";

    // Trigger Ringing Screen & Audio
    AlarmManager.triggerAlarm({
      label: 'Timer Finished!',
      sound: 'celestial',
      snoozeMins: 5
    });
  },

  setProgress(ratio) {
    const ring = document.getElementById('timer-progress-ring');
    if (!ring) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const offset = this.circumference * (1 - clamped);
    ring.style.strokeDashoffset = offset;
  },

  updateDisplay(totalSecs) {
    const pad = (n) => String(n).padStart(2, '0');
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    let displayStr = `${pad(m)}:${pad(s)}`;
    if (h > 0) {
      displayStr = `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    const displayEl = document.getElementById('timer-display');
    if (displayEl) displayEl.textContent = displayStr;
  }
};

// ==========================================
// 6. ALARM MODULE
// ==========================================
const AlarmManager = {
  lastCheckedMinute: -1,

  init() {
    this.bindEvents();
    this.renderAlarms();
    this.updateUpcomingBanner();

    // Check alarms every second
    setInterval(() => this.checkAlarms(), 1000);
  },

  bindEvents() {
    // Open modal
    document.getElementById('open-alarm-modal-btn')?.addEventListener('click', () => {
      this.openModal();
    });

    // Close modal
    document.getElementById('close-alarm-modal-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('cancel-alarm-btn')?.addEventListener('click', () => this.closeModal());

    // Save alarm
    document.getElementById('save-alarm-btn')?.addEventListener('click', () => this.saveAlarmFromModal());

    // Test tone button
    document.getElementById('test-sound-btn')?.addEventListener('click', () => {
      const selectedSound = document.getElementById('alarm-sound-select').value;
      sounds.playTone(selectedSound);
    });

    // AM/PM buttons inside modal
    const amBtn = document.getElementById('ampm-am');
    const pmBtn = document.getElementById('ampm-pm');
    amBtn?.addEventListener('click', () => {
      amBtn.classList.add('active');
      pmBtn.classList.remove('active');
    });
    pmBtn?.addEventListener('click', () => {
      pmBtn.classList.add('active');
      amBtn.classList.remove('active');
    });

    // Days chip toggling
    document.querySelectorAll('.day-chip').forEach(chip => {
      chip.addEventListener('click', () => chip.classList.toggle('active'));
    });

    // Repeat presets
    document.getElementById('repeat-weekdays')?.addEventListener('click', () => {
      document.querySelectorAll('.day-chip').forEach(chip => {
        const day = parseInt(chip.getAttribute('data-day'), 10);
        chip.classList.toggle('active', day >= 1 && day <= 5);
      });
    });

    document.getElementById('repeat-weekends')?.addEventListener('click', () => {
      document.querySelectorAll('.day-chip').forEach(chip => {
        const day = parseInt(chip.getAttribute('data-day'), 10);
        chip.classList.toggle('active', day === 0 || day === 6);
      });
    });

    document.getElementById('repeat-everyday')?.addEventListener('click', () => {
      document.querySelectorAll('.day-chip').forEach(chip => chip.classList.add('active'));
    });

    // Ringing screen dismiss & snooze
    document.getElementById('ringing-dismiss-btn')?.addEventListener('click', () => this.dismissRinging());
    document.getElementById('ringing-snooze-btn')?.addEventListener('click', () => this.snoozeRinging());
  },

  renderAlarms() {
    const container = document.getElementById('alarms-container');
    if (!container) return;

    if (AppState.alarms.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No alarms configured. Tap "+ New Alarm" above to create one.</p>
        </div>
      `;
      this.updateActiveBadge();
      return;
    }

    const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    container.innerHTML = AppState.alarms.map((alarm, idx) => {
      let h = alarm.hours;
      const m = alarm.minutes;
      let ampm = '';

      if (!AppState.is24Hour) {
        ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
      }

      const pad = (n) => String(n).padStart(2, '0');
      const timeStr = `${pad(h)}:${pad(m)}`;

      let daysLabel = 'Once';
      if (alarm.days && alarm.days.length > 0) {
        if (alarm.days.length === 7) daysLabel = 'Everyday';
        else if (alarm.days.length === 5 && !alarm.days.includes(0) && !alarm.days.includes(6)) daysLabel = 'Weekdays';
        else if (alarm.days.length === 2 && alarm.days.includes(0) && alarm.days.includes(6)) daysLabel = 'Weekends';
        else daysLabel = alarm.days.map(d => dayLetters[d]).join(' ');
      }

      return `
        <div class="alarm-card ${alarm.enabled ? 'active-alarm' : 'inactive-alarm'}" data-alarm-id="${alarm.id}">
          <div class="alarm-details">
            <div class="alarm-time-display">
              <span class="alarm-digits">${timeStr}</span>
              ${!AppState.is24Hour ? `<span class="alarm-ampm-tag">${ampm}</span>` : ''}
            </div>
            <div class="alarm-meta-line">
              <span class="alarm-title-text">${alarm.label || 'Alarm'}</span>
              <span class="alarm-days-tag">• ${daysLabel}</span>
              <span class="alarm-tone-tag">♪ ${alarm.sound}</span>
            </div>
          </div>

          <div class="alarm-actions-col">
            <label class="switch">
              <input type="checkbox" class="alarm-toggle" data-idx="${idx}" ${alarm.enabled ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
            <button class="alarm-del-btn" data-del-alarm="${idx}" title="Delete Alarm">
              <svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach toggle handlers
    container.querySelectorAll('.alarm-toggle').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        AppState.alarms[idx].enabled = e.target.checked;
        localStorage.setItem('chronosync_alarms', JSON.stringify(AppState.alarms));
        this.renderAlarms();
        this.updateUpcomingBanner();
        sounds.playClick();
      });
    });

    // Attach delete handlers
    container.querySelectorAll('[data-del-alarm]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-del-alarm'), 10);
        AppState.alarms.splice(idx, 1);
        localStorage.setItem('chronosync_alarms', JSON.stringify(AppState.alarms));
        this.renderAlarms();
        this.updateUpcomingBanner();
        sounds.playClick();
      });
    });

    this.updateActiveBadge();
  },

  updateActiveBadge() {
    const badge = document.getElementById('active-alarms-badge');
    if (!badge) return;
    const activeCount = AppState.alarms.filter(a => a.enabled).length;
    if (activeCount > 0) {
      badge.textContent = activeCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  },

  updateUpcomingBanner() {
    const banner = document.getElementById('upcoming-banner');
    const textEl = document.getElementById('upcoming-text');
    if (!banner || !textEl) return;

    const next = this.getNextAlarmTime();
    if (!next) {
      banner.classList.add('hidden');
      return;
    }

    const diffMs = next.date.getTime() - Date.now();
    const diffMins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    banner.classList.remove('hidden');
    textEl.textContent = `Next alarm (${next.alarm.label}) in ${hrs > 0 ? hrs + 'h ' : ''}${mins}m`;
  },

  getNextAlarmTime() {
    const now = new Date();
    let closest = null;
    let minDiff = Infinity;

    AppState.alarms.forEach(alarm => {
      if (!alarm.enabled) return;

      // Check next 7 days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const candidate = new Date(now);
        candidate.setDate(now.getDate() + dayOffset);
        candidate.setHours(alarm.hours, alarm.minutes, 0, 0);

        if (candidate <= now) continue;

        const dayOfWeek = candidate.getDay();
        if (!alarm.days || alarm.days.length === 0 || alarm.days.includes(dayOfWeek)) {
          const diff = candidate.getTime() - now.getTime();
          if (diff < minDiff) {
            minDiff = diff;
            closest = { date: candidate, alarm };
          }
          break;
        }
      }
    });

    return closest;
  },

  checkAlarms() {
    const now = new Date();
    const currentMin = now.getMinutes();
    const currentHour = now.getHours();
    const currentSec = now.getSeconds();
    const currentDay = now.getDay();

    if (currentSec !== 0) return; // check only on the start of every minute

    AppState.alarms.forEach(alarm => {
      if (!alarm.enabled) return;

      const dayMatches = !alarm.days || alarm.days.length === 0 || alarm.days.includes(currentDay);
      if (alarm.hours === currentHour && alarm.minutes === currentMin && dayMatches) {
        this.triggerAlarm(alarm);
      }
    });

    this.updateUpcomingBanner();
  },

  openModal() {
    const modal = document.getElementById('alarm-modal');
    modal?.classList.remove('hidden');

    const now = new Date();
    let defaultH = now.getHours();
    const defaultM = (now.getMinutes() + 5) % 60;

    let am = true;
    if (!AppState.is24Hour) {
      am = defaultH < 12;
      defaultH = defaultH % 12 || 12;
      document.getElementById('ampm-am').classList.toggle('active', am);
      document.getElementById('ampm-pm').classList.toggle('active', !am);
    }

    const pad = (n) => String(n).padStart(2, '0');
    document.getElementById('alarm-input-hours').value = pad(defaultH);
    document.getElementById('alarm-input-mins').value = pad(defaultM);
    document.getElementById('alarm-label-input').value = '';
    sounds.playClick();
  },

  closeModal() {
    document.getElementById('alarm-modal')?.classList.add('hidden');
    sounds.playClick();
  },

  saveAlarmFromModal() {
    const hInput = parseInt(document.getElementById('alarm-input-hours').value, 10) || 0;
    const mInput = parseInt(document.getElementById('alarm-input-mins').value, 10) || 0;
    const isPM = document.getElementById('ampm-pm').classList.contains('active');
    const label = document.getElementById('alarm-label-input').value.trim() || 'Alarm';
    const sound = document.getElementById('alarm-sound-select').value;
    const snoozeMins = parseInt(document.getElementById('alarm-snooze-select').value, 10) || 10;

    let finalHours = hInput;
    if (!AppState.is24Hour) {
      if (isPM && finalHours < 12) finalHours += 12;
      if (!isPM && finalHours === 12) finalHours = 0;
    }

    const selectedDays = [];
    document.querySelectorAll('.day-chip.active').forEach(chip => {
      selectedDays.push(parseInt(chip.getAttribute('data-day'), 10));
    });

    const newAlarm = {
      id: 'alarm_' + Date.now(),
      hours: finalHours,
      minutes: mInput,
      label,
      days: selectedDays,
      enabled: true,
      sound,
      snoozeMins
    };

    AppState.alarms.push(newAlarm);
    localStorage.setItem('chronosync_alarms', JSON.stringify(AppState.alarms));

    this.closeModal();
    this.renderAlarms();
    this.updateUpcomingBanner();
  },

  triggerAlarm(alarm) {
    AppState.ringingAlarm = alarm;

    // Show Ringing Screen
    const ringingScreen = document.getElementById('ringing-screen');
    const timeText = document.getElementById('ringing-time-text');
    const labelText = document.getElementById('ringing-label-text');
    const snoozeDurationText = document.getElementById('snooze-duration-text');

    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    let ampm = '';
    if (!AppState.is24Hour) {
      ampm = h >= 12 ? ' PM' : ' AM';
      h = h % 12 || 12;
    }
    const pad = (n) => String(n).padStart(2, '0');

    if (timeText) timeText.textContent = `${pad(h)}:${pad(m)}${ampm}`;
    if (labelText) labelText.textContent = alarm.label || 'Alarm';
    if (snoozeDurationText) snoozeDurationText.textContent = `${alarm.snoozeMins || 10}m`;

    ringingScreen?.classList.remove('hidden');

    // Start Audio loop & Vibration
    sounds.startAlarmLoop(alarm.sound || 'celestial');

    if (navigator.vibrate) {
      navigator.vibrate([500, 250, 500, 250, 500, 250, 800]);
    }

    // Push notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alarm.label || 'Alarm Alert!', {
        body: `It is now ${pad(h)}:${pad(m)}${ampm}`,
        icon: 'icon-192.jpg'
      });
    }
  },

  dismissRinging() {
    sounds.stopAlarmSound();
    document.getElementById('ringing-screen')?.classList.add('hidden');

    if (AppState.ringingAlarm && (!AppState.ringingAlarm.days || AppState.ringingAlarm.days.length === 0)) {
      // Single run alarm, disable it
      AppState.ringingAlarm.enabled = false;
      localStorage.setItem('chronosync_alarms', JSON.stringify(AppState.alarms));
      this.renderAlarms();
    }

    AppState.ringingAlarm = null;
    this.updateUpcomingBanner();
  },

  snoozeRinging() {
    sounds.stopAlarmSound();
    document.getElementById('ringing-screen')?.classList.add('hidden');

    if (AppState.ringingAlarm) {
      const snoozeMins = AppState.ringingAlarm.snoozeMins || 10;
      const now = new Date();
      now.setMinutes(now.getMinutes() + snoozeMins);

      const snoozedAlarm = {
        ...AppState.ringingAlarm,
        id: 'snooze_' + Date.now(),
        hours: now.getHours(),
        minutes: now.getMinutes(),
        label: `${AppState.ringingAlarm.label} (Snoozed)`,
        days: [] // Run once
      };

      AppState.alarms.push(snoozedAlarm);
      localStorage.setItem('chronosync_alarms', JSON.stringify(AppState.alarms));
      this.renderAlarms();
      this.updateUpcomingBanner();
      alert(`Alarm snoozed for ${snoozeMins} minutes.`);
    }

    AppState.ringingAlarm = null;
  }
};

// ==========================================
// 7. WORLD CITY SEARCH & ADD MODAL
// ==========================================
const CityModal = {
  init() {
    const addCityBtn = document.getElementById('add-city-btn');
    const closeCityBtn = document.getElementById('close-city-modal-btn');
    const searchInput = document.getElementById('city-search-input');

    addCityBtn?.addEventListener('click', () => this.open());
    closeCityBtn?.addEventListener('click', () => this.close());

    searchInput?.addEventListener('input', (e) => {
      this.renderFilteredCities(e.target.value);
    });
  },

  open() {
    document.getElementById('city-modal')?.classList.remove('hidden');
    this.renderFilteredCities('');
    sounds.playClick();
  },

  close() {
    document.getElementById('city-modal')?.classList.add('hidden');
    sounds.playClick();
  },

  renderFilteredCities(query) {
    const list = document.getElementById('city-options-list');
    if (!list) return;

    const filtered = AVAILABLE_CITIES.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase())
    );

    list.innerHTML = filtered.map(city => `
      <div class="city-option-item" data-name="${city.name}" data-tz="${city.tz}">
        <span>${city.name}</span>
        <span style="font-size: 0.76rem; color: var(--accent-primary);">+ Add</span>
      </div>
    `).join('');

    list.querySelectorAll('.city-option-item').forEach(item => {
      item.onclick = () => {
        const name = item.getAttribute('data-name');
        const tz = item.getAttribute('data-tz');
        if (!AppState.worldCities.some(c => c.tz === tz)) {
          AppState.worldCities.push({ name, tz });
          localStorage.setItem('chronosync_cities', JSON.stringify(AppState.worldCities));
          Clock.renderWorldCities();
        }
        this.close();
      };
    });
  }
};

// ==========================================
// 8. NAVIGATION, THEMES & PWA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Request notification permissions
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  }

  // Restore Theme
  document.body.setAttribute('data-theme', AppState.activeTheme);
  document.querySelectorAll('.theme-opt-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme-val') === AppState.activeTheme);
  });

  // Format toggle (12h vs 24h)
  const formatBtn = document.getElementById('format-toggle-btn');
  const formatLabel = document.getElementById('format-label');
  if (formatLabel) formatLabel.textContent = AppState.is24Hour ? '12H MODE' : '24H MODE';

  formatBtn?.addEventListener('click', () => {
    AppState.is24Hour = !AppState.is24Hour;
    localStorage.setItem('chronosync_24h', AppState.is24Hour);
    if (formatLabel) formatLabel.textContent = AppState.is24Hour ? '12H MODE' : '24H MODE';
    Clock.renderWorldCities();
    AlarmManager.renderAlarms();
    sounds.playClick();
  });

  // Sound toggle button
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');

  const updateSoundIcons = (enabled) => {
    soundIconOn?.classList.toggle('hidden', !enabled);
    soundIconOff?.classList.toggle('hidden', enabled);
  };
  updateSoundIcons(sounds.soundEnabled);

  soundBtn?.addEventListener('click', () => {
    const isNowEnabled = sounds.toggleSound();
    updateSoundIcons(isNowEnabled);
  });

  // Fullscreen button
  document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Theme Dropdown toggle
  const themeBtn = document.getElementById('theme-btn');
  const themeDropdown = document.getElementById('theme-dropdown');

  themeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    themeDropdown?.classList.toggle('hidden');
    sounds.playClick();
  });

  document.addEventListener('click', (e) => {
    if (themeDropdown && !themeDropdown.contains(e.target) && e.target !== themeBtn) {
      themeDropdown.classList.add('hidden');
    }
  });

  document.querySelectorAll('.theme-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-theme-val');
      AppState.activeTheme = selected;
      localStorage.setItem('chronosync_theme', selected);
      document.body.setAttribute('data-theme', selected);

      document.querySelectorAll('.theme-opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      themeDropdown?.classList.add('hidden');
      sounds.playClick();
    });
  });

  // Tab Navigation Handling
  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.tab-panel');

  const switchTab = (tabId) => {
    navItems.forEach(item => {
      const isTarget = item.getAttribute('data-tab') === tabId;
      item.classList.toggle('active', isTarget);
      item.setAttribute('aria-selected', isTarget);
    });

    panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });

    sounds.playClick();
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Check URL search params for deep linking (e.g. ?tab=stopwatch)
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('tab');
  if (requestedTab && document.getElementById(`tab-${requestedTab}`)) {
    switchTab(`tab-${requestedTab}`);
  }

  // Initialize Modules
  Clock.init();
  Stopwatch.init();
  Timer.init();
  AlarmManager.init();
  CityModal.init();
});
