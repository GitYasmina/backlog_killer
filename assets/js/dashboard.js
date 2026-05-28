// 1. CONTROL GENERAL DE ESTADOS DE JUEGO
function actualizarJuego(idVideojuego, accion) {
    if (accion === "terminado") {
        mostrarModalResena(idVideojuego);
        return;
    }

    const botonPulsado = event.currentTarget;
    const tarjetaJuego = botonPulsado.closest(".game-card-premium");

    fetch("../app/update_game.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "id_videojuego=" + idVideojuego + "&accion=" + accion,
    })
        .then((res) => res.json())
        .then((datos) => {
            if (datos.status === "success") {
                if (tarjetaJuego) tarjetaJuego.classList.add("removiendo-contrato");
                if (tarjetaJuego) {
                    tarjetaJuego.classList.add("removiendo-contrato");

                    // cuando acabe la animación (400ms), borramos la tarjeta del HTML
                    setTimeout(() => {
                        tarjetaJuego.remove();
                        // si no quedan más juegos en la lista, podrías mostrar un texto de "Lista vacía"
                        comprobarListaVaciaContratos();
                    }, 400);
                }
                if (datos.logro) {
                    lanzarNotificacionGamer(
                        "logro",
                        "¡LOGRO DESBLOQUEADO!",
                        `Has conseguido: ${datos.logro}`,
                    );

                }
            } else {
                lanzarNotificacionGamer(
                    "error",
                    "Error",
                    datos.message || "No se pudo actualizar el juego.",
                );
            }
        });
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
    const estrellaSeleccionada = document.querySelector(
        'input[name="puntuacion"]:checked',
    );
    const nota = estrellaSeleccionada ? estrellaSeleccionada.value : "";

    document.getElementById("modal-resena").classList.remove("active");

    fetch("../app/update_game.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
            "id_videojuego=" +
            idVideojuego +
            "&accion=terminado&nota=" +
            nota +
            "&resena=" +
            encodeURIComponent(comentario),
    })
        .then((res) => res.json())
        .then((datos) => {
            if (datos.status === "success") {
                if (tarjetaJuegoACompletar) {
                    tarjetaJuegoACompletar.classList.add("removiendo-contrato");
                    setTimeout(() => {
                        tarjetaJuegoACompletar.remove();
                        comprobarListaVaciaContratos();
                    }, 400);
                }
                lanzarNotificacionGamer("exito", "¡Juego Completado!", "La reseña se ha guardado con éxito.");
                if (datos.logro) {
                    lanzarNotificacionGamer(
                        "logro",
                        "¡LOGRO DESBLOQUEADO!",
                        `Has conseguido: ${datos.logro}`,
                    );
                }
            } else {
                lanzarNotificacionGamer(
                    "error",
                    "Error",
                    datos.message || "Hubo un error al guardar la reseña",
                );
                setTimeout(() => { location.reload(); }, 550);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            location.reload();
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
    const tarjetaContrato = botonPulsado.closest(".tarjeta-contrato-gamer-premium");

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
                    `Has conseguido: ${datos.logro}`
                );
            } else {
                lanzarNotificacionGamer(
                    "exito",
                    "Misión Cumplida",
                    "¡Contrato cumplido! Has recibido +30 XP."
                );
            }
        } else {
            lanzarNotificacionGamer(
                "error",
                "Error",
                datos.message || "Error al completar el contrato"
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
            lanzarNotificacionGamer("exito", "Juego Eliminado", "Se ha quitado el juego de tu biblioteca.");
            } else {
                lanzarNotificacionGamer(
                    "error",
                    "Error",
                    datos.message || "Error al eliminar",
                );
                setTimeout(() => { location.reload(); }, 550);
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
    if (contenedor && contenedor.querySelectorAll(".tarjeta-contrato-gamer-premium").length === 0) {
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