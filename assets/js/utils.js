/* ==========================================================================
   UTILIDADES GLOBALES: COMPONENTES COMPARTIDOS (utils.js)
   ========================================================================== */
/**
 * lanza un aviso flotante premium neón en cualquier parte de la aplicación.
 * @param {string} tipo - 'exito', 'logro' o 'error'
 * @param {string} tituloAlert - Encabezado principal del Toast
 * @param {string} mensajeAlert - Descripción o cuerpo del mensaje
 */
function lanzarNotificacionGamer(tipo, tituloAlert, mensajeAlert) {
    const toast = document.createElement("div");
    toast.className = `toast-dinamico-premium ${tipo}`;
    
    let icono = "✔";
    if (tipo === "logro") icono = "🏆";
    if (tipo === "error") icono = "❌";

    toast.innerHTML = `
        <div class="toast-icono-box-dinamico">${icono}</div>
        <div class="toast-texto-box-dinamico">
            <h4>${tituloAlert}</h4>
            <p>${mensajeAlert}</p>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "desvanecerToastPremium 0.5s forwards ease-in-out";
        setTimeout(() => { toast.remove(); }, 500);
    }, 4000);
}