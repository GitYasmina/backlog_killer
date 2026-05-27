<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Backlog Killer</title>
    <link rel="stylesheet" href="../assets/css/estilos.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body>
    <header class="main-header">
        <div class="header-container">
            <div class="logo">
                <a href="<?= isset($_SESSION['user_id']) ? 'dashboard.php' : 'index.php' ?>">
                    <strong>Backlog Killer</strong>
                </a>
            </div>

            <nav class="nav-menu">
                <ul>
                    <?php if (isset($_SESSION['user_id'])): ?>
                        <li><a href="dashboard.php">Biblioteca</a></li>
                        <li><a href="buscar_juego.php">Buscar</a></li>
                        <li><a href="ruleta.php">Ruleta</a></li>
                        <a href="perfil.php" class="nav-link">Mi Perfil</a>
                        <a href="logros.php" class="nav-link">Mis Logros</a>
                        <li><a href="logout.php">Salir</a></li>
                    <?php else: ?>
                        <li><a href="index.php">Inicio</a></li>
                        <li><a href="login.php">Login</a></li>
                        <li><a href="registro.php">Registro</a></li>
                    <?php endif; ?>
                </ul>
            </nav>
        </div>
    </header>