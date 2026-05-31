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

   // averiguamos qué avatar tiene actualmente en la BD
    $stmt_avatar_actual = $conexion->prepare("SELECT avatar FROM usuarios WHERE id = ?");
    $stmt_avatar_actual->execute([$user_id]);
    $user_actual = $stmt_avatar_actual->fetch();
    
    // guardamos su avatar actual como base de seguridad
    $avatar_actual_bd = $user_actual['avatar'] ?? 'default.png';

    // si está vacío, usamos la variable de respaldo ($avatar_actual_bd)
    $avatar_final = !empty($_POST['avatar']) ? $_POST['avatar'] : $avatar_actual_bd;

    // guardamos en sesión temporal por si hay algún error de base de datos
    $_SESSION['perfil_temp'] = $_POST;
    // metemos el avatar final en la sesión temporal
    $_SESSION['perfil_temp']['avatar'] = $avatar_final;

    // si el usuario ha subido una foto personal nueva, procesamos la subida y pisamos $avatar_final con el nuevo nombre de archivo
    if (isset($_FILES['foto_personal']) && $_FILES['foto_personal']['error'] === UPLOAD_ERR_OK) {
        
        $fileTmpPath = $_FILES['foto_personal']['tmp_name'];
        $fileName = $_FILES['foto_personal']['name'];
        $fileSize = $_FILES['foto_personal']['size'];
        
        // obtenemos la extensión real del fichero
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));
        
        // filtros de seguridad para evitar subir archivos no deseados o demasiado pesados
        $extensionesPermitidas = ['jpg', 'jpeg', 'png'];
        
        if (in_array($fileExtension, $extensionesPermitidas)) {
            // control de almacenamiento: límite de 2 MB 
            if ($fileSize <= 2 * 1024 * 1024) {
                
                // generamos un nombre único 
                $newFileName = 'avatar_user_' . $user_id . '_' . time() . '.' . $fileExtension;
                
                // ruta absoluta hacia la carpeta de avatares dentro del proyecto
                $uploadFileDir = '../assets/img/avatars/';
                $dest_path = $uploadFileDir . $newFileName;
                
                // movemos el archivo de la memoria temporal de XAMPP a la carpeta del proyecto
                if (move_uploaded_file($fileTmpPath, $dest_path)) {
                    // si sube una foto personal con éxito, pisamos la variable con el nuevo archivo
                    $avatar_final = $newFileName;
                }
            } else {
                header("Location: ../public/perfil.php?error=size");
                exit();
            }
        } else {
            header("Location: ../public/perfil.php?error=extension");
            exit();
        }
    }

    // intentamos actualizar los datos del usuario en la base de datos
    try {
        $stmt = $conexion->prepare("UPDATE usuarios SET username = ?, email = ?, genero_fav = ?, avatar = ? WHERE id = ?");
        
        if ($stmt->execute([$nuevo_username, $nuevo_email, $nuevo_genero, $avatar_final, $user_id])) {
            
            // actualizamos también la sesión con el nuevo username para que se refleje en el header
            $_SESSION['username'] = $nuevo_username;

            // limpiamos la "memoria temporal" de errores y redirigimos con éxito
            unset($_SESSION['perfil_temp']);
            header("Location: ../public/perfil.php?update=success");
            exit();
        }

    } catch (PDOException $e) {
        // si el nombre de usuario o email ya existen en otro usuario
        if ($e->getCode() == 23000) {
            header("Location: ../public/perfil.php?error=exists");
        } else {
            header("Location: ../public/perfil.php?error=db");
        }
        exit();
    }
} else {
    // si alguien intenta entrar a este archivo sin enviar el formulario
    header("Location: ../public/perfil.php");
    exit();
}