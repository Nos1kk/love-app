const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

// ========== КОНФИГУРАЦИЯ ==========
const BOT_TOKEN = process.env.BOT_TOKEN || '8571890995:AAGls0kbQVVFt6FSHz20LwpQ5-YztJNpoX4';
const PORT = process.env.PORT || 3000;

// ВАЖНО: этот URL ты заменишь после создания проекта в Amvera
// Формат: https://love-app-ИМЯ.amvera.io
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://love-app.amvera.io';

// ========== EXPRESS ==========
const appServer = express();

appServer.use(express.static(path.join(__dirname)));
appServer.use(express.json());

// Health check — Amvera проверяет что сервер жив
appServer.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

appServer.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

appServer.post('/api/notify', (req, res) => {
    const { userId, message } = req.body;
    if (userId && message) {
        bot.sendMessage(userId, message).catch(console.error);
        res.json({ ok: true });
    } else {
        res.status(400).json({ error: 'Missing data' });
    }
});

// Слушаем на 0.0.0.0 — обязательно для Amvera!
appServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌐 WebApp URL: ${WEBAPP_URL}`);
});

// ========== TELEGRAM BOT ==========
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Любимая';

    bot.sendMessage(chatId,
        `💕 Привет, ${firstName}!\n\n` +
        `Добро пожаловать в наше приложение!\n` +
        `Здесь тебя ждут письма, подарки и сюрпризы ✨\n\n` +
        `Нажми кнопку ниже, чтобы открыть 👇`,
        {
            reply_markup: {
                inline_keyboard: [[
                    { text: '💕 Открыть приложение', web_app: { url: WEBAPP_URL } }
                ]]
            }
        }
    );
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
                    { text: '📸 Фото', web_app: { url: WEBAPP_URL + '#gallery' } }
                ]
            ]
        }
    });
});

bot.onText(/\/love/, (msg) => {
    const compliments = [
        'Ты освещаешь мой мир ярче тысячи звёзд ⭐',
        'Каждый день с тобой — подарок судьбы 🎁',
        'Ты самая красивая во вселенной 💫',
        'Я влюбляюсь в тебя сильнее каждый день 💗',
        'Рядом с тобой я самый счастливый 🥰',
    ];
    bot.sendMessage(msg.chat.id, `💕 ${compliments[Math.floor(Math.random() * compliments.length)]}`);
});

bot.onText(/\/days/, (msg) => {
    const days = Math.floor((new Date() - new Date('2023-10-22')) / 86400000);
    bot.sendMessage(msg.chat.id, `💑 Мы вместе уже ${days} дней!\n📅 С 22 октября 2023\n\nКаждый день — счастье! 💕`);
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
            bot.sendMessage(msg.chat.id, `🛒 Заказ!\n📦 ${data.itemName}\n⭐ ${data.price} звёзд`);
        }
    } catch (e) {
        console.error('WebApp data error:', e);
    }
});

console.log('🤖 Бот запущен!');