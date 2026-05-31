<?php
session_start();
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $user = trim($_POST['username']);
    $email = trim($_POST['email']);
    $genero = trim($_POST['genero_fav']);
    $pass = $_POST['password'];
    $confirm_pass = $_POST['confirm_password'];

   // guardamos los datos en la sesión para persistirlos si hay error 
    $_SESSION['registro_datos'] = [
        'username' => $user,
        'email' => $email,
        'genero_fav' => $genero
    ]; 
    
    //validacion correo
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: ../public/registro.php?error=invalid_email");
        exit();
    }
    
    
    //validacion de que el email no esté ya registrado
    $stmt_check_email = $conexion->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt_check_email->execute([$email]);
    if ($stmt_check_email->fetch()) {
        header("Location: ../public/registro.php?error=email_exists");
        exit();
    }

    //validacion de que el username no esté ya registrado
    $stmt_check_user = $conexion->prepare("SELECT id FROM usuarios WHERE username = ?");
    $stmt_check_user->execute([$user]);
    if ($stmt_check_user->fetch()) {
        header("Location: ../public/registro.php?error=username_exists");
        exit();
    }

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
    // Inserción de datos
    try {
        $stmt = $conexion->prepare("INSERT INTO usuarios (username, email, password, genero_fav) VALUES (:u, :e, :p, :g)");
        $stmt->execute([
            ':u' => $user,
            ':e' => $email,
            ':p' => $pass_hash,
            ':g' => $genero
        ]);

        // si el registro es exitoso, LIMPIAMOS los datos temporales
        unset($_SESSION['registro_datos']);


        $user_id = $conexion->lastInsertId();
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $user;

        header("Location: ../public/perfil.php?registro=nuevo");
        exit();
    } catch (PDOException $e) {
        // en caso de error de base de datos (ej: usuario duplicado)
        // mantenemos los datos en la sesión para que no tenga que reescribirlos
        if ($e->getCode() == 23000) {
            header("Location: ../public/registro.php?error=exists");
        } else {
            header("Location: ../public/registro.php?error=db");
        }
        exit();
    }
}
