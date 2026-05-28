// 1. CONTROL GENERAL DE ESTADOS DE JUEGO
function actualizarJuego(idVideojuego, accion) {
    if (accion === "terminado") {
        mostrarModalResena(idVideojuego);
        return;
    }

    fetch("../app/update_game.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "id_videojuego=" + idVideojuego + "&accion=" + accion,
    })
    .then((res) => res.json())
    .then((datos) => {
        if (datos.status === "success") {
            if (datos.logro) {
                lanzarNotificacionGamer("logro", "¡LOGRO DESBLOQUEADO!", `Has conseguido: ${datos.logro}`);
                setTimeout(() => { location.reload(); }, 2000);
            } else {
                location.reload();
            }
        } else {
            lanzarNotificacionGamer("error", "Error", datos.message || "No se pudo actualizar el juego.");
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
        lanzarNotificacionGamer("error", "Valor Incorrecto", "Introduce un número de horas mayor que cero.");
        return;
    }

    cerrarModal();

    fetch("../app/update_game.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "id_videojuego=" + idVideojuego + "&accion=actualizar_horas&horas=" + nuevasHoras,
    })
    .then((res) => res.json())
    .then((datos) => {
        if (datos.status === "success") {
            if (datos.logro) {
                lanzarNotificacionGamer("logro", "¡LOGRO DESBLOQUEADO!", `Has conseguido: ${datos.logro}`);
                setTimeout(() => { location.reload(); }, 2000);
            } else {
                lanzarNotificacionGamer("exito", "Progreso Guardado", datos.message || "Horas actualizadas correctamente.");
                setTimeout(() => { location.reload(); }, 1200);
            }
        } else {
            lanzarNotificacionGamer("error", "Error", datos.message);
        }
    });
}

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
    location.reload();
}

function enviarResenaModal() {
    const idVideojuego = document.getElementById("modal-resena-juego-id").value;
    const comentario = document.getElementById("modal-comentario-input").value;
    const estrellaSeleccionada = document.querySelector('input[name="puntuacion"]:checked');
    const nota = estrellaSeleccionada ? estrellaSeleccionada.value : "";

    document.getElementById("modal-resena").classList.remove("active");

    fetch("../app/update_game.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "id_videojuego=" + idVideojuego + "&accion=terminado&nota=" + nota + "&resena=" + encodeURIComponent(comentario),
    })
    .then((res) => res.json())
    .then((datos) => {
        if (datos.status === "success") {
            if (datos.logro) {
                lanzarNotificacionGamer("logro", "¡LOGRO DESBLOQUEADO!", `Has conseguido: ${datos.logro}`);
                setTimeout(() => { location.reload(); }, 2000);
            } else {
                lanzarNotificacionGamer("exito", "¡Juego Completado!", "La reseña se ha guardado con éxito.");
                setTimeout(() => { location.reload(); }, 1200);
            }
        } else {
            lanzarNotificacionGamer("error", "Error", datos.message || "Hubo un error al guardar la reseña");
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
            location.reload();
        } else {
            lanzarNotificacionGamer("error", "Error", datos.message || "Error al firmar el contrato");
        }
    });
}

function completarContrato(idContrato) {
    fetch("../app/controlador_contratos.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "accion=completar&id_contrato=" + idContrato,
    })
    .then((res) => res.json())
    .then((datos) => {
        if (datos.status === "success") {
            if (datos.logro) {
                lanzarNotificacionGamer("logro", "¡LOGRO DESBLOQUEADO!", `Has conseguido: ${datos.logro}`);
                setTimeout(() => { location.reload(); }, 2000);
            } else {
                lanzarNotificacionGamer("exito", "Misión Cumplida", "¡Contrato cumplido! Has recibido +30 XP.");
                setTimeout(() => { location.reload(); }, 1500);
            }
        } else {
            lanzarNotificacionGamer("error", "Error", datos.message || "Error al completar el contrato");
        }
    });
}

function cancelarContrato(idContrato) {
    fetch("../app/controlador_contratos.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "accion=cancelar&id_contrato=" + idContrato,
    })
    .then((res) => res.json())
    .then((datos) => {
        if (datos.status === "success") {
            lanzarNotificacionGamer("exito", "Contrato Cancelado", "El contrato ha sido cancelado exitosamente.");
            setTimeout(() => { location.reload(); }, 1000);
        } else {
            lanzarNotificacionGamer("error", "Error", datos.message || "Error al cancelar el contrato");
        }
    });
}

// 5. CONTROL DE ELIMINACIÓN PREMIUM INTERACTIVO
function confirmarEliminarJuego(idJuego, tituloJuego) {
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
            lanzarNotificacionGamer("exito", "Juego Eliminado", "Se ha quitado el juego de tu biblioteca.");
            setTimeout(() => { location.reload(); }, 1000);
        } else {
            lanzarNotificacionGamer("error", "Error", datos.message || "Error al eliminar");
        }
    });
}

// 6. CONTROL DE FILTRADO DE BACKLOG
function filtrarBacklog(estadoFiltro, botonActivo) {
    const botones = document.querySelectorAll(".filter-tab-btn");
    botones.forEach((btn) => btn.classList.remove("active"));
    botonActivo.classList.add("active");

    const tarjetas = document.querySelectorAll("#contenedor-backlog-juegos .game-card-premium");

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