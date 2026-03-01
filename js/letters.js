// js/letters.js — Система писем: удаление, ответы, реакции, стикеры

class LettersManager {
    constructor(storage, isAdmin = false) {
        this.storage = storage;
        this.isAdmin = isAdmin;
        this.currentLetter = null;
        this.stickerSets = {
            love: ['😍', '🥰', '💕', '💗', '💖', '💝', '❤️', '😘', '💋', '🤗', '💌', '🌹'],
            cute: ['🥺', '🦋', '✨', '⭐', '🌸', '🎀', '🧸', '🍭', '🌈', '🦄', '🐱', '🐰'],
            happy: ['😊', '😄', '🥳', '🎉', '🎊', '🤩', '🙌', '💃', '🎵', '🎶', '🌟', '☀️'],
            reaction: ['👍', '❤️‍🔥', '😂', '😮', '😢', '🙏', '🔥', '💯', '👏', '🤭', '😈', '🫡']
        };
    }

    // ========== РЕНДЕР СТРАНИЦЫ ПИСЕМ ==========
    renderLettersPage() {
        const letters = this.storage.getLetters();
        const unreadCount = letters.filter(l => !l.read).length;

        return `
            <div class="letters-page">
                <div class="letters-header">
                    <div class="letters-header-top">
                        <h1 class="letters-title">
                            <span>💌</span> Наши письма
                        </h1>
                        <div class="letters-unread-badge ${unreadCount === 0 ? 'hidden' : ''}">
                            ${unreadCount} новых
                        </div>
                    </div>
                    <div class="letters-tabs">
                        <button class="letter-tab active" data-filter="all" 
                                onclick="app.letters.filterLetters('all', this)">
                            Все <span class="tab-count">${letters.length}</span>
                        </button>
                        <button class="letter-tab" data-filter="unread" 
                                onclick="app.letters.filterLetters('unread', this)">
                            Новые <span class="tab-count">${unreadCount}</span>
                        </button>
                        <button class="letter-tab" data-filter="favorite" 
                                onclick="app.letters.filterLetters('favorite', this)">
                            Избранные <span class="tab-count">${letters.filter(l => l.favorite).length}</span>
                        </button>
                    </div>
                </div>

                ${this.isAdmin ? this.renderComposeButton() : ''}

                <div class="letters-list" id="lettersList">
                    ${letters.length === 0 
                        ? this.renderEmptyLetters() 
                        : letters.map(l => this.renderLetterCard(l)).join('')}
                </div>
            </div>
        `;
    }

    renderEmptyLetters() {
        return `
            <div class="empty-state">
                <div class="empty-emoji">💌</div>
                <h3>Пока нет писем</h3>
                <p>${this.isAdmin 
                    ? 'Напишите первое любовное письмо!' 
                    : 'Скоро здесь появятся прекрасные письма...'}</p>
            </div>
        `;
    }

    renderComposeButton() {
        return `
            <div class="compose-fab" onclick="app.letters.openCompose()">
                <span>✍️</span>
                <span class="fab-text">Написать письмо</span>
            </div>
        `;
    }

