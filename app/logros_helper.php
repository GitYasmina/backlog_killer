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
        
        // aquí podremos añadir más condiciones como 'primer_terminado' más adelante]

        // si cumple los requisitos, lo registramos en la tabla intermedia
        if ($otorgar) {
            $insert = $conexion->prepare("INSERT IGNORE INTO logros_usuario (id_usuario, id_logro) VALUES (?, ?)");
            $insert->execute([$user_id, $logro['id']]);
            $logros_desbloqueados_ahora[] = $logro['titulo'];
        }
    }

    return $logros_desbloqueados_ahora; // devolvemos los nombres de los logros ganados en este instante
}