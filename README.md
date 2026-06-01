# Backlog Killer

> **Proyecto de Desarrollo de Aplicaciones Web (DAW)** 
> *I.E.S. Fernando Wirtz Suárez (Año académico: 2025-2026)*

**Backlog Killer** es una aplicación web dinámica orientada a la gestión y organización de bibliotecas personales de videojuegos. El objetivo principal de esta herramienta es resolver el fenómeno de la "parálisis de decisión" entre los jugadores mediante un sistema interactivo, dinámicas de gamificación y un control eficiente del catálogo de títulos pendientes.

---

##  Características Principales

*   **Gestión de Biblioteca (CRUD):** Control completo (alta, consulta, modificación de progresos y eliminación) de títulos almacenados de forma segura en la base de datos.
*   **Clasificación por Estados:** Segmentación del catálogo en cuatro categorías clave: *Pendiente, En progreso, Terminado* y *Abandonado*.
*   **La Ruleta de Selección:** Componente interactivo visual diseñado para seleccionar un videojuego aleatoriamente del catálogo pendiente, reduciendo la indecisión de forma divertida.
*   **Gamificación Activa:** El usuario gana puntos de experiencia (XP) y sube de nivel real en su perfil de cuenta al registrar sesiones de juego o completar objetivos.
*   **Tablón de Contratos Semanales:** Panel interactivo para fijar micro-metas específicas asociadas a una fecha límite, incentivando la constancia a cambio de recompensas de XP.
*   **Autenticación de Usuarios Seguro:** Sistema de registro e inicio de sesión basado en variables de sesión del servidor (`$_SESSION`) con encriptación de contraseñas.
*   **Diseño Moderno e Inmersivo:** Interfaz limpia adaptada al contexto digital contemporáneo con un modo oscuro dominante para reducir la fatiga visual.

---

##  Tecnologías Empleadas

*   **Frontend:** HTML5 (estructura semántica) y CSS3 nativo (diseño responsive utilizando Grid, Flexbox y variables).
*   **Interactividad:** JavaScript (ES6+) para validaciones inmediatas en el cliente y lógica de componentes web.
*   **Comunicación Asíncrona:** Fetch API para la realización de peticiones en segundo plano sin recargas de pantalla.
*   **Backend:** PHP 8 para procesar la lógica de negocio, cálculos de experiencia y validaciones de seguridad.
*   **Base de Datos:** MySQL y el uso de **PDO** en PHP para garantizar conexiones blindadas mediante consultas preparadas contra inyecciones SQL.
*   **Integración de APIs:** Conexión asíncrona con la API pública de **RAWG.io** exclusivamente para buscar títulos individuales y renderizar carátulas en tiempo real.

---

##  Estructura del Repositorio

El proyecto se encuentra organizado siguiendo una separación clara de responsabilidades:

```text
├── /app          # Contiene la lógica general del sistema y configuraciones compartidas.
├── /views        # Interfaces de usuario desarrolladas en HTML y CSS.
├── /public       # Recursos accesibles desde el navegador (scripts JS, estilos, avatares).
├── /sql          # Almacena los scripts relacionados con la estructura de la base de datos.
└── index.php     # Enrutador principal y procesamiento de acciones específicas.
```
---
## Instalación y Despliegue Local
1. **Clonar repositorio:**
   * git clone [https://github.com/GitYasmina/BacklogKiller.git](https://github.com/GitYasmina/BacklogKiller.git)
  
2.  **Mover al servidor local:**
    *   Copia los archivos del proyecto dentro del directorio de publicación de tu servidor local (por ejemplo, en la carpeta `htdocs` si utilizas XAMPP).
    *   Inicia los servicios de **Apache** y **MySQL** desde el panel de control de tu entorno de servidor.
3.  **Importar la Base de Datos:**
    *   Accede a un gestor de bases de datos como `phpMyAdmin`.
    *   Crea una nueva base de datos relacional llamada `backlog_killer`.
    *   Importa el script SQL de creación de tablas almacenado en el directorio `/sql` del proyecto.
4.  **Verificar la Conexión:**
    *   Asegúrate de que las credenciales de acceso (host, dbname, usuario y contraseña) coincidan con tu configuración local en el script de conexión PDO.
5.  **Ejecutar la Aplicación:**
    *   Abre tu navegador web de preferencia e introduce la dirección local: `http://localhost/BacklogKiller`.

---

## Información del Proyecto

*   **Alumno:** Yasmina Achahbar
*   **Tutor:** Eva Naveira Domínguez
*   **Centro Educativo:** I.E.S. Fernando Wirtz Suárez (A Coruña)
