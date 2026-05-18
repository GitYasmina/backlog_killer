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
        var generoReal = juego.genres && juego.genres.length > 0 ? juego.genres[0].name : "Desconocido";
        var duracionReal = juego.playtime || 30;

        // creamos la tarjeta guardando las variables de forma segura en atributos data-*
        var card = `
        <div class="game-card">
            <img src="${juego.background_image || "../assets/img/no-image.png"}" class="game-poster">
            <div class="game-info">
                <h3>${juego.name}</h3>
                <span class="game-tag">${generoReal}</span>
                <button 
                    class="btn-add"
                    data-id="${juego.id}"
                    data-titulo="${juego.name.replace(/"/g, '&quot;')}"
                    data-imagen="${juego.background_image || ''}"
                    data-genero="${generoReal}"
                    data-duracion="${duracionReal}"
                    onclick="manejadorAñadir(this)">
                    Añadir a mi lista
                </button>
            </div>
        </div>
    `;
        contenedor.innerHTML += card;
      });
    });
}

// función intermedia que recupera los datos del botón de forma nativa y segura
function manejadorAñadir(boton) {
  const idApi = boton.getAttribute('data-id');
  const titulo = boton.getAttribute('data-titulo');
  const imagen = boton.getAttribute('data-imagen');
  const genero = boton.getAttribute('data-genero');
  const duracion = boton.getAttribute('data-duracion');

  // llamamos a la función de envío pasándole los datos limpios
  añadir(idApi, titulo, imagen, genero, duracion);
}

// funcion que envía los datos recogidos por POST a PHP
function añadir(idApi, titulo, imagen, genero, duracion) {
  fetch("../app/add_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id_api=" + idApi + 
          "&titulo=" + encodeURIComponent(titulo) + 
          "&imagen=" + encodeURIComponent(imagen) +
          "&genero=" + encodeURIComponent(genero) +
          "&duracion=" + duracion,
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