/* ============================================================
   LIGHTBOX MEJORADO
   - Cerrar: X, Esc (solo si no está en fullscreen), clic fuera
   - Navegar: flechas (solo escritorio), teclado (← →), swipe (móvil)
   - Precarga de imágenes anterior y siguiente
   - Contador "3 / 12"
   - Botón de pantalla completa
   - Al salir de fullscreen, el lightbox permanece abierto
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

    // Devuelve true si el navegador está en pantalla completa
    function estaEnFullscreen() {
        return !!(document.fullscreenElement ||
                  document.webkitFullscreenElement ||
                  document.mozFullScreenElement ||
                  document.msFullscreenElement);
    }

    // Sale de pantalla completa si se está en ella
    function salirDeFullscreen() {
        if (!estaEnFullscreen()) return;
        const metodo = document.exitFullscreen ||
                       document.webkitExitFullscreen ||
                       document.mozCancelFullScreen ||
                       document.msExitFullscreen;
        if (metodo) metodo.call(document);
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

        // Si estamos en fullscreen, salir primero
        salirDeFullscreen();

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

        if (!estaEnFullscreen()) {
            // Entrar en pantalla completa
            const metodo = lb.requestFullscreen ||
                           lb.webkitRequestFullscreen ||
                           lb.mozRequestFullScreen ||
                           lb.msRequestFullscreen;
            if (metodo) metodo.call(lb);
        } else {
            // Salir solo de pantalla completa, sin cerrar el lightbox
            salirDeFullscreen();
        }
    };

    // ============================================================
    // TECLADO
    // ============================================================

    document.addEventListener('keydown', function (e) {
        const lb = document.getElementById('lightbox');
        if (!lb || !lb.classList.contains('activo')) return;

        // Esc:
        // - Si estamos en fullscreen: sale de fullscreen y SE QUEDA en el lightbox
        // - Si NO estamos en fullscreen: cierra el lightbox
        if (e.key === 'Escape') {
            if (estaEnFullscreen()) {
                salirDeFullscreen();
            } else {
                cerrarLightbox();
            }
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

    // ============================================================
    // CAMBIO DE ESTADO FULLSCREEN
    // ============================================================
    // NO cerramos el lightbox al salir de fullscreen.
    // Simplemente dejamos que el CSS ajuste la foto al tamaño normal.
    // ============================================================

})();