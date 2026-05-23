<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
require_once '../views/header.php';
require_once '../app/db.php';
require_once '../app/checkin_helper.php';


// traemos estadísticas básicas para mostrar en el dashboard
$user_id = $_SESSION['user_id'];

// comprobación diaria
$datos_checkin = procesarCheckinDiario($conexion, $user_id);

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

// 1. CONSULTA PARA JUEGOS ACTIVOS (Pendientes y En Progreso)
$stmt_activos = $conexion->prepare("
    SELECT v.titulo, v.imagen_url, v.genero, ej.estado, ej.id_videojuego, ej.horas_jugadas, v.duracion_estimada_horas
    FROM estados_juego ej
    JOIN videojuegos v ON ej.id_videojuego = v.id
    WHERE ej.id_usuario = ? AND ej.estado != 'terminado'
    ORDER BY ej.id_videojuego DESC LIMIT 6
");
$stmt_activos->execute([$user_id]);
$juegos_activos = $stmt_activos->fetchAll();

// 2. CONSULTA PARA JUEGOS COMPLETADOS (Solo Terminados)
$stmt_completados = $conexion->prepare("
    SELECT v.titulo, v.imagen_url, v.genero, ej.estado, ej.id_videojuego, ej.horas_jugadas, v.duracion_estimada_horas
    FROM estados_juego ej
    JOIN videojuegos v ON ej.id_videojuego = v.id
    WHERE ej.id_usuario = ? AND ej.estado = 'terminado'
    ORDER BY ej.id_videojuego DESC LIMIT 3
");
$stmt_completados->execute([$user_id]);
$juegos_completados = $stmt_completados->fetchAll();
?>

<main class="dashboard-container">
    <!-- AVISO VISUAL DEL CHECK-IN DIARIO -->
    <?php if ($datos_checkin['mostrar_aviso']): ?>
        <div class="notificacion-toast" id="alerta-checkin">
            <div class="contenido-toast">
                <span class="icono-toast">🎯</span>
                <div class="texto-toast">
                    <h4>¡Foco Diario Activado!</h4>
                    <p>Has recibido <strong>+<?= $datos_checkin['xp_ganada'] ?> XP</strong> por volver a la carga contra tu backlog.</p>
                </div>
                <button class="boton-cerrar-toast" onclick="document.getElementById('alerta-checkin').style.display='none'">✕</button>
            </div>
        </div>
    <?php endif; ?>

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
        <h2>Mi Backlog Activo 🎮</h2>
        <div class="games-grid">
            <?php if (empty($juegos_activos)): ?>
                <div class="empty-state">
                    <p>No tienes juegos pendientes ni en curso. ¡Buen trabajo!</p>
                    <a href="buscar_juego.php">Añadir más juegos</a>
                </div>
                <?php else:
                foreach ($juegos_activos as $juego):
                    $horas_totales = ($juego['duracion_estimada_horas'] > 0) ? $juego['duracion_estimada_horas'] : 30;
                    $porcentaje = round(($juego['horas_jugadas'] / $horas_totales) * 100);
                    if ($porcentaje > 100) $porcentaje = 100;
                ?>
                    <div class="game-card">
                        <img src="<?= (!empty($juego['imagen_url'])) ? $juego['imagen_url'] : '../assets/img/no-image.png' ?>" class="game-poster-dash" alt="Portada">
                        <div class="game-info">
                            <h3><?= htmlspecialchars($juego['titulo']) ?></h3>
                            <span class="game-tag"><?= htmlspecialchars($juego['genero']) ?></span>
                            <span class="status-badge <?= $juego['estado'] ?>"><?= ucfirst(str_replace('_', ' ', $juego['estado'])) ?></span>

                            <?php if ($juego['estado'] === 'en_progreso'): ?>
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
                                    <button onclick="cambiarHoras(<?= $juego['id_videojuego'] ?>)" class="btn-action-edit" title="Actualizar progreso">📝</button>
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

    <hr style="border: 0; border-top: 1px solid #252525; margin: 40px 0;">

    <section class="games-section">
        <h2>Últimas Joyas Completadas 🏆</h2>
        <div class="games-grid">
            <?php if (empty($juegos_completados)): ?>
                <div class="empty-state">
                    <p>Aún no has completado ningún juego. ¡Toca viciar! 🔥</p>
                </div>
                <?php else:
                foreach ($juegos_completados as $juego):
                    $horas_totales = ($juego['duracion_estimada_horas'] > 0) ? $juego['duracion_estimada_horas'] : 30;
                ?>
                    <div class="game-card game-card-completed">
                        <img src="<?= (!empty($juego['imagen_url'])) ? $juego['imagen_url'] : '../assets/img/no-image.png' ?>" class="game-poster-dash" alt="Portada">
                        <div class="game-info">
                            <h3><?= htmlspecialchars($juego['titulo']) ?></h3>
                            <span class="game-tag"><?= htmlspecialchars($juego['genero']) ?></span>
                            <span class="status-badge terminado" style="background: #193222; color: #2ecc71;">Terminado ✅</span>

                            <div class="progress-container">
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" style="width: 100%; background-color: #2ecc71;"></div>
                                </div>
                                <span class="progress-text">¡Completado en <?= $horas_totales ?>h! 🌟</span>
                            </div>

                            <div class="card-actions">
                                <button onclick="actualizarJuego(<?= $juego['id_videojuego'] ?>, 'eliminar')" class="btn-action-delete" title="Eliminar de la biblioteca">🗑️</button>
                            </div>
                        </div>
                    </div>
            <?php endforeach;
            endif; ?>
        </div>
    </section>
</main>

<div id="modal-horas" class="modal-overlay">
    <div class="modal-content">
        <h3>Registrar Sesión de Juego 🎮</h3>
        <p>¿Cuántas horas has jugado en esta sesión? Se sumarán a tu progreso actual.</p>

        <input type="hidden" id="modal-juego-id">

        <div class="modal-input-group">
            <input type="number" id="modal-horas-input" min="1" placeholder="Ej. 2" autofocus>
            <span>horas</span>
        </div>

        <div class="modal-actions">
            <button onclick="cerrarModal()" class="btn-modal-cancel">Cancelar</button>
            <button onclick="enviarHorasModal()" class="btn-modal-save">Guardar progreso</button>
        </div>
    </div>
</div>

<script src="../assets/js/dashboard.js"></script>
<?php include '../views/footer.php'; ?>