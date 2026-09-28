import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { addDays, currentStreak, isDateKey, weekDates, weekStart } from '../src/dates.js';
import { readState, setCompletion, writeState, STORAGE_KEY } from '../src/store.js';

const habit = { id: 'a', name: 'Read', color: 'fern', createdOn: '2026-09-28', completions: [] };

test('check-ins are idempotent and undo affects only the selected habit and day', () => {
  const first = setCompletion(habit, '2026-09-28', true);
  const repeated = setCompletion(first, '2026-09-28', true);
  const secondDay = setCompletion(repeated, '2026-09-29', true);
  const undone = setCompletion(secondDay, '2026-09-28', false);
  assert.deepEqual(repeated.completions, ['2026-09-28']);
  assert.deepEqual(undone.completions, ['2026-09-29']);
  assert.deepEqual(habit.completions, []);
});

test('renamed habits and independent histories survive a storage round-trip', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const first = { ...setCompletion(habit, '2026-09-28', true), name: 'Read ten pages' };
  const second = setCompletion({ ...habit, id: 'b', name: 'Walk' }, '2026-09-27', true);
  writeState(storage, { version: 1, habits: [first, second] });
  const restored = readState(storage);
  assert.deepEqual(restored.habits, [first, second]);
  assert.equal(restored.habits[0].name, 'Read ten pages');
  assert.ok(data.has(STORAGE_KEY));
});

test('bad saved data is rejected rather than silently erased', () => {
  for (const value of ['invalid json', '{"version":2,"habits":[]}', JSON.stringify({ version: 1, habits: [{ ...habit, completions: ['2026-02-30'] }] })]) {
    assert.throws(() => readState({ getItem: () => value }));
  }
  assert.throws(() => writeState({ setItem: () => { throw new Error('QuotaExceededError'); } }, { version: 1, habits: [habit] }));
});

test('weeks cross month and year boundaries using seven calendar dates', () => {
  assert.equal(weekStart('2027-01-03'), '2026-12-28');
  assert.deepEqual(weekDates('2026-12-28'), ['2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03']);
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(isDateKey('2026-02-29'), false);
});

test('local dates stay local across UTC offsets and daylight saving changes', () => {
  const script = `import {dateKey,addDays,weekDates} from './src/dates.js';
    console.log(JSON.stringify({
      late: dateKey(new Date(2026, 8, 28, 23, 59)),
      early: dateKey(new Date(2026, 8, 28, 0, 1)),
      spring: weekDates('2026-03-06'),
      fall: addDays('2026-11-01', 1)
    }));`;
  for (const timezone of ['America/Los_Angeles', 'Pacific/Auckland', 'Asia/Tokyo', 'Europe/London']) {
    const result = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: new URL('..', import.meta.url), env: { ...process.env, TZ: timezone }, encoding: 'utf8' }));
    assert.equal(result.late, '2026-09-28', timezone);
    assert.equal(result.early, '2026-09-28', timezone);
    assert.deepEqual(result.spring, ['2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12']);
    assert.equal(result.fall, '2026-11-02');
  }
});

test('a streak remains alive before today is checked, and ends after a missed day', () => {
  assert.equal(currentStreak(['2026-09-26', '2026-09-27'], '2026-09-28'), 2);
  assert.equal(currentStreak(['2026-09-26', '2026-09-27', '2026-09-28'], '2026-09-28'), 3);
  assert.equal(currentStreak(['2026-09-26'], '2026-09-28'), 0);
});
