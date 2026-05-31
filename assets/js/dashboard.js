// Variable global para recordar qué tarjeta estamos completando
let tarjetaJuegoACompletar = null;

// 1. CONTROL GENERAL DE ESTADOS DE JUEGO (JUGAR / FIN)
function actualizarJuego(idVideojuego, accion, evento) {
  const e = evento || window.event;
  let tarjetaJuego = null;
  if (e && e.currentTarget) {
    tarjetaJuego = e.currentTarget.closest(".game-card-premium");
  }

  // Controlamos el candado de seguridad del 50% de horas para poder terminarlo
  if (accion === "terminado") {
    if (tarjetaJuego) {
      const horasEstimadas = parseInt(tarjetaJuego.getAttribute("data-duracion")) || 30;
      const minutosEstimadosTotales = horasEstimadas * 60;
      const textoProgreso = tarjetaJuego.querySelector(".progress-text-dash")?.textContent || "0min";

      let minutosJugados = 0;
      const matchHoras = textoProgreso.match(/(\d+)h/);
      const matchMinutos = textoProgreso.match(/(\d+)min/);

      if (matchHoras) minutosJugados += parseInt(matchHoras[1]) * 60;
      if (matchMinutos) minutosJugados += parseInt(matchMinutos[1]);

      const porcentajeMinimoRequerido = 0.50; 
      const minutosMinimos = minutosEstimadosTotales * porcentajeMinimoRequerido;

      if (minutosJugados < minutosMinimos) {
        const horasFaltantes = Math.ceil((minutosMinimos - minutosJugados) / 60);
        lanzarNotificacionGamer(
          "error",
          "Ciclo Bloqueado 🔒",
          `Debes registrar al menos el 50% de la campaña estimativa. ¡Añade unas ${horasFaltantes}h más de juego para desbloquear la reseña!`
        );
        return;
      }
      tarjetaJuegoACompletar = tarjetaJuego;
    }

    // Llamamos a la función visual que ahora vive en utils.js de forma limpia
    mostrarModalResena(idVideojuego);
    return;
  }

  // Petición asíncrona para mover a "En curso" o arrancar juego
  fetch("../app/update_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id_videojuego=" + idVideojuego + "&accion=" + accion,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        if (tarjetaJuego) {
          tarjetaJuego.classList.add("removiendo-contrato");

          setTimeout(() => {
            tarjetaJuego.classList.remove("removiendo-contrato");
            tarjetaJuego.setAttribute("data-estado", "en_progreso");

            const badge = tarjetaJuego.querySelector(".status-badge-premium");
            if (badge) {
              badge.className = "status-badge-premium en_progreso";
              badge.textContent = "En progreso";
            }

            const contenedorBotones = tarjetaJuego.querySelector(".card-actions-premium");
            if (contenedorBotones) {
              contenedorBotones.innerHTML = `
                <button type="button" onclick="cambiarHoras(${idVideojuego})" class="btn-action-dash edit" title="Actualizar progreso">📝 Horas</button>
                <button type="button" class="btn-action-dash check btn-disabled-premium" title="🔒 Completa al menos el 50% de la campaña estimativa para desbloquear este ciclo" disabled>🔒 Fin</button>
                <button type="button" onclick="confirmarEliminarJuego(${idVideojuego}, '${tarjetaJuego.querySelector("h3").textContent.replace(/'/g, "\\'")}')" class="btn-action-dash delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
              `;
            }

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

            const contenedorGeneral = document.getElementById("contenedor-backlog-juegos");
            if (contenedorGeneral) contenedorGeneral.appendChild(tarjetaJuego);

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

function comprobarBacklogVacio() {
  const contenedor = document.getElementById("contenedor-backlog-juegos");
  if (contenedor && contenedor.querySelectorAll(".game-card-premium").length === 0) {
    contenedor.innerHTML = `
            <div class="empty-state-dash">
                <p>No tienes juegos pendientes ni en curso. ¡Buen trabajo! 🔥</p>
                <a href="buscar_juego.php">Añadir más juegos</a>
            </div>
        `;
  }
}

// 2. REGISTRO DE HORAS Y MINUTOS EN EL MODAL NEÓN
function cambiarHoras(idVideojuego) {
  document.getElementById("modal-juego-id").value = idVideojuego;
  document.getElementById("modal-horas-input").value = "";
  document.getElementById("modal-minutos-input").value = "";
  document.getElementById("modal-horas").classList.add("active");
}

function cerrarModal() {
  document.getElementById("modal-horas").classList.remove("active");
}

function enviarHorasModal() {
  const idVideojuego = document.getElementById("modal-juego-id").value;
  const inputHoras = document.getElementById("modal-horas-input").value;
  const inputMinutos = document.getElementById("modal-minutos-input").value;

  const horas = parseInt(inputHoras) || 0;
  const minutos = parseInt(inputMinutos) || 0;

  if (horas === 0 && minutos === 0) {
    lanzarNotificacionGamer("error", "Valor Incorrecto", "Introduce al menos un minuto de juego para registrar.");
    return;
  }

  if (minutos < 0 || minutos > 59 || horas < 0) {
    lanzarNotificacionGamer("error", "Formato Inválido", "Los minutos deben estar entre 0 y 59.");
    return;
  }

  const minutosTotalesRegistro = (horas * 60) + minutos;
  cerrarModal();

  fetch("../app/update_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id_videojuego=" + idVideojuego + "&accion=actualizar_horas&minutos_totales=" + minutosTotalesRegistro,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        if (datos.logro) {
          lanzarNotificacionGamer("logro", "¡LOGRO DESBLOQUEADO!", `Has conseguido: ${datos.logro}`);
        } else {
          lanzarNotificacionGamer("exito", "Progreso Guardado", datos.message || "Tiempo actualizado correctamente.");
        }
        setTimeout(() => { location.reload(); }, 1200);
      } else {
        lanzarNotificacionGamer("error", "Error", datos.message);
      }
    });
}

// 3. ENVÍO DE LA VALORACIÓN Y RESEÑA AL COMPLETAR
function enviarResenaModal() {
  const idVideojuego = document.getElementById("modal-resena-juego-id").value;
  const comentario = document.getElementById("modal-comentario-input").value;
  const estrellaSeleccionada = document.querySelector('input[name="puntuacion"]:checked');

  if (!estrellaSeleccionada) {
    lanzarNotificacionGamer("error", "Valoración Obligatoria", "Por favor, selecciona una puntuación en estrellas.");
    return;
  }

  const nota = estrellaSeleccionada.value;
  cerrarModalResena(); // Llama de forma cruzada a la función de utils.js

  fetch("../app/update_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id_videojuego=" + idVideojuego + "&accion=terminado&nota=" + nota + "&resena=" + encodeURIComponent(comentario),
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        lanzarNotificacionGamer("exito", "¡Juego Completado!", "Tu reseña se ha guardado en el historial.");
        if (datos.logro) {
          lanzarNotificacionGamer("logro", "¡LOGRO DESBLOQUEADO!", `Has conseguido: ${datos.logro}`);
        }
        setTimeout(() => { location.reload(); }, 1000);
      } else {
        lanzarNotificacionGamer("error", "Error", datos.message || "No se pudo guardar.");
      }
    })
    .catch((error) => console.error("Error:", error));
}

// 4. CONTROL DE CONTRATOS SEMANALES
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
    lanzarNotificacionGamer("error", "Campos Incompletos", "Selecciona un videojuego activo y describe tu meta.");
    return;
  }

  cerrarModalContrato();

  fetch("../app/controlador_contratos.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "accion=crear&id_videojuego=" + idVideojuego + "&objetivo=" + encodeURIComponent(objetivo),
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        lanzarNotificacionGamer("exito", "CONTRATO FIRMADO 📜", "Tu micro-objetivo se ha añadido al tablero.");
        setTimeout(() => { location.reload(); }, 1200);
      } else {
        lanzarNotificacionGamer("error", "Error", datos.message || "Error al firmar el contrato");
      }
    });
}

