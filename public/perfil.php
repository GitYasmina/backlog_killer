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

<main class="login-container">
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
        <?php elseif (isset($_GET['error'])): ?>
            <div class="alert-message error">❌ Error al actualizar: <?= htmlspecialchars($_GET['error']) ?></div>
        <?php endif; ?>

        <form action="../app/update_perfil.php" method="POST" class="login-form">

            <div class="form-group">
                <label>Elige tu Avatar</label>
                <div class="avatar-selector">
                    <?php
                    $iconos = ['default.png', 'ninja.png', 'warrior.png', 'mage.png', 'robot.png'];
                    foreach ($iconos as $icon):
                        $isSelected = ($datos['avatar'] == $icon);
                    ?>
                        <label class="avatar-option">
                            <input type="radio" name="avatar" value="<?= htmlspecialchars($icon) ?>" <?= $isSelected ? 'checked' : '' ?>>
                            <img src="../assets/img/avatars/<?= htmlspecialchars($icon) ?>"
                                class="<?= $isSelected ? 'selected' : '' ?>"
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
                <select name="genero_fav" class="form-group input">
                    <?php
                    $generos = ['Acción', 'RPG', 'Aventura', 'Shooter', 'Estrategia', 'Terror', 'Indie', 'Plataformas'];
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