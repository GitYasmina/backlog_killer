<?php include '../views/header.php'; ?>

<main class="login-container">
    <div class="login-card">
        <h2>Únete</h2>
        <form action="../app/auth_registro.php" method="POST" class="login-form">
            <div class="form-group">
                <label>Gamer Tag (Usuario)</label>
                <input type="text" name="username" required placeholder="Ej: Slayer99">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" required placeholder="tu@email.com">
            </div>
            <div class="form-group">
                <label>Contraseña</label>
                <input type="password" name="password" required placeholder="••••••••">
            </div>
            <button type="submit" class="btn-cta">REGISTRARME</button>
        </form>
    </div>
</main>
<?php include '../views/footer.php'; ?>