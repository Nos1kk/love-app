// js/admin.js — Полная админ-панель v4

class AdminPanel {
    constructor(storage) {
        this.storage = storage;
        this._selectedEventType = 'date';
    }

    // ========== ПОЛНЫЙ РЕНДЕР (#4) ==========
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

        container.innerHTML = `
            <!-- Быстрые действия -->
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

            <!-- Статистика -->
            <div class="section-title"><h2>📊 Статистика</h2></div>
            <div style="padding:0 20px;">
                <div class="analytics-grid">
                    <div class="analytics-card"><span class="analytics-card-value">${stats.daysTogether || 0}</span><span class="analytics-card-label">дней</span></div>
                    <div class="analytics-card"><span class="analytics-card-value">${letters.length}</span><span class="analytics-card-label">писем</span></div>
                    <div class="analytics-card"><span class="analytics-card-value">${gifts.length}</span><span class="analytics-card-label">подарков</span></div>
                    <div class="analytics-card"><span class="analytics-card-value">${events.length}</span><span class="analytics-card-label">событий</span></div>
                </div>
            </div>

            <!-- Управление пользователем -->
            <div class="section-title"><h2>👤 Профиль пользователя</h2></div>
            <div style="padding:0 20px 12px;">
                <div class="admin-list-item" onclick="app.admin.editUserProfile()">
                    <div class="ali-emoji">✏️</div>
                    <div class="ali-info"><h4>Имя: ${profile.userName || 'Любимая'}</h4><p>Статус: ${profile.userStatus || 'Не указан'}</p></div>
                </div>
                <div class="admin-list-item" style="margin-top:8px" onclick="app.admin.editCoupleDate()">
                    <div class="ali-emoji">📅</div>
                    <div class="ali-info"><h4>Дата отношений</h4><p>${profile.coupleDate || 'Не указана'}</p></div>
                </div>
                <div class="admin-list-item" style="margin-top:8px" onclick="app.admin.editBalance()">
                    <div class="ali-emoji">⭐</div>
                    <div class="ali-info"><h4>Баланс админа: ${profile.adminStars ?? 0} ⭐</h4><p>Баланс юзера: ${profile.userStars ?? 0} ⭐</p></div>
                </div>
            </div>

            <!-- Заказы -->
            ${orders.length > 0 ? `
                <div class="section-title"><h2>🛒 Заказы (${orders.length})</h2></div>
                <div class="admin-events-list">
                    ${orders.map(o => `
                        <div class="admin-list-item">
                            <div class="ali-emoji">📦</div>
                            <div class="ali-info"><h4>${o.itemId}</h4><p>${o.price} ⭐ • ${o.status || 'pending'}</p></div>
                            <button class="ali-delete" onclick="app.admin.completeOrder('${o.id}')">✅</button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Особые даты -->
            <div class="section-title"><h2>🎉 Особые даты (${specialDates.length})</h2>
                <span class="see-all" onclick="app.admin.manageSpecialDates()">Управление</span></div>
            <div class="admin-events-list">
                ${specialDates.map(d => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">${d.emoji}</div>
                        <div class="ali-info"><h4>${d.title}</h4><p>${d.date}</p></div>
                    </div>
                `).join('') || '<div class="admin-empty"><span>📅</span>Нет</div>'}
            </div>

            <!-- События -->
            <div class="section-title"><h2>📋 События (${events.length})</h2></div>
            <div class="admin-events-list" id="adminEventsList">
                ${events.map(e => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">${window.app?.getEventEmoji(e.type) || '📌'}</div>
                        <div class="ali-info"><h4>${e.title}</h4><p>${e.date}${e.time ? ' ' + e.time : ''}</p></div>
                        <button class="ali-delete" onclick="app.deleteAdminEvent('${e.id}')">🗑️</button>
                    </div>
                `).join('') || '<div class="admin-empty"><span>📅</span>Нет событий</div>'}
            </div>

            <!-- Письма -->
            <div class="section-title"><h2>💌 Письма (${letters.length})</h2></div>
            <div class="admin-letters-list">
                ${letters.slice(0, 10).map(l => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">${l.mood || '💌'}</div>
                        <div class="ali-info"><h4>${l.subject || 'Без темы'}</h4><p>${l.read ? '✓ Прочитано' : '● Новое'} • ${l.replies?.length || 0} ответов</p></div>
                        <button class="ali-delete" onclick="app.deleteAdminLetter('${l.id}')">🗑️</button>
                    </div>
                `).join('') || '<div class="admin-empty"><span>💌</span>Нет</div>'}
            </div>

