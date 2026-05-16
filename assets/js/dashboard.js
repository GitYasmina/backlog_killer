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