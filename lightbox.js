/* ============================================================
   LIGHTBOX MEJORADO
   - Cerrar: X, Esc (solo si no está en fullscreen), clic fuera
   - Navegar: flechas (solo escritorio), teclado (← →), swipe (móvil)
   - Precarga de imágenes anterior y siguiente
   - Contador "3 / 12"
   - Botón de pantalla completa
   - Al salir de fullscreen, el lightbox permanece abierto
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

    // Extrae la ruta de lightbox del atributo onclick de la imagen
    function obtenerRutaLightbox(img) {
        const onclickAttr = img.getAttribute('onclick') || '';
        const match = onclickAttr.match(/abrirLightbox\(\s*\d+\s*,\s*['"]([^'"]+)['"]/);
        return match ? match[1] : null;
    }

    // Muestra la imagen correspondiente al índiceActual
    function mostrarFotoActual() {
        const img = imagenesGaleria[indiceActual];
        if (!img) return;

        const ruta = obtenerRutaLightbox(img);
        if (ruta) {
            document.getElementById('imagenLightbox').src = ruta;
        }

        actualizarContador();
        precargar(1);
        precargar(-1);
    }

    window.abrirLightbox = function (indice) {
        indiceActual = indice;
        ultimoFoco = document.activeElement;

        const lb = document.getElementById('lightbox');
        lb.classList.add('activo');

        mostrarFotoActual();

        document.body.style.overflow = 'hidden';

        setTimeout(function () {
            const cerrarBtn = document.querySelector('.cerrar');
            if (cerrarBtn) cerrarBtn.focus();
        }, 50);
    };

    window.cerrarLightbox = function () {
        const lb = document.getElementById('lightbox');
        if (!lb) return;

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
        mostrarFotoActual();
    };

    window.fotoAnterior = function () {
        if (imagenesGaleria.length === 0) return;
        indiceActual = (indiceActual - 1 + imagenesGaleria.length) % imagenesGaleria.length;
        mostrarFotoActual();
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
        const ruta = obtenerRutaLightbox(imagenesGaleria[siguienteIndice]);
        if (ruta) {
            const pre = new Image();
            pre.src = ruta;
        }
    }

    window.togglePantallaCompleta = function () {
        const lb = document.getElementById('lightbox');
        if (!lb) return;

        if (!estaEnFullscreen()) {
            const metodo = lb.requestFullscreen ||
                           lb.webkitRequestFullscreen ||
                           lb.mozRequestFullScreen ||
                           lb.msRequestFullscreen;
            if (metodo) metodo.call(lb);
        } else {
            salirDeFullscreen();
        }
    };

    // ============================================================
    // TECLADO
    // ============================================================

    document.addEventListener('keydown', function (e) {
        const lb = document.getElementById('lightbox');
        if (!lb || !lb.classList.contains('activo')) return;

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

})();