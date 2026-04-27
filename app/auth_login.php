<?php
session_start();
require_once 'db.php'; 

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $usuario = $_POST['usuario'];
    $password = $_POST['password'];

    try {
        $stmt = $conexion->prepare("SELECT id, username, password FROM usuarios WHERE email = :u OR username = :u LIMIT 1");
        $stmt->bindParam(':u', $usuario);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            header("Location: ../public/dashboard.php");
        } else {
            header("Location: ../public/login.php?error=1");
        }
    } catch(PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}