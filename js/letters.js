// js/letters.js — Письма (ИСПРАВЛЕНО)

class LettersManager {
    constructor(storage, isAdmin = false) {
        this.storage = storage;
        this.isAdmin = isAdmin;
        this.currentLetter = null;
        this.stickerSets = {
            love: ['😍', '🥰', '💕', '💗', '💖', '💝', '❤️', '😘', '💋', '🤗', '💌', '🌹'],
            cute: ['🥺', '🦋', '✨', '⭐', '🌸', '🎀', '🧸', '🍭', '🌈', '🦄', '🐱', '🐰'],
            happy: ['😊', '😄', '🥳', '🎉', '🎊', '🤩', '🙌', '💃', '🎵', '🎶', '🌟', '☀️'],
        };
    }

    // Единый рендер элемента письма (для всех списков)
    renderLetterItem(letter) {
        const timeAgo = this.getTimeAgo(new Date(letter.date));
        const hasReplies = letter.replies && letter.replies.length > 0;

        return `
            <div class="letter-item ${letter.read ? '' : 'unread'}" onclick="app.letters.openLetter('${letter.id}')">
                ${!letter.read ? '<div class="letter-unread-dot"></div>' : ''}
                <div class="letter-item-icon">${letter.mood || '💌'}</div>
                <div class="letter-item-info">
                    <h4>${letter.subject || 'Без темы'}</h4>
                    <p>${(letter.text || '').substring(0, 60)}${letter.text?.length > 60 ? '...' : ''}</p>
                </div>
                <div class="letter-item-date">${timeAgo}</div>
                ${letter.favorite ? '<div class="letter-item-mood">⭐</div>' : ''}
                ${hasReplies ? '<div class="letter-item-mood" style="bottom:28px">💬</div>' : ''}
            </div>
        `;
    }

    // Обновить список
    refreshLettersList() {
        if (window.app) window.app.renderLettersContent();
    }

    // ========== ОТКРЫТЬ ПИСЬМО ==========
    openLetter(letterId) {
        const letter = this.storage.getLetter(letterId);
        if (!letter) return;

        if (!letter.read) this.storage.markLetterRead(letterId);
        this.currentLetter = letter;

        const date = new Date(letter.date);
        const replies = letter.replies || [];

        document.getElementById('letterFullOverlay')?.remove();

        const html = `
            <div class="letter-full-overlay active" id="letterFullOverlay">
                <div class="letter-full">
                    <div class="letter-full-header">
                        <button class="letter-back-btn" onclick="app.letters.closeLetter()">← Назад</button>
                        <div class="letter-full-actions">
                            <button class="action-icon-btn" onclick="app.letters.toggleFavorite('${letter.id}')">${letter.favorite ? '⭐' : '☆'}</button>
                            <button class="action-icon-btn" onclick="app.letters.confirmDeleteLetter('${letter.id}')">🗑️</button>
                        </div>
                    </div>
                    <div class="letter-full-content">
                        <div class="letter-envelope-decoration">💌</div>
                        <div class="letter-full-meta">
                            <div class="letter-from-to">
                                <span class="from-avatar">${letter.from === 'admin' ? '💝' : '👸'}</span>
                                <span class="from-arrow">→</span>
                                <span class="to-avatar">${letter.from === 'admin' ? '👸' : '💝'}</span>
                            </div>
                            <div class="letter-full-date">${date.toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <h2 class="letter-full-subject">${letter.subject || 'Без темы'}</h2>
                        <div class="letter-paper">
                            <div class="letter-full-text">${(letter.text || '').replace(/\n/g, '<br>')}</div>
                            <div class="letter-signature">С любовью, ${letter.from === 'admin' ? 'Твой ❤️' : 'Твоя 💕'}</div>
                        </div>

                        <!-- Реакции -->
                        <div class="letter-reactions-section">
                            <div class="reactions-title">Реакции</div>
                            <div class="reactions-display" id="reactionsDisplay">${this.renderReactions(letter)}</div>
                            <button class="add-reaction-btn" onclick="app.letters.toggleStickerPanel()">😊 Реакция</button>
                        </div>

                        <div class="sticker-panel hidden" id="stickerPanel">
                            <div class="sticker-tabs">
                                ${Object.keys(this.stickerSets).map(set => `
                                    <button class="sticker-tab ${set === 'love' ? 'active' : ''}"
                                            onclick="app.letters.switchStickerSet('${set}', this)">
                                        ${set === 'love' ? '💕' : set === 'cute' ? '🦋' : '🎉'}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="sticker-grid" id="stickerGrid">${this.renderStickerGrid('love')}</div>
                        </div>

                        <!-- Ответы -->
                        <div class="letter-thread-section">
                            <div class="thread-title">💬 Переписка <span class="thread-count">(${replies.length})</span></div>
                            <div class="thread-messages" id="threadMessages">
                                ${replies.length > 0
                                    ? replies.map(r => this.renderReplyBubble(r)).join('')
                                    : '<div class="no-replies">Пока нет ответов</div>'}
                            </div>
                            <div class="reply-compose-new">
                                <div class="reply-input-container">
                                    <textarea class="reply-textarea-new" id="replyInput" placeholder="Написать ответ..." rows="2"></textarea>
                                    <div class="reply-toolbar">
                                        <button class="reply-tool-btn" onclick="app.letters.toggleStickerPanel()">😊</button>
                                        <button class="reply-send-new" onclick="app.letters.sendReply('${letter.id}')">Отправить →</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        setTimeout(() => {
            const messages = document.getElementById('threadMessages');
            if (messages) messages.scrollTop = messages.scrollHeight;
        }, 100);
    }