function completarContrato(idContrato) {
  const botonPulsado = event.currentTarget;
  const tarjetaContrato = botonPulsado.closest(".tarjeta-contrato-gamer-premium");

  fetch("../app/controlador_contratos.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "accion=completar&id_contrato=" + idContrato,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        if (tarjetaContrato) {
          tarjetaContrato.classList.add("removiendo-contrato");
          setTimeout(() => {
            tarjetaContrato.remove();
            if (typeof comprobarListaVaciaContratos === "function") comprobarListaVaciaContratos();
          }, 400);
        }

        if (datos.logro) {
          lanzarNotificacionGamer("logro", "¡LOGRO DESBLOQUEADO!", `Has conseguido: ${datos.logro}`);
        } else {
          lanzarNotificacionGamer("exito", "Misión Cumplida", "¡Contrato cumplido! Has recibido +30 XP.");
        }
      } else {
        lanzarNotificacionGamer("error", "Error", datos.message || "Error al completar el contrato");
      }
    });
}

function cancelarContrato(idContrato) {
  const botonPulsado = event.currentTarget;
  const tarjetaContrato = botonPulsado.closest(".tarjeta-contrato-gamer-premium");
  
  fetch("../app/controlador_contratos.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "accion=cancelar&id_contrato=" + idContrato,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        if (tarjetaContrato) tarjetaContrato.classList.add("removiendo-contrato");
        lanzarNotificacionGamer("exito", "Contrato Cancelado", "El contrato ha sido cancelado exitosamente.");
        setTimeout(() => { location.reload(); }, 1000);
      } else {
        lanzarNotificacionGamer("error", "Error", datos.message || "Error al cancelar el contrato");
      }
    });
}

