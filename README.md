# day by day

A calm, local-first habit tracker built for [Shipforte’s “A tiny habit tracker” challenge](https://shipforte.com/challenges/10000000-0000-4000-8000-000000000001).

Create a small collection of habits, keep a weekly record, and watch your daily progress grow. Built with vanilla JavaScript, CSS, and Vite. No runtime dependencies or account required.

## Run locally

Use Node.js **22.12+** (Node 24 recommended).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). To try a phone on the same network, open Vite’s printed network URL on the phone.

```sh
npm test          # Calendar, history, and persistence unit tests
npm run build    # Production output in dist/
npm run preview  # Preview the production build
```

Deploy `dist/` to any static web host. No environment variables, database, or backend are needed.

## Using the tracker

- Choose **New habit**, or start with an empty-state suggestion. Enter a name and pick a color/icon.
- Click any past or present date to check in; click again to undo. Upcoming dates are shown but cannot be checked ahead of time.
- Use the arrows to revisit earlier weeks, and **Today** to return to the current week. Weeks start on Monday.
- Select a habit’s pencil button to rename it, change its color, or remove it. Renaming preserves its entire history.
- Removing a habit offers an **Undo** action that restores its name and check-ins. This action stays visible until dismissed or replaced by another notification.
- The daily summary counts today’s completed habits. A streak includes consecutive days ending today, or yesterday while today is still in progress.
- Native buttons work with Tab, Enter, and Space. Dialogs contain keyboard focus and close with Escape. Completion buttons expose their checked state to screen readers. Reduced-motion preferences are respected.

## Data storage and dates

Habits are stored as versioned JSON under **`day-by-day:v1`** in this origin’s `localStorage`. Each habit has a unique ID, a name, a color, a creation date, and unique completion date keys. Changes are persisted immediately and remain after page reloads and normal browser restarts. An unsuccessful save displays an error and does not update the UI as if it succeeded. Invalid stored data is left untouched.

All keys use local **`YYYY-MM-DD`** calendar dates, never UTC timestamps. Calendar arithmetic handles daylight saving changes. The page checks for local day changes once a second and on returning to the app; a new week follows automatically when viewing the current week. History stays on its original date even if the device’s time zone changes.

Open tabs pick up storage changes, and each edit reads the latest saved state first. Simultaneous writes from multiple tabs are still subject to localStorage’s last-write-wins behavior.

Storage belongs to this browser, device, and origin (including port). It does not sync across devices. Private browsing data is temporary; clearing site data removes it. Typography uses Google Fonts with local system fallbacks. Habit data never leaves the browser.

## Reset to the empty state

Click **Your space. Your data.** in the footer (or **Saved on this device** in the header), expand **Start fresh**, then select **Erase all habits & history**. This clears only the tracker’s storage key and is permanent.

Alternatively, run this in the browser’s developer console:

```js
localStorage.removeItem('day-by-day:v1');
location.reload();
```

## Challenge walkthrough

1. Create “Read a few pages” and “Take a walk”.
2. Mark different days for each habit. Use the previous week if today is Monday.
3. Toggle one completed day off; verify other check-ins remain.
4. Rename the first habit. Reload and verify names and dates.
5. Remove a habit and use Undo to restore its history.
6. Repeat at a phone viewport. All seven days remain together below each habit.

Submission screenshots are stored in `screenshots/`: the empty state, a populated week, and the mobile layout.
