// js/photos.js — Фотоальбомы: загрузка фото и видео

class PhotosManager {
    constructor(storage, isAdmin = false) {
        this.storage = storage;
        this.isAdmin = isAdmin;
        this._selectedFiles = [];
        this._selectedPhotoEmoji = '📷';
    }

    renderPhotosSection() {
        const albums = this.storage.getAlbums();
        const allPhotos = this.storage.getPhotos();

        return `
            <div class="photos-page">
                <div class="photos-header-bar">
                    <h2>📸 Наши моменты</h2>
                    ${this.isAdmin ? `
                        <button class="photos-add-btn" onclick="app.photos.openUpload()">
                            + Добавить
                        </button>
                    ` : ''}
                </div>

                <!-- Альбомы -->
                <div class="section-title">
                    <h2>📁 Альбомы</h2>
                    ${this.isAdmin ? '<span class="see-all" onclick="app.photos.createAlbum()">+ Создать</span>' : ''}
                </div>
                
                <div class="albums-scroll">
                    ${albums.length === 0 
                        ? '<div class="empty-state small"><p>Нет альбомов</p></div>'
                        : albums.map(a => this.renderAlbumCard(a)).join('')
                    }
                </div>

                <!-- Все фото -->
                <div class="section-title">
                    <h2>🖼️ Все медиа (${allPhotos.length})</h2>
                </div>
                
                <div class="photos-grid-masonry" id="photosGrid">
                    ${allPhotos.length === 0 
                        ? this.renderEmptyPhotos()
                        : allPhotos.map(p => this.renderPhotoItem(p)).join('')
                    }
                </div>
            </div>
        `;
    }

    renderEmptyPhotos() {
        return `
            <div class="empty-state">
                <div class="empty-emoji">📸</div>
                <h3>Пока нет фотографий</h3>
                <p>${this.isAdmin 
                    ? 'Добавьте первое фото или видео!' 
                    : 'Скоро здесь появятся ваши моменты...'}</p>
            </div>
        `;
    }

    renderAlbumCard(album) {
        return `
            <div class="album-card" onclick="app.photos.openAlbum('${album.id}')">
                <div class="album-cover">${album.coverEmoji || '📷'}</div>
                <div class="album-info">
                    <span class="album-name">${album.name}</span>
                    <span class="album-count">${album.photoCount || 0} медиа</span>
                </div>
            </div>
        `;
    }

    renderPhotoItem(photo) {
        const isVideo = photo.mediaType === 'video';
        
        return `
            <div class="photo-grid-item ${isVideo ? 'video-item' : ''}" 
                 onclick="app.photos.viewPhoto('${photo.id}')">
                ${photo.files && photo.files[0] 
                    ? (isVideo 
                        ? `<video src="${photo.files[0].data}" class="photo-thumb-media"></video>
                           <div class="video-play-badge">▶️</div>`
                        : `<img src="${photo.files[0].data}" class="photo-thumb-media" alt="">`)
                    : `<div class="photo-thumb-emoji">${photo.emoji || '📷'}</div>`
                }
                <div class="photo-caption-overlay">${photo.caption || ''}</div>
                ${photo.isNew ? '<div class="photo-new-badge">✨</div>' : ''}
                ${isVideo ? '<div class="media-type-badge">🎬</div>' : ''}
            </div>
        `;
    }

