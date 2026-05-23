// se activa al pulsar los botones de las tarjetas
function actualizarJuego(idVideojuego, accion) {
  // si el usuario quiere terminar el juego, abrimos el modal de reseña en lugar de enviar directamente
  if (accion === "terminado") {
    mostrarModalResena(idVideojuego);
    return;
  }
  // si la acción es eliminar, pedimos confirmación antes de borrar
  if (
    accion === "eliminar" &&
    !confirm("¿Seguro que quieres borrar este juego de tu lista?")
  ) {
    return; // Si cancela, paramos aquí
  }

  // enviamos los datos
  fetch("../app/update_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id_videojuego=" + idVideojuego + "&accion=" + accion,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        // evaluamos si el backend nos devolvió un logro desbloqueado
        if (datos.logro) {
          alert("🏆 ¡LOGRO DESBLOQUEADO! 🏆\n\nHas conseguido: " + datos.logro);
        }
        // refrescamos la página de forma segura después de cerrar el modal del alert
        location.reload();
      } else {
        alert(datos.message || "Hubo un error al actualizar el juego");
      }
    });
}
// MODAL DE HORAS: funciones para abrir, cerrar y enviar los datos del modal de horas al backend
// abre el modal de horas y pone el id del juego en un input oculto para usarlo luego al enviar el formulario
function cambiarHoras(idVideojuego) {
  document.getElementById("modal-juego-id").value = idVideojuego;
  document.getElementById("modal-horas-input").value = "";
  document.getElementById("modal-horas").classList.add("active");
}

// cierra el modal quitando la clase active
function cerrarModal() {
  document.getElementById("modal-horas").classList.remove("active");
}

