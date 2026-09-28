import { isDateKey } from './dates.js';

export const STORAGE_KEY = 'day-by-day:v1';
export const COLORS = ['fern', 'clay', 'lavender', 'sky', 'honey'];
export const emptyState = () => ({ version: 1, habits: [] });

function validHabit(habit) {
  return habit && typeof habit.id === 'string' && habit.id.length > 0
    && typeof habit.name === 'string' && habit.name.trim().length > 0 && habit.name.length <= 100
    && COLORS.includes(habit.color) && isDateKey(habit.createdOn)
    && Array.isArray(habit.completions) && habit.completions.every(isDateKey);
}

export function readState(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return emptyState();
  const state = JSON.parse(raw);
  if (state?.version !== 1 || !Array.isArray(state.habits) || !state.habits.every(validHabit)) {
    throw new Error('The saved habit data could not be read.');
  }
  if (new Set(state.habits.map(habit => habit.id)).size !== state.habits.length) {
    throw new Error('The saved habits contain duplicate identifiers.');
  }
  return { version: 1, habits: state.habits.map(habit => ({
    id: habit.id, name: habit.name, color: habit.color, createdOn: habit.createdOn,
    completions: [...new Set(habit.completions)],
  })) };
}

export function writeState(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function setCompletion(habit, day, complete) {
  const completions = new Set(habit.completions);
  if (complete) completions.add(day);
  else completions.delete(day);
  return { ...habit, completions: [...completions].sort() };
}
