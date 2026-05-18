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
        // guardamos las horas reales que el usuario escribe en el prompt
        $horas_nuevas = isset($_POST['horas']) ? (int)$_POST['horas'] : 0;
        
        // sumamos las horas en la tabla intermedia
        $stmt = $conexion->prepare("UPDATE estados_juego SET horas_jugadas = horas_jugadas + ? WHERE id_usuario = ? AND id_videojuego = ?");
        $stmt->execute([$horas_nuevas, $id_usuario, $id_videojuego]);

        // comprobamos si con esta suma se ha alcanzado o superado la duración estimada
        $check = $conexion->prepare("
            SELECT ej.horas_jugadas, v.duracion_estimada_horas 
            FROM estados_juego ej
            JOIN videojuegos v ON ej.id_videojuego = v.id
            WHERE ej.id_usuario = ? AND ej.id_videojuego = ?
        ");
        $check->execute([$id_usuario, $id_videojuego]);
        $progreso = $check->fetch();

        if ($progreso && $progreso['horas_jugadas'] >= $progreso['duracion_estimada_horas']) {
            // el usuario ha alcanzado las horas estimadas, lo marcamos como terminado automáticamente
            $up = $conexion->prepare("UPDATE estados_juego SET estado = 'terminado' WHERE id_usuario = ? AND id_videojuego = ?");
            $up->execute([$id_usuario, $id_videojuego]);

            // saltamos el disparador de logros por si es su primer juego completado
            require_once 'logros_helper.php';
            $nuevos_logros = comprobarLogros($conexion, $id_usuario, 'primer_terminado');

            echo json_encode([
                'status' => 'success',
                'message' => '¡Has alcanzado la duración estimada! Juego completado automáticamente.',
                'logro' => !empty($nuevos_logros) ? $nuevos_logros[0] : null
            ]);
            exit();
        }
        
        echo json_encode(['status' => 'success']);

    } else if ($accion === 'terminado') {
        // al pasarlo a terminado, igualamos las horas_jugadas a duracion_estimada_horas automáticamente
        $stmt = $conexion->prepare("
            UPDATE estados_juego ej
            JOIN videojuegos v ON ej.id_videojuego = v.id
            SET ej.estado = 'terminado', ej.horas_jugadas = v.duracion_estimada_horas 
            WHERE ej.id_usuario = ? AND ej.id_videojuego = ?
        ");
        $stmt->execute([$id_usuario, $id_videojuego]);

        // saltamos el disparador de logros para la acción directa del botón check verde
        require_once 'logros_helper.php';
        $nuevos_logros = comprobarLogros($conexion, $id_usuario, 'primer_terminado');

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