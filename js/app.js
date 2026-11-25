


const taskForm = document.querySelector('#taskForm');
const newTaskNameInput = document.querySelector('#newTaskNameInput');
const newTaskDescriptionInput = document.querySelector('#newTaskDescriptionInput');
const newTaskDateInput = document.querySelector('#newTaskDateInput');
const newTaskStatusSelect = document.querySelector('#newTaskStatusSelect');
const formAlert = document.querySelector('#formAlert');
const formAlertList = document.querySelector('#formAlertList');
const formSuccess = document.querySelector('#formSuccess');
const taskList = document.querySelector('#taskList');

/**
 * @param {{name:string, description:string, date:string, status:string}} data
 * @returns {{valid:boolean, errors:{field:string, message:string}[]}}
 */
function validFormFieldInput(data) {
  const errors = [];

  if (data.name.trim() === '') {
    errors.push({ field: 'name', message: 'El nombre no puede estar vacío.' });
  }
  if (data.description.trim() === '') {
    errors.push({ field: 'description', message: 'La descripción no puede estar vacía.' });
  }
  if (data.date === '') {
    errors.push({ field: 'date', message: 'Debes indicar una fecha de entrega.' });
  }
  if (data.status === '') {
    errors.push({ field: 'status', message: 'Debes seleccionar un estado.' });
  }

  return { valid: errors.length === 0, errors };
}

const fieldElements = {
  name: newTaskNameInput,
  description: newTaskDescriptionInput,
  date: newTaskDateInput,
  status: newTaskStatusSelect,
};

function showErrors(errors) {
  formAlertList.innerHTML = '';
  errors.forEach((err) => {
    const li = document.createElement('li');
    li.textContent = err.message;
    formAlertList.appendChild(li);
    fieldElements[err.field].classList.add('is-invalid');
  });
  formAlert.classList.remove('d-none');
  formSuccess.classList.add('d-none');
}

function hideErrors() {
  formAlert.classList.add('d-none');
  formAlertList.innerHTML = '';
  Object.values(fieldElements).forEach((el) => el.classList.remove('is-invalid'));
}

const badgeClass = {
  'Pendiente': 'badge-pendiente',
  'En proceso': 'badge-proceso',
  'Completada': 'badge-completada',
};

function addTaskCard(data) {
  const col = document.createElement('div');
  col.className = 'col-md-6';

  const card = document.createElement('article');
  card.className = 'card task-card';

  const body = document.createElement('div');
  body.className = 'card-body';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = data.name.trim();

  const text = document.createElement('p');
  text.className = 'card-text';
  text.textContent = data.description.trim();

  const badge = document.createElement('span');
  badge.className = 'badge ' + badgeClass[data.status];
  badge.textContent = data.status;

  const footer = document.createElement('div');
  footer.className = 'card-footer';
  footer.innerHTML = '<i class="bi bi-calendar-event"></i> ';
  footer.append('Entrega: ' + data.date);

  body.append(title, text, badge);
  card.append(body, footer);
  col.appendChild(card);
  ensureActions(card);
  taskList.prepend(col);
}

let editingCard = null;
const addTaskBtn = document.querySelector('#addTaskBtn');
const cancelEditBtn = document.querySelector('#cancelEditBtn');
const clearDoneBtn = document.querySelector('#clearDoneBtn');

function ensureActions(card) {
  if (card.querySelector('.task-actions')) return;
  const actions = document.createElement('div');
  actions.className = 'task-actions d-flex gap-2 mt-3';

  const edit = document.createElement('button');
  edit.type = 'button';
  edit.className = 'btn btn-sm btn-outline-burton btn-edit';
  edit.innerHTML = '<i class="bi bi-pencil-fill"></i> Editar';

  const done = document.createElement('button');
  done.type = 'button';
  done.className = 'btn btn-sm btn-burton btn-done';
  done.innerHTML = '<i class="bi bi-check-lg"></i> Completar';

  actions.append(edit, done);
  card.querySelector('.card-body').appendChild(actions);
}

function getCardData(card) {
  return {
    name: card.querySelector('.card-title').textContent,
    description: card.querySelector('.card-text').textContent,
    status: card.querySelector('.badge').textContent,
    date: card.querySelector('.card-footer').textContent.replace('Entrega:', '').trim(),
  };
}

function setCardData(card, data) {
  card.querySelector('.card-title').textContent = data.name.trim();
  card.querySelector('.card-text').textContent = data.description.trim();
  const badge = card.querySelector('.badge');
  badge.className = 'badge ' + badgeClass[data.status];
  badge.textContent = data.status;
  const footer = card.querySelector('.card-footer');
  footer.innerHTML = '<i class="bi bi-calendar-event"></i> ';
  footer.append('Entrega: ' + data.date);
}