// 5. ELIMINACIÓN DE JUEGOS
let tarjetaJuegoAEliminar = null;

function confirmarEliminarJuego(idJuego, tituloJuego) {
  if (event && event.currentTarget) {
    tarjetaJuegoAEliminar = event.currentTarget.closest(".game-card-premium");
  }
  document.getElementById("eliminar-juego-id").value = idJuego;
  document.getElementById("eliminar-juego-titulo").textContent = `"${tituloJuego}"`;
  document.getElementById("modal-confirmar-eliminar").classList.add("active");
}

function cerrarModalEliminar() {
  document.getElementById("modal-confirmar-eliminar").classList.remove("active");
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
            comprobarBacklogVacio();
          }, 400);
        }
        lanzarNotificacionGamer("exito", "Juego Eliminado", "Se ha quitado el juego de tu biblioteca.");
      } else {
        lanzarNotificacionGamer("error", "Error", datos.message || "Error al eliminar");
      }
    });
}

// 6. FILTROS DE PANTALLA PENDIENTE / EN CURSO
function filtrarBacklog(estadoFiltro, botonActivo) {
  const botones = document.querySelectorAll(".filter-tab-btn");
  botones.forEach((btn) => btn.classList.remove("active"));
  botonActivo.classList.add("active");

  const contenedor = document.getElementById("contenedor-backlog-juegos");
  const tarjetas = document.querySelectorAll("#contenedor-backlog-juegos .game-card-premium");

  const avisoPrevio = document.getElementById("aviso-filtro-vacio");
  if (avisoPrevio) avisoPrevio.remove();

  let tarjetasVisibles = 0;

  tarjetas.forEach((tarjeta) => {
    const estadoTarjeta = tarjeta.getAttribute("data-estado");
    if (estadoFiltro === "todos" || estadoTarjeta === estadoFiltro) {
      tarjeta.style.display = "flex";
      tarjetasVisibles++;
    } else {
      tarjeta.style.display = "none";
    }
  });

  if (tarjetas.length > 0 && tarjetasVisibles === 0) {
    let mensajeVacio = "No tienes juegos en esta categoría.";
    if (estadoFiltro === "pendiente") mensajeVacio = "¡Felicidades! No te quedan misiones pendientes. 🔥";
    else if (estadoFiltro === "en_progreso") mensajeVacio = "No estás jugando a nada activamente. 🎲";

    const divAviso = document.createElement("div");
    divAviso.id = "aviso-filtro-vacio";
    divAviso.className = "empty-state-dash";
    divAviso.style.gridColumn = "1 / -1";
    divAviso.innerHTML = `<p>${mensajeVacio}</p>`;
    if (contenedor) contenedor.appendChild(divAviso);
  }
}

function comprobarListaVaciaContratos() {
  const contenedor = document.querySelector(".contratos-grid-wrapper-premium");
  if (contenedor && contenedor.querySelectorAll(".tarjeta-contrato-gamer-premium").length === 0) {
    const seccion = document.querySelector(".seccion-contrato-premium");
    if (seccion) {
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