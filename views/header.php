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
                        <li>
                            <a href="buscar_juego.php">
                                <i class="fa-solid fa-magnifying-glass"></i> Buscar
                            </a>
                        </li>

                        <li>
                            <a href="dashboard.php">
                                <i class="fa-solid fa-layer-group"></i> Biblioteca
                            </a>
                        </li>
                        <li>
                            <a href="ruleta.php">
                                <i class="fa-solid fa-dice"></i> Ruleta
                            </a>
                        </li>
                        <li>
                            <a href="perfil.php">
                                <i class="fa-solid fa-user"></i> Mi Perfil
                            </a>
                        </li>
                        <li>
                            <a href="logros.php">
                                <i class="fa-solid fa-trophy"></i> Mis Logros
                            </a>
                        </li>

                        <li>
                            <a href="javascript:void(0);" onclick="confirmarCerrarSesion()" class="btn-logout-premium" title="Cerrar Sesión">
                                <i class="fa-solid fa-right-from-bracket"></i>
                            </a>
                        </li>
                    <?php else: ?>
                        <li><a href="index.php"><i class="fa-solid fa-house"></i> Inicio</a></li>
                        <li><a href="login.php"><i class="fa-solid fa-right-to-bracket"></i> Login</a></li>
                        <li><a href="registro.php"><i class="fa-solid fa-user-plus"></i> Registro</a></li>
                    <?php endif; ?>
                </ul>
            </nav>
        </div>
    </header>

    <div id="modal-logout-confirmar" class="modal-overlay">
        <div class="modal-content modal-danger-premium">
            <div class="modal-danger-icon">🚪</div>
            <h3>¿Cerrar Sesión?</h3>
            <p>Estás a punto de salir de la plataforma. Se mantendrá a salvo tu racha diaria y el progreso actual de tus juegos.</p>

            <div class="modal-actions">
                <button onclick="cerrarModalLogout()" class="btn-modal-cancel">Volver al Vicio</button>
                <a href="../app/logout.php" class="btn-modal-danger-execute" style="text-decoration: none; text-align: center; display: inline-flex; align-items: center; justify-content: center;">Salir del Juego</a>
            </div>
        </div>
    </div>

