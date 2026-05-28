/* ==========================================================================
   UTILIDADES GLOBALES: COMPONENTES REUTILIZABLES (utils.js)
   ========================================================================== */

/**
 * Lanza una notificación flotante premium estilo gamer en la pantalla.
 * @param {string} tipo - Puede ser 'exito' (verde), 'error' (rojo) o 'logro' (dorado/neón)
 * @param {string} titulo - El encabezado principal en mayúsculas
 * @param {string} mensaje - El texto descriptivo del aviso
 */
function lanzarNotificacionGamer(tipo, titulo, mensaje) {
    // 1. Evitamos duplicados: si ya hay un toast visible, lo eliminamos rápido para no saturar
    const toastViejo = document.querySelector(".toast-dinamico-premium");
    if (toastViejo) toastViejo.remove();

    // 2. Creamos el contenedor del Toast y le asignamos la clase según el tipo de notificación
    const toast = document.createElement("div");
    toast.className = `toast-dinamico-premium ${tipo}`;
    
    // 3. Asignamos el icono adecuado según el contexto
    let icono = "✔";
    if (tipo === "logro") icono = "🏆";
    if (tipo === "error") icono = "❌";

    // 4. Inyectamos la estructura HTML limpia
    toast.innerHTML = `
        <div class="toast-icono-box-dinamico">${icono}</div>
        <div class="toast-texto-box-dinamico">
            <h4>${titulo}</h4>
            <p>${mensaje}</p>
        </div>
    `;

    // 5. Lo añadimos al body para que aparezca en pantalla (el CSS se encargará de la animación de entrada)
    document.body.appendChild(toast);

    // 6. Animación de salida y autodestrucción automática a los 3.5 segundos
    setTimeout(() => {
        toast.style.animation = "desvanecerToastPremium 0.5s forwards ease-in-out";
        setTimeout(() => { 
            toast.remove(); 
        }, 500);
    }, 3500);
}