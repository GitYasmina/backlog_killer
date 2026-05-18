<?php
session_start();
require_once 'db.php';
header('Content-Type: application/json');

// si no está logueado, cortamos
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No autorizado']);
    exit();
}

// recogemos lo que viene del JS
$id_usuario = $_SESSION['user_id'];
$id_api = $_POST['id_api'] ?? null;
$titulo = $_POST['titulo'] ?? null;
$imagen = $_POST['imagen'] ?? '';
$genero = $_POST['genero'] ?? 'Desconocido'; //recoge el género real de la API
$duracion = isset($_POST['duracion']) ? (int)$_POST['duracion'] : 30; // recoge las horas estimadas de la API

if (!$id_api || !$titulo) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios']);
    exit();
}

try {
    // miramos si el juego ya existe en nuestra tabla 'videojuegos'
    $query = $conexion->prepare("SELECT id FROM videojuegos WHERE id_api = ?");
    $query->execute([$id_api]);
    $juego = $query->fetch();

    if (!$juego) {
        // insertamos las variables reales de género y duración estimada en tu columna original
        $ins = $conexion->prepare("INSERT INTO videojuegos (id_api, titulo, genero, imagen_url, duracion_estimada_horas) VALUES (?, ?, ?, ?, ?)");
        $ins->execute([$id_api, $titulo, $genero, $imagen, $duracion]);
        $id_vj = $conexion->lastInsertId();
    } else {
        $id_vj = $juego['id'];
    }

    // miramos si el usuario ya tiene este juego en su biblioteca
    $check = $conexion->prepare("SELECT * FROM estados_juego WHERE id_usuario = ? AND id_videojuego = ?");
    $check->execute([$id_usuario, $id_vj]);

    if ($check->rowCount() > 0) {
        echo json_encode(['status' => 'exists']);
        exit;
    }

    // insertamos en la lista personal guardando el estado 'pendiente', las horas_jugadas a 0 y la plataforma real
    $stmt = $conexion->prepare("INSERT INTO estados_juego (id_usuario, id_videojuego, estado, horas_jugadas) VALUES (?, ?, 'pendiente', 0)");
    $stmt->execute([$id_usuario, $id_vj]);
    require_once 'logros_helper.php';
    
    // comprobamos si el usuario cumple las condiciones para el logro 'primer_juego'
    $nuevos_logros = comprobarLogros($conexion, $id_usuario, 'primer_juego');

    // si ha saltado un logro nuevo, lo incluimos en la respuesta de éxito
    if (!empty($nuevos_logros)) {
        echo json_encode([
            'status' => 'success',
            'logro' => $nuevos_logros[0] // mandamos el título del logro (ej: 'Cazador de Sombras ⚔️')
        ]);
        exit();
    }

    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
