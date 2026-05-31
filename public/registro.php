<?php 
session_start();
include '../views/header.php'; 
// recuperamos los datos temporales en caso de error para rellenar el formulario
$old = $_SESSION['registro_datos'] ?? ['username' => '', 'email' => '', 'genero_fav' => 'Acción'];
// limpiamos los datos temporales para que no persistan después de mostrarlos una vez
unset($_SESSION['registro_datos']);
?>

<main class="login-container">
    <div class="login-card">
        <h2>Crea tu cuenta</h2>

        <?php if (isset($_GET['error'])): ?>
            <div class="alert-message error">
                <?php
                if ($_GET['error'] == 'password_mismatch') echo "⚠️ Las contraseñas no coinciden.";
                elseif ($_GET['error'] == 'exists') echo "⚠️ El usuario o email ya existen.";
                elseif ($_GET['error'] == 'weak_password') echo "⚠️ La contraseña debe tener 8 caracteres, una mayuscula, una minuscula y un numero.";
                else echo "⚠️ Error técnico: " . htmlspecialchars($_GET['error']);
                ?>
            </div>
        <?php endif; ?>
        <form action="../app/auth_registro.php" method="POST" class="login-form">
            <div class="form-group">
                <label for="username">Gamer Tag (Usuario)</label>
                <input type="text" name="username" id="username" autocomplete="username" required value="<?= htmlspecialchars($old['username']) ?>" placeholder="Ej: Slayer99">
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" name="email" id="email" autocomplete="email" required placeholder="tu@email.com" value="<?= htmlspecialchars($old['email']) ?>">
            </div>

            <div class="form-group">
                <label for="genero_fav">Género Favorito</label>
                <select name="genero_fav" id="genero_fav" class="form-group input">
                    <option value="Acción" <?= $old['genero_fav'] == 'Acción' ? 'selected' : '' ?>>Acción</option>
                    <option value="RPG" <?= $old['genero_fav'] == 'RPG' ? 'selected' : '' ?>>RPG / Rol</option>
                    <option value="Aventura" <?= $old['genero_fav'] == 'Aventura' ? 'selected' : '' ?>>Aventura</option>
                    <option value="Shooter" <?= $old['genero_fav'] == 'Shooter' ? 'selected' : '' ?>>Shooter</option>
                    <option value="Estrategia" <?= $old['genero_fav'] == 'Estrategia' ? 'selected' : '' ?>>Estrategia</option>
                    <option value="Terror" <?= $old['genero_fav'] == 'Terror' ? 'selected' : '' ?>>Terror</option>
                    <option value="Indie" <?= $old['genero_fav'] == 'Indie' ? 'selected' : '' ?>>Indie</option>
                    <option value="Plataformas" <?= $old['genero_fav'] == 'Plataformas' ? 'selected' : '' ?>>Plataformas</option>
                </select>
            </div>

            <div class="form-group">
                <label for="password">Contraseña</label>
                <div class="password-wrapper-premium">
                    <input type="password" name="password" id="password" autocomplete="new-password" required placeholder="••••••••">
                    <button type="button" class="btn-toggle-eye" onclick="toggleVisibilidadPassword('password', 'eye-icon-1')">
                        <i class="fa-solid fa-eye" id="eye-icon-1"></i>
                    </button>
                </div>
                
                <div class="password-strength-wrapper">
                    <div id="strength-bar"></div>
                </div>
                <small id="strength-text"></small>
            </div>

            <div class="form-group">
                <label for="confirm_password">Confirmar Contraseña</label>
                <div class="password-wrapper-premium">
                    <input type="password" name="password" id="confirm_password" autocomplete="new-password" required placeholder="Repite tu contraseña">
                    <button type="button" class="btn-toggle-eye" onclick="toggleVisibilidadPassword('confirm_password', 'eye-icon-2')">
                        <i class="fa-solid fa-eye" id="eye-icon-2"></i>
                    </button>
                </div>
            </div>

            <button type="submit" class="btn-cta">REGISTRARME</button>
        </form>

        <p class="auth-footer">
            ¿Ya tienes cuenta? <a href="login.php">Inicia sesión</a>
        </p>
    </div>
</main>
<script src="../assets/js/utils.js"></script>
<script src="../assets/js/validaciones.js"></script>
<?php include '../views/footer.php'; ?>