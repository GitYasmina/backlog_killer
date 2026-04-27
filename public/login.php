<?php include '../views/header.php'; ?>

<main class="login-container">
    <div class="login-card">
        <h2>Iniciar Sesión</h2>
        
        <form action="../app/auth_login.php" method="POST" class="login-form">
            <div class="form-group">
                <label>Email o Usuario</label>
                <input type="text" name="usuario" required placeholder="Tu gamer tag o email">
            </div>

            <div class="form-group">
                <label>Contraseña</label>
                <input type="password" name="password" required placeholder="••••••••">
            </div>

            <button type="submit" class="btn-cta">ENTRAR</button>
        </form>

        <p class="auth-footer">
            ¿No tienes cuenta? <a href="registro.php">Regístrate aquí</a>
        </p>
    </div>
</main>

<?php include '../views/footer.php'; ?>