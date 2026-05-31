<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
include '../views/header.php';
require_once '../app/db.php';

// Traemos los datos
$stmt = $conexion->prepare("SELECT username, email, genero_fav, avatar ,fecha_alta, xp, nivel FROM usuarios WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$u = $stmt->fetch();

$datos = $_SESSION['perfil_temp'] ?? $u;
unset($_SESSION['perfil_temp']);

$xp_maxima_nivel = 100 + (($u['nivel'] - 1) * 50);

// calculamos el porcentaje basándonos en el tope dinámico real
$porcentaje_xp = (($u['xp'] ?? 0) / $xp_maxima_nivel) * 100;
if ($porcentaje_xp > 100) {
    $porcentaje_xp = 100;
}

?>
    <main class="dashboard-container perfil-layout-moderno">

        <div class="perfil-banner-top">
            <div class="perfil-avatar-preview">
                <?php 
                    // Si por algún motivo está vacío en la base de datos, asignamos default.png
                    $avatar_renderizado = (!empty($u['avatar'])) ? $u['avatar'] : 'default.png'; 
                ?>
                <img src="../assets/img/avatars/<?= htmlspecialchars($avatar_renderizado) ?>" alt="Avatar Actual">
            </div>
            <div class="perfil-user-info-top">
                <h2 class="perfil-titulo-username">¡Hola, <?= htmlspecialchars($u['username']) ?>!</h2>
                <p class="perfil-fecha-alta">Miembro desde: <?= isset($u['fecha_alta']) ? date('d/m/Y', strtotime($u['fecha_alta'])) : 'Reciente' ?></p>

                <div class="perfil-gamificado-horizontal">
                    <div class="badge-nivel">LVL <?= $u['nivel'] ?? 1 ?></div>
                    <div class="xp-progress-wrapper">
                        <div class="barra-xp-bg">
                            <div class="barra-xp-fill" style="width: <?= $porcentaje_xp ?>%;"></div>
                        </div>
                        <span class="texto-xp"><?= $u['xp'] ?? 0 ?> / <?= $xp_maxima_nivel ?> XP para el siguiente nivel</span>
                    </div>
                </div>
            </div>
        </div>

        <?php if (isset($_GET['update']) && $_GET['update'] == 'success'): ?>
            <div class="alert-message success">✅ Cambios guardados correctamente.</div>
        <?php elseif (isset($_GET['error']) && $_GET['error'] == 'exists'): ?>
            <div class="alert-message error">❌ El username o email ya están en uso.</div>
        <?php elseif (isset($_GET['error']) && $_GET['error'] == 'extension'): ?>
            <div class="alert-message error">❌ Formato no válido. Solo se admiten imágenes JPG, JPEG o PNG.</div>
        <?php elseif (isset($_GET['error']) && $_GET['error'] == 'size'): ?>
            <div class="alert-message error">❌ La imagen es demasiado pesada. El límite son 2 MB.</div>
        <?php endif; ?>

        <form action="../app/update_perfil.php" method="POST" enctype="multipart/form-data" class="perfil-form-grid">

            <div class="perfil-bloque-avatar">
                <label class="label-section-title">Imagen de Perfil</label>

                <div class="avatar-selector-grid">
                    <?php
                    $avatares = ['gojoAvatar.png', 'anyaAvatar.png', 'girlAvatar.png', 'sukunaAvatar.png'];
                    foreach ($avatares as $icon):
                        $es_seleccionado = ($datos['avatar'] == $icon);
                    ?>
                        <label class="avatar-option-item">
                            <input type="radio" name="avatar" value="<?= $icon ?>" <?= $es_seleccionado ? 'checked' : '' ?>>
                            <img src="../assets/img/avatars/<?= $icon ?>" alt="Icono <?= htmlspecialchars($icon) ?>">
                        </label>
                    <?php endforeach; ?>
                </div>

                <div class="perfil-upload-custom-box">
                    <span class="upload-custom-txt">¿Prefieres usar una foto propia?</span>
                    <label for="file-upload-input" class="btn-upload-file-trigger">
                        📁 Seleccionar archivo
                    </label>
                    <input type="file" id="file-upload-input" name="foto_personal" accept="image/png, image/jpeg, image/jpg">
                    <p id="file-upload-status" class="upload-status-empty">Ninguna foto seleccionada</p>
                </div>

                <div class="perfil-wrapper-botones-horizontal">
                    <button type="submit" class="btn-cta-perfil">GUARDAR CAMBIOS</button>
                    <a href="#" class="logout-link-action" onclick="confirmarCerrarSesion()">CERRAR SESIÓN</a>
                </div>
            </div>

            <div class="perfil-bloque-datos">
                <label class="label-section-title">Ajustes de la Cuenta</label>

                <div class="campos-datos-row">
                    <div class="form-group-perfil">
                        <label>Gamer Tag</label>
                        <input type="text" name="username" class="input-perfil-dark" value="<?= htmlspecialchars($datos['username']) ?>" required>
                    </div>

                    <div class="form-group-perfil">
                        <label>Email de contacto</label>
                        <input type="email" name="email" class="input-perfil-dark" value="<?= htmlspecialchars($datos['email']) ?>" required>
                    </div>
                </div>

                <div class="form-group-perfil">
                    <label>Género Favorito</label>
                    <select name="genero_fav" class="select-perfil-dark">
                        <?php
                        $generos = ['Acción', 'RPG', 'Aventura', 'Shooter / Tiros', 'Estrategia', 'Terror', 'Indie', 'Plataformas'];
                        foreach ($generos as $g): ?>
                            <option value="<?= $g ?>" <?= $datos['genero_fav'] == $g ? 'selected' : '' ?>><?= $g ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

        </form>
    </main>

    <script>
        // script para mostrar el nombre del archivo seleccionado en el input de subida personalizada y cambiar el estilo del texto
        document.getElementById('file-upload-input').addEventListener('change', function() {
            const statusTxt = document.getElementById('file-upload-status');
            if (this.files && this.files.length > 0) {
                statusTxt.textContent = "✔ Archivo cargado: " + this.files[0].name;
                statusTxt.className = "upload-status-ready";
            } else {
                statusTxt.textContent = "Ninguna foto seleccionada";
                statusTxt.className = "upload-status-empty";
            }
        });
    </script>
    <script src="../assets/js/utils.js"></script>
    <script src="../assets/js/dashboard.js"></script>
    <?php include '../views/footer.php'; ?>