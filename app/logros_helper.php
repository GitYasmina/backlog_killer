<?php
// función para comprobar y otorgar logros de forma automática
function comprobarLogros($conexion, $user_id, $tipo_accion) {
    
    // buscamos qué logros de este tipo NO tiene todavía el usuario
    $stmt = $conexion->prepare("
        SELECT l.id, l.titulo 
        FROM logros l
        LEFT JOIN logros_usuario lu ON l.id = lu.id_logro AND lu.id_usuario = ?
        WHERE l.tipo_requisito = ? AND lu.id_logro IS NULL
    ");
    $stmt->execute([$user_id, $tipo_accion]);
    $logros_disponibles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($logros_disponibles)) return []; // si ya los tiene todos, salimos

    $logros_desbloqueados_ahora = [];

    // lógica según la acción que acaba de ocurrir
    foreach ($logros_disponibles as $logro) {
        $otorgar = false;

        if ($tipo_accion === 'primer_juego') {
            // contamos si tiene al menos 1 juego en su lista
            $check = $conexion->prepare("SELECT COUNT(*) FROM estados_juego WHERE id_usuario = ?");
            $check->execute([$user_id]);
            if ($check->fetchColumn() >= 1) {
                $otorgar = true;
            }
        }
        
        // verificación para cuando se termina un juego
        if ($tipo_accion === 'primer_terminado') {
            // Contamos si tiene al menos 1 juego con estado 'terminado'
            $check = $conexion->prepare("SELECT COUNT(*) FROM estados_juego WHERE id_usuario = ? AND estado = 'terminado'");
            $check->execute([$user_id]);
            if ($check->fetchColumn() >= 1) {
                $otorgar = true;
            }
        }
        // verificación para cuando escribe una reseña
        if ($tipo_accion === 'primera_resena') {
            // Comprobamos si tiene alguna reseña guardada (no nula y no vacía)
            $check = $conexion->prepare("SELECT COUNT(*) FROM estados_juego WHERE id_usuario = ? AND resena IS NOT NULL AND resena != ''");
            $check->execute([$user_id]);
            if ($check->fetchColumn() >= 1) {
                $otorgar = true;
            }
        }

        // verificación para cuando sube de nivel
        if ($tipo_accion === 'subir_nivel') {
            // Comprobamos si el nivel del usuario es igual o mayor a 2
            $check = $conexion->prepare("SELECT nivel FROM usuarios WHERE id = ?");
            $check->execute([$user_id]);
            if ($check->fetchColumn() >= 2) {
                $otorgar = true;
            }
        }

        // si cumple los requisitos, lo registramos en la tabla intermedia
        if ($otorgar) {
            $insert = $conexion->prepare("INSERT IGNORE INTO logros_usuario (id_usuario, id_logro) VALUES (?, ?)");
            $insert->execute([$user_id, $logro['id']]);
            $logros_desbloqueados_ahora[] = $logro['titulo'];
        }
    }

    return $logros_desbloqueados_ahora; // devolvemos los nombres de los logros ganados en este instante
}