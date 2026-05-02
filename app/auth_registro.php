<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $user = $_POST['username'];
    $email = $_POST['email'];
    $genero = $_POST['genero_fav'];
    $pass = password_hash($_POST['password'], PASSWORD_BCRYPT); //encriptacion de contraseña
    $confirm_pass = $_POST['confirm_password'];

    //validacion de contraseñas
    if ($pass !== $confirm_pass) {
        header("Location: ../public/registro.php?error=password_mismatch");
        exit();
    }

    //insercion de datos en la base de datos
    try {
        $stmt = $conexion->prepare("INSERT INTO usuarios (username, email, password, genero_fav) VALUES (:u, :e, :p, :g)");
        $stmt->execute([':u' => $user, ':e' => $email, ':p' => $pass, ':g' => $genero]);
        header("Location: ../public/login.php?registro=ok");
    } catch (PDOException $e) {
        //error si el usuario o email ya existe 
        header("Location: ../public/registro.php?error=1");
    }
}
