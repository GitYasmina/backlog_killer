// 1. CONTROL GENERAL DE ESTADOS DE JUEGO
function actualizarJuego(idVideojuego, accion, evento) {
  if (accion === "terminado") {
    mostrarModalResena(idVideojuego);
    return;
  }

  const e = evento || window.event;
  let tarjetaJuego = null;
  if (e && e.currentTarget) {
    tarjetaJuego = e.currentTarget.closest(".game-card-premium");
  }

  fetch("../app/update_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id_videojuego=" + idVideojuego + "&accion=" + accion,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        if (tarjetaJuego) {
          // animación elástica de movimiento
          tarjetaJuego.classList.add("removiendo-contrato");

          setTimeout(() => {
            tarjetaJuego.classList.remove("removiendo-contrato");

            // cambiamos el estado en el DOM para el filtro por pestañas
            tarjetaJuego.setAttribute("data-estado", "en_progreso");

            // cambiamos el diseño del Badge visual arriba de la foto
            const badge = tarjetaJuego.querySelector(".status-badge-premium");
            if (badge) {
              badge.className = "status-badge-premium en_progreso";
              badge.textContent = "En progreso";
            }

            // reemplazamos la botonera usando exactamente tus estilos y tu icono de basura de FontAwesome
            const contenedorBotones = tarjetaJuego.querySelector(".card-actions-premium");
            if (contenedorBotones) {
              contenedorBotones.innerHTML = `
                <button type="button" onclick="cambiarHoras(${idVideojuego})" class="btn-action-dash edit" title="Actualizar progreso">📝 Horas</button>
                <button type="button" onclick="actualizarJuego(${idVideojuego}, 'terminado', event)" class="btn-action-dash check" title="Marcar como terminado">✅ Fin</button>
                <button type="button" onclick="confirmarEliminarJuego(${idVideojuego}, '${tarjetaJuego.querySelector("h3").textContent.replace(/'/g, "\\'")}')" class="btn-action-dash delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
              `;
            }

            // inyectamos la barra de progreso en vivo vacía (0 horas de inicio)
            const infoBox = tarjetaJuego.querySelector(".game-info-premium");
            const tag = tarjetaJuego.querySelector(".game-tag-premium");
            if (infoBox && tag && !tarjetaJuego.querySelector(".progress-container-dash")) {
              const duracionEstimada = tarjetaJuego.getAttribute("data-duracion") || 30; 
              const barraHTML = `
                <div class="progress-container-dash">
                    <div class="progress-bar-bg-dash">
                        <div class="progress-bar-fill-dash" style="width: 0%"></div>
                    </div>
                    <span class="progress-text-dash">0min / ${duracionEstimada}h (0%)</span>
                </div>
              `;
              tag.insertAdjacentHTML("afterend", barraHTML);
            }

            // movemos la tarjeta al final del contenedor para agruparla con los que están en progreso
            const contenedorGeneral = document.getElementById("contenedor-backlog-juegos");
            if (contenedorGeneral) {
              contenedorGeneral.appendChild(tarjetaJuego);
            }

            comprobarBacklogVacio();
          }, 400);
        }

        if (datos.logro) {
          lanzarNotificacionGamer("logro", "¡LOGRO DESBLOQUEADO!", `Has conseguido: ${datos.logro}`);
        } else {
          lanzarNotificacionGamer("exito", "¡A Jugar!", "El juego se ha movido a tu lista de 'En Curso'.");
        }
      } else {
        lanzarNotificacionGamer("error", "Error", datos.message || "No se pudo actualizar el juego.");
      }
    });
}
// función para comprobar si el backlog activo se ha quedado vacío y mostrar un mensaje amigable
function comprobarBacklogVacio() {
  const contenedor = document.getElementById("contenedor-backlog-juegos");
  if (
    contenedor &&
    contenedor.querySelectorAll(".game-card-premium").length === 0
  ) {
    contenedor.innerHTML = `
            <div class="empty-state-dash">
                <p>No tienes juegos pendientes ni en curso. ¡Buen trabajo! 🔥</p>
                <a href="buscar_juego.php">Añadir más juegos</a>
            </div>
        `;
  }
}

// 2. CONTROL DEL MODAL DE REGISTRO DE HORAS
function cambiarHoras(idVideojuego) {
  document.getElementById("modal-juego-id").value = idVideojuego;
  document.getElementById("modal-horas-input").value = "";
  document.getElementById("modal-horas").classList.add("active");
}

