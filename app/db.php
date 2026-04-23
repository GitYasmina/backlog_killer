<?php
$host = "localhost";
$db_name = "backlog_killer";
$user = "root";
$password = "";

try {
    // para evitar inyecciones SQL
    $conexion = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $user, $password);
    
    // eñes y los acentos
    $conexion->exec("set names utf8mb4");
    
    // que me avise si algo falla en las consultas
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch(PDOException $exception) {
    echo "Error de conexión: " . $exception->getMessage();
}
