// Calendar dates deliberately never pass through UTC or ISO timestamp parsing.
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function fromDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function addDays(key, amount) {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

export function weekStart(key) {
  return addDays(key, -((fromDateKey(key).getDay() + 6) % 7));
}

export function weekDates(start) {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function formatDate(key, options) {
  return fromDateKey(key).toLocaleDateString(undefined, options);
}

export function isDateKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && dateKey(fromDateKey(value)) === value;
}

export function currentStreak(completions, today) {
  const days = new Set(completions);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
