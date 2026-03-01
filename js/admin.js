// js/admin.js — Админ-панель (все confirm/prompt заменены на модалки)

class AdminPanel {
    constructor(storage) {
        this.storage = storage;
        this._selectedEventType = 'date';
    }

    openEventCreator(editEvent = null) {
        const isEdit = !!editEvent;
        document.getElementById('eventCreatorOverlay')?.remove();

        const html = `
            <div class="admin-modal-overlay active" id="eventCreatorOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="window.app.admin.closeEventCreator()">✕</button>
                        <h2>${isEdit ? '✏️ Редактировать' : '📅 Новое событие'}</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>🎉 Название</label>
                            <input type="text" class="admin-input" id="adminEventTitle"
                                   placeholder="Романтический ужин" value="${isEdit ? editEvent.title : ''}">
                        </div>
                        <div class="admin-field">
                            <label>📅 Дата</label>
                            <input type="date" class="admin-input" id="adminEventDate" value="${isEdit ? editEvent.date : ''}">
                        </div>
                        <div class="admin-field">
                            <label>⏰ Время</label>
                            <input type="time" class="admin-input" id="adminEventTime" value="${isEdit ? (editEvent.time || '') : ''}">
                        </div>
                        <div class="admin-field">
                            <label>📝 Описание</label>
                            <textarea class="admin-textarea" id="adminEventDesc" rows="2">${isEdit ? (editEvent.description || '') : ''}</textarea>
                        </div>
                        <div class="admin-field">
                            <label>🎨 Тип</label>
                            <div class="event-type-grid">${this.renderEventTypes(isEdit ? editEvent.type : null)}</div>
                        </div>
                        <div class="admin-field">
                            <label>🔄 Повторение</label>
                            <select class="admin-select" id="adminEventRepeat">
                                <option value="none" ${isEdit && editEvent.repeat === 'none' ? 'selected' : ''}>Однократно</option>
                                <option value="yearly" ${isEdit && editEvent.repeat === 'yearly' ? 'selected' : ''}>Ежегодно</option>
                                <option value="monthly" ${isEdit && editEvent.repeat === 'monthly' ? 'selected' : ''}>Ежемесячно</option>
                            </select>
                        </div>
                        <button class="admin-submit-btn" onclick="window.app.admin.saveAdminEvent(${isEdit ? `'${editEvent.id}'` : 'null'})">
                            ${isEdit ? '💾 Сохранить' : '✨ Создать'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this._selectedEventType = isEdit ? editEvent.type : 'date';
    }

    renderEventTypes(selected) {
        const types = [
            { id: 'date', emoji: '💑', label: 'Свидание' },
            { id: 'holiday', emoji: '🎉', label: 'Праздник' },
            { id: 'birthday', emoji: '🎂', label: 'ДР' },
            { id: 'anniversary', emoji: '💍', label: 'Годовщина' },
            { id: 'surprise', emoji: '🎁', label: 'Сюрприз' },
            { id: 'trip', emoji: '✈️', label: 'Поездка' },
            { id: 'dinner', emoji: '🍽️', label: 'Ужин' },
            { id: 'other', emoji: '⭐', label: 'Другое' },
        ];
        return types.map(t => `
            <button class="event-type-btn ${(selected || 'date') === t.id ? 'active' : ''}"
                    onclick="window.app.admin.selectEventType('${t.id}', this)">
                <span>${t.emoji}</span><span>${t.label}</span>
            </button>
        `).join('');
    }

    selectEventType(type, btn) {
        document.querySelectorAll('.event-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._selectedEventType = type;
    }

    saveAdminEvent(editId) {
        const title = document.getElementById('adminEventTitle')?.value?.trim();
        const date = document.getElementById('adminEventDate')?.value;
        if (!title || !date) { window.app?.showToast('Заполните название и дату! 📝'); return; }

        const eventData = {
            id: editId || 'event_' + Date.now(),
            title,
            date,
            time: document.getElementById('adminEventTime')?.value || null,
            description: document.getElementById('adminEventDesc')?.value?.trim() || '',
            type: this._selectedEventType || 'other',
            repeat: document.getElementById('adminEventRepeat')?.value || 'none',
            reminder: 'none',
            createdAt: new Date().toISOString()
        };

        if (editId) this.storage.updateEvent(eventData);
        else this.storage.addEvent(eventData);

        this.closeEventCreator();
        window.app?.showToast(editId ? 'Обновлено! 📅' : 'Создано! 🎉');
        window.app?.effects?.launchConfetti(30);

        if (window.app?.currentPage === 'calendar') window.app.calendar.renderCalendar();
        if (window.app?.currentPage === 'admin') window.app.renderAdminContent();
        if (window.app?.currentPage === 'home') window.app.updateUpcomingEvents();
        window.app?.nav?.updateBadges();
    }

    closeEventCreator() { document.getElementById('eventCreatorOverlay')?.remove(); }

    // ========== ОСОБЫЕ ДАТЫ ==========
    manageSpecialDates() {
        document.getElementById('specialDatesOverlay')?.remove();
        const specialDates = this.storage.getSpecialDates();

        const html = `
            <div class="admin-modal-overlay active" id="specialDatesOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="window.app.admin.closeSpecialDates()">✕</button>
                        <h2>🎉 Особые даты</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field-row">
                            <input type="date" class="admin-input" id="specialDateInput">
                            <input type="text" class="admin-input" id="specialDateTitle" placeholder="Название...">
                        </div>
                        <div class="admin-field-row" style="margin-top:8px;">
                            <select class="admin-select" id="specialDateEmoji">
                                <option value="💝">💝</option><option value="🌷">🌷</option>
                                <option value="🎂">🎂</option><option value="💍">💍</option>
                                <option value="🎄">🎄</option><option value="🎉">🎉</option>
                            </select>
                            <button class="admin-add-btn" onclick="window.app.admin.addSpecialDate()">+</button>
                        </div>
                        <div id="specialDatesListAdmin" style="margin-top:16px;">
                            ${specialDates.length === 0
                                ? '<div class="admin-empty"><span>📅</span>Нет особых дат</div>'
                                : specialDates.map(d => `
                                    <div class="special-date-item">
                                        <span class="sd-emoji">${d.emoji}</span>
                                        <div class="sd-info">
                                            <span class="sd-title">${d.title}</span>
                                            <span class="sd-date">${new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                                        </div>
                                        <button class="sd-delete" onclick="window.app.admin.removeSpecialDate('${d.id}')">🗑️</button>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    addSpecialDate() {
        const date = document.getElementById('specialDateInput')?.value;
        const title = document.getElementById('specialDateTitle')?.value?.trim();
        if (!date || !title) { window.app?.showToast('Заполните дату и название!'); return; }

        this.storage.addSpecialDate({ id: 'sd_' + Date.now(), date, title, emoji: document.getElementById('specialDateEmoji')?.value || '⭐' });
        this.closeSpecialDates();
        this.manageSpecialDates();
        window.app?.showToast('Добавлено! 🎉');
        if (window.app?.currentPage === 'calendar') window.app.calendar.renderCalendar();
    }

    removeSpecialDate(id) {
        window.app.showConfirmModal('Удалить эту дату?', () => {
            this.storage.removeSpecialDate(id);
            this.closeSpecialDates();
            this.manageSpecialDates();
            window.app?.showToast('Удалено 🗑️');
        });
    }

    closeSpecialDates() { document.getElementById('specialDatesOverlay')?.remove(); }

    // ========== ДАТА ПАРЫ ==========
    editCoupleDate() {
        document.getElementById('coupleDateOverlay')?.remove();
        const profile = this.storage.getProfile();

        const html = `
            <div class="admin-modal-overlay active" id="coupleDateOverlay">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('coupleDateOverlay').remove()">✕</button>
                        <h2>📅 Дата отношений</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>С какого дня вы вместе?</label>
                            <input type="date" class="admin-input" id="coupleDateInput" value="${profile.coupleDateRaw || '2024-02-14'}">
                        </div>
                        <button class="admin-submit-btn" onclick="window.app.admin.saveCoupleDate()">💕 Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    saveCoupleDate() {
        const date = document.getElementById('coupleDateInput')?.value;
        if (!date) { window.app?.showToast('Выберите дату!'); return; }

        const formatted = new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        this.storage.updateProfile({ coupleDate: formatted, coupleDateRaw: date });

        const daysTogether = Math.floor((new Date() - new Date(date)) / 86400000);
        this.storage.updateStats({ daysTogether: Math.max(0, daysTogether) });

        document.getElementById('coupleDateOverlay')?.remove();
        window.app?.showToast(`${daysTogether} дней счастья! 💕`);
        if (window.app?.currentPage === 'profile') window.app.renderProfileContent();
    }

    // ========== БАЛАНС ==========
    editBalance() {
        document.getElementById('balanceOverlay')?.remove();
        const profile = this.storage.getProfile();
        const currentBalance = profile.adminStars ?? profile.giftBalance ?? 0;

        const html = `
            <div class="admin-modal-overlay active" id="balanceOverlay">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('balanceOverlay').remove()">✕</button>
                        <h2>⭐ Баланс</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>Текущий: ${currentBalance} ⭐</label>
                            <input type="number" class="admin-input" id="balanceInput" value="${currentBalance}" min="0">
                        </div>
                        <div class="admin-field-row" style="margin-bottom:12px;">
                            <button class="event-type-btn" onclick="window.app.admin.quickAddBalance(10)">+10</button>
                            <button class="event-type-btn" onclick="window.app.admin.quickAddBalance(50)">+50</button>
                            <button class="event-type-btn" onclick="window.app.admin.quickAddBalance(100)">+100</button>
                        </div>
                        <button class="admin-submit-btn" onclick="window.app.admin.saveBalance()">💰 Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    quickAddBalance(amount) {
        const input = document.getElementById('balanceInput');
        if (input) input.value = parseInt(input.value || 0) + amount;
    }

    saveBalance() {
        const balance = parseInt(document.getElementById('balanceInput')?.value) || 0;
        this.storage.updateProfile({ adminStars: Math.max(0, balance), giftBalance: Math.max(0, balance) });
        document.getElementById('balanceOverlay')?.remove();
        window.app?.showToast(`Баланс: ${balance} ⭐`);
        if (window.app?.currentPage === 'gifts') window.app.renderGiftsContent();
    }

    // ========== EXPORT / RESET ==========
    exportData() {
        try {
            const data = this.storage.exportAll();
            const text = JSON.stringify(data, null, 2);

            // В Telegram нельзя скачать файл — копируем в буфер
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    window.app?.showToast('Данные скопированы в буфер! 📋');
                }).catch(() => {
                    // Fallback — показать в модалке
                    this.showExportText(text);
                });
            } else {
                this.showExportText(text);
            }
        } catch (e) {
            console.error('Export error:', e);
            window.app?.showToast('Ошибка экспорта 😥');
        }
    }

    showExportText(text) {
        document.getElementById('exportOverlay')?.remove();
        const html = `
            <div class="admin-modal-overlay active" id="exportOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('exportOverlay').remove()">✕</button>
                        <h2>📤 Экспорт</h2>
                    </div>
                    <div class="admin-modal-body">
                        <textarea class="admin-textarea" style="min-height:200px;font-size:10px;" readonly>${text}</textarea>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    resetData() {
        window.app.showConfirmModal('⚠️ Удалить ВСЕ данные? Это необратимо!', () => {
            this.storage.clearAll();
            window.app?.showToast('Данные сброшены 🗑️');
            setTimeout(() => location.reload(), 1000);
        });
    }
}

window.AdminPanel = AdminPanel;