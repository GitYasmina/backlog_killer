<?php
include '../views/header.php';
?>

<main>
    <section class="hero-section">
        <div class="hero-text">
            <h1>¡DEJA DE PERDER EL TIEMPO DECIDIENDO QUÉ JUGAR!</h1>
            <p>Conecta tu biblioteca, gira la ruleta y deja que el destino elija tu próxima partida.</p>
            <a href="registro.php" class="btn-cta">EMPIEZA AHORA</a>
        </div>
        <div class="hero-visual">
            <div class="ruleta-placeholder"></div>
        </div>
    </section>

    <section id="funciona" class="features-grid">
        <div class="feature-card">
            <h3>1. Conecta</h3>
            <p>Sincroniza tus cuentas de Steam, Epic o añade tus juegos a mano.</p>
        </div>
        <div class="feature-card">
            <h3>2. Filtra</h3>
            <p>Dinos cuánto tiempo tienes y qué género te apetece hoy.</p>
        </div>
        <div class="feature-card">
            <h3>3. Juega</h3>
            <p>La ruleta elige por ti. ¡Se acabó el mirar la biblioteca sin hacer nada!</p>
        </div>
    </section>

    <section id="faq" class="faq-section">
        <h2 style="text-align: center; margin-bottom: 40px;">Preguntas Frecuentes</h2>
        <div class="faq-item">
            <h4>¿Es compatible con consolas?</h4>
            <p>¡Sí! Puedes añadir manualmente cualquier juego de PS5, Xbox o Nintendo Switch.</p>
        </div>
        <div class="faq-item">
            <h4>¿Cómo funciona la ruleta?</h4>
            <p>Utiliza un algoritmo de selección aleatoria basado en tus filtros de tiempo y prioridad.</p>
        </div>
    </section>

    <section class="cta-final">
        <h2>¿Listo para reducir tu lista de pendientes?</h2>
        <p>Únete a la comunidad de Backlog Killers hoy mismo.</p>
        <a href="registro.php" class="btn-cta" style="background: var(--morado-hover);">REGISTRARME GRATIS</a>
    </section>
</main>

<?php
include '../views/footer.php';
?>