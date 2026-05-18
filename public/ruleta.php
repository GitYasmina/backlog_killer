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

// buscamos 'pendiente' y 'en_progreso'  para tener catálogo que sortear
$stmt = $conexion->prepare("
    SELECT v.titulo, v.imagen_url, v.genero, v.duracion_estimada_horas 
    FROM estados_juego ej
    JOIN videojuegos v ON ej.id_videojuego = v.id
    WHERE ej.id_usuario = ? AND ej.estado != 'terminado'
");
$stmt->execute([$user_id]);
$pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

// extraemos los géneros únicos para el filtro, ordenados alfabéticamente
$generos_existentes = array_unique(array_column($pendientes, 'genero'));
sort($generos_existentes);
?>

<main class="dashboard-container">
    <div class="login-card ruleta-card">
        <h2>🎲 Backlog Killer</h2>
        <p>¿No sabes a qué jugar? Deja que el destino elija por ti.</p>

        <?php if (!empty($pendientes)): ?>
            <div class="filtro-ruleta-container">
                
                <div class="filtro-group">
                    <label for="genero-ruleta">¿Qué te apetece jugar hoy?</label>
                    <select id="genero-ruleta" class="select-ruleta">
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

                <div class="filtro-group">
                    <label for="tiempo-ruleta">¿De cuánto tiempo dispones?</label>
                    <select id="tiempo-ruleta" class="select-ruleta">
                        <option value="cualquiera" selected>Tengo tiempo indefinido ☕</option>
                        <option value="corto">Sesión rápida (Menos de 1 hora) ⚡</option>
                        <option value="medio">Sesión normal (1 a 2 horas) 🎮</option>
                        <option value="largo">Sesión intensa (Más de 2 horas) 🔥</option>
                    </select>
                </div>

            </div>
        <?php endif; ?>

        <div class="ruleta-pantalla" id="pantalla-ruleta">
            <div class="ruleta-placeholder">
                <span>?</span>
            </div>
        </div>

        <?php if (empty($pendientes)): ?>
            <div class="empty-state">
                <p>No tienes juegos pendientes o en progreso en tu lista.</p>
                <a href="buscar_juego.php" class="btn-primary">Añadir juegos primero</a>
            </div>
        <?php else: ?>
            <button id="btn-girar" class="btn-cta" onclick="girarRuleta()">¡MATAR BACKLOG!</button>
        <?php endif; ?>
    </div>
</main>

<script>
    // pasamos el array de PHP a JavaScript en formato JSON de forma segura
    const juegosPendientes = <?php echo json_encode($pendientes); ?>;
</script>

<script src="../assets/js/ruleta.js"></script>

<?php include '../views/footer.php'; ?>