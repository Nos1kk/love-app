// js/storage.js — Хранилище с серверной синхронизацией

class DataStorage {
    constructor() {
        this.prefix = 'loveapp_';
        this._serverVersion = 0;
        this._pollInterval = null;
        this._apiBase = '';
        this._syncing = false;
        
        this.initDefaults();
    }

    // ========== INIT ==========
    initDefaults() {
        // Инициализация localStorage как кэша
        const keys = ['profile','stats','letters','events','gifts','photos','albums',
                      'notifications','orders','goals','quickNotes','specialDates'];
        
        keys.forEach(key => {
            if (!this.get(key)) {
                if (key === 'profile') {
                    this.set(key, {
                        userName: 'Любимая', adminName: 'Любимый',
                        userStatus: '', coupleDate: '22 октября 2023',
                        coupleDateRaw: '2023-10-22', notifications: true,
                        theme: 'pink', isAdmin: false, userStars: 50,
                        adminStars: 100, avatarEmoji: null, avatarUrl: null
                    });
                } else if (key === 'stats') {
                    this.set(key, { daysTogether: 0, lettersReceived: 0, giftsReceived: 0, eventsMade: 0, reactionsGiven: 0 });
                } else if (key === 'specialDates') {
                    const year = new Date().getFullYear();
                    this.set(key, [
                        { id: 'sd_1', date: `${year}-02-14`, title: 'День Святого Валентина', emoji: '💝' },
                        { id: 'sd_2', date: `${year}-03-08`, title: '8 Марта', emoji: '🌷' },
                    ]);
                } else {
                    this.set(key, []);
                }
            }
        });

        // Начать polling сервера
        this.startServerSync();
    }

    // ========== SERVER SYNC ==========
    startServerSync() {
        // Первая загрузка с сервера
        this.fetchServerState();
        
        // Polling каждые 3 секунды
        this._pollInterval = setInterval(() => {
            this.checkServerUpdates();
        }, 3000);
    }

