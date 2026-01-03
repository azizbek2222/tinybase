// Aktiv bo'limni belgilash
const links = document.querySelectorAll('.sidebar a');
links.forEach(link => {
    link.addEventListener('click', () => {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Scroll qilinganda avtomatik aktivlashish
window.addEventListener('scroll', () => {
    let fromTop = window.scrollY + 80;
    document.querySelectorAll('section').forEach(sec => {
        if (sec.offsetTop <= fromTop && sec.offsetTop + sec.offsetHeight > fromTop) {
            links.forEach(l => {
                l.classList.remove('active');
                if (l.getAttribute('href').includes(sec.id)) l.classList.add('active');
            });
        }
    });
});