function cerrarModal() {
  document.getElementById("modal-horas").classList.remove("active");
}

function enviarHorasModal() {
  const idVideojuego = document.getElementById("modal-juego-id").value;
  let nuevasHoras = document.getElementById("modal-horas-input").value;

  if (nuevasHoras.trim() === "") return;
  nuevasHoras = parseInt(nuevasHoras);

  if (isNaN(nuevasHoras) || nuevasHoras <= 0) {
    lanzarNotificacionGamer(
      "error",
      "Valor Incorrecto",
      "Introduce un número de horas mayor que cero.",
    );
    return;
  }

  cerrarModal();

  fetch("../app/update_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "id_videojuego=" +
      idVideojuego +
      "&accion=actualizar_horas&horas=" +
      nuevasHoras,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        if (datos.logro) {
          lanzarNotificacionGamer(
            "logro",
            "¡LOGRO DESBLOQUEADO!",
            `Has conseguido: ${datos.logro}`,
          );
          setTimeout(() => {
            location.reload();
          }, 2000);
        } else {
          lanzarNotificacionGamer(
            "exito",
            "Progreso Guardado",
            datos.message || "Horas actualizadas correctamente.",
          );
          setTimeout(() => {
            location.reload();
          }, 1200);
        }
      } else {
        lanzarNotificacionGamer("error", "Error", datos.message);
      }
    });
}

// Variable global para recordar qué tarjeta estamos completando
let tarjetaJuegoACompletar = null;

// 3. CONTROL DEL MODAL DE VALORACIÓN Y RESEÑAS
function mostrarModalResena(idVideojuego) {
  if (event && event.currentTarget) {
    tarjetaJuegoACompletar = event.currentTarget.closest(".game-card-premium");
  }
  document.getElementById("modal-resena-juego-id").value = idVideojuego;
  document.getElementById("modal-comentario-input").value = "";

  const estrellas = document.querySelectorAll('input[name="puntuacion"]');
  estrellas.forEach((radio) => (radio.checked = false));

  document.getElementById("modal-resena").classList.add("active");
}

function cerrarModalResena() {
  document.getElementById("modal-resena").classList.remove("active");
  location.reload();
}

