// js/app.js — v5.0 (фиксы, вишлист, games, викторина)

class LoveApp {
    constructor() {
        this.isAdmin = false;
        this.isUser = false;
        this.isGuest = true;
        this.role = 'guest';
        this.currentPage = 'home';
        this.fabOpen = false;
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
        this.wishlistManager = null;

        this.compliments = [
            'Ты освещаешь мой мир ярче тысячи звёзд ⭐',
            'Твоя улыбка — лучшее лекарство 😊',
            'Каждый день с тобой — подарок 🎁',
            'Ты самая красивая во вселенной 💫',
            'Ты делаешь мою жизнь волшебной ✨',
            'Я влюбляюсь в тебя каждый день 💗',
            'Рядом с тобой я счастлив 🥰',
            'Ты прекрасна как рассвет 🌅',
            'С тобой хочется жить вечно 💕'
        ];
    }

    // ========== ЗАГРУЗКА ==========
    updateLoader(percent, text) {
        const fill = document.getElementById('loaderFill');
        const txt = document.getElementById('loaderText');
        if (fill) fill.style.width = percent + '%';
        if (txt) txt.textContent = text || '';
    }

    async init() {
        try {
            this.updateLoader(10, 'Инициализация...');

            this.storage = new DataStorage();

            this.updateLoader(20, 'Telegram...');

            this.tgUserId = 0;
            if (typeof TelegramIntegration !== 'undefined') {
                this.telegram = new TelegramIntegration();
                const tgReady = this.telegram.init();
                if (tgReady) {
                    this.tgUserId = this.telegram.getUserId() || 0;
                    const tgName = this.telegram.getUserName();
                    const profile = this.storage.getProfile();
                    if (tgName && !profile.nameSetManually) {
                        this.storage.updateProfile({ userName: tgName });
                    }
                }
            }

            this.updateLoader(30, 'Определяем роль...');
            await this.detectRole();

            this.updateLoader(40, 'Компоненты...');

            this.effects = new Effects();
            this.calendar = new CalendarManager(this.storage, this.isAdmin);
            this.letters = new LettersManager(this.storage, this.isAdmin);
            this.gifts = new GiftsManager(this.storage, this.isAdmin);
            this.photos = new PhotosManager(this.storage, this.isAdmin);
            this.profile = new ProfileManager(this.storage, this.isAdmin);
            this.admin = new AdminPanel(this.storage);

            this.updateLoader(60, 'Уведомления...');

            if (typeof NotificationManager !== 'undefined') {
                this.notifications = new NotificationManager(this.storage);
                this.notifications.init();
            }

            if (typeof ExtraFeatures !== 'undefined') {
                this.features = new ExtraFeatures(this.storage);
            }

            if (typeof WishlistManager !== 'undefined') {
                this.wishlistManager = new WishlistManager(this.storage);
            }

            this.updateLoader(75, 'Интерфейс...');

            this.nav = new Navigation(this);
            this.nav.init();

            if (this.profile?.loadSavedTheme) this.profile.loadSavedTheme();

            const customC = this.storage.get('customCompliments') || [];
            if (customC.length > 0) this.compliments.push(...customC);

            this.setupUI();
            this.startCountdown();
            this.updateUpcomingEvents();
            this.newCompliment();
            this.updateAdminVisibility();
            this.setupParallax();
            this.fixTelegramInputs();
            this.applyRoleRestrictions();

            this.updateLoader(90, 'Почти готово...');

            this.forceShowHome();

            this.updateLoader(100, 'Готово! 💕');

            setTimeout(() => this.hideSplash(), 500);
            setTimeout(() => this.animateLoveMeter(), 1200);

            this.handleHashNavigation();
            console.log(`Love App v5.0 | Role: ${this.role}`);
        } catch (error) {
            console.error('Init error:', error);
            this.hideSplash();
        }
    }

