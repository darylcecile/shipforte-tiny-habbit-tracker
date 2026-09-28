import './style.css';
import { addDays, dateKey, formatDate, weekStart } from './dates.js';
import { COLORS, emptyState, readState, setCompletion, STORAGE_KEY, writeState } from './store.js';
import { colorIcons, icon } from './icons.js';
import { renderApp } from './view.js';

const app = document.querySelector('#app');
const habitDialog = document.querySelector('#habit-dialog');
const dataDialog = document.querySelector('#data-dialog');
const form = document.querySelector('#habit-form');
const nameInput = document.querySelector('#habit-name');
let state = emptyState();
let today = dateKey();
let start = weekStart(today);
let storageError = '';
let editingId = null;
let undoAction = null;
let noticeTimer;

function load() {
  try {
    state = readState(window.localStorage);
    storageError = '';
  } catch {
    storageError = 'Your saved habits couldn’t be loaded. Existing data has been left untouched. Check browser storage permissions, or use Your data to start fresh.';
  }
}

function render() {
  const focused = document.activeElement?.dataset.focus;
  app.innerHTML = renderApp({ ...state, today, start, storageError });
  if (focused) app.querySelector(`[data-focus="${CSS.escape(focused)}"]`)?.focus({ preventScroll: true });
}

function announce(message) {
  document.querySelector('#announcer').textContent = message;
}

// Save first: a failed write must never masquerade as a successful check-in.
function commit(update) {
  try {
    const latest = readState(window.localStorage);
    const next = update(latest);
    writeState(window.localStorage, next);
    state = next;
    storageError = '';
    render();
    return true;
  } catch (error) {
    storageError = 'This change couldn’t be saved. Your previous data is untouched. Check that browser storage is allowed and has space, then try again.';
    render();
    showNotice(error.message === 'Habit no longer exists.' ? 'This habit was removed in another tab. Close this dialog and refresh.' : storageError);
    return false;
  }
}

function updateHabit(current, id, update) {
  if (!current.habits.some(habit => habit.id === id)) throw new Error('Habit no longer exists.');
  return { ...current, habits: current.habits.map(habit => habit.id === id ? update(habit) : habit) };
}

function hideNotice() {
  clearTimeout(noticeTimer);
  document.querySelector('#notice').hidden = true;
  undoAction = null;
}

function showNotice(message, undo = null) {
  clearTimeout(noticeTimer);
  undoAction = undo;
  document.querySelector('#notice-message').textContent = message;
  document.querySelector('#notice-undo').hidden = !undo;
  document.querySelector('#notice').hidden = false;
  // Destructive action undo stays available until dismissed or replaced.
  if (!undo) noticeTimer = setTimeout(hideNotice, 6500);
}

function setNameError(message = '') {
  const error = document.querySelector('#name-error');
  error.textContent = message;
  error.hidden = !message;
  nameInput.setAttribute('aria-invalid', String(Boolean(message)));
}

function newHabitId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // getRandomValues also works on HTTP LAN previews, unlike randomUUID.
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
}

function openHabit(habit = null, suggestion = {}) {
  editingId = habit?.id ?? null;
  form.reset();
  nameInput.value = habit?.name ?? suggestion.name ?? '';
  const color = habit?.color ?? suggestion.color ?? COLORS[state.habits.length % COLORS.length];
  document.querySelector('#color-options').innerHTML = COLORS.map(value => `<label class="color-option" data-color="${value}" title="${value}"><input type="radio" name="color" value="${value}" ${color === value ? 'checked' : ''} /><span>${icon(colorIcons[value])}</span><span class="sr-only">${value}</span></label>`).join('');
  document.querySelector('#dialog-title').textContent = habit ? 'A little room to change.' : 'Make room for a good habit.';
  document.querySelector('#dialog-eyebrow').textContent = habit ? 'GROW AT YOUR OWN PACE' : 'A SMALL BEGINNING';
  document.querySelector('#dialog-description').textContent = habit ? 'Give your habit a new name. Your progress stays with it.' : 'Keep it small. Make it something you can come back to.';
  document.querySelector('#save-habit').textContent = habit ? 'Save changes' : 'Add habit';
  document.querySelector('#delete-habit').hidden = !habit;
  document.querySelector('#delete-confirm').hidden = true;
  setNameError();
  habitDialog.showModal();
  nameInput.focus();
  if (habit) nameInput.select();
}

