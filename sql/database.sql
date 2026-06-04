-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-06-2026 a las 20:50:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `backlog_killer`
--
CREATE DATABASE IF NOT EXISTS `backlog_killer` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `backlog_killer`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contratos_semanales`
--

DROP TABLE IF EXISTS `contratos_semanales`;
CREATE TABLE IF NOT EXISTS `contratos_semanales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_videojuego` int(11) NOT NULL,
  `objetivo` varchar(255) NOT NULL,
  `completado` tinyint(1) DEFAULT 0,
  `fecha_limite` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_videojuego` (`id_videojuego`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `contratos_semanales`:
--   `id_usuario`
--       `usuarios` -> `id`
--   `id_videojuego`
--       `videojuegos` -> `id`
--

--
-- Volcado de datos para la tabla `contratos_semanales`
--

INSERT INTO `contratos_semanales` (`id`, `id_usuario`, `id_videojuego`, `objetivo`, `completado`, `fecha_limite`) VALUES
(1, 3, 25, 'coger', 1, '2026-06-03'),
(2, 3, 26, 'aaaa', 1, '2026-06-03'),
(3, 3, 13, 'coger', 1, '2026-06-04'),
(8, 5, 34, 'builderarme a kafka', 1, '2026-06-04'),
(9, 5, 34, 'coger', 0, '2026-06-04'),
(12, 6, 20, 'aaaaaa', 1, '2026-06-06'),
(14, 8, 31, 'explorar toda la nueva zona', 1, '2026-06-07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_juego`
--

DROP TABLE IF EXISTS `estados_juego`;
CREATE TABLE IF NOT EXISTS `estados_juego` (
  `id_usuario` int(11) NOT NULL,
  `id_videojuego` int(11) NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'pendiente',
  `horas_jugadas` int(11) NOT NULL DEFAULT 0,
  `nota` int(11) DEFAULT NULL,
  `resena` text DEFAULT NULL,
  PRIMARY KEY (`id_usuario`,`id_videojuego`),
  KEY `fk_estados_videojuego` (`id_videojuego`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `estados_juego`:
--   `id_usuario`
--       `usuarios` -> `id`
--   `id_videojuego`
--       `videojuegos` -> `id`
--

--
-- Volcado de datos para la tabla `estados_juego`
--

INSERT INTO `estados_juego` (`id_usuario`, `id_videojuego`, `estado`, `horas_jugadas`, `nota`, `resena`) VALUES
(3, 8, 'terminado', 19, NULL, NULL),
(3, 9, 'terminado', 1, NULL, NULL),
(3, 10, 'terminado', 30, NULL, NULL),
(3, 11, 'terminado', 4, NULL, NULL),
(3, 13, 'en_progreso', 0, NULL, NULL),
(3, 15, 'terminado', 2, NULL, NULL),
(4, 20, 'pendiente', 0, NULL, NULL),
(4, 47, 'terminado', 1441, NULL, NULL),
(4, 49, 'terminado', 2000, 3, NULL),
(4, 50, 'terminado', 1800, 2, NULL),
(4, 51, 'terminado', 1000, 3, NULL),
(4, 52, 'terminado', 9000, 3, NULL),
(4, 53, 'terminado', 160, 4, 'juegazo'),
(4, 54, 'terminado', 1003, 5, NULL),
(4, 55, 'terminado', 1880, 2, 'bosta'),
(4, 56, 'pendiente', 0, NULL, NULL),
(4, 57, 'en_progreso', 820, NULL, NULL),
(4, 58, 'en_progreso', 112, NULL, NULL),
(4, 59, 'pendiente', 0, NULL, NULL),
(4, 60, 'pendiente', 0, NULL, NULL),
(4, 61, 'pendiente', 0, NULL, NULL),
(4, 62, 'en_progreso', 0, NULL, NULL),
(5, 25, 'en_progreso', 0, NULL, NULL),
(5, 34, 'terminado', 30, 4, 'juegazo'),
(6, 20, 'terminado', 240, 3, NULL),
(6, 64, 'pendiente', 0, NULL, NULL),
(8, 10, 'pendiente', 0, NULL, NULL),
(8, 28, 'pendiente', 0, NULL, NULL),
(8, 31, 'terminado', 140, 3, 'Juegazo'),
(8, 66, 'terminado', 1862, 3, 'brutal'),
(8, 67, 'pendiente', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logros`
--

DROP TABLE IF EXISTS `logros`;
CREATE TABLE IF NOT EXISTS `logros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `tipo_requisito` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `logros`:
--

--
-- Volcado de datos para la tabla `logros`
--

INSERT INTO `logros` (`id`, `titulo`, `descripcion`, `tipo_requisito`) VALUES
(1, 'Cazador de Sombras ⚔️', 'Añade tu primer videojuego al backlog.', 'primer_juego'),
(2, 'Backlog Killer 🔥', 'Completa tu primer videojuego de la lista.', 'primer_terminado'),
(3, 'Viciada Selectiva 🧠', 'Ten al menos 3 juegos de tu género favorito pendientes.', 'genero_preferido'),
(4, 'Crítico de Videojuegos', 'Has escrito tu primera reseña con valoración de estrellas.', 'primera_resena'),
(5, 'Jugador Experimentado', 'Has alcanzado el Nivel 2 en tu cuenta gamer.', 'subir_nivel');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logros_usuario`
--

DROP TABLE IF EXISTS `logros_usuario`;
CREATE TABLE IF NOT EXISTS `logros_usuario` (
  `id_usuario` int(11) NOT NULL,
  `id_logro` int(11) NOT NULL,
  `fecha_desbloqueo` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`,`id_logro`),
  KEY `id_logro` (`id_logro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `logros_usuario`:
--   `id_usuario`
--       `usuarios` -> `id`
--   `id_logro`
--       `logros` -> `id`
--

--
-- Volcado de datos para la tabla `logros_usuario`
--

INSERT INTO `logros_usuario` (`id_usuario`, `id_logro`, `fecha_desbloqueo`) VALUES
(3, 1, '2026-05-18 18:50:14'),
(3, 2, '2026-05-18 18:40:47'),
(3, 4, '2026-05-28 17:24:49'),
(3, 5, '2026-05-27 17:35:51'),
(4, 1, '2026-05-28 19:13:38'),
(4, 2, '2026-05-30 15:47:55'),
(4, 4, '2026-05-30 17:41:18'),
(5, 1, '2026-05-28 20:17:28'),
(5, 2, '2026-05-28 20:22:44'),
(5, 4, '2026-05-28 20:22:44'),
(6, 1, '2026-05-30 21:12:56'),
(6, 2, '2026-05-30 21:14:16'),
(6, 4, '2026-05-30 21:14:16'),
(8, 1, '2026-05-31 13:25:07'),
(8, 2, '2026-05-31 13:26:07'),
(8, 4, '2026-05-31 13:26:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_alta` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultimo_cambio_password` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `avatar` varchar(255) DEFAULT 'default.png',
  `genero_fav` varchar(50) DEFAULT 'Acción',
  `xp` int(11) DEFAULT 0,
  `nivel` int(11) DEFAULT 1,
  `ultimo_checkin` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `usuarios`:
--

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `email`, `password`, `fecha_alta`, `ultimo_cambio_password`, `avatar`, `genero_fav`, `xp`, `nivel`, `ultimo_checkin`) VALUES
(3, 'valeria1', 'val@gmail.com', '$2y$10$dS68R2h/pln0EVjFV07yCumSNJx1Az.KLZzrA9N7HoFFG8Uffbvwm', '2026-05-10 15:56:54', '2026-05-28 19:07:19', 'luffyAvatar.png', 'Estrategia', 30, 2, '2026-05-28'),
(4, 'prueba1', 'prueba@gmail.com', '$2y$10$2Gl0J1mAg4TiKZ9JT5XdTe.DtWNtV6FBrD5p/zzAwMiG05YZ75oOe', '2026-05-28 19:11:50', '2026-05-30 19:47:17', 'sukunaAvatar.png', 'Indie', 40, 1, '2026-05-30'),
(5, 'valeria2', 'valeria2@gmail.com', '$2y$10$lJLzLZtDepX66Ust857Xr.zHp7GRlZ6f4ndXgFM/mV3nWQh7xx7sa', '2026-05-28 20:12:28', '2026-05-30 15:00:43', 'default.png', 'Shooter', 70, 1, '2026-05-30'),
(6, 'pruebA2', 'pruebA2@gmail.com', '$2y$10$bF3bOfCgzMc1KcFC9DQrPeArRW3qjbMs/vwXEnzOaY0JLZAuVWz/O', '2026-05-30 21:09:40', '2026-05-31 11:34:41', 'anyaAvatar.png', 'Terror', 70, 1, '2026-05-31'),
(7, 'prueba33', 'prueba3@gmail.com', '$2y$10$9A5D1WlM.iuCv.HQQAqMfOngM.2fLN7YFHNt.GPZNHhpZSmIS9ESO', '2026-05-31 12:20:11', '2026-05-31 12:35:21', 'avatar1.png', 'Acción', 20, 1, '2026-05-31'),
(8, 'prueba44', 'prueba44@gmail.com', '$2y$10$xiYny7IDQbKY9ZJXOrfnH./0PamMIlQbuqr94sF0eQ9qdc6YQhUma', '2026-05-31 12:39:15', '2026-05-31 14:53:22', 'default.png', 'Aventura', 50, 1, '2026-05-31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `videojuegos`
--

DROP TABLE IF EXISTS `videojuegos`;
CREATE TABLE IF NOT EXISTS `videojuegos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_api` int(11) DEFAULT NULL,
  `titulo` varchar(150) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `plataforma` varchar(50) NOT NULL,
  `genero` varchar(50) NOT NULL,
  `duracion_estimada_horas` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_api` (`id_api`),
  UNIQUE KEY `id_api_2` (`id_api`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `videojuegos`:
--

--
-- Volcado de datos para la tabla `videojuegos`
--

INSERT INTO `videojuegos` (`id`, `id_api`, `titulo`, `imagen_url`, `plataforma`, `genero`, `duracion_estimada_horas`) VALUES
(8, 44972, 'Danganronpa V3: Killing Harmony', 'https://media.rawg.io/media/screenshots/ef2/ef2fded04fb3ed42a84bcd4cb5f7fb18.jpeg', '', 'Puzle', 19),
(9, 42240, 'Doki-Doki Universe', 'https://media.rawg.io/media/screenshots/f47/f47f02a68555e6c01d609c3ea5e39421.jpg', '', 'Arcade', 1),
(10, 415171, 'Valorant', 'https://media.rawg.io/media/games/b11/b11127b9ee3c3701bd15b9af3286d20e.jpg', '', 'Shooter / Tiros', 30),
(11, 15603, 'Strategy & Tactics: Wargame Collection', 'https://media.rawg.io/media/screenshots/2e8/2e860feb84d1ebceee5a911ceb83e7ed.jpg', '', 'Estrategia', 4),
(12, 326243, 'Elden Ring', 'https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg', '', 'Acción', 62),
(13, 60192, 'Elden: Path of the Forgotten', 'https://media.rawg.io/media/screenshots/cfe/cfec498e5a7639219714d5fc8d9709d0.jpg', '', 'Indie', 1),
(14, 977470, 'Elden Ring: Shadow of the Erdtree', 'https://media.rawg.io/media/screenshots/0ba/0bae7160eedc1f7d85a8d2db70cf1ec9.jpg', '', 'Acción', 30),
(15, 18902, 'The Maker\'s Eden', 'https://media.rawg.io/media/screenshots/190/190397f5d65be01ca5e62925a7636ea2.jpg', '', 'Casual', 2),
(16, 111420, 'Jojo-a-GoGo', 'https://media.rawg.io/media/screenshots/124/12401b9023f0f8e58c8b4a49ae6782e9.jpg', '', 'Desconocido', 30),
(17, 10318, 'Blast-off', 'https://media.rawg.io/media/screenshots/c88/c887110dff972da18d6d465a46caea67.jpg', '', 'Indie', 4),
(18, 6303, 'SAS: Zombie Assault 4', 'https://media.rawg.io/media/screenshots/f98/f989a06e10e4e666d233072c61ef264f.jpeg', '', 'Acción', 1),
(19, 270417, 'nec[H]roma', 'https://media.rawg.io/media/screenshots/a56/a561d67412f6729a21f5483f753e9562.jpg', '', 'Puzle', 30),
(20, 981909, 'Touhou Genso Wanderer -FORESIGHT', 'https://media.rawg.io/media/screenshots/2b9/2b932ec282ee3da40acf7b293a2b89e1.jpg', '', 'Indie', 4),
(21, 1481, 'Elder Sign: Omens', 'https://media.rawg.io/media/screenshots/bbe/bbe0b234d574ab22a50cd9a777d07845.jpeg', '', 'Casual', 3),
(22, 378404, 'juego', 'https://media.rawg.io/media/screenshots/eff/effba2105b0dd429791a4eb3f1b9e00f.jpg', '', 'Desconocido', 30),
(23, 172579, 'Rot.', 'https://media.rawg.io/media/screenshots/d77/d7737656f84b71029d83cce9938f1134.jpg', '', 'Simulación', 30),
(24, 389030, 'HENTAI SNIPER: Middle East', 'https://media.rawg.io/media/screenshots/bdf/bdf4cb63747bec853d847863b5bd692d.jpg', '', 'Indie', 2),
(25, 58125, 'Honkai Impact 3rd', 'https://media.rawg.io/media/games/9d3/9d335d988b809912a3f7876523916578.jpg', '', 'Aventura', 30),
(26, 388361, 'Hentai Crush: Love Rhythm', 'https://media.rawg.io/media/games/848/848753c33ac90b49ff4ae070af239a22.jpg', '', 'Casual', 1),
(27, 401805, 'Genshin Impact', 'https://media.rawg.io/media/games/c38/c38bdb5da139005777176d33c463d70f.jpg', '', 'Aventura', 30),
(28, 23548, 'Zombie Gunship Survival', 'https://media.rawg.io/media/screenshots/f43/f433b5aee0e460e244e0d4ce44a96107.jpg', '', 'Estrategia', 2),
(29, 13722, 'Gunship!', 'https://media.rawg.io/media/screenshots/503/503965a6c69808a0fcbf488a1d20072d.jpg', '', 'Acción', 1),
(30, 17472, 'Iron Commando - Koutetsu no Senshi', 'https://media.rawg.io/media/screenshots/139/13978edc57630cf501b10914998d4cd5.jpg', '', 'Acción', 6),
(31, 11587, 'Kenshi', 'https://media.rawg.io/media/games/9eb/9ebae11c9f394b12c24901c9afb867ce.jpg', '', 'Acción', 4),
(32, 3188, 'Danganronpa Another Episode: Ultra Despair Girls', 'https://media.rawg.io/media/screenshots/c44/c4453325f3e4878e540dedcd9e4edfc1.jpg', '', 'Aventura', 6),
(33, 624621, 'Danganronpa: REVIVE', 'https://media.rawg.io/media/screenshots/1dc/1dcf44dc7560e844743b787bb9c42aa9.jpg', '', 'Desconocido', 30),
(34, 840783, 'Honkai Star Rail', 'https://media.rawg.io/media/games/e2f/e2f795d9656be698e8c6ab6ffdff027b.jpg', '', 'Aventura', 30),
(35, 10661, 'Hob', 'https://media.rawg.io/media/games/967/9678f6f9d1aa8850025a2e7b1358ce49.jpg', '', 'Indie', 3),
(36, 382330, 'HONK', 'https://media.rawg.io/media/screenshots/ba7/ba7cc2316348911c65a217a37f92152f.jpg', '', 'Shooter / Tiros', 30),
(37, 367183, 'Cyber Hook', 'https://media.rawg.io/media/screenshots/dd1/dd14d6bb0090e9a9fd3101daf121b279.jpg', '', 'Plataformas', 1),
(38, 541615, 'Alfa', 'https://media.rawg.io/media/screenshots/6e8/6e8d377027e533b51c17e5178227939c.jpg', '', 'Plataformas', 30),
(39, 35398, 'ALFA: аntiterror', 'https://media.rawg.io/media/screenshots/7df/7df8683269558ae2f99c6a5be6b4baa4.jpg', '', 'Estrategia', 30),
(40, 566828, 'Dragon\'s Blade: HoL', 'https://media.rawg.io/media/screenshots/b60/b60ed9471ba445b3eb14dbcc76cde714_KVUkoI4.jpg', '', 'Aventura', 30),
(41, 18448, 'Yury', 'https://media.rawg.io/media/screenshots/d42/d422d87aaf430fcde31b7de2c2eef3cf.jpg', '', 'Indie', 3),
(42, 700930, 'Gar-Bot', 'https://media.rawg.io/media/screenshots/c8a/c8ab48e10a029d4f57c01bf36e12ad56.jpg', '', 'Estrategia', 30),
(43, 331319, 'WWE SmackDown! vs. Raw 2007', 'https://media.rawg.io/media/screenshots/050/0503f3b1d8fb1a6b7896c25dd70da088.jpg', '', 'Arcade', 30),
(44, 912129, 'Loimoi sua gau gau Client', 'https://media.rawg.io/media/screenshots/86b/86bf5ea7bd3bffc0dead7c97c3376989.jpg', '', 'Desconocido', 30),
(45, 199127, 'Rew Goyim', 'https://media.rawg.io/media/screenshots/f51/f517a7d992b8076c2320080350ae6563.jpg', '', 'Desconocido', 30),
(46, 968414, 'ARK: Survival Ascended', 'https://media.rawg.io/media/screenshots/c12/c122154db00ae6e3701c1520aec516f6.jpg', '', 'Aventura', 17),
(47, 292844, 'Hollow Knight: Silksong', 'https://media.rawg.io/media/games/27c/27cd8b7dead05a870f8a514a9a1915ad.jpg', '', 'Indie', 24),
(48, 9810, 'ARK: Survival Evolved', 'https://media.rawg.io/media/games/58a/58ac7f6569259dcc0b60b921869b19fc.jpg', '', 'Aventura', 6),
(49, 289431, 'Eg e fra Bergen', 'https://media.rawg.io/media/screenshots/929/929c0b26d14d3f1c0d937c525e87a61e.jpg', '', 'Desconocido', 30),
(50, 724494, 'TRA', 'https://media.rawg.io/media/screenshots/efd/efdaecfc37dd71d3e06d896eb394b13c.jpg', '', 'Puzle', 30),
(51, 582003, 'tra funkin', 'https://media.rawg.io/media/screenshots/f22/f22fd1ded095d8810873357e750f36b7.jpg', '', 'Desconocido', 30),
(52, 798680, 'Tra Tani', 'https://media.rawg.io/media/screenshots/579/5796763cc5d77d37fdd02ceb4a39b493.jpg', '', 'Desconocido', 30),
(53, 356714, 'Among Us', 'https://media.rawg.io/media/games/e74/e74458058b35e01c1ae3feeb39a3f724.jpg', '', 'Casual', 5),
(54, 51432, 'The Wolf Among Us 2', 'https://media.rawg.io/media/games/845/84539f8f33fea2c753cca0ce3a6d168f.jpg', '', 'Aventura', 30),
(55, 4546, 'Red Dead Redemption: Undead Nightmare', 'https://media.rawg.io/media/games/632/63248c06f2dbf7362ed7add26603d40f.jpg', '', 'Shooter / Tiros', 30),
(56, 57815, 'Suikoden', 'https://media.rawg.io/media/games/ffc/ffc219fe61dc420e3d3de892b76179e0.jpg', '', 'RPG / Rol', 19),
(57, 650977, 'Rue', 'https://media.rawg.io/media/screenshots/f27/f2720203c8a51067924c47414225ebd2.jpg', '', 'Indie', 30),
(58, 406087, 'POL-OS', 'https://media.rawg.io/media/screenshots/1a9/1a9e49b3e274e40bb8b4ec754ce75896.jpg', '', 'Acción', 30),
(59, 535082, 'Pol Purol', 'https://media.rawg.io/media/screenshots/da0/da05d22b6e380b116c06c3d3acc8fafd.jpg', '', 'Aventura', 30),
(60, 101796, 'Hermes & Gry: A Crooked Plan', 'https://media.rawg.io/media/screenshots/e74/e743c7f798903ff3842f418f94073375.jpg', '', 'Aventura', 30),
(61, 462309, 'rat', 'https://media.rawg.io/media/screenshots/7b0/7b068f1da94070b64b53bdb7ddcacdf9.jpg', '', 'Desconocido', 30),
(62, 166780, 'RET', 'https://media.rawg.io/media/screenshots/529/52923d69d42ce147eeeb31995e8e5544.jpg', '', 'Shooter / Tiros', 30),
(63, 3292, 'Suikoden III', 'https://media.rawg.io/media/games/88b/88b5bbde01d7c3d2816d2c813d49769d.jpg', '', 'RPG / Rol', 30),
(64, 187850, 'Tru Savage v1.0 GUWOP', 'https://media.rawg.io/media/screenshots/020/020542cfeeb012534eb2c4d8a8b2d433.jpg', '', 'Plataformas', 30),
(65, 259980, 'Tru Tiên Kiếm', 'https://media.rawg.io/media/screenshots/ed6/ed636ecbca23c6b4644ae3ee52582ae4.jpg', '', 'Acción', 30),
(66, 316631, 'DISC', 'https://media.rawg.io/media/screenshots/5e4/5e4a1afd86fdca7ea3c7a00e6da1f3bd.jpg', '', 'Desconocido', 30),
(67, 427971, 'Disc Room', 'https://media.rawg.io/media/games/f88/f88d992e78f533684f1965bee823f062.jpg', '', 'Indie', 2);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `contratos_semanales`
--
ALTER TABLE `contratos_semanales`
  ADD CONSTRAINT `contratos_semanales_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contratos_semanales_ibfk_2` FOREIGN KEY (`id_videojuego`) REFERENCES `videojuegos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `estados_juego`
--
ALTER TABLE `estados_juego`
  ADD CONSTRAINT `fk_estados_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_estados_videojuego` FOREIGN KEY (`id_videojuego`) REFERENCES `videojuegos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `logros_usuario`
--
ALTER TABLE `logros_usuario`
  ADD CONSTRAINT `logros_usuario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `logros_usuario_ibfk_2` FOREIGN KEY (`id_logro`) REFERENCES `logros` (`id`) ON DELETE CASCADE;
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
