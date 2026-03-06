// js/notifications.js — Уведомления (только admin/user, не guest)

class NotificationManager {
    constructor(storage) {
        this.storage = storage;
        this.checkInterval = null;
        this.lastCheck = Date.now();
    }

    init() {
        // Гости не получают уведомлений
        if (window.app?.isGuest) return;
        
        this.startPolling();
        this.requestPermission();
    }

    requestPermission() {
        if (window.app?.isGuest) return;
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    startPolling() {
        // Гости не получают уведомлений
        if (window.app?.isGuest) return;
        
        this.checkInterval = setInterval(() => {
            this.checkNewNotifications();
        }, 3000);
    }

    stopPolling() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    checkNewNotifications() {
        // Гости не получают уведомлений
        if (window.app?.isGuest) return;

        const notifications = this.storage.getNotifications();
        const newNotifs = notifications.filter(n =>
            !n.read && new Date(n.date).getTime() > this.lastCheck
        );

        if (newNotifs.length > 0) {
            this.showInAppNotification(newNotifs[0]);
            this.lastCheck = Date.now();
        }

        this.updateNotificationBadge();
    }

    showInAppNotification(notification) {
        // Гости не получают уведомлений
        if (window.app?.isGuest) return;

        document.getElementById('inAppNotif')?.remove();

        const typeIcons = {
            letter: '💌',
            reply: '💬',
            gift: '🎁',
            order: '🛒',
            stars: '⭐',
            event: '📅',
            system: '🔔',
            wishlist: '🎁'
        };

        const html = `
            <div class="in-app-notification" id="inAppNotif" 
                 onclick="app.notifications.openNotification('${notification.id}')">
                <div class="notif-icon">${typeIcons[notification.type] || '🔔'}</div>
                <div class="notif-content">
                    <div class="notif-message">${notification.message}</div>
                    ${notification.preview 
                        ? `<div class="notif-preview">${notification.preview}</div>` 
                        : ''}
                </div>
                <button class="notif-close" 
                        onclick="event.stopPropagation(); document.getElementById('inAppNotif').remove()">
                    ✕
                </button>
                <div class="notif-progress"></div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);

        setTimeout(() => {
            const el = document.getElementById('inAppNotif');
            if (el) {
                el.classList.add('hiding');
                setTimeout(() => el.remove(), 500);
            }
        }, 5000);
    }

    showBrowserNotification(notification) {
        if (window.app?.isGuest) return;
        
        if ('Notification' in window && Notification.permission === 'granted') {
            const profile = this.storage.getProfile();
            if (!profile.notifications) return;

            new Notification('💕 Love App', {
                body: notification.message,
                icon: '💕',
                tag: notification.id
            });
        }
    }

    updateNotificationBadge() {
        const count = window.app?.isGuest ? 0 : this.storage.getUnreadNotificationsCount();
        
        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    openNotificationCenter() {
        // Гости видят пустой центр
        if (window.app?.isGuest) {
            const html = `
                <div class="notif-center-overlay active" id="notifCenterOverlay">
                    <div class="notif-center">
                        <div class="notif-center-header">
                            <button class="notif-center-close" 
                                    onclick="document.getElementById('notifCenterOverlay').remove()">✕</button>
                            <h2>🔔 Уведомления</h2>
                        </div>
                        <div class="notif-center-content">
                            <div class="notif-empty">
                                <span>👀</span>
                                <p>Гостям уведомления недоступны</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            return;
        }

        const notifications = this.storage.getNotifications();
        
        const html = `
            <div class="notif-center-overlay active" id="notifCenterOverlay">
                <div class="notif-center">
                    <div class="notif-center-header">
                        <button class="notif-center-close" 
                                onclick="document.getElementById('notifCenterOverlay').remove()">✕</button>
                        <h2>🔔 Уведомления</h2>
                        ${notifications.some(n => !n.read) ? `
                            <button class="notif-mark-all" 
                                    onclick="app.notifications.markAllRead()">
                                Прочитать все
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="notif-center-content">
                        ${notifications.length === 0 
                            ? `<div class="notif-empty">
                                    <span>🔕</span>
                                    <p>Нет уведомлений</p>
                               </div>`
                            : notifications.map(n => this.renderNotifItem(n)).join('')
                        }
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    renderNotifItem(notification) {
        const date = new Date(notification.date);
        const timeAgo = this.getTimeAgo(date);
        
        const typeIcons = {
            letter: '💌',
            reply: '💬',
            gift: '🎁',
            order: '🛒',
            stars: '⭐',
            event: '📅',
            system: '🔔',
            wishlist: '🎁'
        };

        return `
            <div class="notif-item ${notification.read ? '' : 'unread'}" 
                 onclick="app.notifications.openNotification('${notification.id}')">
                <div class="notif-item-icon">${typeIcons[notification.type] || '🔔'}</div>
                <div class="notif-item-content">
                    <div class="notif-item-message">${notification.message}</div>
                    ${notification.preview 
                        ? `<div class="notif-item-preview">${notification.preview}</div>` 
                        : ''}
                    <div class="notif-item-time">${timeAgo}</div>
                </div>
                ${!notification.read ? '<div class="notif-item-dot"></div>' : ''}
            </div>
        `;
    }

    openNotification(notifId) {
        if (window.app?.isGuest) return;

        this.storage.markNotificationRead(notifId);
        
        const notif = this.storage.getNotifications().find(n => n.id === notifId);
        if (!notif) return;

        document.getElementById('notifCenterOverlay')?.remove();

        switch (notif.type) {
            case 'letter':
            case 'reply':
                window.app?.navigateTo('letters');
                if (notif.letterId) {
                    setTimeout(() => window.app?.letters?.openLetter(notif.letterId), 300);
                }
                break;
            case 'gift':
            case 'stars':
                window.app?.navigateTo('gifts');
                break;
            case 'order':
                window.app?.navigateTo('admin');
                break;
            case 'wishlist':
                window.app?.navigateTo('wishlist');
                break;
            case 'event':
                window.app?.navigateTo('calendar');
                break;
            default:
                window.app?.navigateTo('home');
        }

        this.updateNotificationBadge();
    }

    markAllRead() {
        if (window.app?.isGuest) return;

        this.storage.markAllNotificationsRead();
        
        document.querySelectorAll('.notif-item').forEach(item => {
            item.classList.remove('unread');
            const dot = item.querySelector('.notif-item-dot');
            if (dot) dot.remove();
        });
        
        const markBtn = document.querySelector('.notif-mark-all');
        if (markBtn) markBtn.remove();
        
        this.updateNotificationBadge();
        window.app?.showToast('Все прочитано! ✓');
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} ч назад`;
        if (days < 7) return `${days} дн назад`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
}

window.NotificationManager = NotificationManager;