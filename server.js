const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN || '8571890995:AAGls0kbQVVFt6FSHz20LwpQ5-YztJNpoX4';
const PORT = process.env.PORT || 3000;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://love-app.amvera.io';

const app = express();

// ========== MIDDLEWARE ==========
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

// ========== IN-MEMORY SHARED STORE ==========
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
    _version: 0,
    _lastUpdate: Date.now()
};

function getNextDateStr(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
}

function bumpVersion() {
    sharedStore._version++;
    sharedStore._lastUpdate = Date.now();
}

function initDemoData() {
    if (sharedStore.letters.length > 0) return;
    
    const now = new Date();
    const day = 86400000;
    
    sharedStore.letters = [
        {
            id: 'letter_demo_1',
            from: 'admin',
            subject: 'Доброе утро, солнышко!',
            text: 'Каждое утро я просыпаюсь и благодарю судьбу за то, что ты есть. Ты делаешь мою жизнь волшебной! ✨\n\nЛюблю тебя бесконечно 💕',
            mood: '☀️',
            date: new Date(now - 2 * day).toISOString(),
            read: false,
            favorite: false,
            reactions: [],
            replies: []
        }
    ];
    
    sharedStore.events = [
        {
            id: 'event_demo_1',
            title: 'Романтический ужин',
            date: getNextDateStr(3),
            time: '19:00',
            description: 'Ужин в нашем любимом ресторане',
            type: 'dinner'
        }
    ];
    
    sharedStore.gifts = [
        {
            id: 'gift_demo_1',
            giftId: 'hug',
            emoji: '🤗',
            name: 'Обнимашки',
            message: 'Обнимаю тебя крепко! 💕',
            from: 'admin',
            to: 'user',
            date: new Date().toISOString(),
            opened: false
        }
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
        const days = Math.floor((new Date() - new Date(sharedStore.profile.coupleDateRaw)) / 86400000);
        sharedStore.stats.daysTogether = Math.max(0, days);
    }
    
    sharedStore.stats.lettersReceived = sharedStore.letters.length;
    sharedStore.stats.giftsReceived = sharedStore.gifts.length;
    sharedStore._version++;
}

initDemoData();

// ========== API ROUTES ==========

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
            profile: sharedStore.profile,
            stats: sharedStore.stats
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
        id: 'notif_' + Date.now(),
        type: 'letter',
        letterId: letter.id,
        message: `Новое письмо: "${letter.subject || 'Без темы'}"`,
        preview: (letter.text || '').substring(0, 50),
        date: new Date().toISOString(),
        read: false
    });
    
    bumpVersion();
    sendBotNotification(`💌 Новое письмо: "${letter.subject || 'Без темы'}"`);
    
    res.json({ ok: true, letter, version: sharedStore._version });
});

app.put('/api/letters/:id', (req, res) => {
    const idx = sharedStore.letters.findIndex(l => l.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    Object.assign(sharedStore.letters[idx], req.body);
    bumpVersion();
    res.json({ ok: true, letter: sharedStore.letters[idx], version: sharedStore._version });
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
        id: 'notif_' + Date.now(),
        type: 'reply',
        letterId: req.params.id,
        message: `Ответ на "${sharedStore.letters[idx].subject || 'письмо'}"`,
        preview: (reply.text || '').substring(0, 50),
        date: new Date().toISOString(),
        read: false
    });
    
    bumpVersion();
    sendBotNotification(`💬 Новый ответ: "${(reply.text || '').substring(0, 40)}..."`);
    
    res.json({ ok: true, version: sharedStore._version });
});

