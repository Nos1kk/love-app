// js/wishlist.js — Вишлист (полная страница)

class WishlistManager {
    constructor(storage) {
        this.storage = storage;
        this._selectedPriority = 'medium';
    }

    renderWishlistPage() {
        const container = document.getElementById('wishlistContent');
        if (!container) return;

        const items = this.storage.getWishlist();
        const isGuest = window.app?.isGuest;

        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const sorted = [...items].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
        });

        const activeCount = items.filter(i => !i.completed).length;
        const doneCount = items.filter(i => i.completed).length;

        container.innerHTML = `
            <div style="padding:16px 20px;">
                <div style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;">
                    <div style="text-align:center;">
                        <div style="font-size:28px;font-weight:700;color:var(--pink-dark)">${activeCount}</div>
                        <div style="font-size:10px;color:var(--text-light);text-transform:uppercase;">Желаний</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:28px;font-weight:700;color:var(--pink-dark)">${doneCount}</div>
                        <div style="font-size:10px;color:var(--text-light);text-transform:uppercase;">Исполнено</div>
                    </div>
                </div>

                ${!isGuest ? `
                <div class="wishlist-add-quick" onclick="app.wishlistManager.openAddForm()">
                    <span>+ Добавить желание</span>
                </div>` : ''}

                <div style="display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;">
                    <button class="wishlist-filter-btn active" onclick="app.wishlistManager.filterItems('all', this)">Все</button>
                    <button class="wishlist-filter-btn" onclick="app.wishlistManager.filterItems('active', this)">Активные</button>
                    <button class="wishlist-filter-btn" onclick="app.wishlistManager.filterItems('done', this)">Исполненные</button>
                </div>

                <div class="wishlist-items" id="wishlistItems">
                    ${sorted.length === 0
                        ? `<div style="text-align:center;padding:40px 20px;color:var(--text-light);">
                            <span style="font-size:48px;display:block;margin-bottom:12px;">🎁</span>
                            <p>Вишлист пуст</p>
                            <p style="font-size:12px;margin-top:4px;">Добавьте первое желание!</p>
                           </div>`
                        : sorted.map(item => this.renderWishItem(item, isGuest)).join('')}
                </div>
            </div>
        `;
    }

    renderWishItem(item, isGuest) {
        const priorityColors = { high: '#ff6b8a', medium: '#ffb366', low: '#66d4aa' };
        const priorityLabels = { high: '🔥 Очень хочу', medium: '⭐ Хочу', low: '💚 Было бы неплохо' };
        const pColor = priorityColors[item.priority] || priorityColors.medium;
        const pLabel = priorityLabels[item.priority] || priorityLabels.medium;
        const date = new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

        return `
            <div class="wishlist-card ${item.completed ? 'completed' : ''}" 
                 data-priority="${item.priority || 'medium'}" 
                 data-completed="${item.completed ? '1' : '0'}"
                 style="border-left:4px solid ${pColor}">
                ${item.imageUrl ? `<img src="${item.imageUrl}" class="wishlist-img" alt="" onerror="this.style.display='none'">` : ''}
                <div class="wishlist-info">
                    <h4 class="${item.completed ? 'line-through' : ''}">${item.name}</h4>
                    ${item.description ? `<p class="wishlist-desc">${item.description}</p>` : ''}
                    <div class="wishlist-meta">
                        <span class="wishlist-priority" style="background:${pColor}20;color:${pColor}">${pLabel}</span>
                        ${item.price ? `<span style="font-size:10px;font-weight:700;color:var(--gold, #f5a623)">💰 ${item.price}</span>` : ''}
                        ${item.link ? `<a href="${item.link}" target="_blank" class="wishlist-link" onclick="event.stopPropagation()">🔗 Ссылка</a>` : ''}
                        <span style="font-size:9px;color:var(--text-light)">📅 ${date}</span>
                    </div>
                </div>
                ${!isGuest ? `
                <div class="wishlist-actions">
                    <button class="wishlist-action-btn" onclick="event.stopPropagation(); app.wishlistManager.toggleComplete('${item.id}')">${item.completed ? '↩️' : '✅'}</button>
                    <button class="wishlist-action-btn" onclick="event.stopPropagation(); app.wishlistManager.openEditForm('${item.id}')">✏️</button>
                    <button class="wishlist-action-btn" onclick="event.stopPropagation(); app.wishlistManager.deleteItem('${item.id}')">🗑️</button>
                </div>` : ''}
            </div>
        `;
    }

    filterItems(filter, btn) {
        document.querySelectorAll('.wishlist-filter-btn').forEach(b => b.classList.remove('active'));
        btn?.classList.add('active');

        document.querySelectorAll('#wishlistItems .wishlist-card').forEach(card => {
            const isCompleted = card.dataset.completed === '1';
            if (filter === 'all') card.style.display = '';
            else if (filter === 'active') card.style.display = isCompleted ? 'none' : '';
            else if (filter === 'done') card.style.display = isCompleted ? '' : 'none';
        });
    }

    openAddForm(editItem = null) {
        if (window.app?.isGuest) {
            window.app?.showToast('Гости не могут добавлять 🔒');
            return;
        }

        document.getElementById('wishlistFormOverlay')?.remove();
        const isEdit = !!editItem;

        const html = `
            <div class="admin-modal-overlay active" id="wishlistFormOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('wishlistFormOverlay').remove()">✕</button>
                        <h2>${isEdit ? '✏️ Редактировать' : '🎁 Новое желание'}</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>Название *</label>
                            <input class="admin-input" id="wishName" value="${isEdit ? (editItem.name || '') : ''}" placeholder="iPhone, кроссовки...">
                        </div>
                        <div class="admin-field">
                            <label>Описание</label>
                            <textarea class="admin-textarea" id="wishDesc" rows="2" placeholder="Цвет, размер, модель...">${isEdit ? (editItem.description || '') : ''}</textarea>
                        </div>
                        <div class="admin-field">
                            <label>Цена</label>
                            <input class="admin-input" id="wishPrice" value="${isEdit ? (editItem.price || '') : ''}" placeholder="50 000 ₽">
                        </div>
                        <div class="admin-field">
                            <label>Ссылка на товар</label>
                            <input class="admin-input" id="wishLink" value="${isEdit ? (editItem.link || editItem.url || '') : ''}" placeholder="https://...">
                        </div>
                        <div class="admin-field">
                            <label>Фото (URL или загрузка)</label>
                            <input class="admin-input" id="wishImage" value="${isEdit ? (editItem.imageUrl || '') : ''}" placeholder="https://...">
                        </div>
                        <div class="admin-field">
                            <input type="file" accept="image/*" class="admin-input" onchange="app.wishlistManager.handleImageUpload(this)">
                        </div>
                        <div id="wishImagePreview" style="display:${isEdit && editItem.imageUrl ? 'block' : 'none'};text-align:center;margin-bottom:12px;">
                            <img id="wishImagePreviewImg" src="${isEdit ? (editItem.imageUrl || '') : ''}" style="max-width:200px;max-height:120px;border-radius:12px;object-fit:cover;">
                        </div>
                        <div class="admin-field">
                            <label>Приоритет</label>
                            <div class="event-type-grid" style="grid-template-columns:repeat(3,1fr)">
                                <button class="event-type-btn ${(!isEdit || editItem.priority === 'low') && !(!isEdit) ? '' : ''}${isEdit && editItem.priority === 'low' ? ' active' : ''}" onclick="app.wishlistManager.selectPriority('low', this)"><span>💚</span><span>Неплохо</span></button>
                                <button class="event-type-btn ${!isEdit || editItem.priority === 'medium' ? ' active' : ''}" onclick="app.wishlistManager.selectPriority('medium', this)"><span>⭐</span><span>Хочу</span></button>
                                <button class="event-type-btn ${isEdit && editItem.priority === 'high' ? ' active' : ''}" onclick="app.wishlistManager.selectPriority('high', this)"><span>🔥</span><span>Очень!</span></button>
                            </div>
                        </div>
                        <button class="admin-submit-btn" onclick="app.wishlistManager.saveItem(${isEdit ? `'${editItem.id}'` : 'null'})">
                            ${isEdit ? '💾 Сохранить' : '🎁 Добавить'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this._selectedPriority = isEdit ? (editItem.priority || 'medium') : 'medium';
    }

    openEditForm(itemId) {
        const items = this.storage.get('wishlist') || [];
        const item = items.find(i => i.id === itemId);
        if (item) this.openAddForm(item);
    }

    selectPriority(priority, btn) {
        document.querySelectorAll('#wishlistFormOverlay .event-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._selectedPriority = priority;
    }

    handleImageUpload(input) {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            window.app?.showToast('Макс. 3MB!');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('wishImage').value = e.target.result;
            const preview = document.getElementById('wishImagePreview');
            const previewImg = document.getElementById('wishImagePreviewImg');
            if (preview && previewImg) {
                previewImg.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    saveItem(editId) {
        const name = document.getElementById('wishName')?.value?.trim();
        if (!name) { window.app?.showToast('Введите название!'); return; }

        const item = {
            id: editId || 'wish_' + Date.now(),
            name,
            description: document.getElementById('wishDesc')?.value?.trim() || '',
            price: document.getElementById('wishPrice')?.value?.trim() || '',
            link: document.getElementById('wishLink')?.value?.trim() || '',
            url: document.getElementById('wishLink')?.value?.trim() || '',
            imageUrl: document.getElementById('wishImage')?.value?.trim() || '',
            priority: this._selectedPriority || 'medium',
            completed: false,
            addedBy: window.app?.role || 'user',
            date: new Date().toISOString()
        };

        if (editId) {
            const items = this.storage.get('wishlist') || [];
            const idx = items.findIndex(i => i.id === editId);
            if (idx >= 0) {
                item.completed = items[idx].completed;
                item.date = items[idx].date;
            }
            this.storage.updateWishlistItem(editId, item);
        } else {
            this.storage.addWishlistItem(item);
        }

        document.getElementById('wishlistFormOverlay')?.remove();
        window.app?.showToast(editId ? 'Обновлено! ✨' : 'Желание добавлено! 🎁');
        window.app?.effects?.launchHeartBurst?.(window.innerWidth / 2, window.innerHeight / 2);
        this.renderWishlistPage();
    }

    toggleComplete(itemId) {
        const items = this.storage.get('wishlist') || [];
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        this.storage.updateWishlistItem(itemId, { completed: !item.completed });

        if (!item.completed) {
            window.app?.showToast('Желание исполнено! 🎉');
            window.app?.effects?.launchConfetti?.(40);
        } else {
            window.app?.showToast('Возвращено в список');
        }

        this.renderWishlistPage();
    }

    deleteItem(itemId) {
        window.app?.showConfirmModal('Удалить из вишлиста?', () => {
            this.storage.deleteWishlistItem(itemId);
            window.app?.showToast('Удалено');
            this.renderWishlistPage();
        });
    }
}

window.WishlistManager = WishlistManager;