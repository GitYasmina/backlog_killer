<?php include '../views/header.php'; ?>

<main class="login-container">
    <div class="login-card">
        <h2>Crea tu cuenta</h2>

        <form action="../app/auth_registro.php" method="POST" class="login-form">
                <!-- user -->
            <div class="form-group">
                <label>Gamer Tag (Usuario)</label>
                <input type="text" name="username" required placeholder="Ej: Slayer99">
            </div>
                <!-- email -->
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" required placeholder="tu@email.com">
            </div>

            <!-- género favorito  -->
            <div class="form-group">
                <label>Género Favorito</label>
                <select name="genero_fav" class="form-group input">
                    <option value="Acción">Acción</option>
                    <option value="RPG">RPG / Rol</option>
                    <option value="Aventura">Aventura</option>
                    <option value="Shooter">Shooter</option>
                    <option value="Estrategia">Estrategia</option>
                    <option value="Terror">Terror</option>
                    <option value="Indie">Indie</option>
                    <option value="Plataformas">Plataformas</option>
                </select>
            </div>
                <!-- contraseña -->
            <div class="form-group">
                <label>Contraseña</label>
                <input type="password" name="password" required placeholder="••••••••">
            </div>

            <!-- confirmación de Contraseña -->
            <div class="form-group">
                <label>Confirmar Contraseña</label>
                <input type="password" name="confirm_password" required placeholder="Repite tu contraseña">
            </div>

            <button type="submit" class="btn-cta">REGISTRARME</button>
        </form>

        <p class="auth-footer">
            ¿Ya tienes cuenta? <a href="login.php">Inicia sesión</a>
        </p>

    </div>
</main>
<?php include '../views/footer.php'; ?>