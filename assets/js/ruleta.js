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
let anguloActual = 0; // Control de rotación en radianes para el Canvas
let estaGirando = false;
let juegosFiltrados = [];
let canvas, ctx;

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

  const filtroGenero = document.getElementById("genero-ruleta");
  const filtroTiempo = document.getElementById("tiempo-ruleta");
  const boton = document.getElementById("btn-generar") || document.getElementById("btn-girar"); 

  canvas = document.getElementById("canvas-ruleta");
  if (!canvas) return;
  ctx = canvas.getContext("2d");

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

  // CASO A: Si no hay juegos que cumplan los filtros
  if (juegosFiltrados.length === 0) {
    if (boton) {
      boton.disabled = true;
      boton.innerText = "¡SIN VÍCTIMAS!";
      boton.style.opacity = "0.5";
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#21262d";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, (canvas.width / 2) - 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "#8b949e";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No quedan misiones con estos filtros 🎈", canvas.width / 2, canvas.height / 2);
    return;
  }

  // CASO B: Si SÍ hay juegos válidos, reactivamos el CTA
  if (boton) {
    boton.disabled = false;
    boton.innerText = "¡MATAR BACKLOG!";
    boton.style.opacity = "1";
  }

  anguloActual = 0;
  dibujarRuletaCanvas();
}

