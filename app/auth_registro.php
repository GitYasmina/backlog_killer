<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    $user = $_POST['username'];
    $email = $_POST['email'];
    $pass = password_hash($_POST['password'], PASSWORD_BCRYPT); // Seguridad total

    try {
        $stmt = $conexion->prepare("INSERT INTO usuarios (username, email, password) VALUES (:u, :e, :p)");
        $stmt->execute([':u' => $user, ':e' => $email, ':p' => $pass]);
        header("Location: ../public/login.php?registro=ok");
    } catch (PDOException $e) {
        header("Location: ../public/registro.php?error=1");
    }
}
