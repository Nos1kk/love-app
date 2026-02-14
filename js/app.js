// js/app.js — Главный файл приложения v2.1 (все баги исправлены)

class LoveApp {
    constructor() {
        this.isAdmin = false;
        this.currentPage = 'home';
        this.storage = null;
        this.effects = null;
        this.nav = null;
        this.calendar = null;
        this.letters = null;
        this.gifts = null;
        this.photos = null;
        this.profile = null;
        this.admin = null;
        this.notifications = null;
        this.features = null;
        this.telegram = null;

        this.compliments = [
            'Ты освещаешь мой мир ярче, чем тысяча звёзд ⭐',
            'Твоя улыбка — лучшее лекарство от всех проблем 😊',
            'Каждый день с тобой — подарок судьбы 🎁',
            'Ты самая красивая девушка во всей вселенной 💫',
            'С тобой даже дождь кажется праздником 🌧️💕',
            'Ты делаешь мою жизнь волшебной ✨',
            'Я влюбляюсь в тебя сильнее каждый день 💗',
            'Ты — моя любимая мелодия 🎵',
            'Рядом с тобой я самый счастливый 🥰',
            'Ты — причина моей улыбки каждое утро ☀️',
            'Мне повезло больше всех на свете 🍀',
            'Ты прекрасна, как рассвет над океаном 🌅',
            'С тобой хочется жить вечно 💕'
        ];

        this.currentHoliday = 'valentine';
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    init() {
        try {
            // 1. Хранилище
            this.storage = new DataStorage();

            // 2. Роль
            const profile = this.storage.getProfile();
            this.isAdmin = profile.isAdmin || false;

            // 3. Telegram интеграция
            if (typeof TelegramIntegration !== 'undefined') {
                this.telegram = new TelegramIntegration();
                const tgReady = this.telegram.init();
                if (tgReady) {
                    const tgName = this.telegram.getUserName();
                    if (tgName && !profile.nameSetManually) {
                        this.storage.updateProfile({ userName: tgName });
                    }
                }
            }

            // 4. Эффекты
            this.effects = new Effects();

            // 5. Модули
            this.calendar = new CalendarManager(this.storage, this.isAdmin);
            this.letters = new LettersManager(this.storage, this.isAdmin);
            this.gifts = new GiftsManager(this.storage, this.isAdmin);
            this.photos = new PhotosManager(this.storage, this.isAdmin);
            this.profile = new ProfileManager(this.storage, this.isAdmin);
            this.admin = new AdminPanel(this.storage);

            // 6. Уведомления
            if (typeof NotificationManager !== 'undefined') {
                this.notifications = new NotificationManager(this.storage);
                this.notifications.init();
            }

            // 7. Доп. функции
            if (typeof ExtraFeatures !== 'undefined') {
                this.features = new ExtraFeatures(this.storage);
            }

            // 8. Навигация
            this.nav = new Navigation(this);
            this.nav.init();

            // 9. Загрузить сохранённую тему
            if (this.profile && this.profile.loadSavedTheme) {
                this.profile.loadSavedTheme();
            }

            // 10. UI
            this.setupUI();
            this.startCountdown();
            this.updateUpcomingEvents();
            this.newCompliment();
            this.animateLoveMeter();
            this.updateProfileUI();
            this.updateAdminVisibility();
            this.addHomeExtraCards();

            // 11. Hash навигация
            this.handleHashNavigation();

            console.log('💕 Love App v2.1 initialized!');
        } catch (error) {
            console.error('❌ App init error:', error);
        }
    }

    // ========== HASH НАВИГАЦИЯ ==========
    handleHashNavigation() {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            setTimeout(() => this.navigateTo(hash), 500);
        }
    }