app.post('/api/letters/:id/reaction', (req, res) => {
    const idx = sharedStore.letters.findIndex(l => l.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    
    if (!sharedStore.letters[idx].reactions) sharedStore.letters[idx].reactions = [];
    sharedStore.letters[idx].reactions.push({
        emoji: req.body.emoji,
        from: req.body.from,
        date: new Date().toISOString()
    });
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
    bumpVersion();
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
    bumpVersion();
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
        id: 'notif_' + Date.now(),
        type: 'gift',
        message: `${gift.from === 'admin' ? 'Любимый' : 'Любимая'} подарил(а) ${gift.emoji} ${gift.name}!`,
        date: new Date().toISOString(),
        read: false
    });
    
    bumpVersion();
    sendBotNotification(`🎁 Новый подарок: ${gift.emoji} ${gift.name}!`);
    
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
    
    const albumIdx = sharedStore.albums.findIndex(a => a.id === photo.albumId);
    if (albumIdx >= 0) {
        sharedStore.albums[albumIdx].photoCount = (sharedStore.albums[albumIdx].photoCount || 0) + 1;
    }
    
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

// ===== PROFILE =====
app.get('/api/profile', (req, res) => {
    res.json(sharedStore.profile);
});

app.put('/api/profile', (req, res) => {
    Object.assign(sharedStore.profile, req.body);
    if (req.body.coupleDateRaw) {
        const days = Math.floor((new Date() - new Date(req.body.coupleDateRaw)) / 86400000);
        sharedStore.stats.daysTogether = Math.max(0, days);
    }
    bumpVersion();
    res.json({ ok: true, profile: sharedStore.profile, version: sharedStore._version });
});

// ===== STATS =====
app.get('/api/stats', (req, res) => {
    if (sharedStore.profile.coupleDateRaw) {
        const days = Math.floor((new Date() - new Date(sharedStore.profile.coupleDateRaw)) / 86400000);
        sharedStore.stats.daysTogether = Math.max(0, days);
    }
    res.json(sharedStore.stats);
});

// ===== NOTIFICATIONS =====
app.get('/api/notifications', (req, res) => {
    res.json(sharedStore.notifications);
});

app.put('/api/notifications/read-all', (req, res) => {
    sharedStore.notifications.forEach(n => n.read = true);
    bumpVersion();
    res.json({ ok: true });
});

app.put('/api/notifications/:id/read', (req, res) => {
    const n = sharedStore.notifications.find(n => n.id === req.params.id);
    if (n) n.read = true;
    bumpVersion();
    res.json({ ok: true });
});

// ===== ORDERS =====
app.post('/api/orders', (req, res) => {
    const order = req.body;
    if (!order.id) order.id = 'order_' + Date.now();
    if (!order.date) order.date = new Date().toISOString();
    if (!order.status) order.status = 'pending';
    
    sharedStore.orders.push(order);
    
    sharedStore.notifications.unshift({
        id: 'notif_' + Date.now(),
        type: 'order',
        message: `Новый заказ: ${order.itemId} за ${order.price} ⭐`,
        date: new Date().toISOString(),
        read: false
    });
    
    bumpVersion();
    sendBotNotification(`🛒 Новый заказ: ${order.itemId} за ${order.price} ⭐`);
    
    res.json({ ok: true, version: sharedStore._version });
});

app.put('/api/orders/:id', (req, res) => {
    const idx = sharedStore.orders.findIndex(o => o.id === req.params.id);
    if (idx >= 0) {
        Object.assign(sharedStore.orders[idx], req.body);
        bumpVersion();
    }
    res.json({ ok: true, version: sharedStore._version });
});

// ===== GOALS =====
app.get('/api/goals', (req, res) => {
    res.json(sharedStore.goals);
});

app.post('/api/goals', (req, res) => {
    const goal = req.body;
    if (!goal.id) goal.id = 'goal_' + Date.now();
    sharedStore.goals.push(goal);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

app.put('/api/goals/:id', (req, res) => {
    const idx = sharedStore.goals.findIndex(g => g.id === req.params.id);
    if (idx >= 0) {
        Object.assign(sharedStore.goals[idx], req.body);
        bumpVersion();
    }
    res.json({ ok: true, version: sharedStore._version });
});

app.delete('/api/goals/:id', (req, res) => {
    sharedStore.goals = sharedStore.goals.filter(g => g.id !== req.params.id);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

// ===== QUICK NOTES =====
app.get('/api/notes', (req, res) => {
    res.json(sharedStore.quickNotes);
});

app.post('/api/notes', (req, res) => {
    const note = req.body;
    if (!note.id) note.id = 'note_' + Date.now();
    if (!note.date) note.date = new Date().toISOString();
    sharedStore.quickNotes.unshift(note);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

app.delete('/api/notes/:id', (req, res) => {
    sharedStore.quickNotes = sharedStore.quickNotes.filter(n => n.id !== req.params.id);
    bumpVersion();
    res.json({ ok: true, version: sharedStore._version });
});

// ===== RESET =====
app.post('/api/reset', (req, res) => {
    sharedStore.letters = [];
    sharedStore.events = [];
    sharedStore.gifts = [];
    sharedStore.albums = [];
    sharedStore.photos = [];
    sharedStore.specialDates = [];
    sharedStore.notifications = [];
    sharedStore.orders = [];
    sharedStore.goals = [];
    sharedStore.quickNotes = [];
    sharedStore.profile = {
        userName: 'Любимая', adminName: 'Любимый', userStatus: '',
        coupleDate: '22 октября 2023', coupleDateRaw: '2023-10-22',
        notifications: true, theme: 'pink', userStars: 50, adminStars: 100,
        avatarEmoji: null, avatarUrl: null
    };
    sharedStore.stats = { daysTogether: 0, lettersReceived: 0, giftsReceived: 0, eventsMade: 0, reactionsGiven: 0 };
    bumpVersion();
    initDemoData();
    res.json({ ok: true });
});

// ===== HEALTH =====
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), version: sharedStore._version, botActive: !!bot });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// ========== BOT (с защитой от ошибок) ==========
let bot = null;
let botChatIds = new Set();

function sendBotNotification(message) {
    if (!bot) return;
    botChatIds.forEach(chatId => {
        bot.sendMessage(chatId, message).catch(err => {
            console.log(`Failed to send to ${chatId}:`, err.message);
        });
    });
}

// Инициализация бота только если токен указан
if (BOT_TOKEN && BOT_TOKEN !== 'YOUR_TOKEN' && BOT_TOKEN.length > 20) {
    try {
        bot = new TelegramBot(BOT_TOKEN, { 
            polling: {
                interval: 1000,
                autoStart: true,
                params: { timeout: 10 }
            }
        });
        
        // Обработка ошибок polling
        bot.on('polling_error', (err) => {
            if (err.code === 'ETELEGRAM' && err.message.includes('409')) {
                console.log('⚠️ Bot conflict: another instance running. Stopping polling...');
                bot.stopPolling();
            } else if (err.code === 'ETELEGRAM' && err.message.includes('404')) {
                console.log('❌ Invalid bot token! Please check BOT_TOKEN environment variable.');
                bot.stopPolling();
                bot = null;
            } else {
                console.log('Bot polling error:', err.code, err.message);
            }
        });

        bot.on('error', (err) => {
            console.log('Bot error:', err.message);
        });

        bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            botChatIds.add(chatId);
            const name = msg.from.first_name || 'Любимая';

            bot.sendMessage(chatId,
                `💕 Привет, ${name}!\n\nДобро пожаловать в Love App!\nЗдесь тебя ждут письма, подарки и сюрпризы ✨`,
                {
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '💕 Открыть приложение', web_app: { url: WEBAPP_URL } }
                        ]]
                    }
                }
            ).catch(console.error);
        });

        bot.onText(/\/menu/, (msg) => {
            botChatIds.add(msg.chat.id);
            bot.sendMessage(msg.chat.id, '📱 Главное меню:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '💕 Открыть', web_app: { url: WEBAPP_URL } }],
                        [
                            { text: '💌 Письма', web_app: { url: WEBAPP_URL + '#letters' } },
                            { text: '🎁 Подарки', web_app: { url: WEBAPP_URL + '#gifts' } }
                        ],
                        [
                            { text: '📅 Календарь', web_app: { url: WEBAPP_URL + '#calendar' } },
                            { text: '👤 Профиль', web_app: { url: WEBAPP_URL + '#profile' } }
                        ]
                    ]
                }
            }).catch(console.error);
        });

        bot.onText(/\/love/, (msg) => {
            botChatIds.add(msg.chat.id);
            const compliments = [
                'Ты освещаешь мой мир ярче тысячи звёзд ⭐',
                'Каждый день с тобой — подарок судьбы 🎁',
                'Ты самая красивая во вселенной 💫',
                'Я влюбляюсь в тебя сильнее каждый день 💗',
                'Ты делаешь мою жизнь волшебной ✨',
                'Рядом с тобой я самый счастливый 🥰'
            ];
            const text = compliments[Math.floor(Math.random() * compliments.length)];
            bot.sendMessage(msg.chat.id, `💕 ${text}`).catch(console.error);
        });

        bot.onText(/\/days/, (msg) => {
            botChatIds.add(msg.chat.id);
            const days = sharedStore.stats.daysTogether || 0;
            bot.sendMessage(msg.chat.id, 
                `💑 Мы вместе ${days} дней!\n💕 С ${sharedStore.profile.coupleDate || '22 октября 2023'}`
            ).catch(console.error);
        });

        bot.onText(/\/stats/, (msg) => {
            botChatIds.add(msg.chat.id);
            const s = sharedStore.stats;
            bot.sendMessage(msg.chat.id,
                `📊 Статистика Love App:\n\n` +
                `💑 Дней вместе: ${s.daysTogether}\n` +
                `💌 Писем: ${s.lettersReceived}\n` +
                `🎁 Подарков: ${s.giftsReceived}\n` +
                `📅 Событий: ${s.eventsMade}\n` +
                `😊 Реакций: ${s.reactionsGiven}`
            ).catch(console.error);
        });

        bot.onText(/\/help/, (msg) => {
            botChatIds.add(msg.chat.id);
            bot.sendMessage(msg.chat.id,
                `📖 Команды:\n\n` +
                `/start — Запустить бота\n` +
                `/menu — Главное меню\n` +
                `/love — Получить комплимент\n` +
                `/days — Дней вместе\n` +
                `/stats — Статистика\n` +
                `/help — Справка`
            ).catch(console.error);
        });

        console.log('🤖 Bot initialized successfully!');
        
    } catch (e) {
        console.error('❌ Bot initialization failed:', e.message);
        bot = null;
    }
} else {
    console.log('⚠️ BOT_TOKEN not configured. Bot features disabled.');
    console.log('   Set BOT_TOKEN environment variable to enable the bot.');
}