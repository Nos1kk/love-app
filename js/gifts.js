// js/gifts.js — Система подарков: звёзды, деньги, виртуальные подарки

class GiftsManager {
    constructor(storage, isAdmin = false) {
        this.storage = storage;
        this.isAdmin = isAdmin;

        this.giftsCatalog = [
            { id: 'rose', emoji: '🌹', name: 'Роза', price: 1, category: 'flowers' },
            { id: 'bouquet', emoji: '💐', name: 'Букет', price: 5, category: 'flowers' },
            { id: 'tulips', emoji: '🌷', name: 'Тюльпаны', price: 3, category: 'flowers' },
            { id: 'sunflower', emoji: '🌻', name: 'Подсолнух', price: 2, category: 'flowers' },
            { id: 'chocolate', emoji: '🍫', name: 'Шоколад', price: 2, category: 'sweets' },
            { id: 'candy', emoji: '🍬', name: 'Конфеты', price: 1, category: 'sweets' },
            { id: 'cake', emoji: '🎂', name: 'Торт', price: 8, category: 'sweets' },
            { id: 'icecream', emoji: '🍦', name: 'Мороженое', price: 2, category: 'sweets' },
            { id: 'teddy', emoji: '🧸', name: 'Мишка', price: 10, category: 'toys' },
            { id: 'heart', emoji: '💝', name: 'Сердце', price: 5, category: 'love' },
            { id: 'ring', emoji: '💍', name: 'Кольцо', price: 50, category: 'luxury' },
            { id: 'diamond', emoji: '💎', name: 'Бриллиант', price: 100, category: 'luxury' },
            { id: 'star', emoji: '⭐', name: 'Звезда', price: 3, category: 'special' },
            { id: 'crown', emoji: '👑', name: 'Корона', price: 25, category: 'luxury' },
            { id: 'letter', emoji: '💌', name: 'Любовное письмо', price: 1, category: 'love' },
            { id: 'kiss', emoji: '💋', name: 'Поцелуй', price: 1, category: 'love' },
            { id: 'hug', emoji: '🤗', name: 'Обнимашки', price: 0, category: 'love' },
            { id: 'moon', emoji: '🌙', name: 'Луна', price: 15, category: 'special' },
            { id: 'rainbow', emoji: '🌈', name: 'Радуга', price: 20, category: 'special' },
            { id: 'butterfly', emoji: '🦋', name: 'Бабочка', price: 4, category: 'special' },
        ];

        this.categories = [
            { id: 'all', emoji: '🎁', name: 'Все' },
            { id: 'love', emoji: '💕', name: 'Любовь' },
            { id: 'flowers', emoji: '🌸', name: 'Цветы' },
            { id: 'sweets', emoji: '🍭', name: 'Сладости' },
            { id: 'toys', emoji: '🧸', name: 'Игрушки' },
            { id: 'luxury', emoji: '💎', name: 'Люкс' },
            { id: 'special', emoji: '⭐', name: 'Особые' },
        ];
    }


    // БАГ: в openGiftShop() есть onclick="app.gifts.closeGiftShop()"
    // но самого метода нет в классе!

    // ИСПРАВЛЕНИЕ — добавить в класс GiftsManager:
    closeGiftShop() {
        const overlay = document.getElementById('giftShopOverlay');
        if (overlay) overlay.remove();
    }