function saveHabit(event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    setNameError('Give your habit a name — even a small start deserves one.');
    nameInput.focus();
    return;
  }
  if (name.length > 100) {
    setNameError('Keep your habit name to 100 characters or fewer.');
    nameInput.focus();
    return;
  }
  const color = new FormData(form).get('color');
  const id = editingId ?? newHabitId();
  const wasEditing = Boolean(editingId);
  const saved = commit(current => wasEditing
    ? updateHabit(current, id, habit => ({ ...habit, name, color }))
    : { ...current, habits: [...current.habits, { id, name, color, createdOn: dateKey(), completions: [] }] });
  if (!saved) {
    setNameError('Your habit couldn’t be saved. Check browser storage permissions and try again.');
    return;
  }
  habitDialog.close();
  app.querySelector(`[data-focus="edit:${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
  showNotice(wasEditing ? 'A fresh name. All your progress kept.' : 'A small beginning. Your new habit is ready.');
}

function toggleDay(button, event) {
  refreshDate();
  const { id, day } = button.dataset;
  if (day > today) return;
  let completed = false;
  let name = '';
  const saved = commit(current => updateHabit(current, id, habit => {
    completed = !habit.completions.includes(day);
    name = habit.name;
    return setCompletion(habit, day, completed);
  }));
  if (!saved) return;
  announce(`${name}: ${completed ? 'completed' : 'completion undone'} for ${formatDate(day, { month: 'long', day: 'numeric' })}.`);
  if (completed && event.detail > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    app.querySelector(`[data-focus="${CSS.escape(`${id}:${day}`)}"] .check-box`)?.animate([
      { transform: 'scale(.88)' }, { transform: 'scale(1.08)', offset: .6 }, { transform: 'scale(1)' },
    ], { duration: 220, easing: 'cubic-bezier(.23,1,.32,1)' });
  }
}

function deleteHabit() {
  let removed;
  let index;
  const saved = commit(current => {
    index = current.habits.findIndex(habit => habit.id === editingId);
    if (index < 0) throw new Error('Habit no longer exists.');
    removed = current.habits[index];
    return { ...current, habits: current.habits.filter(habit => habit.id !== editingId) };
  });
  if (!saved) return;
  habitDialog.close();
  app.querySelector('[data-focus="add"]')?.focus();
  showNotice(`“${removed.name}” removed.`, () => {
    const restored = commit(current => {
      if (current.habits.some(habit => habit.id === removed.id)) return current;
      const habits = [...current.habits];
      habits.splice(index, 0, removed);
      return { ...current, habits };
    });
    if (restored) showNotice('Habit restored, check-ins and all.');
  });
}

function openData() {
  document.querySelector('#timezone-label').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Your local time';
  dataDialog.querySelector('details').open = false;
  dataDialog.showModal();
}

function resetData() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    state = emptyState();
    storageError = '';
    start = weekStart(dateKey());
    render();
    dataDialog.close();
    app.querySelector('[data-focus="add"]')?.focus();
    showNotice('A fresh page. All habits and history have been erased.');
  } catch {
    dataDialog.close();
    showNotice('Browser storage is unavailable. Your data could not be reset.');
  }
}

function navigateWeek(action) {
  if (action === 'previous') start = addDays(start, -7);
  if (action === 'next') start = addDays(start, 7);
  if (action === 'current') start = weekStart(today);
  if (start > weekStart(today)) start = weekStart(today);
  render();
  if (action === 'current') app.querySelector('[data-focus="previous"]')?.focus();
  announce(`Showing week of ${formatDate(start, { month: 'long', day: 'numeric', year: 'numeric' })}.`);
}

app.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'add') openHabit();
  if (action === 'suggest') openHabit(null, { name: button.dataset.name, color: button.dataset.color });
  if (action === 'edit') {
    const habit = state.habits.find(item => item.id === button.dataset.id);
    if (habit) openHabit(habit);
  }
  if (action === 'toggle') toggleDay(button, event);
  if (action === 'data') openData();
  if (['previous', 'next', 'current'].includes(action)) navigateWeek(action);
});

form.addEventListener('submit', saveHabit);
nameInput.addEventListener('input', () => setNameError());
document.querySelector('#delete-habit').addEventListener('click', () => {
  document.querySelector('#delete-confirm').hidden = false;
  document.querySelector('#cancel-delete').focus();
});
document.querySelector('#cancel-delete').addEventListener('click', () => {
  document.querySelector('#delete-confirm').hidden = true;
  document.querySelector('#delete-habit').focus();
});
document.querySelector('#confirm-delete').addEventListener('click', deleteHabit);
document.querySelector('#reset-data').addEventListener('click', resetData);
document.querySelector('#notice-undo').addEventListener('click', () => undoAction?.());
document.querySelector('#notice-close').innerHTML = icon('close');
document.querySelector('#notice-close').addEventListener('click', hideNotice);
document.querySelectorAll('[data-close]').forEach(button => {
  if (button.classList.contains('icon-button')) button.innerHTML = icon('close');
  button.addEventListener('click', () => button.closest('dialog').close());
});

function refreshDate() {
  const now = dateKey();
  if (now === today) return;
  const followingCurrentWeek = start === weekStart(today);
  today = now;
  if (followingCurrentWeek) start = weekStart(today);
  render();
  announce('A new day. Your habits are ready when you are.');
}

function refreshOnReturn() {
  refreshDate();
  load();
  render();
}

window.addEventListener('focus', refreshOnReturn);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshOnReturn();
});
window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY || event.key === null) {
    load();
    render();
  }
});
setInterval(refreshDate, 1000);

load();
render();
