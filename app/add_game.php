<?php
session_start();
require_once 'db.php';

//recogemos lo que viene del js
$id_usuario = $_SESSION['user_id'];
$id_api = $_POST['id_api'];
$titulo = $_POST['titulo'];
$imagen = $_POST['imagen']?? '';

try {
    // miramos si el juego ya existe en nuestra tabla 'videojuegos'
    $query = $conexion->prepare("SELECT id FROM videojuegos WHERE id_api = ?");
    $query->execute([$id_api]);
    $juego = $query->fetch();

    if (!$juego) {
        // si no existe, lo creamos y obtenemos su id
        $ins = $conexion->prepare("INSERT INTO videojuegos (id_api, titulo, genero, imagen) VALUES (?, ?, 'Acción', ?)");
        $ins->execute([$id_api, $titulo, $imagen]);
        $id_vj = $conexion->lastInsertId();
    } else {
        $id_vj = $juego['id'];
    }

    // lo metemos en la lista personal del usuario (Backlog)
    $stmt = $conexion->prepare("INSERT INTO estados_juego (id_usuario, id_videojuego, estado) VALUES (?, ?, 'pendiente')");
    $stmt->execute([$id_usuario, $id_vj]);

    echo json_encode(['status' => 'success']);

} catch (Exception $e) {
    echo json_encode(['status' => 'error']);
}