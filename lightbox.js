/* ============================================================
   LIGHTBOX MEJORADO
   - Cerrar: X, Esc, clic fuera
   - Navegar: flechas, teclado (← →), swipe en móvil
   - Precarga de imágenes anterior y siguiente
   - Contador "3 / 12"
   ============================================================ */

(function () {
    let indiceActual = 0;
    let imagenesGaleria = [];
    let touchStartX = 0;
    let touchEndX = 0;
    let ultimoFoco = null;

    // Se ejecuta cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function () {
        // Recoge todas las imágenes con data-indice de la página
        imagenesGaleria = Array.from(document.querySelectorAll('[data-indice]'));

        // Crea el contador si no existe
        const lightbox = document.getElementById('lightbox');
        if (lightbox && !document.getElementById('contadorLightbox')) {
            const contador = document.createElement('div');
            contador.id = 'contadorLightbox';
            contador.className = 'contador-lightbox';
            lightbox.appendChild(contador);
        }

        // Swipe en móvil
        if (lightbox) {
            lightbox.addEventListener('touchstart', function (e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            lightbox.addEventListener('touchend', function (e) {
                touchEndX = e.changedTouches[0].screenX;
                gestionarSwipe();
            }, { passive: true });
        }
    });

    function gestionarSwipe() {
        const umbral = 50; // píxeles mínimos para considerar swipe
        if (touchEndX < touchStartX - umbral) {
            fotoSiguiente();
        } else if (touchEndX > touchStartX + umbral) {
            fotoAnterior();
        }
    }

    window.abrirLightbox = function (indice, imagen, texto) {
        indiceActual = indice;
        ultimoFoco = document.activeElement;

        const lb = document.getElementById('lightbox');
        lb.classList.add('activo');

        document.getElementById('imagenLightbox').src = imagen;
        document.getElementById('textoLightbox').innerHTML = texto;

        actualizarContador();
        precargar(1);
        precargar(-1);

        document.body.style.overflow = 'hidden';

        // Foco al botón de cerrar (accesibilidad)
        setTimeout(function () {
            const cerrarBtn = document.querySelector('.cerrar');
            if (cerrarBtn) cerrarBtn.focus();
        }, 50);
    };

    window.cerrarLightbox = function () {
        const lb = document.getElementById('lightbox');
        lb.classList.remove('activo');
        document.body.style.overflow = '';

        // Devolver el foco a donde estaba
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

        // Extrae la ruta de lightbox del atributo onclick (patrón abrirLightbox(i, 'URL', ...))
        const onclickAttr = siguienteImg.getAttribute('onclick') || '';
        const match = onclickAttr.match(/abrirLightbox\(\s*\d+\s*,\s*['"]([^'"]+)['"]/);
        if (match && match[1]) {
            const pre = new Image();
            pre.src = match[1];
        }
    }

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
})();