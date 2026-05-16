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

// sacamos solo los juegos 'pendiente' de este usuario
$stmt = $conexion->prepare("
    SELECT v.titulo, v.imagen_url, v.genero 
    FROM estados_juego ej
    JOIN videojuegos v ON ej.id_videojuego = v.id
    WHERE ej.id_usuario = ? AND ej.estado = 'pendiente'
");
$stmt->execute([$user_id]);
$pendientes = $stmt->fetchAll();
?>

<main class="dashboard-container">
    <div class="login-card ruleta-card">
        <h2>🎲 Backlog Killer</h2>
        <p>¿No sabes a qué jugar? Deja que el destino elija por ti.</p>

        <div class="ruleta-pantalla" id="pantalla-ruleta">
            <div class="ruleta-placeholder">
                <span>?</span>
            </div>
        </div>

        <?php if (empty($pendientes)): ?>
            <div class="empty-state">
                <p>No tienes juegos pendientes en tu lista.</p>
                <a href="buscar_juego.php" class="btn-primary">Añadir juegos primero</a>
            </div>
        <?php else: ?>
            <button id="btn-girar" class="btn-cta" onclick="girarRuleta()">¡MATAR BACKLOG!</button>
        <?php endif; ?>
    </div>
</main>

<script>
    // Pasamos el array de PHP a JavaScript en formato JSON
    const juegosPendientes = <?php echo json_encode($pendientes); ?>;
</script>

<script src="../assets/js/ruleta.js"></script>

<?php include '../views/footer.php'; ?>