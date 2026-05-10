<?php
ini_set('display_errors', 1);

session_start();
require_once 'db.php'; 

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $usuario = trim($_POST['usuario']);
    $password = $_POST['password'];

    try {
        //buscamos por email o username
        $stmt = $conexion->prepare("SELECT id, username, password FROM usuarios WHERE email = :u OR username = :u LIMIT 1");
        $stmt->bindParam(':u', $usuario);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            //redireccionamos al dashboard si el login es exitoso
            header("Location: ../public/perfil.php");
            exit();
        } else {
            // si no se encuentra el usuario o la contraseña es incorrecta, redirigimos al login con un error
            header("Location: ../public/login.php?error=credenciales");
            exit();
        }
    } catch(PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}