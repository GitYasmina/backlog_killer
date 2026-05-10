const apiKey = 'aef2891fedb5434d9e1e3dd95e29f11d';

// esta función se activa cada vez que escribimos en el buscador
function buscar() {
    var texto = document.getElementById('game-search').value;
    var contenedor = document.getElementById('search-results');

    // si hay menos de 3 letras, no hacemos nada
    if (texto.length < 3) return;

    // conexion a la API de RAWG para buscar juegos por nombre
    fetch('https://api.rawg.io/api/games?key=' + apiKey + '&search=' + texto + '&page_size=6')
        .then(res => res.json())
        .then(datos => {
            contenedor.innerHTML = ""; // limpiamos resultados anteriores

            // recorremos los resultados y los mostramos en tarjetitas
            datos.results.forEach(juego => {
                // creamos el diseño de la tarjetita
                var card = `
                    <div class="game-card">
                        <img src="${juego.background_image}" style="width:100%">
                        <div class="game-info">
                            <h3>${juego.name}</h3>
                            <button onclick="añadir('${juego.id}', '${juego.name}')" class="btn-add">
                                Añadir a mi lista
                            </button>
                        </div>
                    </div>
                `;
                contenedor.innerHTML += card;
            });
        });
}

// esta función enviará el juego a PHP para guardarlo
function añadir(id, titulo) {
    // por ahora, solo lanzamos un aviso con el nombre del juego y su ID
    alert("Has elegido: " + titulo + " (ID: " + id + ")");
    
    //haremos la llamada a PHP para guardar el juego en la base de datos del usuario
}

// escuchamos cuando el usuario suelta una tecla en el input
document.getElementById('game-search').addEventListener('keyup', buscar);