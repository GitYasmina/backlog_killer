/* ==========================================================================
   UTILIDADES GLOBALES: COMPONENTES REUTILIZABLES (utils.js)
   ========================================================================== */
// Lanza una notificación flotante premium estilo gamer en la pantalla.
function lanzarNotificacionGamer(tipo, titulo, mensaje) {
  const toastViejo = document.querySelector(".toast-dinamico-premium");
  if (toastViejo) toastViejo.remove();

  const toast = document.createElement("div");
  toast.className = `toast-dinamico-premium ${tipo}`;

  let icono = "✔";
  if (tipo === "logro") icono = "🏆";
  if (tipo === "error") icono = "❌";

  toast.innerHTML = `
        <div class="toast-icono-box-dinamico">${icono}</div>
        <div class="toast-texto-box-dinamico">
            <h4>${titulo}</h4>
            <p>${mensaje}</p>
        </div>
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "desvanecerToastPremium 0.5s forwards ease-in-out";
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3500);
}

// modal de logout
function confirmarCerrarSesion() {
  const modal = document.getElementById("modal-logout-confirmar");
  if (modal) {
    modal.classList.add("active");
  } else {
    window.location.href = "../app/logout.php";
  }
}

function cerrarModalLogout() {
  const modal = document.getElementById("modal-logout-confirmar");
  if (modal) modal.classList.remove("active");
}

// desplegable de reseña en tarjetas premium
function toggleResenaTarjeta(boton) {
  const tarjeta = boton.closest(".game-card-premium");
  if (tarjeta) {
    const panelResena = tarjeta.querySelector(".resena-desplegable-premium");
    if (panelResena) {
      panelResena.classList.toggle("active");
      if (panelResena.classList.contains("active")) {
        boton.innerHTML = "🙈 Ocultar";
      } else {
        boton.innerHTML = "👁 Reseña";
      }
    }
  }
}

// modal de reseña para juegos completados
function mostrarModalResena(idVideojuego) {
  document.getElementById("modal-resena-juego-id").value = idVideojuego;
  document.getElementById("modal-comentario-input").value = "";

  const estrellas = document.querySelectorAll('input[name="puntuacion"]');
  estrellas.forEach((radio) => (radio.checked = false));

  document.getElementById("modal-resena").classList.add("active");
}

function cerrarModalResena() {
  document.getElementById("modal-resena").classList.remove("active");
}