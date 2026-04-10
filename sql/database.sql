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
  avatar VARCHAR(255) DEFAULT 'default.png'
);

-- Catálogo de videojuegos (Preparado para RAWG API)
CREATE TABLE videojuegos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_api INT UNIQUE, -- ID de api RAWG
  titulo VARCHAR(150) NOT NULL,
  plataforma VARCHAR(50) NOT NULL,
  genero VARCHAR(50) NOT NULL,
  duracion_estimada_horas INT -- imprescindible para la ruleta
);