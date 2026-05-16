const apiKey = "aef2891fedb5434d9e1e3dd95e29f11d";

// se activa cada vez que escribimos en el buscador
function buscar() {
  var texto = document.getElementById("game-search").value;
  var contenedor = document.getElementById("search-results");

  // si hay menos de 3 letras, no hace nada
  if (texto.length < 3) return;

  // conexión a la API de RAWG
  fetch("https://api.rawg.io/api/games?key=" + apiKey + "&search=" + texto + "&page_size=6")
    .then((res) => res.json())
    .then((datos) => {
      contenedor.innerHTML = ""; // Limpiamos resultados anteriores

      // recorremos los resultados para las tarjetas
      datos.results.forEach((juego) => {
        // capturamos el primer género y la primera plataforma de forma segura
        var generoReal = juego.genres && juego.genres.length > 0 ? juego.genres[0].name : "Desconocido";
        var plataformaReal = juego.platforms && juego.platforms.length > 0 ? juego.platforms[0].platform.name : "PC";
        var duracionReal = juego.playtime || 30; // Si viene a 0, le damos 30h estimadas por defecto

        // escapamos comillas simples en el título para que no rompa el onclick del HTML
        var tituloEscapado = juego.name.replace(/'/g, "\\'");

        var card = `
        <div class="game-card">
            <img src="${juego.background_image || "../assets/img/no-image.png"}" class="game-poster">
            <div class="game-info">
                <h3>${juego.name}</h3>
                <span class="game-tag">${generoReal} | ${plataformaReal}</span>
                <button onclick="añadir('${juego.id}', '${tituloEscapado}', '${juego.background_image}', '${generoReal}', ${duracionReal}, '${plataformaReal}')" class="btn-add">
                    Añadir a mi lista
                </button>
            </div>
        </div>
    `;
        contenedor.innerHTML += card;
      });
    });
}

// recibe género, duración y plataforma, y se los envía por POST a PHP
function añadir(idApi, titulo, imagen, genero, duracion, plataforma) {
  fetch("../app/add_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id_api=" + idApi + 
          "&titulo=" + encodeURIComponent(titulo) + 
          "&imagen=" + encodeURIComponent(imagen) +
          "&genero=" + encodeURIComponent(genero) +
          "&duracion=" + duracion +
          "&plataforma=" + encodeURIComponent(plataforma),
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        alert("¡" + titulo + " guardado en tu biblioteca!");
      } else {
        alert("Este juego ya lo tienes o hubo un error.");
      }
    });
}

// escucha las pulsaciones de teclas en el input de búsqueda
document.getElementById("game-search").addEventListener("keyup", buscar);