<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
include '../views/header.php';
require_once '../app/db.php';

// traemos estadísticas básicas para mostrar en el dashboard
$user_id = $_SESSION['user_id'];
$stmt = $conexion->prepare("
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as progreso
    FROM estados_juego 
    WHERE id_usuario = ?
");
$stmt->execute([$user_id]);
$stats = $stmt->fetch();
?>

<main class="dashboard-container">
    <section class="dashboard-header">
        <h1>Mi Biblioteca</h1>
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value"><?= $stats['total'] ?? 0 ?></span>
                <span class="stat-label">Juegos Totales</span>
            </div>
            <div class="stat-card">
                <span class="stat-value"><?= $stats['pendientes'] ?? 0 ?></span>
                <span class="stat-label">Pendientes</span>
            </div>
            <div class="stat-card">
                <span class="stat-value"><?= $stats['progreso'] ?? 0 ?></span>
                <span class="stat-label">En Curso</span>
            </div>
        </div>
    </section>

    <section class="dashboard-actions">
        <a href="buscar_juego.php" class="btn-primary">➕ Añadir Juego</a>
        <a href="ruleta.php" class="btn-secondary">🎲 Backlog Killer</a>
    </section>

    <section class="games-section">
        <h2>Mis Juegos Recientes</h2>
        <div class="games-grid">
            <?php
            // traemos los últimos 6 juegos añadidos por el usuario con su estado
            $stmt = $conexion->prepare("
                SELECT v.titulo, v.imagen_url, v.genero, ej.estado, ej.id_videojuego, ej.horas_jugadas, v.duracion_estimada_horas
                FROM estados_juego ej
                JOIN videojuegos v ON ej.id_videojuego = v.id
                WHERE ej.id_usuario = ?
                ORDER BY ej.id_videojuego DESC LIMIT 6
            ");
            $stmt->execute([$user_id]);
            $juegos = $stmt->fetchAll();

            if (empty($juegos)): ?>
                <div class="empty-state">
                    <p>Aún no tienes juegos en tu biblioteca.</p>
                    <a href="buscar_juego.php">¡Empieza a añadir tus joyas!</a>
                </div>
                <?php else:
                foreach ($juegos as $juego):
                    // calculo del porcentaje automáticamente en PHP (evitando dividir entre cero)
                    $horas_totales = ($juego['duracion_estimada_horas'] > 0) ? $juego['duracion_estimada_horas'] : 30;
                    $porcentaje = round(($juego['horas_jugadas'] / $horas_totales) * 100);
                    if ($porcentaje > 100) $porcentaje = 100; // Por si se pasa
                ?>
                    <div class="game-card">
                        <img src="<?= (!empty($juego['imagen_url'])) ? $juego['imagen_url'] : '../assets/img/no-image.png' ?>" class="game-poster-dash" alt="Portada">
                        <div class="game-info">
                            <h3><?= htmlspecialchars($juego['titulo']) ?></h3>
                            <span class="game-tag"><?= htmlspecialchars($juego['genero']) ?></span>
                            <span class="status-badge <?= $juego['estado'] ?>"><?= ucfirst($juego['estado']) ?></span>

                            <?php if ($juego['estado'] !== 'pendiente'): ?>
                                <div class="progress-container">
                                    <div class="progress-bar-bg">
                                        <div class="progress-bar-fill" style="width: <?= $porcentaje ?>%"></div>
                                    </div>
                                    <span class="progress-text"><?= $juego['horas_jugadas'] ?>h de <?= $horas_totales ?>h completadas (<?= $porcentaje ?>%)</span>
                                </div>
                            <?php endif; ?>

                            <div class="card-actions">
                                <?php if ($juego['estado'] === 'pendiente'): ?>
                                    <button onclick="actualizarJuego(<?= $juego['id_videojuego'] ?>, 'progreso')" class="btn-action-play" title="Empezar a jugar">🎮</button>
                                <?php endif; ?>

                                <?php if ($juego['estado'] === 'en_progreso'): ?>
                                    <button onclick="cambiarPorcentaje(<?= $juego['id_videojuego'] ?>)" class="btn-action-edit" title="Actualizar progreso">📝</button>
                                    <button onclick="actualizarJuego(<?= $juego['id_videojuego'] ?>, 'terminado')" class="btn-action-check" title="Marcar como terminado">✅</button>
                                <?php endif; ?>

                                <button onclick="actualizarJuego(<?= $juego['id_videojuego'] ?>, 'eliminar')" class="btn-action-delete" title="Eliminar de la biblioteca">🗑️</button>
                            </div>
                        </div>
                    </div>
            <?php endforeach;
            endif; ?>
        </div>
    </section>
</main>
<script src="../assets/js/dashboard.js"></script>
<?php include '../views/footer.php'; ?>