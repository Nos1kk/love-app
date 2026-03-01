// js/gifts.js — Система подарков (ИСПРАВЛЕНО)

class GiftsManager {
    constructor(storage, isAdmin = false) {
        this.storage = storage;
        this.isAdmin = isAdmin;

        this.giftsCatalog = [
            { id: 'hug', emoji: '🤗', name: 'Обнимашки', price: 0, category: 'love' },
            { id: 'kiss', emoji: '💋', name: 'Поцелуй', price: 1, category: 'love' },
            { id: 'letter', emoji: '💌', name: 'Письмо', price: 1, category: 'love' },
            { id: 'heart', emoji: '💝', name: 'Сердце', price: 5, category: 'love' },
            { id: 'rose', emoji: '🌹', name: 'Роза', price: 1, category: 'flowers' },
            { id: 'bouquet', emoji: '💐', name: 'Букет', price: 5, category: 'flowers' },
            { id: 'tulips', emoji: '🌷', name: 'Тюльпаны', price: 3, category: 'flowers' },
            { id: 'chocolate', emoji: '🍫', name: 'Шоколад', price: 2, category: 'sweets' },
            { id: 'cake', emoji: '🎂', name: 'Торт', price: 8, category: 'sweets' },
            { id: 'icecream', emoji: '🍦', name: 'Мороженое', price: 2, category: 'sweets' },
            { id: 'teddy', emoji: '🧸', name: 'Мишка', price: 10, category: 'toys' },
            { id: 'butterfly', emoji: '🦋', name: 'Бабочка', price: 4, category: 'special' },
            { id: 'star', emoji: '⭐', name: 'Звезда', price: 3, category: 'special' },
            { id: 'moon', emoji: '🌙', name: 'Луна', price: 15, category: 'special' },
            { id: 'rainbow', emoji: '🌈', name: 'Радуга', price: 20, category: 'special' },
            { id: 'crown', emoji: '👑', name: 'Корона', price: 25, category: 'luxury' },
            { id: 'ring', emoji: '💍', name: 'Кольцо', price: 50, category: 'luxury' },
            { id: 'diamond', emoji: '💎', name: 'Бриллиант', price: 100, category: 'luxury' },
        ];

        this.categories = [
            { id: 'all', name: 'Все' },
            { id: 'love', name: '💕 Любовь' },
            { id: 'flowers', name: '🌸 Цветы' },
            { id: 'sweets', name: '🍭 Сладости' },
            { id: 'special', name: '⭐ Особые' },
            { id: 'luxury', name: '💎 Люкс' },
        ];
    }

    getBalance() {
        const profile = this.storage.getProfile();
        return this.isAdmin ? (profile.adminStars ?? 100) : (profile.userStars ?? 0);
    }

    closeGiftShop() { document.getElementById('giftShopOverlay')?.remove(); }

