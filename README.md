# Sleep Quality Predictor 😴

A sleek, highly interactive web application that predicts your sleep efficiency based on daily habits. Built with a real-time glassmorphism UI, this tool dynamically calculates a sleep score, tracks your daily streaks, awards achievement badges, and offers personalized insights — all without ever sending your data to a server.

## Live Demo 🌐
> Open `index.html` in any modern browser — no server or build step required.

---

## Features ✨

### Core
- **Real-Time Forecasting** — Instantly calculates your sleep score (0–100) as you tweak each habit slider. No submit button.
- **Dynamic Insights Panel** — Generates up to 4 contextual, personalized tips based on your exact inputs.
- **Circular Progress Gauge** — Color-coded arc (green / yellow / red) updates live with every slider change.
- **Premium Glassmorphism UI** — Dark and light themes with mouse-tracking gradient background, star field, and fluid animations.
- **Fully Responsive** — Collapses to a single-column layout on mobile (≤850px).

### Gamification
- **Daily Streak Tracker** 🔥 — Tracks how many consecutive days you've visited. Stored in `localStorage`. A welcome toast greets returning users.
- **Achievement Badges** 🏆 — 7 unlockable badges with animated unlock toasts:
  | Badge | Condition |
  |---|---|
  | 🌙 Sleep Master | Score ≥ 90 |
  | 💯 Perfect Score | Score = 100 |
  | 🔥 3-Day Streak | Visit 3 days in a row |
  | ⚡ Week Warrior | Visit 7 days in a row |
  | 🔄 Comeback Kid | Improve score by 20+ pts in one session |
  | 🥛 Clean Slate | Zero alcohol + zero caffeine + score ≥ 80 |
  | 🗓️ Iron Schedule | Very Consistent bedtime + score ≥ 85 |

### Analytics
- **7-Day Score History Chart** 📈 — Stores and visualizes your last 7 daily scores as an animated sparkline bar chart. Shows trend direction (improving / declining / stable).

### Productivity
- **Keyboard Shortcuts** ⌨️ — `R` to reset the form, `T` to toggle dark/light theme.
- **Light / Dark Theme** ☀️🌙 — Full theme system with persistent preference stored in `localStorage`.
- **Toast Notifications** 🔔 — Spring-animated toasts for badge unlocks, resets, theme changes, and streak milestones.

### SleepBot Chatbot 🤖
An intelligent keyword-based assistant. Ask it anything:
- `"What's my score?"` — Live score + quality label
- `"Show my history"` or `"trend"` — Streak, badge count, and score trend
- `"What badges do I have?"` — Unlocked count + next badge hint
- `"What's my streak?"` — Streak status with milestone context
- `caffeine`, `screen`, `stress`, `alcohol`, `exercise`, `insomnia`, `consistency` — Targeted sleep science tips

### PWA (Progressive Web App) 📱
- **Installable** — Add to your phone or desktop home screen via the browser install prompt.
- **Offline Support** — Service worker caches all assets so the app works without an internet connection after first load.

---

## Tech Stack 🛠️

| Layer | Technology |
|---|---|
| Structure | HTML5 (Semantic elements, ARIA) |
| Styling | CSS3 (Custom Properties, Grid, Flexbox, `backdrop-filter`, Keyframes) |
| Logic | Vanilla JavaScript ES6+ (Modules, `localStorage`, Service Worker) |
| Icons | FontAwesome 6.4 (CDN) |
| Typography | Google Fonts — Outfit (CDN) |
| No frameworks | No React, no Tailwind, no dependencies |

---

## How to Run 🚀

Since this is a static frontend application, no complex build tools or servers are required.

1. Clone or download this repository:
   ```bash
   git clone https://github.com/ranjith1432123-tech/sleep-quality-predictor.git
   ```
2. Navigate to the project folder and open `index.html` in Chrome, Edge, or Firefox.
3. Start adjusting the sliders and watch your sleep score update in real-time!

> **PWA Install**: In Chrome/Edge, look for the install icon in the address bar to add the app to your device.

---

## localStorage Data 📦

All data is stored locally — nothing is ever transmitted to a server.

| Key | Contents | Purpose |
|---|---|---|
| `sleepStreakData` | `{ streak: number, lastDate: string }` | Daily streak tracking |
| `sleepBadgesUnlocked` | `string[]` (badge IDs) | Persistent badge progress |
| `sleepTheme` | `"light"` \| `"dark"` | Theme preference |
| `sleepScoreHistory` | `{ date: string, score: number }[]` | 7-day score history |

---

## The Algorithm 🧠

*Note: This is a heuristic model for educational and portfolio purposes. It is not a clinical diagnostic tool.*

The scoring starts at a base of **75** and applies penalties or bonuses:

| Factor | Rule | Effect |
|---|---|---|
| Caffeine | > 200mg | −4pts per 100mg over |
| Screen Time | > 1 hour | −5pts per extra hour |
| Stress | > 5/10 | −4pts per point over 5 |
| Alcohol | Any drinks | −5pts per drink |
| Sleep Duration | < 7 hours | −7pts per hour short |
| Sleep Duration | > 9 hours | −3pts per excess hour |
| Exercise | 30–120 min | +3pts per 30-min block |
| Bedtime Consistency | Very Consistent | +8pts |
| Bedtime Consistency | Inconsistent | −8pts |

Final score is clamped: `Math.max(0, Math.min(100, score))`

---

## Project Structure 📁

```
sleep-quality-predictor/
├── index.html        # Landing page / hero
├── predictor.html    # Main app
├── script.js         # All application logic (495 lines)
├── styles.css        # Full design system (828 lines)
├── manifest.json     # PWA manifest
├── sw.js             # Service worker (offline cache)
└── README.md
```

---

## License 📄
This project is open-source and free to use for personal or educational purposes.
