const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_TOKEN';
const PORT = process.env.PORT || 3000;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://love-app.amvera.io';

const app = express();

// Безопасные заголовки
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.use(express.static(path.join(__dirname), {
    maxAge: '1h',
    etag: true
}));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/notify', (req, res) => {
    const { userId, message } = req.body;
    if (userId && message) {
        bot.sendMessage(userId, message).catch(console.error);
        res.json({ ok: true });
    } else {
        res.status(400).json({ error: 'Missing data' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server on port ${PORT}`);
});

// ========== BOT ==========
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name || 'Любимая';

    bot.sendPhoto(chatId, 'https://i.imgur.com/placeholder.jpg', {
        caption: `💕 Привет, ${name}!\n\nДобро пожаловать в наше приложение любви!\nЗдесь тебя ждут письма, подарки и сюрпризы ✨`,
        reply_markup: {
            inline_keyboard: [[
                { text: '💕 Открыть приложение', web_app: { url: WEBAPP_URL } }
            ]]
        }
    }).catch(() => {
        bot.sendMessage(chatId,
            `💕 Привет, ${name}!\n\nОткрой наше приложение любви! ✨`,
            {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '💕 Открыть', web_app: { url: WEBAPP_URL } }
                    ]]
                }
            }
        );
    });
});

bot.onText(/\/menu/, (msg) => {
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
    });
});

bot.onText(/\/love/, (msg) => {
    const c = [
        'Ты освещаешь мой мир ярче тысячи звёзд ⭐',
        'Каждый день с тобой — подарок судьбы 🎁',
        'Ты самая красивая во вселенной 💫',
        'Я влюбляюсь в тебя сильнее каждый день 💗',
    ];
    bot.sendMessage(msg.chat.id, `💕 ${c[Math.floor(Math.random() * c.length)]}`);
});

bot.onText(/\/days/, (msg) => {
    const days = Math.floor((new Date() - new Date('2023-10-22')) / 86400000);
    bot.sendMessage(msg.chat.id, `💑 Мы вместе ${days} дней!\n💕 С 22 октября 2023`);
});

bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id,
        `📖 Команды:\n\n/start — Запустить\n/menu — Меню\n/love — Комплимент\n/days — Дней вместе\n/help — Помощь`
    );
});

bot.on('web_app_data', (msg) => {
    try {
        const data = JSON.parse(msg.web_app_data.data);
        if (data.type === 'order') {
            bot.sendMessage(msg.chat.id, `🛒 Заказ: ${data.itemName} за ${data.price} ⭐`);
        }
    } catch (e) { console.error(e); }
});

console.log('🤖 Bot started!');