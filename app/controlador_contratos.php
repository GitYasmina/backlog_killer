<?php
session_start();
require_once 'db.php';
require_once 'checkin_helper.php'; // lógica de actualización de niveles

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No autorizado']);
    exit();
}

$id_usuario = $_SESSION['user_id'];
$accion = $_POST['accion'] ?? null;

try {
    if ($accion === 'crear') {
        $id_videojuego = $_POST['id_videojuego'] ?? null;
        $objetivo = !empty($_POST['objetivo']) ? trim($_POST['objetivo']) : null;

        if (!$id_videojuego || !$objetivo) {
            echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios']);
            exit();
        }

        // calculamos la fecha límite sumando exactamente 7 días a la fecha actual
        $fecha_limite = date('Y-m-d', strtotime('+7 days'));

        $stmt = $conexion->prepare("
            INSERT INTO contratos_semanales (id_usuario, id_videojuego, objetivo, fecha_limite) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$id_usuario, $id_videojuego, $objetivo, $fecha_limite]);

        echo json_encode(['status' => 'success']);
        exit();

    } else if ($accion === 'completar') {
        $id_contrato = $_POST['id_contrato'] ?? null;

        if (!$id_contrato) {
            echo json_encode(['status' => 'error', 'message' => 'Falta el identificador del contrato']);
            exit();
        }

        // marcamos el contrato como completado en la base de datos
        $stmt = $conexion->prepare("UPDATE contratos_semanales SET completado = 1 WHERE id = ? AND id_usuario = ?");
        $stmt->execute([$id_contrato, $id_usuario]);

        // traemos la XP y el Nivel actuales del usuario para procesar la recompensa de +30 XP
        $stmt_user = $conexion->prepare("SELECT xp, nivel FROM usuarios WHERE id = ?");
        $stmt_user->execute([$id_usuario]);
        $user_data = $stmt_user->fetch();

        $nueva_xp = ($user_data['xp'] ?? 0) + 30;
        $nuevo_nivel = $user_data['nivel'] ?? 1;
        $xp_para_subir = 100;

        // comprobamos si con la recompensa se supera el umbral de subida de nivel
        $subio_nivel = false;
        if ($nueva_xp >= $xp_para_subir) {
            $nueva_xp = $nueva_xp - $xp_para_subir;
            $nuevo_nivel++;
            $subio_nivel = true;
        }

        // guardamos los nuevos valores de gamificación en el registro del usuario
        $update_user = $conexion->prepare("UPDATE usuarios SET xp = ?, nivel = ? WHERE id = ?");
        $update_user->execute([$nueva_xp, $nuevo_nivel, $id_usuario]);

        // si ha subido de nivel en este paso, lanzamos el disparador de logros correspondiente
        $logro_desbloqueado = null;
        if ($subio_nivel) {
            require_once 'logros_helper.php';
            $nuevos_logros = comprobarLogros($conexion, $id_usuario, 'subir_nivel');
            if (!empty($nuevos_logros)) {
                $logro_desbloqueado = $nuevos_logros[0];
            }
        }

        $respuesta = ['status' => 'success'];
        if ($logro_desbloqueado) {
            $respuesta['logro'] = $logro_desbloqueado;
        }

        echo json_encode($respuesta);
        exit();

    } else if ($accion === 'cancelar') {
        $id_contrato = $_POST['id_contrato'] ?? null;

        if (!$id_contrato) {
            echo json_encode(['status' => 'error', 'message' => 'Falta el identificador del contrato']);
            exit();
        }

        // eliminamos físicamente el contrato para limpiar el tablero sin penalizar al usuario
        $stmt = $conexion->prepare("DELETE FROM contratos_semanales WHERE id = ? AND id_usuario = ?");
        $stmt->execute([$id_contrato, $id_usuario]);

        echo json_encode(['status' => 'success']);
        exit();
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error interno en el servidor']);
}