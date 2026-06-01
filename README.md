#Backlog Killer

> **Proxecto de Desenvolvemento de Aplicacións Web (DAW)** 
> *I.E.S. Fernando Wirtz Suárez (Ano académico: 2025-2026)*

**Backlog Killer** é unha aplicación web dinámica deseñada para centralizar, organizar e xestionar bibliotecas persoais de videoxogos. O seu obxectivo principal é solucionar a "parálise de decisión" dos xogadores mediante mecánicas de gamificación e ferramentas interactivas.

---

## Características Principais

*   **Xestión de Biblioteca (CRUD):** Control total (alta, consulta, modificación e eliminación) de videoxogos clasificados por estados: *Pendiente, En progreso, Terminado* e *Abandonado*.
*   **A Ruleta de Selección:** Un compoñente visual interactivo que selecciona un xogo pendente de forma aleatoria e divertida para romper a indecisión.
*   **Gamificación Activa:** Sistema de progreso con acumulación de puntos de experiencia (XP), subidas de nivel de conta e desbloqueo automático de logros (medallas virtuales).
*   **Contratos Semanais:** Panel de micro-obxectivos con data de expiración que inxectan experiencia extra ao completarse.
*   **Autenticación Segura:** Sistema de rexistro e inicio de sesión con encriptación de contrasinais e illamento completo de datos por usuario.
*   **Deseño Inmersivo:** Interface moderna en modo oscuro (*Gamer UI*) totalmente responsiva para ordenadores e dispositivos móbiles.

---

## Tecnoloxías Empregadas

*   **Frontend:** HTML5, CSS3 Nativo (Variables, Flexbox, Grid) e JavaScript (ES6+).
*   **Comunicación asíncrona:** Fetch API para actualizacións dinámicas sen recarga de pantalla.
*   **Backend:** PHP 8 (Arquitectura modular e segura).
*   **Base de Datos:** MySQL con conexión blindada mediante **PDO** (Consultas preparadas contra inxección SQL).
*   **APIs externas:** Integración asíncrona coa API de **RAWG.io** para a procura de carátulas en tempo real.

---

## Estrutura do Repositorio

```text
├── /app          # Lógica xeral do sistema e configuracións compartidas.
├── /views        # Interfaces de usuario e maquetación visual (HTML/CSS).
├── /public       # Recursos accesibles (Scripts JS, imaxes, avatares).
├── /sql          # Scripts de creación e estrutura da base de datos.
└── index.php     # Enrutador principal da aplicación.