function enviarResenaModal() {
    const idVideojuego = document.getElementById("modal-resena-juego-id").value;
    const comentario = document.getElementById("modal-comentario-input").value;
    const estrellaSeleccionada = document.querySelector('input[name="puntuacion"]:checked');
    const nota = estrellaSeleccionada ? estrellaSeleccionada.value : "5";

    document.getElementById("modal-resena").classList.remove("active");

    fetch("../app/update_game.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "id_videojuego=" + idVideojuego + "&accion=terminado&nota=" + nota + "&resena=" + encodeURIComponent(comentario),
    })
        .then((res) => res.json())
        .then((datos) => {
            if (datos.status === "success") {
                if (tarjetaJuegoACompletar) {
                    tarjetaJuegoACompletar.classList.add("removiendo-contrato");
                    
                    setTimeout(() => {
                        const contenedorJoyas = document.getElementById("contenedor-joyas-completadas");
                        const portada = tarjetaJuegoACompletar.querySelector(".game-poster-wrapper img")?.src || "../assets/img/no-image.png";
                        const titulo = tarjetaJuegoACompletar.querySelector("h3")?.textContent || "Juego Terminado";
                        const genero = tarjetaJuegoACompletar.querySelector(".game-tag-premium")?.textContent || "Gamer";

                        // Si existe la rejilla de joyas abajo, inyectamos la versión completada en vivo
                        if (contenedorJoyas) {
                            const emptyStateJoyas = contenedorJoyas.querySelector(".empty-state-dash");
                            if (emptyStateJoyas) emptyStateJoyas.remove();

                            const nuevaJoyaHTML = `
                                <div class="game-card-premium game-card-completed-premium">
                                    <div class="game-poster-wrapper">
                                        <img src="${portada}" alt="Portada">
                                        <span class="status-badge-premium terminado">Terminado ✅</span>
                                    </div>
                                    <div class="game-info-premium">
                                        <h3>${titulo}</h3>
                                        <span class="game-tag-premium">${genero}</span>

                                        <div class="progress-container-dash">
                                            <div class="progress-bar-bg-dash">
                                                <div class="progress-bar-fill-dash completed-bar" style="width: 100%;"></div>
                                            </div>
                                            <span class="progress-text-dash success-txt">¡Completado! (Nota: ★ ${nota}/5) 🌟</span>
                                        </div>

                                        <div class="card-actions-premium">
                                            <button type="button" onclick="confirmarEliminarJuego(${idVideojuego}, '${titulo.replace(/'/g, "\\'")}')" class="btn-action-dash delete" title="Eliminar de la biblioteca"><i class="fa-solid fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            `;
                            // Lo añade al inicio de la vitrina de completados
                            contenedorJoyas.insertAdjacentHTML('afterbegin', nuevaJoyaHTML);
                        }

                        // Eliminamos la tarjeta del backlog superior
                        tarjetaJuegoACompletar.remove();
                        comprobarBacklogVacio();
                    }, 400);
                }

                lanzarNotificacionGamer("exito", "¡Juego Completado!", "La reseña se ha guardado con éxito.");
                
                if (datos.logro) {
                    lanzarNotificacionGamer("logro", "¡LOGRO DESBLOQUEADO!", `Has conseguido: ${datos.logro}`);
                }
            } else {
                lanzarNotificacionGamer("error", "Error", datos.message || "Hubo un error al guardar la reseña");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

// 4. CONTROL DEL MODAL DE CONTRATOS SEMANALES
function abrirModalContrato() {
  document.getElementById("contrato-objetivo").value = "";
  document.getElementById("modal-contrato").classList.add("active");
}

function cerrarModalContrato() {
  document.getElementById("modal-contrato").classList.remove("active");
}

function enviarContratoModal() {
  const idVideojuego = document.getElementById("contrato-juego").value;
  const objetivo = document.getElementById("contrato-objetivo").value;

  if (idVideojuego === "" || objetivo.trim() === "") {
    lanzarNotificacionGamer(
      "error",
      "Campos Incompletos",
      "Selecciona un videojuego activo y describe tu meta.",
    );
    return;
  }

  cerrarModalContrato();

  fetch("../app/controlador_contratos.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "accion=crear&id_videojuego=" +
      idVideojuego +
      "&objetivo=" +
      encodeURIComponent(objetivo),
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        // avisamos visualmente de que se ha firmado el trato con éxito
        lanzarNotificacionGamer(
          "exito",
          "CONTRATO FIRMADO 📜",
          "Tu micro-objetivo se ha añadido al tablero.",
        );
        setTimeout(() => {
          location.reload();
        }, 1200);
      } else {
        lanzarNotificacionGamer(
          "error",
          "Error",
          datos.message || "Error al firmar el contrato",
        );
      }
    });
}

function completarContrato(idContrato) {
  // Obtenemos el botón pulsado para luego eliminar la tarjeta de contrato visualmente
  const botonPulsado = event.currentTarget;
  const tarjetaContrato = botonPulsado.closest(
    ".tarjeta-contrato-gamer-premium",
  );

  fetch("../app/controlador_contratos.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "accion=completar&id_contrato=" + idContrato,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        // activamos la animación de deslizamiento y fade-out en la tarjeta
        if (tarjetaContrato) {
          tarjetaContrato.classList.add("removiendo-contrato");

          // eperamos los 400ms de la transición CSS y fulminamos la tarjeta del HTML sin recargar
          setTimeout(() => {
            tarjetaContrato.remove();

            // comprobamos si quedan más contratos activos para pintar o no el cartel de "No tienes contratos firmados"
            // para pintar el cartel de "No tienes contratos firmados"
            if (typeof comprobarListaVaciaContratos === "function") {
              comprobarListaVaciaContratos();
            }
          }, 400);
        }

        // lanzamos las alertas correspondientes (ahora flotan de forma independiente)
        if (datos.logro) {
          lanzarNotificacionGamer(
            "logro",
            "¡LOGRO DESBLOQUEADO!",
            `Has conseguido: ${datos.logro}`,
          );
        } else {
          lanzarNotificacionGamer(
            "exito",
            "Misión Cumplida",
            "¡Contrato cumplido! Has recibido +30 XP.",
          );
        }
      } else {
        lanzarNotificacionGamer(
          "error",
          "Error",
          datos.message || "Error al completar el contrato",
        );
      }
    });
}