function exitEditMode() {
  editingCard = null;
  taskForm.reset();
  hideErrors();
  addTaskBtn.innerHTML = '<i class="bi bi-plus-lg"></i> Agregar tarea';
  cancelEditBtn.classList.add('d-none');
  document.querySelector('#formTitle').innerHTML = '<i class="bi bi-feather"></i> Nueva tarea';
}

function enterEditMode(card) {
  const data = getCardData(card);
  editingCard = card;
  newTaskNameInput.value = data.name;
  newTaskDescriptionInput.value = data.description;
  newTaskDateInput.value = data.date;
  newTaskStatusSelect.value = data.status;
  hideErrors();
  addTaskBtn.innerHTML = '<i class="bi bi-save"></i> Guardar cambios';
  cancelEditBtn.classList.remove('d-none');
  document.querySelector('#formTitle').innerHTML = '<i class="bi bi-pencil-fill"></i> Editando tarea';
  taskForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  newTaskNameInput.focus();
}

taskList.addEventListener('click', (event) => {
  const card = event.target.closest('.task-card');
  if (!card) return;

  if (event.target.closest('.btn-edit')) {
    enterEditMode(card);
  } else if (event.target.closest('.btn-done')) {
    const data = getCardData(card);
    data.status = 'Completada';
    setCardData(card, data);
    if (editingCard === card) exitEditMode();
    updateDoneProgress();
  }
});

cancelEditBtn.addEventListener('click', exitEditMode);

clearDoneBtn.addEventListener('click', () => {
  const doneCards = [...taskList.querySelectorAll('.task-card')]
    .filter((card) => card.querySelector('.badge-completada'));

  if (doneCards.length === 0) {
    formSuccess.textContent = 'No hay tareas completadas para eliminar.';
    formSuccess.classList.remove('d-none');
    setTimeout(() => formSuccess.classList.add('d-none'), 2500);
    return;
  }
  if (!confirm('¿Eliminar ' + doneCards.length + ' tarea(s) completada(s)?')) return;

  doneCards.forEach((card) => {
    if (card === editingCard) exitEditMode();
    card.closest('.col-md-6').remove();
  });
  updateDoneProgress();
});

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = {
    name: newTaskNameInput.value,
    description: newTaskDescriptionInput.value,
    date: newTaskDateInput.value,
    status: newTaskStatusSelect.value,
  };
  console.log('name: ' + data.name);
  console.log('description: ' + data.description);
  console.log('date: ' + data.date);
  console.log('status: ' + data.status);

  hideErrors();
  const result = validFormFieldInput(data);

  if (!result.valid) {
    showErrors(result.errors);
    return;
  }

  if (editingCard) {
    setCardData(editingCard, data);
    exitEditMode();
    formSuccess.textContent = '¡Tarea actualizada!';
  } else {
    addTaskCard(data);
    taskForm.reset();
    formSuccess.textContent = '¡Tarea registrada! Que la productividad te acompañe.';
  }
  updateDoneProgress();
  formSuccess.classList.remove('d-none');
  setTimeout(() => formSuccess.classList.add('d-none'), 3000);
});

// Quita el aviso rojo de un campo cuando el usuario lo corrige
Object.values(fieldElements).forEach((el) => {
  el.addEventListener('input', () => el.classList.remove('is-invalid'));
});

//Progreso de tareas hechas
function updateDoneProgress() {
  const total = taskList.querySelectorAll('.task-card').length;
  const done = taskList.querySelectorAll('.badge-completada').length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.querySelector('#doneBar').style.width = pct + '%';
  document.querySelector('#doneText').textContent = pct + '%';
}
updateDoneProgress();
taskList.querySelectorAll('.task-card').forEach(ensureActions);

//POMODORO 

const timeEl = document.querySelector('#pomodoroTime');
const labelEl = document.querySelector('#pomodoroLabel');
const barEl = document.querySelector('#pomodoroBar');
const startBtn = document.querySelector('#pomodoroStart');
const resetBtn = document.querySelector('#pomodoroReset');
const countEl = document.querySelector('#pomodoroCount');
const modeButtons = document.querySelectorAll('.btn-mode');

let totalSeconds = 25 * 60;
let remaining = totalSeconds;
let timerId = null;
let completed = 0;

function renderTimer() {
  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  timeEl.textContent = `${m}:${s}`;
  barEl.style.width = ((totalSeconds - remaining) / totalSeconds) * 100 + '%';
  document.title = timerId ? `${m}:${s} · Planificador` : 'Planificador de Tareas · Tim Burton';
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  startBtn.innerHTML = '<i class="bi bi-play-fill"></i> Iniciar';
}

function tick() {
  remaining -= 1;
  if (remaining <= 0) {
    remaining = 0;
    stopTimer();
    if (labelEl.dataset.focus === 'true') {
      completed += 1;
      countEl.textContent = completed;
    }
    beep();
  }
  renderTimer();
}

