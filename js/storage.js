// js/storage.js — Хранилище данных (localStorage) — ИСПРАВЛЕНО

class DataStorage {
    constructor() {
        this.prefix = 'loveapp_';
        this.initDefaults();
    }

    // ========== INIT ==========
    initDefaults() {
        if (!this.get('profile')) {
            this.set('profile', {
                userName: 'Любимая',
                userStatus: 'Самая красивая на свете 💕',
                adminName: 'Любимый',
                coupleDate: '22 октября 2023',
                coupleDateRaw: '2023-10-22',
                notifications: true,
                letterNotifications: true,
                giftNotifications: true,
                theme: 'pink',
                isAdmin: false,
                userStars: 50,
                adminStars: 100,
                avatarEmoji: null,
                avatarUrl: null,
                nameSetManually: false
            });
        }

        if (!this.get('stats')) {
            this.set('stats', {
                daysTogether: 0,
                lettersReceived: 0,
                lettersSent: 0,
                giftsReceived: 0,
                giftsSent: 0,
                eventsMade: 0,
                reactionsGiven: 0,
                loveLevel: 1,
                loveXP: 0
            });
        }

        if (!this.get('letters')) this.set('letters', []);
        if (!this.get('events')) this.set('events', []);
        if (!this.get('gifts')) this.set('gifts', []);
        if (!this.get('photos')) this.set('photos', []);
        if (!this.get('albums')) this.set('albums', []);
        if (!this.get('notifications')) this.set('notifications', []);
        if (!this.get('orders')) this.set('orders', []);
        if (!this.get('goals')) this.set('goals', []);
        if (!this.get('quickNotes')) this.set('quickNotes', []);

        if (!this.get('specialDates')) {
            const year = new Date().getFullYear();
            this.set('specialDates', [
                { id: 'sd_1', date: `${year}-02-14`, title: 'День Святого Валентина', emoji: '💝' },
                { id: 'sd_2', date: `${year}-03-08`, title: '8 Марта', emoji: '🌷' },
            ]);
        }

        // Миграция старых данных: daysTogther -> daysTogether
        const stats = this.get('stats');
        if (stats && stats.daysTogther !== undefined && stats.daysTogether === undefined) {
            stats.daysTogether = stats.daysTogther;
            delete stats.daysTogther;
            this.set('stats', stats);
        }

        this.updateDaysTogether();

        if (this.getLetters().length === 0) {
            this.addDemoData();
        }
    }

    addDemoData() {
        const now = new Date();
        const day = 86400000;

        this.set('letters', [
            {
                id: 'letter_demo_1',
                from: 'admin',
                subject: 'Доброе утро, солнышко!',
                text: 'Каждое утро я просыпаюсь и благодарю судьбу за то, что ты есть. Ты делаешь мою жизнь волшебной! ✨\n\nЛюблю тебя бесконечно 💕',
                mood: '☀️',
                date: new Date(now - 2 * day).toISOString(),
                read: false,
                favorite: false,
                reactions: [
                    { emoji: '❤️', from: 'user', date: new Date(now - day).toISOString() }
                ],
                replies: []
            },
            {
                id: 'letter_demo_2',
                from: 'admin',
                subject: 'Ты — моя вселенная',
                text: 'Знаешь, что самое прекрасное в моей жизни? Это ты. Твоя улыбка, твой смех, твои глаза — всё это делает каждый день особенным.\n\nТы моя звёздочка! ⭐',
                mood: '🌙',
                date: new Date(now - 5 * day).toISOString(),
                read: true,
                favorite: true,
                reactions: [],
                replies: [
                    {
                        id: 'reply_demo_1',
                        text: 'Спасибо, мой хороший! Ты самый лучший! 💕🥰',
                        from: 'user',
                        date: new Date(now - 4 * day).toISOString()
                    }
                ]
            },
            {
                id: 'letter_demo_3',
                from: 'admin',
                subject: 'Скучаю...',
                text: 'Каждая минута без тебя — как вечность. Хочу обнять тебя крепко-крепко и никогда не отпускать! 🤗',
                mood: '🥺',
                date: new Date(now - 10 * day).toISOString(),
                read: true,
                favorite: false,
                reactions: [],
                replies: []
            }
        ]);

        this.set('events', [
            {
                id: 'event_demo_1',
                title: 'Романтический ужин',
                date: this.getNextDateStr(3),
                time: '19:00',
                description: 'Ужин в нашем любимом ресторане',
                type: 'dinner',
                repeat: 'none',
                reminder: '1d'
            },
            {
                id: 'event_demo_2',
                title: 'Кино вдвоём',
                date: this.getNextDateStr(7),
                time: '18:00',
                description: 'Новый фильм!',
                type: 'date',
                repeat: 'none',
                reminder: '1d'
            }
        ]);

        this.set('gifts', [
            {
                id: 'gift_demo_1',
                giftId: 'hug',
                emoji: '🤗',
                name: 'Обнимашки',
                message: 'Обнимаю тебя крепко-крепко! 💕',
                from: 'admin',
                to: 'user',
                date: new Date().toISOString(),
                opened: false
            }
        ]);

        this.set('albums', [
            { id: 'album_demo_1', name: 'Наши моменты', coverEmoji: '💑', photoCount: 3, createdAt: new Date().toISOString() },
            { id: 'album_demo_2', name: 'Путешествия', coverEmoji: '✈️', photoCount: 0, createdAt: new Date().toISOString() },
        ]);

        this.set('photos', [
            { id: 'photo_demo_1', emoji: '💑', caption: 'Первое свидание', albumId: 'album_demo_1', date: new Date().toISOString(), isNew: false, files: [] },
            { id: 'photo_demo_2', emoji: '🌅', caption: 'Закат вместе', albumId: 'album_demo_1', date: new Date().toISOString(), isNew: false, files: [] },
            { id: 'photo_demo_3', emoji: '🎂', caption: 'День рождения', albumId: 'album_demo_1', date: new Date().toISOString(), isNew: true, files: [] },
        ]);

        this.updateStats({
            lettersReceived: 3,
            giftsReceived: 1,
            eventsMade: 2,
            loveLevel: 2,
            loveXP: 45
        });
    }