    // ========== HASH NAVIGATION ==========
    handleHashNavigation() {
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById('page-' + hash)) {
            setTimeout(() => this.navigateTo(hash), 300);
        }
        window.addEventListener('hashchange', () => {
            const h = window.location.hash.replace('#', '');
            if (h && document.getElementById('page-' + h)) {
                this.navigateTo(h);
            }
        });
    }

    hideSplash() {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s ease';
            setTimeout(() => splash.style.display = 'none', 500);
        }
    }

    // ========== ROLE ==========
    async detectRole() {
        try {
            const resp = await fetch(`/api/role?tgId=${this.tgUserId}`);
            if (resp.ok) {
                const data = await resp.json();
                this.role = data.role;
            } else {
                this.role = 'guest';
            }
        } catch (e) {
            const profile = this.storage.getProfile();
            this.role = profile.isAdmin ? 'admin' : (profile.role || 'guest');
        }

        this.isAdmin = (this.role === 'admin');
        this.isUser = (this.role === 'user');
        this.isGuest = (this.role === 'guest');

        this.storage.updateProfile({ role: this.role, isAdmin: this.isAdmin });
    }

    applyRoleRestrictions() {
        if (this.isGuest) {
            document.getElementById('headerUserName').textContent = 'Гость 👀';
            document.getElementById('menuUserName').textContent = 'Гость 👀';
            document.getElementById('menuUserStatus').textContent = 'Режим просмотра';
            document.getElementById('menuRoleBadge').textContent = 'Гость';

            // Скрыть кнопки редактирования
            document.querySelectorAll('.page-header-action').forEach(el => el.style.display = 'none');

            // Скрыть FAB
            const fab = document.getElementById('fabCenter');
            if (fab) fab.style.display = 'none';
            
            // Скрыть кнопку добавления вишлиста
            const wishBtn = document.getElementById('wishlistAddBtn');
            if (wishBtn) wishBtn.style.display = 'none';
        }

        // Скрыть переключатель ролей для гостя
        const roleSwitcher = document.getElementById('roleSwitcher');
        if (roleSwitcher) {
            roleSwitcher.style.display = this.isGuest ? 'none' : 'block';
        }
    }

    // ========== PARALLAX ==========
    setupParallax() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    document.querySelectorAll('.parallax-layer').forEach(layer => {
                        const speed = parseFloat(layer.dataset.speed) || 0.3;
                        layer.style.transform = `translateY(${scrollY * speed}px)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ========== FAB ==========
    toggleFab() {
        this.fabOpen = !this.fabOpen;
        const btn = document.getElementById('fabBtn');
        const backdrop = document.getElementById('fabBackdrop');
        const items = document.querySelectorAll('.fab-item');

        btn?.classList.toggle('open', this.fabOpen);
        backdrop?.classList.toggle('show', this.fabOpen);
        items.forEach(item => item.classList.toggle('show', this.fabOpen));

        if (this.fabOpen && this.effects) {
            this.effects.launchHeartBurst(window.innerWidth / 2, window.innerHeight - 60);
        }
    }

    closeFab() {
        if (this.fabOpen) this.toggleFab();
    }

    forceShowHome() {
        const homePage = document.getElementById('page-home');
        if (homePage) {
            homePage.style.display = 'block';
            homePage.style.opacity = '1';
            homePage.style.transform = 'none';
        }
    }

    fixTelegramInputs() {
        const handleFocusIn = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                document.body.classList.add('keyboard-open');
                setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        };
        const handleFocusOut = () => {
            setTimeout(() => document.body.classList.remove('keyboard-open'), 150);
        };
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);

        document.addEventListener('keydown', e => {
            const a = document.activeElement;
            if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) {
                e.stopPropagation();
            }
        }, true);

        if (window.visualViewport) {
            let initialHeight = window.visualViewport.height;
            window.visualViewport.addEventListener('resize', () => {
                const isKeyboard = window.visualViewport.height < initialHeight * 0.75;
                document.body.classList.toggle('keyboard-open', isKeyboard);
            });
        }

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) e.preventDefault();
            lastTouchEnd = now;
        }, { passive: false });

        document.addEventListener('click', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                setTimeout(() => e.target.focus(), 50);
            }
        });
    }

    // ========== НАВИГАЦИЯ ==========
    navigateTo(pageId) {
        this.closeFab();

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
            this.nav?.setActivePage(pageId);
            this.renderPageContent(pageId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (this.telegram?.isReady) {
            pageId === 'home' ? this.telegram.hideBackButton() : this.telegram.showBackButton();
        }

        if (this.nav?.menuOpen) this.nav.toggleMenu();

        // Hash
        if (pageId !== 'home') {
            history.replaceState(null, '', '#' + pageId);
        } else {
            history.replaceState(null, '', window.location.pathname);
        }
    }

    renderPageContent(pageId) {
        const map = {
            home: () => { this.updateUpcomingEvents(); this.animateLoveMeter(); },
            calendar: () => { this.calendar?.renderCalendar(); this.showIf('calAddBtn'); },
            letters: () => { this.renderLettersContent(); this.showIf('letterAddBtn'); },
            profile: () => this.renderProfileContent(),
            gallery: () => { this.renderGalleryContent(); this.showIf('galleryAddBtn'); },
            gifts: () => { this.renderGiftsContent(); this.showIf('giftAddBtn'); },
            admin: () => this.admin?.renderFullAdmin(),
            games: () => this.renderGamesContent(),
            wishlist: () => this.wishlistManager?.renderWishlistPage(),
        };
        (map[pageId] || (() => {}))();
    }

    showIf(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = this.isAdmin ? 'flex' : 'none';
    }

    // ========== GAMES PAGE ==========
    renderGamesContent() {
        const container = document.getElementById('gamesContent');
        if (!container) return;

        container.innerHTML = `
            <div class="games-grid">
                <div class="game-card" onclick="app.features.openLuckyWheel()">
                    <span class="game-card-emoji">🎰</span>
                    <div class="game-card-title">Колесо удачи</div>
                    <div class="game-card-desc">Крути каждый день!</div>
                </div>
                <div class="game-card" onclick="app.features.openQuiz()">
                    <span class="game-card-emoji">🧠</span>
                    <div class="game-card-title">Викторина</div>
                    <div class="game-card-desc">Проверь знания!</div>
                </div>
                <div class="game-card" onclick="app.features.openGoals()">
                    <span class="game-card-emoji">🎯</span>
                    <div class="game-card-title">Наши цели</div>
                    <div class="game-card-desc">Совместные мечты</div>
                </div>
                <div class="game-card" onclick="app.features.openPlaylist()">
                    <span class="game-card-emoji">🎵</span>
                    <div class="game-card-title">Плейлист</div>
                    <div class="game-card-desc">Наши песни</div>
                </div>
                <div class="game-card" onclick="app.features.openAnalytics()">
                    <span class="game-card-emoji">📊</span>
                    <div class="game-card-title">Аналитика</div>
                    <div class="game-card-desc">Статистика любви</div>
                </div>
                <div class="game-card" onclick="app.features.openQuickNotes()">
                    <span class="game-card-emoji">📌</span>
                    <div class="game-card-title">Записки</div>
                    <div class="game-card-desc">Быстрые заметки</div>
                </div>
            </div>
        `;
    }

    // ========== WISHLIST (модальный - старый, оставляем для совместимости) ==========
    openWishlist() {
        this.navigateTo('wishlist');
    }

    // ========== UI SETUP ==========
    setupUI() {
        this.updateHeaderUI();
        this.nav?.updateBadges();
        if (this.notifications) this.notifications.updateNotificationBadge();
    }

    updateHeaderUI() {
        const profile = this.storage.getProfile();
        const name = this.isAdmin ? (profile.adminName || 'Любимый') : (profile.userName || 'Любимая');
        let avatar = profile.avatarUrl
            ? `<img src="${profile.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
            : (profile.avatarEmoji || (this.isAdmin ? '🤴' : '👸'));

        const sets = {
            headerUserName: `Привет, ${name}!`,
            menuUserName: `${name} ${this.isAdmin ? '👑' : '💕'}`,
            menuUserStatus: this.isAdmin ? 'Администратор' : (profile.userStatus || 'В сети'),
            menuRoleBadge: this.isAdmin ? 'Админ 👑' : (this.isUser ? 'Принцесса' : 'Гость'),
            roleSwitchLabel: this.isAdmin ? '👸 Режим Принцессы' : '🔑 Войти как Админ'
        };
        Object.entries(sets).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        });
        ['headerAvatar', 'menuAvatar'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = avatar;
        });
    }

    updateAdminVisibility() {
        ['adminMenuBtn', 'calAddBtn', 'letterAddBtn', 'galleryAddBtn', 'giftAddBtn', 'giftSentTab', 'balanceAddBtn'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = this.isAdmin ? 'flex' : 'none';
        });
    }

    // ========== COUNTDOWN ==========
    startCountdown() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const now = new Date();
        let upcoming = [];

        this.storage.getSpecialDates().forEach(sd => {
            let d = new Date(sd.date);
            let next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
            if (next <= now) next = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
            upcoming.push({ name: sd.title, emoji: sd.emoji, date: next });
        });

        this.storage.getEvents().forEach(e => {
            const d = new Date(e.date);
            if (d > now) upcoming.push({ name: e.title, emoji: this.getEventEmoji(e.type), date: d });
        });

        [
            { name: '14 Февраля', emoji: '💝', m: 1, d: 14 },
            { name: '8 Марта', emoji: '🌷', m: 2, d: 8 },
            { name: 'Новый год', emoji: '🎄', m: 11, d: 31 },
        ].forEach(h => {
            let nd = new Date(now.getFullYear(), h.m, h.d);
            if (nd <= now) nd = new Date(now.getFullYear() + 1, h.m, h.d);
            if (!upcoming.some(u => u.date.getMonth() === h.m && u.date.getDate() === h.d))
                upcoming.push({ name: h.name, emoji: h.emoji, date: nd });
        });

        upcoming.sort((a, b) => a.date - b.date);
        const n = upcoming[0];
        if (!n) return;

        const diff = n.date - now;
        const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, '0'); };
        s('days', Math.floor(diff / 86400000));
        s('hours', Math.floor((diff % 86400000) / 3600000));
        s('minutes', Math.floor((diff % 3600000) / 60000));
        s('seconds', Math.floor((diff % 60000) / 1000));

        const label = document.getElementById('countdownLabel');
        if (label) label.innerHTML = `${n.emoji} До "${n.name}" ${n.emoji}`;
    }

    updateUpcomingEvents() {
        const container = document.getElementById('upcomingEvents');
        if (!container) return;
        const now = new Date();
        let items = [];

        this.storage.getEvents().forEach(e => {
            const d = new Date(e.date);
            if (d >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
                items.push({ title: e.title, date: d, emoji: this.getEventEmoji(e.type) });
        });

        this.storage.getSpecialDates().forEach(sd => {
            let d = new Date(sd.date);
            if (d < now) d = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
            items.push({ title: sd.title, date: d, emoji: sd.emoji });
        });

        items.sort((a, b) => a.date - b.date);
        items = items.slice(0, 4);

        container.innerHTML = items.length === 0
            ? '<div class="no-events" style="text-align:center;padding:20px;font-size:13px;color:var(--text-light)">📅 Нет событий</div>'
            : items.map(i => {
                const dl = Math.ceil((i.date - now) / 86400000);
                return `<div class="upcoming-event-item" onclick="app.navigateTo('calendar')">
                    <div class="uei-emoji">${i.emoji}</div>
                    <div class="uei-info"><h4>${i.title}</h4><p>${dl <= 0 ? 'Сегодня! 🎉' : `Через ${dl} дн.`}</p></div>
                    <div class="uei-date">${i.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
                </div>`;
            }).join('');
    }

    getEventEmoji(t) {
        return { date: '💑', holiday: '🎉', birthday: '🎂', anniversary: '💍', surprise: '🎁', trip: '✈️', dinner: '🍽️', other: '⭐', event: '📌', meeting: '🤝' }[t] || '📌';
    }

    newCompliment() {
        const el = document.getElementById('complimentText');
        if (!el) return;
        el.style.opacity = '0';
        setTimeout(() => {
            el.textContent = this.compliments[Math.floor(Math.random() * this.compliments.length)];
            el.style.opacity = '1';
        }, 300);
    }

    animateLoveMeter() {
        const fill = document.getElementById('meterFill');
        const pct = document.getElementById('meterPercent');
        if (!fill || !pct) return;
        setTimeout(() => {
            fill.style.width = '100%';
            let c = 0;
            const t = setInterval(() => { c += 2; if (c > 100) { c = 100; clearInterval(t); } pct.textContent = c + '%'; }, 30);
        }, 500);
    }

    selectMood(btn, msg) {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const r = document.getElementById('moodResponse');
        if (r) r.textContent = msg;
        this.showToast(msg);
    }

    // ========== LETTERS ==========
    renderLettersContent() {
        const letters = this.storage.getLetters();
        const inbox = document.getElementById('lettersInbox');
        if (inbox) {
            inbox.innerHTML = letters.length === 0
                ? '<div style="text-align:center;padding:30px;color:var(--text-light)">💌 Пока нет писем</div>'
                : letters.map(l => this.letters.renderLetterItem(l)).join('');
        }
    }

    renderSentLetters() {
        const sent = document.getElementById('lettersSent');
        if (!sent) return;
        const letters = this.storage.getLetters().filter(l => l.from === (this.isAdmin ? 'admin' : 'user'));
        sent.innerHTML = letters.length === 0
            ? '<div style="text-align:center;padding:30px;color:var(--text-light)">📤 Нет отправленных</div>'
            : letters.map(l => this.letters.renderLetterItem(l)).join('');
    }

    closeLetterDetail() { this.letters?.closeLetter(); }
    reactToLetter(e) { if (this.letters?.currentLetter) this.letters.addReaction(this.letters.currentLetter.id, e); }
    sendReply() { if (this.letters?.currentLetter) this.letters.sendReply(this.letters.currentLetter.id); }

    renderProfileContent() {
        const c = document.getElementById('page-profile');
        if (!c || !this.profile?.renderProfilePage) return;
        Array.from(c.children).forEach(ch => { if (!ch.classList.contains('page-header')) ch.remove(); });
        c.insertAdjacentHTML('beforeend', this.profile.renderProfilePage());
    }

    renderGalleryContent() {
        const grid = document.getElementById('albumsGrid');
        if (!grid) return;
        const albums = this.storage.getAlbums();
        grid.innerHTML = albums.length === 0
            ? '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-light)">📸 Нет альбомов</div>'
            : albums.map(a => `<div class="album-card" onclick="app.photos.openAlbum('${a.id}')"><div class="album-cover">${a.coverEmoji || '📸'}</div><div class="album-name">${a.name}</div><div class="album-count">${a.photoCount || 0}</div></div>`).join('');
    }

    closeAlbumView() { document.getElementById('albumViewOverlay')?.remove(); }

    deleteAdminEvent(eventId) {
        this.showConfirmModal('Удалить событие?', () => {
            this.storage.deleteEvent(eventId);
            this.showToast('Событие удалено 🗑️');
            if (this.currentPage === 'admin') this.admin?.renderFullAdmin();
            if (this.currentPage === 'calendar') this.calendar?.renderCalendar();
            this.updateUpcomingEvents();
        });
    }

    deleteAdminLetter(letterId) {
        this.showConfirmModal('Удалить письмо?', () => {
            this.storage.deleteLetter(letterId);
            this.showToast('Письмо удалено 🗑️');
            if (this.currentPage === 'admin') this.admin?.renderFullAdmin();
            if (this.currentPage === 'letters') this.renderLettersContent();
            this.nav?.updateBadges();
        });
    }

    renderGiftsContent() {
        const profile = this.storage.getProfile();
        const balance = this.isAdmin ? (profile.adminStars ?? 100) : (profile.userStars ?? 0);
        const el = document.getElementById('balanceAmount');
        if (el) el.textContent = balance;

        const gifts = this.storage.getGifts();
        const received = document.getElementById('giftsReceived');
        if (received) {
            const my = gifts.filter(g => this.isAdmin ? (g.to === 'admin' || g.from === 'system') : (g.to === 'user' || g.from === 'system'));
            received.innerHTML = my.length === 0
                ? '<div style="text-align:center;padding:30px;color:var(--text-light)">🎁 Нет подарков</div>'
                : my.map(g => `<div class="gift-item" onclick="app.gifts.openGift('${g.id}')">
                    <div class="gift-item-icon"><span style="font-size:26px">${g.opened ? g.emoji : '🎁'}</span></div>
                    <div class="gift-item-info"><h4>${g.opened ? g.name : 'Подарок!'}</h4><p>${g.message || (g.opened ? '' : 'Нажми!')}</p></div>
                    <div class="gift-item-date">${new Date(g.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
                </div>`).join('');
        }
    }

    // ========== CONFIRM / PROMPT ==========
    showConfirmModal(msg, onYes) {
        document.getElementById('confirmModalOverlay')?.remove();
        const html = `<div class="admin-modal-overlay active" id="confirmModalOverlay">
            <div class="admin-modal small"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('confirmModalOverlay').remove()">✕</button>
                <h2>🤔</h2></div>
            <div class="admin-modal-body" style="text-align:center">
                <p style="font-size:14px;color:var(--text-light);margin-bottom:16px">${msg}</p>
                <div style="display:flex;gap:10px">
                    <button class="gift-cancel-btn" style="flex:1" onclick="document.getElementById('confirmModalOverlay').remove()">Отмена</button>
                    <button class="admin-submit-btn" style="flex:1;background:#EF5350" id="confirmYesBtn">Да</button>
                </div>
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('confirmYesBtn').onclick = () => { document.getElementById('confirmModalOverlay').remove(); onYes(); };
    }

    showPasswordModal(onSubmit) {
        document.getElementById('pwModal')?.remove();
        const html = `<div class="admin-modal-overlay active" id="pwModal">
            <div class="admin-modal small"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('pwModal').remove()">✕</button>
                <h2>🔑 Пароль</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><input type="password" class="admin-input" id="pwInput" placeholder="Пароль..."></div>
                <button class="admin-submit-btn" id="pwSubmit">🔓 Войти</button>
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('pwInput')?.focus();
        document.getElementById('pwSubmit').onclick = () => {
            const pw = document.getElementById('pwInput')?.value;
            document.getElementById('pwModal').remove();
            onSubmit(pw);
        };
    }

    switchRole() {
        if (this.isGuest) {
            this.showToast('Гостям нельзя менять роль 🔒');
            return;
        }

        if (!this.isAdmin) {
            this.showPasswordModal(pw => {
                if (pw === '1234' || pw === 'love') {
                    this.isAdmin = true;
                    this.isUser = false;
                    this.role = 'admin';
                    this.storage.updateProfile({ isAdmin: true, role: 'admin' });
                    this.reinitModules();
                    this.showToast('Админ режим! 👑');
                } else if (pw) {
                    this.showToast('Неверный пароль! 🔒');
                }
            });
        } else {
            this.isAdmin = false;
            this.isUser = true;
            this.role = 'user';
            this.storage.updateProfile({ isAdmin: false, role: 'user' });
            this.reinitModules();
            this.showToast('Режим пользователя! 👸');
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
        this.applyRoleRestrictions();
        this.navigateTo('home');
    }

    showToast(text, dur = 3000) {
        const t = document.getElementById('toast');
        const tx = document.getElementById('toastText');
        if (!t || !tx) return;
        tx.textContent = text;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), dur);
    }

    get toast() { return { show: (t, d) => this.showToast(t, d) }; }

    openModal(emoji, title, text) {
        const o = document.getElementById('modalOverlay');
        document.getElementById('modalEmoji').textContent = emoji;
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalText').textContent = text;
        o?.classList.add('active');
    }

    closeModal() { document.getElementById('modalOverlay')?.classList.remove('active'); }
    closeAllModals() { document.querySelectorAll('.modal-overlay').forEach(o => o.classList.remove('active')); }

    openNotifications() {
        if (this.notifications) this.notifications.openNotificationCenter();
    }

    // Shortcuts
    changeMonth(d) { this.calendar?.changeMonth(d); }
    switchCalTab(t, el) {
        document.querySelectorAll('.cal-tab').forEach(t => t.classList.remove('active'));
        el?.classList.add('active');
        document.querySelectorAll('.cal-view').forEach(v => v.classList.remove('active'));
        document.getElementById('calView-' + t)?.classList.add('active');
        if (t === 'events') this.calendar?.renderEventsList();
        if (t === 'special') this.calendar?.renderSpecialDates();
    }
    closeDayDetails() { const d = document.getElementById('dayDetails'); if (d) d.style.display = 'none'; }
    switchLetterTab(t, el) {
        document.querySelectorAll('.letter-tab').forEach(t => t.classList.remove('active'));
        el?.classList.add('active');
        document.getElementById('lettersInbox').style.display = t === 'inbox' ? 'flex' : 'none';
        const sent = document.getElementById('lettersSent');
        if (t === 'sent') { sent.style.display = 'flex'; this.renderSentLetters(); }
        else sent.style.display = 'none';
    }
    switchGiftTab(t, el) {
        document.querySelectorAll('.gift-tab').forEach(t => t.classList.remove('active'));
        el?.classList.add('active');
        document.getElementById('giftsReceived').style.display = t === 'received' ? 'flex' : 'none';
        document.getElementById('giftsSent').style.display = t === 'sent' ? 'flex' : 'none';
    }

    getTimeAgo(d) {
        const diff = new Date() - d, m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), dy = Math.floor(diff / 86400000);
        if (m < 1) return 'сейчас'; if (m < 60) return m + ' мин'; if (h < 24) return h + ' ч'; if (dy < 7) return dy + ' дн';
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }

    launchConfetti() { this.effects?.launchConfetti(); }
}

// Globals
let app;
function navigateTo(p) { app.navigateTo(p); }
function toggleMenu() { app.nav.toggleMenu(); }
function openModal(e, t, p) { app.openModal(e, t, p); }
function closeModal() { app.closeModal(); }
function closeAllModals() { app.closeAllModals(); }
function showToast(t) { app.showToast(t); }
function launchConfetti() { app.launchConfetti(); }
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
function closeAlbumView() { app.closeAlbumView(); }
function openNotifications() { app.openNotifications(); }

document.addEventListener('DOMContentLoaded', () => {
    app = new LoveApp();
    app.init();
    window.app = app;
});