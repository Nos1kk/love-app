const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN || '8571890995:AAGls0kbQVVFt6FSHz20LwpQ5-YztJNpoX4';
const PORT = process.env.PORT || 3000;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://love-app.amvera.io';

// === НАСТРОЙКА РОЛЕЙ ===
const ADMIN_TG_ID = 8207413524;
const USER_TG_ID = 1250674816;

const app = express();

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.static(path.join(__dirname), { maxAge: '1h', etag: true }));
app.use(express.json({ limit: '10mb' }));

// ========== SHARED STORE ==========
const sharedStore = {
    letters: [],
    events: [],
    gifts: [],
    albums: [],
    photos: [],
    specialDates: [],
    notifications: [],
    orders: [],
    goals: [],
    quickNotes: [],
    wishlist: [],
    profile: {
        userName: 'Любимая',
        adminName: 'Любимый',
        userStatus: 'Самая красивая 💕',
        coupleDate: '22 октября 2023',
        coupleDateRaw: '2023-10-22',
        notifications: true,
        theme: 'pink',
        userStars: 50,
        adminStars: 100,
        avatarEmoji: null,
        avatarUrl: null
    },
    stats: {
        daysTogether: 0,
        lettersReceived: 0,
        giftsReceived: 0,
        eventsMade: 0,
        reactionsGiven: 0
    },
    // Настраиваемые данные админом
    wheelPrizes: [
        { emoji: '⭐', name: '+5 звёзд', type: 'stars', value: 5 },
        { emoji: '⭐', name: '+10 звёзд', type: 'stars', value: 10 },
        { emoji: '⭐', name: '+25 звёзд', type: 'stars', value: 25 },
        { emoji: '💌', name: 'Секретное письмо', type: 'letter', value: null },
        { emoji: '🤗', name: 'Обнимашки', type: 'gift', value: 'hug' },
        { emoji: '💋', name: 'Поцелуй', type: 'gift', value: 'kiss' },
        { emoji: '🌹', name: 'Роза', type: 'gift', value: 'rose' },
        { emoji: '🎉', name: 'Сюрприз!', type: 'stars', value: 50 },
    ],
    shopItems: [
        { id: 'flowers_rose', name: 'Букет роз', emoji: '🌹', price: 50, desc: 'Настоящий букет роз!', imageUrl: null },
        { id: 'chocolate', name: 'Шоколад', emoji: '🍫', price: 15, desc: 'Вкусный шоколад', imageUrl: null },
        { id: 'dinner', name: 'Романтический ужин', emoji: '🍽️', price: 100, desc: 'Ужин в ресторане', imageUrl: null },
        { id: 'movie', name: 'Кино', emoji: '🎬', price: 40, desc: 'Поход в кинотеатр', imageUrl: null },
        { id: 'surprise', name: 'Сюрприз', emoji: '🎁', price: 75, desc: 'Секретный подарок!', imageUrl: null },
    ],
    playlist: [
        { title: 'Perfect', artist: 'Ed Sheeran', emoji: '🎵', url: '' },
        { title: 'All of Me', artist: 'John Legend', emoji: '🎶', url: '' },
        { title: 'A Thousand Years', artist: 'Christina Perri', emoji: '🎵', url: '' },
    ],
    quizQuestions: [
        { q: 'Какой наш любимый фильм?', options: ['Титаник', 'Ещё не решили!', 'Начало'], correct: 1, reward: 5 },
        { q: 'Где было первое свидание?', options: ['В кафе', 'В парке', 'Дома'], correct: 0, reward: 5 },
        { q: 'Что я люблю больше всего?', options: ['Пиццу', 'Тебя!', 'Спать'], correct: 1, reward: 10 },
    ],
    customCompliments: [],
    _version: 0,
    _lastUpdate: Date.now()
};

let botChatIds = new Set();

function bumpVersion() {
    sharedStore._version++;
    sharedStore._lastUpdate = Date.now();
}

function getNextDateStr(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
}

