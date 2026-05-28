// paleta de colores gamer/oscuros alternados para las porciones físicas
const paletaColores = [
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#8b5cf6",
];
let gradosActuales = 0;
let estaGirando = false;
let juegosFiltrados = [];

// escuchamos el evento de carga para arrancar de forma segura tras renderizar el HTML
document.addEventListener("DOMContentLoaded", () => {
  const filtroGenero = document.getElementById("genero-ruleta");
  const filtroTiempo = document.getElementById("tiempo-ruleta");

  // primera maquetación de sectores
  actualizarPorcionesYFiltros();

  // eventos reactivos para actualizar los trozos al cambiar los selectores
  if (filtroGenero)
    filtroGenero.addEventListener("change", actualizarPorcionesYFiltros);
  if (filtroTiempo)
    filtroTiempo.addEventListener("change", actualizarPorcionesYFiltros);
});

function actualizarPorcionesYFiltros() {
  if (estaGirando) return;

  const disco = document.getElementById("disco-ruleta");
  const boton = document.getElementById("btn-girar");
  const filtroGenero = document.getElementById("genero-ruleta");
  const filtroTiempo = document.getElementById("tiempo-ruleta");

  if (!disco) return; // rompe la función si no encuentra la estructura en el DOM

  const generoSeleccionado = filtroGenero ? filtroGenero.value : "todos";
  const tiempoSeleccionado = filtroTiempo ? filtroTiempo.value : "cualquiera";

  // --- FILTRADO DE VIDEOJUEGOS ---
  juegosFiltrados = juegosPendientes || [];

  if (generoSeleccionado !== "todos") {
    juegosFiltrados = juegosPendientes.filter(
      (juego) => juego.genero === generoSeleccionado,
    );
  }

  if (tiempoSeleccionado !== "cualquiera") {
    juegosFiltrados = juegosFiltrados.filter((juego) => {
      const duracionTotal = parseInt(juego.duracion_estimada_horas) || 30;

      if (tiempoSeleccionado === "corto") {
        return duracionTotal <= 15;
      } else if (tiempoSeleccionado === "medio") {
        return duracionTotal > 15 && duracionTotal <= 40;
      } else if (tiempoSeleccionado === "largo") {
        return duracionTotal > 40;
      }
      return true;
    });
  }

  // si no hay juegos que cumplan los filtros, mostramos un mensaje en el disco y deshabilitamos el botón
  if (juegosFiltrados.length === 0) {
    disco.removeAttribute("style");
    disco.innerHTML = `
            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#9ca3af; font-size:0.85rem; text-align:center; width:80%; font-weight:bold;">
                No hay juegos que cumplan los requisitos. 🎮
            </div>
        `;
    if (boton) {
      boton.disabled = true;
      boton.innerText = "¡MATAR BACKLOG!";
    }
    return;
  }

  if (boton) boton.disabled = false;


  disco.style.transition = "none"; // quitamos la transición para reposicionar los sectores sin animación
  disco.style.transform = "rotate(0deg)"; // reseteamos la posición del disco a 0 grados para evitar acumulaciones extrañas de rotación
  gradosActuales = 0;
  disco.offsetHeight; // forzamos reflow para resetear la transición sin animación
  disco.style.transition = "transform 4.5s cubic-bezier(0.1, 0.8, 0.25, 1)"; // transición suave para el giro
  disco.innerHTML = ""; // limpiamos por completo el disco para reinyectar las porciones y textos


  const totalJuegos = juegosFiltrados.length;
  const gradosPorSector = 360 / totalJuegos;
  let gradienteConicoString = "conic-gradient(";

  juegosFiltrados.forEach((juego, index) => {
    const inicioGrados = index * gradosPorSector;
    const finGrados = (index + 1) * gradosPorSector;
    const color = paletaColores[index % paletaColores.length];

    gradienteConicoString += `${color} ${inicioGrados}deg ${finGrados}deg${index === totalJuegos - 1 ? "" : ", "}`;

    const divTexto = document.createElement("div");
    divTexto.className = "ruleta-porcion-texto";

    // calculo del angulo: sumamos 90 grados para que el texto quede centrado respecto a la aguja (que apunta hacia arriba, 0 grados)
    const anguloTexto = inicioGrados + gradosPorSector / 2 + 90;
    divTexto.style.transform = `rotate(${anguloTexto}deg)`;
    divTexto.textContent = juego.titulo;

    disco.appendChild(divTexto);
  });

  gradienteConicoString += ")";
  disco.style.background = gradienteConicoString;
}

