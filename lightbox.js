/* ============================================================
   LIGHTBOX MEJORADO
   - Cerrar: X, Esc, clic fuera
   - Navegar: flechas (solo escritorio), teclado (← →), swipe (móvil)
   - Precarga de imágenes anterior y siguiente
   - Contador "3 / 12"
   - Botón de pantalla completa
   - Sin pies de foto
   ============================================================ */

(function () {
    let indiceActual = 0;
    let imagenesGaleria = [];
    let touchStartX = 0;
    let touchEndX = 0;
    let ultimoFoco = null;

    document.addEventListener('DOMContentLoaded', function () {
        imagenesGaleria = Array.from(document.querySelectorAll('[data-indice]'));

        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        // Crea el contador si no existe
        if (!document.getElementById('contadorLightbox')) {
            const contador = document.createElement('div');
            contador.id = 'contadorLightbox';
            contador.className = 'contador-lightbox';
            lightbox.appendChild(contador);
        }

        // Botón pantalla completa si el navegador lo soporta
        const btnPantalla = document.querySelector('.pantalla-completa');
        if (btnPantalla) {
            const soportado = document.fullscreenEnabled ||
                              document.webkitFullscreenEnabled ||
                              document.mozFullScreenEnabled ||
                              document.msFullscreenEnabled;
            if (soportado) {
                btnPantalla.classList.add('visible');
            }
        }

        // Swipe en móvil
        lightbox.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            gestionarSwipe();
        }, { passive: true });
    });

    function gestionarSwipe() {
        const umbral = 50;
        if (touchEndX < touchStartX - umbral) {
            fotoSiguiente();
        } else if (touchEndX > touchStartX + umbral) {
            fotoAnterior();
        }
    }

    window.abrirLightbox = function (indice, imagen) {
        indiceActual = indice;
        ultimoFoco = document.activeElement;

        const lb = document.getElementById('lightbox');
        lb.classList.add('activo');

        document.getElementById('imagenLightbox').src = imagen;

        actualizarContador();
        precargar(1);
        precargar(-1);

        document.body.style.overflow = 'hidden';

        setTimeout(function () {
            const cerrarBtn = document.querySelector('.cerrar');
            if (cerrarBtn) cerrarBtn.focus();
        }, 50);
    };

    window.cerrarLightbox = function () {
        const lb = document.getElementById('lightbox');
        if (!lb) return;

        const estaEnFullscreen = document.fullscreenElement ||
                                 document.webkitFullscreenElement ||
                                 document.mozFullScreenElement ||
                                 document.msFullscreenElement;
        if (estaEnFullscreen) {
            const metodo = document.exitFullscreen ||
                           document.webkitExitFullscreen ||
                           document.mozCancelFullScreen ||
                           document.msExitFullscreen;
            if (metodo) metodo.call(document);
        }

        lb.classList.remove('activo');
        document.body.style.overflow = '';

        if (ultimoFoco) {
            ultimoFoco.focus();
            ultimoFoco = null;
        }
    };

    window.fotoSiguiente = function () {
        if (imagenesGaleria.length === 0) return;
        indiceActual = (indiceActual + 1) % imagenesGaleria.length;
        imagenesGaleria[indiceActual].click();
    };

    window.fotoAnterior = function () {
        if (imagenesGaleria.length === 0) return;
        indiceActual = (indiceActual - 1 + imagenesGaleria.length) % imagenesGaleria.length;
        imagenesGaleria[indiceActual].click();
    };

    function actualizarContador() {
        const contador = document.getElementById('contadorLightbox');
        if (contador) {
            contador.textContent = (indiceActual + 1) + ' / ' + imagenesGaleria.length;
        }
    }

    function precargar(direccion) {
        if (imagenesGaleria.length === 0) return;
        const total = imagenesGaleria.length;
        const siguienteIndice = (indiceActual + direccion + total) % total;
        const siguienteImg = imagenesGaleria[siguienteIndice];

        const onclickAttr = siguienteImg.getAttribute('onclick') || '';
        const match = onclickAttr.match(/abrirLightbox\(\s*\d+\s*,\s*['"]([^'"]+)['"]/);
        if (match && match[1]) {
            const pre = new Image();
            pre.src = match[1];
        }
    }

    window.togglePantallaCompleta = function () {
        const lb = document.getElementById('lightbox');
        if (!lb) return;

        const estaEnFullscreen = document.fullscreenElement ||
                                 document.webkitFullscreenElement ||
                                 document.mozFullScreenElement ||
                                 document.msFullscreenElement;

        if (!estaEnFullscreen) {
            const metodo = lb.requestFullscreen ||
                           lb.webkitRequestFullscreen ||
                           lb.mozRequestFullScreen ||
                           lb.msRequestFullscreen;
            if (metodo) metodo.call(lb);
        } else {
            const metodo = document.exitFullscreen ||
                           document.webkitExitFullscreen ||
                           document.mozCancelFullScreen ||
                           document.msExitFullscreen;
            if (metodo) metodo.call(document);
        }
    };

    // Teclado: Esc, ← →
    document.addEventListener('keydown', function (e) {
        const lb = document.getElementById('lightbox');
        if (!lb || !lb.classList.contains('activo')) return;

        if (e.key === 'Escape') {
            cerrarLightbox();
        } else if (e.key === 'ArrowRight') {
            fotoSiguiente();
        } else if (e.key === 'ArrowLeft') {
            fotoAnterior();
        }
    });

    // Clic fuera de la imagen cierra
    document.addEventListener('click', function (e) {
        const lb = document.getElementById('lightbox');
        if (!lb || !lb.classList.contains('activo')) return;
        if (e.target === lb) {
            cerrarLightbox();
        }
    });

    // Salir de fullscreen con Esc del navegador → cerrar lightbox
    function alSalirDeFullscreen() {
        const lb = document.getElementById('lightbox');
        if (!lb) return;
        const estaEnFullscreen = document.fullscreenElement ||
                                 document.webkitFullscreenElement ||
                                 document.mozFullScreenElement ||
                                 document.msFullscreenElement;
        if (!estaEnFullscreen && lb.classList.contains('activo')) {
            lb.classList.remove('activo');
            document.body.style.overflow = '';
        }
    }

    document.addEventListener('fullscreenchange', alSalirDeFullscreen);
    document.addEventListener('webkitfullscreenchange', alSalirDeFullscreen);
    document.addEventListener('mozfullscreenchange', alSalirDeFullscreen);
    document.addEventListener('MSFullscreenChange', alSalirDeFullscreen);

})();