function initDemoData() {
    if (sharedStore.letters.length > 0) return;

    const now = new Date();
    const day = 86400000;

    sharedStore.letters = [
        {
            id: 'letter_demo_1', from: 'admin',
            subject: 'Доброе утро, солнышко!',
            text: 'Каждое утро я просыпаюсь и благодарю судьбу за то, что ты есть. ✨\n\nЛюблю тебя бесконечно 💕',
            mood: '☀️', date: new Date(now - 2 * day).toISOString(),
            read: false, favorite: false, reactions: [], replies: []
        }
    ];

    sharedStore.events = [
        { id: 'event_demo_1', title: 'Романтический ужин', date: getNextDateStr(3), time: '19:00', description: 'Ужин в ресторане', type: 'dinner' }
    ];

    sharedStore.gifts = [
        { id: 'gift_demo_1', giftId: 'hug', emoji: '🤗', name: 'Обнимашки', message: 'Обнимаю! 💕', from: 'admin', to: 'user', date: new Date().toISOString(), opened: false }
    ];

    sharedStore.albums = [
        { id: 'album_demo_1', name: 'Наши моменты', coverEmoji: '💑', photoCount: 0, createdAt: new Date().toISOString() }
    ];

    const year = new Date().getFullYear();
    sharedStore.specialDates = [
        { id: 'sd_1', date: `${year}-02-14`, title: 'День Святого Валентина', emoji: '💝' },
        { id: 'sd_2', date: `${year}-03-08`, title: '8 Марта', emoji: '🌷' },
    ];

    if (sharedStore.profile.coupleDateRaw) {
        sharedStore.stats.daysTogether = Math.max(0, Math.floor((new Date() - new Date(sharedStore.profile.coupleDateRaw)) / 86400000));
    }
    sharedStore.stats.lettersReceived = sharedStore.letters.length;
    sharedStore.stats.giftsReceived = sharedStore.gifts.length;
    sharedStore._version++;
}

initDemoData();

// ========== ROLE API ==========
app.get('/api/role', (req, res) => {
    const tgId = parseInt(req.query.tgId) || 0;
    let role = 'guest';
    if (tgId === ADMIN_TG_ID) role = 'admin';
    else if (tgId === USER_TG_ID) role = 'user';
    res.json({ role, tgId });
});

// ========== STATE ==========
app.get('/api/state', (req, res) => {
    const sinceVersion = parseInt(req.query.since) || 0;
    if (sinceVersion >= sharedStore._version) {
        return res.json({ changed: false, version: sharedStore._version });
    }
    res.json({
        changed: true,
        version: sharedStore._version,
        data: {
            letters: sharedStore.letters,
            events: sharedStore.events,
            gifts: sharedStore.gifts,
            albums: sharedStore.albums,
            photos: sharedStore.photos,
            specialDates: sharedStore.specialDates,
            notifications: sharedStore.notifications,
            orders: sharedStore.orders,
            goals: sharedStore.goals,
            quickNotes: sharedStore.quickNotes,
            wishlist: sharedStore.wishlist,
            profile: sharedStore.profile,
            stats: sharedStore.stats,
            wheelPrizes: sharedStore.wheelPrizes,
            shopItems: sharedStore.shopItems,
            playlist: sharedStore.playlist,
            quizQuestions: sharedStore.quizQuestions,
            customCompliments: sharedStore.customCompliments,
        }
    });
});

app.get('/api/version', (req, res) => {
    res.json({ version: sharedStore._version, lastUpdate: sharedStore._lastUpdate });
});

// ===== LETTERS =====
app.post('/api/letters', (req, res) => {
    const letter = req.body;
    if (!letter.id) letter.id = 'letter_' + Date.now();
    if (!letter.date) letter.date = new Date().toISOString();
    if (!letter.replies) letter.replies = [];
    if (!letter.reactions) letter.reactions = [];
    if (letter.read === undefined) letter.read = false;
    if (letter.favorite === undefined) letter.favorite = false;

    sharedStore.letters.unshift(letter);
    sharedStore.stats.lettersReceived = sharedStore.letters.length;

    sharedStore.notifications.unshift({
        id: 'notif_' + Date.now(), type: 'letter', letterId: letter.id,
        message: `Новое письмо: "${letter.subject || 'Без темы'}"`,
        preview: (letter.text || '').substring(0, 50),
        date: new Date().toISOString(), read: false
    });

    bumpVersion();
    sendBotNotificationToAll(`💌 Новое письмо: "${letter.subject || 'Без темы'}"`);
    res.json({ ok: true, letter, version: sharedStore._version });
});

