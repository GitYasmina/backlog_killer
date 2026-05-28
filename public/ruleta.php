<?php
session_start();

// si no está logueado, al login
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

include '../views/header.php';
require_once '../app/db.php';

$user_id = $_SESSION['user_id'];

// buscamos el género favorito del usuario
$stmt_user = $conexion->prepare("SELECT genero_fav FROM usuarios WHERE id = ?");
$stmt_user->execute([$user_id]);
$user_data = $stmt_user->fetch();
$genero_fav = $user_data['genero_fav'] ?? '';

// añadimos ej.id_videojuego a la query para que JS pueda enviárselo al backend
$stmt = $conexion->prepare("
    SELECT ej.id_videojuego, v.titulo, v.imagen_url, v.genero, v.duracion_estimada_horas 
    FROM estados_juego ej
    JOIN videojuegos v ON ej.id_videojuego = v.id
    WHERE ej.id_usuario = ? AND ej.estado = 'pendiente'
");
$stmt->execute([$user_id]);
$pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

// extraemos los géneros únicos para el filtro, ordenados alfabéticamente
$generos_existentes = array_unique(array_column($pendientes, 'genero'));
sort($generos_existentes);
?>

<main class="dashboard-container ruleta-page-layout">
    
    <div class="ruleta-panel-control">
        <div class="ruleta-txt-header">
            <h2>🎲 Backlog Killer</h2>
            <p>¿No sabes a qué jugar hoy? Filtra tu biblioteca pendiente y deja que el azar elija tu próxima víctima.</p>
        </div>

        <?php if (!empty($pendientes)): ?>
            <div class="filtro-ruleta-bloque">
                <div class="form-group">
                    <label for="genero-ruleta">¿Qué te apetece jugar hoy?</label>
                    <select id="genero-ruleta" class="select-ruleta-nueva">
                        <option value="todos" <?= ($genero_fav == '') ? 'selected' : '' ?>>Cualquier género (Todos)</option>
                        <?php foreach ($generos_existentes as $gen): 
                            $es_favorito = (strtolower($gen) === strtolower($genero_fav));
                        ?>
                            <option value="<?= htmlspecialchars($gen) ?>" <?= $es_favorito ? 'selected' : '' ?>>
                                <?= htmlspecialchars($gen) ?> <?= $es_favorito ? '⭐ (Tu preferido)' : '' ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="form-group">
                    <label for="tiempo-ruleta">¿De cuánto tiempo dispones?</label>
                    <select id="tiempo-ruleta" class="select-ruleta-nueva">
                        <option value="cualquiera" selected>Tengo tiempo indefinido ☕</option>
                        <option value="corto">Campañas cortas (Menos de 15h) ⚡</option>
                        <option value="medio">Campañas normales (15h a 40h) 🎮</option>
                        <option value="largo">Campañas masivas / RPGs (Más de 40h) 🔥</option>
                    </select>
                </div>
            </div>
        <?php endif; ?>

        <div class="ruleta-btn-contenedor">
            <?php if (empty($pendientes)): ?>
                <div class="empty-state">
                    <p>No tienes juegos pendientes o en progreso en tu lista.</p>
                    <a href="buscar_juego.php" class="btn-cta">Añadir juegos primero</a>
                </div>
            <?php else: ?>
                <button id="btn-generar" class="btn-cta-ruleta" onclick="girarRuleta()">¡MATAR BACKLOG!</button>
            <?php endif; ?>
        </div>
    </div>

    <div class="ruleta-panel-visual">
        <?php if (!empty($pendientes)): ?>
            <div class="ruleta-wrapper">
                <div class="ruleta-puntero"></div>
                <div id="disco-ruleta" class="ruleta-disco"></div>
                <div class="ruleta-centro"></div>
            </div>
        <?php endif; ?>
    </div>

</main>

<div id="modal-reto-destino" class="modal-overlay">
    <div class="modal-content modal-reto-premium">
        <div class="modal-reto-badge">🎰 ¡RETADO POR EL DESTINO!</div>
        
        <div class="reto-poster-wrapper">
            <img id="reto-juego-imagen" src="../assets/img/no-image.png" alt="Portada del juego">
        </div>
        
        <h3 id="reto-juego-titulo">Nombre del juego</h3>
        <p>¿Aceptas el desafío del destino y lo mueves a tus juegos en curso, o vas a procrastinar y prefieres volver a girar?</p>
        
        <input type="hidden" id="reto-juego-id">

        <div class="modal-actions-vertical">
            <button onclick="aceptarRetoDestino()" class="btn-modal-save btn-reto-accept">⚡ ¡Aceptar Reto y Jugar!</button>
            <button onclick="rechazarRetoDestino()" class="btn-modal-cancel btn-reto-retry">🎲 Volver a probar suerte</button>
        </div>
    </div>
</div>

<script>
    // pasamos el array de PHP a JavaScript de forma segura para que la ruleta pueda usarlo
    const juegosPendientes = <?php echo json_encode($pendientes); ?>;
</script>

<script src="../assets/js/utils.js"></script>
<script src="../assets/js/ruleta.js"></script>
<script src="../assets/js/dashboard.js"></script>
<?php include '../views/footer.php'; ?>