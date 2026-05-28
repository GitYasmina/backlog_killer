<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
include '../views/header.php';
?>

<main class="dashboard-container buscador-layout-moderno">

    <section class="buscador-header-premium">
        <h1>🔍 Buscar Videojuegos</h1>
        <p>Conéctate con la base de datos global de RAWG para nutrir tu biblioteca y alimentar la ruleta.</p>

        <div class="buscador-bar-wrapper">
            <input type="text" id="game-search" placeholder="Escribe el nombre de un juego (ej: Elden Ring, Genshin)..." autocomplete="off" autofocus>
            <div id="loading-spinner" class="spinner-buscador-premium" style="display:none;"></div>
        </div>
    </section>

    <section id="search-results" class="buscador-grid-premium">
        <div class="empty-state-buscador">
            <p>Escribe el nombre de un videojuego arriba para buscar... 🚀</p>
        </div>
    </section>
</main>

<script src="../assets/js/buscador.js"></script>
<script src="../assets/js/utils.js"></script>
<?php include '../views/footer.php'; ?>