app.put('/api/letters/:id', (req, res) => {
    const idx = sharedStore.letters.findIndex(l => l.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    Object.assign(sharedStore.letters[idx], req.body);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

app.delete('/api/letters/:id', (req, res) => {
    sharedStore.letters = sharedStore.letters.filter(l => l.id !== req.params.id);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

app.post('/api/letters/:id/reply', (req, res) => {
    const idx = sharedStore.letters.findIndex(l => l.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const reply = req.body;
    if (!reply.id) reply.id = 'reply_' + Date.now();
    if (!reply.date) reply.date = new Date().toISOString();
    if (!sharedStore.letters[idx].replies) sharedStore.letters[idx].replies = [];
    sharedStore.letters[idx].replies.push(reply);
    sharedStore.notifications.unshift({
        id: 'notif_' + Date.now(), type: 'reply', letterId: req.params.id,
        message: `Ответ на "${sharedStore.letters[idx].subject || 'письмо'}"`,
        preview: (reply.text || '').substring(0, 50),
        date: new Date().toISOString(), read: false
    });
    bumpVersion();
    sendBotNotificationToAll(`💬 Новый ответ: "${(reply.text || '').substring(0, 40)}"`);
    res.json({ ok: true, version: sharedStore._version });
});

app.post('/api/letters/:id/reaction', (req, res) => {
    const idx = sharedStore.letters.findIndex(l => l.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    if (!sharedStore.letters[idx].reactions) sharedStore.letters[idx].reactions = [];
    sharedStore.letters[idx].reactions.push({ emoji: req.body.emoji, from: req.body.from, date: new Date().toISOString() });
    sharedStore.stats.reactionsGiven = (sharedStore.stats.reactionsGiven || 0) + 1;
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

// ===== EVENTS =====
app.post('/api/events', (req, res) => {
    const event = req.body;
    if (!event.id) event.id = 'event_' + Date.now();
    sharedStore.events.push(event);
    sharedStore.stats.eventsMade = sharedStore.events.length;
    sharedStore.notifications.unshift({
        id: 'notif_' + Date.now(), type: 'event',
        message: `Новое событие: "${event.title}"`,
        date: new Date().toISOString(), read: false
    });
    bumpVersion();
    sendBotNotificationToAll(`📅 Новое событие: "${event.title}" — ${event.date}`);
    res.json({ ok: true, event, version: sharedStore._version });
});

app.put('/api/events/:id', (req, res) => {
    const idx = sharedStore.events.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    Object.assign(sharedStore.events[idx], req.body);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

app.delete('/api/events/:id', (req, res) => {
    sharedStore.events = sharedStore.events.filter(e => e.id !== req.params.id);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

// ===== SPECIAL DATES =====
app.post('/api/special-dates', (req, res) => {
    const sd = req.body;
    if (!sd.id) sd.id = 'sd_' + Date.now();
    sharedStore.specialDates.push(sd);
    sharedStore.notifications.unshift({
        id: 'notif_' + Date.now(), type: 'event',
        message: `Новая дата: ${sd.emoji} ${sd.title}`,
        date: new Date().toISOString(), read: false
    });
    bumpVersion();
    sendBotNotificationToAll(`🎉 Новая важная дата: ${sd.emoji} ${sd.title}`);
    res.json({ ok: true, version: sharedStore._version });
});

app.delete('/api/special-dates/:id', (req, res) => {
    sharedStore.specialDates = sharedStore.specialDates.filter(d => d.id !== req.params.id);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

// ===== GIFTS =====
app.post('/api/gifts', (req, res) => {
    const gift = req.body;
    if (!gift.id) gift.id = 'gift_' + Date.now();
    if (!gift.date) gift.date = new Date().toISOString();
    if (gift.opened === undefined) gift.opened = false;
    sharedStore.gifts.unshift(gift);
    sharedStore.stats.giftsReceived = sharedStore.gifts.length;
    sharedStore.notifications.unshift({
        id: 'notif_' + Date.now(), type: 'gift',
        message: `${gift.from === 'admin' ? 'Любимый' : 'Любимая'} подарил(а) ${gift.emoji} ${gift.name}!`,
        date: new Date().toISOString(), read: false
    });
    bumpVersion();
    sendBotNotificationToAll(`🎁 Подарок: ${gift.emoji} ${gift.name}!`);
    res.json({ ok: true, version: sharedStore._version });
});

app.put('/api/gifts/:id', (req, res) => {
    const idx = sharedStore.gifts.findIndex(g => g.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    Object.assign(sharedStore.gifts[idx], req.body);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

// ===== ALBUMS & PHOTOS =====
app.post('/api/albums', (req, res) => {
    const album = req.body;
    if (!album.id) album.id = 'album_' + Date.now();
    if (!album.createdAt) album.createdAt = new Date().toISOString();
    if (!album.photoCount) album.photoCount = 0;
    sharedStore.albums.push(album);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

app.delete('/api/albums/:id', (req, res) => {
    sharedStore.albums = sharedStore.albums.filter(a => a.id !== req.params.id);
    sharedStore.photos = sharedStore.photos.filter(p => p.albumId !== req.params.id);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

app.post('/api/photos', (req, res) => {
    const photo = req.body;
    if (!photo.id) photo.id = 'photo_' + Date.now();
    if (!photo.date) photo.date = new Date().toISOString();
    sharedStore.photos.push(photo);
    const ai = sharedStore.albums.findIndex(a => a.id === photo.albumId);
    if (ai >= 0) sharedStore.albums[ai].photoCount = (sharedStore.albums[ai].photoCount || 0) + 1;
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

// ===== PROFILE =====
app.get('/api/profile', (req, res) => res.json(sharedStore.profile));

app.put('/api/profile', (req, res) => {
    const oldStars = sharedStore.profile.userStars || 0;
    Object.assign(sharedStore.profile, req.body);
    if (req.body.coupleDateRaw) {
        sharedStore.stats.daysTogether = Math.max(0, Math.floor((new Date() - new Date(req.body.coupleDateRaw)) / 86400000));
    }
    // Уведомление о начислении звёзд
    const newStars = sharedStore.profile.userStars || 0;
    if (newStars > oldStars) {
        const diff = newStars - oldStars;
        sharedStore.notifications.unshift({
            id: 'notif_' + Date.now(), type: 'stars',
            message: `Начислено ${diff} ⭐ звёзд! Баланс: ${newStars} ⭐`,
            date: new Date().toISOString(), read: false
        });
        sendBotNotificationToAll(`⭐ Начислено ${diff} звёзд! Баланс: ${newStars} ⭐`);
    }
    bumpVersion();
    res.json({ ok: true, profile: sharedStore.profile, version: sharedStore._version });
});

// ===== STATS =====
app.get('/api/stats', (req, res) => {
    if (sharedStore.profile.coupleDateRaw) {
        sharedStore.stats.daysTogether = Math.max(0, Math.floor((new Date() - new Date(sharedStore.profile.coupleDateRaw)) / 86400000));
    }
    res.json(sharedStore.stats);
});

// ===== NOTIFICATIONS =====
app.get('/api/notifications', (req, res) => res.json(sharedStore.notifications));
app.put('/api/notifications/read-all', (req, res) => { sharedStore.notifications.forEach(n => n.read = true); bumpVersion(); res.json({ ok: true }); });
app.put('/api/notifications/:id/read', (req, res) => { const n = sharedStore.notifications.find(n => n.id === req.params.id); if (n) n.read = true; bumpVersion(); res.json({ ok: true }); });

// ===== ORDERS =====
app.post('/api/orders', (req, res) => {
    const order = req.body;
    if (!order.id) order.id = 'order_' + Date.now();
    if (!order.date) order.date = new Date().toISOString();
    if (!order.status) order.status = 'pending';
    sharedStore.orders.push(order);
    sharedStore.notifications.unshift({ id: 'notif_' + Date.now(), type: 'order', message: `Заказ: ${order.itemId} за ${order.price} ⭐`, date: new Date().toISOString(), read: false });
    bumpVersion();
    sendBotNotificationToAll(`🛒 Новый заказ: ${order.itemId} за ${order.price} ⭐`);
    res.json({ ok: true, version: sharedStore._version });
});

app.put('/api/orders/:id', (req, res) => {
    const idx = sharedStore.orders.findIndex(o => o.id === req.params.id);
    if (idx >= 0) { Object.assign(sharedStore.orders[idx], req.body); bumpVersion(); }
    res.json({ ok: true, version: sharedStore._version });
});

// ===== GOALS =====
app.get('/api/goals', (req, res) => res.json(sharedStore.goals));
app.post('/api/goals', (req, res) => { const g = req.body; if (!g.id) g.id = 'goal_' + Date.now(); sharedStore.goals.push(g); bumpVersion(); res.json({ ok: true, version: sharedStore._version }); });
app.put('/api/goals/:id', (req, res) => { const i = sharedStore.goals.findIndex(g => g.id === req.params.id); if (i >= 0) { Object.assign(sharedStore.goals[i], req.body); bumpVersion(); } res.json({ ok: true, version: sharedStore._version }); });
app.delete('/api/goals/:id', (req, res) => { sharedStore.goals = sharedStore.goals.filter(g => g.id !== req.params.id); bumpVersion(); res.json({ ok: true, version: sharedStore._version }); });

// ===== NOTES =====
app.get('/api/notes', (req, res) => res.json(sharedStore.quickNotes));
app.post('/api/notes', (req, res) => { const n = req.body; if (!n.id) n.id = 'note_' + Date.now(); if (!n.date) n.date = new Date().toISOString(); sharedStore.quickNotes.unshift(n); bumpVersion(); res.json({ ok: true, version: sharedStore._version }); });
app.delete('/api/notes/:id', (req, res) => { sharedStore.quickNotes = sharedStore.quickNotes.filter(n => n.id !== req.params.id); bumpVersion(); res.json({ ok: true, version: sharedStore._version }); });

// ===== WISHLIST =====
app.get('/api/wishlist', (req, res) => res.json(sharedStore.wishlist));

app.post('/api/wishlist', (req, res) => {
    const item = req.body;
    if (!item.id) item.id = 'wish_' + Date.now();
    if (!item.date) item.date = new Date().toISOString();
    if (item.priority === undefined) item.priority = 'medium';
    if (item.completed === undefined) item.completed = false;
    sharedStore.wishlist.push(item);
    bumpVersion();
    sendBotNotificationToAll(`🎁 Новое желание в вишлисте: ${item.name}`);
    res.json({ ok: true, version: sharedStore._version });
});

app.put('/api/wishlist/:id', (req, res) => {
    const idx = sharedStore.wishlist.findIndex(w => w.id === req.params.id);
    if (idx >= 0) { Object.assign(sharedStore.wishlist[idx], req.body); bumpVersion(); }
    res.json({ ok: true, version: sharedStore._version });
});

app.delete('/api/wishlist/:id', (req, res) => {
    sharedStore.wishlist = sharedStore.wishlist.filter(w => w.id !== req.params.id);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

// ===== ADMIN: WHEEL PRIZES =====
app.get('/api/admin/wheel', (req, res) => res.json(sharedStore.wheelPrizes));
app.put('/api/admin/wheel', (req, res) => { sharedStore.wheelPrizes = req.body; bumpVersion(); res.json({ ok: true, version: sharedStore._version }); });

// ===== ADMIN: SHOP ITEMS =====
app.get('/api/admin/shop', (req, res) => res.json(sharedStore.shopItems));
app.put('/api/admin/shop', (req, res) => { sharedStore.shopItems = req.body; bumpVersion(); res.json({ ok: true, version: sharedStore._version }); });

// ===== ADMIN: PLAYLIST =====
app.get('/api/admin/playlist', (req, res) => res.json(sharedStore.playlist));
app.put('/api/admin/playlist', (req, res) => { sharedStore.playlist = req.body; bumpVersion(); res.json({ ok: true, version: sharedStore._version }); });

// ===== ADMIN: QUIZ =====
app.get('/api/admin/quiz', (req, res) => res.json(sharedStore.quizQuestions));
app.put('/api/admin/quiz', (req, res) => { sharedStore.quizQuestions = req.body; bumpVersion(); res.json({ ok: true, version: sharedStore._version }); });

// ===== ADMIN: COMPLIMENTS =====
app.get('/api/admin/compliments', (req, res) => res.json(sharedStore.customCompliments));
app.put('/api/admin/compliments', (req, res) => { sharedStore.customCompliments = req.body; bumpVersion(); res.json({ ok: true, version: sharedStore._version }); });

// ===== RESET =====
app.post('/api/reset', (req, res) => {
    Object.assign(sharedStore, {
        letters: [], events: [], gifts: [], albums: [], photos: [],
        specialDates: [], notifications: [], orders: [], goals: [],
        quickNotes: [], wishlist: [],
        profile: { userName: 'Любимая', adminName: 'Любимый', userStatus: '', coupleDate: '22 октября 2023', coupleDateRaw: '2023-10-22', notifications: true, theme: 'pink', userStars: 50, adminStars: 100, avatarEmoji: null, avatarUrl: null },
        stats: { daysTogether: 0, lettersReceived: 0, giftsReceived: 0, eventsMade: 0, reactionsGiven: 0 }
    });
    bumpVersion(); initDemoData();
    res.json({ ok: true });
});

// ===== HEALTH =====
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), version: sharedStore._version, botActive: !!bot, subscribers: botChatIds.size });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ========== BOT ==========
let bot = null;

function sendBotNotificationToAll(message) {
    if (!bot || botChatIds.size === 0) return;
    botChatIds.forEach(chatId => {
        bot.sendMessage(chatId, message).catch(err => {
            if (err.message && (err.message.includes('chat not found') || err.message.includes('bot was blocked'))) {
                botChatIds.delete(chatId);
            }
        });
    });
}

function handleBotMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    botChatIds.add(chatId);
    const name = msg.from?.first_name || 'Друг';

    // Определяем роль
    const tgId = msg.from?.id || 0;
    let roleName = '👀 Гость';
    if (tgId === ADMIN_TG_ID) roleName = '👑 Админ';
    else if (tgId === USER_TG_ID) roleName = '💕 Любимая';

    if (text.startsWith('/start')) {
        bot.sendMessage(chatId,
            `💕 Привет, ${name}!\n${roleName}\n\nДобро пожаловать в Love App! ✨`,
            { reply_markup: { inline_keyboard: [[ { text: '💕 Открыть', web_app: { url: WEBAPP_URL } } ]] } }
        ).catch(console.error);
    } else if (text.startsWith('/menu')) {
        bot.sendMessage(chatId, `📱 Меню (${roleName}):`, {
            reply_markup: { inline_keyboard: [
                [{ text: '💕 Открыть', web_app: { url: WEBAPP_URL } }],
                [{ text: '💌 Письма', web_app: { url: WEBAPP_URL + '#letters' } }, { text: '🎁 Подарки', web_app: { url: WEBAPP_URL + '#gifts' } }],
                [{ text: '📅 Календарь', web_app: { url: WEBAPP_URL + '#calendar' } }, { text: '👤 Профиль', web_app: { url: WEBAPP_URL + '#profile' } }]
            ]}
        }).catch(console.error);
    } else if (text.startsWith('/love')) {
        const c = ['Ты ярче звёзд ⭐','Каждый день — подарок 🎁','Ты самая красивая 💫','Влюбляюсь сильнее 💗','Ты волшебная ✨','Рядом с тобой счастлив 🥰'];
        bot.sendMessage(chatId, `💕 ${c[Math.floor(Math.random() * c.length)]}`).catch(console.error);
    } else if (text.startsWith('/days')) {
        bot.sendMessage(chatId, `💑 Вместе ${sharedStore.stats.daysTogether || 0} дней!\n💕 С ${sharedStore.profile.coupleDate}`).catch(console.error);
    } else if (text.startsWith('/stats')) {
        const s = sharedStore.stats;
        bot.sendMessage(chatId, `📊 Статистика:\n💑 ${s.daysTogether} дней\n💌 ${s.lettersReceived} писем\n🎁 ${s.giftsReceived} подарков\n📅 ${s.eventsMade} событий`).catch(console.error);
    } else if (text.startsWith('/help')) {
        bot.sendMessage(chatId, `📖 Команды:\n/start — Запустить\n/menu — Меню\n/love — Комплимент\n/days — Дней вместе\n/stats — Статистика\n/help — Справка`).catch(console.error);
    }
}

if (BOT_TOKEN && BOT_TOKEN.length > 20) {
    try {
        bot = new TelegramBot(BOT_TOKEN);
        app.post(`/bot${BOT_TOKEN}`, (req, res) => {
            try { if (req.body.message) handleBotMessage(req.body.message); } catch (e) { console.error('Webhook error:', e); }
            res.sendStatus(200);
        });
        console.log('🤖 Bot initialized (webhook mode)');
    } catch (e) { console.error('Bot init failed:', e.message); bot = null; }
} else {
    console.log('⚠️ BOT_TOKEN not set');
}

const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server on port ${PORT}`);
    if (bot && BOT_TOKEN) {
        try {
            await bot.deleteWebHook();
            await bot.setWebHook(`${WEBAPP_URL}/bot${BOT_TOKEN}`);
            console.log('🔗 Webhook set');
        } catch (e) {
            console.log('Webhook failed, trying polling...');
            setTimeout(() => {
                try { bot.startPolling({ restart: false }); bot.on('message', handleBotMessage); console.log('🔄 Polling started'); }
                catch (pe) { console.error('Polling failed:', pe.message); }
            }, 5000);
        }
    }
});