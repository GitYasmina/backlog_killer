<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $user = $_POST['username'];
    $email = $_POST['email'];
    $genero = $_POST['genero_fav'];
    $pass = $_POST['password']; //encriptacion de contraseña
    $confirm_pass = $_POST['confirm_password'];

    //validacion de contraseñas
    if ($pass !== $confirm_pass) {
        header("Location: ../public/registro.php?error=password_mismatch");
        exit();
    }


    //validar que la contraseña tenga al menos 8 caracteres, una mayuscula, una minuscula y un numero
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $pass)) {
        header("Location: ../public/registro.php?error=weak_password");
        exit();
    }
     //encriptacion de contraseña
    $pass_hash = password_hash($pass, PASSWORD_BCRYPT);

    //insercion de datos en la base de datos
    try {
        $stmt = $conexion->prepare("INSERT INTO usuarios (username, email, password, genero_fav) VALUES (:u, :e, :p, :g)");
        $stmt->execute([':u' => $user, ':e' => $email, ':p' => $pass_hash, ':g' => $genero]);
        header("Location: ../public/login.php?registro=ok");
    } catch (PDOException $e) {
        //error si el usuario o email ya existe 
        header("Location: ../public/registro.php?error=1");
    }
}
