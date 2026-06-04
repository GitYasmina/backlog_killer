<?php include '../views/header.php'; ?>

<main class="login-container">
    <div class="login-card">
        <h2>Iniciar Sesión</h2>
        <?php if (isset($_GET['error'])): ?>
            <div class="alert-message error">
                <?php
                if ($_GET['error'] == 'credenciales') echo "⚠️ Usuario o contraseña incorrectos.";
                else echo "⚠️ Ha ocurrido un error al iniciar sesión.";
                ?>
            </div>
        <?php endif; ?>
        <form action="../app/auth_login.php" method="POST" class="login-form">
            <div class="form-group">
                <label>Email o Usuario</label>
                <input type="text" name="usuario" id="usuario" required placeholder="Tu gamer tag o email">
            </div>

            <div class="form-group">
                <label>Contraseña</label>
                <div class="password-wrapper-premium">
                    <input type="password" name="password" id="password" autocomplete="new-password" required placeholder="••••••••">
                    <button type="button" class="btn-toggle-eye" onclick="toggleVisibilidadPassword('password', 'eye-icon-1')">
                        <i class="fa-solid fa-eye" id="eye-icon-1"></i>
                    </button>
                </div>
            </div>

            <button type="submit" class="btn-cta">ENTRAR</button>
        </form>

        <p class="auth-footer">
            ¿No tienes cuenta? <a href="registro.php">Regístrate aquí</a>
        </p>
    </div>
</main>
<script src="../assets/js/utils.js"></script>

<?php include '../views/footer.php'; ?>