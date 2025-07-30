// في ملف script.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
    const hamburgerMenuMobile = document.querySelector('.main-header .desktop-hidden');
    const hamburgerMenuSidebar = document.querySelector('.sidebar .hamburger-menu');

    if (hamburgerMenuMobile) {
        hamburgerMenuMobile.addEventListener('click', () => {
            container.classList.add('sidebar-open');
        });
    }

    if (hamburgerMenuSidebar) {
        hamburgerMenuSidebar.addEventListener('click', () => {
            container.classList.remove('sidebar-open');
        });
    }

    // إغلاق الشريط الجانبي عند النقر خارج الشريط نفسه (اختياري)
    document.addEventListener('click', (event) => {
        if (container.classList.contains('sidebar-open') &&
            !sidebar.contains(event.target) &&
            !hamburgerMenuMobile.contains(event.target)) {
            container.classList.remove('sidebar-open');
        }
    });

    // ... باقي أكواد JavaScript الخاصة بك ...
});
