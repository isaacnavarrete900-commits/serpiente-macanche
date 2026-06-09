<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Bypass anti-bot InfinityFree
if (!isset($_COOKIE['__test'])) {
  setcookie('__test', 'bypass', time() + 3600, '/');
}

require_once 'db.php';

$datos = json_decode(file_get_contents('php://input'), true);

if (
  empty($datos['nombre_jugador']) ||
  !isset($datos['puntaje_total']) ||
  !isset($datos['tiempo_segundos']) ||
  !isset($datos['nivel_alcanzado'])
) {
  echo json_encode(['error' => 'Datos incompletos']);
  exit;
}

$nombre  = htmlspecialchars(strip_tags($datos['nombre_jugador']));
$puntaje = (int) $datos['puntaje_total'];
$tiempo  = (int) $datos['tiempo_segundos'];
$nivel   = (int) $datos['nivel_alcanzado'];

$sql = "INSERT INTO tabla_records (nombre_jugador, puntaje_total, tiempo_segundos, nivel_alcanzado)
        VALUES (:nombre, :puntaje, :tiempo, :nivel)";

$stmt = $pdo->prepare($sql);
$stmt->execute([
  ':nombre'  => $nombre,
  ':puntaje' => $puntaje,
  ':tiempo'  => $tiempo,
  ':nivel'   => $nivel
]);

echo json_encode(['mensaje' => '¡Récord guardado!', 'id' => $pdo->lastInsertId()]);
?>