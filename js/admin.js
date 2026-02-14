// js/admin.js — Админ-панель: управление датами, событиями, настройками

class AdminPanel {
    constructor(storage) {
        this.storage = storage;
        this._selectedEventType = 'date';
    }

    // ========== СОЗДАНИЕ СОБЫТИЯ ==========
    openEventCreator(editEvent = null) {
        const isEdit = !!editEvent;

        // Удалить предыдущий если есть
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
                            <label>🎉 Название события</label>
                            <input type="text" class="admin-input" id="adminEventTitle" 
                                   placeholder="Например: Романтический ужин"
                                   value="${isEdit ? editEvent.title : ''}">
                        </div>

                        <div class="admin-field">
                            <label>📅 Дата</label>
                            <input type="date" class="admin-input" id="adminEventDate"
                                   value="${isEdit ? editEvent.date : ''}">
                        </div>

                        <div class="admin-field">
                            <label>⏰ Время (необязательно)</label>
                            <input type="time" class="admin-input" id="adminEventTime"
                                   value="${isEdit ? (editEvent.time || '') : ''}">
                        </div>

                        <div class="admin-field">
                            <label>📝 Описание</label>
                            <textarea class="admin-textarea" id="adminEventDesc" rows="3"
                                      placeholder="Описание события...">${isEdit ? (editEvent.description || '') : ''}</textarea>
                        </div>

                        <div class="admin-field">
                            <label>🎨 Тип события</label>
                            <div class="event-type-grid">
                                ${this.renderEventTypes(isEdit ? editEvent.type : null)}
                            </div>
                        </div>

                        <div class="admin-field">
                            <label>🔄 Повторение</label>
                            <select class="admin-select" id="adminEventRepeat">
                                <option value="none" ${isEdit && editEvent.repeat === 'none' ? 'selected' : ''}>Однократно</option>
                                <option value="yearly" ${isEdit && editEvent.repeat === 'yearly' ? 'selected' : ''}>Ежегодно</option>
                                <option value="monthly" ${isEdit && editEvent.repeat === 'monthly' ? 'selected' : ''}>Ежемесячно</option>
                                <option value="weekly" ${isEdit && editEvent.repeat === 'weekly' ? 'selected' : ''}>Еженедельно</option>
                            </select>
                        </div>

                        <div class="admin-field">
                            <label>🔔 Напоминание</label>
                            <select class="admin-select" id="adminEventReminder">
                                <option value="none">Без напоминания</option>
                                <option value="1h">За 1 час</option>
                                <option value="1d" selected>За 1 день</option>
                                <option value="3d">За 3 дня</option>
                                <option value="1w">За неделю</option>
                            </select>
                        </div>

                        <button class="admin-submit-btn" onclick="window.app.admin.saveAdminEvent(${isEdit ? `'${editEvent.id}'` : 'null'})">
                            ${isEdit ? '💾 Сохранить' : '✨ Создать событие'}
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
            { id: 'birthday', emoji: '🎂', label: 'День рождения' },
            { id: 'anniversary', emoji: '💍', label: 'Годовщина' },
            { id: 'surprise', emoji: '🎁', label: 'Сюрприз' },
            { id: 'trip', emoji: '✈️', label: 'Путешествие' },
            { id: 'dinner', emoji: '🍽️', label: 'Ужин' },
            { id: 'other', emoji: '⭐', label: 'Другое' },
        ];

