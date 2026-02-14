// js/app.js — v2.2 (все баги исправлены)

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
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    init() {
        try {
            this.storage = new DataStorage();

            const profile = this.storage.getProfile();
            this.isAdmin = profile.isAdmin || false;

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

            this.effects = new Effects();
            this.calendar = new CalendarManager(this.storage, this.isAdmin);
            this.letters = new LettersManager(this.storage, this.isAdmin);
            this.gifts = new GiftsManager(this.storage, this.isAdmin);
            this.photos = new PhotosManager(this.storage, this.isAdmin);
            this.profile = new ProfileManager(this.storage, this.isAdmin);
            this.admin = new AdminPanel(this.storage);

            if (typeof NotificationManager !== 'undefined') {
                this.notifications = new NotificationManager(this.storage);
                this.notifications.init();
            }

            if (typeof ExtraFeatures !== 'undefined') {
                this.features = new ExtraFeatures(this.storage);
            }

            this.nav = new Navigation(this);
            this.nav.init();

            if (this.profile && this.profile.loadSavedTheme) {
                this.profile.loadSavedTheme();
            }

            this.setupUI();
            this.startCountdown();
            this.updateUpcomingEvents();
            this.newCompliment();
            this.updateAdminVisibility();
            this.addHomeExtraCards();
            this.fixTelegramInputs();

            // Принудительно показать главную
            this.forceShowHome();

            // Анимация love meter с задержкой
            setTimeout(() => this.animateLoveMeter(), 800);

            this.handleHashNavigation();

            console.log('Love App v2.2 initialized!');
        } catch (error) {
            console.error('App init error:', error);
        }
    }

    // ========== FIX: Принудительно показать главную ==========
    forceShowHome() {
        const homePage = document.getElementById('page-home');
        if (homePage) {
            homePage.style.display = 'block';
            homePage.style.opacity = '1';
            homePage.style.transform = 'none';

            // Убрать все задержки анимации — показать сразу
            homePage.querySelectorAll('.animate-in, .delay-1, .delay-2, .delay-3, .delay-4, .delay-5, .delay-6').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.style.animation = 'none';
            });
        }
    }

    // ========== FIX: Telegram Desktop input fix ==========
    fixTelegramInputs() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                setTimeout(() => {
                    target.focus();
                    target.click();
                }, 100);
            }
        });

        // Для textarea — предотвратить перехват клавиш Telegram
        document.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
                e.stopPropagation();
            }
        }, true);

        // MutationObserver — фиксить новые input/textarea
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const inputs = node.querySelectorAll ? node.querySelectorAll('input, textarea') : [];
                        inputs.forEach(input => {
                            input.addEventListener('touchstart', () => {
                                setTimeout(() => input.focus(), 100);
                            });
                            input.addEventListener('click', () => {
                                setTimeout(() => input.focus(), 100);
                            });
                        });
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
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
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });

        const page = document.getElementById('page-' + pageId);
        if (page) {
            page.classList.add('active');
            page.style.display = 'block';
            page.style.opacity = '1';
            page.style.transform = 'none';
            this.currentPage = pageId;
            this.nav.setActivePage(pageId);
            this.renderPageContent(pageId);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Показать все элементы на странице
            page.querySelectorAll('.animate-in, .delay-1, .delay-2, .delay-3, .delay-4, .delay-5, .delay-6').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }

        if (this.telegram && this.telegram.isReady) {
            if (pageId === 'home') {
                this.telegram.hideBackButton();
            } else {
                this.telegram.showBackButton();
            }
        }

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

        let avatarContent;
        if (profile.avatarUrl) {
            avatarContent = `<img src="${profile.avatarUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            avatarContent = profile.avatarEmoji || (this.isAdmin ? '🤴' : '👸');
        }

        const sets = {
            headerUserName: `Привет, ${name}!`,
            menuUserName: `${name} ${this.isAdmin ? '👑' : '💕'}`,
            menuUserStatus: this.isAdmin ? 'Администратор' : (profile.userStatus || 'В сети'),
            menuRoleBadge: this.isAdmin ? 'Админ 👑' : 'Принцесса',
            roleSwitchLabel: this.isAdmin ? '👸 Режим Принцессы' : '🔑 Войти как Админ'
        };

        Object.entries(sets).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        });

        ['headerAvatar', 'menuAvatar'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = avatarContent;
        });
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

    // ========== EXTRA CARDS ==========
    addHomeExtraCards() {
        const slider = document.querySelector('.cards-slider');
        if (!slider || slider.querySelector('.extra-card') || !this.features) return;

        slider.insertAdjacentHTML('beforeend', `
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
        `);
    }

    // ========== COUNTDOWN ==========
    startCountdown() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const now = new Date();
        let allUpcoming = [];

        const specialDates = this.storage.getSpecialDates();
        specialDates.forEach(sd => {
            let d = new Date(sd.date);
            let nextDate = new Date(now.getFullYear(), d.getMonth(), d.getDate());
            if (nextDate <= now) nextDate = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
            allUpcoming.push({ name: sd.title, emoji: sd.emoji, date: nextDate });
        });

        const events = this.storage.getEvents();
        events.forEach(e => {
            const d = new Date(e.date);
            if (d > now) {
                const emojis = { date:'💑', holiday:'🎉', birthday:'🎂', anniversary:'💍', surprise:'🎁', trip:'✈️', dinner:'🍽️', other:'⭐' };
                allUpcoming.push({ name: e.title, emoji: emojis[e.type] || '📌', date: d });
            }
        });

        const fixed = [
            { name: 'День рождения', emoji: '🎂', month: 4, day: 2 },
            { name: '8 Марта', emoji: '🌷', month: 2, day: 8 },
            { name: '14 Февраля', emoji: '💝', month: 1, day: 14 },
            { name: 'Новый год', emoji: '🎄', month: 11, day: 31 },
        ];
        fixed.forEach(h => {
            if (!allUpcoming.some(u => u.date.getMonth() === h.month && u.date.getDate() === h.day)) {
                let nd = new Date(now.getFullYear(), h.month, h.day);
                if (nd <= now) nd = new Date(now.getFullYear() + 1, h.month, h.day);
                allUpcoming.push({ name: h.name, emoji: h.emoji, date: nd });
            }
        });

        allUpcoming.sort((a, b) => a.date - b.date);
        const nearest = allUpcoming[0];
        if (!nearest) return;

        const diff = nearest.date - now;
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val).padStart(2, '0'); };
        set('days', Math.floor(diff / 86400000));
        set('hours', Math.floor((diff % 86400000) / 3600000));
        set('minutes', Math.floor((diff % 3600000) / 60000));
        set('seconds', Math.floor((diff % 60000) / 1000));

        const label = document.getElementById('countdownLabel');
        if (label) label.innerHTML = `<span class="event-icon">${nearest.emoji}</span> До "${nearest.name}" <span class="event-icon">${nearest.emoji}</span>`;
    }

    // ========== HOLIDAYS ==========
    switchHoliday(id, el) {
        document.querySelectorAll('.theme-pill').forEach(p => p.classList.remove('active'));
        if (el) el.classList.add('active');
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
                allDates.push({ title: e.title, date: d, emoji: this.getEventEmoji(e.type) });
            }
        });

        specialDates.forEach(sd => {
            let d = new Date(sd.date);
            if (d < now) d = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
            allDates.push({ title: sd.title, date: d, emoji: sd.emoji });
        });

        allDates.sort((a, b) => a.date - b.date);
        allDates = allDates.slice(0, 5);

        if (allDates.length === 0) {
            container.innerHTML = '<div class="no-events"><span class="no-events-emoji">📅</span>Нет предстоящих событий</div>';
            return;
        }

        container.innerHTML = allDates.map(item => {
            const daysLeft = Math.ceil((item.date - now) / 86400000);
            return `<div class="upcoming-event-item" onclick="app.navigateTo('calendar')">
                <div class="uei-emoji">${item.emoji}</div>
                <div class="uei-info"><h4>${item.title}</h4><p>${daysLeft === 0 ? 'Сегодня! 🎉' : `Через ${daysLeft} дн.`}</p></div>
                <div class="uei-date">${item.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
            </div>`;
        }).join('');
    }

    getEventEmoji(type) {
        return { date:'💑', holiday:'🎉', birthday:'🎂', anniversary:'💍', surprise:'🎁', trip:'✈️', dinner:'🍽️', other:'⭐', event:'📌', meeting:'🤝' }[type] || '📌';
    }

    isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    }

    // ========== COMPLIMENTS ==========
    newCompliment() {
        const el = document.getElementById('complimentText');
        if (!el) return;
        const idx = Math.floor(Math.random() * this.compliments.length);
        el.style.opacity = '0';
        setTimeout(() => { el.textContent = this.compliments[idx]; el.style.opacity = '1'; }, 300);
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
                if (current > 100) { current = 100; clearInterval(timer); }
                percent.textContent = current + '%';
            }, 30);
        }, 500);
    }

    // ========== MOOD ==========
    selectMood(btn, message) {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const response = document.getElementById('moodResponse');
        if (response) { response.textContent = message; }
        this.toast.show(message);
    }

    // ========== LETTERS ==========
    renderLettersContent() {
        const letters = this.storage.getLetters();
        const inbox = document.getElementById('lettersInbox');

        if (inbox) {
            if (letters.length === 0) {
                inbox.innerHTML = '<div class="no-events"><span class="no-events-emoji">💌</span>Пока нет писем</div>';
            } else {
                inbox.innerHTML = letters.map(l => this.renderLetterItem(l)).join('');
            }
        }

        const badge = document.getElementById('lettersBadge');
        const unread = letters.filter(l => !l.read).length;
        if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'inline' : 'none'; }
    }

    renderLetterItem(letter) {
        const dateStr = this.getTimeAgo(new Date(letter.date));
        const hasReplies = letter.replies && letter.replies.length > 0;
        return `<div class="letter-item ${letter.read ? '' : 'unread'}" onclick="app.letters.openLetter('${letter.id}')">
            ${!letter.read ? '<div class="letter-unread-dot"></div>' : ''}
            <div class="letter-item-icon">${letter.mood || '💌'}</div>
            <div class="letter-item-info"><h4>${letter.subject || 'Без темы'}</h4><p>${letter.text.substring(0, 60)}...</p></div>
            <div class="letter-item-date">${dateStr}</div>
            ${letter.favorite ? '<div class="letter-item-mood">⭐</div>' : ''}
        </div>`;
    }

    renderSentLetters() {
        const sent = document.getElementById('lettersSent');
        if (!sent) return;
        const letters = this.storage.getLetters().filter(l => this.isAdmin ? l.from === 'admin' : l.from === 'user');
        sent.innerHTML = letters.length === 0
            ? '<div class="no-events"><span class="no-events-emoji">📤</span>Нет отправленных</div>'
            : letters.map(l => this.renderLetterItem(l)).join('');
    }

    closeLetterDetail() { this.letters.closeLetter(); }
    reactToLetter(emoji) { if (this.letters.currentLetter) this.letters.addReaction(this.letters.currentLetter.id, emoji); }
    sendReply() { if (this.letters.currentLetter) this.letters.sendReply(this.letters.currentLetter.id); }

    // ========== PROFILE ==========
    renderProfileContent() {
        const container = document.getElementById('page-profile');
        if (!container || !this.profile || !this.profile.renderProfilePage) return;
        const children = Array.from(container.children);
        children.forEach(child => { if (!child.classList.contains('page-header')) child.remove(); });
        container.insertAdjacentHTML('beforeend', this.profile.renderProfilePage());
    }

    updateProfileUI() {}

    // ========== GALLERY ==========
    renderGalleryContent() {
        const grid = document.getElementById('albumsGrid');
        if (!grid) return;
        const albums = this.storage.getAlbums();
        grid.innerHTML = albums.length === 0
            ? '<div class="no-events" style="grid-column:1/-1;"><span class="no-events-emoji">📸</span>Нет альбомов</div>'
            : albums.map(a => `<div class="album-card" onclick="app.photos.openAlbum('${a.id}')"><div class="album-cover">${a.coverEmoji || '📸'}</div><div class="album-name">${a.name}</div><div class="album-count">${a.photoCount || 0} медиа</div></div>`).join('');
    }

    openAlbum(id) { this.photos.openAlbum(id); }

    closeAlbumView() {
        const o = document.getElementById('albumViewOverlay');
        if (o) { o.remove(); return; }
        const v = document.getElementById('albumPhotosView');
        if (v) v.style.display = 'none';
        const g = document.getElementById('albumsGrid');
        if (g) g.style.display = 'grid';
    }

    // ========== GIFTS ==========
    renderGiftsContent() {
        const gifts = this.storage.getGifts();
        const profile = this.storage.getProfile();
        const balance = this.isAdmin ? (profile.adminStars ?? profile.giftBalance ?? 0) : (profile.userStars ?? 0);

        const balanceEl = document.getElementById('balanceAmount');
        if (balanceEl) balanceEl.textContent = balance;

        const received = document.getElementById('giftsReceived');
        if (received) {
            const myGifts = gifts.filter(g => this.isAdmin ? (g.to === 'admin' || g.from === 'system') : (g.to === 'user' || g.from === 'system'));
            received.innerHTML = myGifts.length === 0
                ? '<div class="no-events"><span class="no-events-emoji">🎁</span>Пока нет подарков</div>'
                : myGifts.map(g => `<div class="gift-item ${!g.opened ? 'gift-receive-anim' : ''}" onclick="app.gifts.openGift('${g.id}')">
                    <div class="gift-item-icon">${g.opened ? g.emoji : '🎁'}</div>
                    <div class="gift-item-info"><h4>${g.opened ? g.name : 'Неоткрытый подарок!'}</h4><p>${g.message || (g.opened ? '' : 'Нажми чтобы открыть!')}</p></div>
                    <div class="gift-item-date">${new Date(g.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
                </div>`).join('');
        }
    }

    // ========== ADMIN ==========
    renderAdminContent() {
        const events = this.storage.getEvents();
        const letters = this.storage.getLetters();
        const gifts = this.storage.getGifts();

        const evList = document.getElementById('adminEventsList');
        if (evList) {
            evList.innerHTML = events.length === 0
                ? '<div class="admin-empty"><span>📅</span>Нет событий</div>'
                : events.map(e => `<div class="admin-list-item"><div class="ali-emoji">${this.getEventEmoji(e.type)}</div><div class="ali-info"><h4>${e.title}</h4><p>${e.date}</p></div><button class="ali-delete" onclick="app.deleteEvent('${e.id}')">🗑️</button></div>`).join('');
        }

        const ltList = document.getElementById('adminLettersList');
        if (ltList) {
            ltList.innerHTML = letters.length === 0
                ? '<div class="admin-empty"><span>💌</span>Нет писем</div>'
                : letters.map(l => `<div class="admin-list-item"><div class="ali-emoji">${l.mood || '💌'}</div><div class="ali-info"><h4>${l.subject || 'Без темы'}</h4><p>${l.read ? 'Прочитано' : 'Не прочитано'}</p></div><button class="ali-delete" onclick="app.deleteLetter('${l.id}')">🗑️</button></div>`).join('');
        }

        const gfList = document.getElementById('adminGiftsList');
        if (gfList) {
            gfList.innerHTML = gifts.length === 0
                ? '<div class="admin-empty"><span>🎁</span>Нет подарков</div>'
                : gifts.map(g => `<div class="admin-list-item"><div class="ali-emoji">${g.emoji}</div><div class="ali-info"><h4>${g.name}</h4><p>${g.opened ? 'Открыт' : 'Не открыт'}</p></div></div>`).join('');
        }
    }

    deleteEvent(id) {
        if (confirm('Удалить?')) { this.storage.deleteEvent(id); this.renderAdminContent(); this.toast.show('Удалено 🗑️'); }
    }

    deleteLetter(id) {
        if (confirm('Удалить?')) { this.storage.deleteLetter(id); this.renderAdminContent(); this.renderLettersContent(); this.toast.show('Удалено 🗑️'); }
    }

    // ========== ROLE SWITCHING ==========
    switchRole() {
        if (!this.isAdmin) {
            const pw = prompt('Пароль админа:');
            if (pw === '1234' || pw === 'love') {
                this.isAdmin = true;
                this.storage.updateProfile({ isAdmin: true });
                this.reinitModules();
                this.toast.show('Админ режим! 👑');
            } else if (pw !== null) {
                this.toast.show('Неверный пароль! 🔒');
            }
        } else {
            this.isAdmin = false;
            this.storage.updateProfile({ isAdmin: false });
            this.reinitModules();
            this.toast.show('Режим принцессы! 👸');
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
                setTimeout(() => toast.classList.remove('show'), duration);
            }
        };
    }

    // ========== MODAL ==========
    openModal(emoji, title, text) {
        const o = document.getElementById('modalOverlay');
        const e = document.getElementById('modalEmoji');
        const t = document.getElementById('modalTitle');
        const p = document.getElementById('modalText');
        if (e) e.textContent = emoji;
        if (t) t.textContent = title;
        if (p) p.textContent = text;
        if (o) o.classList.add('active');
    }

    closeModal() { document.getElementById('modalOverlay')?.classList.remove('active'); }
    closeAllModals() { document.querySelectorAll('.modal-overlay').forEach(o => o.classList.remove('active')); }

    onCenterButtonClick() {
        this.effects.launchConfetti();
        this.openModal('💝', 'Я тебя люблю!', 'Ты лучшее в моей жизни! 💕✨');
    }

    // ========== SHORTCUTS ==========
    openAddEventModal() { this.admin.openEventCreator(); }
    openWriteLetterModal() { this.letters.openCompose(); }
    openAddAlbumModal() { this.photos.createAlbum(); }
    openSendGiftModal() { this.gifts.openGiftShop(); }
    openAddPhotoModal() { this.photos.openUpload(); }
    openAddBalanceModal() { this.admin.editBalance(); }
    openEditProfileModal() { this.profile.editName(); }
    changeMonth(d) { this.calendar.changeMonth(d); }

    switchCalTab(tab, el) {
        document.querySelectorAll('.cal-tab').forEach(t => t.classList.remove('active'));
        if (el) el.classList.add('active');
        document.querySelectorAll('.cal-view').forEach(v => v.classList.remove('active'));
        const view = document.getElementById('calView-' + tab);
        if (view) view.classList.add('active');
        if (tab === 'events') this.calendar.renderEventsList();
        if (tab === 'special') this.calendar.renderSpecialDates();
    }

    closeDayDetails() { const d = document.getElementById('dayDetails'); if (d) d.style.display = 'none'; }

    switchLetterTab(tab, el) {
        document.querySelectorAll('.letter-tab').forEach(t => t.classList.remove('active'));
        if (el) el.classList.add('active');
        const inbox = document.getElementById('lettersInbox');
        const sent = document.getElementById('lettersSent');
        if (tab === 'inbox') { if (inbox) inbox.style.display = 'flex'; if (sent) sent.style.display = 'none'; }
        else { if (inbox) inbox.style.display = 'none'; if (sent) { sent.style.display = 'flex'; this.renderSentLetters(); } }
    }

    switchGiftTab(tab, el) {
        document.querySelectorAll('.gift-tab').forEach(t => t.classList.remove('active'));
        if (el) el.classList.add('active');
        const r = document.getElementById('giftsReceived');
        const s = document.getElementById('giftsSent');
        if (tab === 'received') { if (r) r.style.display = 'flex'; if (s) s.style.display = 'none'; }
        else { if (r) r.style.display = 'none'; if (s) s.style.display = 'flex'; }
    }

    openNotifications() {
        if (this.notifications) this.notifications.openNotificationCenter();
        else this.toast.show('Загружается...');
    }

    getTimeAgo(date) {
        const diff = new Date() - date;
        const m = Math.floor(diff / 60000);
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(diff / 86400000);
        if (m < 1) return 'сейчас';
        if (m < 60) return `${m} мин`;
        if (h < 24) return `${h} ч`;
        if (d < 7) return `${d} дн`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }

    showToast(t) { this.toast.show(t); }
    launchConfetti() { this.effects.launchConfetti(); }
}

// ========== GLOBALS ==========
let app;
function navigateTo(p) { app.navigateTo(p); }
function toggleMenu() { app.nav.toggleMenu(); }
function openModal(e, t, p) { app.openModal(e, t, p); }
function closeModal() { app.closeModal(); }
function closeAllModals() { app.closeAllModals(); }
function showToast(t) { app.toast.show(t); }
function launchConfetti() { app.launchConfetti(); }
function switchHoliday(id, el) { app.switchHoliday(id, el); }
function newCompliment() { app.newCompliment(); }
function selectMood(b, m) { app.selectMood(b, m); }
function switchRole() { app.switchRole(); }
function changeMonth(d) { app.changeMonth(d); }
function switchCalTab(t, e) { app.switchCalTab(t, e); }
function closeDayDetails() { app.closeDayDetails(); }
function switchLetterTab(t, e) { app.switchLetterTab(t, e); }
function closeLetterDetail() { app.closeLetterDetail(); }
function reactToLetter(e) { app.reactToLetter(e); }
function sendReply() { app.sendReply(); }
function switchGiftTab(t, e) { app.switchGiftTab(t, e); }
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
    const i = document.getElementById('eventEmoji'); if (i) i.value = emoji;
}
function saveEvent() {
    const t = document.getElementById('eventTitle')?.value?.trim();
    const d = document.getElementById('eventDate')?.value;
    if (!t || !d) { app.toast.show('Заполните поля! 📝'); return; }
    app.storage.addEvent({ id: 'event_' + Date.now(), title: t, date: d, type: document.getElementById('eventType')?.value || 'event', description: document.getElementById('eventDesc')?.value?.trim() || '', emoji: document.getElementById('eventEmoji')?.value || '💕', repeat: 'none', reminder: 'none' });
    closeAllModals(); app.toast.show('Добавлено! 🎉'); app.effects.launchConfetti(30);
    if (app.currentPage === 'calendar') app.calendar.renderCalendar();
    if (app.currentPage === 'admin') app.renderAdminContent();
    if (app.currentPage === 'home') app.updateUpcomingEvents();
}
function pickLetterMood(m) {
    document.querySelectorAll('#writeLetterModal .ep-item').forEach(e => e.classList.remove('selected'));
    if (event && event.target) event.target.classList.add('selected');
    const i = document.getElementById('letterMood'); if (i) i.value = m;
}
function sendLetter() {
    const b = document.getElementById('letterBody')?.value?.trim();
    if (!b) { app.toast.show('Напишите текст! ✍️'); return; }
    app.storage.addLetter({ id: 'letter_' + Date.now(), from: 'admin', subject: document.getElementById('letterTitle')?.value?.trim() || 'Письмо любви', text: b, mood: document.getElementById('letterMood')?.value || '💕', date: new Date().toISOString(), read: false, favorite: false, reactions: [], replies: [] });
    closeAllModals(); app.effects.launchConfetti(); app.toast.show('Отправлено! 💌');
    if (app.currentPage === 'letters') app.renderLettersContent();
    if (app.currentPage === 'admin') app.renderAdminContent();
}
function selectGiftType(t, el) {
    document.querySelectorAll('.gift-type-card').forEach(c => c.classList.remove('selected'));
    if (el) el.classList.add('selected');
    const i = document.getElementById('giftType'); if (i) i.value = t;
    const a = document.getElementById('giftAmountGroup'); if (a) a.style.display = (t === 'stars' || t === 'money') ? 'block' : 'none';
}
function sendGift() {
    const t = document.getElementById('giftType')?.value;
    if (!t) { app.toast.show('Выберите подарок! 🎁'); return; }
    const msg = document.getElementById('giftMessage')?.value?.trim() || '';
    const amt = document.getElementById('giftAmount')?.value || 0;
    const emojis = { stars:'⭐', flowers:'💐', ring:'💍', chocolate:'🍫', bear:'🧸', money:'💰', heart:'💝', crown:'👑' };
    const names = { stars:`${amt} звёзд`, flowers:'Букет', ring:'Кольцо', chocolate:'Шоколад', bear:'Мишка', money:`${amt} руб`, heart:'Сердечко', crown:'Корона' };
    if (t === 'stars' && parseInt(amt) > 0) { const p = app.storage.getProfile(); app.storage.updateProfile({ userStars: (p.userStars || 0) + parseInt(amt) }); }
    app.storage.addGift({ id: 'gift_' + Date.now(), giftId: t, emoji: emojis[t] || '🎁', name: names[t] || 'Подарок', message: msg, from: 'admin', to: 'user', date: new Date().toISOString(), opened: false });
    closeAllModals(); app.effects.launchConfetti(80); app.toast.show('Подарок отправлен! 🎉');
    if (app.currentPage === 'gifts') app.renderGiftsContent();
    if (app.currentPage === 'admin') app.renderAdminContent();
}
function pickAlbumCover(e) {
    document.querySelectorAll('#addAlbumModal .ep-item').forEach(i => i.classList.remove('selected'));
    if (event && event.target) event.target.classList.add('selected');
    const i = document.getElementById('albumCover'); if (i) i.value = e;
}
function saveAlbum() {
    const t = document.getElementById('albumTitle')?.value?.trim();
    if (!t) { app.toast.show('Введите название! 📝'); return; }
    app.storage.addAlbum({ id: 'album_' + Date.now(), name: t, coverEmoji: document.getElementById('albumCover')?.value || '📸', photoCount: 0, createdAt: new Date().toISOString() });
    closeAllModals(); app.toast.show('Альбом создан! 📸');
    if (app.currentPage === 'gallery') app.renderGalleryContent();
}
function pickPhotoEmoji(e) {
    document.querySelectorAll('#addPhotoModal .ep-item').forEach(i => i.classList.remove('selected'));
    if (event && event.target) event.target.classList.add('selected');
    const i = document.getElementById('photoEmoji'); if (i) i.value = e;
}
function savePhoto() {
    app.storage.addPhoto({ id: 'photo_' + Date.now(), emoji: document.getElementById('photoEmoji')?.value || '📸', caption: document.getElementById('photoCaption')?.value?.trim() || '', albumId: app._currentAlbumId || '', date: new Date().toISOString(), isNew: true, files: [] });
    if (app._currentAlbumId) app.storage.incrementAlbumCount(app._currentAlbumId);
    closeAllModals(); app.toast.show('Добавлено! 📸');
}
function pickProfileAvatar(e) {
    document.querySelectorAll('#editProfileModal .ep-item').forEach(i => i.classList.remove('selected'));
    if (event && event.target) event.target.classList.add('selected');
    const i = document.getElementById('editAvatar'); if (i) i.value = e;
}
function saveProfile() {
    const n = document.getElementById('editName')?.value?.trim();
    const d = document.getElementById('editStartDate')?.value;
    const a = document.getElementById('editAvatar')?.value;
    if (n) app.storage.updateProfile({ userName: n, nameSetManually: true });
    if (d) { app.storage.updateProfile({ coupleDate: new Date(d).toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' }), coupleDateRaw: d }); app.storage.updateDaysTogether(); }
    if (a) app.storage.updateProfile({ avatarEmoji: a });
    closeAllModals(); app.updateHeaderUI(); app.renderProfileContent(); app.toast.show('Обновлено! 💕');
}
function addBalance() {
    const a = parseInt(document.getElementById('addBalanceAmount')?.value) || 0;
    if (a <= 0) { app.toast.show('Введите количество! ⭐'); return; }
    const p = app.storage.getProfile();
    app.storage.updateProfile({ adminStars: (p.adminStars || p.giftBalance || 0) + a, giftBalance: (p.adminStars || p.giftBalance || 0) + a });
    closeAllModals(); app.toast.show(`+${a} ⭐!`);
    if (app.currentPage === 'gifts') app.renderGiftsContent();
}

document.addEventListener('DOMContentLoaded', () => {
    app = new LoveApp();
    app.init();
    window.app = app;
});