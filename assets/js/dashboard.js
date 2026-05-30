// 1. CONTROL GENERAL DE ESTADOS DE JUEGO
function actualizarJuego(idVideojuego, accion, evento) {
  const e = evento || window.event;
  let tarjetaJuego = null;
  if (e && e.currentTarget) {
    tarjetaJuego = e.currentTarget.closest(".game-card-premium");
  }

  // controlamos el acceso al modal de finalización
  if (accion === "terminado") {
    if (tarjetaJuego) {
      // 1. Recuperamos la duración estimada en horas desde el atributo del HTML
      const horasEstimadas = parseInt(tarjetaJuego.getAttribute("data-duracion")) || 30;
      const minutosEstimadosTotales = horasEstimadas * 60;

      // 2. Buscamos los minutos acumulados analizando el contenedor de progreso en caliente
      const textoProgreso = tarjetaJuego.querySelector(".progress-text-dash")?.textContent || "0min";

      // Extraemos el número de minutos u horas usando expresiones regulares
      let minutosJugados = 0;
      const matchHoras = textoProgreso.match(/(\d+)h/);
      const matchMinutos = textoProgreso.match(/(\d+)min/);

      if (matchHoras) minutosJugados += parseInt(matchHoras[1]) * 60;
      if (matchMinutos) minutosJugados += parseInt(matchMinutos[1]);

      // 3. Evaluamos si el usuario cumple el límite (50% de la campaña obligatoria)
      const porcentajeMinimoRequerido = 0.50; 
      const minutosMinimos = minutosEstimadosTotales * porcentajeMinimoRequerido;

      if (minutosJugados < minutosMinimos) {
        const horasFaltantes = Math.ceil((minutosMinimos - minutosJugados) / 60);
        lanzarNotificacionGamer(
          "error",
          "Ciclo Bloqueado 🔒",
          `Debes registrar al menos el 50% de la campaña estimativa. ¡Añade unas ${horasFaltantes}h más de juego para desbloquear la reseña!`
        );
        return; // Frenamos en seco, el modal de estrellas JAMÁS se abrirá
      }

      // Recordamos la tarjeta global de forma limpia una única vez antes de lanzar el modal
      tarjetaJuegoACompletar = tarjetaJuego;
    }

    // Si supera con éxito el candado de seguridad, abrimos la valoración limpia
    mostrarModalResena(idVideojuego);
    return;
  }

  // para el resto de acciones (mover a en progreso, eliminar, etc) ejecutamos la función normal sin bloqueos
  fetch("../app/update_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id_videojuego=" + idVideojuego + "&accion=" + accion,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        if (tarjetaJuego) {
          // Animación elástica de movimiento
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
              // Al pasar de pendiente a en_progreso, arranca con 0 horas, inyectamos el botón deshabilitado nativo
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
            if (contenedorGeneral) {
              contenedorGeneral.appendChild(tarjetaJuego);
            }

            const selectContrato = document.getElementById("contrato-juego");
            if (selectContrato) {
              const opcionContrato = selectContrato.querySelector(`option[value="${idVideojuego}"]`);
              if (opcionContrato) {
                const tituloJuego = tarjetaJuego.querySelector("h3")?.textContent || "";
                opcionContrato.textContent = `${tituloJuego} (En progreso)`;
              }
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
  document.getElementById("modal-resena-juego-id").value = idVideojuego;
  document.getElementById("modal-comentario-input").value = "";

  const estrellas = document.querySelectorAll('input[name="puntuacion"]');
  estrellas.forEach((radio) => (radio.checked = false));

  document.getElementById("modal-resena").classList.add("active");
}

function cerrarModalResena() {
  document.getElementById("modal-resena").classList.remove("active");
}

function enviarResenaModal() {
  const idVideojuego = document.getElementById("modal-resena-juego-id").value;
  const comentario = document.getElementById("modal-comentario-input").value;
  const estrellaSeleccionada = document.querySelector('input[name="puntuacion"]:checked');

  // Validación de estrellas obligatoria
  if (!estrellaSeleccionada) {
    lanzarNotificacionGamer("error", "Valoración Obligatoria", "Por favor, selecciona una puntuación en estrellas.");
    return;
  }

  const nota = estrellaSeleccionada.value;
  document.getElementById("modal-resena").classList.remove("active");

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

        // Actualizamos la tarjeta visualmente sin recargar, aplicando un efecto de brillo y luego desvaneciendo
        setTimeout(() => {
          location.reload();
        }, 1000);

      } else {
        lanzarNotificacionGamer("error", "Error", datos.message || "No se pudo guardar.");
      }
    })
    .catch((error) => console.error("Error:", error));
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

// función para ejecutar la eliminación del juego de forma asíncrona sin recargar la página
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
        // desvanecemos y eliminamos la tarjeta del backlog visualmente
        if (tarjetaJuegoAEliminar) {
          tarjetaJuegoAEliminar.classList.add("removiendo-contrato");
          setTimeout(() => {
            tarjetaJuegoAEliminar.remove();
            comprobarBacklogVacio();
          }, 400);
        }

        // buscamos y quitamos este juego del desplegable de los contratos semanales
        try {
          const selectContrato = document.getElementById("contrato-juego");
          if (selectContrato) {
            for (let i = 0; i < selectContrato.options.length; i++) {
              if (selectContrato.options[i].value == idJuego) {
                selectContrato.remove(i);
                console.log(
                  "Juego eliminado del select de contratos en caliente.",
                );
                break;
              }
            }

            // si tras borrar la opción el select se ha quedado completamente vacío
            if (selectContrato.options.length === 0) {
              selectContrato.innerHTML = `
                <option value="" disabled selected>❌ No tienes juegos activos disponibles</option>
              `;
            }
          }
        } catch (errOption) {
          console.error("Aviso al limpiar select de contratos:", errOption);
        }

        lanzarNotificacionGamer(
          "exito",
          "Juego Eliminado",
          "Se ha quitado el juego de tu biblioteca y se han actualizado tus opciones.",
        );
      } else {
        lanzarNotificacionGamer(
          "error",
          "Error",
          datos.message || "Error al eliminar",
        );
      }
    })
    .catch((err) => {
      console.error("Error crítico en la petición de borrado:", err);
      lanzarNotificacionGamer(
        "error",
        "Error Crítico",
        "No se pudo interpretar la respuesta del servidor.",
      );
    });
}

