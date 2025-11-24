document.addEventListener("DOMContentLoaded", () => {

    // Toggle mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const desktopMenu = document.getElementById('desktopMenu');

    if (mobileMenuBtn && desktopMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            desktopMenu.classList.toggle('hidden');
        });
    }

    // Active menu effect
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function () {

            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.remove('nav-active');
            });

            this.classList.add('nav-active');
        });
    });

});
