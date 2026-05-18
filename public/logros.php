<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
include '../views/header.php';
require_once '../app/db.php';

$user_id = $_SESSION['user_id'];

// obtener tods los logros y marcar cuáles tiene ya desbloqueados este usuario
$stmt_logros = $conexion->prepare("
    SELECT l.*, 
           IF(lu.id_logro IS NOT NULL, 1, 0) AS desbloqueado,
           lu.fecha_desbloqueo
    FROM logros l
    LEFT JOIN logros_usuario lu ON l.id = lu.id_logro AND lu.id_usuario = ?
    ORDER BY l.id ASC
");
$stmt_logros->execute([$user_id]);
$logros = $stmt_logros->fetchAll(PDO::FETCH_ASSOC);
?>

<main class="dashboard-container">
    <div class="login-card vitrina-card-unificada">
        <h2>🏆 Vitrina de Logros</h2>
        <p class="vitrina-subtitle">Tus medallas limpiando el backlog: <?= count(array_filter($logros, function($logro) { return $logro['desbloqueado'] === 1; })) ?>/<?= count($logros) ?></p>

        <div class="logros-grid">
            <?php foreach ($logros as $logro): 
                $clase_estado = $logro['desbloqueado'] ? 'logro-desbloqueado' : 'logro-bloqueado';
            ?>
                <div class="logro-item <?= $clase_estado ?>">
                    <div class="logro-icono">
                        <?= $logro['desbloqueado'] ? '✨' : '🔒' ?>
                    </div>
                    <div class="logro-texto">
                        <h3><?= htmlspecialchars($logro['titulo']) ?></h3>
                        <p><?= htmlspecialchars($logro['descripcion']) ?></p>
                        <?php if ($logro['desbloqueado']): ?>
                            <span class="fecha-logro">Conseguido el: <?= date('d/m/Y', strtotime($logro['fecha_desbloqueo'])) ?></span>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</main>

<?php include '../views/footer.php'; ?>