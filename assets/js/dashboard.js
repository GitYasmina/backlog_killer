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
            // si  PHP dice que ok, refrescamos la página para ver los cambios
            location.reload();
        } else {
            alert(datos.message || 'Hubo un error al actualizar el juego');
        }
    });
}

// función para pedir las horas reales jugadas al usuario
function cambiarHoras(idVideojuego) {
    let nuevasHoras = prompt("¿Cuántas horas totales llevas jugadas a este juego?:");

    // si cancela o acepta en blanco, salimos
    if (nuevasHoras === null || nuevasHoras.trim() === "") return;

    nuevasHoras = parseInt(nuevasHoras);

    // validamos que sea un número entero positivo
    if (isNaN(nuevasHoras) || nuevasHoras < 0) {
        alert("Por favor, introduce un número de horas válido.");
        return;
    }

    // envio de datos a PHP para actualizar las horas en la base de datos
    fetch('../app/update_game.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id_videojuego=' + idVideojuego + '&accion=actualizar_horas&horas=' + nuevasHoras
    })
    .then(res => res.json())
    .then(datos => {
        if (datos.status === 'success') {
            location.reload(); // refrescamos para ver la barra actualizada
        } else {
            alert(datos.message);
        }
    });
}