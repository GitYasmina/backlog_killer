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

<main class="dashboard-container logros-layout-moderno">
    
    <div class="logros-page-header">
        <h2>🏆 Vitrina de Logros</h2>
        <p class="vitrina-subtitle-premium">
            Tus medallas limpiando el backlog: 
            <span class="logros-contador-destacado">
                <?= count(array_filter($logros, function($logro) { return $logro['desbloqueado'] === 1; })) ?>/<?= count($logros) ?>
            </span>
        </p>
    </div>

    <div class="logros-grid-expandido">
        <?php foreach ($logros as $logro): 
            $clase_estado = $logro['desbloqueado'] ? 'logro-card-premium logro-desbloqueado-premium' : 'logro-card-premium logro-bloqueado-premium';
            
            // ASIGNACIÓN DINÁMICA SEGÚN TU LOGROS_HELPER
            // Si está bloqueado, ponemos el candado, si está desbloqueado usamos el icono real de tu BBDD
            // (Si en tu tabla no guardas el emoticono físico, usamos el switch basado en tu 'tipo_requisito')
            if (!$logro['desbloqueado']) {
                $icono_visual = '🔒';
            } else {
                switch ($logro['tipo_requisito']) {
                    case 'primer_juego':
                        $icono_visual = '🎯';
                        break;
                    case 'terminar_juego':
                        $icono_visual = '🔥';
                        break;
                    case 'viciada_selectiva':
                        $icono_visual = '🧠';
                        break;
                    case 'primera_resena':
                        $icono_visual = '⭐'; 
                        break;
                    case 'subir_nivel':
                        $icono_visual = '👑'; 
                        break;
                    default:
                        $icono_visual = '🏅';
                        break;
                }
            }
        ?>
            <div class="<?= $clase_estado ?>">
                <div class="logro-icono-box">
                    <?= $icono_visual ?>
                </div>
                <div class="logro-info-box">
                    <h3><?= htmlspecialchars($logro['titulo']) ?></h3>
                    <p><?= htmlspecialchars($logro['descripcion']) ?></p>
                    <?php if ($logro['desbloqueado']): ?>
                        <span class="fecha-logro-premium">Conseguido el: <?= date('d/m/Y', strtotime($logro['fecha_desbloqueo'])) ?></span>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</main>
<script src="../assets/js/dashboard.js"></script>
<?php include '../views/footer.php'; ?>