    // ========== НАВИГАЦИЯ ==========
    navigateTo(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        const page = document.getElementById('page-' + pageId);
        if (page) {
            page.classList.add('active');
            this.currentPage = pageId;
            this.nav.setActivePage(pageId);
            this.renderPageContent(pageId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Telegram BackButton
        if (this.telegram && this.telegram.isReady) {
            if (pageId === 'home') {
                this.telegram.hideBackButton();
            } else {
                this.telegram.showBackButton();
            }
        }

        // Закрыть меню
        if (this.nav && this.nav.menuOpen) {
            this.nav.toggleMenu();
        }
    }

    renderPageContent(pageId) {
        switch (pageId) {
            case 'home':
                this.updateUpcomingEvents();
                this.animateLoveMeter();
                break;
            case 'calendar':
                this.calendar.renderCalendar();
                this.updateCalendarAdminBtn();
                break;
            case 'letters':
                this.renderLettersContent();
                this.updateLetterAdminBtn();
                break;
            case 'profile':
                this.renderProfileContent();
                break;
            case 'gallery':
                this.renderGalleryContent();
                this.updateGalleryAdminBtn();
                break;
            case 'gifts':
                this.renderGiftsContent();
                this.updateGiftsAdminBtn();
                break;
            case 'admin':
                this.renderAdminContent();
                break;
        }
    }

    // ========== SETUP UI ==========
    setupUI() {
        this.updateHeaderUI();
        this.nav.updateBadges();
        if (this.notifications) {
            this.notifications.updateNotificationBadge();
        }
    }

    updateHeaderUI() {
        const profile = this.storage.getProfile();
        const name = this.isAdmin
            ? (profile.adminName || 'Любимый')
            : (profile.userName || 'Любимая');

        // Аватар
        let avatarContent;
        if (profile.avatarUrl) {
            avatarContent = `<img src="${profile.avatarUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            avatarContent = profile.avatarEmoji || (this.isAdmin ? '🤴' : '👸');
        }

        const headerName = document.getElementById('headerUserName');
        const headerAvatar = document.getElementById('headerAvatar');
        const menuAvatar = document.getElementById('menuAvatar');
        const menuUserName = document.getElementById('menuUserName');
        const menuUserStatus = document.getElementById('menuUserStatus');
        const menuRoleBadge = document.getElementById('menuRoleBadge');

        if (headerName) headerName.textContent = `Привет, ${name}!`;
        if (headerAvatar) headerAvatar.innerHTML = avatarContent;
        if (menuAvatar) menuAvatar.innerHTML = avatarContent;
        if (menuUserName) menuUserName.textContent = `${name} ${this.isAdmin ? '👑' : '💕'}`;
        if (menuUserStatus) {
            menuUserStatus.textContent = this.isAdmin
                ? 'Администратор'
                : (profile.userStatus || 'В сети');
        }
        if (menuRoleBadge) {
            menuRoleBadge.textContent = this.isAdmin ? 'Админ 👑' : 'Принцесса';
        }
    }

    updateAdminVisibility() {
        const adminEls = [
            'adminMenuBtn', 'calAddBtn', 'letterAddBtn',
            'galleryAddBtn', 'giftAddBtn', 'giftSentTab', 'balanceAddBtn'
        ];

        adminEls.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = this.isAdmin ? 'flex' : 'none';
        });

        const roleSwitchLabel = document.getElementById('roleSwitchLabel');
        if (roleSwitchLabel) {
            roleSwitchLabel.textContent = this.isAdmin
                ? '👸 Режим Принцессы'
                : '🔑 Войти как Админ';
        }
    }

    updateCalendarAdminBtn() {
        const btn = document.getElementById('calAddBtn');
        if (btn) btn.style.display = this.isAdmin ? 'flex' : 'none';
    }

    updateLetterAdminBtn() {
        const btn = document.getElementById('letterAddBtn');
        if (btn) btn.style.display = this.isAdmin ? 'flex' : 'none';
    }

    updateGalleryAdminBtn() {
        const btn = document.getElementById('galleryAddBtn');
        if (btn) btn.style.display = this.isAdmin ? 'flex' : 'none';
    }

    updateGiftsAdminBtn() {
        const btn = document.getElementById('giftAddBtn');
        if (btn) btn.style.display = this.isAdmin ? 'flex' : 'none';
    }

    // ========== ДОП. КАРТОЧКИ НА ГЛАВНУЮ ==========
    addHomeExtraCards() {
        const slider = document.querySelector('.cards-slider');
        if (!slider || slider.querySelector('.extra-card') || !this.features) return;

        const extraHTML = `
            <div class="love-card extra-card" onclick="app.features.openLuckyWheel()">
                <span class="card-emoji">🎰</span>
                <div class="card-title">Колесо удачи</div>
                <div class="card-desc">Крути каждый день!</div>
                <div class="card-action">Играть →</div>
            </div>
            <div class="love-card extra-card" onclick="app.features.openGoals()">
                <span class="card-emoji">🎯</span>
                <div class="card-title">Наши цели</div>
                <div class="card-desc">Совместные мечты</div>
                <div class="card-action">Открыть →</div>
            </div>
            <div class="love-card extra-card" onclick="app.features.openAnalytics()">
                <span class="card-emoji">📊</span>
                <div class="card-title">Аналитика</div>
                <div class="card-desc">Статистика любви</div>
                <div class="card-action">Смотреть →</div>
            </div>
            <div class="love-card extra-card" onclick="app.features.openPlaylist()">
                <span class="card-emoji">🎵</span>
                <div class="card-title">Наш плейлист</div>
                <div class="card-desc">Песни для нас</div>
                <div class="card-action">Слушать →</div>
            </div>
            <div class="love-card extra-card" onclick="app.features.openQuickNotes()">
                <span class="card-emoji">📌</span>
                <div class="card-title">Записки</div>
                <div class="card-desc">Быстрые записки</div>
                <div class="card-action">Открыть →</div>
            </div>
        `;

        slider.insertAdjacentHTML('beforeend', extraHTML);
    }

    // ========== COUNTDOWN ==========
    startCountdown() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const now = new Date();
        let allUpcoming = [];

        // 1. Особые даты
        const specialDates = this.storage.getSpecialDates();
        specialDates.forEach(sd => {
            let d = new Date(sd.date);
            let nextDate = new Date(now.getFullYear(), d.getMonth(), d.getDate());
            if (nextDate <= now) {
                nextDate = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
            }
            allUpcoming.push({ name: sd.title, emoji: sd.emoji, date: nextDate });
        });

        // 2. События из календаря
        const events = this.storage.getEvents();
        events.forEach(e => {
            const d = new Date(e.date);
            if (d > now) {
                const emojis = {
                    date: '💑', holiday: '🎉', birthday: '🎂',
                    anniversary: '💍', surprise: '🎁', trip: '✈️',
                    dinner: '🍽️', other: '⭐'
                };
                allUpcoming.push({
                    name: e.title,
                    emoji: emojis[e.type] || '📌',
                    date: d
                });
            }
        });

        // 3. Фиксированные праздники (если ещё не добавлены)
        const fixedHolidays = [
            { name: 'День рождения', emoji: '🎂', month: 4, day: 2 },
            { name: '8 Марта', emoji: '🌷', month: 2, day: 8 },
            { name: '14 Февраля', emoji: '💝', month: 1, day: 14 },
            { name: 'Новый год', emoji: '🎄', month: 11, day: 31 },
        ];

        fixedHolidays.forEach(h => {
            const exists = allUpcoming.some(u =>
                u.date.getMonth() === h.month && u.date.getDate() === h.day
            );
            if (!exists) {
                let nextDate = new Date(now.getFullYear(), h.month, h.day);
                if (nextDate <= now) {
                    nextDate = new Date(now.getFullYear() + 1, h.month, h.day);
                }
                allUpcoming.push({ name: h.name, emoji: h.emoji, date: nextDate });
            }
        });

        // Сортировать
        allUpcoming.sort((a, b) => a.date - b.date);

        const nearest = allUpcoming[0];
        if (!nearest) return;

        const diff = nearest.date - now;
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = String(val).padStart(2, '0');
        };

        set('days', days);
        set('hours', hours);
        set('minutes', minutes);
        set('seconds', seconds);

        const labelEl = document.getElementById('countdownLabel');
        if (labelEl) {
            labelEl.innerHTML = `<span class="event-icon">${nearest.emoji}</span> До "${nearest.name}" осталось <span class="event-icon">${nearest.emoji}</span>`;
        }
    }

    // ========== HOLIDAYS ==========
    switchHoliday(holidayId, element) {
        this.currentHoliday = holidayId;
        document.querySelectorAll('.theme-pill').forEach(p => p.classList.remove('active'));
        if (element) element.classList.add('active');
        this.updateCountdown();
    }

    // ========== UPCOMING EVENTS ==========
    updateUpcomingEvents() {
        const container = document.getElementById('upcomingEvents');
        if (!container) return;

        const events = this.storage.getEvents();
        const specialDates = this.storage.getSpecialDates();
        const now = new Date();

        let allDates = [];

        events.forEach(e => {
            const d = new Date(e.date);
            if (d >= now || this.isSameDay(d, now)) {
                allDates.push({
                    title: e.title,
                    date: d,
                    emoji: this.getEventEmoji(e.type),
                    type: e.type
                });
            }
        });

        specialDates.forEach(sd => {
            let d = new Date(sd.date);
            if (d < now) {
                d = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
            }
            allDates.push({ title: sd.title, date: d, emoji: sd.emoji, type: 'holiday' });
        });

        allDates.sort((a, b) => a.date - b.date);
        allDates = allDates.slice(0, 5);

        if (allDates.length === 0) {
            container.innerHTML = `
                <div class="no-events">
                    <span class="no-events-emoji">📅</span>
                    Нет предстоящих событий
                </div>
            `;
            return;
        }

        container.innerHTML = allDates.map(item => {
            const daysLeft = Math.ceil((item.date - now) / 86400000);
            const dateStr = item.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            return `
                <div class="upcoming-event-item" onclick="app.navigateTo('calendar')">
                    <div class="uei-emoji">${item.emoji}</div>
                    <div class="uei-info">
                        <h4>${item.title}</h4>
                        <p>${daysLeft === 0 ? 'Сегодня! 🎉' : `Через ${daysLeft} дн.`}</p>
                    </div>
                    <div class="uei-date">${dateStr}</div>
                </div>
            `;
        }).join('');
    }

    getEventEmoji(type) {
        const emojis = {
            date: '💑', holiday: '🎉', birthday: '🎂', anniversary: '💍',
            surprise: '🎁', trip: '✈️', dinner: '🍽️', other: '⭐',
            event: '📌', meeting: '🤝'
        };
        return emojis[type] || '📌';
    }

    isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    // ========== COMPLIMENTS ==========
    newCompliment() {
        const el = document.getElementById('complimentText');
        if (!el) return;

        const idx = Math.floor(Math.random() * this.compliments.length);
        el.style.opacity = '0';
        setTimeout(() => {
            el.textContent = this.compliments[idx];
            el.style.opacity = '1';
        }, 300);

        const stats = this.storage.getStats();
        this.storage.updateStats({ complimentsRead: (stats.complimentsRead || 0) + 1 });
    }

    // ========== LOVE METER ==========
    animateLoveMeter() {
        const fill = document.getElementById('meterFill');
        const percent = document.getElementById('meterPercent');
        if (!fill || !percent) return;

        setTimeout(() => {
            fill.style.width = '100%';
            let current = 0;
            const timer = setInterval(() => {
                current += 2;
                if (current > 100) {
                    current = 100;
                    clearInterval(timer);
                }
                percent.textContent = current + '%';
            }, 30);
        }, 500);
    }

    // ========== MOOD ==========
    selectMood(btn, message) {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const response = document.getElementById('moodResponse');
        if (response) {
            response.textContent = message;
            response.style.opacity = '0';
            setTimeout(() => { response.style.opacity = '1'; }, 100);
        }

        this.toast.show(message);

        if (this.telegram && this.telegram.isReady) {
            this.telegram.hapticLight();
        }
    }

    // ========== LETTERS CONTENT ==========
    renderLettersContent() {
        const letters = this.storage.getLetters();
        const inbox = document.getElementById('lettersInbox');

        if (inbox) {
            // Фильтруем: входящие — от другой роли
            const inboxLetters = letters.filter(l => {
                if (this.isAdmin) return l.from !== 'admin' || l.from === 'admin'; // все
                return true; // user видит все
            });

            if (inboxLetters.length === 0) {
                inbox.innerHTML = `
                    <div class="no-events">
                        <span class="no-events-emoji">💌</span>
                        Пока нет писем
                    </div>
                `;
            } else {
                inbox.innerHTML = inboxLetters.map(l => this.renderLetterItem(l)).join('');
            }
        }

        // Обновить badge
        const badge = document.getElementById('lettersBadge');
        const unread = letters.filter(l => !l.read).length;
        if (badge) {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'inline' : 'none';
        }
    }

    renderLetterItem(letter) {
        const date = new Date(letter.date);
        const dateStr = this.getTimeAgo(date);
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
                <div class="letter-item-date">${dateStr}</div>
                ${letter.favorite ? '<div class="letter-item-mood">⭐</div>' : ''}
                ${hasReplies ? '<div class="letter-item-mood" style="bottom:26px;">💬</div>' : ''}
            </div>
        `;
    }

    // ========== SENT LETTERS ==========
    renderSentLetters() {
        const sent = document.getElementById('lettersSent');
        if (!sent) return;

        const letters = this.storage.getLetters().filter(l => {
            if (this.isAdmin) return l.from === 'admin';
            return l.from === 'user';
        });

        if (letters.length === 0) {
            sent.innerHTML = `
                <div class="no-events">
                    <span class="no-events-emoji">📤</span>
                    Нет отправленных писем
                </div>
            `;
        } else {
            sent.innerHTML = letters.map(l => this.renderLetterItem(l)).join('');
        }
    }

    // ========== LETTER SHORTCUTS ==========
    openLetterDetail(letterId) {
        this.letters.openLetter(letterId);
    }

    closeLetterDetail() {
        this.letters.closeLetter();
    }

    reactToLetter(emoji) {
        if (!this.letters.currentLetter) return;
        this.letters.addReaction(this.letters.currentLetter.id, emoji);
    }

    sendReply() {
        if (!this.letters.currentLetter) return;
        this.letters.sendReply(this.letters.currentLetter.id);
    }

    // ========== PROFILE CONTENT ==========
    renderProfileContent() {
        const container = document.getElementById('page-profile');
        if (!container) return;

        if (this.profile && this.profile.renderProfilePage) {
            const profileHTML = this.profile.renderProfilePage();

            // Удалить всё кроме page-header
            const children = Array.from(container.children);
            children.forEach(child => {
                if (!child.classList.contains('page-header')) {
                    child.remove();
                }
            });

            container.insertAdjacentHTML('beforeend', profileHTML);
        }
    }

    updateProfileUI() {
        // Обновляется при навигации
    }

    // ========== GALLERY CONTENT ==========
    renderGalleryContent() {
        const albums = this.storage.getAlbums();
        const grid = document.getElementById('albumsGrid');
        if (!grid) return;

        if (albums.length === 0) {
            grid.innerHTML = `
                <div class="no-events" style="grid-column:1/-1;">
                    <span class="no-events-emoji">📸</span>
                    Нет альбомов
                </div>
            `;
            return;
        }

        grid.innerHTML = albums.map(a => `
            <div class="album-card" onclick="app.photos.openAlbum('${a.id}')">
                <div class="album-cover">${a.coverEmoji || '📸'}</div>
                <div class="album-name">${a.name}</div>
                <div class="album-count">${a.photoCount || 0} медиа</div>
            </div>
        `).join('');
    }

    openAlbum(albumId) {
        this.photos.openAlbum(albumId);
    }

    closeAlbumView() {
        // Закрыть динамический оверлей из photos.js
        const dynamicOverlay = document.getElementById('albumViewOverlay');
        if (dynamicOverlay) {
            dynamicOverlay.remove();
            return;
        }
        // Fallback
        const view = document.getElementById('albumPhotosView');
        const mainGrid = document.getElementById('albumsGrid');
        if (view) view.style.display = 'none';
        if (mainGrid) mainGrid.style.display = 'grid';
    }

    // ========== GIFTS CONTENT ==========
    renderGiftsContent() {
        const gifts = this.storage.getGifts();
        const profile = this.storage.getProfile();

        // Баланс — у каждой роли свой
        const balance = this.isAdmin
            ? (profile.adminStars ?? profile.giftBalance ?? 0)
            : (profile.userStars ?? 0);

        const balanceEl = document.getElementById('balanceAmount');
        if (balanceEl) balanceEl.textContent = balance;

        const received = document.getElementById('giftsReceived');
        if (received) {
            // Фильтр: показать подарки адресованные текущей роли
            const myGifts = gifts.filter(g => {
                if (this.isAdmin) return g.to === 'admin' || g.from === 'system';
                return g.to === 'user' || g.from === 'system';
            });

            if (myGifts.length === 0) {
                received.innerHTML = `
                    <div class="no-events">
                        <span class="no-events-emoji">🎁</span>
                        Пока нет подарков
                    </div>
                `;
            } else {
                received.innerHTML = myGifts.map(g => `
                    <div class="gift-item ${!g.opened ? 'gift-receive-anim' : ''}"
                         onclick="app.gifts.openGift('${g.id}')">
                        <div class="gift-item-icon">
                            ${g.opened ? g.emoji : '🎁'}
                        </div>
                        <div class="gift-item-info">
                            <h4>${g.opened ? g.name : 'Неоткрытый подарок!'}</h4>
                            <p>${g.message || (g.opened ? '' : 'Нажми, чтобы открыть! 🎉')}</p>
                        </div>
                        <div class="gift-item-date">
                            ${new Date(g.date).toLocaleDateString('ru-RU', {
                                day: 'numeric', month: 'short'
                            })}
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // ========== ADMIN CONTENT ==========
    renderAdminContent() {
        const events = this.storage.getEvents();
        const letters = this.storage.getLetters();
        const gifts = this.storage.getGifts();

        // События
        const evList = document.getElementById('adminEventsList');
        if (evList) {
            evList.innerHTML = events.length === 0
                ? '<div class="admin-empty"><span>📅</span>Нет событий</div>'
                : events.map(e => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">${this.getEventEmoji(e.type)}</div>
                        <div class="ali-info">
                            <h4>${e.title}</h4>
                            <p>${e.date}${e.time ? ' • ' + e.time : ''}</p>
                        </div>
                        <button class="ali-delete" onclick="app.deleteEvent('${e.id}')">🗑️</button>
                    </div>
                `).join('');
        }

        // Письма
        const ltList = document.getElementById('adminLettersList');
        if (ltList) {
            ltList.innerHTML = letters.length === 0
                ? '<div class="admin-empty"><span>💌</span>Нет писем</div>'
                : letters.map(l => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">${l.mood || '💌'}</div>
                        <div class="ali-info">
                            <h4>${l.subject || 'Без темы'}</h4>
                            <p>${l.read ? 'Прочитано' : 'Не прочитано'} •
                               ${new Date(l.date).toLocaleDateString('ru-RU')}</p>
                        </div>
                        <button class="ali-delete" onclick="app.deleteLetter('${l.id}')">🗑️</button>
                    </div>
                `).join('');
        }

        // Подарки
        const gfList = document.getElementById('adminGiftsList');
        if (gfList) {
            gfList.innerHTML = gifts.length === 0
                ? '<div class="admin-empty"><span>🎁</span>Нет подарков</div>'
                : gifts.map(g => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">${g.emoji}</div>
                        <div class="ali-info">
                            <h4>${g.name}</h4>
                            <p>${g.opened ? 'Открыт' : 'Не открыт'} •
                               ${new Date(g.date).toLocaleDateString('ru-RU')}</p>
                        </div>
                    </div>
                `).join('');
        }

        // Заказы
        this.renderAdminOrders();
    }

    renderAdminOrders() {
        if (!this.isAdmin) return;

        const orders = this.storage.getOrders ? this.storage.getOrders() : [];
        if (orders.length === 0) return;
        if (document.getElementById('adminOrdersList')) return;

        const gfList = document.getElementById('adminGiftsList');
        if (!gfList || !gfList.parentElement) return;

        const ordersHTML = `
            <div class="section-title"><h2>🛒 Заказы</h2></div>
            <div class="admin-events-list" id="adminOrdersList">
                ${orders.map(o => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">🛒</div>
                        <div class="ali-info">
                            <h4>Заказ: ${o.itemId}</h4>
                            <p>${o.price} ⭐ •
                               ${o.status === 'pending' ? '⏳ Ожидает' : '✅ Выполнен'}</p>
                        </div>
                        ${o.status === 'pending' ? `
                            <button class="admin-add-btn"
                                    style="width:32px;height:32px;font-size:14px;"
                                    onclick="app.completeOrder('${o.id}')">✓</button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;

        gfList.parentElement.insertAdjacentHTML('afterend', ordersHTML);
    }

    completeOrder(orderId) {
        if (this.storage.updateOrderStatus) {
            this.storage.updateOrderStatus(orderId, 'completed');
        }

        const notifications = this.storage.get('notifications') || [];
        notifications.push({
            id: 'notif_' + Date.now(),
            type: 'system',
            message: 'Ваш заказ выполнен! 🎉',
            date: new Date().toISOString(),
            read: false
        });
        this.storage.set('notifications', notifications);

        this.toast.show('Заказ выполнен! ✅');

        // Удалить старый список заказов и перерендерить
        document.getElementById('adminOrdersList')?.previousElementSibling?.remove();
        document.getElementById('adminOrdersList')?.remove();
        this.renderAdminContent();
    }

    deleteEvent(id) {
        if (confirm('Удалить событие?')) {
            this.storage.deleteEvent(id);
            this.renderAdminContent();
            this.toast.show('Событие удалено 🗑️');
            this.nav.updateBadges();
        }
    }

    deleteLetter(id) {
        if (confirm('Удалить письмо?')) {
            this.storage.deleteLetter(id);
            this.renderAdminContent();
            this.renderLettersContent();
            this.toast.show('Письмо удалено 🗑️');
            this.nav.updateBadges();
        }
    }

    // ========== ROLE SWITCHING ==========
    switchRole() {
        if (!this.isAdmin) {
            const password = prompt('Введите пароль админа:');
            if (password === '1234' || password === 'love') {
                this.isAdmin = true;
                this.storage.updateProfile({ isAdmin: true });
                this.reinitModules();
                this.toast.show('Режим админа активирован! 👑');
            } else if (password !== null) {
                this.toast.show('Неверный пароль! 🔒');
            }
        } else {
            this.isAdmin = false;
            this.storage.updateProfile({ isAdmin: false });
            this.reinitModules();
            this.toast.show('Режим принцессы! 👸💕');
        }
    }

    reinitModules() {
        this.calendar = new CalendarManager(this.storage, this.isAdmin);
        this.letters = new LettersManager(this.storage, this.isAdmin);
        this.gifts = new GiftsManager(this.storage, this.isAdmin);
        this.photos = new PhotosManager(this.storage, this.isAdmin);
        this.profile = new ProfileManager(this.storage, this.isAdmin);

        this.updateHeaderUI();
        this.updateAdminVisibility();
        this.navigateTo('home');
    }

    // ========== TOAST ==========
    get toast() {
        return {
            show: (text, duration = 3000) => {
                const toast = document.getElementById('toast');
                const toastText = document.getElementById('toastText');
                if (!toast || !toastText) return;

                toastText.textContent = text;
                toast.classList.add('show');

                if (this.telegram && this.telegram.isReady) {
                    this.telegram.hapticLight();
                }

                setTimeout(() => {
                    toast.classList.remove('show');
                }, duration);
            }
        };
    }

    // ========== MODAL ==========
    openModal(emoji, title, text) {
        const overlay = document.getElementById('modalOverlay');
        const emojiEl = document.getElementById('modalEmoji');
        const titleEl = document.getElementById('modalTitle');
        const textEl = document.getElementById('modalText');

        if (emojiEl) emojiEl.textContent = emoji;
        if (titleEl) titleEl.textContent = title;
        if (textEl) textEl.textContent = text;
        if (overlay) overlay.classList.add('active');
    }

    closeModal() {
        document.getElementById('modalOverlay')?.classList.remove('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(o => {
            o.classList.remove('active');
        });
    }

    // ========== SHORTCUTS ==========
    onCenterButtonClick() {
        this.effects.launchConfetti();
        this.openModal('💝', 'Я тебя люблю!', 'Ты лучшее в моей жизни! 💕✨');
        if (this.telegram && this.telegram.isReady) {
            this.telegram.hapticHeavy();
        }
    }

    openAddEventModal() { this.admin.openEventCreator(); }
    openWriteLetterModal() { this.letters.openCompose(); }
    openAddAlbumModal() { this.photos.createAlbum(); }
    openSendGiftModal() { this.gifts.openGiftShop(); }
    openAddPhotoModal() { this.photos.openUpload(); }
    openAddBalanceModal() { this.admin.editBalance(); }
    openEditProfileModal() { this.profile.editName(); }

    changeMonth(delta) { this.calendar.changeMonth(delta); }

    switchCalTab(tab, element) {
        document.querySelectorAll('.cal-tab').forEach(t => t.classList.remove('active'));
        if (element) element.classList.add('active');

        document.querySelectorAll('.cal-view').forEach(v => v.classList.remove('active'));
        const view = document.getElementById('calView-' + tab);
        if (view) view.classList.add('active');

        if (tab === 'events') this.calendar.renderEventsList();
        if (tab === 'special') this.calendar.renderSpecialDates();
    }

    closeDayDetails() {
        const d = document.getElementById('dayDetails');
        if (d) d.style.display = 'none';
    }

    switchLetterTab(tab, element) {
        document.querySelectorAll('.letter-tab').forEach(t => t.classList.remove('active'));
        if (element) element.classList.add('active');

        const inbox = document.getElementById('lettersInbox');
        const sent = document.getElementById('lettersSent');

        if (tab === 'inbox') {
            if (inbox) inbox.style.display = 'flex';
            if (sent) sent.style.display = 'none';
        } else {
            if (inbox) inbox.style.display = 'none';
            if (sent) {
                sent.style.display = 'flex';
                this.renderSentLetters();
            }
        }
    }

    switchGiftTab(tab, element) {
        document.querySelectorAll('.gift-tab').forEach(t => t.classList.remove('active'));
        if (element) element.classList.add('active');

        const received = document.getElementById('giftsReceived');
        const sent = document.getElementById('giftsSent');

        if (tab === 'received') {
            if (received) received.style.display = 'flex';
            if (sent) sent.style.display = 'none';
        } else {
            if (received) received.style.display = 'none';
            if (sent) sent.style.display = 'flex';
        }
    }

    // ========== NOTIFICATIONS ==========
    openNotifications() {
        if (this.notifications) {
            this.notifications.openNotificationCenter();
        } else {
            this.toast.show('Уведомления загружаются...');
        }
    }

    // ========== HELPERS ==========
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин`;
        if (hours < 24) return `${hours} ч`;
        if (days < 7) return `${days} дн`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }

    showToast(text) { this.toast.show(text); }
    launchConfetti() { this.effects.launchConfetti(); }
}


// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==========
let app;

function navigateTo(page) { app.navigateTo(page); }
function toggleMenu() { app.nav.toggleMenu(); }
function openModal(emoji, title, text) { app.openModal(emoji, title, text); }
function closeModal() { app.closeModal(); }
function closeAllModals() { app.closeAllModals(); }
function showToast(text) { app.toast.show(text); }
function launchConfetti() { app.launchConfetti(); }
function switchHoliday(id, el) { app.switchHoliday(id, el); }
function newCompliment() { app.newCompliment(); }
function selectMood(btn, msg) { app.selectMood(btn, msg); }
function switchRole() { app.switchRole(); }

function changeMonth(d) { app.changeMonth(d); }
function switchCalTab(tab, el) { app.switchCalTab(tab, el); }
function closeDayDetails() { app.closeDayDetails(); }

function switchLetterTab(tab, el) { app.switchLetterTab(tab, el); }
function closeLetterDetail() { app.closeLetterDetail(); }
function reactToLetter(emoji) { app.reactToLetter(emoji); }
function sendReply() { app.sendReply(); }

function switchGiftTab(tab, el) { app.switchGiftTab(tab, el); }

function openAddEventModal() { app.openAddEventModal(); }
function openWriteLetterModal() { app.openWriteLetterModal(); }
function openAddAlbumModal() { app.openAddAlbumModal(); }
function openSendGiftModal() { app.openSendGiftModal(); }
function openAddPhotoModal() { app.openAddPhotoModal(); }
function openAddBalanceModal() { app.openAddBalanceModal(); }
function openEditProfileModal() { app.openEditProfileModal(); }

function closeAlbumView() { app.closeAlbumView(); }
function openNotifications() { app.openNotifications(); }

function pickEventEmoji(emoji) {
    document.querySelectorAll('#addEventModal .ep-item').forEach(e => e.classList.remove('selected'));
    if (event && event.target) event.target.classList.add('selected');
    const input = document.getElementById('eventEmoji');
    if (input) input.value = emoji;
}

function saveEvent() {
    const title = document.getElementById('eventTitle')?.value?.trim();
    const date = document.getElementById('eventDate')?.value;
    const type = document.getElementById('eventType')?.value;
    const desc = document.getElementById('eventDesc')?.value?.trim();
    const emoji = document.getElementById('eventEmoji')?.value;

    if (!title || !date) {
        app.toast.show('Заполните название и дату! 📝');
        return;
    }

    app.storage.addEvent({
        id: 'event_' + Date.now(),
        title, date, type,
        description: desc || '',
        emoji: emoji || '💕',
        repeat: 'none', reminder: 'none'
    });

    closeAllModals();
    app.toast.show('Событие добавлено! 🎉');
    app.effects.launchConfetti(30);

    if (app.currentPage === 'calendar') app.calendar.renderCalendar();
    if (app.currentPage === 'admin') app.renderAdminContent();
    if (app.currentPage === 'home') app.updateUpcomingEvents();
    app.nav.updateBadges();
}

function pickLetterMood(mood) {
    document.querySelectorAll('#writeLetterModal .ep-item').forEach(e => e.classList.remove('selected'));
    if (event && event.target) event.target.classList.add('selected');
    const input = document.getElementById('letterMood');
    if (input) input.value = mood;
}

function sendLetter() {
    const title = document.getElementById('letterTitle')?.value?.trim();
    const body = document.getElementById('letterBody')?.value?.trim();
    const mood = document.getElementById('letterMood')?.value || '💕';

    if (!body) {
        app.toast.show('Напишите текст письма! ✍️');
        return;
    }

    app.storage.addLetter({
        id: 'letter_' + Date.now(),
        from: 'admin',
        subject: title || 'Письмо любви',
        text: body,
        mood,
        date: new Date().toISOString(),
        read: false,
        favorite: false,
        reactions: [],
        replies: []
    });

    closeAllModals();
    app.effects.launchConfetti();
    app.toast.show('Письмо отправлено! 💌✨');

    if (app.currentPage === 'letters') app.renderLettersContent();
    if (app.currentPage === 'admin') app.renderAdminContent();
    app.nav.updateBadges();
}

function selectGiftType(type, element) {
    document.querySelectorAll('.gift-type-card').forEach(c => c.classList.remove('selected'));
    if (element) element.classList.add('selected');
    const input = document.getElementById('giftType');
    if (input) input.value = type;

    const amountGroup = document.getElementById('giftAmountGroup');
    if (amountGroup) {
        amountGroup.style.display = (type === 'stars' || type === 'money') ? 'block' : 'none';
    }
}

function sendGift() {
    const type = document.getElementById('giftType')?.value;
    const message = document.getElementById('giftMessage')?.value?.trim() || '';
    const amount = document.getElementById('giftAmount')?.value || 0;

    if (!type) {
        app.toast.show('Выберите подарок! 🎁');
        return;
    }

    const giftEmojis = {
        stars: '⭐', flowers: '💐', ring: '💍', chocolate: '🍫',
        bear: '🧸', money: '💰', heart: '💝', crown: '👑'
    };
    const giftNames = {
        stars: `${amount} звёзд`, flowers: 'Букет цветов',
        ring: 'Кольцо', chocolate: 'Шоколад',
        bear: 'Мишка', money: `${amount} руб`,
        heart: 'Сердечко', crown: 'Корона'
    };

    if (type === 'stars' && parseInt(amount) > 0) {
        const profile = app.storage.getProfile();
        const currentUserStars = profile.userStars || 0;
        app.storage.updateProfile({ userStars: currentUserStars + parseInt(amount) });
    }

    app.storage.addGift({
        id: 'gift_' + Date.now(),
        giftId: type,
        emoji: giftEmojis[type] || '🎁',
        name: giftNames[type] || 'Подарок',
        message,
        from: 'admin',
        to: 'user',
        date: new Date().toISOString(),
        opened: false
    });

    closeAllModals();
    app.effects.launchConfetti(80);
    app.toast.show('Подарок отправлен! 🎉');

    if (app.currentPage === 'gifts') app.renderGiftsContent();
    if (app.currentPage === 'admin') app.renderAdminContent();
    app.nav.updateBadges();
}

function pickAlbumCover(emoji) {
    document.querySelectorAll('#addAlbumModal .ep-item').forEach(e => e.classList.remove('selected'));
    if (event && event.target) event.target.classList.add('selected');
    const input = document.getElementById('albumCover');
    if (input) input.value = emoji;
}

function saveAlbum() {
    const title = document.getElementById('albumTitle')?.value?.trim();
    const cover = document.getElementById('albumCover')?.value || '📸';

    if (!title) {
        app.toast.show('Введите название! 📝');
        return;
    }

    app.storage.addAlbum({
        id: 'album_' + Date.now(),
        name: title,
        coverEmoji: cover,
        photoCount: 0,
        createdAt: new Date().toISOString()
    });

    closeAllModals();
    app.toast.show('Альбом создан! 📸');

    if (app.currentPage === 'gallery') app.renderGalleryContent();
}

function pickPhotoEmoji(emoji) {
    document.querySelectorAll('#addPhotoModal .ep-item').forEach(e => e.classList.remove('selected'));
    if (event && event.target) event.target.classList.add('selected');
    const input = document.getElementById('photoEmoji');
    if (input) input.value = emoji;
}

function savePhoto() {
    const caption = document.getElementById('photoCaption')?.value?.trim() || '';
    const emoji = document.getElementById('photoEmoji')?.value || '📸';

    app.storage.addPhoto({
        id: 'photo_' + Date.now(),
        emoji, caption,
        albumId: app._currentAlbumId || '',
        date: new Date().toISOString(),
        isNew: true,
        files: []
    });

    if (app._currentAlbumId) {
        app.storage.incrementAlbumCount(app._currentAlbumId);
    }

    closeAllModals();
    app.toast.show('Фото добавлено! 📸');
}

function pickProfileAvatar(emoji) {
    document.querySelectorAll('#editProfileModal .ep-item').forEach(e => e.classList.remove('selected'));
    if (event && event.target) event.target.classList.add('selected');
    const input = document.getElementById('editAvatar');
    if (input) input.value = emoji;
}

function saveProfile() {
    const name = document.getElementById('editName')?.value?.trim();
    const startDate = document.getElementById('editStartDate')?.value;
    const avatar = document.getElementById('editAvatar')?.value;

    if (name) {
        app.storage.updateProfile({ userName: name, nameSetManually: true });
    }
    if (startDate) {
        const formatted = new Date(startDate).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        app.storage.updateProfile({ coupleDate: formatted, coupleDateRaw: startDate });
        app.storage.updateDaysTogether();
    }
    if (avatar) {
        app.storage.updateProfile({ avatarEmoji: avatar });
    }

    closeAllModals();
    app.updateHeaderUI();
    app.renderProfileContent();
    app.toast.show('Профиль обновлён! 💕');
}

function addBalance() {
    const amount = parseInt(document.getElementById('addBalanceAmount')?.value) || 0;
    if (amount <= 0) {
        app.toast.show('Введите количество! ⭐');
        return;
    }

    const profile = app.storage.getProfile();
    const currentAdmin = profile.adminStars || profile.giftBalance || 0;
    app.storage.updateProfile({
        adminStars: currentAdmin + amount,
        giftBalance: currentAdmin + amount
    });

    closeAllModals();
    app.toast.show(`+${amount} ⭐ добавлено!`);

    if (app.currentPage === 'gifts') app.renderGiftsContent();
}


// ========== ЗАПУСК ==========
document.addEventListener('DOMContentLoaded', () => {
    app = new LoveApp();
    app.init();
    window.app = app;
});