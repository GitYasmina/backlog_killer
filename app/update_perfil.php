<?php
session_start();
require_once 'db.php'; 

// verificamos que el usuario esté logueado
if (!isset($_SESSION['user_id'])) {
    header("Location: ../public/login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = $_SESSION['user_id'];
    
    // recogemos los datos del formulario
    $nuevo_username = trim($_POST['username']);
    $nuevo_email = trim($_POST['email']);
    $nuevo_genero = $_POST['genero_fav'];
    $nuevo_avatar = $_POST['avatar'];

    // guardamos en sesión temporal por si hay algún error de base de datos
    $_SESSION['perfil_temp'] = $_POST;

    try {
        $stmt = $conexion->prepare("UPDATE usuarios SET username = ?, email = ?, genero_fav = ?, avatar = ? WHERE id = ?");
        
        if ($stmt->execute([$nuevo_username, $nuevo_email, $nuevo_genero, $nuevo_avatar, $user_id])) {
            
            // actualizamos también la sesión con el nuevo username para que se refleje en el header
            $_SESSION['username'] = $nuevo_username;

            // limpiamos la "memoria temporal" de errores y redirigimos con éxito
            unset($_SESSION['perfil_temp']);
            header("Location: ../public/perfil.php?update=success");
            exit();
        }

    } catch (PDOException $e) {
        // Si el nombre de usuario o email ya existen en otro usuario
        if ($e->getCode() == 23000) {
            header("Location: ../public/perfil.php?error=exists");
        } else {
            header("Location: ../public/perfil.php?error=db");
        }
        exit();
    }
} else {
    // Si alguien intenta entrar a este archivo sin enviar el formulario
    header("Location: ../public/perfil.php");
    exit();
}