startBtn.addEventListener('click', () => {
  if (timerId) {
    stopTimer(); 
    renderTimer();
    return;
  }
  if (remaining === 0) remaining = totalSeconds;
  timerId = setInterval(tick, 1000);
  startBtn.innerHTML = '<i class="bi bi-pause-fill"></i> Pausar';
});

resetBtn.addEventListener('click', () => {
  stopTimer();
  remaining = totalSeconds;
  renderTimer();
});

modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    stopTimer();
    totalSeconds = Number(btn.dataset.minutes) * 60;
    remaining = totalSeconds;
    labelEl.textContent = btn.dataset.label;
    labelEl.dataset.focus = btn.dataset.minutes === '25' ? 'true' : 'false';
    renderTimer();
  });
});
labelEl.dataset.focus = 'true';
renderTimer();

// Campanita de fin de pomodoro
function beep() {
  const ctx = getAudio();
  [660, 520, 660].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.35;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.65);
  });
}


let audioCtx = null;
let masterGain = null;
let currentStop = null; 
let currentTrack = null;
let playing = false;

const trackButtons = document.querySelectorAll('.btn-track');
const playBtn = document.querySelector('#playBtn');
const trackNameEl = document.querySelector('#trackName');
const volumeEl = document.querySelector('#volume');

function getAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = Number(volumeEl.value);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Nota con envolvente de decaimiento
function playNote(ctx, freq, start, dur, type, vol, dest) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

// Pista 1
function startMusicBox() {
  const ctx = getAudio();
  const notes = [440, 523.25, 659.25, 523.25, 587.33, 698.46, 880, 698.46,
                 659.25, 523.25, 440, 392, 415.3, 493.88, 659.25, 493.88];
  let step = 0;
  const id = setInterval(() => {
    const f = notes[step % notes.length];
    playNote(ctx, f, ctx.currentTime, 1.6, 'sine', 0.22, masterGain);
    playNote(ctx, f * 2, ctx.currentTime, 0.8, 'triangle', 0.06, masterGain);
    if (step % 8 === 0) playNote(ctx, f / 2, ctx.currentTime, 2.5, 'sine', 0.18, masterGain);
    step += 1;
  }, 420);
  return () => clearInterval(id);
}

// Pista 2
function startOrgan() {
  const ctx = getAudio();
  const chords = [
    [110, 164.81, 220],      // Am
    [87.31, 130.81, 174.61], // F
    [98, 146.83, 196],       // G
    [82.41, 123.47, 164.81], // Em
  ];
  let i = 0;
  const play = () => {
    chords[i % chords.length].forEach((f) => {
      playNote(ctx, f, ctx.currentTime, 6.5, 'sawtooth', 0.045, lowpass);
      playNote(ctx, f * 2, ctx.currentTime, 6.5, 'sine', 0.05, lowpass);
    });
    i += 1;
  };
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 900;
  lowpass.connect(masterGain);
  play();
  const id = setInterval(play, 6000);
  return () => { clearInterval(id); lowpass.disconnect(); };
}

// Pista 3: Hometown (twenty one pilots). Es un archivo de audio que pones tú
// en la carpeta audio/ (ver README); el código no incluye la canción.
const HOMETOWN_SRC = 'audio/hometown.mp4';
let hometownAudio = null;

function startHometown() {
  const audio = new Audio(HOMETOWN_SRC);
  audio.loop = true;
  audio.volume = Number(volumeEl.value);
  hometownAudio = audio;
  audio.play().catch(() => {
    // El archivo no existe o el navegador lo bloqueó
    stopMusic();
    trackNameEl.textContent = 'Falta el archivo audio/hometown.mp4';
  });
  return () => { audio.pause(); hometownAudio = null; };
}

const tracks = {
  musicbox: { name: 'Caja de música', start: startMusicBox },
  organ:    { name: 'Órgano del cementerio', start: startOrgan },
  hometown: { name: 'Hometown · twenty one pilots', start: startHometown },
};

function stopMusic() {
  if (currentStop) currentStop();
  currentStop = null;
  playing = false;
  playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
}

function playTrack(key) {
  stopMusic();
  currentTrack = key;
  currentStop = tracks[key].start();
  playing = true;
  playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
  trackNameEl.textContent = tracks[key].name;
  trackButtons.forEach((b) => b.classList.toggle('active', b.dataset.track === key));
}

trackButtons.forEach((btn) => {
  btn.addEventListener('click', () => playTrack(btn.dataset.track));
});

playBtn.addEventListener('click', () => {
  if (playing) {
    stopMusic();
  } else {
    playTrack(currentTrack || 'musicbox');
  }
});

volumeEl.addEventListener('input', () => {
  if (masterGain) masterGain.gain.value = Number(volumeEl.value);
  if (hometownAudio) hometownAudio.volume = Number(volumeEl.value);
});