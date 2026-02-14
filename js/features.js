// js/features.js — Дополнительный крутой функционал

class ExtraFeatures {
    constructor(storage) {
        this.storage = storage;
    }

    // ========== 🎰 КОЛЕСО УДАЧИ ==========
    openLuckyWheel() {
        const prizes = [
            { emoji: '⭐', name: '+5 звёзд', type: 'stars', value: 5 },
            { emoji: '⭐', name: '+10 звёзд', type: 'stars', value: 10 },
            { emoji: '⭐', name: '+25 звёзд', type: 'stars', value: 25 },
            { emoji: '💌', name: 'Секретное письмо', type: 'letter', value: null },
            { emoji: '🤗', name: 'Обнимашки', type: 'gift', value: 'hug' },
            { emoji: '💋', name: 'Поцелуй', type: 'gift', value: 'kiss' },
            { emoji: '🌹', name: 'Роза', type: 'gift', value: 'rose' },
            { emoji: '🎉', name: 'Сюрприз!', type: 'stars', value: 50 },
        ];

        // Проверка: можно крутить раз в день
        const lastSpin = this.storage.get('lastSpin');
        const today = new Date().toDateString();
        const canSpin = lastSpin !== today;

        const html = `
            <div class="admin-modal-overlay active" id="luckyWheelOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" 
                                onclick="document.getElementById('luckyWheelOverlay').remove()">✕</button>
                        <h2>🎰 Колесо удачи</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="wheel-container">
                            <div class="wheel" id="luckyWheel">
                                ${prizes.map((p, i) => `
                                    <div class="wheel-segment" 
                                         style="--i:${i}; --total:${prizes.length}">
                                        <span class="segment-content">${p.emoji}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="wheel-pointer">▼</div>
                            <div class="wheel-center">🎯</div>
                        </div>
                        
                        <div class="wheel-result" id="wheelResult" style="display:none;">
                            <div class="wheel-result-emoji" id="wheelResultEmoji"></div>
                            <div class="wheel-result-text" id="wheelResultText"></div>
                        </div>

                        <button class="admin-submit-btn ${canSpin ? '' : 'disabled'}" 
                                id="spinBtn"
                                onclick="app.features.spinWheel()"
                                ${canSpin ? '' : 'disabled'}>
                            ${canSpin ? '🎰 Крутить!' : '⏳ Завтра!'}
                        </button>
                        
                        ${!canSpin ? `
                            <p style="text-align:center;font-size:12px;color:var(--text-light);margin-top:8px;">
                                Следующий спин будет доступен завтра!
                            </p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        this._prizes = prizes;
    }

    spinWheel() {
        const wheel = document.getElementById('luckyWheel');
        const spinBtn = document.getElementById('spinBtn');
        const resultDiv = document.getElementById('wheelResult');
        
        if (!wheel || !spinBtn) return;

        spinBtn.disabled = true;
        spinBtn.textContent = '🎰 Крутим...';

        // Выбрать случайный приз
        const prizeIndex = Math.floor(Math.random() * this._prizes.length);
        const prize = this._prizes[prizeIndex];

        // Анимация вращения
        const degrees = 360 * 5 + (prizeIndex * (360 / this._prizes.length));
        wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        wheel.style.transform = `rotate(${degrees}deg)`;

        // Показать результат
        setTimeout(() => {
            this.applyPrize(prize);
            
            if (resultDiv) {
                resultDiv.style.display = 'block';
                document.getElementById('wheelResultEmoji').textContent = prize.emoji;
                document.getElementById('wheelResultText').textContent = 
                    `Поздравляем! Вы выиграли: ${prize.name}!`;
            }

            spinBtn.textContent = '🎉 Ура!';
            
            // Сохранить дату спина
            this.storage.set('lastSpin', new Date().toDateString());

            window.app?.effects?.launchConfetti(60);
        }, 4500);
    }

    applyPrize(prize) {
        const profile = this.storage.getProfile();
        const isAdmin = window.app?.isAdmin;

        switch (prize.type) {
            case 'stars': {
                const key = isAdmin ? 'adminStars' : 'userStars';
                const current = profile[key] || 0;
                this.storage.updateProfile({ [key]: current + prize.value });
                window.app?.toast?.show(`+${prize.value} ⭐ звёзд!`);
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
                    date: new Date().toISOString(),
                    opened: false
                });
                window.app?.toast?.show(`${prize.emoji} Подарок получен!`);
                break;
            }
            case 'letter': {
                const secretLetters = [
                    'Ты знаешь, что самое прекрасное в моей жизни? Это ты. 💕',
                    'Если бы мне дали выбрать любого человека на планете, я бы снова выбрал тебя. ❤️',
                    'Каждый закат напоминает мне о тебе — такой же красивый и неповторимый. 🌅',
                ];
                const text = secretLetters[Math.floor(Math.random() * secretLetters.length)];
                this.storage.addLetter({
                    id: 'letter_wheel_' + Date.now(),
                    from: 'system',
                    subject: '🎰 Секретное письмо!',
                    text,
                    mood: '✨',
                    date: new Date().toISOString(),
                    read: false,
                    favorite: false,
                    reactions: [],
                    replies: []
                });
                window.app?.toast?.show('💌 Секретное письмо получено!');
                break;
            }
        }
    }

    // ========== 💕 СОВМЕСТНЫЕ ЦЕЛИ ==========
    openGoals() {
        const goals = this.storage.get('goals') || [];

        const html = `
            <div class="admin-modal-overlay active" id="goalsOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" 
                                onclick="document.getElementById('goalsOverlay').remove()">✕</button>
                        <h2>💕 Наши цели</h2>
                    </div>
                    <div class="admin-modal-body">
                        <p class="goals-subtitle">Совместные мечты и планы</p>
                        
                        <!-- Добавить цель -->
                        <div class="goal-add-form">
                            <input type="text" class="admin-input" id="goalInput" 
                                   placeholder="Новая цель: например, поехать на море 🏖️">
                            <div class="goal-add-row">
                                <select class="admin-select" id="goalCategory">
                                    <option value="travel">✈️ Путешествие</option>
                                    <option value="experience">🎭 Впечатления</option>
                                    <option value="gift">🎁 Покупка</option>
                                    <option value="milestone">💑 Веха</option>
                                    <option value="other">⭐ Другое</option>
                                </select>
                                <button class="admin-add-btn" onclick="app.features.addGoal()">+</button>
                            </div>
                        </div>

                        <!-- Список целей -->
                        <div class="goals-list" id="goalsList">
                            ${goals.length === 0 
                                ? '<div class="goals-empty">Добавьте вашу первую совместную цель! 💫</div>'
                                : goals.map(g => this.renderGoalItem(g)).join('')
                            }
                        </div>

                        <!-- Прогресс -->
                        <div class="goals-progress">
                            <div class="goals-progress-label">
                                Выполнено: ${goals.filter(g => g.done).length}/${goals.length}
                            </div>
                            <div class="goals-progress-bar">
                                <div class="goals-progress-fill" style="width: ${
                                    goals.length > 0 
                                        ? Math.round(goals.filter(g => g.done).length / goals.length * 100) 
                                        : 0
                                }%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    renderGoalItem(goal) {
        const categoryEmojis = {
            travel: '✈️', experience: '🎭', gift: '🎁', milestone: '💑', other: '⭐'
        };

        return `
            <div class="goal-item ${goal.done ? 'done' : ''}" data-id="${goal.id}">
                <button class="goal-check" onclick="app.features.toggleGoal('${goal.id}')">
                    ${goal.done ? '✅' : '⬜'}
                </button>
                <div class="goal-info">
                    <span class="goal-category-emoji">${categoryEmojis[goal.category] || '⭐'}</span>
                    <span class="goal-text ${goal.done ? 'completed' : ''}">${goal.text}</span>
                </div>
                <button class="goal-delete" onclick="app.features.deleteGoal('${goal.id}')">✕</button>
            </div>
        `;
    }

    addGoal() {
        const input = document.getElementById('goalInput');
        const category = document.getElementById('goalCategory');
        const text = input?.value?.trim();

        if (!text) {
            window.app?.toast?.show('Введите цель! 🎯');
            return;
        }

        const goals = this.storage.get('goals') || [];
        goals.push({
            id: 'goal_' + Date.now(),
            text,
            category: category?.value || 'other',
            done: false,
            createdAt: new Date().toISOString()
        });
        this.storage.set('goals', goals);

        input.value = '';
        
        // Перерендерить
        document.getElementById('goalsOverlay')?.remove();
        this.openGoals();
        window.app?.toast?.show('Цель добавлена! 🎯');
    }

    toggleGoal(goalId) {
        const goals = this.storage.get('goals') || [];
        const idx = goals.findIndex(g => g.id === goalId);
        if (idx >= 0) {
            goals[idx].done = !goals[idx].done;
            this.storage.set('goals', goals);

            if (goals[idx].done) {
                window.app?.effects?.launchConfetti(30);
                window.app?.toast?.show('Цель выполнена! 🎉');
            }

            document.getElementById('goalsOverlay')?.remove();
            this.openGoals();
        }
    }

    deleteGoal(goalId) {
        if (!confirm('Удалить эту цель?')) return;
        const goals = (this.storage.get('goals') || []).filter(g => g.id !== goalId);
        this.storage.set('goals', goals);
        document.getElementById('goalsOverlay')?.remove();
        this.openGoals();
    }

    // ========== 📊 АНАЛИТИКА ОТНОШЕНИЙ ==========
    openAnalytics() {
        const stats = this.storage.getStats();
        const profile = this.storage.getProfile();
        const letters = this.storage.getLetters();
        const gifts = this.storage.getGifts();
        const goals = this.storage.get('goals') || [];

        // Вычисления
        const totalLetters = letters.length;
        const avgLetterLength = totalLetters > 0 
            ? Math.round(letters.reduce((sum, l) => sum + l.text.length, 0) / totalLetters) 
            : 0;
        const totalReactions = letters.reduce((sum, l) => sum + (l.reactions?.length || 0), 0);
        const totalReplies = letters.reduce((sum, l) => sum + (l.replies?.length || 0), 0);
        const favoriteLetters = letters.filter(l => l.favorite).length;
        const totalGifts = gifts.length;
        const openedGifts = gifts.filter(g => g.opened).length;
        const completedGoals = goals.filter(g => g.done).length;
        
        // Самый активный день недели
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const dayCounts = new Array(7).fill(0);
        letters.forEach(l => {
            const day = new Date(l.date).getDay();
            dayCounts[day]++;
        });
        const maxDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
        const mostActiveDay = dayNames[maxDayIdx];

        // Настроения
        const moods = {};
        letters.forEach(l => {
            const mood = l.mood || '💕';
            moods[mood] = (moods[mood] || 0) + 1;
        });
        const topMood = Object.entries(moods).sort((a, b) => b[1] - a[1])[0];

        const html = `
            <div class="admin-modal-overlay active" id="analyticsOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" 
                                onclick="document.getElementById('analyticsOverlay').remove()">✕</button>
                        <h2>📊 Аналитика любви</h2>
                    </div>
                    <div class="admin-modal-body">
                        <!-- Главная статистика -->
                        <div class="analytics-hero">
                            <div class="analytics-days">
                                <span class="analytics-big-number">${stats.daysTogther || 0}</span>
                                <span class="analytics-label">дней вместе</span>
                            </div>
                        </div>

                        <!-- Карточки статистики -->
                        <div class="analytics-grid">
                            <div class="analytics-card">
                                <span class="analytics-card-emoji">💌</span>
                                <span class="analytics-card-value">${totalLetters}</span>
                                <span class="analytics-card-label">писем</span>
                            </div>
                            <div class="analytics-card">
                                <span class="analytics-card-emoji">💬</span>
                                <span class="analytics-card-value">${totalReplies}</span>
                                <span class="analytics-card-label">ответов</span>
                            </div>
                            <div class="analytics-card">
                                <span class="analytics-card-emoji">😍</span>
                                <span class="analytics-card-value">${totalReactions}</span>
                                <span class="analytics-card-label">реакций</span>
                            </div>
                            <div class="analytics-card">
                                <span class="analytics-card-emoji">🎁</span>
                                <span class="analytics-card-value">${totalGifts}</span>
                                <span class="analytics-card-label">подарков</span>
                            </div>
                        </div>

                        <!-- Факты -->
                        <div class="analytics-facts">
                            <h3>💡 Интересные факты</h3>
                            
                            <div class="fact-item">
                                <span class="fact-icon">📝</span>
                                <span>Средняя длина письма: <strong>${avgLetterLength} символов</strong></span>
                            </div>
                            <div class="fact-item">
                                <span class="fact-icon">⭐</span>
                                <span>Избранных писем: <strong>${favoriteLetters}</strong></span>
                            </div>
                            <div class="fact-item">
                                <span class="fact-icon">📅</span>
                                <span>Самый активный день: <strong>${mostActiveDay}</strong></span>
                            </div>
                            ${topMood ? `
                                <div class="fact-item">
                                    <span class="fact-icon">${topMood[0]}</span>
                                    <span>Любимое настроение: <strong>${topMood[0]} (${topMood[1]} раз)</strong></span>
                                </div>
                            ` : ''}
                            <div class="fact-item">
                                <span class="fact-icon">🎯</span>
                                <span>Целей выполнено: <strong>${completedGoals}/${goals.length}</strong></span>
                            </div>
                            <div class="fact-item">
                                <span class="fact-icon">📦</span>
                                <span>Подарков открыто: <strong>${openedGifts}/${totalGifts}</strong></span>
                            </div>
                        </div>

                        <!-- Активность по дням -->
                        <div class="analytics-chart">
                            <h3>📈 Активность по дням</h3>
                            <div class="mini-chart">
                                ${dayCounts.map((count, i) => `
                                    <div class="chart-bar-wrapper">
                                        <div class="chart-bar" 
                                             style="height: ${Math.max(4, (count / Math.max(...dayCounts, 1)) * 60)}px">
                                        </div>
                                        <span class="chart-label">${dayNames[i]}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Уровень любви -->
                        <div class="analytics-love-score">
                            <h3>💗 Индекс любви</h3>
                            <div class="love-score-circle">
                                <span class="love-score-value">
                                    ${Math.min(100, Math.round(
                                        (totalLetters * 3 + totalReplies * 2 + totalReactions + 
                                         totalGifts * 5 + completedGoals * 10) / 
                                        Math.max(1, (stats.daysTogther || 1) / 10)
                                    ))}
                                </span>
                                <span class="love-score-max">/100</span>
                            </div>
                            <p class="love-score-desc">
                                ${this.getLoveScoreDesc(totalLetters + totalReplies + totalGifts)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    getLoveScoreDesc(activity) {
        if (activity > 50) return '🔥 Невероятная любовь! Вы — идеальная пара!';
        if (activity > 30) return '💖 Прекрасные отношения! Так держать!';
        if (activity > 15) return '💕 Отличное начало! Ваша любовь растёт!';
        if (activity > 5) return '🌱 Ваша история только начинается!';
        return '✨ Каждое путешествие начинается с первого шага!';
    }

    // ========== 🎵 ПЛЕЙЛИСТ ЛЮБВИ ==========
    openPlaylist() {
        const songs = [
            { title: 'Perfect', artist: 'Ed Sheeran', emoji: '🎵', mood: 'romantic' },
            { title: 'All of Me', artist: 'John Legend', emoji: '🎶', mood: 'romantic' },
            { title: 'Thinking Out Loud', artist: 'Ed Sheeran', emoji: '🎵', mood: 'sweet' },
            { title: 'A Thousand Years', artist: 'Christina Perri', emoji: '🎶', mood: 'romantic' },
            { title: 'Just the Way You Are', artist: 'Bruno Mars', emoji: '🎵', mood: 'happy' },
            { title: 'Love Story', artist: 'Taylor Swift', emoji: '🎶', mood: 'sweet' },
            { title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley', emoji: '🎵', mood: 'classic' },
            { title: 'Make You Feel My Love', artist: 'Adele', emoji: '🎶', mood: 'romantic' },
            { title: 'I Don\'t Want to Miss a Thing', artist: 'Aerosmith', emoji: '🎵', mood: 'passionate' },
            { title: 'Somebody to Love', artist: 'Queen', emoji: '🎶', mood: 'classic' },
            { title: 'Unchained Melody', artist: 'The Righteous Brothers', emoji: '🎵', mood: 'classic' },
            { title: 'At Last', artist: 'Etta James', emoji: '🎶', mood: 'romantic' },
        ];

        const html = `
            <div class="admin-modal-overlay active" id="playlistOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" 
                                onclick="document.getElementById('playlistOverlay').remove()">✕</button>
                        <h2>🎵 Плейлист любви</h2>
                    </div>
                    <div class="admin-modal-body">
                        <p class="playlist-subtitle">Песни для нас с тобой 💕</p>
                        
                        <div class="playlist-list">
                            ${songs.map((s, i) => `
                                <div class="playlist-item" onclick="app.features.playSong('${s.title}', '${s.artist}')">
                                    <span class="playlist-number">${i + 1}</span>
                                    <span class="playlist-emoji">${s.emoji}</span>
                                    <div class="playlist-info">
                                        <span class="playlist-title">${s.title}</span>
                                        <span class="playlist-artist">${s.artist}</span>
                                    </div>
                                    <span class="playlist-mood">${
                                        s.mood === 'romantic' ? '💕' :
                                        s.mood === 'sweet' ? '🌸' :
                                        s.mood === 'happy' ? '😊' :
                                        s.mood === 'passionate' ? '🔥' : '✨'
                                    }</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="playlist-tip">
                            💡 Нажмите на песню для поиска
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    playSong(title, artist) {
        const query = encodeURIComponent(`${title} ${artist}`);
        window.open(`https://music.youtube.com/search?q=${query}`, '_blank');
    }

    // ========== 💬 БЫСТРЫЕ ЗАПИСКИ ==========
    openQuickNotes() {
        const notes = this.storage.get('quickNotes') || [];

        const html = `
            <div class="admin-modal-overlay active" id="quickNotesOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" 
                                onclick="document.getElementById('quickNotesOverlay').remove()">✕</button>
                        <h2>💬 Быстрые записки</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="quick-note-input">
                            <textarea class="admin-textarea" id="quickNoteText" rows="3" 
                                      placeholder="Оставь записку для любимого(ой)... 💕"></textarea>
                            <div class="quick-note-actions">
                                <div class="quick-note-emojis">
                                    ${['💕', '😘', '🤗', '😊', '🌹', '✨'].map(e => `
                                        <button class="qn-emoji-btn" 
                                                onclick="document.getElementById('quickNoteText').value+='${e}'">
                                            ${e}
                                        </button>
                                    `).join('')}
                                </div>
                                <button class="reply-send-new" onclick="app.features.addQuickNote()">
                                    📌 Прикрепить
                                </button>
                            </div>
                        </div>

                        <div class="quick-notes-list" id="quickNotesList">
                            ${notes.length === 0 
                                ? '<div class="notes-empty">Пока нет записок 📝</div>'
                                : notes.map(n => this.renderQuickNote(n)).join('')
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    renderQuickNote(note) {
        const date = new Date(note.date);
        const timeAgo = this.getTimeAgo(date);

        return `
            <div class="quick-note-card ${note.from === 'admin' ? 'from-admin' : 'from-user'}">
                <div class="qn-header">
                    <span class="qn-author">${note.from === 'admin' ? '🤴' : '👸'}</span>
                    <span class="qn-time">${timeAgo}</span>
                    <button class="qn-delete" 
                            onclick="app.features.deleteQuickNote('${note.id}')">✕</button>
                </div>
                <div class="qn-text">${note.text}</div>
                ${note.pinned ? '<div class="qn-pin">📌</div>' : ''}
            </div>
        `;
    }

    addQuickNote() {
        const input = document.getElementById('quickNoteText');
        const text = input?.value?.trim();

        if (!text) {
            window.app?.toast?.show('Напишите записку! 📝');
            return;
        }

        const notes = this.storage.get('quickNotes') || [];
        const note = {
            id: 'note_' + Date.now(),
            text,
            from: window.app?.isAdmin ? 'admin' : 'user',
            date: new Date().toISOString(),
            pinned: false
        };
        
        notes.unshift(note);
        this.storage.set('quickNotes', notes);

        input.value = '';

        // Уведомление
        const notifications = this.storage.get('notifications') || [];
        notifications.push({
            id: 'notif_' + Date.now(),
            type: 'system',
            message: `Новая записка: "${text.substring(0, 30)}..."`,
            date: new Date().toISOString(),
            read: false
        });
        this.storage.set('notifications', notifications);

        document.getElementById('quickNotesOverlay')?.remove();
        this.openQuickNotes();
        window.app?.toast?.show('Записка прикреплена! 📌');
    }

    deleteQuickNote(noteId) {
        const notes = (this.storage.get('quickNotes') || []).filter(n => n.id !== noteId);
        this.storage.set('quickNotes', notes);
        document.getElementById('quickNotesOverlay')?.remove();
        this.openQuickNotes();
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} ч назад`;
        if (days < 7) return `${days} дн назад`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
}

window.ExtraFeatures = ExtraFeatures;