    openGiftShop() {
        document.getElementById('giftShopOverlay')?.remove();
        const balance = this.getBalance();

        const html = `
            <div class="gift-shop-overlay active" id="giftShopOverlay">
                <div class="gift-shop">
                    <div class="gift-shop-header">
                        <button class="gift-shop-close" onclick="app.gifts.closeGiftShop()">✕</button>
                        <h2>🎁 Подарки</h2>
                        <div class="gift-balance"><span>⭐</span><span id="shopBalance">${balance}</span></div>
                    </div>
                    <div class="gift-categories" id="giftCategories">
                        ${this.categories.map(c => `
                            <button class="gift-cat-btn ${c.id === 'all' ? 'active' : ''}"
                                    onclick="app.gifts.filterGifts('${c.id}', this)">${c.name}</button>
                        `).join('')}
                    </div>
                    <div class="gift-grid" id="giftGrid">${this.renderGiftGrid('all')}</div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    renderGiftGrid(category) {
        const gifts = category === 'all' ? this.giftsCatalog : this.giftsCatalog.filter(g => g.category === category);
        return gifts.map(g => `
            <div class="gift-item" onclick="app.gifts.selectGift('${g.id}')">
                <div class="gift-item-emoji">${g.emoji}</div>
                <div class="gift-item-name">${g.name}</div>
                <div class="gift-item-price">${g.price === 0 ? 'Бесплатно' : `${g.price} ⭐`}</div>
            </div>
        `).join('');
    }

    filterGifts(category, btn) {
        document.querySelectorAll('.gift-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const grid = document.getElementById('giftGrid');
        if (grid) grid.innerHTML = this.renderGiftGrid(category);
    }

    selectGift(giftId) {
        const gift = this.giftsCatalog.find(g => g.id === giftId);
        if (!gift) return;
        const balance = this.getBalance();
        const canAfford = gift.price <= balance;

        document.getElementById('giftConfirmOverlay')?.remove();

        const html = `
            <div class="gift-confirm-overlay active" id="giftConfirmOverlay">
                <div class="gift-confirm-modal">
                    <div class="gift-confirm-emoji">${gift.emoji}</div>
                    <h2>${gift.name}</h2>
                    <p class="gift-confirm-price">${gift.price === 0 ? 'Бесплатно! 💕' : `${gift.price} ⭐`}</p>
                    ${!canAfford ? `<p class="gift-insufficient">Недостаточно звёзд! (${balance} ⭐)</p>` : ''}
                    <div class="gift-confirm-field">
                        <label>Сообщение</label>
                        <textarea class="admin-textarea" id="giftConfirmMessage" rows="2" placeholder="Потому что ты лучшая! 💕"></textarea>
                    </div>
                    <div class="gift-confirm-actions">
                        <button class="gift-cancel-btn" onclick="document.getElementById('giftConfirmOverlay').remove()">Отмена</button>
                        <button class="gift-send-btn ${canAfford ? '' : 'disabled'}"
                                onclick="app.gifts.sendGift('${gift.id}')" ${canAfford ? '' : 'disabled'}>
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

        const balanceKey = this.isAdmin ? 'adminStars' : 'userStars';
        const profile = this.storage.getProfile();
        const senderBalance = profile[balanceKey] || 0;

        if (gift.price > senderBalance) return;

        const message = document.getElementById('giftConfirmMessage')?.value?.trim() || '';

        // Списать у отправителя
        this.storage.updateProfile({ [balanceKey]: senderBalance - gift.price });

        // Создать подарок
        this.storage.addGift({
            id: 'gift_' + Date.now(),
            giftId: gift.id,
            emoji: gift.emoji,
            name: gift.name,
            message,
            from: this.isAdmin ? 'admin' : 'user',
            to: this.isAdmin ? 'user' : 'admin',
            date: new Date().toISOString(),
            opened: false
        });

        // Уведомление
        this.storage.addNotification({
            id: 'notif_' + Date.now(),
            type: 'gift',
            message: `${this.isAdmin ? 'Любимый' : 'Любимая'} подарил(а) ${gift.emoji} ${gift.name}!`,
            date: new Date().toISOString(),
            read: false
        });

        document.getElementById('giftConfirmOverlay')?.remove();
        this.closeGiftShop();
        window.app?.effects?.launchConfetti(80);
        window.app?.showToast(`${gift.emoji} ${gift.name} подарен! 🎉`);
        window.app?.nav?.updateBadges();

        if (window.app?.currentPage === 'gifts') window.app.renderGiftsContent();
    }

    openGift(giftId) {
        const gift = this.storage.getGift(giftId);
        if (!gift) return;

        if (!gift.opened) {
            this.storage.markGiftOpened(giftId);
            gift.opened = true;
            window.app?.effects?.launchConfetti(50);
        }

        document.getElementById('giftOpenOverlay')?.remove();

        const html = `
            <div class="gift-open-overlay active" id="giftOpenOverlay" onclick="if(event.target===this) this.remove()">
                <div class="gift-open-modal">
                    <button class="gift-open-close" onclick="document.getElementById('giftOpenOverlay').remove()">✕</button>
                    <div class="gift-open-emoji">${gift.emoji}</div>
                    <h2>${gift.name}</h2>
                    <p class="gift-open-from">От: ${gift.from === 'admin' ? '💝 Любимого' : '👸 Любимой'}</p>
                    ${gift.message ? `<p class="gift-open-message">"${gift.message}"</p>` : ''}
                    <p class="gift-open-date">${new Date(gift.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
                    <button class="modal-btn" onclick="document.getElementById('giftOpenOverlay').remove()">Спасибо! 💕</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }
}

window.GiftsManager = GiftsManager;