function cancelarContrato(idContrato) {
  // obtenemos el botón pulsado para luego eliminar la tarjeta de contrato visualmente
  const botonPulsado = event.currentTarget;
  const tarjetaContrato = botonPulsado.closest(
    ".tarjeta-contrato-gamer-premium",
  );
  fetch("../app/controlador_contratos.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "accion=cancelar&id_contrato=" + idContrato,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        if (tarjetaContrato)
          tarjetaContrato.classList.add("removiendo-contrato");
        lanzarNotificacionGamer(
          "exito",
          "Contrato Cancelado",
          "El contrato ha sido cancelado exitosamente.",
        );
        setTimeout(() => {
          location.reload();
        }, 1000);
      } else {
        lanzarNotificacionGamer(
          "error",
          "Error",
          datos.message || "Error al cancelar el contrato",
        );
      }
    });
}

// 5. CONTROL DE ELIMINACIÓN PREMIUM INTERACTIVO
function confirmarEliminarJuego(idJuego, tituloJuego) {
  if (event && event.currentTarget) {
    tarjetaJuegoAEliminar = event.currentTarget.closest(".game-card-premium");
  }
  document.getElementById("eliminar-juego-id").value = idJuego;
  document.getElementById("eliminar-juego-titulo").textContent =
    `"${tituloJuego}"`;
  document.getElementById("modal-confirmar-eliminar").classList.add("active");
}

function cerrarModalEliminar() {
  document
    .getElementById("modal-confirmar-eliminar")
    .classList.remove("active");
}

function ejecutarEliminarJuego() {
  const idJuego = document.getElementById("eliminar-juego-id").value;
  cerrarModalEliminar();

  fetch("../app/update_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id_videojuego=" + idJuego + "&accion=eliminar",
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        if (tarjetaJuegoAEliminar) {
          tarjetaJuegoAEliminar.classList.add("removiendo-contrato");
          setTimeout(() => {
            tarjetaJuegoAEliminar.remove();
            comprobarListaVaciaContratos();
          }, 400);
        }
        lanzarNotificacionGamer(
          "exito",
          "Juego Eliminado",
          "Se ha quitado el juego de tu biblioteca.",
        );
      } else {
        lanzarNotificacionGamer(
          "error",
          "Error",
          datos.message || "Error al eliminar",
        );
        setTimeout(() => {
          location.reload();
        }, 550);
      }
    });
}

// 6. CONTROL DE FILTRADO DE BACKLOG
function filtrarBacklog(estadoFiltro, botonActivo) {
  const botones = document.querySelectorAll(".filter-tab-btn");
  botones.forEach((btn) => btn.classList.remove("active"));
  botonActivo.classList.add("active");

  const tarjetas = document.querySelectorAll(
    "#contenedor-backlog-juegos .game-card-premium",
  );

  tarjetas.forEach((tarjeta) => {
    const estadoTarjeta = tarjeta.getAttribute("data-estado");

    if (estadoFiltro === "todos") {
      tarjeta.style.display = "flex";
    } else if (estadoTarjeta === estadoFiltro) {
      tarjeta.style.display = "flex";
    } else {
      tarjeta.style.display = "none";
    }
  });
}

function comprobarListaVaciaContratos() {
  const contenedor = document.querySelector(".contratos-grid-wrapper-premium");
  // Si ya no quedan tarjetas de contrato dentro de la lista...
  if (
    contenedor &&
    contenedor.querySelectorAll(".tarjeta-contrato-gamer-premium").length === 0
  ) {
    // Localizamos la sección global de contratos para inyectar el estado vacío original
    const seccion = document.querySelector(".seccion-contrato-premium");
    if (seccion) {
      // Reemplazamos la rejilla por el diseño de "No tienes objetivos signed"
      contenedor.remove();
      const divVacio = document.createElement("div");
      divVacio.className = "contrato-vacio-card-premium";
      divVacio.innerHTML = `
                <p>No tienes ningún objetivo estratégico firmado para esta semana.</p>
                <button onclick="abrirModalContrato()" class="btn-cta-dash-primary btn-firmar-contrato">📜 Firmar Primer Contrato</button>
            `;
      seccion.appendChild(divVacio);
    }
  }
}

// ==========================================================================
// CONTROL DEL MODAL DE LOGOUT
// ==========================================================================

function confirmarCerrarSesion() {
  const modal = document.getElementById("modal-logout-confirmar");
  if (modal) {
    modal.classList.add("active");
  }
}

function cerrarModalLogout() {
  const modal = document.getElementById("modal-logout-confirmar");
  if (modal) {
    modal.classList.remove("active");
  }
}
