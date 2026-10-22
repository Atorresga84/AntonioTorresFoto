(function () {
    let indiceActual = 0;
    let imagenesGaleria = [];
    let touchStartX = 0;
    let touchEndX = 0;
    let ultimoFoco = null;

    document.addEventListener('DOMContentLoaded', function () {
        imagenesGaleria = Array.from(document.querySelectorAll('[data-indice]'));

        // 🔍 DEBUG: imprime cuántas imágenes hay y sus índices
        console.log('=== DEBUG LIGHTBOX ===');
        console.log('Total imágenes con data-indice:', imagenesGaleria.length);
        imagenesGaleria.forEach(function (img, i) {
            console.log(
                'Posición en array:', i,
                '| data-indice:', img.getAttribute('data-indice'),
                '| src:', img.getAttribute('src')
            );
        });
        console.log('======================');

        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        if (!document.getElementById('contadorLightbox')) {
            const contador = document.createElement('div');
            contador.id = 'contadorLightbox';
            contador.className = 'contador-lightbox';
            lightbox.appendChild(contador);
        }

        const btnPantalla = document.querySelector('.pantalla-completa');
        if (btnPantalla) {
            const soportado = document.fullscreenEnabled ||
                              document.webkitFullscreenEnabled ||
                              document.mozFullScreenEnabled ||
                              document.msFullscreenEnabled;
            if (soportado) btnPantalla.classList.add('visible');
        }

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
        if (touchEndX < touchStartX - umbral) fotoSiguiente();
        else if (touchEndX > touchStartX + umbral) fotoAnterior();
    }

    function estaEnFullscreen() {
        return !!(document.fullscreenElement ||
                  document.webkitFullscreenElement ||
                  document.mozFullScreenElement ||
                  document.msFullscreenElement);
    }

    function salirDeFullscreen() {
        if (!estaEnFullscreen()) return;
        const metodo = document.exitFullscreen ||
                       document.webkitExitFullscreen ||
                       document.mozCancelFullScreen ||
                       document.msExitFullscreen;
        if (metodo) metodo.call(document);
    }

    function obtenerRutaLightbox(img) {
        const onclickAttr = img.getAttribute('onclick') || '';
        const match = onclickAttr.match(/abrirLightbox\(\s*\d+\s*,\s*['"]([^'"]+)['"]/);
        return match ? match[1] : null;
    }

    function mostrarFotoActual() {
        const img = imagenesGaleria[indiceActual];
        if (!img) return;

        const ruta = obtenerRutaLightbox(img);
        if (ruta) document.getElementById('imagenLightbox').src = ruta;

        actualizarContador();
        precargar(1);
        precargar(-1);

        // 🔍 DEBUG: imprime qué foto se está mostrando
        console.log('Mostrando índice:', indiceActual, '| data-indice:', img.getAttribute('data-indice'), '| ruta:', ruta);
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
        if (ultimoFoco) { ultimoFoco.focus(); ultimoFoco = null; }
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
        if (contador) contador.textContent = (indiceActual + 1) + ' / ' + imagenesGaleria.length;
    }

    function precargar(direccion) {
        if (imagenesGaleria.length === 0) return;
        const total = imagenesGaleria.length;
        const siguienteIndice = (indiceActual + direccion + total) % total;
        const ruta = obtenerRutaLightbox(imagenesGaleria[siguienteIndice]);
        if (ruta) { const pre = new Image(); pre.src = ruta; }
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

    document.addEventListener('keydown', function (e) {
        const lb = document.getElementById('lightbox');
        if (!lb || !lb.classList.contains('activo')) return;
        if (e.key === 'Escape') {
            if (estaEnFullscreen()) salirDeFullscreen();
            else cerrarLightbox();
        } else if (e.key === 'ArrowRight') fotoSiguiente();
        else if (e.key === 'ArrowLeft') fotoAnterior();
    });

    document.addEventListener('click', function (e) {
        const lb = document.getElementById('lightbox');
        if (!lb || !lb.classList.contains('activo')) return;
        if (e.target === lb) cerrarLightbox();
    });
})();