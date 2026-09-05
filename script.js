document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Background Mouse Move
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        document.documentElement.style.setProperty('--mouse-x', `${x}%`);
        document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    });

    const form = document.getElementById('sleep-form');
    if (!form) return; // We are on the landing page, exit early

    // ===================================================
    // DOM References
    // ===================================================
    const inputs = {
        caffeine:     document.getElementById('caffeine'),
        screentime:   document.getElementById('screentime'),
        exercise:     document.getElementById('exercise'),
        sleepduration:document.getElementById('sleepduration'),
        stress:       document.getElementById('stress'),
        alcohol:      document.getElementById('alcohol'),
        consistency:  document.getElementById('consistency')
    };

    const displays = {
        caffeine:      document.getElementById('caffeine-val'),
        screentime:    document.getElementById('screentime-val'),
        exercise:      document.getElementById('exercise-val'),
        sleepduration: document.getElementById('sleepduration-val'),
        stress:        document.getElementById('stress-val')
    };

    const scoreCircle  = document.getElementById('score-circle');
    const scoreText    = document.getElementById('score-text');
    const emojiFeedback = document.getElementById('emoji-feedback');
    const qualityText  = document.getElementById('quality-text');
    const tipsList     = document.getElementById('tips-list');
    const resetBtn     = document.getElementById('reset-btn');

    // ===================================================
    // Toast Notification System
    // ===================================================
    const toastContainer = document.getElementById('toast-container');

    const showToast = (icon, title, desc, duration = 4000) => {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <span class="toast-icon" aria-hidden="true">${icon}</span>
            <div class="toast-body">
                <span class="toast-title">${title}</span>
                <span class="toast-desc">${desc}</span>
            </div>`;
        toastContainer.appendChild(toast);

        const remove = () => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        };
        const timer = setTimeout(remove, duration);
        toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
    };

    // ===================================================
    // Streak Tracking
    // ===================================================
    const STREAK_KEY = 'sleepStreakData';

    const getStreakData = () => {
        try {
            return JSON.parse(localStorage.getItem(STREAK_KEY)) || { streak: 0, lastDate: null };
        } catch { return { streak: 0, lastDate: null }; }
    };

    const updateStreak = () => {
        const today     = new Date().toDateString();
        const data      = getStreakData();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        let newStreak = data.streak;

        if (data.lastDate === today) {
            // Already visited today — no change
        } else if (data.lastDate === yesterday) {
            newStreak = data.streak + 1; // Consecutive day
        } else {
            newStreak = 1; // Streak broken or first time
        }

        localStorage.setItem(STREAK_KEY, JSON.stringify({ streak: newStreak, lastDate: today }));
        return newStreak;
    };

    const renderStreak = (streak) => {
        const el = document.getElementById('streak-count');
        if (el) el.textContent = streak;
    };

    // ===================================================
    // Score History (7-day)
    // ===================================================
    const HISTORY_KEY = 'sleepScoreHistory';
    const MAX_HISTORY = 7;

    const getHistory = () => {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch { return []; }
    };

    const saveScore = (score) => {
        const today   = new Date().toDateString();
        const history = getHistory();

        // Update today's entry or append
        const todayIndex = history.findIndex(e => e.date === today);
        if (todayIndex >= 0) {
            history[todayIndex].score = score;
        } else {
            history.push({ date: today, score });
        }

        // Keep only last MAX_HISTORY days
        const trimmed = history.slice(-MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
        return trimmed;
    };

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const renderHistory = (history) => {
        const chart = document.getElementById('history-chart');
        const trendEl = document.getElementById('history-trend');
        if (!chart) return;
        chart.innerHTML = '';

        if (history.length === 0) {
            chart.innerHTML = `<span class="history-empty">No history yet — your scores will appear here daily.</span>`;
            if (trendEl) trendEl.innerHTML = '';
            return;
        }

        const maxScore = 100;
        const chartH   = 80; // px, matches CSS

        history.forEach(entry => {
            const barH   = Math.max(4, Math.round((entry.score / maxScore) * chartH));
            const color  = entry.score >= 80
                ? 'var(--score-good)'
                : entry.score >= 60
                    ? 'var(--score-avg)'
                    : 'var(--score-poor)';
            const day    = DAYS[new Date(entry.date).getDay()];

            const wrap = document.createElement('div');
            wrap.classList.add('history-bar-wrap');
            wrap.innerHTML = `
                <div class="history-bar"
                     style="height:${barH}px; background:${color}; box-shadow: 0 0 8px ${color}60;"
                     data-score="${entry.score}"
                     title="Score: ${entry.score} on ${entry.date}">
                </div>
                <span class="history-label">${day}</span>`;
            chart.appendChild(wrap);
        });

        // Trend calculation
        if (trendEl && history.length >= 2) {
            const first = history[0].score;
            const last  = history[history.length - 1].score;
            const delta = last - first;
            if (delta > 5) {
                trendEl.innerHTML = `<span class="trend-up">▲ Improving</span> — up ${delta} pts over ${history.length} days`;
            } else if (delta < -5) {
                trendEl.innerHTML = `<span class="trend-down">▼ Declining</span> — down ${Math.abs(delta)} pts over ${history.length} days`;
            } else {
                trendEl.innerHTML = `<span class="trend-flat">◆ Stable</span> — steady over ${history.length} days`;
            }
        } else if (trendEl) {
            trendEl.innerHTML = '';
        }
    };

    // ===================================================
    // Badge Definitions — 7 badges
    // ===================================================
    const BADGES = [
        {
            id: 'sleep_master',
            emoji: '🌙',
            name: 'Sleep Master',
            desc: 'Score 90 or above',
            check: (score, streak, prev) => score >= 90
        },
        {
            id: 'perfect_score',
            emoji: '💯',
            name: 'Perfect Score',
            desc: 'Achieve a score of 100',
            check: (score, streak, prev) => score >= 100
        },
        {
            id: 'streak_3',
            emoji: '🔥',
            name: '3-Day Streak',
            desc: 'Use the app 3 days in a row',
            check: (score, streak, prev) => streak >= 3
        },
        {
            id: 'week_warrior',
            emoji: '⚡',
            name: 'Week Warrior',
            desc: 'Use the app 7 days in a row',
            check: (score, streak, prev) => streak >= 7
        },
        {
            id: 'comeback_kid',
            emoji: '🔄',
            name: 'Comeback Kid',
            desc: 'Improve your score by 20+ pts in one session',
            check: (score, streak, prev) => prev !== null && (score - prev) >= 20
        },
        {
            id: 'clean_slate',
            emoji: '🥛',
            name: 'Clean Slate',
            desc: 'Zero alcohol, zero caffeine, score ≥ 80',
            check: (score, streak, prev) => {
                const alc  = parseInt(inputs.alcohol.value);
                const caff = parseInt(inputs.caffeine.value);
                return alc === 0 && caff === 0 && score >= 80;
            }
        },
        {
            id: 'iron_schedule',
            emoji: '🗓️',
            name: 'Iron Schedule',
            desc: 'Very Consistent bedtime + score ≥ 85',
            check: (score, streak, prev) => inputs.consistency.value === 'high' && score >= 85
        }
    ];

    const BADGES_KEY = 'sleepBadgesUnlocked';

    const getUnlockedBadges = () => {
        try {
            return JSON.parse(localStorage.getItem(BADGES_KEY)) || [];
        } catch { return []; }
    };

    const saveUnlockedBadges = (ids) => {
        localStorage.setItem(BADGES_KEY, JSON.stringify(ids));
    };

    const renderBadges = (unlockedIds) => {
        const grid = document.getElementById('badges-grid');
        if (!grid) return;
        grid.innerHTML = '';
        BADGES.forEach(badge => {
            const isUnlocked = unlockedIds.includes(badge.id);
            const div = document.createElement('div');
            div.classList.add('badge-item');
            div.setAttribute('role', 'listitem');
            div.setAttribute('title', `${badge.name}: ${badge.desc}${isUnlocked ? ' ✓ Unlocked' : ' (locked)'}`);
            if (isUnlocked) div.classList.add('unlocked');
            div.innerHTML = `
                <span class="badge-emoji" aria-hidden="true">${badge.emoji}</span>
                <div class="badge-info">
                    <span class="badge-name">${badge.name}</span>
                    <span class="badge-desc">${badge.desc}</span>
                </div>`;
            grid.appendChild(div);
        });
    };

    const checkAndAwardBadges = (score, streak, prevScore) => {
        const unlocked = getUnlockedBadges();
        let changed = false;

        BADGES.forEach(badge => {
            if (!unlocked.includes(badge.id) && badge.check(score, streak, prevScore)) {
                unlocked.push(badge.id);
                changed = true;
                setTimeout(() => {
                    showToast(badge.emoji, 'Badge Unlocked!', `You earned "${badge.name}" — ${badge.desc}`);
                }, 400);
            }
        });

        if (changed) {
            saveUnlockedBadges(unlocked);
            renderBadges(unlocked);
        }
    };

    // ===================================================
    // Theme Toggle
    // ===================================================
    const THEME_KEY = 'sleepTheme';

    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    };

    const toggleTheme = () => {
        const isLight  = document.body.classList.contains('light-theme');
        const newTheme = isLight ? 'dark' : 'light';
        localStorage.setItem(THEME_KEY, newTheme);
        applyTheme(newTheme);
        showToast(
            newTheme === 'light' ? '☀️' : '🌙',
            'Theme Switched',
            `Now in ${newTheme === 'light' ? 'Light' : 'Dark'} Mode`
        );
    };

    // Load saved theme on startup (before first render to avoid flash)
    applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

    // ===================================================
    // Slider Fill Effect
    // ===================================================
    const updateSliderFill = (slider) => {
        const min  = parseFloat(slider.min) || 0;
        const max  = parseFloat(slider.max) || 100;
        const val  = parseFloat(slider.value);
        const pct  = ((val - min) / (max - min)) * 100;
        slider.style.setProperty('--range-progress', `${pct}%`);
        // Keep aria-valuenow in sync
        slider.setAttribute('aria-valuenow', slider.value);
    };

    const attachListeners = () => {
        Object.keys(inputs).forEach(key => {
            const el = inputs[key];
            el.addEventListener('input', () => {
                if (displays[key]) displays[key].textContent = el.value;
                if (el.type === 'range') updateSliderFill(el);
                updatePrediction();
            });
            if (el.type === 'range') updateSliderFill(el);
        });
    };

    // ===================================================
    // Score Calculation
    // ===================================================
    const calculateScore = () => {
        const caff   = parseInt(inputs.caffeine.value);
        const screen = parseFloat(inputs.screentime.value);
        const exe    = parseInt(inputs.exercise.value);
        const dur    = parseFloat(inputs.sleepduration.value);
        const str    = parseInt(inputs.stress.value);
        const alc    = parseInt(inputs.alcohol.value);
        const cons   = inputs.consistency.value;

        let score = 75;

        if (caff   > 200) score -= ((caff - 200) / 100) * 4;
        if (screen >   1) score -= (screen - 1) * 5;
        if (str    >   5) score -= (str - 5) * 4;
        if (alc    >   0) score -= alc * 5;
        if (dur    <   7) score -= (7 - dur) * 7;
        if (dur    >   9) score -= (dur - 9) * 3;

        if (exe >= 30 && exe <= 120) score += (exe / 30) * 3;
        if (cons === 'high') score += 8;
        if (cons === 'low')  score -= 8;

        return Math.max(0, Math.min(100, Math.round(score)));
    };

    // ===================================================
    // Tips Generation
    // ===================================================
    const generateTips = () => {
        const tips   = [];
        const caff   = parseInt(inputs.caffeine.value);
        const screen = parseFloat(inputs.screentime.value);
        const exe    = parseInt(inputs.exercise.value);
        const dur    = parseFloat(inputs.sleepduration.value);
        const str    = parseInt(inputs.stress.value);
        const alc    = parseInt(inputs.alcohol.value);

        if (caff   > 200) tips.push(`At ${caff}mg of caffeine, your deep sleep is likely compromised. Try switching to decaf after 2 PM.`);
        if (screen >   1) tips.push(`Reducing screen time by just 30 mins can drastically improve your natural melatonin production.`);
        if (exe    <  30) tips.push(`Try to reach at least 30 mins of exercise to help tire your body for deeper restorative sleep.`);
        if (dur    <   7) tips.push(`You are in sleep debt. Prioritize going to bed earlier to hit the 7-9 hour sweet spot.`);
        if (str    >   5) tips.push(`Stress is actively stealing your rest. A 5-minute breathing exercise in bed could help.`);
        if (alc    >   0) tips.push(`Even ${alc} drink(s) will fragment your REM sleep. Stay hydrated before bed.`);
        if (inputs.consistency.value === 'low') tips.push('Inconsistent bedtimes confuse your circadian rhythm. Try to wake up at the exact same time every day.');

        if (tips.length === 0) tips.push("Incredible! Your habits are perfectly tuned for optimal recovery. Keep it up!");

        return tips.slice(0, 4);
    };

    // ===================================================
    // Dashboard Update
    // ===================================================
    const updateDashboard = (score, tips) => {
        let color, emoji, text;

        if (score >= 80) {
            color = 'var(--score-good)'; emoji = '🌟'; text = 'Excellent Sleep';
        } else if (score >= 60) {
            color = 'var(--score-avg)';  emoji = '⚖️'; text = 'Fair Sleep';
        } else {
            color = 'var(--score-poor)'; emoji = '🚨'; text = 'Poor Sleep';
        }

        scoreText.textContent = score;
        scoreCircle.style.background  = `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`;
        scoreCircle.style.boxShadow   = `0 0 30px ${color}60`;
        scoreText.style.background    = `linear-gradient(135deg, ${color}, #fff)`;
        scoreText.style.webkitBackgroundClip = 'text';

        emojiFeedback.textContent = emoji;
        qualityText.textContent   = text;
        qualityText.style.color   = color;

        tipsList.style.opacity = '0';
        setTimeout(() => {
            tipsList.innerHTML = '';
            tips.forEach(tip => {
                const li = document.createElement('li');
                li.innerHTML = tip;
                tipsList.appendChild(li);
            });
            tipsList.style.opacity   = '1';
            tipsList.style.transition = 'opacity 0.3s ease';
        }, 150);
    };

    // ===================================================
    // Core Prediction Loop
    // ===================================================
    let lastScore   = 0;
    let sessionBase = null; // score at session start for Comeback Kid

    const updatePrediction = () => {
        const score  = calculateScore();
        const tips   = generateTips();
        const streak = getStreakData().streak;

        const prevScore = sessionBase; // null on very first call
        if (sessionBase === null) sessionBase = score;

        updateDashboard(score, tips);
        checkAndAwardBadges(score, streak, prevScore);
        renderBadges(getUnlockedBadges());

        // Save to history and re-render chart
        const history = saveScore(score);
        renderHistory(history);

        lastScore = score;
    };

    // ===================================================
    // Reset
    // ===================================================
    const doReset = () => {
        inputs.caffeine.value      = 200;
        inputs.screentime.value    = 2;
        inputs.exercise.value      = 30;
        inputs.sleepduration.value = 7;
        inputs.stress.value        = 5;
        inputs.alcohol.value       = 0;
        inputs.consistency.value   = 'medium';

        Object.keys(displays).forEach(key => {
            displays[key].textContent = inputs[key].value;
        });
        Object.keys(inputs).forEach(key => {
            if (inputs[key].type === 'range') updateSliderFill(inputs[key]);
        });

        sessionBase = null; // allow Comeback Kid to trigger again
        updatePrediction();
        showToast('🔄', 'Form Reset', 'All inputs restored to default values.');
    };

    resetBtn.addEventListener('click', doReset);

    // ===================================================
    // Keyboard Shortcuts
    // ===================================================
    document.addEventListener('keydown', (e) => {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        if (e.key === 'r' || e.key === 'R') doReset();
        else if (e.key === 't' || e.key === 'T') toggleTheme();
    });

    // ===================================================
    // PWA Install Prompt
    // ===================================================
    let deferredInstallPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;

        // Show install toast after 3 seconds
        setTimeout(() => {
            const toast = document.createElement('div');
            toast.classList.add('toast');
            toast.setAttribute('role', 'alert');
            toast.innerHTML = `
                <span class="toast-icon" aria-hidden="true">📱</span>
                <div class="toast-body">
                    <span class="toast-title">Install App</span>
                    <span class="toast-desc">Add SleepBot to your home screen for offline access!</span>
                </div>`;
            toastContainer.appendChild(toast);

            toast.style.cursor = 'pointer';
            toast.addEventListener('click', () => {
                toast.remove();
                if (deferredInstallPrompt) {
                    deferredInstallPrompt.prompt();
                    deferredInstallPrompt.userChoice.then(() => {
                        deferredInstallPrompt = null;
                    });
                }
            });

            setTimeout(() => {
                toast.classList.add('removing');
                toast.addEventListener('animationend', () => toast.remove(), { once: true });
            }, 8000);
        }, 3000);
    });

    // ===================================================
    // Initialize
    // ===================================================
    const currentStreak = updateStreak();
    renderStreak(currentStreak);
    attachListeners();
    updatePrediction();
    renderHistory(getHistory());

    if (currentStreak > 1) {
        setTimeout(() => {
            showToast('🔥', `${currentStreak}-Day Streak!`, `You're on a roll! Keep coming back every day.`);
        }, 800);
    }

    // ===================================================
    // Chatbot Logic
    // ===================================================
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow    = document.getElementById('chat-window');
    const closeChatBtn  = document.getElementById('close-chat-btn');
    const chatInput     = document.getElementById('chat-input');
    const sendChatBtn   = document.getElementById('send-chat-btn');
    const chatMessages  = document.getElementById('chat-messages');

    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', () => {
            chatWindow.style.display = 'flex';
            chatToggleBtn.style.display = 'none';
            chatToggleBtn.setAttribute('aria-expanded', 'true');
            chatInput.focus();
        });

        closeChatBtn.addEventListener('click', () => {
            chatWindow.style.display = 'none';
            chatToggleBtn.style.display = 'flex';
            chatToggleBtn.setAttribute('aria-expanded', 'false');
        });

        const getBotResponse = (input) => {
            const q = input.toLowerCase();

            // Score queries
            if (q.includes('my score') || q.includes('current score') ||
                q.includes('what is my score') || q.includes("what's my score") || q.includes('score')) {
                const label = lastScore >= 80 ? 'Excellent' : lastScore >= 60 ? 'Fair' : 'Poor';
                return `Your current sleep quality score is ${lastScore}/100 — that's ${label} Sleep! Adjust the sliders to see how your habits affect it.`;
            }

            // History / trend queries
            if (q.includes('history') || q.includes('past score') || q.includes('track record') ||
                q.includes('trend') || q.includes('progress') || q.includes('improving') || q.includes('declining')) {
                const streak   = getStreakData().streak;
                const unlocked = getUnlockedBadges();
                const history  = getHistory();
                let trendStr   = 'not enough data yet';
                if (history.length >= 2) {
                    const delta = history[history.length - 1].score - history[0].score;
                    trendStr = delta > 5 ? `improving (+${delta} pts)` : delta < -5 ? `declining (${delta} pts)` : 'stable';
                }
                return `You've been on a ${streak}-day streak 🔥, unlocked ${unlocked.length}/${BADGES.length} badges, and your score trend is ${trendStr} over the last ${history.length} day(s).`;
            }

            // Badge queries
            if (q.includes('badge') || q.includes('achievement') || q.includes('trophy') ||
                q.includes('reward') || q.includes('unlock') || q.includes('earned')) {
                const unlocked  = getUnlockedBadges();
                const remaining = BADGES.filter(b => !unlocked.includes(b.id));
                if (remaining.length === 0) return `🏆 Incredible — you've unlocked ALL ${BADGES.length} badges! You are a true Sleep Master!`;
                const next = remaining[0];
                return `You've unlocked ${unlocked.length}/${BADGES.length} badges. Next up: ${next.emoji} ${next.name} — ${next.desc}.`;
            }

            // Streak queries
            if (q.includes('streak') || q.includes('days in a row') || q.includes('consecutive')) {
                const streak = getStreakData().streak;
                if (streak >= 7) return `🔥 Amazing! You're on a ${streak}-day streak — you've earned the Week Warrior badge!`;
                if (streak >= 3) return `🔥 You're on a ${streak}-day streak — keep going to earn Week Warrior at day 7!`;
                return `You currently have a ${streak}-day streak. Come back tomorrow to keep it going! You need 3 days for the 3-Day Streak badge.`;
            }

            // Sleep tips
            if (q.includes('caffeine') || q.includes('coffee')) {
                return "Caffeine has a half-life of about 5 hours. Try to avoid it at least 6 hours before your desired bedtime!";
            } else if (q.includes('screen') || q.includes('phone') || q.includes('tv')) {
                return "The blue light from screens suppresses melatonin. Consider a digital sunset 1 hour before bed or use blue-light blocking glasses.";
            } else if (q.includes('stress') || q.includes('anxiety') || q.includes('worry')) {
                return "Stress is a major sleep disruptor. Try the 4-7-8 breathing method or write down your worries in a journal before getting into bed.";
            } else if (q.includes('alcohol') || q.includes('wine') || q.includes('beer')) {
                return "While alcohol might help you fall asleep faster, it significantly fragments your deep sleep and REM cycles. Limit intake close to bedtime.";
            } else if (q.includes('exercise') || q.includes('workout') || q.includes('gym')) {
                return "Regular exercise promotes better sleep, but try not to do vigorous workouts within 2 hours of bedtime, as it raises your core body temperature.";
            } else if (q.includes("can't sleep") || q.includes('insomnia') || q.includes('awake')) {
                return "If you can't fall asleep after 20 minutes, get out of bed and do a relaxing activity (like reading a physical book) in dim light until you feel sleepy.";
            } else if (q.includes('consistency') || q.includes('schedule') || q.includes('routine')) {
                return "Your circadian rhythm loves consistency! Try to wake up at the exact same time every day, even on weekends, to anchor your internal clock.";
            } else if (q.includes('help') || q.includes('what can you') || q.includes('commands')) {
                return "I can help with: your score, history/trend, badges, streaks, caffeine, screen time, stress, alcohol, exercise, insomnia, and bedtime consistency. Just ask!";
            } else {
                const fallbacks = [
                    "That's interesting! The key to great sleep is consistency, cool temperatures, and a dark room. What specifically are you struggling with?",
                    "I see! Tell me more about your daily habits. Do you exercise or consume caffeine late in the day?",
                    "Got it. Getting quality sleep is a holistic process. Have you noticed any patterns in when you feel most tired?",
                    "Good to know! Just remember, winding down with a relaxing pre-bed routine can work wonders. Try asking me about your score or badges!"
                ];
                return fallbacks[Math.floor(Math.random() * fallbacks.length)];
            }
        };

        const appendMessage = (text, isUser) => {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
            msgDiv.textContent = text;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const handleSend = () => {
            const text = chatInput.value.trim();
            if (!text) return;

            appendMessage(text, true);
            chatInput.value = '';

            setTimeout(() => {
                appendMessage(getBotResponse(text), false);
            }, 600);
        };

        sendChatBtn.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

});
