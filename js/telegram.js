// js/telegram.js — Интеграция с Telegram WebApp API

class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.isReady = false;
    }

    init() {
        if (!this.tg) {
            console.log('📱 Telegram WebApp не обнаружен (работаем в браузере)');
            return false;
        }

        // Инициализация
        this.tg.ready();
        this.tg.expand();
        this.isReady = true;

        // Получить данные пользователя
        this.user = this.tg.initDataUnsafe?.user;
        if (this.user) {
            console.log('👤 TG User:', this.user.first_name, this.user.id);
        }

        // Применить тему Telegram
        this.applyTelegramTheme();

        // Настроить кнопки
        this.setupBackButton();

        // Haptic feedback
        this.setupHaptics();

        // Обработка hash навигации
        this.handleHashNavigation();

        console.log('📱 Telegram WebApp инициализирован!');
        return true;
    }

    // ========== ТЕМА ==========
    applyTelegramTheme() {
        if (!this.tg?.themeParams) return;

        const params = this.tg.themeParams;
        const root = document.documentElement;

        // Если тёмная тема в TG
        if (this.tg.colorScheme === 'dark') {
            document.body.classList.add('dark-theme');
            root.style.setProperty('--gradient-main', 
                'linear-gradient(135deg, #2D2D44 0%, #1A1A2E 50%, #16213E 100%)');
            root.style.setProperty('--gradient-card', 
                'linear-gradient(145deg, #2D2D44 0%, #1A1A2E 100%)');
            root.style.setProperty('--text-dark', '#FFFFFF');
            root.style.setProperty('--text-light', '#B0B0B0');
        }

        // Применить цвета из TG
        if (params.bg_color) {
            root.style.setProperty('--tg-bg', params.bg_color);
        }
        if (params.text_color) {
            root.style.setProperty('--tg-text', params.text_color);
        }

        // Viewport
        this.tg.setHeaderColor('#FF4778');
        this.tg.setBackgroundColor(
            this.tg.colorScheme === 'dark' ? '#1A1A2E' : '#FFE4F0'
        );
    }

    // ========== BACK BUTTON ==========
    setupBackButton() {
        if (!this.tg?.BackButton) return;

        this.tg.BackButton.onClick(() => {
            if (window.app?.currentPage !== 'home') {
                window.app.navigateTo('home');
            } else {
                this.tg.close();
            }
        });
    }

    showBackButton() {
        this.tg?.BackButton?.show();
    }

    hideBackButton() {
        this.tg?.BackButton?.hide();
    }

    // ========== MAIN BUTTON ==========
    showMainButton(text, callback) {
        if (!this.tg?.MainButton) return;
        
        this.tg.MainButton.text = text;
        this.tg.MainButton.color = '#FF4778';
        this.tg.MainButton.textColor = '#FFFFFF';
        this.tg.MainButton.onClick(callback);
        this.tg.MainButton.show();
    }

    hideMainButton() {
        this.tg?.MainButton?.hide();
    }

    // ========== HAPTIC FEEDBACK ==========
    setupHaptics() {
        if (!this.tg?.HapticFeedback) return;

        // Добавить вибрацию при кликах
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.closest('.nav-item') || target.closest('.menu-item') || 
                target.closest('.nav-center-btn')) {
                this.tg.HapticFeedback.impactOccurred('light');
            }
            
            if (target.closest('.modal-btn') || target.closest('.admin-submit-btn') ||
                target.closest('.compose-send') || target.closest('.reply-send-new')) {
                this.tg.HapticFeedback.impactOccurred('medium');
            }
            
            if (target.closest('.reaction-sticker') || target.closest('.mood-btn') ||
                target.closest('.sticker-item')) {
                this.tg.HapticFeedback.selectionChanged();
            }
        });
    }

    hapticLight() {
        this.tg?.HapticFeedback?.impactOccurred('light');
    }

    hapticMedium() {
        this.tg?.HapticFeedback?.impactOccurred('medium');
    }

    hapticHeavy() {
        this.tg?.HapticFeedback?.impactOccurred('heavy');
    }

    hapticSuccess() {
        this.tg?.HapticFeedback?.notificationOccurred('success');
    }

    hapticError() {
        this.tg?.HapticFeedback?.notificationOccurred('error');
    }

    // ========== HASH НАВИГАЦИЯ ==========
    handleHashNavigation() {
        const hash = window.location.hash.replace('#', '');
        if (hash && window.app) {
            setTimeout(() => {
                window.app.navigateTo(hash);
            }, 500);
        }
    }

    // ========== ОТПРАВКА ДАННЫХ В БОТА ==========
    sendData(data) {
        if (!this.tg) return;
        try {
            this.tg.sendData(JSON.stringify(data));
        } catch (e) {
            console.error('TG sendData error:', e);
        }
    }

    // Отправить заказ
    sendOrder(itemId, itemName, price) {
        this.sendData({
            type: 'order',
            itemId,
            itemName,
            price,
            date: new Date().toISOString()
        });
    }

    // Отправить уведомление об ответе
    sendReplyNotification(letterId, preview) {
        this.sendData({
            type: 'reply',
            letterId,
            preview: preview.substring(0, 100)
        });
    }

    // ========== ПОЛУЧИТЬ ИМЯ ПОЛЬЗОВАТЕЛЯ ==========
    getUserName() {
        return this.user?.first_name || null;
    }

    getUserId() {
        return this.user?.id || null;
    }

    // ========== ЗАКРЫТЬ ПРИЛОЖЕНИЕ ==========
    close() {
        this.tg?.close();
    }
}

window.TelegramIntegration = TelegramIntegration;