    closeLetter() {
        const overlay = document.getElementById('letterFullOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
        this.currentLetter = null;
        this.refreshLettersList();
        window.app?.nav?.updateBadges();
    }

    // ========== УДАЛЕНИЕ ==========
    confirmDeleteLetter(letterId) {
        window.app.showConfirmModal('Удалить это письмо навсегда?', () => {
            this.storage.deleteLetter(letterId);
            document.getElementById('letterFullOverlay')?.remove();
            this.currentLetter = null;
            window.app?.showToast('Письмо удалено 🗑️');
            this.refreshLettersList();
            window.app?.nav?.updateBadges();
        });
    }

    // ========== ОТВЕТЫ ==========
    renderReplyBubble(reply) {
        const date = new Date(reply.date);
        const isFromMe = (this.isAdmin && reply.from === 'admin') || (!this.isAdmin && reply.from === 'user');
        return `
            <div class="thread-bubble ${isFromMe ? 'from-me' : ''}">
                <div class="bubble-avatar">${reply.from === 'admin' ? '💝' : '👸'}</div>
                <div class="bubble-content">
                    <div class="bubble-name">${reply.from === 'admin' ? 'Любимый' : 'Любимая'}</div>
                    <div class="bubble-text">${reply.text}</div>
                    <div class="bubble-time">${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
        `;
    }

    sendReply(letterId) {
        const input = document.getElementById('replyInput');
        if (!input || !input.value.trim()) { window.app?.showToast('Напишите ответ! ✍️'); return; }

        const reply = {
            id: 'reply_' + Date.now(),
            text: input.value.trim(),
            from: this.isAdmin ? 'admin' : 'user',
            date: new Date().toISOString()
        };

        this.storage.addReplyToThread(letterId, reply);
        input.value = '';

        const messages = document.getElementById('threadMessages');
        if (messages) {
            const noReplies = messages.querySelector('.no-replies');
            if (noReplies) noReplies.remove();
            messages.insertAdjacentHTML('beforeend', this.renderReplyBubble(reply));
            messages.scrollTop = messages.scrollHeight;
        }

        // Уведомление
        const letter = this.storage.getLetter(letterId);
        this.storage.addNotification({
            id: 'notif_' + Date.now(),
            type: 'reply',
            letterId,
            message: `${reply.from === 'admin' ? 'Любимый' : 'Любимая'} ответил(а) на "${letter?.subject || 'письмо'}"`,
            preview: reply.text.substring(0, 50),
            date: new Date().toISOString(),
            read: false
        });

        window.app?.showToast('Ответ отправлен! 💕');
        window.app?.effects?.launchHeartBurst(window.innerWidth / 2, window.innerHeight - 100);
    }

    // ========== РЕАКЦИИ ==========
    renderReactions(letter) {
        if (!letter.reactions || letter.reactions.length === 0) return '<div class="no-reactions">Пока нет реакций</div>';
        const grouped = {};
        letter.reactions.forEach(r => {
            if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0 };
            grouped[r.emoji].count++;
        });
        return Object.values(grouped).map(g => `
            <div class="reaction-bubble" onclick="app.letters.addReaction('${letter.id}', '${g.emoji}')">
                <span class="reaction-emoji">${g.emoji}</span>
                <span class="reaction-count">${g.count}</span>
            </div>
        `).join('');
    }

    addReaction(letterId, emoji) {
        this.storage.addReaction(letterId, emoji, this.isAdmin ? 'admin' : 'user');
        const letter = this.storage.getLetter(letterId);
        const display = document.getElementById('reactionsDisplay');
        if (display && letter) display.innerHTML = this.renderReactions(letter);
        window.app?.effects?.launchHeartBurst(window.innerWidth / 2, window.innerHeight / 2);
    }

    toggleStickerPanel() {
        const panel = document.getElementById('stickerPanel');
        if (panel) panel.classList.toggle('hidden');
    }