    getNextDateStr(daysFromNow) {
        const d = new Date();
        d.setDate(d.getDate() + daysFromNow);
        return d.toISOString().split('T')[0];
    }

    updateDaysTogether() {
        const profile = this.getProfile();
        if (profile.coupleDateRaw) {
            const days = Math.floor((new Date() - new Date(profile.coupleDateRaw)) / 86400000);
            this.updateStats({ daysTogether: Math.max(0, days) });
        }
    }

    // ========== GENERIC ==========
    get(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', key, e);
            return null;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage set error:', key, e);
            // Если localStorage переполнен — попробовать почистить фото
            if (e.name === 'QuotaExceededError') {
                this.cleanupStorage();
                try {
                    localStorage.setItem(this.prefix + key, JSON.stringify(value));
                } catch (e2) {
                    console.error('Storage still full after cleanup');
                }
            }
        }
    }

    cleanupStorage() {
        // Удалить самые старые фото с файлами для освобождения места
        const photos = this.get('photos') || [];
        const photosWithFiles = photos.filter(p => p.files && p.files.length > 0 && p.files[0].data);
        if (photosWithFiles.length > 0) {
            photosWithFiles[0].files = [];
            this.set('photos', photos);
        }
    }

    // ========== PROFILE ==========
    getProfile() { return this.get('profile') || {}; }

    updateProfile(updates) {
        const profile = this.getProfile();
        this.set('profile', { ...profile, ...updates });
    }

    // ========== STATS ==========
    getStats() { return this.get('stats') || {}; }

    updateStats(updates) {
        const stats = this.getStats();
        this.set('stats', { ...stats, ...updates });
    }

    // ========== LETTERS ==========
    getLetters() {
        return (this.get('letters') || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getLetter(id) {
        return (this.get('letters') || []).find(l => l.id === id);
    }

    addLetter(letter) {
        const letters = this.get('letters') || [];
        // Убедиться что replies — массив
        if (!letter.replies) letter.replies = [];
        if (!letter.reactions) letter.reactions = [];
        letters.push(letter);
        this.set('letters', letters);
        // Обновить статистику
        const stats = this.getStats();
        this.updateStats({ lettersReceived: (stats.lettersReceived || 0) + 1 });
    }

    markLetterRead(id) {
        const letters = this.get('letters') || [];
        const idx = letters.findIndex(l => l.id === id);
        if (idx >= 0) {
            letters[idx].read = true;
            this.set('letters', letters);
        }
    }

    toggleLetterFavorite(id) {
        const letters = this.get('letters') || [];
        const idx = letters.findIndex(l => l.id === id);
        if (idx >= 0) {
            letters[idx].favorite = !letters[idx].favorite;
            this.set('letters', letters);
        }
    }

    addReaction(letterId, emoji, from) {
        const letters = this.get('letters') || [];
        const idx = letters.findIndex(l => l.id === letterId);
        if (idx >= 0) {
            if (!letters[idx].reactions) letters[idx].reactions = [];
            letters[idx].reactions.push({ emoji, from, date: new Date().toISOString() });
            this.set('letters', letters);
            const stats = this.getStats();
            this.updateStats({ reactionsGiven: (stats.reactionsGiven || 0) + 1 });
        }
    }

    addReplyToThread(letterId, reply) {
        const letters = this.get('letters') || [];
        const idx = letters.findIndex(l => l.id === letterId);
        if (idx >= 0) {
            if (!letters[idx].replies) letters[idx].replies = [];
            // Миграция: старый формат reply -> replies
            if (letters[idx].reply && typeof letters[idx].reply === 'object') {
                letters[idx].replies.push(letters[idx].reply);
                delete letters[idx].reply;
            }
            letters[idx].replies.push(reply);
            this.set('letters', letters);
        }
    }

    // Оставить для обратной совместимости
    addReply(letterId, reply) {
        this.addReplyToThread(letterId, reply);
    }

    deleteLetter(id) {
        const letters = (this.get('letters') || []).filter(l => l.id !== id);
        this.set('letters', letters);
    }

    // ========== EVENTS ==========
    getEvents() { return this.get('events') || []; }
    getEvent(id) { return this.getEvents().find(e => e.id === id); }

    addEvent(event) {
        const events = this.get('events') || [];
        events.push(event);
        this.set('events', events);
        const stats = this.getStats();
        this.updateStats({ eventsMade: (stats.eventsMade || 0) + 1 });
    }

    updateEvent(event) {
        const events = this.get('events') || [];
        const idx = events.findIndex(e => e.id === event.id);
        if (idx >= 0) {
            events[idx] = event;
            this.set('events', events);
        }
    }

    deleteEvent(id) {
        const events = (this.get('events') || []).filter(e => e.id !== id);
        this.set('events', events);
    }

    // ========== SPECIAL DATES ==========
    getSpecialDates() { return this.get('specialDates') || []; }

    addSpecialDate(date) {
        const dates = this.get('specialDates') || [];
        dates.push(date);
        this.set('specialDates', dates);
    }

    removeSpecialDate(id) {
        const dates = (this.get('specialDates') || []).filter(d => d.id !== id);
        this.set('specialDates', dates);
    }

    // ========== GIFTS ==========
    getGifts() {
        return (this.get('gifts') || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getGift(id) { return (this.get('gifts') || []).find(g => g.id === id); }

    addGift(gift) {
        const gifts = this.get('gifts') || [];
        gifts.push(gift);
        this.set('gifts', gifts);
        const stats = this.getStats();
        this.updateStats({ giftsReceived: (stats.giftsReceived || 0) + 1 });
    }

    markGiftOpened(id) {
        const gifts = this.get('gifts') || [];
        const idx = gifts.findIndex(g => g.id === id);
        if (idx >= 0) {
            gifts[idx].opened = true;
            this.set('gifts', gifts);
        }
    }

    // ========== PHOTOS ==========
    getPhotos() {
        return (this.get('photos') || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    getPhoto(id) { return (this.get('photos') || []).find(p => p.id === id); }
    getPhotosByAlbum(albumId) { return this.getPhotos().filter(p => p.albumId === albumId); }

    addPhoto(photo) {
        const photos = this.get('photos') || [];
        photos.push(photo);
        this.set('photos', photos);
    }

    // ========== ALBUMS ==========
    getAlbums() { return this.get('albums') || []; }
    getAlbum(id) { return this.getAlbums().find(a => a.id === id); }

    addAlbum(album) {
        const albums = this.get('albums') || [];
        albums.push(album);
        this.set('albums', albums);
    }

    incrementAlbumCount(albumId) {
        const albums = this.get('albums') || [];
        const idx = albums.findIndex(a => a.id === albumId);
        if (idx >= 0) {
            albums[idx].photoCount = (albums[idx].photoCount || 0) + 1;
            this.set('albums', albums);
        }
    }

    // ========== NOTIFICATIONS ==========
    getNotifications() {
        return (this.get('notifications') || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    addNotification(notif) {
        const notifs = this.get('notifications') || [];
        notifs.push(notif);
        // Ограничить 50 уведомлениями
        if (notifs.length > 50) notifs.splice(0, notifs.length - 50);
        this.set('notifications', notifs);
    }

    markNotificationRead(id) {
        const notifs = this.get('notifications') || [];
        const idx = notifs.findIndex(n => n.id === id);
        if (idx >= 0) {
            notifs[idx].read = true;
            this.set('notifications', notifs);
        }
    }

    markAllNotificationsRead() {
        const notifs = this.get('notifications') || [];
        notifs.forEach(n => n.read = true);
        this.set('notifications', notifs);
    }

    getUnreadNotificationsCount() {
        return (this.get('notifications') || []).filter(n => !n.read).length;
    }

    // ========== ORDERS ==========
    getOrders() {
        return (this.get('orders') || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    addOrder(order) {
        const orders = this.get('orders') || [];
        orders.push(order);
        this.set('orders', orders);
    }

    updateOrderStatus(orderId, status) {
        const orders = this.get('orders') || [];
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx >= 0) {
            orders[idx].status = status;
            this.set('orders', orders);
        }
    }

    // ========== EXPORT ==========
    exportAll() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                try {
                    data[key.replace(this.prefix, '')] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    data[key.replace(this.prefix, '')] = localStorage.getItem(key);
                }
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
    }
}

window.DataStorage = DataStorage;