// 🎨 EL MOTOR GRÁFICO CANVAS PREMIUM (Recorte matemático inteligente)
function dibujarRuletaCanvas() {
  if (!canvas || !ctx) return;
  
  const totalSectores = juegosFiltrados.length;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radio = cx - 10;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const arcoSector = (2 * Math.PI) / totalSectores;

  for (let i = 0; i < totalSectores; i++) {
    let anguloInicio = anguloActual + i * arcoSector;
    let anguloFin = anguloInicio + arcoSector;

    // 1. DIBUJAR LA PORCIÓN DE COLOR
    ctx.beginPath();
    ctx.fillStyle = paletaColores[i % paletaColores.length];

    if (totalSectores === 1) {
      ctx.arc(cx, cy, radio, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radio, anguloInicio, anguloFin);
      ctx.lineTo(cx, cy);
      ctx.fill();
      
      ctx.strokeStyle = "#161b22";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 2. 🚀 REDISEÑO RADIAL: TRUNCADO INTELIGENTE POR PÍXELES
    ctx.save();
    ctx.translate(cx, cy);
    
    let anguloCentro = anguloInicio + arcoSector / 2;
    let anguloNormalizado = anguloCentro % (2 * Math.PI);
    if (anguloNormalizado < 0) anguloNormalizado += 2 * Math.PI;

    ctx.rotate(anguloCentro);
    
    let tamanoFuente = 16;
    if (totalSectores > 5) tamanoFuente = 14;
    if (totalSectores > 8) tamanoFuente = 13;
    ctx.font = `bold ${tamanoFuente}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textBaseline = "middle";
    
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "#ffffff";

    let tituloFormateado = juegosFiltrados[i].titulo;
    
    // 🛡️ RECORTE MATEMÁTICO AL MILÍMETRO:
    // Calculamos el espacio físico real que hay entre el círculo negro y el borde de la ruleta
    const margenCentro = 45; // Distancia de seguridad para el núcleo
    const margenBorde = 15;  // Distancia de seguridad para no salirse de la pantalla
    const anchoMaximo = radio - margenCentro - margenBorde;

    // Medimos con la "cinta métrica" de JS. Si se pasa de ancho, cortamos letra a letra.
    if (ctx.measureText(tituloFormateado).width > anchoMaximo) {
        while (ctx.measureText(tituloFormateado + "...").width > anchoMaximo && tituloFormateado.length > 0) {
            tituloFormateado = tituloFormateado.slice(0, -1);
        }
        tituloFormateado += "...";
    }

    if (anguloNormalizado > Math.PI / 2 && anguloNormalizado < (3 * Math.PI) / 2) {
      // MITAD IZQUIERDA: Girado para que no se lea boca abajo
      ctx.rotate(Math.PI); 
      ctx.textAlign = "right"; 
      ctx.fillText(tituloFormateado, -margenCentro, 0); 
    } else {
      // MITAD DERECHA: Se lee normal
      ctx.textAlign = "left"; 
      ctx.fillText(tituloFormateado, margenCentro, 0); 
    }

    ctx.restore();
  }

  // 3. NÚCLEO CENTRAL
  ctx.beginPath();
  ctx.fillStyle = "#161b22";
  ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.fillStyle = "#21262d";
  ctx.arc(cx, cy, 12, 0, 2 * Math.PI);
  ctx.fill();
}
// FUNCIÓN DE GIRO PREMIUM (Físicas elásticas continuas)
function girarRuleta() {
  if (estaGirando || juegosFiltrados.length === 0) return;

  const boton = document.getElementById("btn-generar") || document.getElementById("btn-girar");
  if (boton) {
    boton.disabled = true;
    boton.innerText = "Eligiendo víctima...";
  }

  estaGirando = true;

  const totalSectores = juegosFiltrados.length;
  const arcoSector = (2 * Math.PI) / totalSectores;

  // 1. Elección previa en frío
  const indiceGanador = Math.floor(Math.random() * totalSectores);
  const juegoElegido = juegosFiltrados[indiceGanador];

  // 2. Ajuste angular inverso hacia la aguja superior (1.5 * Math.PI)
  const anguloFrenoSuperior = (1.5 * Math.PI) - (indiceGanador * arcoSector + arcoSector / 2);

  // Inyectamos 6 vueltas completas fijas de pura inercia
  const vueltasInercia = 12 * Math.PI;
  const rotacionTotalObjetivo = vueltasInercia + anguloFrenoSuperior;

  let tiempoInicio = null;
  const duracionAnimacion = 4500; // 4.5 segundos de puro deslizamiento suave

  function procesarFrameRuleta(tiempoActual) {
    if (!tiempoInicio) tiempoInicio = tiempoActual;
    const progreso = tiempoActual - tiempoInicio;

    // Easing cúbico de desaceleración (fricción real)
    const factorFrenado = 1 - Math.pow(1 - Math.min(progreso / duracionAnimacion, 1), 3);
    
    anguloActual = rotacionTotalObjetivo * factorFrenado;
    dibujarRuletaCanvas();

    if (progreso < duracionAnimacion) {
      requestAnimationFrame(procesarFrameRuleta);
    } else {
      estaGirando = false;
      if (boton) {
        boton.disabled = false;
        boton.innerText = "¡PROBAR OTRA VEZ!";
      }

      anguloActual = anguloActual % (2 * Math.PI);
      mostrarPopUpGanador(juegoElegido);
    }
  }

  requestAnimationFrame(procesarFrameRuleta);
}

function mostrarPopUpGanador(juegoElegido) {
  document.getElementById("reto-juego-id").value = juegoElegido.id_videojuego;
  document.getElementById("reto-juego-titulo").textContent = juegoElegido.titulo;
  const imagenUrl = juegoElegido.imagen_url ? juegoElegido.imagen_url : "../assets/img/no-image.png";
  document.getElementById("reto-juego-imagen").src = imagenUrl;
  document.getElementById("modal-reto-destino").classList.add("active");
}

function aceptarRetoDestino() {
  const idVideojuego = document.getElementById("reto-juego-id").value;
  document.getElementById("modal-reto-destino").classList.remove("active");

  fetch("../app/update_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id_videojuego=" + idVideojuego + "&accion=progreso",
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        lanzarNotificacionGamer("exito", "RETO ACEPTADO ⚔", "El juego se ha movido a tu Backlog Activo.");
        setTimeout(() => { window.location.href = "dashboard.php"; }, 1500);
      } else {
        lanzarNotificacionGamer("error", "Error", datos.message || "No se pudo actualizar el estado.");
      }
    });
}

function rechazarRetoDestino() {
  document.getElementById("modal-reto-destino").classList.remove("active");
  lanzarNotificacionGamer("exito", "DESTINO RECHAZADO 🎲", "Puedes volver a girar la ruleta cuando quieras.");
}