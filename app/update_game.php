<?php
session_start();
require_once 'db.php';

// cabecera para responder en formato JSON a JavaScript
header('Content-Type: application/json');

// si no está logueado, cortamos la ejecución
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No autorizado']);
    exit();
}

$id_usuario = $_SESSION['user_id'];
$id_videojuego = $_POST['id_videojuego'] ?? null;
$accion = $_POST['accion'] ?? null;

// validacion 
if (!$id_videojuego || !$accion) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos']);
    exit();
}

try {
    if ($accion === 'eliminar') {
        // borramos el juego de la lista de este usuario
        $stmt = $conexion->prepare("DELETE FROM estados_juego WHERE id_usuario = ? AND id_videojuego = ?");
        $stmt->execute([$id_usuario, $id_videojuego]);
        
        // si el borrado tiene éxito, devolvemos success y cortamos ejecución
        echo json_encode(['status' => 'success', 'message' => 'Juego eliminado']);
        exit();

    } else if ($accion === 'progreso') {
        // pasamos el juego a 'en_progreso'
        $stmt = $conexion->prepare("UPDATE estados_juego SET estado = 'en_progreso' WHERE id_usuario = ? AND id_videojuego = ?");
        $stmt->execute([$id_usuario, $id_videojuego]);
        
        echo json_encode(['status' => 'success', 'message' => '¡A jugar!']);
        exit();

    } else if ($accion === 'actualizar_horas') {
        // Guardamos las horas reales que el usuario escribe en el modal
        $minutos_totales = isset($_POST['minutos_totales']) ? (int)$_POST['minutos_totales'] : 0;
        
        // Sumamos las horas en la tabla intermedia de la base de datos
        $stmt = $conexion->prepare("UPDATE estados_juego SET horas_jugadas = horas_jugadas + ? WHERE id_usuario = ? AND id_videojuego = ?");
        $stmt->execute([$minutos_totales, $id_usuario, $id_videojuego]);

        // comprobamos si con esta suma se alcanza la duración estimada para saltar el logro
        $check = $conexion->prepare("
            SELECT ej.horas_jugadas, v.duracion_estimada_horas 
            FROM estados_juego ej
            JOIN videojuegos v ON ej.id_videojuego = v.id
            WHERE ej.id_usuario = ? AND ej.id_videojuego = ?
        ");
        $check->execute([$id_usuario, $id_videojuego]);
        $progreso = $check->fetch();

        $nuevo_logro_desbloqueado = null;
        if ($progreso) {
            $minutos_acumulados = (int)$progreso['horas_jugadas'];
            $minutos_estimados_totales = (int)$progreso['duracion_estimada_horas'] * 60;

            // Si alcanza o supera las horas, disparamos el logro pero NO cambiamos el estado a terminado
            if ($minutos_acumulados >= $minutos_estimados_totales) {
                require_once 'logros_helper.php';
                $nuevos_logros = comprobarLogros($conexion, $id_usuario, 'primer_terminado');
                if (!empty($nuevos_logros)) {
                    $nuevo_logro_desbloqueado = $nuevos_logros[0];
                }
            }
        }

        // Devolvemos el estado del éxito. JS recargará la página para pintar la barra y evaluar el botón gris/verde
        echo json_encode([
            'status' => 'success', 
            'message' => 'Progreso actualizado correctamente.',
            'logro' => $nuevo_logro_desbloqueado
        ]);
        exit();

    } else if ($accion === 'verificar_aptitud') {
        // comprueba si tiene minutos suficientes para marcar el juego como terminado, si no, devuelve un error controlado para bloquear el modal
        $stmt_check = $conexion->prepare("
            SELECT ej.horas_jugadas, v.duracion_estimada_horas, v.titulo
            FROM estados_juego ej
            JOIN videojuegos v ON ej.id_videojuego = v.id
            WHERE ej.id_usuario = ? AND ej.id_videojuego = ?
        ");
        $stmt_check->execute([$id_usuario, $id_videojuego]);
        $progreso = $stmt_check->fetch();

        if ($progreso) {
            $minutos_actuales = (int)$progreso['horas_jugadas'];
            $minutos_requeridos = (int)$progreso['duracion_estimada_horas'] * 60;

            if ($minutos_actuales < $minutos_requeridos) {
                // si le faltan horas, mandamos un error controlado para bloquear el JavaScript
                echo json_encode([
                    'status' => 'error',
                    'message' => 'No puedes dar por terminado "' . $progreso['titulo'] . '" todavía. ¡Aún te quedan horas de juego pendientes por registrar!'
                ]);
                exit();
            }
        }
        
        // Si tiene las horas correctas, le damos luz verde para que abra el modal
        echo json_encode(['status' => 'success']);
        exit();

    } else if ($accion === 'terminado') {
        $nota = (!empty($_POST['nota'])) ? (int)$_POST['nota'] : null;
        $resena = (!empty($_POST['resena'])) ? trim($_POST['resena']) : null;

        // actualizamos el estado a terminado y guardamos la nota y reseña que el usuario ha escrito en el modal
        // y dejamos intactas las horas_jugadas exactas que el usuario ha viciado.
        $stmt = $conexion->prepare("
            UPDATE estados_juego 
            SET estado = 'terminado', nota = ?, resena = ? 
            WHERE id_usuario = ? AND id_videojuego = ?
        ");
        $stmt->execute([$nota, $resena, $id_usuario, $id_videojuego]);

        require_once 'logros_helper.php';
        $nuevos_logros = [];
        
        $logros_fin = comprobarLogros($conexion, $id_usuario, 'primer_terminado');
        if (!empty($logros_fin)) $nuevos_logros = array_merge($nuevos_logros, $logros_fin);

        $logros_resena = comprobarLogros($conexion, $id_usuario, 'primera_resena');
        if (!empty($logros_resena)) $nuevos_logros = array_merge($nuevos_logros, $logros_resena);

        echo json_encode([
            'status' => 'success',
            'message' => '¡Juego completado con éxito!',
            'logro' => !empty($nuevos_logros) ? $nuevos_logros[0] : null
        ]);
        exit();
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    exit();
}