    renderLetterCard(letter) {
        const date = new Date(letter.date);
        const timeAgo = this.getTimeAgo(date);
        const hasReply = letter.replies && letter.replies.length > 0;
        const hasReactions = letter.reactions && letter.reactions.length > 0;

        return `
            <div class="letter-card ${letter.read ? '' : 'unread'} 
                 ${letter.favorite ? 'favorited' : ''}" 
                 data-id="${letter.id}" 
                 data-filter-unread="${!letter.read}"
                 data-filter-favorite="${letter.favorite || false}">
                
                <div class="letter-card-header">
                    <div class="letter-sender" onclick="app.letters.openLetter('${letter.id}')">
                        <div class="letter-avatar ${letter.from === 'admin' ? 'admin-avatar' : 'user-avatar'}">
                            ${letter.from === 'admin' ? '💝' : '👸'}
                        </div>
                        <div class="letter-sender-info">
                            <span class="sender-name">
                                ${letter.from === 'admin' ? 'Любимый' : 'Любимая'}
                            </span>
                            <span class="letter-time">${timeAgo}</span>
                        </div>
                    </div>
                    <div class="letter-card-actions">
                        ${!letter.read ? '<div class="unread-dot"></div>' : ''}
                        <button class="fav-btn ${letter.favorite ? 'active' : ''}" 
                                onclick="event.stopPropagation(); app.letters.toggleFavorite('${letter.id}')">
                            ${letter.favorite ? '⭐' : '☆'}
                        </button>
                        <button class="delete-letter-btn"
                                onclick="event.stopPropagation(); app.letters.confirmDeleteLetter('${letter.id}')">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="letter-card-body" onclick="app.letters.openLetter('${letter.id}')">
                    <h3 class="letter-subject">${letter.subject || 'Без темы'}</h3>
                    <p class="letter-preview">
                        ${letter.text.substring(0, 100)}${letter.text.length > 100 ? '...' : ''}
                    </p>
                </div>

                <div class="letter-card-footer" onclick="app.letters.openLetter('${letter.id}')">
                    ${hasReactions ? `
                        <div class="letter-reactions-mini">
                            ${letter.reactions.slice(0, 5).map(r => 
                                `<span class="reaction-mini">${r.emoji}</span>`
                            ).join('')}
                            ${letter.reactions.length > 5 
                                ? `<span class="reactions-more">+${letter.reactions.length - 5}</span>` 
                                : ''}
                        </div>
                    ` : ''}
                    ${hasReply ? `<div class="reply-indicator">💬 ${letter.replies.length} ответ(ов)</div>` : ''}
                    <div class="letter-mood-tag">${letter.mood || '💕'}</div>
                </div>
            </div>
        `;
    }