    // ========== ЗАГРУЗКА ФОТО И ВИДЕО ==========
    openUpload(albumId = null) {
        const albums = this.storage.getAlbums();
        this._selectedFiles = [];
        this._uploadAlbumId = albumId;

        const html = `
            <div class="admin-modal-overlay active" id="photoUploadOverlay">
                <div class="admin-modal large">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" onclick="app.photos.closeUpload()">✕</button>
                        <h2>📸 Добавить медиа</h2>
                    </div>

                    <div class="admin-modal-body">
                        <!-- Зона загрузки -->
                        <div class="upload-area-new" id="uploadArea" 
                             onclick="document.getElementById('mediaFileInput').click()"
                             ondragover="event.preventDefault(); this.classList.add('dragover')"
                             ondragleave="this.classList.remove('dragover')"
                             ondrop="event.preventDefault(); this.classList.remove('dragover'); app.photos.handleDrop(event)">
                            <div class="upload-icon-big">📸🎬</div>
                            <p class="upload-text-main">Нажмите или перетащите</p>
                            <p class="upload-text-sub">Фото и видео (до 100MB)</p>
                            <input type="file" id="mediaFileInput" 
                                   accept="image/*,video/*" multiple 
                                   style="display:none" 
                                   onchange="app.photos.handleFileSelect(event)">
                        </div>

                        <!-- Превью файлов -->
                        <div class="upload-preview-grid" id="uploadPreview"></div>

                        <!-- Опции -->
                        <div class="admin-field">
                            <label>📝 Подпись</label>
                            <input type="text" class="admin-input" id="photoCaption" 
                                   placeholder="Описание момента...">
                        </div>

                        <div class="admin-field">
                            <label>📁 Альбом</label>
                            <select class="admin-select" id="photoAlbum">
                                <option value="">Без альбома</option>
                                ${albums.map(a => `
                                    <option value="${a.id}" 
                                            ${albumId === a.id ? 'selected' : ''}>
                                        ${a.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="admin-field">
                            <label>😊 Эмодзи</label>
                            <div class="emoji-picker-mini">
                                ${['📷', '🥰', '💑', '🌅', '🎂', '✈️', '🎄', '🌸', '🎉', '🏖️', '🌙', '🎬'].map(e => `
                                    <button class="emoji-pick-btn ${e === '📷' ? 'active' : ''}" 
                                            onclick="app.photos.selectPhotoEmoji('${e}', this)">
                                        ${e}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="upload-file-count" id="uploadFileCount"></div>

                        <button class="admin-submit-btn" onclick="app.photos.saveMedia()" 
                                id="uploadSubmitBtn" disabled>
                            ✨ Добавить медиа
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    handleDrop(event) {
        const files = event.dataTransfer.files;
        this.processFiles(files);
    }

    handleFileSelect(event) {
        const files = event.target.files;
        this.processFiles(files);
    }

    processFiles(files) {
        if (!files || !files.length) return;

        const preview = document.getElementById('uploadPreview');
        const countEl = document.getElementById('uploadFileCount');
        const submitBtn = document.getElementById('uploadSubmitBtn');
        
        Array.from(files).forEach(file => {
            // Проверка размера (100MB для видео, 10MB для фото)
            const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
            
            if (file.size > maxSize) {
                window.app?.toast?.show(`${file.name} слишком большой! ❌`);
                return;
            }

            const isVideo = file.type.startsWith('video/');
            const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

            // Для больших файлов используем URL.createObjectURL вместо base64
            const objectUrl = URL.createObjectURL(file);
            
            this._selectedFiles.push({
                id: fileId,
                name: file.name,
                type: isVideo ? 'video' : 'image',
                size: file.size,
                data: objectUrl,
                file: file  // Сохраняем ссылку на файл
            });

            // Превью
            if (preview) {
                preview.insertAdjacentHTML('beforeend', `
                    <div class="upload-preview-item" id="preview_${fileId}">
                        ${isVideo 
                            ? `<video src="${objectUrl}" class="preview-media"></video>
                               <div class="preview-video-badge">🎬</div>`
                            : `<img src="${objectUrl}" class="preview-media" alt="">`
                        }
                        <div class="preview-name">${file.name}</div>
                        <div class="preview-size">${this.formatFileSize(file.size)}</div>
                        <button class="preview-remove" 
                                onclick="app.photos.removeFile('${fileId}')">✕</button>
                    </div>
                `);
            }
        });

        // Обновить счётчик
        if (countEl) {
            countEl.textContent = `Выбрано: ${this._selectedFiles.length} файл(ов)`;
        }
        if (submitBtn) {
            submitBtn.disabled = this._selectedFiles.length === 0;
        }
    }

    removeFile(fileId) {
        this._selectedFiles = this._selectedFiles.filter(f => f.id !== fileId);
        document.getElementById('preview_' + fileId)?.remove();
        
        const countEl = document.getElementById('uploadFileCount');
        const submitBtn = document.getElementById('uploadSubmitBtn');
        if (countEl) countEl.textContent = `Выбрано: ${this._selectedFiles.length} файл(ов)`;
        if (submitBtn) submitBtn.disabled = this._selectedFiles.length === 0;
    }

    selectPhotoEmoji(emoji, btn) {
        document.querySelectorAll('.emoji-pick-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._selectedPhotoEmoji = emoji;
    }

    async saveMedia() {
        const caption = document.getElementById('photoCaption')?.value?.trim() || '';
        const albumId = document.getElementById('photoAlbum')?.value || '';

        if (this._selectedFiles.length === 0) {
            window.app?.toast?.show('Добавьте хотя бы один файл! 📁');
            return;
        }

        // Сохранить каждый файл как отдельное медиа
        const savedFiles = [];
        
        for (const file of this._selectedFiles) {
        let fileData;

        if (file.file) {
            // Предупреждение для больших файлов
            if (file.file.size > 5 * 1024 * 1024) {
                window.app?.toast?.show('⚠️ Большие файлы могут не сохраниться');
            }

            try {
                fileData = await this.fileToBase64(file.file);
            } catch (e) {
                console.error('File too large for localStorage:', e);
                window.app?.toast?.show(`${file.name} слишком большой для хранения`);
                continue;
            }
        }

        savedFiles.push({
            name: file.name,
            type: file.type,
            size: file.size,
            data: fileData || file.data
        });
    }

        const hasVideo = this._selectedFiles.some(f => f.type === 'video');

        const photo = {
            id: 'media_' + Date.now(),
            emoji: this._selectedPhotoEmoji || '📷',
            caption,
            albumId,
            mediaType: hasVideo ? 'video' : 'image',
            date: new Date().toISOString(),
            isNew: true,
            files: savedFiles
        };

        this.storage.addPhoto(photo);

        if (albumId) {
            this.storage.incrementAlbumCount(albumId);
        }

        this.closeUpload();
        window.app?.toast?.show(`${savedFiles.length} медиа добавлено! 📸✨`);
        window.app?.effects?.launchConfetti(30);
        
        if (window.app) window.app.navigateTo('gallery');
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    closeUpload() {
        // Очистить Object URLs
        this._selectedFiles.forEach(f => {
            if (f.data?.startsWith('blob:')) {
                URL.revokeObjectURL(f.data);
            }
        });
        this._selectedFiles = [];
        document.getElementById('photoUploadOverlay')?.remove();
    }

    // ========== СОЗДАТЬ АЛЬБОМ ==========
    createAlbum() {
        const html = `
            <div class="admin-modal-overlay active" id="createAlbumOverlay">
                <div class="admin-modal small">
                    <div class="admin-modal-header">
                        <button class="admin-modal-close" 
                                onclick="document.getElementById('createAlbumOverlay').remove()">✕</button>
                        <h2>📁 Новый альбом</h2>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-field">
                            <label>Название</label>
                            <input type="text" class="admin-input" id="albumName" 
                                   placeholder="Наше лето 2024">
                        </div>
                        <div class="admin-field">
                            <label>Обложка</label>
                            <div class="emoji-picker-mini">
                                ${['📸', '💑', '🌅', '✈️', '🎄', '🎂', '🌸', '🏖️'].map(e => `
                                    <button class="emoji-pick-btn" 
                                            onclick="app.photos._albumEmoji='${e}'; 
                                            document.querySelectorAll('#createAlbumOverlay .emoji-pick-btn')
                                                .forEach(b=>b.classList.remove('active')); 
                                            this.classList.add('active')">
                                        ${e}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Загрузка фото при создании -->
                        <div class="admin-field">
                            <label>📷 Добавить фото сразу (необязательно)</label>
                            <div class="mini-upload-area" 
                                 onclick="document.getElementById('albumFilesInput').click()">
                                <span>📷🎬 Выбрать файлы</span>
                                <input type="file" id="albumFilesInput" accept="image/*,video/*" 
                                       multiple style="display:none"
                                       onchange="app.photos.handleAlbumFiles(event)">
                            </div>
                            <div class="album-files-preview" id="albumFilesPreview"></div>
                        </div>
                        
                        <button class="admin-submit-btn" onclick="app.photos.saveAlbum()">
                            ✨ Создать альбом
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this._albumEmoji = '📸';
        this._albumFiles = [];
    }

    handleAlbumFiles(event) {
        const files = event.target.files;
        const preview = document.getElementById('albumFilesPreview');
        
        this._albumFiles = [];

        Array.from(files).forEach(file => {
            const objectUrl = URL.createObjectURL(file);
            const isVideo = file.type.startsWith('video/');
            
            this._albumFiles.push({
                name: file.name,
                type: isVideo ? 'video' : 'image',
                size: file.size,
                data: objectUrl,
                file: file
            });
        });

        if (preview) {
            preview.innerHTML = `<div class="album-files-count">${this._albumFiles.length} файл(ов) выбрано</div>`;
        }
    }

    async saveAlbum() {
        const name = document.getElementById('albumName')?.value?.trim();
        if (!name) {
            window.app?.toast?.show('Введите название! 📝');
            return;
        }

        const albumId = 'album_' + Date.now();

        this.storage.addAlbum({
            id: albumId,
            name,
            coverEmoji: this._albumEmoji || '📸',
            photoCount: this._albumFiles?.length || 0,
            createdAt: new Date().toISOString()
        });

        // Сохранить файлы как фото в альбом
        if (this._albumFiles && this._albumFiles.length > 0) {
            for (const file of this._albumFiles) {
                let fileData = file.data;
                
                if (file.file && file.file.size < 5 * 1024 * 1024) {
                    fileData = await this.fileToBase64(file.file);
                }

                this.storage.addPhoto({
                    id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    emoji: this._albumEmoji || '📷',
                    caption: '',
                    albumId,
                    mediaType: file.type,
                    date: new Date().toISOString(),
                    isNew: true,
                    files: [{ name: file.name, type: file.type, data: fileData }]
                });
            }
        }

        document.getElementById('createAlbumOverlay')?.remove();
        window.app?.toast?.show('Альбом создан! 📁✨');
        
        if (window.app) window.app.navigateTo('gallery');
    }

    // ========== ПРОСМОТР ==========
    openAlbum(albumId) {
        const album = this.storage.getAlbum(albumId);
        const photos = this.storage.getPhotosByAlbum(albumId);

        const html = `
            <div class="album-view-overlay active" id="albumViewOverlay">
                <div class="album-view">
                    <div class="album-view-header">
                        <button class="album-back" 
                                onclick="document.getElementById('albumViewOverlay').remove()">
                            ← Назад
                        </button>
                        <h2>${album?.coverEmoji || '📸'} ${album?.name || 'Альбом'}</h2>
                        ${this.isAdmin ? `
                            <button class="album-add-photo-btn" 
                                    onclick="app.photos.openUpload('${albumId}')">
                                + Добавить
                            </button>
                        ` : ''}
                    </div>
                    <div class="album-photos-grid">
                        ${photos.length === 0 
                            ? '<div class="empty-state small"><p>В альбоме пока нет медиа</p></div>'
                            : photos.map(p => this.renderPhotoItem(p)).join('')
                        }
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    viewPhoto(photoId) {
        const photo = this.storage.getPhoto(photoId);
        if (!photo) return;

        const isVideo = photo.mediaType === 'video';
        const hasFile = photo.files && photo.files[0];

        const html = `
            <div class="photo-viewer-overlay active" id="photoViewerOverlay" 
                 onclick="if(event.target===this) this.remove()">
                <div class="photo-viewer">
                    <button class="photo-viewer-close" 
                            onclick="document.getElementById('photoViewerOverlay').remove()">✕</button>
                    <div class="photo-viewer-content">
                        ${hasFile 
                            ? (isVideo 
                                ? `<video src="${photo.files[0].data}" controls 
                                         class="viewer-media" autoplay></video>`
                                : `<img src="${photo.files[0].data}" class="viewer-media" alt="">`)
                            : `<div class="photo-viewer-emoji">${photo.emoji}</div>`
                        }
                    </div>
                    <div class="photo-viewer-info">
                        <p class="photo-viewer-caption">${photo.caption || ''}</p>
                        <p class="photo-viewer-date">
                            ${new Date(photo.date).toLocaleDateString('ru-RU', { 
                                day: 'numeric', month: 'long', year: 'numeric' 
                            })}
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }
}

window.PhotosManager = PhotosManager;