// 6. CONTROL DE FILTRADO DE BACKLOG
function filtrarBacklog(estadoFiltro, botonActivo) {
  const botones = document.querySelectorAll(".filter-tab-btn");
  botones.forEach((btn) => btn.classList.remove("active"));
  botonActivo.classList.add("active");

  const contenedor = document.getElementById("contenedor-backlog-juegos");
  const tarjetas = document.querySelectorAll(
    "#contenedor-backlog-juegos .game-card-premium",
  );

  // limpiamos avisos de filtros vacíos previos para que no se dupliquen
  const avisoPrevio = document.getElementById("aviso-filtro-vacio");
  if (avisoPrevio) avisoPrevio.remove();

  let tarjetasVisibles = 0;

  tarjetas.forEach((tarjeta) => {
    const estadoTarjeta = tarjeta.getAttribute("data-estado");

    if (estadoFiltro === "todos") {
      tarjeta.style.display = "flex";
      tarjetasVisibles++;
    } else if (estadoTarjeta === estadoFiltro) {
      tarjeta.style.display = "flex";
      tarjetasVisibles++;
    } else {
      tarjeta.style.display = "none";
    }
  });

  // si tras aplicar el filtro no hay ninguna tarjeta visible, mostramos un mensaje
  if (tarjetas.length > 0 && tarjetasVisibles === 0) {
    let mensajeVacio = "No tienes juegos en esta categoría.";
    if (estadoFiltro === "pendiente") {
      mensajeVacio =
        "¡Felicidades! No te quedan misiones pendientes en tu backlog. 🔥";
    } else if (estadoFiltro === "en_progreso") {
      mensajeVacio =
        "No estás jugando a nada activamente. ¡Gira la ruleta o dale a Jugar! 🎲";
    }

    const divAviso = document.createElement("div");
    divAviso.id = "aviso-filtro-vacio";
    divAviso.className = "empty-state-dash";
    divAviso.style.gridColumn = "1 / -1"; // Ocupa todo el ancho del mosaico grid
    divAviso.innerHTML = `<p>${mensajeVacio}</p>`;

    if (contenedor) contenedor.appendChild(divAviso);
  }
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

// ==========================================================================
//  INTERFACES COMPLEMENTARIAS: Desplegar críticas guardadas
// ==========================================================================
function toggleResenaTarjeta(boton) {
  // Buscamos la tarjeta contenedora
  const tarjeta = boton.closest(".game-card-premium");
  if (tarjeta) {
    const panelResena = tarjeta.querySelector(".resena-desplegable-premium");
    if (panelResena) {
      // Alternamos la clase activa para disparar la transición CSS
      panelResena.classList.toggle("active");
      
      // Cambiamos el texto del botón dinámicamente para mejorar el feedback
      if (panelResena.classList.contains("active")) {
        boton.innerHTML = "🙈 Ocultar";
      } else {
        boton.innerHTML = "👁 Reseña";
      }
    }
  }
}