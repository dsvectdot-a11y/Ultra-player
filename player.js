// Accessible custom video player
const video = document.getElementById('video');
const playBtn = document.getElementById('play');
const seek = document.getElementById('seek');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volume = document.getElementById('volume');
const muteBtn = document.getElementById('mute');
const captionsBtn = document.getElementById('captions');
const captionsTrack = document.getElementById('captions-track');
const fullscreenBtn = document.getElementById('fullscreen');
const pipBtn = document.getElementById('pip');

function formatTime(sec){
  if (isNaN(sec)) return "0:00";
  const s = Math.floor(sec % 60).toString().padStart(2,'0');
  const m = Math.floor(sec / 60);
  return `${m}:${s}`;
}

function updateButtons(){
  playBtn.textContent = video.paused ? '▶' : '⏸';
  playBtn.setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
  muteBtn.textContent = video.muted ? '🔈' : '🔊';
  muteBtn.setAttribute('aria-pressed', String(video.muted));
  captionsBtn.setAttribute('aria-pressed', String(captionsTrack.mode === 'showing'));
}

video.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(video.duration);
  seek.max = Math.floor(video.duration);
  updateSeek();
});

video.addEventListener('timeupdate', updateSeek);

function updateSeek(){
  seek.value = Math.floor(video.currentTime);
  currentTimeEl.textContent = formatTime(video.currentTime);
}

playBtn.addEventListener('click', () => {
  if (video.paused) video.play(); else video.pause();
  updateButtons();
});
video.addEventListener('play', updateButtons);
video.addEventListener('pause', updateButtons);

seek.addEventListener('input', (e) => {
  video.currentTime = e.target.value;
});

volume.addEventListener('input', (e) => {
  video.volume = parseFloat(e.target.value);
  video.muted = video.volume === 0;
  updateButtons();
});

muteBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  if (video.muted) volume.dataset.prev = volume.value, volume.value = 0;
  else volume.value = volume.dataset.prev || video.volume;
  updateButtons();
});

captionsBtn.addEventListener('click', () => {
  // toggles showing/hidden/off
  const t = captionsTrack;
  if (!t) return;
  t.mode = t.mode === 'showing' ? 'hidden' : 'showing';
  updateButtons();
});

// Fullscreen
fullscreenBtn.addEventListener('click', async () => {
  const el = document.getElementById('player');
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(()=>{});
  } else {
    await document.exitFullscreen().catch(()=>{});
  }
});

// Picture-in-Picture (if supported)
pipBtn.addEventListener('click', async () => {
  if ('pictureInPictureEnabled' in document) {
    try {
      if (video !== document.pictureInPictureElement) {
        await video.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (e) {
      // ignore
    }
  } else {
    alert('Picture-in-Picture not supported in this browser.');
  }
});

// Keyboard support when video or player focused
document.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
  if (isTyping) return;

  switch (e.key.toLowerCase()) {
    case ' ':
    case 'k':
      e.preventDefault();
      if (video.paused) video.play(); else video.pause();
      updateButtons();
      break;
    case 'arrowleft':
      e.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 5);
      break;
    case 'arrowright':
      e.preventDefault();
      video.currentTime = Math.min(video.duration, video.currentTime + 5);
      break;
    case 'arrowup':
      e.preventDefault();
      video.volume = Math.min(1, video.volume + 0.05);
      volume.value = video.volume;
      updateButtons();
      break;
    case 'arrowdown':
      e.preventDefault();
      video.volume = Math.max(0, video.volume - 0.05);
      volume.value = video.volume;
      updateButtons();
      break;
    case 'f':
      e.preventDefault();
      fullscreenBtn.click();
      break;
    case 'c':
      e.preventDefault();
      captionsBtn.click();
      break;
    case 'm':
      e.preventDefault();
      muteBtn.click();
      break;
  }
});

// Keep UI in sync when user uses native controls (if present)
video.addEventListener('volumechange', updateButtons);

// Initialize UI
(function init(){
  // Make captions visible by default if track default
  if (captionsTrack) {
    try { captionsTrack.mode = captionsTrack.default ? 'showing' : 'hidden'; } catch {}
  }
  updateButtons();
})();
