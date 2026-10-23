/* ============================================================
   GESTIÓN DE COOKIES Y GOOGLE ANALYTICS
   - Bloquea Analytics hasta que el usuario acepta
   - Guarda la decisión en localStorage
   - Muestra/oculta el banner
   ============================================================ */

(function () {
    const CLAVE = 'consentimiento_cookies';
    const ID_ANALYTICS = 'G-MT3DKL07EW';

    // Carga Google Analytics solo si el usuario ha aceptado
    function cargarAnalytics() {
        if (window.gtagCargado) return;
        window.gtagCargado = true;

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID_ANALYTICS;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', ID_ANALYTICS);
    }

    // Muestra el banner si no hay decisión guardada
    function mostrarBanner() {
        const banner = document.getElementById('banner-cookies');
        if (!banner) return;
        banner.style.display = 'block';
    }

    // Oculta el banner
    function ocultarBanner() {
        const banner = document.getElementById('banner-cookies');
        if (banner) banner.style.display = 'none';
    }

    // Guarda la decisión y actúa en consecuencia
    function guardarDecision(aceptado) {
        localStorage.setItem(CLAVE, aceptado ? 'aceptado' : 'rechazado');
        ocultarBanner();
        if (aceptado) {
            cargarAnalytics();
        }
    }

    // Al cargar la página
    document.addEventListener('DOMContentLoaded', function () {
        const decision = localStorage.getItem(CLAVE);

        if (decision === 'aceptado') {
            cargarAnalytics();
        } else if (decision === 'rechazado') {
            // No hace nada: Analytics bloqueado
        } else {
            // Sin decisión: mostrar banner
            mostrarBanner();
        }

        // Botones del banner
        const btnAceptar = document.getElementById('btn-aceptar-cookies');
        const btnRechazar = document.getElementById('btn-rechazar-cookies');

        if (btnAceptar) {
            btnAceptar.addEventListener('click', function () {
                guardarDecision(true);
            });
        }

        if (btnRechazar) {
            btnRechazar.addEventListener('click', function () {
                guardarDecision(false);
            });
        }
    });

    // Función global para que el enlace del footer pueda reabrir el banner
    window.abrirConfiguracionCookies = function () {
        localStorage.removeItem(CLAVE);
        mostrarBanner();
    };
})();