    // ========== МАГАЗИН ПОДАРКОВ ==========
    openGiftShop() {
        const balance = this.storage.getProfile().giftBalance || 0;
        

        const html = `
            <div class="gift-shop-overlay active" id="giftShopOverlay">
                <div class="gift-shop">
                    <div class="gift-shop-header">
                        <button class="gift-shop-close" onclick="app.gifts.closeGiftShop()">✕</button>
                        <h2>🎁 Магазин подарков</h2>
                        <div class="gift-balance">
                            <span class="balance-icon">⭐</span>
                            <span class="balance-amount" id="giftBalance">${balance}</span>
                        </div>
                    </div>

                    <div class="gift-categories" id="giftCategories">
                        ${this.categories.map(c => `
                            <button class="gift-cat-btn ${c.id === 'all' ? 'active' : ''}" 
                                    onclick="app.gifts.filterGifts('${c.id}', this)">
                                ${c.emoji} ${c.name}
                            </button>
                        `).join('')}
                    </div>

                    <div class="gift-grid" id="giftGrid">
                        ${this.renderGiftGrid('all')}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    renderGiftGrid(category) {
        const gifts = category === 'all' 
            ? this.giftsCatalog 
            : this.giftsCatalog.filter(g => g.category === category);

        return gifts.map(g => `
            <div class="gift-item" onclick="app.gifts.selectGift('${g.id}')">
                <div class="gift-item-emoji">${g.emoji}</div>
                <div class="gift-item-name">${g.name}</div>
                <div class="gift-item-price">
                    ${g.price === 0 ? 'Бесплатно' : `${g.price} ⭐`}
                </div>
            </div>
        `).join('');
    }

    filterGifts(category, btn) {
        document.querySelectorAll('.gift-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const grid = document.getElementById('giftGrid');
        if (grid) {
            grid.innerHTML = this.renderGiftGrid(category);
        }
    }

    selectGift(giftId) {
        const gift = this.giftsCatalog.find(g => g.id === giftId);
        if (!gift) return;

        const balance = this.storage.getProfile().giftBalance || 0;

        const html = `
            <div class="gift-confirm-overlay active" id="giftConfirmOverlay">
                <div class="gift-confirm-modal">
                    <div class="gift-confirm-emoji">${gift.emoji}</div>
                    <h2>Подарить ${gift.name}?</h2>
                    <p class="gift-confirm-price">
                        ${gift.price === 0 ? 'Бесплатно! 💕' : `Стоимость: ${gift.price} ⭐`}
                    </p>
                    ${gift.price > balance ? `
                        <p class="gift-insufficient">Недостаточно звёзд! (у вас ${balance} ⭐)</p>
                    ` : ''}
                    
                    <div class="gift-confirm-field">
                        <label>Сообщение к подарку (необязательно)</label>
                        <textarea class="admin-textarea" id="giftMessage" rows="2" 
                                  placeholder="Например: Потому что ты лучшая! 💕"></textarea>
                    </div>

                    <div class="gift-confirm-actions">
                        <button class="gift-cancel-btn" onclick="document.getElementById('giftConfirmOverlay').remove()">
                            Отмена
                        </button>
                        <button class="gift-send-btn ${gift.price > balance ? 'disabled' : ''}" 
                                onclick="app.gifts.sendGift('${gift.id}')"
                                ${gift.price > balance ? 'disabled' : ''}>
                            🎁 Подарить!
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    sendGift(giftId) {
        const gift = this.giftsCatalog.find(g => g.id === giftId);
        if (!gift) return;

        const profile = this.storage.getProfile();
        
        // ИСПРАВЛЕНО: Используем раздельные балансы
        const balanceKey = this.isAdmin ? 'adminStars' : 'userStars';
        const balance = profile[balanceKey] || 0;
        
        if (gift.price > balance) return;

        const message = document.getElementById('giftMessage')?.value?.trim() || '';

        // Списать звёзды ТОЛЬКО у отправителя
        this.storage.updateProfile({ [balanceKey]: balance - gift.price });

        // Сохранить подарок
        const giftRecord = {
            id: 'gift_' + Date.now(),
            giftId: gift.id,
            emoji: gift.emoji,
            name: gift.name,
            message,
            from: this.isAdmin ? 'admin' : 'user',
            to: this.isAdmin ? 'user' : 'admin',
            date: new Date().toISOString(),
            opened: false
        };

        this.storage.addGift(giftRecord);

        // Начислить звёзды получателю (если подарок — звёзды)
        if (gift.id === 'star' || gift.category === 'special') {
            const receiverKey = this.isAdmin ? 'userStars' : 'adminStars';
            const receiverBalance = profile[receiverKey] || 0;
            this.storage.updateProfile({ [receiverKey]: receiverBalance + gift.price });
        }

        // Уведомление получателю
        const notifications = this.storage.get('notifications') || [];
        notifications.push({
            id: 'notif_' + Date.now(),
            type: 'gift',
            message: `${this.isAdmin ? 'Любимый' : 'Любимая'} подарил(а) ${gift.emoji} ${gift.name}!`,
            date: new Date().toISOString(),
            read: false
        });
        this.storage.set('notifications', notifications);

        document.getElementById('giftConfirmOverlay')?.remove();
        this.closeGiftShop();

        window.app?.effects?.launchConfetti(80);
        window.app?.toast?.show(`${gift.emoji} ${gift.name} подарен! 🎉`);
    }

    openGift(giftId) {
        const gift = this.storage.getGift(giftId);
        if (!gift) return;

        if (!gift.opened) {
            // Анимация открытия
            this.storage.markGiftOpened(giftId);
            gift.opened = true;

            window.app?.effects?.launchConfetti(50);
            window.app?.effects?.showFireworks();
        }

        const html = `
            <div class="gift-open-overlay active" id="giftOpenOverlay" onclick="if(event.target===this) this.remove()">
                <div class="gift-open-modal">
                    <button class="gift-open-close" onclick="document.getElementById('giftOpenOverlay').remove()">✕</button>
                    <div class="gift-open-emoji">${gift.emoji}</div>
                    <h2>${gift.name}</h2>
                    <p class="gift-open-from">От: ${gift.from === 'admin' ? '💝 Любимого' : '👸 Любимой'}</p>
                    ${gift.message ? `<p class="gift-open-message">"${gift.message}"</p>` : ''}
                    <p class="gift-open-date">${new Date(gift.date).toLocaleDateString('ru-RU', { 
                        day: 'numeric', month: 'long', year: 'numeric' 
                    })}</p>
                    <button class="modal-btn" onclick="document.getElementById('giftOpenOverlay').remove()">
                        Спасибо! 💕
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }
}

window.GiftsManager = GiftsManager;GiftsManager