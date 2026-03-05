// js/photos.js — Менеджер фотоальбомов

class PhotosManager {
    constructor(storage, isAdmin = false) {
        this.storage = storage;
        this.isAdmin = isAdmin;
    }

    // ========== СОЗДАНИЕ АЛЬБОМА ==========
    createAlbum() {
        document.getElementById('createAlbumOverlay')?.remove();

        const emojis = ['📸', '💑', '✈️', '🌅', '🎂', '🎉', '🏖️', '🌸', '🎄', '🌙', '🎵', '💕'];

        const html = `
            <div class="admin-modal-overlay active" id="createAlbumOverlay">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('createAlbumOverlay').remove()">✕</button>
                        <h2>📸 Новый альбом</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>Название</label>
                            <input type="text" class="admin-input" id="albumNameInput" placeholder="Наши моменты..." maxlength="30">
                        </div>
                        <div class="admin-field">
                            <label>Обложка</label>
                            <div class="emoji-grid-avatar">
                                ${emojis.map((e, i) => `
                                    <button class="emoji-avatar-btn ${i === 0 ? 'active' : ''}" 
                                            onclick="app.photos.selectAlbumEmoji('${e}', this)">${e}</button>
                                `).join('')}
                            </div>
                        </div>
                        <button class="admin-submit-btn" onclick="app.photos.saveAlbum()">✨ Создать</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this._selectedAlbumEmoji = '📸';
    }

    selectAlbumEmoji(emoji, btn) {
        document.querySelectorAll('#createAlbumOverlay .emoji-avatar-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._selectedAlbumEmoji = emoji;
    }

    saveAlbum() {
        const name = document.getElementById('albumNameInput')?.value?.trim();
        if (!name) {
            window.app?.showToast('Введите название! 📸');
            return;
        }

        this.storage.addAlbum({
            id: 'album_' + Date.now(),
            name,
            coverEmoji: this._selectedAlbumEmoji || '📸',
            photoCount: 0,
            createdAt: new Date().toISOString()
        });

        document.getElementById('createAlbumOverlay')?.remove();
        window.app?.showToast('Альбом создан! 📸');
        if (window.app?.currentPage === 'gallery') {
            window.app.renderGalleryContent();
        }
    }

    // ========== ОТКРЫТЬ АЛЬБОМ ==========
    openAlbum(albumId) {
        const album = this.storage.getAlbum(albumId);
        if (!album) return;

        const photos = this.storage.getPhotosByAlbum(albumId);

        document.getElementById('albumViewOverlay')?.remove();

        const html = `
            <div class="admin-modal-overlay active" id="albumViewOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('albumViewOverlay').remove()">✕</button>
                        <h2>${album.coverEmoji} ${album.name}</h2>
                        ${this.isAdmin ? `<button class="admin-modal-close" style="right:50px;background:var(--gradient-button);color:white;" onclick="app.photos.addPhoto('${albumId}')">+</button>` : ''}
                    </div>
                    <div class="admin-modal-body">
                        <div class="photos-grid" id="photosGrid">
                            ${photos.length === 0
                                ? '<div class="admin-empty"><span>📸</span>Пока нет фото</div>'
                                : photos.map(p => this.renderPhotoItem(p)).join('')
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    renderPhotoItem(photo) {
        const hasFile = photo.files && photo.files.length > 0 && photo.files[0].data;
        return `
            <div class="photo-card" onclick="app.photos.viewPhoto('${photo.id}')">
                ${hasFile
                    ? `<img src="${photo.files[0].data}" alt="${photo.caption || ''}" class="photo-card-img">`
                    : `<div class="photo-card-emoji">${photo.emoji || '📸'}</div>`
                }
                <div class="photo-card-caption">${photo.caption || ''}</div>
                ${photo.isNew ? '<div class="photo-new-badge">NEW</div>' : ''}
            </div>
        `;
    }

    // ========== ДОБАВЛЕНИЕ ФОТО ==========
    addPhoto(albumId) {
        document.getElementById('addPhotoOverlay')?.remove();

        const html = `
            <div class="admin-modal-overlay active" id="addPhotoOverlay">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="document.getElementById('addPhotoOverlay').remove()">✕</button>
                        <h2>📸 Добавить фото</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>Подпись</label>
                            <input type="text" class="admin-input" id="photoCaptionInput" placeholder="Описание момента...">
                        </div>
                        <div class="admin-field">
                            <label>Фото</label>
                            <div class="photo-upload-area" onclick="document.getElementById('photoFileInput').click()">
                                <span>📷</span>
                                <p>Нажмите для загрузки</p>
                                <div class="photo-upload-preview" id="photoUploadPreview"></div>
                            </div>
                            <input type="file" id="photoFileInput" accept="image/*" style="display:none" onchange="app.photos.handlePhotoUpload(event)">
                        </div>
                        <div class="admin-field">
                            <label>Или выберите эмодзи</label>
                            <div class="emoji-grid-avatar">
                                ${['📸', '💑', '🌅', '🎂', '🏖️', '🌸', '🎄', '🌙'].map(e => `
                                    <button class="emoji-avatar-btn" onclick="app.photos.selectPhotoEmoji('${e}', this)">${e}</button>
                                `).join('')}
                            </div>
                        </div>
                        <button class="admin-submit-btn" onclick="app.photos.savePhoto('${albumId}')">💾 Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this._selectedPhotoEmoji = '📸';
        this._photoFileData = null;
    }

    selectPhotoEmoji(emoji, btn) {
        document.querySelectorAll('#addPhotoOverlay .emoji-avatar-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._selectedPhotoEmoji = emoji;
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            window.app?.showToast('Максимум 3MB! 📁');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this._photoFileData = e.target.result;
            const preview = document.getElementById('photoUploadPreview');
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    savePhoto(albumId) {
        const caption = document.getElementById('photoCaptionInput')?.value?.trim() || '';

        const photo = {
            id: 'photo_' + Date.now(),
            emoji: this._selectedPhotoEmoji || '📸',
            caption,
            albumId,
            date: new Date().toISOString(),
            isNew: true,
            files: this._photoFileData ? [{ data: this._photoFileData }] : []
        };

        this.storage.addPhoto(photo);
        this.storage.incrementAlbumCount(albumId);

        document.getElementById('addPhotoOverlay')?.remove();
        window.app?.showToast('Фото добавлено! 📸');

        // Обновить вид альбома
        this.openAlbum(albumId);
    }

    // ========== ПРОСМОТР ФОТО ==========
    viewPhoto(photoId) {
        const photo = this.storage.getPhoto(photoId);
        if (!photo) return;

        const hasFile = photo.files && photo.files.length > 0 && photo.files[0].data;

        document.getElementById('photoViewOverlay')?.remove();

        const html = `
            <div class="photo-view-overlay active" id="photoViewOverlay" onclick="if(event.target===this) this.remove()">
                <div class="photo-view-content">
                    <button class="photo-view-close" onclick="document.getElementById('photoViewOverlay').remove()">✕</button>
                    ${hasFile
                        ? `<img src="${photo.files[0].data}" alt="${photo.caption || ''}" class="photo-view-img">`
                        : `<div class="photo-view-emoji">${photo.emoji || '📸'}</div>`
                    }
                    ${photo.caption ? `<div class="photo-view-caption">${photo.caption}</div>` : ''}
                    <div class="photo-view-date">${new Date(photo.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }
}

window.PhotosManager = PhotosManager;