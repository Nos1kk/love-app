// js/admin.js — Полная админ-панель v5

class AdminPanel {
    constructor(storage) {
        this.storage = storage;
        this._selectedEventType = 'date';
    }

    renderFullAdmin() {
        const container = document.getElementById('adminContent');
        if (!container) return;

        const events = this.storage.getEvents();
        const letters = this.storage.getLetters();
        const gifts = this.storage.getGifts();
        const albums = this.storage.getAlbums();
        const specialDates = this.storage.getSpecialDates();
        const profile = this.storage.getProfile();
        const stats = this.storage.getStats();
        const orders = this.storage.getOrders();
        const goals = this.storage.get('goals') || [];
        const notes = this.storage.get('quickNotes') || [];
        const unreadLetters = letters.filter(l => !l.read).length;
        const unopenedGifts = gifts.filter(g => !g.opened).length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;

        container.innerHTML = `
            <!-- Быстрые действия -->
            <div class="admin-section-label">⚡ Быстрые действия</div>
            <div class="admin-cards">
                <div class="admin-card" onclick="app.admin.openEventCreator()">
                    <div class="admin-card-icon">📅</div>
                    <div class="admin-card-title">Событие</div>
                </div>
                <div class="admin-card" onclick="app.letters.openCompose()">
                    <div class="admin-card-icon">💌</div>
                    <div class="admin-card-title">Письмо</div>
                </div>
                <div class="admin-card" onclick="app.gifts.openGiftShop()">
                    <div class="admin-card-icon">🎁</div>
                    <div class="admin-card-title">Подарок</div>
                </div>
                <div class="admin-card" onclick="app.photos.createAlbum()">
                    <div class="admin-card-icon">📸</div>
                    <div class="admin-card-title">Альбом</div>
                </div>
            </div>
            <div class="admin-cards">
                <div class="admin-card" onclick="app.admin.manageSpecialDates()">
                    <div class="admin-card-icon">🎉</div>
                    <div class="admin-card-title">Даты</div>
                </div>
                <div class="admin-card" onclick="app.features.openGoals()">
                    <div class="admin-card-icon">🎯</div>
                    <div class="admin-card-title">Цели</div>
                </div>
                <div class="admin-card" onclick="app.features.openQuickNotes()">
                    <div class="admin-card-icon">📌</div>
                    <div class="admin-card-title">Записки</div>
                </div>
                <div class="admin-card" onclick="app.admin.manageCompliments()">
                    <div class="admin-card-icon">✨</div>
                    <div class="admin-card-title">Комплименты</div>
                </div>
            </div>

            <!-- Статус -->
            <div class="admin-section-label">📊 Обзор</div>
            <div style="padding:0 20px;">
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <span class="analytics-card-value">${stats.daysTogether || 0}</span>
                        <span class="analytics-card-label">дней</span>
                    </div>
                    <div class="analytics-card">
                        <span class="analytics-card-value">${letters.length}</span>
                        <span class="analytics-card-label">писем${unreadLetters > 0 ? ` (${unreadLetters} новых)` : ''}</span>
                    </div>
                    <div class="analytics-card">
                        <span class="analytics-card-value">${gifts.length}</span>
                        <span class="analytics-card-label">подарков${unopenedGifts > 0 ? ` (${unopenedGifts} не открыт.)` : ''}</span>
                    </div>
                    <div class="analytics-card">
                        <span class="analytics-card-value">${events.length}</span>
                        <span class="analytics-card-label">событий</span>
                    </div>
                </div>
            </div>

            <!-- Профиль -->
            <div class="admin-section-label">👤 Управление профилем</div>
            <div style="padding:0 20px 12px;">
                <div class="admin-list-item" onclick="app.admin.editUserProfile()">
                    <div class="ali-emoji">✏️</div>
                    <div class="ali-info">
                        <h4>Пользователь: ${profile.userName || 'Любимая'}</h4>
                        <p>Админ: ${profile.adminName || 'Любимый'} | Статус: ${profile.userStatus || '—'}</p>
                    </div>
                </div>
                <div class="admin-list-item" style="margin-top:8px" onclick="app.admin.editCoupleDate()">
                    <div class="ali-emoji">📅</div>
                    <div class="ali-info">
                        <h4>Дата отношений: ${profile.coupleDate || '—'}</h4>
                        <p>${stats.daysTogether || 0} дней вместе</p>
                    </div>
                </div>
                <div class="admin-list-item" style="margin-top:8px" onclick="app.admin.editBalance()">
                    <div class="ali-emoji">⭐</div>
                    <div class="ali-info">
                        <h4>Баланс</h4>
                        <p>Админ: ${profile.adminStars ?? 0} ⭐ | Юзер: ${profile.userStars ?? 0} ⭐</p>
                    </div>
                </div>
                <div class="admin-list-item" style="margin-top:8px" onclick="app.admin.editUserAvatar()">
                    <div class="ali-emoji">📷</div>
                    <div class="ali-info">
                        <h4>Аватар пользователя</h4>
                        <p>${profile.avatarUrl ? 'Фото установлено' : profile.avatarEmoji || 'Эмодзи по умолчанию'}</p>
                    </div>
                </div>
                <div class="admin-list-item" style="margin-top:8px" onclick="app.admin.editTheme()">
                    <div class="ali-emoji">🎨</div>
                    <div class="ali-info">
                        <h4>Тема оформления</h4>
                        <p>Текущая: ${profile.theme || 'pink'}</p>
                    </div>
                </div>
            </div>

            <!-- Заказы -->
            ${pendingOrders > 0 ? `
                <div class="admin-section-label">🛒 Заказы (${pendingOrders} ожидают)</div>
                <div class="admin-events-list">
                    ${orders.filter(o => o.status === 'pending').map(o => `
                        <div class="admin-list-item">
                            <div class="ali-emoji">📦</div>
                            <div class="ali-info">
                                <h4>${o.itemId}</h4>
                                <p>${o.price} ⭐ • ${new Date(o.date).toLocaleDateString('ru-RU')}</p>
                            </div>
                            <button class="ali-delete" style="background:var(--green);color:white" onclick="app.admin.completeOrder('${o.id}')">✅</button>
                            <button class="ali-delete" onclick="app.admin.rejectOrder('${o.id}')">❌</button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Особые даты -->
            <div class="admin-section-label">🎉 Особые даты (${specialDates.length})</div>
            <div class="admin-events-list">
                ${specialDates.length > 0 ? specialDates.map(d => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">${d.emoji}</div>
                        <div class="ali-info"><h4>${d.title}</h4><p>${d.date}</p></div>
                        <button class="ali-delete" onclick="app.admin.deleteSpecialDate('${d.id}')">🗑️</button>
                    </div>
                `).join('') : '<div class="admin-empty"><span>📅</span>Нет дат</div>'}
                <div class="admin-list-item" style="cursor:pointer;justify-content:center;margin-top:4px" onclick="app.admin.manageSpecialDates()">
                    <span style="font-size:12px;font-weight:600;color:var(--pink-dark)">+ Добавить дату</span>
                </div>
            </div>

            <!-- События -->
            <div class="admin-section-label">📋 События (${events.length})</div>
            <div class="admin-events-list">
                ${events.length > 0 ? events.map(e => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">${window.app?.getEventEmoji(e.type) || '📌'}</div>
                        <div class="ali-info">
                            <h4>${e.title}</h4>
                            <p>${e.date}${e.time ? ' ' + e.time : ''} • ${e.description || ''}</p>
                        </div>
                        <button class="ali-delete" style="background:var(--lavender)" onclick="app.admin.editExistingEvent('${e.id}')">✏️</button>
                        <button class="ali-delete" onclick="app.deleteAdminEvent('${e.id}')">🗑️</button>
                    </div>
                `).join('') : '<div class="admin-empty"><span>📅</span>Нет событий</div>'}
            </div>

            <!-- Письма -->
            <div class="admin-section-label">💌 Письма (${letters.length})</div>
            <div class="admin-letters-list">
                ${letters.length > 0 ? letters.slice(0, 15).map(l => `
                    <div class="admin-list-item" onclick="app.letters.openLetter('${l.id}')">
                        <div class="ali-emoji">${l.mood || '💌'}</div>
                        <div class="ali-info">
                            <h4>${l.subject || 'Без темы'}</h4>
                            <p>${l.read ? '✓' : '●'} ${l.from === 'admin' ? '→ юзеру' : '← от юзера'} • ${l.replies?.length || 0} ответов</p>
                        </div>
                        <button class="ali-delete" onclick="event.stopPropagation(); app.deleteAdminLetter('${l.id}')">🗑️</button>
                    </div>
                `).join('') : '<div class="admin-empty"><span>💌</span>Нет писем</div>'}
            </div>

            <!-- Подарки -->
            <div class="admin-section-label">🎁 Подарки (${gifts.length})</div>
            <div class="admin-gifts-list">
                ${gifts.length > 0 ? gifts.slice(0, 10).map(g => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">${g.emoji}</div>
                        <div class="ali-info">
                            <h4>${g.name}</h4>
                            <p>${g.opened ? '📭 Открыт' : '📬 Не открыт'} • ${g.from} → ${g.to}</p>
                        </div>
                    </div>
                `).join('') : '<div class="admin-empty"><span>🎁</span>Нет подарков</div>'}
            </div>

            <!-- Альбомы -->
            <div class="admin-section-label">📸 Альбомы (${albums.length})</div>
            <div class="admin-events-list">
                ${albums.length > 0 ? albums.map(a => `
                    <div class="admin-list-item" onclick="app.photos.openAlbum('${a.id}')">
                        <div class="ali-emoji">${a.coverEmoji || '📸'}</div>
                        <div class="ali-info">
                            <h4>${a.name}</h4>
                            <p>${a.photoCount || 0} фото</p>
                        </div>
                        <button class="ali-delete" onclick="event.stopPropagation(); app.admin.deleteAlbum('${a.id}')">🗑️</button>
                    </div>
                `).join('') : '<div class="admin-empty"><span>📸</span>Нет альбомов</div>'}
            </div>

            <!-- Записки -->
            ${notes.length > 0 ? `
                <div class="admin-section-label">📌 Записки (${notes.length})</div>
                <div class="admin-events-list">
                    ${notes.slice(0, 5).map(n => `
                        <div class="admin-list-item">
                            <div class="ali-emoji">${n.from === 'admin' ? '🤴' : '👸'}</div>
                            <div class="ali-info">
                                <h4>${(n.text || '').substring(0, 40)}${n.text?.length > 40 ? '...' : ''}</h4>
                                <p>${new Date(n.date).toLocaleDateString('ru-RU')}</p>
                            </div>
                            <button class="ali-delete" onclick="app.admin.deleteNote('${n.id}')">🗑️</button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Цели -->
            ${goals.length > 0 ? `
                <div class="admin-section-label">🎯 Цели (${goals.filter(g=>g.done).length}/${goals.length})</div>
                <div class="admin-events-list">
                    ${goals.map(g => `
                        <div class="admin-list-item">
                            <div class="ali-emoji">${g.done ? '✅' : '⬜'}</div>
                            <div class="ali-info"><h4>${g.text}</h4></div>
                            <button class="ali-delete" onclick="app.admin.deleteGoal('${g.id}')">🗑️</button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Данные -->
            <div class="admin-section-label">💾 Управление данными</div>
            <div style="padding:0 20px 40px;">
                <div class="admin-list-item" onclick="app.admin.exportData()" style="cursor:pointer">
                    <div class="ali-emoji">📤</div>
                    <div class="ali-info"><h4>Экспорт данных</h4><p>Скопировать все данные (JSON)</p></div>
                </div>
                <div class="admin-list-item" style="margin-top:8px;cursor:pointer" onclick="app.admin.importData()">
                    <div class="ali-emoji">📥</div>
                    <div class="ali-info"><h4>Импорт данных</h4><p>Загрузить данные из JSON</p></div>
                </div>
                <div class="admin-list-item" style="margin-top:8px;cursor:pointer" onclick="app.admin.resetData()">
                    <div class="ali-emoji">🗑️</div>
                    <div class="ali-info"><h4>Сбросить всё</h4><p>Удалить все данные навсегда</p></div>
                </div>
                <div class="admin-list-item" style="margin-top:8px;cursor:pointer" onclick="app.admin.forceSync()">
                    <div class="ali-emoji">🔄</div>
                    <div class="ali-info"><h4>Синхронизация</h4><p>Принудительная синхронизация с сервером</p></div>
                </div>
            </div>
        `;
    }

    // ========== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ==========
    editUserProfile() {
        document.getElementById('editUserOverlay')?.remove();
        const profile = this.storage.getProfile();
        const html = `
            <div class="admin-modal-overlay active" id="editUserOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('editUserOverlay').remove()">✕</button>
                        <h2>👤 Профиль</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field"><label>Имя пользователя</label>
                            <input class="admin-input" id="editUserName" value="${profile.userName || ''}" placeholder="Любимая"></div>
                        <div class="admin-field"><label>Имя админа</label>
                            <input class="admin-input" id="editAdminName" value="${profile.adminName || ''}" placeholder="Любимый"></div>
                        <div class="admin-field"><label>Статус пользователя</label>
                            <input class="admin-input" id="editUserStatus" value="${profile.userStatus || ''}" placeholder="Статус..."></div>
                        <div class="admin-field"><label>Приветствие на главной</label>
                            <input class="admin-input" id="editGreeting" value="${profile.greeting || ''}" placeholder="Каждый день с тобой — праздник 🌸"></div>
                        <div class="admin-field"><label>Заголовок на главной</label>
                            <input class="admin-input" id="editMainTitle" value="${profile.mainTitle || ''}" placeholder="Мой мир — это ты 💕"></div>
                        <button class="admin-submit-btn" onclick="app.admin.saveUserProfile()">💾 Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    saveUserProfile() {
        this.storage.updateProfile({
            userName: document.getElementById('editUserName')?.value?.trim() || 'Любимая',
            adminName: document.getElementById('editAdminName')?.value?.trim() || 'Любимый',
            userStatus: document.getElementById('editUserStatus')?.value?.trim() || '',
            greeting: document.getElementById('editGreeting')?.value?.trim() || '',
            mainTitle: document.getElementById('editMainTitle')?.value?.trim() || '',
        });
        document.getElementById('editUserOverlay')?.remove();
        window.app?.showToast('Сохранено! ✨');
        window.app?.updateHeaderUI();
        this.renderFullAdmin();
    }

    // ========== АВАТАР ==========
    editUserAvatar() {
        window.app?.profile?.changeAvatar();
    }

    // ========== ТЕМА ==========
    editTheme() {
        window.app?.profile?.openSettings();
    }

    // ========== БАЛАНС ==========
    editBalance() {
        document.getElementById('balanceOverlay')?.remove();
        const p = this.storage.getProfile();
        const html = `<div class="admin-modal-overlay active" id="balanceOverlay">
            <div class="admin-modal small"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('balanceOverlay').remove()">✕</button>
                <h2>⭐ Баланс</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><label>Звёзды админа</label>
                    <input type="number" class="admin-input" id="balanceAdminInput" value="${p.adminStars ?? 0}" min="0"></div>
                <div class="admin-field"><label>Звёзды пользователя</label>
                    <input type="number" class="admin-input" id="balanceUserInput" value="${p.userStars ?? 0}" min="0"></div>
                <button class="admin-submit-btn" onclick="app.admin.saveBalance()">💰 Сохранить</button>
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    saveBalance() {
        this.storage.updateProfile({
            adminStars: Math.max(0, parseInt(document.getElementById('balanceAdminInput')?.value) || 0),
            userStars: Math.max(0, parseInt(document.getElementById('balanceUserInput')?.value) || 0),
        });
        document.getElementById('balanceOverlay')?.remove();
        window.app?.showToast('Баланс обновлён! ⭐');
        this.renderFullAdmin();
        if (window.app?.currentPage === 'gifts') window.app.renderGiftsContent();
    }

    // ========== ДАТА ОТНОШЕНИЙ ==========
    editCoupleDate() {
        document.getElementById('coupleDateOverlay')?.remove();
        const p = this.storage.getProfile();
        const html = `<div class="admin-modal-overlay active" id="coupleDateOverlay">
            <div class="admin-modal small"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('coupleDateOverlay').remove()">✕</button>
                <h2>📅 Дата отношений</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><label>Когда вы начали встречаться?</label>
                    <input type="date" class="admin-input" id="coupleDateInput" value="${p.coupleDateRaw || ''}"></div>
                <button class="admin-submit-btn" onclick="app.admin.saveCoupleDate()">💕 Сохранить</button>
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    saveCoupleDate() {
        const date = document.getElementById('coupleDateInput')?.value;
        if (!date) return;
        const fmt = new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const days = Math.floor((new Date() - new Date(date)) / 86400000);
        this.storage.updateProfile({ coupleDate: fmt, coupleDateRaw: date });
        this.storage.updateStats({ daysTogether: Math.max(0, days) });
        document.getElementById('coupleDateOverlay')?.remove();
        window.app?.showToast(`${days} дней вместе! 💕`);
        this.renderFullAdmin();
    }

    // ========== СОБЫТИЯ ==========
    openEventCreator(editEvent = null) {
        const isEdit = !!editEvent;
        document.getElementById('eventCreatorOverlay')?.remove();
        const html = `
            <div class="admin-modal-overlay active" id="eventCreatorOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('eventCreatorOverlay').remove()">✕</button>
                        <h2>${isEdit ? '✏️ Редактировать' : '📅 Новое событие'}</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field"><label>Название</label>
                            <input class="admin-input" id="adminEventTitle" value="${isEdit ? editEvent.title : ''}" placeholder="Романтический ужин..."></div>
                        <div class="admin-field"><label>Дата</label>
                            <input type="date" class="admin-input" id="adminEventDate" value="${isEdit ? editEvent.date : ''}"></div>
                        <div class="admin-field"><label>Время (необязательно)</label>
                            <input type="time" class="admin-input" id="adminEventTime" value="${isEdit ? (editEvent.time || '') : ''}"></div>
                        <div class="admin-field"><label>Описание</label>
                            <textarea class="admin-textarea" id="adminEventDesc" rows="2" placeholder="Описание...">${isEdit ? (editEvent.description || '') : ''}</textarea></div>
                        <div class="admin-field"><label>Тип</label>
                            <div class="event-type-grid">${this.renderEventTypes(isEdit ? editEvent.type : null)}</div></div>
                        <button class="admin-submit-btn" onclick="app.admin.saveAdminEvent(${isEdit ? `'${editEvent.id}'` : 'null'})">${isEdit ? '💾 Сохранить' : '✨ Создать'}</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this._selectedEventType = isEdit ? editEvent.type : 'date';
    }

    editExistingEvent(eventId) {
        const event = this.storage.getEvent(eventId);
        if (event) this.openEventCreator(event);
    }

    renderEventTypes(sel) {
        return [
            { id: 'date', e: '💑', l: 'Свидание' }, { id: 'holiday', e: '🎉', l: 'Праздник' },
            { id: 'birthday', e: '🎂', l: 'ДР' }, { id: 'anniversary', e: '💍', l: 'Годовщина' },
            { id: 'surprise', e: '🎁', l: 'Сюрприз' }, { id: 'dinner', e: '🍽️', l: 'Ужин' },
            { id: 'trip', e: '✈️', l: 'Поездка' }, { id: 'other', e: '⭐', l: 'Другое' },
        ].map(t => `<button class="event-type-btn ${(sel || 'date') === t.id ? 'active' : ''}" onclick="app.admin.selectEventType('${t.id}',this)"><span>${t.e}</span><span>${t.l}</span></button>`).join('');
    }

    selectEventType(t, btn) {
        document.querySelectorAll('.event-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._selectedEventType = t;
    }

    saveAdminEvent(editId) {
        const title = document.getElementById('adminEventTitle')?.value?.trim();
        const date = document.getElementById('adminEventDate')?.value;
        if (!title || !date) { window.app?.showToast('Заполните название и дату!'); return; }
        const ev = {
            id: editId || 'event_' + Date.now(),
            title, date,
            time: document.getElementById('adminEventTime')?.value || null,
            description: document.getElementById('adminEventDesc')?.value?.trim() || '',
            type: this._selectedEventType || 'other'
        };
        if (editId) this.storage.updateEvent(ev);
        else this.storage.addEvent(ev);
        document.getElementById('eventCreatorOverlay')?.remove();
        window.app?.showToast('Сохранено! 🎉');
        window.app?.effects?.launchConfetti(30);
        if (window.app?.currentPage === 'admin') this.renderFullAdmin();
        if (window.app?.currentPage === 'calendar') window.app.calendar.renderCalendar();
        if (window.app?.currentPage === 'home') window.app.updateUpcomingEvents();
    }

    // ========== ОСОБЫЕ ДАТЫ ==========
    manageSpecialDates() {
        document.getElementById('specialDatesOverlay')?.remove();
        const dates = this.storage.getSpecialDates();
        const html = `<div class="admin-modal-overlay active" id="specialDatesOverlay">
            <div class="admin-modal large"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('specialDatesOverlay').remove()">✕</button>
                <h2>🎉 Особые даты</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><label>Дата</label>
                    <input type="date" class="admin-input" id="specialDateInput"></div>
                <div class="admin-field"><label>Название</label>
                    <input class="admin-input" id="specialDateTitle" placeholder="День рождения..."></div>
                <div class="admin-field-row">
                    <select class="admin-select" id="specialDateEmoji">
                        <option value="💝">💝</option><option value="🌷">🌷</option>
                        <option value="🎂">🎂</option><option value="💍">💍</option>
                        <option value="🎄">🎄</option><option value="🎉">🎉</option>
                        <option value="🏖️">🏖️</option><option value="⭐">⭐</option>
                    </select>
                    <button class="admin-add-btn" onclick="app.admin.addSpecialDate()">+</button>
                </div>
                <div style="margin-top:16px">
                    ${dates.map(d => `<div class="special-date-item">
                        <span class="sd-emoji">${d.emoji}</span>
                        <div class="sd-info"><span class="sd-title">${d.title}</span>
                            <span class="sd-date">${new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span></div>
                        <button class="sd-delete" onclick="app.admin.removeSpecialDate('${d.id}')">🗑️</button>
                    </div>`).join('') || '<div class="admin-empty"><span>📅</span>Нет дат</div>'}
                </div>
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    addSpecialDate() {
        const date = document.getElementById('specialDateInput')?.value;
        const title = document.getElementById('specialDateTitle')?.value?.trim();
        if (!date || !title) { window.app?.showToast('Заполните дату и название!'); return; }
        this.storage.addSpecialDate({ id: 'sd_' + Date.now(), date, title, emoji: document.getElementById('specialDateEmoji')?.value || '⭐' });
        document.getElementById('specialDatesOverlay')?.remove();
        this.manageSpecialDates();
        window.app?.showToast('Добавлено! 🎉');
        if (window.app?.currentPage === 'admin') this.renderFullAdmin();
    }

    removeSpecialDate(id) {
        window.app.showConfirmModal('Удалить эту дату?', () => {
            this.storage.removeSpecialDate(id);
            document.getElementById('specialDatesOverlay')?.remove();
            this.manageSpecialDates();
            if (window.app?.currentPage === 'admin') this.renderFullAdmin();
        });
    }

    deleteSpecialDate(id) { this.removeSpecialDate(id); }

    // ========== ЗАКАЗЫ ==========
    completeOrder(orderId) {
        this.storage.updateOrderStatus(orderId, 'completed');
        window.app?.showToast('Заказ выполнен! ✅');
        this.renderFullAdmin();
    }

    rejectOrder(orderId) {
        window.app.showConfirmModal('Отклонить заказ? Звёзды вернутся пользователю.', () => {
            const orders = this.storage.getOrders();
            const order = orders.find(o => o.id === orderId);
            if (order) {
                // Вернуть звёзды
                const profile = this.storage.getProfile();
                this.storage.updateProfile({ userStars: (profile.userStars || 0) + order.price });
            }
            this.storage.updateOrderStatus(orderId, 'rejected');
            window.app?.showToast('Заказ отклонён, звёзды возвращены');
            this.renderFullAdmin();
        });
    }

    // ========== КОМПЛИМЕНТЫ ==========
    manageCompliments() {
        document.getElementById('complimentsOverlay')?.remove();
        const custom = this.storage.get('customCompliments') || [];
        const html = `<div class="admin-modal-overlay active" id="complimentsOverlay">
            <div class="admin-modal"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('complimentsOverlay').remove()">✕</button>
                <h2>✨ Комплименты</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field">
                    <textarea class="admin-textarea" id="newCompliment" rows="2" placeholder="Ты прекрасна как рассвет..."></textarea>
                </div>
                <button class="admin-submit-btn" onclick="app.admin.addCompliment()" style="margin-bottom:16px">+ Добавить</button>
                <div class="admin-section-label" style="padding:0;margin-bottom:8px">Пользовательские (${custom.length})</div>
                ${custom.map((c, i) => `
                    <div class="admin-list-item" style="margin-bottom:4px">
                        <div class="ali-emoji">✨</div>
                        <div class="ali-info"><h4>${c}</h4></div>
                        <button class="ali-delete" onclick="app.admin.removeCompliment(${i})">🗑️</button>
                    </div>
                `).join('') || '<div class="admin-empty"><span>✨</span>Нет пользовательских комплиментов</div>'}
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    addCompliment() {
        const text = document.getElementById('newCompliment')?.value?.trim();
        if (!text) { window.app?.showToast('Введите комплимент!'); return; }
        const custom = this.storage.get('customCompliments') || [];
        custom.push(text);
        this.storage.set('customCompliments', custom);
        
        // Добавить в app.compliments
        if (window.app?.compliments) window.app.compliments.push(text);
        
        document.getElementById('complimentsOverlay')?.remove();
        this.manageCompliments();
        window.app?.showToast('Комплимент добавлен! ✨');
    }

    removeCompliment(index) {
        const custom = this.storage.get('customCompliments') || [];
        custom.splice(index, 1);
        this.storage.set('customCompliments', custom);
        document.getElementById('complimentsOverlay')?.remove();
        this.manageCompliments();
    }

    // ========== УДАЛЕНИЕ АЛЬБОМА ==========
    deleteAlbum(id) {
        window.app.showConfirmModal('Удалить альбом и все фото в нём?', () => {
            this.storage.deleteAlbum(id);
            window.app?.showToast('Альбом удалён');
            this.renderFullAdmin();
            if (window.app?.currentPage === 'gallery') window.app.renderGalleryContent();
        });
    }

    // ========== УДАЛЕНИЕ ЗАПИСОК / ЦЕЛЕЙ ==========
    deleteNote(id) {
        const notes = (this.storage.get('quickNotes') || []).filter(n => n.id !== id);
        this.storage.set('quickNotes', notes);
        this.storage.serverDelete(`/api/notes/${id}`);
        this.renderFullAdmin();
    }

    deleteGoal(id) {
        const goals = (this.storage.get('goals') || []).filter(g => g.id !== id);
        this.storage.set('goals', goals);
        this.storage.serverDelete(`/api/goals/${id}`);
        this.renderFullAdmin();
    }

    // ========== ЭКСПОРТ / ИМПОРТ ==========
    exportData() {
        try {
            const text = JSON.stringify(this.storage.exportAll(), null, 2);
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => window.app?.showToast('Данные скопированы! 📋'));
            } else {
                this.showTextModal('📤 Экспорт', text);
            }
        } catch (e) { window.app?.showToast('Ошибка экспорта!'); }
    }

    importData() {
        document.getElementById('importOverlay')?.remove();
        const html = `<div class="admin-modal-overlay active" id="importOverlay">
            <div class="admin-modal"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('importOverlay').remove()">✕</button>
                <h2>📥 Импорт</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><label>Вставьте JSON данные</label>
                    <textarea class="admin-textarea" id="importTextarea" rows="6" placeholder='{"letters":[], ...}'></textarea></div>
                <button class="admin-submit-btn" onclick="app.admin.doImport()">📥 Импортировать</button>
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    doImport() {
        try {
            const text = document.getElementById('importTextarea')?.value?.trim();
            if (!text) return;
            const data = JSON.parse(text);
            Object.keys(data).forEach(key => {
                this.storage.set(key, data[key]);
            });
            document.getElementById('importOverlay')?.remove();
            window.app?.showToast('Данные импортированы! ✅');
            setTimeout(() => location.reload(), 1000);
        } catch (e) {
            window.app?.showToast('Ошибка: неверный формат JSON');
        }
    }

    showTextModal(title, text) {
        document.getElementById('textModalOverlay')?.remove();
        document.body.insertAdjacentHTML('beforeend',
            `<div class="admin-modal-overlay active" id="textModalOverlay"><div class="admin-modal"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('textModalOverlay').remove()">✕</button>
                <h2>${title}</h2></div>
            <div class="admin-modal-body"><textarea class="admin-textarea" style="min-height:200px;font-size:10px" readonly>${text}</textarea></div></div></div>`);
    }

    resetData() {
        window.app.showConfirmModal('⚠️ Удалить ВСЕ данные навсегда? Это необратимо!', () => {
            this.storage.clearAll();
            window.app?.showToast('Данные сброшены!');
            setTimeout(() => location.reload(), 1000);
        });
    }

    forceSync() {
        this.storage.fetchServerState().then(() => {
            window.app?.showToast('Синхронизировано! 🔄');
            this.renderFullAdmin();
        });
    }
}

window.AdminPanel = AdminPanel;