    switchStickerSet(setName, btn) {
        document.querySelectorAll('.sticker-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const grid = document.getElementById('stickerGrid');
        if (grid) grid.innerHTML = this.renderStickerGrid(setName);
    }

    renderStickerGrid(setName) {
        return (this.stickerSets[setName] || []).map(s => `
            <button class="sticker-item" onclick="app.letters.onStickerClick('${s}')">${s}</button>
        `).join('');
    }

    onStickerClick(emoji) {
        if (this.currentLetter) {
            // Добавить как реакцию
            this.addReaction(this.currentLetter.id, emoji);
        }
        this.toggleStickerPanel();
    }

    // ========== COMPOSE ==========
    openCompose() {
        document.getElementById('composeOverlay')?.remove();

        const html = `
            <div class="compose-overlay active" id="composeOverlay">
                <div class="compose-modal">
                    <div class="compose-header">
                        <button class="compose-close" onclick="app.letters.closeCompose()">✕</button>
                        <h2>Новое письмо 💌</h2>
                        <button class="compose-send" onclick="app.letters.sendLetter()">Отправить ✨</button>
                    </div>
                    <div class="compose-body">
                        <div class="compose-field">
                            <label>Кому</label>
                            <div class="compose-recipient">
                                <span class="recipient-avatar">👸</span><span>Любимая</span><span class="recipient-badge">💕</span>
                            </div>
                        </div>
                        <div class="compose-field">
                            <label>Тема</label>
                            <input type="text" class="compose-input" id="composeSubject" placeholder="Ты — моё счастье...">
                        </div>
                        <div class="compose-field">
                            <label>Настроение</label>
                            <div class="compose-mood-selector">
                                ${['💕', '🥰', '😘', '🌹', '✨', '🎉', '🌸', '💌'].map(m => `
                                    <button class="compose-mood-btn ${m === '💕' ? 'active' : ''}"
                                            onclick="app.letters.selectComposeMood('${m}', this)">${m}</button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="compose-field">
                            <label>Текст</label>
                            <textarea class="compose-textarea" id="composeText" placeholder="Напишите что-нибудь прекрасное..." rows="8"></textarea>
                        </div>
                        <div class="compose-extras">
                            <button class="compose-extra-btn" onclick="app.letters.insertTemplate()">📝 Шаблон</button>
                        </div>
                        <div class="compose-templates hidden" id="composeTemplates">
                            <div class="template-item" onclick="app.letters.useTemplate(0)"><span>💕</span> Признание</div>
                            <div class="template-item" onclick="app.letters.useTemplate(1)"><span>🌹</span> Романтика</div>
                            <div class="template-item" onclick="app.letters.useTemplate(2)"><span>🎉</span> Поздравление</div>
                            <div class="template-item" onclick="app.letters.useTemplate(3)"><span>😘</span> Скучаю</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this._composeMood = '💕';
    }

    closeCompose() { document.getElementById('composeOverlay')?.remove(); }

    selectComposeMood(mood, btn) {
        document.querySelectorAll('.compose-mood-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._composeMood = mood;
    }

    sendLetter() {
        const subject = document.getElementById('composeSubject')?.value?.trim();
        const text = document.getElementById('composeText')?.value?.trim();
        if (!text) { window.app?.showToast('Напишите текст! ✍️'); return; }

        const letter = {
            id: 'letter_' + Date.now(),
            from: 'admin',
            subject: subject || 'Письмо любви',
            text,
            mood: this._composeMood || '💕',
            date: new Date().toISOString(),
            read: false,
            favorite: false,
            reactions: [],
            replies: []
        };

        this.storage.addLetter(letter);
        this.closeCompose();

        this.storage.addNotification({
            id: 'notif_' + Date.now(),
            type: 'letter',
            letterId: letter.id,
            message: `Новое письмо: "${letter.subject}"`,
            preview: text.substring(0, 50),
            date: new Date().toISOString(),
            read: false
        });

        window.app?.effects?.launchConfetti();
        window.app?.showToast('Письмо отправлено! 💌✨');
        this.refreshLettersList();
        window.app?.nav?.updateBadges();
    }

    insertTemplate() {
        document.getElementById('composeTemplates')?.classList.toggle('hidden');
    }

    useTemplate(index) {
        const templates = [
            'Моя любимая,\n\nКаждый день я благодарю судьбу за то, что ты есть. Ты — мой рассвет и мой закат. Я люблю тебя больше, чем слова смогут передать.\n\nТвой навсегда ❤️',
            'Дорогая,\n\nКогда я смотрю на тебя, весь мир замирает. Твоя улыбка заставляет моё сердце биться чаще.\n\nС бесконечной любовью 🌹',
            'Моя принцесса!\n\nПоздравляю тебя! Ты заслуживаешь всего самого лучшего. Пусть каждый день будет наполнен счастьем.\n\nОбнимаю! 🎉',
            'Привет, родная!\n\nТак скучаю по тебе... Хочу обнять тебя и никогда не отпускать.\n\nЦелую 😘',
        ];
        const textarea = document.getElementById('composeText');
        if (textarea && templates[index]) textarea.value = templates[index];
        document.getElementById('composeTemplates')?.classList.add('hidden');
    }

    toggleFavorite(letterId) {
        this.storage.toggleLetterFavorite(letterId);
        this.refreshLettersList();
    }

    getTimeAgo(date) {
        const diff = new Date() - date;
        const m = Math.floor(diff / 60000);
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(diff / 86400000);
        if (m < 1) return 'только что';
        if (m < 60) return `${m} мин`;
        if (h < 24) return `${h} ч`;
        if (d < 7) return `${d} дн`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
}

window.LettersManager = LettersManager;