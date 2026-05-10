<?php
session_start();
if (!isset($_SESSION['user_id'])) { header("Location: login.php"); exit(); }
include '../views/header.php';
?>

<main class="dashboard-container">
    <section class="search-header">
        <h1>🔍 Buscar Videojuegos</h1>
        <p>Añade juegos a tu biblioteca para que la ruleta pueda elegirlos.</p>
        
        <div class="search-bar-container">
            <input type="text" id="game-search" placeholder="Escribe el nombre de un juego (ej: Elden Ring)..." autocomplete="off">
            <div id="loading-spinner" class="spinner" style="display:none;"></div>
        </div>
    </section>

    <section id="search-results" class="games-grid">
        <div class="empty-state">
            <p>Escribe algo arriba para empezar a buscar.</p>
        </div>
    </section>
</main>
<script src="../assets/js/buscador.js"></script>

<?php include '../views/footer.php'; ?>