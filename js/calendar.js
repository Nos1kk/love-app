// js/calendar.js — Полноценный календарь

class CalendarManager {
    constructor(storage, isAdmin = false) {
        this.storage = storage;
        this.isAdmin = isAdmin;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.selectedDate = null;

        this.monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        this.eventTypeEmojis = {
            date: '💑', holiday: '🎉', birthday: '🎂', anniversary: '💍',
            surprise: '🎁', trip: '✈️', dinner: '🍽️', other: '⭐',
            event: '📌', meeting: '🤝'
        };
    }

    // ========== РЕНДЕР КАЛЕНДАРЯ ==========
    renderCalendar() {
        this.renderMonthView();
        this.renderEventsList();
        this.renderSpecialDates();
    }

    renderMonthView() {
        const monthLabel = document.getElementById('calendarMonth');
        const daysContainer = document.getElementById('calendarDays');

        if (!daysContainer) return;

        if (monthLabel) {
            monthLabel.innerHTML = `${this.monthNames[this.currentMonth]} <span>${this.currentYear}</span>`;
        }

        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
        const startDay = firstDay === 0 ? 6 : firstDay - 1;

        const today = new Date();
        const events = this.storage.getEvents();
        const specialDates = this.storage.getSpecialDates();

        let html = '';

        // Дни предыдущего месяца
        for (let i = startDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += `<div class="cal-day other-month empty">${day}</div>`;
        }

        // Дни текущего месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = today.getDate() === day &&
                today.getMonth() === this.currentMonth &&
                today.getFullYear() === this.currentYear;

            const isPast = new Date(this.currentYear, this.currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Проверить события
            const dayEvents = events.filter(e => e.date === dateStr);
            const isSpecial = specialDates.some(sd => {
                const sdDate = new Date(sd.date);
                return sdDate.getMonth() === this.currentMonth && sdDate.getDate() === day;
            });

            const hasMeeting = dayEvents.some(e => e.type === 'meeting');
            const hasEvent = dayEvents.length > 0;

            let classes = ['cal-day'];
            if (isToday) classes.push('today');
            if (isPast && !isToday) classes.push('past');
            if (isSpecial) classes.push('special');
            if (hasEvent && !isSpecial) classes.push('has-event');
            if (hasMeeting) classes.push('has-meeting');
            if (this.selectedDate === dateStr) classes.push('selected');

            html += `<div class="${classes.join(' ')}" onclick="app.calendar.selectDay('${dateStr}', ${day})">${day}</div>`;
        }

        // Дни следующего месяца
        const totalCells = startDay + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remaining; i++) {
            html += `<div class="cal-day other-month empty">${i}</div>`;
        }

