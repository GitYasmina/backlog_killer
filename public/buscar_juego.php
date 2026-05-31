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

<!-- sacamos las IDs de los juegos del usuario y se las inyectamos de forma segura a JS -->
<?php
require_once '../app/db.php';

$stmt_ids = $conexion->prepare("
    SELECT v.id_api 
    FROM estados_juego ej
    JOIN videojuegos v ON ej.id_videojuego = v.id
    WHERE ej.id_usuario = ?
");
$stmt_ids->execute([$_SESSION['user_id']]);
$mis_juegos_api_ids = $stmt_ids->fetchAll(PDO::FETCH_COLUMN);

// si el usuario no tiene juegos aún, evitamos errores mandando un array vacío limpio
$array_js = !empty($mis_juegos_api_ids) ? json_encode(array_map('intval', $mis_juegos_api_ids)) : '[]';
?>
<script>
    // inyectamos de forma segura el array de IDs de RAWG que el usuario tiene en su biblioteca local para que el buscador pueda marcar los juegos ya agregados
    const misJuegosBiblioteca = <?= $array_js ?>;
    console.log("IDs de RAWG en mi biblioteca local:", misJuegosBiblioteca);
</script>

<script src="../assets/js/utils.js"></script>
<script src="../assets/js/buscador.js"></script>
<?php include '../views/footer.php'; ?>