// js/admin.js — Админ-панель v6 (+ рулетка, магазин, плейлист, викторина)

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
        const wishlist = this.storage.get('wishlist') || [];
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
                    <div class="admin-card-title">Комплим.</div>
                </div>
            </div>

            <!-- Настройки контента -->
            <div class="admin-section-label">🎮 Настройки контента</div>
            <div class="admin-cards">
                <div class="admin-card" onclick="app.admin.manageWheel()">
                    <div class="admin-card-icon">🎰</div>
                    <div class="admin-card-title">Рулетка</div>
                </div>
                <div class="admin-card" onclick="app.admin.manageShop()">
                    <div class="admin-card-icon">🛒</div>
                    <div class="admin-card-title">Магазин</div>
                </div>
                <div class="admin-card" onclick="app.admin.managePlaylist()">
                    <div class="admin-card-icon">🎵</div>
                    <div class="admin-card-title">Плейлист</div>
                </div>
                <div class="admin-card" onclick="app.admin.manageQuiz()">
                    <div class="admin-card-icon">🧠</div>
                    <div class="admin-card-title">Викторина</div>
                </div>
            </div>

            <!-- Обзор -->
            <div class="admin-section-label">📊 Обзор</div>
            <div style="padding:0 20px;">
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <span class="analytics-card-value">${stats.daysTogether || 0}</span>
                        <span class="analytics-card-label">дней</span>
                    </div>
                    <div class="analytics-card">
                        <span class="analytics-card-value">${letters.length}</span>
                        <span class="analytics-card-label">писем${unreadLetters > 0 ? ` (${unreadLetters} нов.)` : ''}</span>
                    </div>
                    <div class="analytics-card">
                        <span class="analytics-card-value">${gifts.length}</span>
                        <span class="analytics-card-label">подарков${unopenedGifts > 0 ? ` (${unopenedGifts} не откр.)` : ''}</span>
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
                        <h4>Аватар</h4>
                        <p>${profile.avatarUrl ? 'Фото' : profile.avatarEmoji || 'По умолчанию'}</p>
                    </div>
                </div>
                <div class="admin-list-item" style="margin-top:8px" onclick="app.admin.editTheme()">
                    <div class="ali-emoji">🎨</div>
                    <div class="ali-info">
                        <h4>Тема: ${profile.theme || 'pink'}</h4>
                        <p>Нажмите для смены</p>
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
                                <h4>${o.itemName || o.itemId}</h4>
                                <p>${o.price} ⭐ • ${new Date(o.date).toLocaleDateString('ru-RU')}</p>
                            </div>
                            <button class="ali-delete" style="background:#4CAF50;color:white" onclick="app.admin.completeOrder('${o.id}')">✅</button>
                            <button class="ali-delete" onclick="app.admin.rejectOrder('${o.id}')">❌</button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Вишлист -->
            ${wishlist.length > 0 ? `
                <div class="admin-section-label">🎁 Вишлист (${wishlist.filter(w=>!w.completed).length} активных)</div>
                <div class="admin-events-list">
                    ${wishlist.slice(0, 8).map(w => `
                        <div class="admin-list-item">
                            <div class="ali-emoji">${w.completed ? '✅' : '🎁'}</div>
                            <div class="ali-info">
                                <h4>${w.name}</h4>
                                <p>${w.priority === 'high' ? '🔥' : w.priority === 'low' ? '💚' : '⭐'} ${w.price || ''} ${w.link ? '🔗' : ''}</p>
                            </div>
                            <button class="ali-delete" onclick="app.admin.toggleWishComplete('${w.id}')">${w.completed ? '↩️' : '✅'}</button>
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
                    <div class="ali-info"><h4>Экспорт данных</h4><p>Скопировать JSON</p></div>
                </div>
                <div class="admin-list-item" style="margin-top:8px;cursor:pointer" onclick="app.admin.importData()">
                    <div class="ali-emoji">📥</div>
                    <div class="ali-info"><h4>Импорт данных</h4><p>Загрузить из JSON</p></div>
                </div>
                <div class="admin-list-item" style="margin-top:8px;cursor:pointer" onclick="app.admin.resetData()">
                    <div class="ali-emoji">🗑️</div>
                    <div class="ali-info"><h4>Сбросить всё</h4><p>Удалить все данные</p></div>
                </div>
                <div class="admin-list-item" style="margin-top:8px;cursor:pointer" onclick="app.admin.forceSync()">
                    <div class="ali-emoji">🔄</div>
                    <div class="ali-info"><h4>Синхронизация</h4><p>Принудительная с сервером</p></div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // НАСТРОЙКИ РУЛЕТКИ
    // ============================================================
    manageWheel() {
        document.getElementById('wheelAdminOverlay')?.remove();
        const prizes = this.storage.get('wheelPrizes') || [];

        const html = `
            <div class="admin-modal-overlay active" id="wheelAdminOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('wheelAdminOverlay').remove()">✕</button>
                        <h2>🎰 Настройка рулетки</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field"><label>Эмодзи</label>
                            <input class="admin-input" id="wpEmoji" placeholder="⭐" value="⭐"></div>
                        <div class="admin-field"><label>Название приза</label>
                            <input class="admin-input" id="wpName" placeholder="+10 звёзд"></div>
                        <div class="admin-field"><label>Тип</label>
                            <select class="admin-select" id="wpType">
                                <option value="stars">⭐ Звёзды</option>
                                <option value="gift">🎁 Подарок</option>
                                <option value="letter">💌 Письмо</option>
                            </select></div>
                        <div class="admin-field"><label>Значение (кол-во звёзд / ID подарка)</label>
                            <input class="admin-input" id="wpValue" placeholder="10"></div>
                        <button class="admin-submit-btn" onclick="app.admin.addWheelPrize()" style="margin-bottom:16px">+ Добавить приз</button>

                        <div class="admin-section-label" style="padding:0;margin-bottom:8px">Призы (${prizes.length})</div>
                        ${prizes.length > 0 ? prizes.map((p, i) => `
                            <div class="admin-list-item" style="margin-bottom:4px">
                                <div class="ali-emoji">${p.emoji}</div>
                                <div class="ali-info">
                                    <h4>${p.name}</h4>
                                    <p>${p.type}${p.value !== null && p.value !== undefined ? ' = ' + p.value : ''}</p>
                                </div>
                                <button class="ali-delete" onclick="app.admin.removeWheelPrize(${i})">🗑️</button>
                            </div>
                        `).join('') : '<div class="admin-empty"><span>🎰</span>Нет призов</div>'}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    addWheelPrize() {
        const emoji = document.getElementById('wpEmoji')?.value?.trim() || '⭐';
        const name = document.getElementById('wpName')?.value?.trim();
        const type = document.getElementById('wpType')?.value || 'stars';
        const rawVal = document.getElementById('wpValue')?.value?.trim();
        if (!name) { window.app?.showToast('Введите название!'); return; }

        const value = type === 'stars' ? (parseInt(rawVal) || 5) : (rawVal || null);
        const prizes = this.storage.get('wheelPrizes') || [];
        prizes.push({ emoji, name, type, value });
        this.storage.set('wheelPrizes', prizes);
        this._saveAdmin('wheel', prizes);
        document.getElementById('wheelAdminOverlay')?.remove();
        this.manageWheel();
        window.app?.showToast('Приз добавлен! 🎰');
    }

    removeWheelPrize(i) {
        const prizes = this.storage.get('wheelPrizes') || [];
        prizes.splice(i, 1);
        this.storage.set('wheelPrizes', prizes);
        this._saveAdmin('wheel', prizes);
        document.getElementById('wheelAdminOverlay')?.remove();
        this.manageWheel();
    }

    // ============================================================
    // НАСТРОЙКИ МАГАЗИНА
    // ============================================================
    manageShop() {
        document.getElementById('shopAdminOverlay')?.remove();
        const items = this.storage.get('shopItems') || [];

        const html = `
            <div class="admin-modal-overlay active" id="shopAdminOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('shopAdminOverlay').remove()">✕</button>
                        <h2>🛒 Настройка магазина</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field"><label>Эмодзи</label>
                            <input class="admin-input" id="siEmoji" placeholder="🌹" value="🎁"></div>
                        <div class="admin-field"><label>Название</label>
                            <input class="admin-input" id="siName" placeholder="Букет роз"></div>
                        <div class="admin-field"><label>Описание</label>
                            <input class="admin-input" id="siDesc" placeholder="Описание товара"></div>
                        <div class="admin-field"><label>Цена (⭐)</label>
                            <input type="number" class="admin-input" id="siPrice" placeholder="50" min="1"></div>
                        <div class="admin-field"><label>URL фото</label>
                            <input class="admin-input" id="siImage" placeholder="https://..."></div>
                        <button class="admin-submit-btn" onclick="app.admin.addShopItem()" style="margin-bottom:16px">+ Добавить товар</button>

                        <div class="admin-section-label" style="padding:0;margin-bottom:8px">Товары (${items.length})</div>
                        ${items.length > 0 ? items.map((it, i) => `
                            <div class="admin-list-item" style="margin-bottom:4px">
                                <div class="ali-emoji">${it.emoji}</div>
                                <div class="ali-info">
                                    <h4>${it.name} — ${it.price} ⭐</h4>
                                    <p>${it.desc || ''}${it.imageUrl ? ' 📷' : ''}</p>
                                </div>
                                <button class="ali-delete" style="background:var(--lavender)" onclick="app.admin.editShopItem(${i})">✏️</button>
                                <button class="ali-delete" onclick="app.admin.removeShopItem(${i})">🗑️</button>
                            </div>
                        `).join('') : '<div class="admin-empty"><span>🛒</span>Пусто</div>'}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    addShopItem() {
        const name = document.getElementById('siName')?.value?.trim();
        if (!name) { window.app?.showToast('Введите название!'); return; }
        const items = this.storage.get('shopItems') || [];
        items.push({
            id: 'shop_' + Date.now(),
            name,
            emoji: document.getElementById('siEmoji')?.value?.trim() || '🎁',
            desc: document.getElementById('siDesc')?.value?.trim() || '',
            price: parseInt(document.getElementById('siPrice')?.value) || 10,
            imageUrl: document.getElementById('siImage')?.value?.trim() || null
        });
        this.storage.set('shopItems', items);
        this._saveAdmin('shop', items);
        document.getElementById('shopAdminOverlay')?.remove();
        this.manageShop();
        window.app?.showToast('Товар добавлен! 🛒');
    }

    editShopItem(index) {
        const items = this.storage.get('shopItems') || [];
        const it = items[index];
        if (!it) return;
        document.getElementById('shopAdminOverlay')?.remove();

        const html = `
            <div class="admin-modal-overlay active" id="shopEditOverlay">
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('shopEditOverlay').remove(); app.admin.manageShop();">✕</button>
                        <h2>✏️ Редактировать</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field"><label>Эмодзи</label>
                            <input class="admin-input" id="seEmoji" value="${it.emoji || ''}"></div>
                        <div class="admin-field"><label>Название</label>
                            <input class="admin-input" id="seName" value="${it.name || ''}"></div>
                        <div class="admin-field"><label>Описание</label>
                            <input class="admin-input" id="seDesc" value="${it.desc || ''}"></div>
                        <div class="admin-field"><label>Цена (⭐)</label>
                            <input type="number" class="admin-input" id="sePrice" value="${it.price || 10}" min="1"></div>
                        <div class="admin-field"><label>URL фото</label>
                            <input class="admin-input" id="seImage" value="${it.imageUrl || ''}" placeholder="https://..."></div>
                        <button class="admin-submit-btn" onclick="app.admin.saveShopItem(${index})">💾 Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    saveShopItem(index) {
        const items = this.storage.get('shopItems') || [];
        if (!items[index]) return;
        items[index].emoji = document.getElementById('seEmoji')?.value?.trim() || '🎁';
        items[index].name = document.getElementById('seName')?.value?.trim() || items[index].name;
        items[index].desc = document.getElementById('seDesc')?.value?.trim() || '';
        items[index].price = parseInt(document.getElementById('sePrice')?.value) || 10;
        items[index].imageUrl = document.getElementById('seImage')?.value?.trim() || null;
        this.storage.set('shopItems', items);
        this._saveAdmin('shop', items);
        document.getElementById('shopEditOverlay')?.remove();
        this.manageShop();
        window.app?.showToast('Сохранено! ✅');
    }

    removeShopItem(i) {
        const items = this.storage.get('shopItems') || [];
        items.splice(i, 1);
        this.storage.set('shopItems', items);
        this._saveAdmin('shop', items);
        document.getElementById('shopAdminOverlay')?.remove();
        this.manageShop();
    }

    // ============================================================
    // НАСТРОЙКИ ПЛЕЙЛИСТА
    // ============================================================
    managePlaylist() {
        document.getElementById('playlistAdminOverlay')?.remove();
        const songs = this.storage.get('playlist') || [];

        const html = `
            <div class="admin-modal-overlay active" id="playlistAdminOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('playlistAdminOverlay').remove()">✕</button>
                        <h2>🎵 Настройка плейлиста</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field"><label>Название</label>
                            <input class="admin-input" id="plTitle" placeholder="Perfect"></div>
                        <div class="admin-field"><label>Исполнитель</label>
                            <input class="admin-input" id="plArtist" placeholder="Ed Sheeran"></div>
                        <div class="admin-field"><label>Ссылка (YouTube, Spotify...)</label>
                            <input class="admin-input" id="plUrl" placeholder="https://..."></div>
                        <div class="admin-field"><label>Эмодзи</label>
                            <input class="admin-input" id="plEmoji" placeholder="🎵" value="🎵"></div>
                        <button class="admin-submit-btn" onclick="app.admin.addPlaylistSong()" style="margin-bottom:16px">+ Добавить</button>

                        <div class="admin-section-label" style="padding:0;margin-bottom:8px">Песни (${songs.length})</div>
                        ${songs.length > 0 ? songs.map((s, i) => `
                            <div class="admin-list-item" style="margin-bottom:4px">
                                <div class="ali-emoji">${s.emoji || '🎵'}</div>
                                <div class="ali-info">
                                    <h4>${s.title}</h4>
                                    <p>${s.artist}${s.url ? ' 🔗' : ''}</p>
                                </div>
                                <button class="ali-delete" onclick="app.admin.removePlaylistSong(${i})">🗑️</button>
                            </div>
                        `).join('') : '<div class="admin-empty"><span>🎵</span>Пусто</div>'}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    addPlaylistSong() {
        const title = document.getElementById('plTitle')?.value?.trim();
        const artist = document.getElementById('plArtist')?.value?.trim();
        if (!title || !artist) { window.app?.showToast('Заполните название и исполнителя!'); return; }
        const songs = this.storage.get('playlist') || [];
        songs.push({
            title, artist,
            emoji: document.getElementById('plEmoji')?.value?.trim() || '🎵',
            url: document.getElementById('plUrl')?.value?.trim() || ''
        });
        this.storage.set('playlist', songs);
        this._saveAdmin('playlist', songs);
        document.getElementById('playlistAdminOverlay')?.remove();
        this.managePlaylist();
        window.app?.showToast('Песня добавлена! 🎵');
    }

    removePlaylistSong(i) {
        const songs = this.storage.get('playlist') || [];
        songs.splice(i, 1);
        this.storage.set('playlist', songs);
        this._saveAdmin('playlist', songs);
        document.getElementById('playlistAdminOverlay')?.remove();
        this.managePlaylist();
    }

    // ============================================================
    // НАСТРОЙКИ ВИКТОРИНЫ
    // ============================================================
    manageQuiz() {
        document.getElementById('quizAdminOverlay')?.remove();
        const questions = this.storage.get('quizQuestions') || [];

        const html = `
            <div class="admin-modal-overlay active" id="quizAdminOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('quizAdminOverlay').remove()">✕</button>
                        <h2>🧠 Настройка викторины</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field"><label>Вопрос</label>
                            <input class="admin-input" id="qzQ" placeholder="Какой наш любимый фильм?"></div>
                        <div class="admin-field"><label>Вариант 1</label>
                            <input class="admin-input" id="qzO1" placeholder="Ответ 1"></div>
                        <div class="admin-field"><label>Вариант 2</label>
                            <input class="admin-input" id="qzO2" placeholder="Ответ 2"></div>
                        <div class="admin-field"><label>Вариант 3</label>
                            <input class="admin-input" id="qzO3" placeholder="Ответ 3"></div>
                        <div class="admin-field"><label>Правильный (1, 2 или 3)</label>
                            <input type="number" class="admin-input" id="qzCorrect" placeholder="1" min="1" max="3"></div>
                        <div class="admin-field"><label>Награда ⭐</label>
                            <input type="number" class="admin-input" id="qzReward" value="5" min="1"></div>
                        <button class="admin-submit-btn" onclick="app.admin.addQuizQuestion()" style="margin-bottom:16px">+ Добавить вопрос</button>

                        <div class="admin-section-label" style="padding:0;margin-bottom:8px">Вопросы (${questions.length})</div>
                        ${questions.length > 0 ? questions.map((q, i) => `
                            <div class="admin-list-item" style="margin-bottom:4px">
                                <div class="ali-emoji">❓</div>
                                <div class="ali-info">
                                    <h4>${q.q}</h4>
                                    <p>${q.options.join(' | ')} → ✅ ${q.options[q.correct]} (${q.reward}⭐)</p>
                                </div>
                                <button class="ali-delete" onclick="app.admin.removeQuizQuestion(${i})">🗑️</button>
                            </div>
                        `).join('') : '<div class="admin-empty"><span>🧠</span>Нет вопросов</div>'}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    addQuizQuestion() {
        const q = document.getElementById('qzQ')?.value?.trim();
        const o1 = document.getElementById('qzO1')?.value?.trim();
        const o2 = document.getElementById('qzO2')?.value?.trim();
        const o3 = document.getElementById('qzO3')?.value?.trim();
        const correct = parseInt(document.getElementById('qzCorrect')?.value) - 1;
        const reward = parseInt(document.getElementById('qzReward')?.value) || 5;

        if (!q || !o1 || !o2 || !o3) { window.app?.showToast('Заполните все поля!'); return; }
        if (correct < 0 || correct > 2) { window.app?.showToast('Правильный: 1, 2 или 3!'); return; }

        const questions = this.storage.get('quizQuestions') || [];
        questions.push({ q, options: [o1, o2, o3], correct, reward });
        this.storage.set('quizQuestions', questions);
        this._saveAdmin('quiz', questions);
        document.getElementById('quizAdminOverlay')?.remove();
        this.manageQuiz();
        window.app?.showToast('Вопрос добавлен! 🧠');
    }

    removeQuizQuestion(i) {
        const questions = this.storage.get('quizQuestions') || [];
        questions.splice(i, 1);
        this.storage.set('quizQuestions', questions);
        this._saveAdmin('quiz', questions);
        document.getElementById('quizAdminOverlay')?.remove();
        this.manageQuiz();
    }

    // ============================================================
    // ОБЩИЙ МЕТОД СОХРАНЕНИЯ НА СЕРВЕР
    // ============================================================
    async _saveAdmin(type, data) {
        try {
            await fetch(`/api/admin/${type}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error(`Save admin/${type} failed:`, e);
        }
    }

    // ============================================================
    // ПРОФИЛЬ
    // ============================================================
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
                        <div class="admin-field"><label>Приветствие</label>
                            <input class="admin-input" id="editGreeting" value="${profile.greeting || ''}" placeholder="Каждый день — праздник 🌸"></div>
                        <div class="admin-field"><label>Заголовок главной</label>
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

    editUserAvatar() { window.app?.profile?.changeAvatar(); }
    editTheme() { window.app?.profile?.openSettings(); }

    // ============================================================
    // БАЛАНС
    // ============================================================
    editBalance() {
        document.getElementById('balanceOverlay')?.remove();
        const p = this.storage.getProfile();
        const html = `<div class="admin-modal-overlay active" id="balanceOverlay">
            <div class="admin-modal small"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('balanceOverlay').remove()">✕</button>
                <h2>⭐ Баланс</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><label>Звёзды админа</label>
                    <input type="number" class="admin-input" id="balAdm" value="${p.adminStars ?? 0}" min="0"></div>
                <div class="admin-field"><label>Звёзды юзера</label>
                    <input type="number" class="admin-input" id="balUsr" value="${p.userStars ?? 0}" min="0"></div>
                <button class="admin-submit-btn" onclick="app.admin.saveBalance()">💰 Сохранить</button>
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    saveBalance() {
        this.storage.updateProfile({
            adminStars: Math.max(0, parseInt(document.getElementById('balAdm')?.value) || 0),
            userStars: Math.max(0, parseInt(document.getElementById('balUsr')?.value) || 0),
        });
        document.getElementById('balanceOverlay')?.remove();
        window.app?.showToast('Баланс обновлён! ⭐');
        this.renderFullAdmin();
        if (window.app?.currentPage === 'gifts') window.app.renderGiftsContent();
    }

    // ============================================================
    // ДАТА ОТНОШЕНИЙ
    // ============================================================
    editCoupleDate() {
        document.getElementById('coupleDateOverlay')?.remove();
        const p = this.storage.getProfile();
        const html = `<div class="admin-modal-overlay active" id="coupleDateOverlay">
            <div class="admin-modal small"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('coupleDateOverlay').remove()">✕</button>
                <h2>📅 Дата отношений</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><label>Когда начали встречаться?</label>
                    <input type="date" class="admin-input" id="cdInput" value="${p.coupleDateRaw || ''}"></div>
                <button class="admin-submit-btn" onclick="app.admin.saveCoupleDate()">💕 Сохранить</button>
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    saveCoupleDate() {
        const date = document.getElementById('cdInput')?.value;
        if (!date) return;
        const fmt = new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const days = Math.floor((new Date() - new Date(date)) / 86400000);
        this.storage.updateProfile({ coupleDate: fmt, coupleDateRaw: date });
        this.storage.updateStats({ daysTogether: Math.max(0, days) });
        document.getElementById('coupleDateOverlay')?.remove();
        window.app?.showToast(`${days} дней вместе! 💕`);
        this.renderFullAdmin();
    }

    // ============================================================
    // СОБЫТИЯ
    // ============================================================
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
                            <input class="admin-input" id="adminEventTitle" value="${isEdit ? editEvent.title : ''}" placeholder="Ужин..."></div>
                        <div class="admin-field"><label>Дата</label>
                            <input type="date" class="admin-input" id="adminEventDate" value="${isEdit ? editEvent.date : ''}"></div>
                        <div class="admin-field"><label>Время</label>
                            <input type="time" class="admin-input" id="adminEventTime" value="${isEdit ? (editEvent.time || '') : ''}"></div>
                        <div class="admin-field"><label>Описание</label>
                            <textarea class="admin-textarea" id="adminEventDesc" rows="2">${isEdit ? (editEvent.description || '') : ''}</textarea></div>
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

    editExistingEvent(id) {
        const ev = this.storage.getEvent(id);
        if (ev) this.openEventCreator(ev);
    }

    renderEventTypes(sel) {
        return [
            { id: 'date', e: '💑', l: 'Свидание' }, { id: 'holiday', e: '🎉', l: 'Праздник' },
            { id: 'birthday', e: '🎂', l: 'ДР' }, { id: 'anniversary', e: '💍', l: 'Годовщ.' },
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
            id: editId || 'event_' + Date.now(), title, date,
            time: document.getElementById('adminEventTime')?.value || null,
            description: document.getElementById('adminEventDesc')?.value?.trim() || '',
            type: this._selectedEventType || 'other'
        };
        if (editId) this.storage.updateEvent(ev);
        else this.storage.addEvent(ev);
        document.getElementById('eventCreatorOverlay')?.remove();
        window.app?.showToast('Сохранено! 🎉');
        window.app?.effects?.launchConfetti?.(30);
        if (window.app?.currentPage === 'admin') this.renderFullAdmin();
        if (window.app?.currentPage === 'calendar') window.app.calendar?.renderCalendar();
        if (window.app?.currentPage === 'home') window.app.updateUpcomingEvents();
    }

    // ============================================================
    // ОСОБЫЕ ДАТЫ
    // ============================================================
    manageSpecialDates() {
        document.getElementById('specialDatesOverlay')?.remove();
        const dates = this.storage.getSpecialDates();
        const html = `<div class="admin-modal-overlay active" id="specialDatesOverlay">
            <div class="admin-modal large"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('specialDatesOverlay').remove()">✕</button>
                <h2>🎉 Особые даты</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><label>Дата</label>
                    <input type="date" class="admin-input" id="sdDate"></div>
                <div class="admin-field"><label>Название</label>
                    <input class="admin-input" id="sdTitle" placeholder="ДР..."></div>
                <div class="admin-field-row">
                    <select class="admin-select" id="sdEmoji">
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
        const date = document.getElementById('sdDate')?.value;
        const title = document.getElementById('sdTitle')?.value?.trim();
        if (!date || !title) { window.app?.showToast('Заполните дату и название!'); return; }
        this.storage.addSpecialDate({ id: 'sd_' + Date.now(), date, title, emoji: document.getElementById('sdEmoji')?.value || '⭐' });
        document.getElementById('specialDatesOverlay')?.remove();
        this.manageSpecialDates();
        window.app?.showToast('Добавлено! 🎉');
        if (window.app?.currentPage === 'admin') this.renderFullAdmin();
    }

    removeSpecialDate(id) {
        window.app?.showConfirmModal('Удалить дату?', () => {
            this.storage.removeSpecialDate(id);
            document.getElementById('specialDatesOverlay')?.remove();
            this.manageSpecialDates();
            if (window.app?.currentPage === 'admin') this.renderFullAdmin();
        });
    }

    deleteSpecialDate(id) { this.removeSpecialDate(id); }

    // ============================================================
    // ЗАКАЗЫ
    // ============================================================
    completeOrder(id) {
        this.storage.updateOrderStatus(id, 'completed');
        window.app?.showToast('Выполнен! ✅');
        this.renderFullAdmin();
    }

    rejectOrder(id) {
        window.app?.showConfirmModal('Отклонить? Звёзды вернутся.', () => {
            const order = this.storage.getOrders().find(o => o.id === id);
            if (order) {
                const p = this.storage.getProfile();
                this.storage.updateProfile({ userStars: (p.userStars || 0) + order.price });
            }
            this.storage.updateOrderStatus(id, 'rejected');
            window.app?.showToast('Отклонён, звёзды возвращены');
            this.renderFullAdmin();
        });
    }

    // ============================================================
    // ВИШЛИСТ (из админки)
    // ============================================================
    toggleWishComplete(id) {
        const list = this.storage.get('wishlist') || [];
        const item = list.find(w => w.id === id);
        if (item) {
            this.storage.updateWishlistItem(id, { completed: !item.completed });
            if (!item.completed) window.app?.effects?.launchConfetti?.(20);
            this.renderFullAdmin();
        }
    }

    // ============================================================
    // КОМПЛИМЕНТЫ
    // ============================================================
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
                <div class="admin-section-label" style="padding:0;margin-bottom:8px">Свои (${custom.length})</div>
                ${custom.map((c, i) => `
                    <div class="admin-list-item" style="margin-bottom:4px">
                        <div class="ali-emoji">✨</div>
                        <div class="ali-info"><h4>${c}</h4></div>
                        <button class="ali-delete" onclick="app.admin.removeCompliment(${i})">🗑️</button>
                    </div>
                `).join('') || '<div class="admin-empty"><span>✨</span>Пусто</div>'}
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    addCompliment() {
        const text = document.getElementById('newCompliment')?.value?.trim();
        if (!text) { window.app?.showToast('Введите комплимент!'); return; }
        const custom = this.storage.get('customCompliments') || [];
        custom.push(text);
        this.storage.set('customCompliments', custom);
        this._saveAdmin('compliments', custom);
        if (window.app?.compliments) window.app.compliments.push(text);
        document.getElementById('complimentsOverlay')?.remove();
        this.manageCompliments();
        window.app?.showToast('Добавлен! ✨');
    }

    removeCompliment(i) {
        const custom = this.storage.get('customCompliments') || [];
        custom.splice(i, 1);
        this.storage.set('customCompliments', custom);
        this._saveAdmin('compliments', custom);
        document.getElementById('complimentsOverlay')?.remove();
        this.manageCompliments();
    }

    // ============================================================
    // УДАЛЕНИЕ
    // ============================================================
    deleteAlbum(id) {
        window.app?.showConfirmModal('Удалить альбом и фото?', () => {
            this.storage.deleteAlbum(id);
            window.app?.showToast('Удалён');
            this.renderFullAdmin();
            if (window.app?.currentPage === 'gallery') window.app.renderGalleryContent();
        });
    }

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

    // ============================================================
    // ЭКСПОРТ / ИМПОРТ
    // ============================================================
    exportData() {
        try {
            const text = JSON.stringify(this.storage.exportAll(), null, 2);
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => window.app?.showToast('Скопировано! 📋'));
            } else { this.showTextModal('📤 Экспорт', text); }
        } catch (e) { window.app?.showToast('Ошибка!'); }
    }

    importData() {
        document.getElementById('importOverlay')?.remove();
        const html = `<div class="admin-modal-overlay active" id="importOverlay">
            <div class="admin-modal"><div class="admin-modal-header">
                <button class="admin-modal-close" onclick="document.getElementById('importOverlay').remove()">✕</button>
                <h2>📥 Импорт</h2></div>
            <div class="admin-modal-body">
                <div class="admin-field"><label>Вставьте JSON</label>
                    <textarea class="admin-textarea" id="importText" rows="6"></textarea></div>
                <button class="admin-submit-btn" onclick="app.admin.doImport()">📥 Импорт</button>
            </div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    doImport() {
        try {
            const data = JSON.parse(document.getElementById('importText')?.value?.trim());
            Object.keys(data).forEach(key => this.storage.set(key, data[key]));
            document.getElementById('importOverlay')?.remove();
            window.app?.showToast('Импортировано! ✅');
            setTimeout(() => location.reload(), 1000);
        } catch (e) { window.app?.showToast('Неверный JSON!'); }
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
        window.app?.showConfirmModal('⚠️ Удалить ВСЕ данные?', () => {
            this.storage.clearAll();
            window.app?.showToast('Сброшено!');
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