// FUNCIÓN INLINE ACTIVADA POR EL ONCLICK DEL BOTÓN EN EL PHP
function girarRuleta() {
  if (estaGirando || juegosFiltrados.length === 0) return;

  const boton = document.getElementById("btn-generar");
  const disco = document.getElementById("disco-ruleta");

  if (!disco || !boton) return;

  estaGirando = true;
  boton.disabled = true;
  boton.innerText = "Eligiendo víctima...";

  const totalSectores = juegosFiltrados.length;
  const gradosPorSector = 360 / totalSectores;

  // Físicas: Forzamos 5 rotaciones íntegras (1800 grados) + compensación aleatoria
  const vueltasInercia = 5 * 360;
  const pellizcoAleatorio = Math.floor(Math.random() * 360);

  gradosActuales += vueltasInercia + pellizcoAleatorio;
  disco.style.transform = `rotate(${gradosActuales}deg)`;

  // Sincronización exacta con los 4.5 segundos del transition CSS
  setTimeout(() => {
    estaGirando = false;
    boton.disabled = false;
    boton.innerText = "¡PROBAR OTRA VEZ!";

    // Operación geométrica para detectar qué juego cayó apuntando a la aguja superior (Ángulo 0)
    const anguloNormalizado = (360 - (gradosActuales % 360)) % 360;
    const indiceGanador =
      Math.floor(anguloNormalizado / gradosPorSector) % totalSectores;
    const juegoElegido = juegosFiltrados[indiceGanador];

    mostrarPopUpGanador(juegoElegido);
  }, 4500);
}
// ==========================================================================
// LÓGICA DEL POPUP INTERACTIVO DE ACEPTACIÓN DE RETO DESTINO
// ==========================================================================

function mostrarPopUpGanador(juegoElegido) {
    // Vinculamos la ID que tu backend lee (id_videojuego)
    document.getElementById("reto-juego-id").value = juegoElegido.id_videojuego;
    document.getElementById("reto-juego-titulo").textContent = juegoElegido.titulo;
    
    // Mapeamos la URL de la carátula o dejamos la por defecto si viene vacía
    const imagenUrl = juegoElegido.imagen_url ? juegoElegido.imagen_url : '../assets/img/no-image.png';
    document.getElementById("reto-juego-imagen").src = imagenUrl;

    // Encendemos el modal premium con la clase active
    document.getElementById("modal-reto-destino").classList.add("active");
}

// Se ejecuta si el jugador le da a "¡Aceptar Reto y Jugar!"
function aceptarRetoDestino() {
    const idVideojuego = document.getElementById("reto-juego-id").value;
    
    // Cerramos el modal de golpe
    document.getElementById("modal-reto-destino").classList.remove("active");

    // Conectamos de forma asíncrona con tu update_game.php
    fetch("../app/update_game.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "id_videojuego=" + idVideojuego + "&accion=progreso",
    })
    .then((res) => res.json())
    .then((datos) => {
        if (datos.status === "success") {
            // Usamos la alerta premium global unificada de utils.js
            lanzarNotificacionGamer("exito", "RETO ACEPTADO ⚔", "El juego se ha movido a tu Backlog Activo. ¡Redireccionando!");
            
            // Redirección suave al dashboard para ver el progreso colocado
            setTimeout(() => {
                window.location.href = "dashboard.php";
            }, 1500);
        } else {
            lanzarNotificacionGamer("error", "Error", datos.message || "No se pudo actualizar el estado.");
        }
    });
}

// Se ejecuta si el usuario rechaza la propuesta del destino para volver a probar
function rechazarRetoDestino() {
    document.getElementById("modal-reto-destino").classList.remove("active");
    lanzarNotificacionGamer("exito", "DESTINO RECHAZADO 🎲", "Puedes volver a girar la ruleta cuando quieras.");
}
