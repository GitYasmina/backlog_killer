function girarRuleta() {
    const boton = document.getElementById('btn-girar');
    const pantalla = document.getElementById('pantalla-ruleta');
    
    if (juegosPendientes.length === 0) return;

    // bloqueamos botón para evitar doble clic
    boton.disabled = true;
    boton.innerText = "Eligiendo víctima...";

    let vueltas = 0;
    const velocidad = 100; // cambia de juego cada 100ms
    
    pantalla.innerHTML = '';

    // bucle que cambia el juego en pantalla simulando el giro
    const mapaSorteo = setInterval(() => {
        
        // pillamos un índice aleatorio del array
        const index = Math.floor(Math.random() * juegosPendientes.length);
        const juego = juegosPendientes[index];

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