            <!-- Подарки -->
            <div class="section-title"><h2>🎁 Подарки (${gifts.length})</h2></div>
            <div class="admin-gifts-list">
                ${gifts.slice(0, 10).map(g => `
                    <div class="admin-list-item">
                        <div class="ali-emoji">${g.emoji}</div>
                        <div class="ali-info"><h4>${g.name}</h4><p>${g.opened ? 'Открыт' : 'Не открыт'} • ${g.from} → ${g.to || '?'}</p></div>
                    </div>
                `).join('') || '<div class="admin-empty"><span>🎁</span>Нет</div>'}
            </div>

            <!-- Данные -->
            <div class="section-title"><h2>💾 Данные</h2></div>
            <div style="padding:0 20px 30px;">
                <div class="admin-list-item" onclick="app.admin.exportData()" style="cursor:pointer">
                    <div class="ali-emoji">📤</div>
                    <div class="ali-info"><h4>Экспорт данных</h4><p>Скопировать все данные</p></div>
                </div>
                <div class="admin-list-item" style="margin-top:8px;cursor:pointer" onclick="app.admin.resetData()">
                    <div class="ali-emoji">🗑️</div>
                    <div class="ali-info"><h4>Сбросить всё</h4><p>Удалить все данные</p></div>
                </div>
            </div>
        `;
    }

    // Редактирование профиля пользователя
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
                        <div class="admin-field"><label>Статус</label>
                            <input class="admin-input" id="editUserStatus" value="${profile.userStatus || ''}" placeholder="Статус..."></div>
                        <div class="admin-field"><label>Звёзды пользователя</label>
                            <input type="number" class="admin-input" id="editUserStars" value="${profile.userStars || 0}" min="0"></div>
                        <div class="admin-field"><label>Звёзды админа</label>
                            <input type="number" class="admin-input" id="editAdminStars" value="${profile.adminStars || 0}" min="0"></div>
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
            userStars: parseInt(document.getElementById('editUserStars')?.value) || 0,
            adminStars: parseInt(document.getElementById('editAdminStars')?.value) || 0,
        });
        document.getElementById('editUserOverlay')?.remove();
        window.app?.showToast('Сохранено! ✨');
        window.app?.updateHeaderUI();
        this.renderFullAdmin();
    }

    completeOrder(orderId) {
        this.storage.updateOrderStatus(orderId, 'completed');
        window.app?.showToast('Заказ выполнен! ✅');
        this.renderFullAdmin();
    }

    // === Остальные методы из предыдущей версии ===
    openEventCreator(editEvent = null) {
        const isEdit = !!editEvent;
        document.getElementById('eventCreatorOverlay')?.remove();
        const html = `
            <div class="admin-modal-overlay active" id="eventCreatorOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('eventCreatorOverlay').remove()">✕</button>
                        <h2>${isEdit ? '✏️' : '📅'} Событие</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field"><label>Название</label>
                            <input class="admin-input" id="adminEventTitle" value="${isEdit ? editEvent.title : ''}" placeholder="Ужин..."></div>
                        <div class="admin-field"><label>Дата</label>
                            <input type="date" class="admin-input" id="adminEventDate" value="${isEdit ? editEvent.date : ''}"></div>
                        <div class="admin-field"><label>Время</label>
                            <input type="time" class="admin-input" id="adminEventTime" value="${isEdit ? (editEvent.time || '') : ''}"></div>
                        <div class="admin-field"><label>Описание</label>
                            <textarea class="admin-textarea" id="adminEventDesc" rows="2">${isEdit ? (editEvent.description || '') : ''}</textarea></div>
                        <div class="admin-field"><label>Тип</label>
                            <div class="event-type-grid">${this.renderEventTypes(isEdit ? editEvent.type : null)}</div></div>
                        <button class="admin-submit-btn" onclick="app.admin.saveAdminEvent(${isEdit ? `'${editEvent.id}'` : 'null'})">${isEdit ? '💾' : '✨'} Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this._selectedEventType = isEdit ? editEvent.type : 'date';
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
        if (!title || !date) { window.app?.showToast('Заполните поля!'); return; }
        const ev = { id: editId || 'event_' + Date.now(), title, date,
            time: document.getElementById('adminEventTime')?.value || null,
            description: document.getElementById('adminEventDesc')?.value?.trim() || '',
            type: this._selectedEventType || 'other', repeat: 'none', reminder: 'none' };
        if (editId) this.storage.updateEvent(ev); else this.storage.addEvent(ev);
        document.getElementById('eventCreatorOverlay')?.remove();
        window.app?.showToast('Сохранено! 🎉');
        window.app?.effects?.launchConfetti(30);
        if (window.app?.currentPage === 'admin') this.renderFullAdmin();
        if (window.app?.currentPage === 'calendar') window.app.calendar.renderCalendar();
        if (window.app?.currentPage === 'home') window.app.updateUpcomingEvents();
    }

    manageSpecialDates() {
        document.getElementById('specialDatesOverlay')?.remove();
        const dates = this.storage.getSpecialDates();
        const html = `<div class="admin-modal-overlay active" id="specialDatesOverlay">
            <div class="admin-modal large"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('specialDatesOverlay').remove()">✕</button>
                <h2>🎉 Даты</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field-row">
                    <input type="date" class="admin-input" id="specialDateInput">
                    <input class="admin-input" id="specialDateTitle" placeholder="Название...">
                </div>
                <div class="admin-field-row" style="margin-top:8px">
                    <select class="admin-select" id="specialDateEmoji">
                        <option value="💝">💝</option><option value="🌷">🌷</option>
                        <option value="🎂">🎂</option><option value="💍">💍</option>
                        <option value="🎄">🎄</option><option value="🎉">🎉</option>
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
        if (!date || !title) { window.app?.showToast('Заполните!'); return; }
        this.storage.addSpecialDate({ id: 'sd_' + Date.now(), date, title, emoji: document.getElementById('specialDateEmoji')?.value || '⭐' });
        document.getElementById('specialDatesOverlay')?.remove();
        this.manageSpecialDates();
        window.app?.showToast('Добавлено!');
    }

    removeSpecialDate(id) {
        window.app.showConfirmModal('Удалить?', () => {
            this.storage.removeSpecialDate(id);
            document.getElementById('specialDatesOverlay')?.remove();
            this.manageSpecialDates();
        });
    }

    editCoupleDate() {
        document.getElementById('coupleDateOverlay')?.remove();
        const p = this.storage.getProfile();
        const html = `<div class="admin-modal-overlay active" id="coupleDateOverlay">
            <div class="admin-modal small"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('coupleDateOverlay').remove()">✕</button>
                <h2>📅 Дата</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><input type="date" class="admin-input" id="coupleDateInput" value="${p.coupleDateRaw || ''}"></div>
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
        window.app?.showToast(`${days} дней! 💕`);
        if (window.app?.currentPage === 'admin') this.renderFullAdmin();
    }

    editBalance() {
        document.getElementById('balanceOverlay')?.remove();
        const p = this.storage.getProfile();
        const html = `<div class="admin-modal-overlay active" id="balanceOverlay">
            <div class="admin-modal small"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('balanceOverlay').remove()">✕</button>
                <h2>⭐ Баланс</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><label>Админ</label>
                    <input type="number" class="admin-input" id="balanceAdminInput" value="${p.adminStars ?? 0}" min="0"></div>
                <div class="admin-field"><label>Пользователь</label>
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
        if (window.app?.currentPage === 'admin') this.renderFullAdmin();
        if (window.app?.currentPage === 'gifts') window.app.renderGiftsContent();
    }

    exportData() {
        try {
            const text = JSON.stringify(this.storage.exportAll(), null, 2);
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => window.app?.showToast('Скопировано! 📋'));
            } else {
                document.getElementById('exportOverlay')?.remove();
                document.body.insertAdjacentHTML('beforeend',
                    `<div class="admin-modal-overlay active" id="exportOverlay"><div class="admin-modal"><div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('exportOverlay').remove()">✕</button>
                        <h2>📤 Данные</h2></div>
                    <div class="admin-modal-body"><textarea class="admin-textarea" style="min-height:200px;font-size:9px" readonly>${text}</textarea></div></div></div>`);
            }
        } catch (e) { window.app?.showToast('Ошибка!'); }
    }

    resetData() {
        window.app.showConfirmModal('⚠️ Удалить ВСЕ данные навсегда?', () => {
            this.storage.clearAll();
            window.app?.showToast('Сброшено!');
            setTimeout(() => location.reload(), 1000);
        });
    }
}

window.AdminPanel = AdminPanel;