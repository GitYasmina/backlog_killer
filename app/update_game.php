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
        echo json_encode(['status' => 'success', 'message' => 'Juego eliminado']);
    } else if ($accion === 'progreso') {
        // pasamos el juego a 'en_progreso'
        $stmt = $conexion->prepare("UPDATE estados_juego SET estado = 'en_progreso' WHERE id_usuario = ? AND id_videojuego = ?");
        $stmt->execute([$id_usuario, $id_videojuego]);
        echo json_encode(['status' => 'success', 'message' => '¡A jugar!']);
    } else if ($accion === 'actualizar_horas') {
        // guardamos los minutos reales que el usuario escribe en el prompt
        $minutos_nuevos = isset($_POST['horas']) ? (int)$_POST['horas'] : 0;
        // sumamos los minutos en la tabla intermedia
        $stmt = $conexion->prepare("UPDATE estados_juego SET horas_jugadas = horas_jugadas + ? WHERE id_usuario = ? AND id_videojuego = ?");
        $stmt->execute([$minutos_nuevos, $id_usuario, $id_videojuego]);

        // comprobamos si con esta suma se ha alcanzado o superado la duración estimada
        $check = $conexion->prepare("
            SELECT ej.horas_jugadas, v.duracion_estimada_horas 
            FROM estados_juego ej
            JOIN videojuegos v ON ej.id_videojuego = v.id
            WHERE ej.id_usuario = ? AND ej.id_videojuego = ?
        ");
        $check->execute([$id_usuario, $id_videojuego]);
        $progreso = $check->fetch();

       if ($progreso) {
            $minutos_acumulados = (int)$progreso['horas_jugadas'];
            $minutos_estimados_totales = (int)$progreso['duracion_estimada_horas'] * 60; // Ej: 6h * 60 = 360min

            if ($minutos_acumulados >= $minutos_estimados_totales) {
                // el usuario ha alcanzado o superado los minutos estimados, se auto-completa
                $up = $conexion->prepare("UPDATE estados_juego SET estado = 'terminado' WHERE id_usuario = ? AND id_videojuego = ?");
                $up->execute([$id_usuario, $id_videojuego]);

                // disparador de logros
                require_once 'logros_helper.php';
                $nuevos_logros = comprobarLogros($conexion, $id_usuario, 'primer_terminado');

                echo json_encode([
                    'status' => 'success',
                    'message' => '¡Has alcanzado la duración estimada! Juego completado automáticamente.',
                    'logro' => !empty($nuevos_logros) ? $nuevos_logros[0] : null
                ]);
                exit();
            }
        }

        echo json_encode(['status' => 'success']);
    } else if ($accion === 'terminado') {

        // recojemos la nota y la reseña que vienen desde el modal
        $nota = (!empty($_POST['nota'])) ? (int)$_POST['nota'] : null;
        $resena = (!empty($_POST['resena'])) ? trim($_POST['resena']) : null;

        // al pasarlo a terminado, igualamos las horas_jugadas a duracion_estimada_horas automáticamente
        $stmt = $conexion->prepare("
            UPDATE estados_juego ej
            JOIN videojuegos v ON ej.id_videojuego = v.id
            SET ej.estado = 'terminado', ej.horas_jugadas = v.duracion_estimada_horas, ej.nota = ?, ej.resena = ? 
            WHERE ej.id_usuario = ? AND ej.id_videojuego = ?
        ");
        $stmt->execute([$nota, $resena, $id_usuario, $id_videojuego]);

        // saltamos el disparador de logros para la acción directa del botón check verde
        require_once 'logros_helper.php';
        $nuevos_logros = comprobarLogros($conexion, $id_usuario, 'primer_terminado');

        // si el usuario ha escrito una reseña, comprobamos también los logros relacionados con reseñas
        $logros_resena = comprobarLogros($conexion, $id_usuario, 'primera_resena');
        if (!empty($logros_resena)) {
            $nuevos_logros = array_merge($nuevos_logros, $logros_resena);
        }

        if (!empty($nuevos_logros)) {
            echo json_encode([
                'status' => 'success',
                'message' => '¡Juego completado!',
                'logro' => $nuevos_logros[0]
            ]);
            exit();
        }

        echo json_encode(['status' => 'success', 'message' => '¡Juego completado!']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor']);
}
