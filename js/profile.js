// js/profile.js — Профиль (ИСПРАВЛЕНА ОПЕЧАТКА daysTogther -> daysTogether)

class ProfileManager {
    constructor(storage, isAdmin = false) {
        this.storage = storage;
        this.isAdmin = isAdmin;

        this.themes = [
            { id: 'pink', name: 'Розовая', emoji: '🌸', primary: '#FF85A2', gradient: 'linear-gradient(135deg, #FFE4F0 0%, #E8D5F5 50%, #FFDAB9 100%)' },
            { id: 'lavender', name: 'Лавандовая', emoji: '💜', primary: '#9B59B6', gradient: 'linear-gradient(135deg, #E8D5F5 0%, #D1C4E9 50%, #E1BEE7 100%)' },
            { id: 'mint', name: 'Мятная', emoji: '🌿', primary: '#26A69A', gradient: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 50%, #80CBC4 100%)' },
            { id: 'peach', name: 'Персиковая', emoji: '🍑', primary: '#FF8A65', gradient: 'linear-gradient(135deg, #FFDAB9 0%, #FFCCBC 50%, #FFE0B2 100%)' },
            { id: 'sky', name: 'Небесная', emoji: '🌤️', primary: '#42A5F5', gradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)' },
            { id: 'gold', name: 'Золотая', emoji: '✨', primary: '#FFD700', gradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)' },
            { id: 'dark', name: 'Тёмная', emoji: '🌙', primary: '#7C4DFF', gradient: 'linear-gradient(135deg, #2D2D44 0%, #1A1A2E 50%, #16213E 100%)' },
        ];
    }

    renderProfilePage() {
        const profile = this.storage.getProfile();
        const stats = this.storage.getStats();

        return `
            <div class="profile-page-new">
                <div class="profile-header-new">
                    <div class="profile-cover"><div class="cover-pattern"></div></div>
                    <div class="profile-avatar-section">
                        <div class="profile-avatar-container" onclick="app.profile.changeAvatar()">
                            <div class="profile-avatar-new" id="profileAvatarNew">
                                ${profile.avatarUrl
                                    ? `<img src="${profile.avatarUrl}" alt="Avatar">`
                                    : `<span class="avatar-emoji">${profile.avatarEmoji || (this.isAdmin ? '🤴' : '👸')}</span>`
                                }
                            </div>
                            <div class="avatar-edit-badge">📷</div>
                        </div>
                        <div class="profile-info-main">
                            <h1 class="profile-name-new" onclick="app.profile.editName()">
                                ${this.isAdmin ? (profile.adminName || 'Любимый') : (profile.userName || 'Любимая')}
                                <span class="edit-icon">✏️</span>
                            </h1>
                            <p class="profile-status-new" onclick="app.profile.editStatus()">
                                ${profile.userStatus || 'Нажми, чтобы добавить статус...'}
                            </p>
                            <div class="profile-role-badge ${this.isAdmin ? 'admin' : 'user'}">
                                ${this.isAdmin ? '👑 Админ' : '💕 Любимая'}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-stats-new">
                    <div class="stat-card">
                        <span class="stat-value">${stats.daysTogether || 0}</span>
                        <span class="stat-label">дней вместе</span>
                    </div>
                    <div class="stat-card highlight">
                        <span class="stat-value">${stats.lettersReceived || 0}</span>
                        <span class="stat-label">писем</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${stats.giftsReceived || 0}</span>
                        <span class="stat-label">подарков</span>
                    </div>
                </div>

                <div class="profile-section-card" onclick="app.profile.showOurStory()">
                    <div class="section-card-icon">💑</div>
                    <div class="section-card-content">
                        <h3>Наша история</h3>
                        <p>Вместе с ${profile.coupleDate || '22 октября 2023'}</p>
                    </div>
                    <span class="section-card-arrow">›</span>
                </div>

                <div class="profile-menu-new">
                    <div class="menu-item-new" onclick="app.profile.openSettings()">
                        <div class="menu-icon-new">⚙️</div>
                        <div class="menu-text-new">
                            <span class="menu-title">Настройки</span>
                            <span class="menu-desc">Темы, уведомления, аккаунт</span>
                        </div>
                        <span class="menu-arrow">›</span>
                    </div>
                    <div class="menu-item-new" onclick="app.navigateTo('gallery')">
                        <div class="menu-icon-new">📸</div>
                        <div class="menu-text-new">
                            <span class="menu-title">Фотоальбомы</span>
                            <span class="menu-desc">${this.storage.getAlbums().length} альбомов</span>
                        </div>
                        <span class="menu-arrow">›</span>
                    </div>
                    <div class="menu-item-new" onclick="app.navigateTo('gifts')">
                        <div class="menu-icon-new">🎁</div>
                        <div class="menu-text-new">
                            <span class="menu-title">Мои подарки</span>
                            <span class="menu-desc">${this.storage.getGifts().length} подарков</span>
                        </div>
                        <span class="menu-arrow">›</span>
                    </div>
                    <div class="menu-item-new" onclick="app.navigateTo('letters')">
                        <div class="menu-icon-new">💌</div>
                        <div class="menu-text-new">
                            <span class="menu-title">Письма</span>
                            <span class="menu-desc">${this.storage.getLetters().filter(l => !l.read).length} непрочитанных</span>
                        </div>
                        <span class="menu-arrow">›</span>
                    </div>
                    ${this.isAdmin ? `
                        <div class="menu-item-new admin-item" onclick="app.navigateTo('admin')">
                            <div class="menu-icon-new">🛠️</div>
                            <div class="menu-text-new">
                                <span class="menu-title">Админ-панель</span>
                                <span class="menu-desc">Управление приложением</span>
                            </div>
                            <span class="menu-arrow">›</span>
                        </div>
                    ` : ''}
                </div>

                ${!this.isAdmin ? `
                    <div class="stars-balance-card">
                        <div class="stars-icon">⭐</div>
                        <div class="stars-info">
                            <span class="stars-amount">${profile.userStars || 0}</span>
                            <span class="stars-label">звёзд</span>
                        </div>
                        <button class="stars-shop-btn" onclick="app.profile.openStarsShop()">Магазин 🛒</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ========== НАСТРОЙКИ ==========
    openSettings() {
        document.getElementById('settingsOverlay')?.remove();
        const profile = this.storage.getProfile();

        const html = `
            <div class="settings-overlay active" id="settingsOverlay">
                <div class="settings-page">
                    <div class="settings-header">
                        <button class="settings-back" onclick="app.profile.closeSettings()">‹</button>
                        <h1>⚙️ Настройки</h1>
                    </div>
                    <div class="settings-content">
                        <div class="settings-section">
                            <h2 class="settings-section-title">Аккаунт</h2>
                            <div class="setting-item" onclick="app.profile.editName()">
                                <div class="setting-icon">👤</div>
                                <div class="setting-info">
                                    <span class="setting-title">Имя</span>
                                    <span class="setting-value">${this.isAdmin ? (profile.adminName || 'Любимый') : (profile.userName || 'Любимая')}</span>
                                </div>
                                <span class="setting-arrow">›</span>
                            </div>
                            <div class="setting-item" onclick="app.profile.editStatus()">
                                <div class="setting-icon">💬</div>
                                <div class="setting-info">
                                    <span class="setting-title">Статус</span>
                                    <span class="setting-value">${profile.userStatus || 'Не указан'}</span>
                                </div>
                                <span class="setting-arrow">›</span>
                            </div>
                            <div class="setting-item" onclick="app.profile.changeAvatar()">
                                <div class="setting-icon">📷</div>
                                <div class="setting-info">
                                    <span class="setting-title">Фото профиля</span>
                                    <span class="setting-value">${profile.avatarUrl ? 'Установлено' : 'Не установлено'}</span>
                                </div>
                                <span class="setting-arrow">›</span>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h2 class="settings-section-title">Тема оформления</h2>
                            <div class="themes-grid">
                                ${this.themes.map(theme => `
                                    <div class="theme-card ${profile.theme === theme.id ? 'active' : ''}"
                                         onclick="app.profile.setTheme('${theme.id}')"
                                         style="background: ${theme.gradient}">
                                        <span class="theme-emoji">${theme.emoji}</span>
                                        <span class="theme-name">${theme.name}</span>
                                        ${profile.theme === theme.id ? '<span class="theme-check">✓</span>' : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="settings-section">
                            <h2 class="settings-section-title">Уведомления</h2>
                            <div class="setting-item">
                                <div class="setting-icon">🔔</div>
                                <div class="setting-info">
                                    <span class="setting-title">Push-уведомления</span>
                                    <span class="setting-desc">Письма, подарки, события</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" ${profile.notifications ? 'checked' : ''} onchange="app.profile.toggleNotifications()">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h2 class="settings-section-title">Наша история</h2>
                            <div class="setting-item" onclick="app.admin.editCoupleDate()">
                                <div class="setting-icon">📅</div>
                                <div class="setting-info">
                                    <span class="setting-title">Дата начала</span>
                                    <span class="setting-value">${profile.coupleDate || '22 октября 2023'}</span>
                                </div>
                                <span class="setting-arrow">›</span>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h2 class="settings-section-title">Данные</h2>
                            <div class="setting-item" onclick="app.admin.exportData()">
                                <div class="setting-icon">📤</div>
                                <div class="setting-info">
                                    <span class="setting-title">Экспорт данных</span>
                                    <span class="setting-desc">Скачать все данные</span>
                                </div>
                                <span class="setting-arrow">›</span>
                            </div>
                            <div class="setting-item danger" onclick="app.admin.resetData()">
                                <div class="setting-icon">🗑️</div>
                                <div class="setting-info">
                                    <span class="setting-title">Сбросить всё</span>
                                    <span class="setting-desc">Удалить все данные</span>
                                </div>
                                <span class="setting-arrow">›</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    closeSettings() {
        document.getElementById('settingsOverlay')?.remove();
    }

    // ========== АВАТАР ==========
    changeAvatar() {
        document.getElementById('avatarModal')?.remove();

        const html = `
            <div class="admin-modal-overlay active" id="avatarModal">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('avatarModal').remove()">✕</button>
                        <h2>📷 Фото профиля</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="avatar-preview-large" id="avatarPreviewLarge">
                            ${this.storage.getProfile().avatarUrl
                                ? `<img src="${this.storage.getProfile().avatarUrl}" alt="">`
                                : `<span>${this.storage.getProfile().avatarEmoji || (this.isAdmin ? '🤴' : '👸')}</span>`
                            }
                        </div>
                        <div class="avatar-options">
                            <button class="avatar-option-btn" onclick="document.getElementById('avatarFileInput').click()">
                                📷 Загрузить фото
                            </button>
                            <button class="avatar-option-btn" onclick="app.profile.chooseAvatarEmoji()">
                                😊 Выбрать эмодзи
                            </button>
                            ${this.storage.getProfile().avatarUrl ? `
                                <button class="avatar-option-btn danger" onclick="app.profile.removeAvatar()">
                                    🗑️ Удалить фото
                                </button>
                            ` : ''}
                        </div>
                        <input type="file" id="avatarFileInput" accept="image/*"
                               style="display:none" onchange="app.profile.handleAvatarUpload(event)">
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            window.app?.showToast('Максимум 5MB! 📁');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            this.storage.updateProfile({ avatarUrl: e.target.result });
            document.getElementById('avatarModal')?.remove();
            window.app?.showToast('Фото обновлено! 📸');
            this.updateAllAvatars();
        };
        reader.readAsDataURL(file);
    }

    chooseAvatarEmoji() {
        const emojis = ['👸', '🤴', '👩', '👨', '🧑', '💃', '🕺', '🦄', '🐱', '🐰', '🌸', '🦋', '⭐', '💖', '🌹', '🎀'];
        const grid = document.querySelector('.avatar-options');
        if (grid) {
            grid.innerHTML = `
                <div class="emoji-grid-avatar">
                    ${emojis.map(e => `<button class="emoji-avatar-btn" onclick="app.profile.setAvatarEmoji('${e}')">${e}</button>`).join('')}
                </div>
            `;
        }
    }

    setAvatarEmoji(emoji) {
        this.storage.updateProfile({ avatarUrl: null, avatarEmoji: emoji });
        document.getElementById('avatarModal')?.remove();
        window.app?.showToast('Аватар: ' + emoji);
        this.updateAllAvatars();
    }

    removeAvatar() {
        this.storage.updateProfile({ avatarUrl: null });
        document.getElementById('avatarModal')?.remove();
        window.app?.showToast('Фото удалено 🗑️');
        this.updateAllAvatars();
    }

    updateAllAvatars() {
        window.app?.updateHeaderUI();
        if (window.app?.currentPage === 'profile') window.app.renderProfileContent();
    }

    // ========== ИМЯ ==========
    editName() {
        document.getElementById('editNameModal')?.remove();
        const profile = this.storage.getProfile();
        const currentName = this.isAdmin ? (profile.adminName || 'Любимый') : (profile.userName || 'Любимая');
        const html = `
            <div class="admin-modal-overlay active" id="editNameModal">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('editNameModal').remove()">✕</button>
                        <h2>✏️ Изменить имя</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>Твоё имя</label>
                            <input type="text" class="admin-input" id="newNameInput"
                                   value="${currentName}" placeholder="Введите имя..." maxlength="20">
                        </div>
                        <button class="admin-submit-btn" onclick="app.profile.saveName()">💾 Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('newNameInput')?.focus();
    }

    saveName() {
        const name = document.getElementById('newNameInput')?.value?.trim();
        if (!name) { window.app?.showToast('Введите имя! ✏️'); return; }
        if (this.isAdmin) {
            this.storage.updateProfile({ adminName: name });
        } else {
            this.storage.updateProfile({ userName: name, nameSetManually: true });
        }
        document.getElementById('editNameModal')?.remove();
        window.app?.showToast('Имя обновлено! ✨');
        window.app?.updateHeaderUI();
        if (window.app?.currentPage === 'profile') window.app.renderProfileContent();
        document.getElementById('settingsOverlay')?.remove();
        this.openSettings();
    }

    // ========== СТАТУС ==========
    editStatus() {
        document.getElementById('editStatusModal')?.remove();
        const profile = this.storage.getProfile();
        const html = `
            <div class="admin-modal-overlay active" id="editStatusModal">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('editStatusModal').remove()">✕</button>
                        <h2>💬 Изменить статус</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>Твой статус</label>
                            <input type="text" class="admin-input" id="newStatusInput"
                                   value="${profile.userStatus || ''}"
                                   placeholder="Самая счастливая 💕" maxlength="50">
                        </div>
                        <div class="status-suggestions">
                            <span onclick="document.getElementById('newStatusInput').value='Самая счастливая 💕'">Самая счастливая 💕</span>
                            <span onclick="document.getElementById('newStatusInput').value='Люблю тебя ❤️'">Люблю тебя ❤️</span>
                            <span onclick="document.getElementById('newStatusInput').value='Мечтаю о тебе ✨'">Мечтаю о тебе ✨</span>
                        </div>
                        <button class="admin-submit-btn" onclick="app.profile.saveStatus()">💾 Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    saveStatus() {
        this.storage.updateProfile({ userStatus: document.getElementById('newStatusInput')?.value?.trim() || '' });
        document.getElementById('editStatusModal')?.remove();
        window.app?.showToast('Статус обновлён! 💬');
        if (window.app?.currentPage === 'profile') window.app.renderProfileContent();
    }

    // ========== ТЕМЫ ==========
    setTheme(themeId) {
        const theme = this.themes.find(t => t.id === themeId);
        if (!theme) return;
        this.storage.updateProfile({ theme: themeId });
        this.applyTheme(theme);
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
            const check = card.querySelector('.theme-check');
            if (check) check.remove();
        });
        const activeCard = document.querySelector(`.theme-card[onclick*="${themeId}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
            activeCard.insertAdjacentHTML('beforeend', '<span class="theme-check">✓</span>');
        }
        window.app?.showToast(`Тема "${theme.name}"! ${theme.emoji}`);
    }

    applyTheme(theme) {
        const root = document.documentElement;
        root.style.setProperty('--gradient-main', theme.gradient);
        root.style.setProperty('--pink', theme.primary);
        if (theme.id === 'dark') {
            root.style.setProperty('--text-dark', '#FFFFFF');
            root.style.setProperty('--text-light', '#B0B0B0');
            root.style.setProperty('--gradient-card', 'linear-gradient(145deg, #2D2D44 0%, #1A1A2E 100%)');
            document.body.classList.add('dark-theme');
        } else {
            root.style.setProperty('--text-dark', '#4A3040');
            root.style.setProperty('--text-light', '#8B6B7B');
            root.style.setProperty('--gradient-card', 'linear-gradient(145deg, #FFFFFF 0%, #FFF0F5 100%)');
            document.body.classList.remove('dark-theme');
        }
    }

    loadSavedTheme() {
        const theme = this.themes.find(t => t.id === this.storage.getProfile().theme);
        if (theme) this.applyTheme(theme);
    }

    toggleNotifications() {
        const profile = this.storage.getProfile();
        this.storage.updateProfile({ notifications: !profile.notifications });
        window.app?.showToast(profile.notifications ? 'Выключены 🔕' : 'Включены 🔔');
    }

    toggleLetterNotifications() {
        const profile = this.storage.getProfile();
        this.storage.updateProfile({ letterNotifications: !(profile.letterNotifications !== false) });
    }

    toggleGiftNotifications() {
        const profile = this.storage.getProfile();
        this.storage.updateProfile({ giftNotifications: !(profile.giftNotifications !== false) });
    }

    // ========== НАША ИСТОРИЯ ==========
    showOurStory() {
        document.getElementById('ourStoryModal')?.remove();
        const profile = this.storage.getProfile();
        const stats = this.storage.getStats();
        const html = `
            <div class="admin-modal-overlay active" id="ourStoryModal">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('ourStoryModal').remove()">✕</button>
                        <h2>💑 Наша история</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="our-story-content">
                            <div class="story-hearts">💕</div>
                            <div class="story-date-big">${profile.coupleDate || '22 октября 2023'}</div>
                            <div class="story-days">
                                <span class="days-number">${stats.daysTogether || 0}</span>
                                <span class="days-label">дней вместе</span>
                            </div>
                            <div class="story-stats">
                                <div class="story-stat"><span>💌</span><span>${stats.lettersReceived || 0} писем</span></div>
                                <div class="story-stat"><span>🎁</span><span>${stats.giftsReceived || 0} подарков</span></div>
                                <div class="story-stat"><span>😊</span><span>${stats.reactionsGiven || 0} реакций</span></div>
                            </div>
                            <div class="story-message">Каждый день с тобой — счастье! ✨</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // ========== МАГАЗИН ==========
    openStarsShop() {
        document.getElementById('starsShopOverlay')?.remove();
        const profile = this.storage.getProfile();
        const userStars = profile.userStars || 0;

        const shopItems = [
            { id: 'flowers_rose', name: 'Букет роз', emoji: '🌹', price: 50, desc: 'Настоящий букет роз!' },
            { id: 'flowers_tulips', name: 'Тюльпаны', emoji: '🌷', price: 30, desc: 'Свежие тюльпаны' },
            { id: 'chocolate', name: 'Шоколад', emoji: '🍫', price: 15, desc: 'Вкусный шоколад' },
            { id: 'dinner', name: 'Романтический ужин', emoji: '🍽️', price: 100, desc: 'Ужин в ресторане' },
            { id: 'movie', name: 'Кино', emoji: '🎬', price: 40, desc: 'Поход в кинотеатр' },
            { id: 'surprise', name: 'Сюрприз', emoji: '🎁', price: 75, desc: 'Секретный подарок!' },
        ];

        const html = `
            <div class="stars-shop-overlay active" id="starsShopOverlay">
                <div class="stars-shop">
                    <div class="stars-shop-header">
                        <button class="stars-shop-close" onclick="document.getElementById('starsShopOverlay').remove()">✕</button>
                        <h2>🛒 Магазин</h2>
                        <div class="stars-shop-balance"><span>⭐</span><span>${userStars}</span></div>
                    </div>
                    <div class="stars-shop-content">
                        <p class="shop-desc">Обменяй звёзды на реальные подарки!</p>
                        <div class="shop-items-grid">
                            ${shopItems.map(item => `
                                <div class="shop-item ${userStars < item.price ? 'disabled' : ''}"
                                     onclick="app.profile.buyShopItem('${item.id}', ${item.price})">
                                    <div class="shop-item-emoji">${item.emoji}</div>
                                    <div class="shop-item-name">${item.name}</div>
                                    <div class="shop-item-desc">${item.desc}</div>
                                    <div class="shop-item-price"><span>⭐</span> ${item.price}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    buyShopItem(itemId, price) {
        const profile = this.storage.getProfile();
        if ((profile.userStars || 0) < price) {
            window.app?.showToast('Недостаточно звёзд! ⭐');
            return;
        }

        window.app.showConfirmModal(`Купить за ${price} ⭐?`, () => {
            this.storage.updateProfile({ userStars: (profile.userStars || 0) - price });
            const orders = this.storage.get('orders') || [];
            orders.push({ id: 'order_' + Date.now(), itemId, price, date: new Date().toISOString(), status: 'pending' });
            this.storage.set('orders', orders);
            this.storage.addNotification({
                id: 'notif_' + Date.now(),
                type: 'order',
                message: `Заказ: ${itemId} за ${price} ⭐`,
                date: new Date().toISOString(),
                read: false
            });
            document.getElementById('starsShopOverlay')?.remove();
            window.app?.effects?.launchConfetti(50);
            window.app?.showToast('Заказ оформлен! 🎉');
        });
    }
}

window.ProfileManager = ProfileManager;