    // ========== УДАЛЕНИЕ ПИСЬМА ==========
    confirmDeleteLetter(letterId) {
        const html = `
            <div class="admin-modal-overlay active" id="deleteLetterModal">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" 
                                onclick="document.getElementById('deleteLetterModal').remove()">✕</button>
                        <h2>🗑️ Удалить письмо?</h2>
                    </div>
                    <div class="admin-modal-body" style="text-align:center;">
                        <p style="font-size:40px;margin-bottom:12px;">🥺</p>
                        <p style="font-size:14px;color:var(--text-light);margin-bottom:20px;">
                            Это действие нельзя отменить. Письмо будет удалено навсегда.
                        </p>
                        <div style="display:flex;gap:10px;">
                            <button class="gift-cancel-btn" style="flex:1;"
                                    onclick="document.getElementById('deleteLetterModal').remove()">
                                Отмена
                            </button>
                            <button class="admin-submit-btn" 
                                    style="flex:1;background:#EF5350;"
                                    onclick="app.letters.deleteLetter('${letterId}')">
                                🗑️ Удалить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    deleteLetter(letterId) {
        this.storage.deleteLetter(letterId);
        document.getElementById('deleteLetterModal')?.remove();
        
        window.app?.toast?.show('Письмо удалено 🗑️');
        window.app?.effects?.pulseElement(document.body);
        
        this.refreshLettersList();
        window.app?.nav?.updateBadges();
    }

    // ========== ОТКРЫТИЕ ПОЛНОГО ПИСЬМА ==========
    openLetter(letterId) {
        const letter = this.storage.getLetter(letterId);
        if (!letter) return;

        if (!letter.read) {
            this.storage.markLetterRead(letterId);
        }

        this.currentLetter = letter;
        const date = new Date(letter.date);
        const replies = letter.replies || [];

        const modalHTML = `
            <div class="letter-full-overlay active" id="letterFullOverlay">
                <div class="letter-full">
                    <div class="letter-full-header">
                        <button class="letter-back-btn" onclick="app.letters.closeLetter()">
                            ← Назад
                        </button>
                        <div class="letter-full-actions">
                            <button class="action-icon-btn" 
                                    onclick="app.letters.toggleFavorite('${letter.id}')">
                                ${letter.favorite ? '⭐' : '☆'}
                            </button>
                            <button class="action-icon-btn" 
                                    onclick="app.letters.confirmDeleteLetter('${letter.id}')">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <div class="letter-full-content">
                        <div class="letter-envelope-decoration">💌</div>
                        
                        <div class="letter-full-meta">
                            <div class="letter-from-to">
                                <span class="from-avatar">
                                    ${letter.from === 'admin' ? '💝' : '👸'}
                                </span>
                                <span class="from-arrow">→</span>
                                <span class="to-avatar">
                                    ${letter.from === 'admin' ? '👸' : '💝'}
                                </span>
                            </div>
                            <div class="letter-full-date">
                                ${date.toLocaleDateString('ru-RU', { 
                                    weekday: 'long', year: 'numeric', 
                                    month: 'long', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                        </div>

                        <h2 class="letter-full-subject">
                            ${letter.subject || 'Без темы'}
                        </h2>

                        <div class="letter-paper">
                            <div class="letter-full-text">
                                ${letter.text.replace(/\n/g, '<br>')}
                            </div>
                            <div class="letter-signature">
                                С любовью, ${letter.from === 'admin' ? 'Твой ❤️' : 'Твоя 💕'}
                            </div>
                        </div>

                        <!-- Реакции -->
                        <div class="letter-reactions-section">
                            <div class="reactions-title">Реакции</div>
                            <div class="reactions-display" id="reactionsDisplay">
                                ${this.renderReactions(letter)}
                            </div>
                            <div class="reaction-add-section">
                                <button class="add-reaction-btn" 
                                        onclick="app.letters.toggleStickerPanel()">
                                    😊 Реакция
                                </button>
                            </div>
                        </div>

                        <!-- Стикер панель -->
                        <div class="sticker-panel hidden" id="stickerPanel">
                            <div class="sticker-tabs">
                                ${Object.keys(this.stickerSets).map(set => `
                                    <button class="sticker-tab ${set === 'love' ? 'active' : ''}" 
                                            onclick="app.letters.switchStickerSet('${set}', this)">
                                        ${set === 'love' ? '💕' : set === 'cute' ? '🦋' : set === 'happy' ? '🎉' : '🔥'}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="sticker-grid" id="stickerGrid">
                                ${this.renderStickerGrid('love')}
                            </div>
                        </div>

                        <!-- Ответы (цепочка) -->
                        <div class="letter-thread-section">
                            <div class="thread-title">
                                💬 Переписка 
                                <span class="thread-count">(${replies.length})</span>
                            </div>
                            
                            <div class="thread-messages" id="threadMessages">
                                ${replies.length > 0 
                                    ? replies.map(r => this.renderReplyBubble(r)).join('')
                                    : '<div class="no-replies">Пока нет ответов</div>'
                                }
                            </div>

                            <!-- Форма ответа -->
                            <div class="reply-compose-new" id="replyCompose">
                                <div class="reply-input-container">
                                    <textarea class="reply-textarea-new" id="replyInput" 
                                              placeholder="Написать ответ..." rows="2"></textarea>
                                    <div class="reply-toolbar">
                                        <button class="reply-tool-btn" 
                                                onclick="app.letters.toggleReplyStickerPanel()">
                                            😊
                                        </button>
                                        <button class="reply-send-new" 
                                                onclick="app.letters.sendReply('${letter.id}')">
                                            Отправить →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Прокрутить к последнему сообщению
        setTimeout(() => {
            const messages = document.getElementById('threadMessages');
            if (messages) messages.scrollTop = messages.scrollHeight;
        }, 100);
    }

    closeLetter() {
        const overlay = document.getElementById('letterFullOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 400);
        }
        this.refreshLettersList();
        window.app?.nav?.updateBadges();
    }

    // ========== ОТВЕТЫ (ЦЕПОЧКА) ==========
    renderReplyBubble(reply) {
        const date = new Date(reply.date);
        const isFromMe = (this.isAdmin && reply.from === 'admin') || 
                         (!this.isAdmin && reply.from === 'user');

        return `
            <div class="thread-bubble ${isFromMe ? 'from-me' : 'from-other'}">
                <div class="bubble-avatar">
                    ${reply.from === 'admin' ? '💝' : '👸'}
                </div>
                <div class="bubble-content">
                    <div class="bubble-name">
                        ${reply.from === 'admin' ? 'Любимый' : 'Любимая'}
                    </div>
                    <div class="bubble-text">${reply.text}</div>
                    <div class="bubble-time">
                        ${date.toLocaleDateString('ru-RU', { 
                            day: 'numeric', month: 'short',
                            hour: '2-digit', minute: '2-digit' 
                        })}
                    </div>
                </div>
            </div>
        `;
    }

    sendReply(letterId) {
        const input = document.getElementById('replyInput');
        if (!input || !input.value.trim()) {
            window.app?.toast?.show('Напишите ответ! ✍️');
            return;
        }

        const reply = {
            id: 'reply_' + Date.now(),
            text: input.value.trim(),
            from: this.isAdmin ? 'admin' : 'user',
            date: new Date().toISOString()
        };

        // Используем массив replies вместо одного reply
        this.storage.addReplyToThread(letterId, reply);
        input.value = '';

        // Обновить UI
        const messages = document.getElementById('threadMessages');
        if (messages) {
            const noReplies = messages.querySelector('.no-replies');
            if (noReplies) noReplies.remove();
            
            messages.insertAdjacentHTML('beforeend', this.renderReplyBubble(reply));
            messages.scrollTop = messages.scrollHeight;
        }

        // Уведомление
        this.sendNotification(letterId, reply);
        
        window.app?.toast?.show('Ответ отправлен! 💕');
        window.app?.effects?.launchHeartBurst(
            window.innerWidth / 2, 
            window.innerHeight - 100
        );
    }

    sendNotification(letterId, reply) {
        const notifications = this.storage.get('notifications') || [];
        const letter = this.storage.getLetter(letterId);
        
        notifications.push({
            id: 'notif_' + Date.now(),
            type: 'reply',
            letterId,
            message: `${reply.from === 'admin' ? 'Любимый' : 'Любимая'} ответил(а) на письмо "${letter?.subject || 'Без темы'}"`,
            preview: reply.text.substring(0, 50),
            date: new Date().toISOString(),
            read: false
        });
        
        this.storage.set('notifications', notifications);
        window.app?.nav?.updateBadges();
    }

    // ========== РЕАКЦИИ ==========
    renderReactions(letter) {
        if (!letter.reactions || letter.reactions.length === 0) {
            return '<div class="no-reactions">Пока нет реакций</div>';
        }

        const grouped = {};
        letter.reactions.forEach(r => {
            if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0 };
            grouped[r.emoji].count++;
        });

        return Object.values(grouped).map(g => `
            <div class="reaction-bubble" 
                 onclick="app.letters.addReaction('${letter.id}', '${g.emoji}')">
                <span class="reaction-emoji">${g.emoji}</span>
                <span class="reaction-count">${g.count}</span>
            </div>
        `).join('');
    }

    addReaction(letterId, emoji) {
        this.storage.addReaction(letterId, emoji, this.isAdmin ? 'admin' : 'user');

        const letter = this.storage.getLetter(letterId);
        const display = document.getElementById('reactionsDisplay');
        if (display) {
            display.innerHTML = this.renderReactions(letter);
        }

        window.app?.effects?.launchHeartBurst(
            window.innerWidth / 2,
            window.innerHeight / 2
        );
    }

    toggleStickerPanel() {
        const panel = document.getElementById('stickerPanel');
        if (panel) panel.classList.toggle('hidden');
    }

    toggleReplyStickerPanel() {
        this.toggleStickerPanel();
        this._insertStickerToReply = true;
    }

    switchStickerSet(setName, btn) {
        document.querySelectorAll('.sticker-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        const grid = document.getElementById('stickerGrid');
        if (grid) grid.innerHTML = this.renderStickerGrid(setName);
    }

    renderStickerGrid(setName) {
        const stickers = this.stickerSets[setName] || [];
        return stickers.map(s => `
            <button class="sticker-item" onclick="app.letters.onStickerClick('${s}')">
                ${s}
            </button>
        `).join('');
    }

    onStickerClick(emoji) {
        if (this._insertStickerToReply) {
            const input = document.getElementById('replyInput');
            if (input) {
                input.value += emoji;
                input.focus();
            }
            this._insertStickerToReply = false;
        } else if (this.currentLetter) {
            this.addReaction(this.currentLetter.id, emoji);
        }
        this.toggleStickerPanel();
    }

    // ========== COMPOSE (ADMIN) ==========
    openCompose() {
        const modalHTML = `
            <div class="compose-overlay active" id="composeOverlay">
                <div class="compose-modal">
                    <div class="compose-header">
                        <button class="compose-close" onclick="app.letters.closeCompose()">✕</button>
                        <h2>Новое письмо 💌</h2>
                        <button class="compose-send" onclick="app.letters.sendLetter()">
                            Отправить ✨
                        </button>
                    </div>

                    <div class="compose-body">
                        <div class="compose-field">
                            <label>Кому</label>
                            <div class="compose-recipient">
                                <span class="recipient-avatar">👸</span>
                                <span>Любимая</span>
                                <span class="recipient-badge">💕</span>
                            </div>
                        </div>

                        <div class="compose-field">
                            <label>Тема письма</label>
                            <input type="text" class="compose-input" id="composeSubject" 
                                   placeholder="Например: Ты — моё счастье...">
                        </div>

                        <div class="compose-field">
                            <label>Настроение</label>
                            <div class="compose-mood-selector">
                                ${['💕', '🥰', '😘', '🌹', '✨', '🎉', '🌸', '💌'].map(m => `
                                    <button class="compose-mood-btn ${m === '💕' ? 'active' : ''}" 
                                            onclick="app.letters.selectComposeMood('${m}', this)">
                                        ${m}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="compose-field">
                            <label>Текст письма</label>
                            <textarea class="compose-textarea" id="composeText" 
                                      placeholder="Напишите что-нибудь прекрасное..." 
                                      rows="8"></textarea>
                        </div>

                        <div class="compose-extras">
                            <button class="compose-extra-btn" 
                                    onclick="app.letters.insertTemplate()">
                                📝 Шаблон
                            </button>
                        </div>

                        <div class="compose-templates hidden" id="composeTemplates">
                            <div class="template-item" onclick="app.letters.useTemplate(0)">
                                <span>💕</span> Признание в любви
                            </div>
                            <div class="template-item" onclick="app.letters.useTemplate(1)">
                                <span>🌹</span> Романтическое письмо
                            </div>
                            <div class="template-item" onclick="app.letters.useTemplate(2)">
                                <span>🎉</span> Поздравление
                            </div>
                            <div class="template-item" onclick="app.letters.useTemplate(3)">
                                <span>😘</span> Скучаю по тебе
                            </div>
                            <div class="template-item" onclick="app.letters.useTemplate(4)">
                                <span>⭐</span> Комплименты
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this._composeMood = '💕';
    }

    closeCompose() {
        document.getElementById('composeOverlay')?.remove();
    }

    selectComposeMood(mood, btn) {
        document.querySelectorAll('.compose-mood-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._composeMood = mood;
    }

    sendLetter() {
        const subject = document.getElementById('composeSubject')?.value?.trim();
        const text = document.getElementById('composeText')?.value?.trim();

        if (!text) {
            window.app?.toast?.show('Напишите текст письма! ✍️');
            return;
        }

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
            replies: [],         // МАССИВ ответов
            attachment: null
        };

        this.storage.addLetter(letter);
        this.closeCompose();

        // Уведомление пользователю
        const notifications = this.storage.get('notifications') || [];
        notifications.push({
            id: 'notif_' + Date.now(),
            type: 'letter',
            letterId: letter.id,
            message: `Новое письмо: "${letter.subject}"`,
            preview: text.substring(0, 50),
            date: new Date().toISOString(),
            read: false
        });
        this.storage.set('notifications', notifications);

        window.app?.effects?.launchConfetti();
        window.app?.toast?.show('Письмо отправлено! 💌✨');
        this.refreshLettersList();
    }

    insertTemplate() {
        const templates = document.getElementById('composeTemplates');
        if (templates) templates.classList.toggle('hidden');
    }

    useTemplate(index) {
        const templates = [
            'Моя любимая,\n\nКаждый день я благодарю судьбу за то, что ты есть в моей жизни. Ты — мой рассвет и мой закат, мой смех и моя опора. Я люблю тебя больше, чем слова смогут передать.\n\nТвой навсегда ❤️',
            'Дорогая,\n\nКогда я смотрю на тебя, весь мир замирает. Твои глаза — два океана, в которых я готов утонуть. Твоя улыбка заставляет моё сердце биться чаще.\n\nС бесконечной любовью 🌹',
            'Моя принцесса!\n\nПоздравляю тебя с этим прекрасным днём! Ты заслуживаешь всего самого лучшего в этом мире. Пусть каждый твой день будет наполнен счастьем.\n\nОбнимаю крепко! 🎉',
            'Привет, моя родная!\n\nТак скучаю по тебе... Каждая минута без тебя кажется вечностью. Хочу обнять тебя, поцеловать и никогда не отпускать.\n\nЦелую 😘',
            'Моя звёздочка!\n\nЗнаешь, что делает тебя особенной? Всё! Твой смех, твои глаза, твоя доброта — ты идеальна. Никогда не сомневайся в этом.\n\nТвой поклонник ⭐'
        ];

        const textarea = document.getElementById('composeText');
        if (textarea && templates[index]) textarea.value = templates[index];

        document.getElementById('composeTemplates')?.classList.add('hidden');
    }

    // ========== ФИЛЬТРАЦИЯ ==========
    filterLetters(filter, btn) {
        document.querySelectorAll('.letter-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        const cards = document.querySelectorAll('.letter-card');
        cards.forEach(card => {
            if (filter === 'all') {
                card.style.display = '';
            } else if (filter === 'unread') {
                card.style.display = card.dataset.filterUnread === 'true' ? '' : 'none';
            } else if (filter === 'favorite') {
                card.style.display = card.dataset.filterFavorite === 'true' ? '' : 'none';
            }
        });
    }

    toggleFavorite(letterId) {
        this.storage.toggleLetterFavorite(letterId);
        
        // Обновить кнопку в opened letter
        const letter = this.storage.getLetter(letterId);
        const favBtns = document.querySelectorAll(`.fav-btn, .action-icon-btn`);
        
        this.refreshLettersList();
    }

    refreshLettersList() {
        const container = document.getElementById('lettersInbox');
        if (container) {
            const letters = this.storage.getLetters();
            if (letters.length === 0) {
                container.innerHTML = this.renderEmptyLetters();
            } else {
                container.innerHTML = letters.map(l => this.renderLetterItem(l)).join('');
            }
        }
    }

    renderLetterItem(letter) {
    const date = new Date(letter.date);
    const timeAgo = this.getTimeAgo(date);
    const hasReplies = letter.replies && letter.replies.length > 0;

    return `
        <div class="letter-item ${letter.read ? '' : 'unread'}"
             onclick="app.letters.openLetter('${letter.id}')">
            ${!letter.read ? '<div class="letter-unread-dot"></div>' : ''}
            <div class="letter-item-icon">${letter.mood || '💌'}</div>
            <div class="letter-item-info">
                <h4>${letter.subject || 'Без темы'}</h4>
                <p>${letter.text.substring(0, 60)}...</p>
            </div>
            <div class="letter-item-date">${timeAgo}</div>
            ${letter.favorite ? '<div class="letter-item-mood">⭐</div>' : ''}
            ${hasReplies ? '<div class="letter-item-mood">💬</div>' : ''}
        </div>
    `;
}

    // ========== HELPERS ==========
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

window.LettersManager = LettersManager;