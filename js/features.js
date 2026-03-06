// js/features.js — v6 (серверные данные, викторина)

class ExtraFeatures {
    constructor(storage) {
        this.storage = storage;
    }

    // ========== КОЛЕСО УДАЧИ (серверные данные) ==========
    openLuckyWheel() {
        document.getElementById('luckyWheelOverlay')?.remove();

        const prizes = this.storage.get('wheelPrizes') || [
            { emoji: '⭐', name: '+5 звёзд', type: 'stars', value: 5 },
            { emoji: '⭐', name: '+10 звёзд', type: 'stars', value: 10 },
            { emoji: '⭐', name: '+25 звёзд', type: 'stars', value: 25 },
            { emoji: '💌', name: 'Секретное письмо', type: 'letter', value: null },
            { emoji: '🤗', name: 'Обнимашки', type: 'gift', value: 'hug' },
            { emoji: '💋', name: 'Поцелуй', type: 'gift', value: 'kiss' },
            { emoji: '🌹', name: 'Роза', type: 'gift', value: 'rose' },
            { emoji: '🎉', name: 'Сюрприз!', type: 'stars', value: 50 },
        ];

        const lastSpin = this.storage.get('lastSpin');
        const canSpin = lastSpin !== new Date().toDateString();

        const html = `
            <div class="admin-modal-overlay active" id="luckyWheelOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('luckyWheelOverlay').remove()">✕</button>
                        <h2>🎰 Колесо удачи</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="wheel-container">
                            <div class="wheel" id="luckyWheel"></div>
                            <div class="wheel-pointer">▼</div>
                            <div class="wheel-center">🎯</div>
                        </div>
                        <div style="text-align:center;margin-bottom:12px;">
                            <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;">
                                ${prizes.map(p => `<span style="font-size:10px;background:var(--pink-light);padding:2px 8px;border-radius:10px;">${p.emoji} ${p.name}</span>`).join('')}
                            </div>
                        </div>
                        <div class="wheel-result" id="wheelResult" style="display:none;">
                            <div class="wheel-result-emoji" id="wheelResultEmoji"></div>
                            <div class="wheel-result-text" id="wheelResultText"></div>
                        </div>
                        <button class="admin-submit-btn" id="spinBtn" ${canSpin ? '' : 'disabled'} style="${canSpin ? '' : 'opacity:0.5'}">
                            ${canSpin ? '🎰 Крутить!' : '⏳ Завтра!'}
                        </button>
                        ${!canSpin ? '<p style="text-align:center;font-size:12px;color:var(--text-light);margin-top:8px;">Следующий спин завтра!</p>' : ''}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this._prizes = prizes;

        if (canSpin) {
            document.getElementById('spinBtn').onclick = () => this.spinWheel();
        }
    }

    spinWheel() {
        const wheel = document.getElementById('luckyWheel');
        const spinBtn = document.getElementById('spinBtn');
        if (!wheel || !spinBtn) return;

        spinBtn.disabled = true;
        spinBtn.textContent = '🎰 Крутим...';
        spinBtn.style.opacity = '0.5';

        const prizeIndex = Math.floor(Math.random() * this._prizes.length);
        const prize = this._prizes[prizeIndex];
        const degrees = 360 * 5 + (prizeIndex * (360 / this._prizes.length));

        wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        wheel.style.transform = `rotate(${degrees}deg)`;

        setTimeout(() => {
            this.applyPrize(prize);
            const resultDiv = document.getElementById('wheelResult');
            if (resultDiv) {
                resultDiv.style.display = 'block';
                document.getElementById('wheelResultEmoji').textContent = prize.emoji;
                document.getElementById('wheelResultText').textContent = `Вы выиграли: ${prize.name}!`;
            }
            spinBtn.textContent = '🎉 Ура!';
            this.storage.set('lastSpin', new Date().toDateString());
            window.app?.effects?.launchConfetti?.(60);
        }, 4500);
    }

    applyPrize(prize) {
        const profile = this.storage.getProfile();
        const isAdmin = window.app?.isAdmin;

        switch (prize.type) {
            case 'stars': {
                const key = isAdmin ? 'adminStars' : 'userStars';
                this.storage.updateProfile({ [key]: (profile[key] || 0) + prize.value });
                window.app?.showToast(`+${prize.value} ⭐!`);
                break;
            }
            case 'gift': {
                this.storage.addGift({
                    id: 'gift_wheel_' + Date.now(),
                    giftId: prize.value,
                    emoji: prize.emoji,
                    name: prize.name,
                    message: 'Выигрыш в Колесе удачи! 🎰',
                    from: 'system',
                    to: isAdmin ? 'admin' : 'user',
                    date: new Date().toISOString(),
                    opened: false
                });
                window.app?.showToast(`${prize.emoji} Подарок получен!`);
                break;
            }
            case 'letter': {
                const texts = [
                    'Ты знаешь, что самое прекрасное в моей жизни? Это ты. 💕',
                    'Если бы мне дали выбрать — я бы снова выбрал тебя. ❤️',
                    'Каждый закат напоминает мне о тебе — такой же красивый. 🌅',
                ];
                this.storage.addLetter({
                    id: 'letter_wheel_' + Date.now(),
                    from: 'system',
                    subject: '🎰 Секретное письмо!',
                    text: texts[Math.floor(Math.random() * texts.length)],
                    mood: '✨',
                    date: new Date().toISOString(),
                    read: false, favorite: false, reactions: [], replies: []
                });
                window.app?.showToast('💌 Секретное письмо!');
                break;
            }
        }
    }

    // ========== ВИКТОРИНА (серверные данные) ==========
    openQuiz() {
        document.getElementById('quizOverlay')?.remove();

        const questions = this.storage.get('quizQuestions') || [
            { q: 'Какой наш любимый фильм?', options: ['Титаник', 'Ещё не решили!', 'Начало'], correct: 1, reward: 5 },
            { q: 'Где было первое свидание?', options: ['В кафе', 'В парке', 'Дома'], correct: 0, reward: 5 },
            { q: 'Что я люблю больше всего?', options: ['Пиццу', 'Тебя!', 'Спать'], correct: 1, reward: 10 },
        ];

        if (questions.length === 0) {
            window.app?.showToast('Вопросов пока нет! 🧠');
            return;
        }

        this._quizQuestions = questions;
        this._quizIndex = 0;
        this._quizScore = 0;
        this._quizStars = 0;
        this.renderQuizQuestion();
    }

    renderQuizQuestion() {
        document.getElementById('quizOverlay')?.remove();
        const q = this._quizQuestions[this._quizIndex];
        if (!q) { this.showQuizResults(); return; }

        const progress = `${this._quizIndex + 1}/${this._quizQuestions.length}`;

        const html = `
            <div class="admin-modal-overlay active" id="quizOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('quizOverlay').remove()">✕</button>
                        <h2>🧠 Викторина (${progress})</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div style="text-align:center;margin-bottom:20px;">
                            <div style="font-size:14px;font-weight:700;line-height:1.5;">${q.q}</div>
                            <div style="font-size:10px;color:var(--text-light);margin-top:6px;">Награда: ${q.reward || 5} ⭐</div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:10px;">
                            ${q.options.map((opt, i) => `
                                <button class="admin-submit-btn" style="background:var(--gradient-card);color:var(--text-dark);box-shadow:0 2px 8px var(--shadow-pink);border:1px solid rgba(255,133,162,0.1);" 
                                    onclick="app.features.answerQuiz(${i})">${opt}</button>
                            `).join('')}
                        </div>
                        <div style="text-align:center;margin-top:16px;">
                            <span style="font-size:11px;color:var(--text-light);">Счёт: ${this._quizScore}/${this._quizIndex} | ⭐ ${this._quizStars}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    answerQuiz(answerIndex) {
        const q = this._quizQuestions[this._quizIndex];
        const isCorrect = answerIndex === q.correct;

        if (isCorrect) {
            this._quizScore++;
            this._quizStars += (q.reward || 5);
            window.app?.showToast('✅ Правильно!');
        } else {
            window.app?.showToast(`❌ Ответ: ${q.options[q.correct]}`);
        }

        this._quizIndex++;
        setTimeout(() => this.renderQuizQuestion(), 800);
    }

    showQuizResults() {
        document.getElementById('quizOverlay')?.remove();

        if (this._quizStars > 0) {
            const profile = this.storage.getProfile();
            const key = window.app?.isAdmin ? 'adminStars' : 'userStars';
            this.storage.updateProfile({ [key]: (profile[key] || 0) + this._quizStars });
        }

        const total = this._quizQuestions.length;
        const pct = Math.round(this._quizScore / total * 100);
        let emoji = '😢', msg = 'Попробуй ещё!';
        if (pct >= 80) { emoji = '🏆'; msg = 'Отлично!'; }
        else if (pct >= 50) { emoji = '😊'; msg = 'Хороший результат!'; }

        const html = `
            <div class="admin-modal-overlay active" id="quizOverlay">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('quizOverlay').remove()">✕</button>
                        <h2>🧠 Результаты</h2>
                    </div>
                    <div class="admin-modal-body" style="text-align:center;">
                        <div style="font-size:64px;margin-bottom:12px;">${emoji}</div>
                        <div style="font-size:16px;font-weight:700;">${msg}</div>
                        <div style="font-size:13px;margin-top:8px;">${this._quizScore}/${total} (${pct}%)</div>
                        ${this._quizStars > 0 ? `<div style="font-size:14px;color:var(--gold, #f5a623);font-weight:700;margin-top:8px;">+${this._quizStars} ⭐</div>` : ''}
                        <button class="admin-submit-btn" style="margin-top:20px;" onclick="document.getElementById('quizOverlay').remove()">🎉 Супер!</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        if (this._quizStars > 0) window.app?.effects?.launchConfetti?.(40);
    }

    // ========== ЦЕЛИ ==========
    openGoals() {
        document.getElementById('goalsOverlay')?.remove();
        const goals = this.storage.get('goals') || [];
        const done = goals.filter(g => g.done).length;
        const total = goals.length;

        const html = `
            <div class="admin-modal-overlay active" id="goalsOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('goalsOverlay').remove()">✕</button>
                        <h2>🎯 Наши цели</h2>
                    </div>
                    <div class="admin-modal-body">
                        ${!window.app?.isGuest ? `
                        <div class="goal-add-form">
                            <input type="text" class="admin-input" id="goalInput" placeholder="Новая цель: поехать на море 🏖️">
                            <div class="goal-add-row">
                                <select class="admin-select" id="goalCategory">
                                    <option value="travel">✈️ Путешествие</option>
                                    <option value="experience">🎭 Впечатления</option>
                                    <option value="gift">🎁 Покупка</option>
                                    <option value="milestone">💑 Веха</option>
                                </select>
                                <button class="admin-add-btn" onclick="app.features.addGoal()">+</button>
                            </div>
                        </div>` : ''}
                        <div class="goals-list" id="goalsList">
                            ${total === 0
                                ? '<div class="goals-empty">Добавьте первую цель! 💫</div>'
                                : goals.map(g => this.renderGoalItem(g)).join('')}
                        </div>
                        <div class="goals-progress">
                            <div class="goals-progress-label">Выполнено: ${done}/${total}</div>
                            <div class="goals-progress-bar">
                                <div class="goals-progress-fill" style="width: ${total > 0 ? Math.round(done / total * 100) : 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    renderGoalItem(goal) {
        const emojis = { travel: '✈️', experience: '🎭', gift: '🎁', milestone: '💑', other: '⭐' };
        return `
            <div class="goal-item ${goal.done ? 'done' : ''}">
                <button class="goal-check" onclick="app.features.toggleGoal('${goal.id}')">${goal.done ? '✅' : '⬜'}</button>
                <div class="goal-info">
                    <span class="goal-category-emoji">${emojis[goal.category] || '⭐'}</span>
                    <span class="goal-text ${goal.done ? 'completed' : ''}">${goal.text}</span>
                </div>
                ${!window.app?.isGuest ? `<button class="goal-delete" onclick="app.features.deleteGoal('${goal.id}')">✕</button>` : ''}
            </div>
        `;
    }

    addGoal() {
        const input = document.getElementById('goalInput');
        const text = input?.value?.trim();
        if (!text) { window.app?.showToast('Введите цель! 🎯'); return; }

        const newGoal = {
            id: 'goal_' + Date.now(),
            text,
            category: document.getElementById('goalCategory')?.value || 'other',
            done: false,
            createdAt: new Date().toISOString()
        };

        const goals = this.storage.get('goals') || [];
        goals.push(newGoal);
        this.storage.set('goals', goals);
        this.storage.serverPost('/api/goals', newGoal);
        document.getElementById('goalsOverlay')?.remove();
        this.openGoals();
        window.app?.showToast('Цель добавлена! 🎯');
    }

    toggleGoal(goalId) {
        const goals = this.storage.get('goals') || [];
        const g = goals.find(g => g.id === goalId);
        if (g) {
            g.done = !g.done;
            this.storage.set('goals', goals);
            this.storage.serverPut(`/api/goals/${goalId}`, { done: g.done });
            if (g.done) {
                window.app?.effects?.launchConfetti?.(30);
                window.app?.showToast('Цель выполнена! 🎉');
            }
            document.getElementById('goalsOverlay')?.remove();
            this.openGoals();
        }
    }

    deleteGoal(goalId) {
        const goals = (this.storage.get('goals') || []).filter(g => g.id !== goalId);
        this.storage.set('goals', goals);
        this.storage.serverDelete(`/api/goals/${goalId}`);
        document.getElementById('goalsOverlay')?.remove();
        this.openGoals();
    }

    // ========== АНАЛИТИКА ==========
    openAnalytics() {
        document.getElementById('analyticsOverlay')?.remove();
        const stats = this.storage.getStats();
        const letters = this.storage.getLetters();
        const gifts = this.storage.getGifts();
        const goals = this.storage.get('goals') || [];

        const totalLetters = letters.length;
        const totalReplies = letters.reduce((sum, l) => sum + (l.replies?.length || 0), 0);
        const totalReactions = letters.reduce((sum, l) => sum + (l.reactions?.length || 0), 0);
        const totalGifts = gifts.length;
        const completedGoals = goals.filter(g => g.done).length;

        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const dayCounts = new Array(7).fill(0);
        letters.forEach(l => dayCounts[new Date(l.date).getDay()]++);
        const maxDay = dayNames[dayCounts.indexOf(Math.max(...dayCounts))];

        const loveScore = Math.min(100, Math.round(
            (totalLetters * 3 + totalReplies * 2 + totalReactions + totalGifts * 5 + completedGoals * 10) /
            Math.max(1, (stats.daysTogether || 1) / 10)
        ));

        const html = `
            <div class="admin-modal-overlay active" id="analyticsOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('analyticsOverlay').remove()">✕</button>
                        <h2>📊 Аналитика</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="analytics-hero">
                            <div class="analytics-days">
                                <span class="analytics-big-number">${stats.daysTogether || 0}</span>
                                <span class="analytics-label">дней вместе</span>
                            </div>
                        </div>
                        <div class="analytics-grid">
                            <div class="analytics-card"><span class="analytics-card-emoji">💌</span><span class="analytics-card-value">${totalLetters}</span><span class="analytics-card-label">писем</span></div>
                            <div class="analytics-card"><span class="analytics-card-emoji">💬</span><span class="analytics-card-value">${totalReplies}</span><span class="analytics-card-label">ответов</span></div>
                            <div class="analytics-card"><span class="analytics-card-emoji">😍</span><span class="analytics-card-value">${totalReactions}</span><span class="analytics-card-label">реакций</span></div>
                            <div class="analytics-card"><span class="analytics-card-emoji">🎁</span><span class="analytics-card-value">${totalGifts}</span><span class="analytics-card-label">подарков</span></div>
                        </div>
                        <div class="analytics-facts">
                            <h3>💡 Факты</h3>
                            <div class="fact-item"><span class="fact-icon">📅</span><span>Активный день: <strong>${maxDay}</strong></span></div>
                            <div class="fact-item"><span class="fact-icon">🎯</span><span>Целей: <strong>${completedGoals}/${goals.length}</strong></span></div>
                        </div>
                        <div class="analytics-love-score">
                            <h3>💗 Индекс любви</h3>
                            <div class="love-score-circle">
                                <span class="love-score-value">${loveScore}</span>
                                <span class="love-score-max">/100</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // ========== ПЛЕЙЛИСТ (серверные данные) ==========
    openPlaylist() {
        document.getElementById('playlistOverlay')?.remove();

        const songs = this.storage.get('playlist') || [
            { title: 'Perfect', artist: 'Ed Sheeran', emoji: '🎵', url: '' },
            { title: 'All of Me', artist: 'John Legend', emoji: '🎶', url: '' },
            { title: 'A Thousand Years', artist: 'Christina Perri', emoji: '🎵', url: '' },
        ];

        const html = `
            <div class="admin-modal-overlay active" id="playlistOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('playlistOverlay').remove()">✕</button>
                        <h2>🎵 Плейлист</h2>
                    </div>
                    <div class="admin-modal-body">
                        <p class="playlist-subtitle">Песни для нас 💕</p>
                        <div class="playlist-list">
                            ${songs.length === 0 ? '<div class="notes-empty">Плейлист пуст 🎵</div>' :
                            songs.map((s, i) => `
                                <div class="playlist-item" onclick="${s.url ? `window.open('${s.url}','_blank')` : `window.open('https://music.youtube.com/search?q=${encodeURIComponent(s.title + ' ' + s.artist)}','_blank')`}">
                                    <span class="playlist-number">${i + 1}</span>
                                    <span class="playlist-emoji">${s.emoji || '🎵'}</span>
                                    <div class="playlist-info">
                                        <span class="playlist-title">${s.title}</span>
                                        <span class="playlist-artist">${s.artist}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="playlist-tip">💡 Нажмите для прослушивания</div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // ========== ЗАПИСКИ ==========
    openQuickNotes() {
        document.getElementById('quickNotesOverlay')?.remove();
        const notes = this.storage.get('quickNotes') || [];

        const html = `
            <div class="admin-modal-overlay active" id="quickNotesOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('quickNotesOverlay').remove()">✕</button>
                        <h2>📌 Записки</h2>
                    </div>
                    <div class="admin-modal-body">
                        ${window.app?.isGuest ? '' : `
                        <div class="quick-note-input">
                            <textarea class="admin-textarea" id="quickNoteText" rows="2" placeholder="Оставь записку... 💕"></textarea>
                            <div class="quick-note-actions" style="margin-top:8px;">
                                <div class="quick-note-emojis">
                                    ${['💕', '😘', '🤗', '😊'].map(e => `
                                        <button class="qn-emoji-btn" onclick="document.getElementById('quickNoteText').value+='${e}'">${e}</button>
                                    `).join('')}
                                </div>
                                <button class="reply-send-new" onclick="app.features.addQuickNote()">📌 Прикрепить</button>
                            </div>
                        </div>`}
                        <div class="quick-notes-list" id="quickNotesList">
                            ${notes.length === 0
                                ? '<div class="notes-empty">Пока нет записок 📝</div>'
                                : notes.map(n => this.renderQuickNote(n)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    renderQuickNote(note) {
        const timeAgo = this.getTimeAgo(new Date(note.date));
        const canDelete = !window.app?.isGuest;
        return `
            <div class="quick-note-card ${note.from === 'admin' ? 'from-admin' : ''}">
                <div class="qn-header">
                    <span class="qn-author">${note.from === 'admin' ? '🤴' : '👸'}</span>
                    <span class="qn-time">${timeAgo}</span>
                    ${canDelete ? `<button class="qn-delete" onclick="app.features.deleteQuickNote('${note.id}')">✕</button>` : ''}
                </div>
                <div class="qn-text">${note.text}</div>
            </div>
        `;
    }

    addQuickNote() {
        const text = document.getElementById('quickNoteText')?.value?.trim();
        if (!text) { window.app?.showToast('Напишите записку!'); return; }

        const note = {
            id: 'note_' + Date.now(),
            text,
            from: window.app?.isAdmin ? 'admin' : 'user',
            date: new Date().toISOString()
        };

        const notes = this.storage.get('quickNotes') || [];
        notes.unshift(note);
        this.storage.set('quickNotes', notes);
        this.storage.serverPost('/api/notes', note);

        document.getElementById('quickNotesOverlay')?.remove();
        this.openQuickNotes();
        window.app?.showToast('Записка прикреплена! 📌');
    }

    deleteQuickNote(noteId) {
        const notes = (this.storage.get('quickNotes') || []).filter(n => n.id !== noteId);
        this.storage.set('quickNotes', notes);
        this.storage.serverDelete(`/api/notes/${noteId}`);
        document.getElementById('quickNotesOverlay')?.remove();
        this.openQuickNotes();
    }

    getTimeAgo(date) {
        const diff = new Date() - date;
        const m = Math.floor(diff / 60000);
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(diff / 86400000);
        if (m < 1) return 'только что';
        if (m < 60) return `${m} мин назад`;
        if (h < 24) return `${h} ч назад`;
        if (d < 7) return `${d} дн назад`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
}

window.ExtraFeatures = ExtraFeatures;