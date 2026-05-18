function girarRuleta() {
    const boton = document.getElementById('btn-girar');
    const pantalla = document.getElementById('pantalla-ruleta');
    const filtroGenero = document.getElementById('genero-ruleta');
    const filtroTiempo = document.getElementById('tiempo-ruleta');

    console.log("Todos los juegos cargados desde PHP:", juegosPendientes);

    const generoSeleccionado = filtroGenero ? filtroGenero.value : 'todos';
    const tiempoSeleccionado = filtroTiempo ? filtroTiempo.value : 'cualquiera';
    
    // filtro por género: si el usuario ha elegido uno específico, filtramos el array para quedarnos solo con esos juegos
    let juegosFiltrados = juegosPendientes;
    if (generoSeleccionado !== 'todos') {
        juegosFiltrados = juegosPendientes.filter(juego => juego.genero === generoSeleccionado);
    }

    console.log("Juegos tras filtrar por género:", juegosFiltrados);

    // filtro por duración: si el usuario ha elegido una duración específica, filtramos el array para quedarnos solo con esos juegos
    if (tiempoSeleccionado !== 'cualquiera') {
        juegosFiltrados = juegosFiltrados.filter(juego => {
            // pasamos a entero la duración estimada que nos trajimos de la BD
            const duracionTotal = parseInt(juego.duracion_estimada_horas) || 30;

            if (tiempoSeleccionado === 'corto') {
                return duracionTotal <= 15; // juegos cortitos o directos
            } else if (tiempoSeleccionado === 'medio') {
                return duracionTotal > 15 && duracionTotal <= 40; // juegos de duración estándar
            } else if (tiempoSeleccionado === 'largo') {
                return duracionTotal > 40; // campañas masivas o RPGs largos
            }
            return true;
        });
    }

    if (juegosFiltrados.length === 0) {
        pantalla.innerHTML = `
            <div class="empty-state">
                <p>No hay juegos en tu backlog que cumplan ambos requisitos a la vez. ¡Prueba a cambiar el tiempo o el género! 🎮</p>
            </div>
        `;
        return;
    }

    // bloqueamos botón para evitar doble clic
    boton.disabled = true;
    boton.innerText = "Eligiendo víctima...";

    let vueltas = 0;
    const velocidad = 100; // cambia de juego cada 100ms
    
    pantalla.innerHTML = '';

    // bucle que cambia el juego en pantalla simulando el giro
    const mapaSorteo = setInterval(() => {
        
        // pillamos un índice aleatorio del array
        const index = Math.floor(Math.random() * juegosFiltrados.length);
        const juego = juegosFiltrados[index];

        // pintamos la carta del juego en esta vuelta
        pantalla.innerHTML = `
            <div class="game-card game-card-spin">
                <img src="${juego.imagen_url || '../assets/img/no-image.png'}" class="game-poster-spin" alt="Portada">
                <div class="game-info">
                    <h3>${juego.titulo}</h3>
                </div>
            </div>
        `;

        vueltas++;

        // a las 20 vueltas (2 segundos), paramos
        if (vueltas >= 20) {
            clearInterval(mapaSorteo);
            
            boton.disabled = false;
            boton.innerText = "¡PROBAR OTRA VEZ!";
            
            
            pantalla.querySelector('.game-card').classList.add('ruleta-ganador-neon');
        }
    }, velocidad);
}