    stopServerSync() {
        if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
        }
    }

    async fetchServerState() {
        try {
            const resp = await fetch(`${this._apiBase}/api/state?since=0`);
            if (!resp.ok) return;
            const result = await resp.json();
            
            if (result.changed && result.data) {
                this.applyServerData(result.data);
                this._serverVersion = result.version;
            }
        } catch (e) {
            console.log('Server fetch failed, using local cache');
        }
    }

    async checkServerUpdates() {
        if (this._syncing) return;
        
        try {
            const resp = await fetch(`${this._apiBase}/api/version`);
            if (!resp.ok) return;
            const { version } = await resp.json();
            
            if (version > this._serverVersion) {
                this._syncing = true;
                const stateResp = await fetch(`${this._apiBase}/api/state?since=${this._serverVersion}`);
                if (stateResp.ok) {
                    const result = await stateResp.json();
                    if (result.changed && result.data) {
                        this.applyServerData(result.data);
                        this._serverVersion = result.version;
                        
                        // Обновить UI
                        if (window.app) {
                            window.app.nav?.updateBadges();
                            window.app.notifications?.updateNotificationBadge();
                            
                            // Обновить текущую страницу
                            const page = window.app.currentPage;
                            if (page === 'home') {
                                window.app.updateUpcomingEvents();
                            } else if (page === 'letters') {
                                window.app.renderLettersContent();
                            } else if (page === 'gifts') {
                                window.app.renderGiftsContent();
                            } else if (page === 'calendar') {
                                window.app.calendar?.renderCalendar();
                            } else if (page === 'admin') {
                                window.app.admin?.renderFullAdmin();
                            }
                        }
                    }
                }
                this._syncing = false;
            }
        } catch (e) {
            this._syncing = false;
        }
    }

    applyServerData(data) {
        const localProfile = this.get('profile') || {};
        const isAdmin = localProfile.isAdmin;
        
        // Обновляем данные из сервера, сохраняя isAdmin из локального
        if (data.profile) {
            this.set('profile', { ...data.profile, isAdmin });
        }
        if (data.letters) this.set('letters', data.letters);
        if (data.events) this.set('events', data.events);
        if (data.gifts) this.set('gifts', data.gifts);
        if (data.albums) this.set('albums', data.albums);
        if (data.photos) this.set('photos', data.photos);
        if (data.specialDates) this.set('specialDates', data.specialDates);
        if (data.notifications) this.set('notifications', data.notifications);
        if (data.orders) this.set('orders', data.orders);
        if (data.goals) this.set('goals', data.goals);
        if (data.quickNotes) this.set('quickNotes', data.quickNotes);
        if (data.stats) this.set('stats', data.stats);
    }

    // Отправить данные на сервер
    async serverPost(endpoint, data) {
        try {
            const resp = await fetch(`${this._apiBase}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (resp.ok) {
                const result = await resp.json();
                if (result.version) this._serverVersion = result.version;
                return result;
            }
        } catch (e) {
            console.log('Server post failed:', endpoint);
        }
        return null;
    }

    async serverPut(endpoint, data) {
        try {
            const resp = await fetch(`${this._apiBase}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (resp.ok) {
                const result = await resp.json();
                if (result.version) this._serverVersion = result.version;
                return result;
            }
        } catch (e) {
            console.log('Server put failed:', endpoint);
        }
        return null;
    }

    async serverDelete(endpoint) {
        try {
            const resp = await fetch(`${this._apiBase}${endpoint}`, { method: 'DELETE' });
            if (resp.ok) {
                const result = await resp.json();
                if (result.version) this._serverVersion = result.version;
                return result;
            }
        } catch (e) {
            console.log('Server delete failed:', endpoint);
        }
        return null;
    }

    // ========== GENERIC ==========
    get(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                this.cleanupStorage();
                try { localStorage.setItem(this.prefix + key, JSON.stringify(value)); } catch(e2) {}
            }
        }
    }

    cleanupStorage() {
        const photos = this.get('photos') || [];
        const withFiles = photos.filter(p => p.files?.length > 0 && p.files[0]?.data);
        if (withFiles.length > 0) {
            withFiles[0].files = [];
            this.set('photos', photos);
        }
    }

    // ========== PROFILE ==========
    getProfile() { return this.get('profile') || {}; }

    updateProfile(updates) {
        const profile = this.getProfile();
        const merged = { ...profile, ...updates };
        this.set('profile', merged);
        
        // Синхронизировать с сервером (без isAdmin)
        const { isAdmin, ...serverProfile } = merged;
        this.serverPut('/api/profile', serverProfile);
    }

    // ========== STATS ==========
    getStats() { return this.get('stats') || {}; }

    updateStats(updates) {
        const stats = { ...this.getStats(), ...updates };
        this.set('stats', stats);
    }

    // ========== LETTERS ==========
    getLetters() {
        return (this.get('letters') || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getLetter(id) {
        return (this.get('letters') || []).find(l => l.id === id);
    }

    addLetter(letter) {
        if (!letter.replies) letter.replies = [];
        if (!letter.reactions) letter.reactions = [];
        
        const letters = this.get('letters') || [];
        letters.unshift(letter);
        this.set('letters', letters);
        this.updateStats({ lettersReceived: letters.length });
        
        // Синхронизировать с сервером
        this.serverPost('/api/letters', letter);
    }

    markLetterRead(id) {
        const letters = this.get('letters') || [];
        const idx = letters.findIndex(l => l.id === id);
        if (idx >= 0) {
            letters[idx].read = true;
            this.set('letters', letters);
            this.serverPut(`/api/letters/${id}`, { read: true });
        }
    }

    toggleLetterFavorite(id) {
        const letters = this.get('letters') || [];
        const idx = letters.findIndex(l => l.id === id);
        if (idx >= 0) {
            letters[idx].favorite = !letters[idx].favorite;
            this.set('letters', letters);
            this.serverPut(`/api/letters/${id}`, { favorite: letters[idx].favorite });
        }
    }

    addReaction(letterId, emoji, from) {
        const letters = this.get('letters') || [];
        const idx = letters.findIndex(l => l.id === letterId);
        if (idx >= 0) {
            if (!letters[idx].reactions) letters[idx].reactions = [];
            letters[idx].reactions.push({ emoji, from, date: new Date().toISOString() });
            this.set('letters', letters);
            this.serverPost(`/api/letters/${letterId}/reaction`, { emoji, from });
        }
    }

    addReplyToThread(letterId, reply) {
        const letters = this.get('letters') || [];
        const idx = letters.findIndex(l => l.id === letterId);
        if (idx >= 0) {
            if (!letters[idx].replies) letters[idx].replies = [];
            letters[idx].replies.push(reply);
            this.set('letters', letters);
            this.serverPost(`/api/letters/${letterId}/reply`, reply);
        }
    }

    addReply(letterId, reply) { this.addReplyToThread(letterId, reply); }

    deleteLetter(id) {
        this.set('letters', (this.get('letters') || []).filter(l => l.id !== id));
        this.serverDelete(`/api/letters/${id}`);
    }

    // ========== EVENTS ==========
    getEvents() { return this.get('events') || []; }
    getEvent(id) { return this.getEvents().find(e => e.id === id); }

    addEvent(event) {
        const events = this.get('events') || [];
        events.push(event);
        this.set('events', events);
        this.serverPost('/api/events', event);
    }

    updateEvent(event) {
        const events = this.get('events') || [];
        const idx = events.findIndex(e => e.id === event.id);
        if (idx >= 0) {
            events[idx] = event;
            this.set('events', events);
            this.serverPut(`/api/events/${event.id}`, event);
        }
    }

    deleteEvent(id) {
        this.set('events', (this.get('events') || []).filter(e => e.id !== id));
        this.serverDelete(`/api/events/${id}`);
    }

    // ========== SPECIAL DATES ==========
    getSpecialDates() { return this.get('specialDates') || []; }

    addSpecialDate(date) {
        const dates = this.get('specialDates') || [];
        dates.push(date);
        this.set('specialDates', dates);
        this.serverPost('/api/special-dates', date);
    }

    removeSpecialDate(id) {
        this.set('specialDates', (this.get('specialDates') || []).filter(d => d.id !== id));
        this.serverDelete(`/api/special-dates/${id}`);
    }

    // ========== GIFTS ==========
    getGifts() { return (this.get('gifts') || []).sort((a, b) => new Date(b.date) - new Date(a.date)); }
    getGift(id) { return (this.get('gifts') || []).find(g => g.id === id); }

    addGift(gift) {
        const gifts = this.get('gifts') || [];
        gifts.unshift(gift);
        this.set('gifts', gifts);
        this.serverPost('/api/gifts', gift);
    }

    markGiftOpened(id) {
        const gifts = this.get('gifts') || [];
        const idx = gifts.findIndex(g => g.id === id);
        if (idx >= 0) {
            gifts[idx].opened = true;
            this.set('gifts', gifts);
            this.serverPut(`/api/gifts/${id}`, { opened: true });
        }
    }

    // ========== PHOTOS & ALBUMS ==========
    getPhotos() { return (this.get('photos') || []).sort((a, b) => new Date(b.date) - new Date(a.date)); }
    getPhoto(id) { return (this.get('photos') || []).find(p => p.id === id); }
    getPhotosByAlbum(albumId) { return this.getPhotos().filter(p => p.albumId === albumId); }
    getAlbums() { return this.get('albums') || []; }
    getAlbum(id) { return this.getAlbums().find(a => a.id === id); }

    addAlbum(album) {
        const albums = this.get('albums') || [];
        albums.push(album);
        this.set('albums', albums);
        this.serverPost('/api/albums', album);
    }

    addPhoto(photo) {
        const photos = this.get('photos') || [];
        photos.push(photo);
        this.set('photos', photos);
        
        // Без файлов на сервер (слишком большие)
        const serverPhoto = { ...photo, files: [] };
        this.serverPost('/api/photos', serverPhoto);
    }

    incrementAlbumCount(albumId) {
        const albums = this.get('albums') || [];
        const idx = albums.findIndex(a => a.id === albumId);
        if (idx >= 0) {
            albums[idx].photoCount = (albums[idx].photoCount || 0) + 1;
            this.set('albums', albums);
        }
    }

    deleteAlbum(id) {
        this.set('albums', (this.get('albums') || []).filter(a => a.id !== id));
        this.set('photos', (this.get('photos') || []).filter(p => p.albumId !== id));
        this.serverDelete(`/api/albums/${id}`);
    }

    // ========== NOTIFICATIONS ==========
    getNotifications() { return (this.get('notifications') || []).sort((a, b) => new Date(b.date) - new Date(a.date)); }

    addNotification(notif) {
        const notifs = this.get('notifications') || [];
        notifs.unshift(notif);
        if (notifs.length > 50) notifs.length = 50;
        this.set('notifications', notifs);
    }

    markNotificationRead(id) {
        const notifs = this.get('notifications') || [];
        const idx = notifs.findIndex(n => n.id === id);
        if (idx >= 0) {
            notifs[idx].read = true;
            this.set('notifications', notifs);
            this.serverPut(`/api/notifications/${id}/read`, {});
        }
    }

    markAllNotificationsRead() {
        const notifs = this.get('notifications') || [];
        notifs.forEach(n => n.read = true);
        this.set('notifications', notifs);
        this.serverPut('/api/notifications/read-all', {});
    }

    getUnreadNotificationsCount() {
        return (this.get('notifications') || []).filter(n => !n.read).length;
    }

    // ========== ORDERS ==========
    getOrders() { return (this.get('orders') || []).sort((a, b) => new Date(b.date) - new Date(a.date)); }

    addOrder(order) {
        const orders = this.get('orders') || [];
        orders.push(order);
        this.set('orders', orders);
        this.serverPost('/api/orders', order);
    }

    updateOrderStatus(orderId, status) {
        const orders = this.get('orders') || [];
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx >= 0) {
            orders[idx].status = status;
            this.set('orders', orders);
            this.serverPut(`/api/orders/${orderId}`, { status });
        }
    }

    // ========== EXPORT ==========
    exportAll() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                try { data[key.replace(this.prefix, '')] = JSON.parse(localStorage.getItem(key)); }
                catch (e) { data[key.replace(this.prefix, '')] = localStorage.getItem(key); }
            }
        }
        return data;
    }

    clearAll() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) keys.push(key);
        }
        keys.forEach(k => localStorage.removeItem(k));
        this.serverPost('/api/reset', {});
    }
}

window.DataStorage = DataStorage;