        daysContainer.innerHTML = html;
    }

    // ========== НАВИГАЦИЯ ПО МЕСЯЦАМ ==========
    changeMonth(delta) {
        this.currentMonth += delta;

        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }

        this.selectedDate = null;
        const details = document.getElementById('dayDetails');
        if (details) details.style.display = 'none';

        this.renderMonthView();
    }

    goToToday() {
        const today = new Date();
        this.currentMonth = today.getMonth();
        this.currentYear = today.getFullYear();
        this.renderMonthView();
    }

    // ========== ВЫБОР ДНЯ ==========
    selectDay(dateStr, day) {
        this.selectedDate = dateStr;
        this.renderMonthView();

        const events = this.storage.getEvents().filter(e => e.date === dateStr);
        const specialDates = this.storage.getSpecialDates().filter(sd => {
            const d = new Date(sd.date);
            const selected = new Date(dateStr);
            return d.getMonth() === selected.getMonth() && d.getDate() === selected.getDate();
        });

        const details = document.getElementById('dayDetails');
        const detailsTitle = document.getElementById('dayDetailsTitle');
        const detailsContent = document.getElementById('dayDetailsContent');

        if (!details || !detailsContent) return;

        const date = new Date(dateStr);
        if (detailsTitle) {
            detailsTitle.textContent = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        if (events.length === 0 && specialDates.length === 0) {
            detailsContent.innerHTML = `
                <div class="no-events">
                    <span class="no-events-emoji">📅</span>
                    Нет событий на этот день
                    ${this.isAdmin ? '<br><br><span style="cursor:pointer;color:var(--pink-dark)" onclick="app.admin.openEventCreator()">+ Добавить событие</span>' : ''}
                </div>
            `;
        } else {
            let html = '';

            specialDates.forEach(sd => {
                html += `
                    <div class="day-event-item">
                        <div class="dei-emoji">${sd.emoji}</div>
                        <div class="dei-info">
                            <h4>${sd.title}</h4>
                            <p>Особая дата</p>
                        </div>
                        <div class="dei-type holiday">Праздник</div>
                    </div>
                `;
            });

            events.forEach(e => {
                html += `
                    <div class="day-event-item">
                        <div class="dei-emoji">${this.eventTypeEmojis[e.type] || '📌'}</div>
                        <div class="dei-info">
                            <h4>${e.title}</h4>
                            <p>${e.description || ''}${e.time ? ' • ' + e.time : ''}</p>
                        </div>
                        <div class="dei-type ${e.type}">${this.getTypeLabel(e.type)}</div>
                    </div>
                `;
            });

            detailsContent.innerHTML = html;
        }

        details.style.display = 'block';
    }

    getTypeLabel(type) {
        const labels = {
            date: 'Свидание', holiday: 'Праздник', birthday: 'ДР',
            anniversary: 'Годовщина', surprise: 'Сюрприз', trip: 'Поездка',
            dinner: 'Ужин', other: 'Другое', event: 'Событие', meeting: 'Встреча'
        };
        return labels[type] || 'Событие';
    }

    // ========== СПИСОК СОБЫТИЙ ==========
    renderEventsList() {
        const container = document.getElementById('eventsList');
        if (!container) return;

        const events = this.storage.getEvents().sort((a, b) => new Date(a.date) - new Date(b.date));

        if (events.length === 0) {
            container.innerHTML = '<div class="no-events"><span class="no-events-emoji">📋</span>Нет событий</div>';
            return;
        }

        container.innerHTML = events.map(e => {
            const date = new Date(e.date);
            const now = new Date();
            const daysLeft = Math.ceil((date - now) / 86400000);

            return `
                <div class="event-list-item" onclick="app.calendar.selectDay('${e.date}', ${date.getDate()}); app.switchCalTab('month', document.querySelector('.cal-tab'));">
                    <div class="eli-emoji">${this.eventTypeEmojis[e.type] || '📌'}</div>
                    <div class="eli-info">
                        <h4>${e.title}</h4>
                        <p>${e.description || this.getTypeLabel(e.type)}${e.time ? ' • ' + e.time : ''}</p>
                    </div>
                    <div class="eli-date">
                        ${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                        <span>${daysLeft > 0 ? `через ${daysLeft} дн.` : daysLeft === 0 ? 'Сегодня!' : 'Прошло'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========== ОСОБЫЕ ДАТЫ ==========
    renderSpecialDates() {
        const container = document.getElementById('specialDatesList');
        if (!container) return;

        const specialDates = this.storage.getSpecialDates();

        if (specialDates.length === 0) {
            container.innerHTML = '<div class="no-events"><span class="no-events-emoji">🎉</span>Нет особых дат</div>';
            return;
        }

        container.innerHTML = specialDates.map(sd => {
            const date = new Date(sd.date);
            const now = new Date();

            // Вычислить дни до следующего
            let nextDate = new Date(now.getFullYear(), date.getMonth(), date.getDate());
            if (nextDate < now) {
                nextDate = new Date(now.getFullYear() + 1, date.getMonth(), date.getDate());
            }
            const daysLeft = Math.ceil((nextDate - now) / 86400000);

            return `
                <div class="special-date-card">
                    <div class="sdc-emoji">${sd.emoji}</div>
                    <div class="sdc-title">${sd.title}</div>
                    <div class="sdc-date">${nextDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
                    <div class="sdc-countdown">${daysLeft === 0 ? '🎉 Сегодня!' : `Через ${daysLeft} дн.`}</div>
                </div>
            `;
        }).join('');
    }
}

window.CalendarManager = CalendarManager;