import { currentStreak, formatDate, weekDates, weekStart } from './dates.js';
import { colorIcons, garden, icon } from './icons.js';

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function dayHeading(day, today) {
  return `<div class="day-heading ${day === today ? 'is-today' : ''}" ${day === today ? 'aria-current="date"' : ''}>
    <span>${formatDate(day, { weekday: 'short' })}</span><strong>${formatDate(day, { day: 'numeric' })}</strong>
    <small>${day === today ? 'TODAY' : ''}</small></div>`;
}

function dayButton(habit, day, today) {
  const done = habit.completions.includes(day);
  const future = day > today;
  const label = `${habit.name}, ${formatDate(day, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
  return `<div class="day-cell ${day === today ? 'today-cell' : ''}">
    <span class="mobile-day ${day === today ? 'today-label' : ''}">${day === today ? 'Today' : formatDate(day, { weekday: 'narrow' })}<span>${formatDate(day, { day: 'numeric' })}</span>${day === today ? '<i aria-hidden="true"></i>' : ''}</span>
    <button class="day-button ${done ? 'is-complete' : ''}" data-action="toggle" data-id="${escapeHTML(habit.id)}" data-day="${day}" data-focus="${escapeHTML(habit.id)}:${day}" aria-pressed="${done}" aria-label="${escapeHTML(label)}${future ? ', upcoming' : ''}" title="${future ? 'A fresh start is waiting. Check in on this day.' : done ? 'Completed · click to undo' : 'Mark complete'}" ${future ? 'disabled' : ''}>
      <span class="check-box">${done ? icon('check') : '<span class="empty-dot"></span>'}</span>
    </button></div>`;
}

function habitRow(habit, days, today) {
  const total = days.filter(day => habit.completions.includes(day)).length;
  const streak = currentStreak(habit.completions, today);
  return `<article class="habit-row" data-color="${habit.color}" aria-label="${escapeHTML(habit.name)}">
    <div class="habit-info"><span class="habit-icon">${icon(colorIcons[habit.color])}</span><div class="habit-copy"><h3>${escapeHTML(habit.name)}</h3><span class="habit-meta">${total} of 7 days${streak > 1 ? `<span class="meta-dot">·</span>${streak}-day streak` : ''}</span></div></div>
    <div class="habit-days">${days.map(day => dayButton(habit, day, today)).join('')}</div>
    <button class="icon-button edit-habit" data-action="edit" data-id="${escapeHTML(habit.id)}" data-focus="edit:${escapeHTML(habit.id)}" aria-label="Edit ${escapeHTML(habit.name)}" title="Rename or remove habit">${icon('edit')}</button>
  </article>`;
}

function emptyView() {
  return `<div class="empty-state"><div class="empty-art">${garden('empty')}</div><span class="eyebrow">EVERY GOOD THING STARTS SMALL</span><h3>Your first habit is a fresh start.</h3><p>A glass of water. A few pages. A moment outside.<br>Choose one small thing you’d like to do each day.</p><button class="button primary" data-action="add">${icon('plus')} Add your first habit</button><div class="suggestions"><span>A little inspiration</span><button data-action="suggest" data-name="Read a few pages" data-color="honey">${icon('book')} Read a few pages</button><button data-action="suggest" data-name="Take a walk" data-color="fern">${icon('leaf')} Take a walk</button><button data-action="suggest" data-name="Drink a glass of water" data-color="sky">${icon('water')} Drink water</button></div></div>`;
}

function todayCard(habits, today) {
  const count = habits.filter(habit => habit.completions.includes(today)).length;
  const percent = habits.length ? Math.round(count / habits.length * 100) : 0;
  const finished = habits.length > 0 && count === habits.length;
  return `<section class="today-card" aria-labelledby="today-title"><div class="card-kicker">${icon('sun')} A LITTLE BETTER, EVERY DAY</div>
    <h2 id="today-title">${finished ? 'Look at you grow.' : 'Today is a good day\nto begin.'}</h2>
    ${garden()}
    <div class="today-progress"><div><span class="eyebrow">TODAY’S PROGRESS</span><p><strong>${count}</strong><span> / ${habits.length} habits</span></p></div><div class="progress-ring ${finished ? 'finished' : ''}" style="--progress:${percent}%" role="img" aria-label="${percent}% of today's habits complete"><span>${finished ? icon('check') : `${percent}<small>%</small>`}</span></div></div>
    <p class="progress-note">${finished ? 'You showed up for yourself. Take that feeling with you.' : count ? 'That’s a little promise kept. Keep going at your own pace.' : 'No perfect days needed. Just a little showing up.'}</p>
  </section>`;
}

export function renderApp({ habits, today, start, storageError }) {
  const days = weekDates(start);
  const thisWeek = start === weekStart(today);
  const checkins = habits.reduce((sum, habit) => sum + days.filter(day => habit.completions.includes(day)).length, 0);
  const range = `${formatDate(days[0], { month: 'short', day: 'numeric' })} – ${formatDate(days[6], { month: 'short', day: 'numeric', year: 'numeric' })}`;
  return `<div class="page-shell"><header class="site-header"><a class="brand" href="./" aria-label="day by day home"><span class="brand-icon">${icon('sprout')}</span>day by day<span class="brand-period">.</span></a><div class="header-right"><span class="header-note">Small habits. A little more you.</span><button class="saved-status" data-action="data">${storageError ? '<span class="error-dot"></span>' : '<span class="status-dot"></span>'}${storageError ? 'Storage needs attention' : 'Saved on this device'}</button></div></header>
    <main><div id="storage-error" class="storage-error" role="alert" ${storageError ? '' : 'hidden'}>${escapeHTML(storageError)} ${storageError ? '<button class="text-button" data-action="data">Your data</button>' : ''}</div>
      <section class="intro"><div><div class="eyebrow intro-kicker"><span></span> YOUR EVERYDAY, A LITTLE MORE INTENTIONAL</div><h1>Small steps.<br><em>Meaningful days.</em></h1><p>A calm little place to keep the promises you make to yourself.</p></div><div class="intro-date">${icon('sun')}<span>${formatDate(today, { weekday: 'long' })}<strong>${formatDate(today, { month: 'long', day: 'numeric', year: 'numeric' })}</strong></span></div></section>
      <div class="workspace"><section class="habits-panel" aria-labelledby="habits-title"><div class="section-heading"><div><h2 id="habits-title" tabindex="-1">Your habits <span class="count-badge">${habits.length}</span></h2><p>Little things, done a little more often.</p></div><button class="button primary add-button" data-action="add" data-focus="add">${icon('plus')}<span>New habit</span></button></div>
        <div class="week-toolbar"><div class="week-label">${icon('left', 'unused')}<strong>${thisWeek ? 'This week' : 'Your week'}</strong><span>${range}</span></div><div class="week-controls">${!thisWeek ? '<button class="text-button return-today" data-action="current" data-focus="current">Today</button>' : ''}<button class="icon-button" data-action="previous" data-focus="previous" aria-label="Previous week">${icon('left')}</button><button class="icon-button" data-action="next" data-focus="next" aria-label="Next week" ${thisWeek ? 'disabled' : ''}>${icon('right')}</button></div></div>
        ${habits.length ? `<div class="week-grid-heading"><span class="eyebrow">A LITTLE EACH DAY</span><div class="week-days-heading">${days.map(day => dayHeading(day, today)).join('')}</div><span></span></div><div class="habit-list">${habits.map(habit => habitRow(habit, days, today)).join('')}</div><button class="add-row" data-action="add" data-focus="add-row">${icon('plus')} Make room for another habit</button><div class="grid-footer"><span>${icon('check')} <strong>${checkins}</strong> check-in${checkins === 1 ? '' : 's'} this week</span><span class="grid-tip">Click a day to check in. Click again to undo.</span></div>` : emptyView()}
      </section><aside>${todayCard(habits, today)}<div class="perspective"><span class="eyebrow">A GENTLE REMINDER</span><p>“You don’t have to be perfect.<br>Just keep coming back.”</p><span class="little-flower" aria-hidden="true">✳</span><span>Progress has its own pace.</span></div></aside></div>
      <div class="bottom-note">${icon('sprout')} A little today becomes a lot over time.</div>
    </main><footer class="site-footer"><span>Made for the beautifully ordinary days.</span><button class="text-button" data-action="data">${icon('lock')} Your space. Your data.</button></footer></div>`;
}