// recoge los datos del modal y los envía por Fetch a PHP
function enviarHorasModal() {
  const idVideojuego = document.getElementById("modal-juego-id").value;
  let nuevasHoras = document.getElementById("modal-horas-input").value;

  if (nuevasHoras.trim() === "") return;

  nuevasHoras = parseInt(nuevasHoras);

  if (isNaN(nuevasHoras) || nuevasHoras <= 0) {
    alert("Por favor, introduce un número de horas mayor que cero.");
    return;
  }

  // cerramos el modal visualmente antes de recargar
  cerrarModal();

  // enviamos los datos al PHP para actualizar las horas jugadas de este juego
  fetch("../app/update_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "id_videojuego=" +
      idVideojuego +
      "&accion=actualizar_horas&horas=" +
      nuevasHoras,
  })
    .then((res) => res.json())
    .then((datos) => {
      if (datos.status === "success") {
        // si la suma de horas provocó un autocompletado con logro
        if (datos.logro) {
          alert("🏆 ¡LOGRO DESBLOQUEADO! 🏆\n\nHas conseguido: " + datos.logro);
        } else if (datos.message) {
          // alerta informativa si se autocompletó el juego sin logro nuevo
          alert(datos.message);
        }
        location.reload();
      } else {
        alert(datos.message);
      }
    });

  //MODAL DE RESEÑA: funciones para abrir, cerrar y enviar los datos del modal de reseña al backend

  // abre el modal de la reseña, resetea el formulario y guarda el id del videojuego
  function mostrarModalResena(idVideojuego) {
    document.getElementById("modal-resena-juego-id").value = idVideojuego;
    document.getElementById("modal-comentario-input").value = "";

    // desmarcamos las estrellas que estuvieran seleccionadas de antes
    const estrellas = document.querySelectorAll('input[name="puntuacion"]');
    estrellas.forEach((radio) => (radio.checked = false));

    document.getElementById("modal-resena").classList.add("active");
  }

  // cierra el modal de la reseña y recarga la página para mover el juego de sección
  function cerrarModalResena() {
    document.getElementById("modal-resena").classList.remove("active");
    location.reload();
  }

  // recopila las estrellas y el texto del modal para mandarlos mediante Fetch a PHP
  function enviarResenaModal() {
    const idVideojuego = document.getElementById("modal-resena-juego-id").value;
    const comentario = document.getElementById("modal-comentario-input").value;

    // buscamos qué estrella ha pulsado el usuario
    const estrellaSeleccionada = document.querySelector(
      'input[name="puntuacion"]:checked',
    );
    const nota = estrellaSeleccionada ? estrellaSeleccionada.value : "";

    // cerramos el modal visualmente antes de la petición
    document.getElementById("modal-resena").classList.remove("active");

    // enviamos la valoración al backend
    fetch("../app/update_game.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:
        "id_videojuego=" +
        idVideojuego +
        "&accion=terminado&nota=" +
        nota +
        "&resena=" +
        encodeURIComponent(comentario),
    })
      .then((res) => res.json())
      .then((datos) => {
        if (datos.status === "success") {
          // evaluamos si la reseña o el fin de juego otorgaron un logro
          if (datos.logro) {
            alert(
              "🏆 ¡LOGRO DESBLOQUEADO! 🏆\n\nHas conseguido: " + datos.logro,
            );
          }
          location.reload();
        } else {
          alert(datos.message || "Hubo un error al guardar la reseña");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        location.reload();
      });
  }
  
  //MODAL DE CONTRATOS: funciones para abrir, cerrar y enviar los datos del modal de contratos al backend
  // abre el modal para redactar el contrato semanal
  function abrirModalContrato() {
    document.getElementById("contrato-objetivo").value = "";
    document.getElementById("modal-contrato").classList.add("active");
  }

  // cierra el modal de contratos
  function cerrarModalContrato() {
    document.getElementById("modal-contrato").classList.remove("active");
  }

  // recoge los datos del formulario y crea el contrato en el servidor
  function enviarContratoModal() {
    const idVideojuego = document.getElementById("contrato-juego").value;
    const objetivo = document.getElementById("contrato-objetivo").value;

    // validacion basica para evitar campos vacios
    if (idVideojuego === "" || objetivo.trim() === "") {
      alert("Por favor, selecciona un videojuego activo y describe tu meta.");
      return;
    }

    cerrarModalContrato();

    // enviamos los datos al backend con una accion especifica
    fetch("../app/controlador_contratos.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:
        "accion=crear&id_videojuego=" +
        idVideojuego +
        "&objetivo=" +
        encodeURIComponent(objetivo),
    })
      .then((res) => res.json())
      .then((datos) => {
        if (datos.status === "success") {
          location.reload();
        } else {
          alert(datos.message || "Error al firmar el contrato");
        }
      });
  }

  // se activa al pulsar el check verde: completa la meta y otorga XP
  function completarContrato(idContrato) {
    if (
      !confirm(
        "¿Has cumplido con éxito tu meta semanal? ¡Se sumará la experiencia!",
      )
    )
      return;

    fetch("../app/controlador_contratos.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "accion=completar&id_contrato=" + idContrato,
    })
      .then((res) => res.json())
      .then((datos) => {
        if (datos.status === "success") {
          // si al completar la mision el usuario sube de nivel, el backend nos avisara si hay logro
          if (datos.logro) {
            alert(
              "🏆 ¡LOGRO DESBLOQUEADO! 🏆\n\nHas conseguido: " + datos.logro,
            );
          } else {
            alert("💰 ¡Contrato cumplido! Has recibido +30 XP.");
          }
          location.reload();
        } else {
          alert(datos.message || "Error al completar el contrato");
        }
      });
  }
  // se activa al pulsar la papelera: elimina el contrato sin penalizacion
  function cancelarContrato(idContrato) {
    if (
      !confirm(
        "¿Seguro que quieres romper este contrato? No recibirás penalización, pero perderás tu progreso actual.",
      )
    )
      return;

    fetch("../app/controlador_contratos.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "accion=cancelar&id_contrato=" + idContrato,
    })
      .then((res) => res.json())
      .then((datos) => {
        if (datos.status === "success") {
          location.reload();
        } else {
          alert(datos.message || "Error al cancelar el contrato");
        }
      });
  }
}
