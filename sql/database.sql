-- Creación de la base de datos teniendo en cuenta caracteres especiales
CREATE DATABASE IF NOT EXISTS backlog_killer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE backlog_killer;

-- Tabla usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_cambio_password TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, --seguridad de contraseña
  avatar VARCHAR(255) DEFAULT 'default.png',
  genero_fav VARCHAR(50) DEFAULT 'Acción' --para el algoritmo de la ruletta
);

-- Catálogo de videojuegos (Preparado para RAWG API)
CREATE TABLE videojuegos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_api INT UNIQUE, -- ID de api RAWG
  titulo VARCHAR(150) NOT NULL,
  plataforma VARCHAR(50) NOT NULL,
  genero VARCHAR(50) NOT NULL,
  duracion_estimada_horas INT --para la ruleta
);
-- Tabla intermedia: lista de cada usuario (Relación N:M)
CREATE TABLE estados_juego (
  id_usuario INT NOT NULL,
  id_videojuego INT NOT NULL,
  estado ENUM ('pendiente','en_progreso','completado','abandonado') NOT NULL DEFAULT 'pendiente',
  puntuacion INT CHECK (puntuacion BETWEEN 0 AND 10),
  horas_jugadas INT DEFAULT 0, -- del usuario
  porcentaje_manual INT DEFAULT 0,
  
  PRIMARY KEY (id_usuario, id_videojuego),
  
  CONSTRAINT fk_estados_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id)
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_estados_videojuego
    FOREIGN KEY (id_videojuego)
    REFERENCES videojuegos(id)
    ON DELETE CASCADE --si el juego se borra, se borra de la lista del usuario
    ON UPDATE CASCADE
);