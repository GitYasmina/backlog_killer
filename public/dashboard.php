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

// 3. CONSULTA PARA EL CONTRATO SEMANAL ACTIVO DEL USUARIO
$stmt_contrato = $conexion->prepare("
    SELECT cs.id, cs.objetivo, cs.completado, cs.fecha_limite, v.titulo, v.imagen_url
    FROM contratos_semanales cs
    JOIN videojuegos v ON cs.id_videojuego = v.id
    WHERE cs.id_usuario = ? AND cs.completado = 0 AND cs.fecha_limite >= CURDATE()
    LIMIT 1
");
$stmt_contrato->execute([$user_id]);
$contrato_activo = $stmt_contrato->fetch();
?>

<main class="dashboard-container dashboard-layout-moderno">

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

    <section class="dashboard-header-premium">
        <div class="header-titulo-wrapper">
            <h1>Mi Biblioteca</h1>
            <div class="dashboard-actions-btns">
                <a href="buscar_juego.php" class="btn-cta-dash-primary">➕ Añadir Juego</a>
                <a href="ruleta.php" class="btn-cta-dash-secondary">🎲 Backlog Killer</a>
            </div>
        </div>

        <div class="stats-grid-premium">
            <div class="stat-card-premium stat-total">
                <span class="stat-value-premium"><?= $stats['total'] ?? 0 ?></span>
                <span class="stat-label-premium">Juegos Totales</span>
            </div>
            <div class="stat-card-premium stat-pendiente">
                <span class="stat-value-premium"><?= $stats['pendientes'] ?? 0 ?></span>
                <span class="stat-label-premium">Pendientes</span>
            </div>
            <div class="stat-card-premium stat-progreso">
                <span class="stat-value-premium"><?= $stats['progreso'] ?? 0 ?></span>
                <span class="stat-label-premium">En Curso</span>
            </div>
        </div>
    </section>

    <section class="seccion-contrato-premium">
        <h2 class="section-title-dash">Contrato Semanal 📜</h2>
        <p class="contrato-subtitulo-premium">Gestiona tus micro-objetivos para mantener a raya la procrastinación.</p>

        <?php if (!$contrato_activo): ?>
            <div class="contrato-vacio-card-premium">
                <p>No tienes ningún objetivo estratégico firmado para esta semana.</p>
                <button onclick="abrirModalContrato()" class="btn-cta-dash-primary btn-firmar-contrato">📜 Firmar Contrato Semanal</button>
            </div>
        <?php else: ?>
            <div class="tarjeta-contrato-gamer-premium">
                <div class="contrato-img-wrapper">
                    <img src="<?= (!empty($contrato_activo['imagen_url'])) ? $contrato_activo['imagen_url'] : '../assets/img/no-image.png' ?>" alt="Portada">
                </div>
                <div class="contrato-cuerpo-premium">
                    <span class="contrato-tag-juego-premium"><?= htmlspecialchars($contrato_activo['titulo']) ?></span>
                    <h3>🎯 Misión: <?= htmlspecialchars($contrato_activo['objetivo']) ?></h3>
                    <p class="contrato-recompensa-premium">💰 Recompensa: <span>+30 XP</span></p>
                    <p class="contrato-fecha-premium">⏳ Plazo: hasta el <?= date('d/m/Y', strtotime($contrato_activo['fecha_limite'])) ?></p>
                </div>
                <div class="contrato-acciones-premium">
                    <button onclick="completarContrato(<?= $contrato_activo['id'] ?>)" class="btn-action-dash check" title="¡Misión cumplida!">✔</button>
                    <button onclick="cancelarContrato(<?= $contrato_activo['id'] ?>)" class="btn-action-dash delete" title="Romper contrato">✕</button>
                </div>
            </div>
        <?php endif; ?>
    </section>

    <section class="games-section-premium">
        <div class="games-section-header-flex">
            <h2 class="section-title-dash">Mi Backlog Activo 🎮</h2>

            <div class="dashboard-filter-tabs">
                <button class="filter-tab-btn active" onclick="filtrarBacklog('todos', this)">Todos</button>
                <button class="filter-tab-btn" onclick="filtrarBacklog('pendiente', this)">Pendientes</button>
                <button class="filter-tab-btn" onclick="filtrarBacklog('en_progreso', this)">En Curso</button>
            </div>
        </div>

        <div class="games-grid-premium" id="contenedor-backlog-juegos">
            <?php if (empty($juegos_activos)): ?>
                <div class="empty-state-dash">
                    <p>No tienes juegos pendientes ni en curso. ¡Buen trabajo! 🔥</p>
                    <a href="buscar_juego.php">Añadir más juegos</a>
                </div>
            <?php else:
                foreach ($juegos_activos as $juego):
                    // Minutos guardados -> Horas estimadas
                    $minutos_jugados = $juego['horas_jugadas']; 
                    $horas_estimadas = ($juego['duracion_estimada_horas'] > 0) ? $juego['duracion_estimada_horas'] : 30;

                    $horas_jugadas_decimal = $minutos_jugados / 60;
                    $porcentaje = round(($horas_jugadas_decimal / $horas_estimadas) * 100);

                    $es_completacionista = ($porcentaje > 100);
                    if ($porcentaje > 100) $porcentaje = 100;

                    // Desglose limpio para el string visual
                    $solo_horas = floor($minutos_jugados / 60);
                    $solo_minutos = $minutos_jugados % 60;
                    
                    $texto_tiempo_jugado = "";
                    if ($solo_horas > 0) {
                        $texto_tiempo_jugado .= $solo_horas . "h ";
                    }
                    if ($solo_minutos > 0 || $solo_horas == 0) {
                        $texto_tiempo_jugado .= $solo_minutos . "min";
                    }
                ?>
                    <div class="game-card-premium" data-estado="<?= htmlspecialchars($juego['estado']) ?>">
                        <div class="game-poster-wrapper">
                            <img src="<?= (!empty($juego['imagen_url'])) ? $juego['imagen_url'] : '../assets/img/no-image.png' ?>" alt="Portada">
                            <span class="status-badge-premium <?= $juego['estado'] ?>"><?= ucfirst(str_replace('_', ' ', $juego['estado'])) ?></span>
                        </div>
                        <div class="game-info-premium">
                            <h3><?= htmlspecialchars($juego['titulo']) ?></h3>
                            <span class="game-tag-premium"><?= htmlspecialchars($juego['genero']) ?></span>

                            <?php if ($juego['estado'] === 'en_progreso'): ?>
                                <div class="progress-container-dash">
                                    <div class="progress-bar-bg-dash">
                                        <div class="progress-bar-fill-dash <?= $es_completacionista ? 'barra-completacionista-pulsante' : '' ?>" style="width: <?= $porcentaje ?>%"></div>
                                    </div>

                                    <span class="progress-text-dash">
                                        <?php if ($es_completacionista): ?>
                                            <span class="txt-modo-completacionista">🌟 ¡Superado! Modo completacionista (<?= $texto_tiempo_jugado ?> / <?= $horas_estimadas ?>h)</span>
                                        <?php else: ?>
                                            <?= $texto_tiempo_jugado ?> / <?= $horas_estimadas ?>h (<?= $porcentaje ?>%)
                                        <?php endif; ?>
                                    </span>
                                </div>
                            <?php endif; ?>

                            <div class="card-actions-premium">
                                <?php if ($juego['estado'] === 'pendiente'): ?>
                                    <button type="button" onclick="actualizarJuego(<?= $juego['id_videojuego'] ?>, 'progreso')" class="btn-action-dash play" title="Empezar a jugar">▶ Jugar</button>
                                <?php endif; ?>

                                <?php if ($juego['estado'] === 'en_progreso'): ?>
                                    <button type="button" onclick="cambiarHoras(<?= $juego['id_videojuego'] ?>)" class="btn-action-dash edit" title="Actualizar progreso">📝 Horas</button>
                                    <button type="button" onclick="actualizarJuego(<?= $juego['id_videojuego'] ?>, 'terminado')" class="btn-action-dash check" title="Marcar como terminado">✅ Fin</button>
                                <?php endif; ?>

                                <button type="button" onclick="confirmarEliminarJuego(<?= $juego['id_videojuego'] ?>, '<?= addslashes($juego['titulo']) ?>')" class="btn-action-dash delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
            <?php endforeach;
            endif; ?>
        </div>
    </section>

    <section class="games-section-premium">
        <h2 class="section-title-dash">Últimas Joyas Completadas 🏆</h2>
        <div class="games-grid-premium">
            <?php if (empty($juegos_completados)): ?>
                <div class="empty-state-dash">
                    <p>Aún no has completado ningún juego. ¡Toca viciar! 🕹</p>
                </div>
            <?php else:
                foreach ($juegos_completados as $juego):
                    // 🚀 CORRECCIÓN SÓLIDA DE VARIABLES PARA JUEGOS COMPLETADOS
                    $minutos_totales_acumulados = intval($juego['horas_jugadas']);
                    $horas_estimadas_api = ($juego['duracion_estimada_horas'] > 0) ? intval($juego['duracion_estimada_horas']) : 30;
                    
                    // Desglosamos de forma humana los minutos que el usuario invirtió de verdad
                    $final_horas = floor($minutos_totales_acumulados / 60);
                    $final_minutos = $minutos_totales_acumulados % 60;
                    
                    $texto_tiempo_final = "";
                    if ($final_horas > 0) {
                        $texto_tiempo_final .= $final_horas . "h ";
                    }
                    if ($final_minutos > 0 || $final_horas == 0) {
                        $texto_tiempo_final .= $final_minutos . "min";
                    }
                ?>
                    <div class="game-card-premium game-card-completed-premium">
                        <div class="game-poster-wrapper">
                            <img src="<?= (!empty($juego['imagen_url'])) ? $juego['imagen_url'] : '../assets/img/no-image.png' ?>" alt="Portada">
                            <span class="status-badge-premium terminado">Terminado ✅</span>
                        </div>
                        <div class="game-info-premium">
                            <h3><?= htmlspecialchars($juego['titulo']) ?></h3>
                            <span class="game-tag-premium"><?= htmlspecialchars($juego['genero']) ?></span>

                            <div class="progress-container-dash">
                                <div class="progress-bar-bg-dash">
                                    <div class="progress-bar-fill-dash completed-bar" style="width: 100%;"></div>
                                </div>
                                <span class="progress-text-dash success-txt">¡Completado en <?= $texto_tiempo_final ?>! 🌟</span>
                            </div>

                            <div class="card-actions-premium">
                                <button type="button" onclick="confirmarEliminarJuego(<?= $juego['id_videojuego'] ?>, '<?= addslashes($juego['titulo']) ?>')" class="btn-action-dash delete" title="Eliminar de la biblioteca"><i class="fa-solid fa-trash"></i></button>
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
        <p>¿Cuántos minutos has estado jugando en esta sesión? Se sumarán a tu progreso actual.</p>
        <input type="hidden" id="modal-juego-id">
        <div class="modal-input-group">
            <input type="number" id="modal-horas-input" min="1" placeholder="Ej. 10, 30, 60" autofocus>
            <span>minutos</span>
        </div>
        <div class="modal-actions">
            <button onclick="cerrarModal()" class="btn-modal-cancel">Cancelar</button>
            <button onclick="enviarHorasModal()" class="btn-modal-save">Guardar progreso</button>
        </div>
    </div>
</div>

<div id="modal-resena" class="modal-overlay">
    <div class="modal-content">
        <h3>¡Juego Completado! 🏆</h3>
        <p>Deja tu valoración final para cerrar este ciclo de tu backlog.</p>
        <input type="hidden" id="modal-resena-juego-id">
        <div class="selector-estrellas">
            <input type="radio" id="estrella5" name="puntuacion" value="5">
            <label for="estrella5" title="Excelente">★</label>
            <input type="radio" id="estrella4" name="puntuacion" value="4">
            <label for="estrella4" title="Muy bueno">★</label>
            <input type="radio" id="estrella3" name="puntuacion" value="3">
            <label for="estrella3" title="Bueno">★</label>
            <input type="radio" id="estrella2" name="puntuacion" value="2">
            <label for="estrella2" title="Regular">★</label>
            <input type="radio" id="estrella1" name="puntuacion" value="1">
            <label for="estrella1" title="Malo">★</label>
        </div>
        <div class="modal-input-group-textarea">
            <label for="modal-comentario-input">Tu opinión (opcional):</label>
            <textarea id="modal-comentario-input" rows="4" placeholder="¿Qué te ha parecido la historia, la jugabilidad...?"></textarea>
        </div>
        <div class="modal-actions">
            <button onclick="cerrarModalResena()" class="btn-modal-cancel">Saltar</button>
            <button onclick="enviarResenaModal()" class="btn-modal-save">Guardar reseña</button>
        </div>
    </div>
</div>

<div id="modal-contrato" class="modal-overlay">
    <div class="modal-content">
        <h3>Redactar Contrato Semanal ✍️</h3>
        <p>Establece un objetivo a corto plazo para avanzar de forma constante.</p>
        <div class="modal-input-group-vertical">
            <label for="contrato-juego">¿Para qué juego es la misión?</label>
            <select id="contrato-juego" class="select-ruleta-perfil">
                <?php if (empty($juegos_activos)): ?>
                    <option value="">-- No tienes juegos activos --</option>
                <?php else:
                    foreach ($juegos_activos as $ja): ?>
                        <option value="<?= $ja['id_videojuego'] ?>"><?= htmlspecialchars($ja['titulo']) ?> (<?= ucfirst($ja['estado']) ?>)</option>
                    <?php endforeach;
                endif; ?>
            </select>
        </div>
        <div class="modal-input-group-vertical">
            <label for="contrato-objective">¿Cuál es tu meta específica?</label>
            <input type="text" id="contrato-objetivo" placeholder="Ej: Superar el capítulo 3 / Limpiar la zona norte...">
        </div>
        <div class="modal-actions">
            <button onclick="cerrarModalContrato()" class="btn-modal-cancel">Cancelar</button>
            <button onclick="enviarContratoModal()" class="btn-modal-save">Firmar Trato</button>
        </div>
    </div>
</div>

<div id="modal-confirmar-eliminar" class="modal-overlay">
    <div class="modal-content modal-danger-premium">
        <div class="modal-danger-icon">⚠</div>
        <h3>¿Eliminar de la biblioteca?</h3>
        <p>Estás a punto de borrar <strong id="eliminar-juego-titulo">este juego</strong>. Esta acción no se puede deshacer y perderás el registro de tus horas jugadas.</p>

        <input type="hidden" id="eliminar-juego-id">

        <div class="modal-actions">
            <button onclick="cerrarModalEliminar()" class="btn-modal-cancel">Cancelar</button>
            <button onclick="ejecutarEliminarJuego()" class="btn-modal-danger-execute">Sí, Eliminar</button>
        </div>
    </div>
</div>

<script src="../assets/js/utils.js"></script>
<script src="../assets/js/dashboard.js"></script>
<?php include '../views/footer.php'; ?>