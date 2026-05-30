<?php
// función para procesar el acceso diario del usuario y dar experiencia
function procesarCheckinDiario($conexion, $id_usuario)
{
    // inicializamos las variables de control
    $resultado = [
        'mostrar_aviso' => false,
        'xp_ganada' => 20
    ];

    // consultamos los datos actuales del usuario
    $stmt = $conexion->prepare("SELECT xp, nivel, ultimo_checkin FROM usuarios WHERE id = ?");
    $stmt->execute([$id_usuario]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        return $resultado;
    }
    $xp_para_subir = 100 + (($usuario['nivel'] - 1) * 50); // fórmula para aumentar el XP necesario por nivel

    $fecha_hoy = date('Y-m-d');

    // comprobamos si la fecha de hoy es distinta a la del último registro
    if ($usuario['ultimo_checkin'] !== $fecha_hoy) {
        $nueva_xp = $usuario['xp'] + $resultado['xp_ganada'];
        $nuevo_nivel = $usuario['nivel'];

        // lógica de subida de nivel si supera los 100 puntos
        if ($nueva_xp >= $xp_para_subir) {
            $nueva_xp = $nueva_xp - $xp_para_subir;
            $nuevo_nivel++;

            // comprobamos si el nuevo nivel desbloquea algún logro
            require_once 'logros_helper.php';
            comprobarLogros($conexion, $id_usuario, 'subir_nivel');
        }

        // actualizamos los datos en la base de datos
        $update = $conexion->prepare("UPDATE usuarios SET xp = ?, nivel = ?, ultimo_checkin = ? WHERE id = ?");
        $update->execute([$nueva_xp, $nuevo_nivel, $fecha_hoy, $id_usuario]);

        // activamos el aviso para el frontend
        $resultado['mostrar_aviso'] = true;
    }

    return $resultado;
}
