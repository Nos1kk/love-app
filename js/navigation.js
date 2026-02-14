// js/navigation.js — Навигация (работает с существующей HTML-разметкой)

class Navigation {
    constructor(app) {
        this.app = app;
        this.currentPage = 'home';
        this.menuOpen = false;
    }

    init() {
        this.bindEvents();
        this.updateBadges();
    }

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
        const menu = document.getElementById('sideMenu');
        const overlay = document.getElementById('menuOverlay');

        if (menu) menu.classList.toggle('active', this.menuOpen);
        if (overlay) overlay.classList.toggle('active', this.menuOpen);
    }

    setActivePage(pageId) {
        this.currentPage = pageId;

        // Bottom nav
        document.querySelectorAll('#bottomNav .nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageId);
        });

        // Side menu
        document.querySelectorAll('#sideMenu .menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageId);
        });
    }

    updateBadges() {
        const letters = this.app.storage.getLetters();
        const unread = letters.filter(l => !l.read).length;

        // Calendar badge
        const calBadge = document.getElementById('calendarBadge');
        const events = this.app.storage.getEvents();
        if (calBadge) {
            calBadge.textContent = events.length;
            calBadge.style.display = events.length > 0 ? 'inline' : 'none';
        }

        // Letters badge
        const letterBadge = document.getElementById('lettersBadge');
        if (letterBadge) {
            letterBadge.textContent = unread;
            letterBadge.style.display = unread > 0 ? 'inline' : 'none';
        }

        // Notification badge
        const notifBadge = document.getElementById('notifBadge');
        const gifts = this.app.storage.getGifts().filter(g => !g.opened);
        const total = unread + gifts.length;
        if (notifBadge) {
            notifBadge.textContent = total;
            notifBadge.style.display = total > 0 ? 'flex' : 'none';
        }
    }

    bindEvents() {
        // Свайп для бокового меню
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', e => {
            const diffX = e.changedTouches[0].clientX - touchStartX;
            const diffY = Math.abs(e.changedTouches[0].clientY - touchStartY);

            // Горизонтальный свайп (не вертикальный)
            if (diffY < 100) {
                if (touchStartX < 30 && diffX > 80 && !this.menuOpen) {
                    this.toggleMenu();
                }
                if (this.menuOpen && diffX < -80) {
                    this.toggleMenu();
                }
            }
        }, { passive: true });
    }
}

window.Navigation = Navigation;