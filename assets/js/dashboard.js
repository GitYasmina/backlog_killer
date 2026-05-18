// se activa al pulsar los botones de las tarjetas
function actualizarJuego(idVideojuego, accion) {
    // si la acción es eliminar, pedimos confirmación antes de borrar
    if (accion === 'eliminar' && !confirm('¿Seguro que quieres borrar este juego de tu lista?')) {
        return; // Si cancela, paramos aquí
    }

    // enviamos los datos
    fetch('../app/update_game.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id_videojuego=' + idVideojuego + '&accion=' + accion
    })
    .then(res => res.json())
    .then(datos => {
        if (datos.status === 'success') {
            // evaluamos si el backend nos devolvió un logro desbloqueado
            if (datos.logro) {
                alert("🏆 ¡LOGRO DESBLOQUEADO! 🏆\n\nHas conseguido: " + datos.logro);
            }
            // refrescamos la página de forma segura después de cerrar el modal del alert
            location.reload();
        } else {
            alert(datos.message || 'Hubo un error al actualizar el juego');
        }
    });
}

// abre el modal de horas y pone el id del juego en un input oculto para usarlo luego al enviar el formulario
function cambiarHoras(idVideojuego) {
    document.getElementById('modal-juego-id').value = idVideojuego;
    document.getElementById('modal-horas-input').value = '';
    document.getElementById('modal-horas').classList.add('active');
}

// cierra el modal quitando la clase active
function cerrarModal() {
    document.getElementById('modal-horas').classList.remove('active');
}

// recoge los datos del modal y los envía por Fetch a PHP
function enviarHorasModal() {
    const idVideojuego = document.getElementById('modal-juego-id').value;
    let nuevasHoras = document.getElementById('modal-horas-input').value;

    if (nuevasHoras.trim() === "") return;

    nuevasHoras = parseInt(nuevasHoras);

    if (isNaN(nuevasHoras) || nuevasHoras <= 0) {
        alert("Por favor, introduce un número de horas mayor que cero.");
        return;
    }

    // cerramos el modal visualmente antes de recargar
    cerrarModal();

    // enviamos los datos al PHP para actualizar las horas jugadas de este juego
    fetch('../app/update_game.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id_videojuego=' + idVideojuego + '&accion=actualizar_horas&horas=' + nuevasHoras
    })
    .then(res => res.json())
    .then(datos => {
        if (datos.status === 'success') {
            // si la suma de horas provocó un autocompletado con logro
            if (datos.logro) {
                alert("🏆 ¡LOGRO DESBLOQUEADO! 🏆\n\nHas conseguido: " + datos.logro);
            } else if (datos.message) {
                // alerta informativa si se autocompletó el juego sin logro nuevo
                alert(datos.message);
            }
            location.reload();
        } else {
            alert(datos.message);
        }
    });
}