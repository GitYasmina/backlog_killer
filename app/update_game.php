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
        
    } else if ($accion === 'terminado') {
        // pasamos el juego a 'terminado'
        $stmt = $conexion->prepare("UPDATE estados_juego SET estado = 'terminado' WHERE id_usuario = ? AND id_videojuego = ?");
        $stmt->execute([$id_usuario, $id_videojuego]);
        echo json_encode(['status' => 'success', 'message' => '¡Juego completado!']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor']);
}