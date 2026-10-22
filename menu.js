/* ============================================================
   MENÚ HAMBURGUESA (móvil)
   - Abre/cierra el menú al pulsar el botón
   - Cierra al pulsar un enlace
   - Cierra con Esc
   - Cierra al hacer clic fuera del menú
   ============================================================ */

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.querySelector('.menu-toggle');
        const nav = document.querySelector('nav');

        if (!btn || !nav) return;

        // Abrir / cerrar al pulsar el botón
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const abierto = nav.classList.toggle('abierto');
            btn.classList.toggle('abierto', abierto);
            btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        });

        // Cerrar al pulsar un enlace del menú
        nav.querySelectorAll('a').forEach(function (enlace) {
            enlace.addEventListener('click', function () {
                nav.classList.remove('abierto');
                btn.classList.remove('abierto');
                btn.setAttribute('aria-expanded', 'false');
            });
        });

        // Cerrar con Esc
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('abierto')) {
                nav.classList.remove('abierto');
                btn.classList.remove('abierto');
                btn.setAttribute('aria-expanded', 'false');
                btn.focus();
            }
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', function (e) {
            if (!nav.classList.contains('abierto')) return;
            if (nav.contains(e.target) || btn.contains(e.target)) return;

            nav.classList.remove('abierto');
            btn.classList.remove('abierto');
            btn.setAttribute('aria-expanded', 'false');
        });
    });
})();