<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
include '../views/header.php';
require_once '../app/db.php';

// Traemos los datos
$stmt = $conexion->prepare("SELECT username, email, genero_fav, avatar FROM usuarios WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$u = $stmt->fetch();
?>

<main class="login-container">
    <div class="login-card">

        <h2>Configuración de Perfil</h2>

        <form action="../app/update_perfil.php" method="POST" class="login-form">

            <div class="form-group">
                <label>Gamer Tag</label>
                <input type="text" name="username" value="<?= htmlspecialchars($u['username']) ?>" required placeholder="Tu gamer tag">
            </div>

            <div class="form-group">
                <label>Género Favorito</label>
                <select name="genero_fav" class="form-group input">
                    <option value="Acción" <?= $u['genero_fav'] == 'Acción' ? 'selected' : '' ?>>Acción</option>
                    <option value="RPG" <?= $u['genero_fav'] == 'RPG' ? 'selected' : '' ?>>RPG / Rol</option>
                    <option value="Aventura" <?= $u['genero_fav'] == 'Aventura' ? 'selected' : '' ?>>Aventura</option>
                    <option value="Shooter" <?= $u['genero_fav'] == 'Shooter' ? 'selected' : '' ?>>Shooter</option>
                    <option value="Estrategia" <?= $u['genero_fav'] == 'Estrategia' ? 'selected' : '' ?>>Estrategia</option>
                    <option value="Terror" <?= $u['genero_fav'] == 'Terror' ? 'selected' : '' ?>>Terror</option>
                    <option value="Indie" <?= $u['genero_fav'] == 'Indie' ? 'selected' : '' ?>>Indie</option>
                    <option value="Plataformas" <?= $u['genero_fav'] == 'Plataformas' ? 'selected' : '' ?>>Plataformas</option>
                </select>
            </div>

            <button type="submit" class="btn-cta">GUARDAR CAMBIOS</button>
        </form>
        <p class="auth-footer">
            <a href="../app/logout.php" style="color: #ff4b4b;">Cerrar Sesión</a>
        </p>
    </div>
</main>
<?php include '../views/footer.php'; ?>