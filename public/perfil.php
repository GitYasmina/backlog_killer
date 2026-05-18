<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
include '../views/header.php';
require_once '../app/db.php';

// Traemos los datos
$stmt = $conexion->prepare("SELECT username, email, genero_fav, avatar ,fecha_alta FROM usuarios WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$u = $stmt->fetch();

$datos = $_SESSION['perfil_temp'] ?? $u;
unset($_SESSION['perfil_temp']);
?>

<main class="dashboard-container">
    <div class="login-card perfil-card">

        <div class="perfil-header">
            <div class="avatar-preview">
                <img src="../assets/img/avatars/<?= htmlspecialchars($u['avatar']) ?>" alt="Avatar Actual">
            </div>
            <h2>¡Hola, <?= htmlspecialchars($u['username']) ?>!</h2>
            <p class="membership-date">
                Miembro desde: <?= isset($u['fecha_alta']) ? date('d/m/Y', strtotime($u['fecha_alta'])) : 'Reciente' ?>
            </p>
        </div>

        <?php if (isset($_GET['update']) && $_GET['update'] == 'success'): ?>
            <div class="alert-message success">✅ Cambios guardados correctamente.</div>
        <?php elseif (isset($_GET['error']) && $_GET['error'] == 'exists'): ?>
            <div class="alert-message error">❌ El username o email ya están en uso.</div>
        <?php endif; ?>

        <form action="../app/update_perfil.php" method="POST">
            
            <div class="form-group">
                <label>Selecciona tu Avatar</label>
                <div class="avatar-options">
                    <?php 
                    $avatares = ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png'];
                    foreach ($avatares as $icon): 
                        $es_seleccionado = ($datos['avatar'] == $icon);
                    ?>
                        <label class="avatar-item">
                            <input type="radio" name="avatar" value="<?= $icon ?>" <?= $es_seleccionado ? 'checked' : '' ?>>
                            <img src="../assets/img/avatars/<?= $icon ?>" 
                                 class="<?= $es_seleccionado ? 'selected' : '' ?>"
                                 alt="Icono <?= htmlspecialchars($icon) ?>">
                        </label>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="form-group">
                <label>Gamer Tag</label>
                <input type="text" name="username" value="<?= htmlspecialchars($datos['username']) ?>" required>
            </div>

            <div class="form-group">
                <label>Email de contacto</label>
                <input type="email" name="email" value="<?= htmlspecialchars($datos['email']) ?>" required>
            </div>

            <div class="form-group">
                <label>Género Favorito</label>
                <select name="genero_fav" class="select-ruleta-perfil">
                    <?php
                    $generos = ['Acción', 'RPG', 'Aventura', 'Shooter / Tiros', 'Estrategia', 'Terror', 'Indie', 'Plataformas'];
                    foreach ($generos as $g): ?>
                        <option value="<?= $g ?>" <?= $datos['genero_fav'] == $g ? 'selected' : '' ?>><?= $g ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <button type="submit" class="btn-cta">ACTUALIZAR PERFIL</button>
        </form>

        <p class="auth-footer">
            <a href="../app/logout.php" class="btn-logout">Cerrar Sesión</a>
        </p>
    </div>
</main>

<?php include '../views/footer.php'; ?>