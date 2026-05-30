const apiKey = "aef2891fedb5434d9e1e3dd95e29f11d";

// diccionario para traducir los géneros principales de RAWG
const traduccionGeneros = {
  Action: "Acción",
  Strategy: "Estrategia",
  RPG: "RPG / Rol",
  Shooter: "Shooter / Tiros",
  Adventure: "Aventura",
  Puzzle: "Puzle",
  Racing: "Carreras",
  Sports: "Deportes",
  Simulation: "Simulación",
  Fighting: "Lucha",
  Platformer: "Plataformas",
  "Massively Multiplayer": "MMO / Multijugador",
  Indie: "Indie",
  Arcade: "Arcade",
};

// se activa cada vez que escribimos en el buscador, pero con un sistema de debounce para no saturar la API
function buscar() {
  const texto = document.getElementById("game-search").value.trim();
  const contenedor = document.getElementById("search-results");
  const spinner = document.getElementById("loading-spinner");

  if (texto.length < 3) {
    contenedor.innerHTML = `
      <div class="empty-state-buscador">
          <p>Escribe el nombre de un videojuego arriba para buscar... 🚀</p>
      </div>`;
    spinner.style.display = "none";
    return;
  }

  spinner.style.display = "block";
  contenedor.innerHTML = `<div class="empty-state-buscador"><p>Consultando con RAWG...</p></div>`;

  fetch(
    `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(texto)}&page_size=6`,
  )
    .then((res) => res.json())
    .then((datos) => {
      spinner.style.display = "none";

      if (!datos.results || datos.results.length === 0) {
        contenedor.innerHTML = `
          <div class="empty-state-buscador">
              <p>❌ No se ha encontrado ningún videojuego llamado "${texto}" en la base de datos de RAWG. Revisa si está bien escrito.</p>
          </div>`;
        return;
      }

      contenedor.innerHTML = "";
      // obtenemos la lista de IDs de juegos que el usuario ya tiene en su biblioteca para marcar los que ya posee
      datos.results.forEach((juego) => {
        const generoAPI = juego.genres && juego.genres.length > 0 ? juego.genres[0].name : "Desconocido";
        const generoReal = traduccionGeneros[generoAPI] || generoAPI;
        const duracionReal = juego.playtime || 30;
        const tituloLimpio = juego.name.replace(/"/g, "&quot;");
        
        // convertimos la ID que viene de internet a número puro para buscarla en el array local
        const idBuscada = Number(juego.id);
        const yaLoTengo = misJuegosBiblioteca.includes(idBuscada);
        
        let botonAccionHTML = "";

        if (yaLoTengo) {
            // Caso A: El juego ya existe en estados_juego para este usuario
            botonAccionHTML = `
                <a href="dashboard.php" class="btn-add-buscador-premium ya-aniadido" style="text-decoration: none; text-align: center; display: block;">
                    📦 En Biblioteca
                </a>
            `;
        } else {
            // Caso B: El juego no está en su biblioteca, ponemos tu botón morado original
            botonAccionHTML = `
                <button 
                    class="btn-add-buscador-premium"
                    data-id="${juego.id}"
                    data-titulo="${tituloLimpio}"
                    data-imagen="${juego.background_image || ""}"
                    data-genero="${generoReal}"
                    data-duracion="${duracionReal}"
                    onclick="manejadorAñadir(this)">
                    ➕ Añadir a mi lista
                </button>
            `;
        }
        
        // Renderizamos tu tarjeta con el botón condicional mapeado
        const card = `
        <div class="buscador-game-card">
            <div class="buscador-poster-wrapper">
                <img src="${juego.background_image || "../assets/img/no-image.png"}" alt="${tituloLimpio}">
            </div>
            <div class="buscador-info-box">
                <h3>${tituloLimpio}</h3>
                <span class="buscador-tag-genero">${generoReal}</span>
                ${botonAccionHTML}
            </div>
        </div>
        `;
        contenedor.innerHTML += card;
      });
    })
    .catch((err) => {
      console.error("Error al conectar con RAWG:", err);
      spinner.style.display = "none";
      contenedor.innerHTML = `
        <div class="empty-state-buscador">
            <p>⚠ Hubo un problema de conexión con la API de RAWG. Inténtalo de nuevo en unos instantes.</p>
        </div>`;
    });
}

function manejadorAñadir(boton) {
  const idApi = boton.getAttribute("data-id");
  const titulo = boton.getAttribute("data-titulo");
  const imagen = boton.getAttribute("data-imagen");
  const genero = boton.getAttribute("data-genero");
  const duracion = boton.getAttribute("data-duracion");

  añadir(idApi, titulo, imagen, genero, duracion);
}

// Envío de datos asíncrono modificado sin un solo alert nativo
function añadir(idApi, titulo, imagen, genero, duracion) {
  fetch("../app/add_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id_api=${idApi}&titulo=${encodeURIComponent(titulo)}&imagen=${encodeURIComponent(imagen)}&genero=${encodeURIComponent(genero)}&duracion=${duracion}`,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        if (datos.logro) {
          // Lanza el aviso premium de Logro
          lanzarNotificacionGamer(
            "logro",
            "¡LOGRO DESBLOQUEADO!",
            `Has conseguido: ${datos.logro}`,
          );
        } else {
          // Lanza el aviso premium de éxito normal
          lanzarNotificacionGamer(
            "exito",
            "Biblioteca Actualizada",
            `¡${titulo} se ha guardado correctamente!`,
          );
        }
      } else {
        // Lanza el aviso de error
        lanzarNotificacionGamer(
          "error",
          "Acción Cancelada",
          datos.message || "Este juego ya está en tu biblioteca.",
        );
      }
    });
}

let temporizadorDebounce;

document.addEventListener("DOMContentLoaded", () => {
  const inputBuscar = document.getElementById("game-search");

  if (inputBuscar) {
    // En vez de llamar a buscar() a lo loco, controlamos el flujo
    inputBuscar.addEventListener("keyup", () => {
      // Borramos el temporizador anterior si el usuario sigue tecleando rápido
      clearTimeout(temporizadorDebounce);

      // Creamos uno nuevo. Solo si pasa medio segundo sin teclear, se ejecuta la búsqueda
      temporizadorDebounce = setTimeout(() => {
        buscar();
      }, 500); // 500 milisegundos de tregua para la API
    });
  }
});