        return types.map(t => `
            <button class="event-type-btn ${(selected || 'date') === t.id ? 'active' : ''}" 
                    onclick="window.app.admin.selectEventType('${t.id}', this)">
                <span>${t.emoji}</span>
                <span>${t.label}</span>
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
        const time = document.getElementById('adminEventTime')?.value;
        const desc = document.getElementById('adminEventDesc')?.value?.trim();
        const repeat = document.getElementById('adminEventRepeat')?.value;
        const reminder = document.getElementById('adminEventReminder')?.value;

        if (!title || !date) {
            window.app?.toast?.show('Заполните название и дату! 📝');
            return;
        }

        const eventData = {
            id: editId || 'event_' + Date.now(),
            title,
            date,
            time: time || null,
            description: desc || '',
            type: this._selectedEventType || 'other',
            repeat: repeat || 'none',
            reminder: reminder || 'none',
            createdAt: new Date().toISOString()
        };

        if (editId) {
            this.storage.updateEvent(eventData);
        } else {
            this.storage.addEvent(eventData);
        }

        this.closeEventCreator();
        window.app?.toast?.show(editId ? 'Событие обновлено! 📅' : 'Событие создано! 🎉');
        window.app?.effects?.launchConfetti(30);

        // Обновить страницы
        if (window.app?.currentPage === 'calendar') {
            window.app.calendar.renderCalendar();
        }
        if (window.app?.currentPage === 'admin') {
            window.app.renderAdminContent();
        }
        if (window.app?.currentPage === 'home') {
            window.app.updateUpcomingEvents();
        }

        // Обновить бейджи
        window.app?.nav?.updateBadges();
    }

    closeEventCreator() {
        const overlay = document.getElementById('eventCreatorOverlay');
        if (overlay) overlay.remove();
    }

    // ========== УПРАВЛЕНИЕ ОСОБЫМИ ДАТАМИ ==========
    manageSpecialDates() {
        // Удалить предыдущий если есть
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
                        <div class="special-dates-add">
                            <div class="admin-field">
                                <label>Добавить новую дату</label>
                            </div>
                            <div class="admin-field-row">
                                <input type="date" class="admin-input" id="specialDateInput">
                                <input type="text" class="admin-input" id="specialDateTitle" placeholder="Название...">
                            </div>
                            <div class="admin-field-row" style="margin-top: 8px;">
                                <select class="admin-select" id="specialDateEmoji">
                                    <option value="💝">💝 Любовь</option>
                                    <option value="🌷">🌷 Цветы</option>
                                    <option value="🎂">🎂 День рождения</option>
                                    <option value="💍">💍 Годовщина</option>
                                    <option value="🎄">🎄 Новый год</option>
                                    <option value="🎉">🎉 Праздник</option>
                                    <option value="⭐">⭐ Особое</option>
                                </select>
                                <button class="admin-add-btn" onclick="window.app.admin.addSpecialDate()">+</button>
                            </div>
                        </div>

                        <div style="margin-top: 20px;">
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-light);">Текущие даты</label>
                        </div>

                        <div id="specialDatesListAdmin" style="margin-top: 10px;">
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
                                `).join('')
                            }
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
        const emoji = document.getElementById('specialDateEmoji')?.value;

        if (!date || !title) {
            window.app?.toast?.show('Заполните дату и название! 📝');
            return;
        }

        this.storage.addSpecialDate({
            id: 'sd_' + Date.now(),
            date,
            title,
            emoji: emoji || '⭐'
        });

        // Перерендерить модалку
        this.closeSpecialDates();
        this.manageSpecialDates();
        window.app?.toast?.show('Особая дата добавлена! 🎉');

        // Обновить календарь
        if (window.app?.currentPage === 'calendar') {
            window.app.calendar.renderCalendar();
        }
    }

    removeSpecialDate(id) {
        if (!confirm('Удалить эту дату?')) return;

        this.storage.removeSpecialDate(id);
        this.closeSpecialDates();
        this.manageSpecialDates();
        window.app?.toast?.show('Дата удалена 🗑️');
    }

    closeSpecialDates() {
        const overlay = document.getElementById('specialDatesOverlay');
        if (overlay) overlay.remove();
    }

    // ========== НАСТРОЙКИ ПАРЫ ==========
    editCoupleName() {
        const profile = this.storage.getProfile();
        const name = prompt('Имя партнёрши:', profile.userName || 'Любимая');
        if (name !== null && name.trim()) {
            this.storage.updateProfile({ userName: name.trim() });
            window.app?.updateHeaderUI();
            window.app?.toast?.show('Имя обновлено! ✨');

            // Обновить профиль если открыт
            if (window.app?.currentPage === 'profile') {
                window.app.renderProfileContent();
            }
        }
    }

    editCoupleDate() {
        // Удалить предыдущий если есть
        document.getElementById('coupleDateOverlay')?.remove();

        const profile = this.storage.getProfile();

        const html = `
            <div class="admin-modal-overlay active" id="coupleDateOverlay">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('coupleDateOverlay').remove()">✕</button>
                        <h2>📅 Дата начала отношений</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>С какого дня вы вместе?</label>
                            <input type="date" class="admin-input" id="coupleDateInput" 
                                   value="${profile.coupleDateRaw || '2024-02-14'}">
                        </div>
                        <button class="admin-submit-btn" onclick="window.app.admin.saveCoupleDate()">
                            💕 Сохранить
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    saveCoupleDate() {
        const date = document.getElementById('coupleDateInput')?.value;
        if (!date) {
            window.app?.toast?.show('Выберите дату! 📅');
            return;
        }

        const formatted = new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        this.storage.updateProfile({ 
            coupleDate: formatted, 
            coupleDateRaw: date 
        });

        // Вычислить дни вместе
        const daysTogether = Math.floor((new Date() - new Date(date)) / 86400000);
        this.storage.updateStats({ daysTogther: Math.max(0, daysTogether) });

        document.getElementById('coupleDateOverlay')?.remove();
        window.app?.toast?.show(`${daysTogether} дней счастья! 💕`);

        // Обновить профиль если открыт
        if (window.app?.currentPage === 'profile') {
            window.app.renderProfileContent();
        }
    }

    editBalance() {
        const profile = this.storage.getProfile();
        const currentBalance = profile.giftBalance || 0;

        // Удалить предыдущий если есть
        document.getElementById('balanceOverlay')?.remove();

        const html = `
            <div class="admin-modal-overlay active" id="balanceOverlay">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('balanceOverlay').remove()">✕</button>
                        <h2>⭐ Баланс звёзд</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>Текущий баланс: ${currentBalance} ⭐</label>
                            <input type="number" class="admin-input" id="balanceInput" 
                                   value="${currentBalance}" min="0" max="99999"
                                   placeholder="Введите новый баланс">
                        </div>
                        <div class="admin-field">
                            <label>Быстрое добавление</label>
                            <div class="admin-field-row">
                                <button class="event-type-btn" onclick="window.app.admin.quickAddBalance(10)">+10 ⭐</button>
                                <button class="event-type-btn" onclick="window.app.admin.quickAddBalance(50)">+50 ⭐</button>
                                <button class="event-type-btn" onclick="window.app.admin.quickAddBalance(100)">+100 ⭐</button>
                                <button class="event-type-btn" onclick="window.app.admin.quickAddBalance(500)">+500 ⭐</button>
                            </div>
                        </div>
                        <button class="admin-submit-btn" onclick="window.app.admin.saveBalance()">
                            💰 Сохранить баланс
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    quickAddBalance(amount) {
        const input = document.getElementById('balanceInput');
        if (input) {
            input.value = parseInt(input.value || 0) + amount;
        }
    }

    saveBalance() {
        const input = document.getElementById('balanceInput');
        const balance = parseInt(input?.value) || 0;

        this.storage.updateProfile({ giftBalance: Math.max(0, balance) });
        document.getElementById('balanceOverlay')?.remove();
        window.app?.toast?.show(`Баланс обновлён: ${balance} ⭐`);

        // Обновить страницу подарков если открыта
        if (window.app?.currentPage === 'gifts') {
            window.app.renderGiftsContent();
        }
    }

    // ========== ЭКСПОРТ / СБРОС ==========
    exportData() {
        try {
            const data = this.storage.exportAll();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `love-app-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            window.app?.toast?.show('Данные экспортированы! 📤');
        } catch (e) {
            console.error('Export error:', e);
            window.app?.toast?.show('Ошибка экспорта 😥');
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    Object.keys(data).forEach(key => {
                        this.storage.set(key, data[key]);
                    });
                    window.app?.toast?.show('Данные импортированы! 📥');
                    setTimeout(() => location.reload(), 1000);
                } catch (err) {
                    console.error('Import error:', err);
                    window.app?.toast?.show('Ошибка импорта файла 😥');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    resetData() {
        if (!confirm('⚠️ Вы уверены? Все данные будут удалены!')) return;
        if (!confirm('🥺 Точно-точно? Это необратимо!')) return;

        this.storage.clearAll();
        window.app?.toast?.show('Данные сброшены 🗑️');
        setTimeout(() => location.reload(), 1000);
    }
}

window.AdminPanel = AdminPanel;