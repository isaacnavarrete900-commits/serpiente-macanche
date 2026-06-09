<?php
$host   = 'sql301.infinityfree.com';
$dbname = 'if0_42126261_juego_piurano_db';
$user   = 'if0_42126261';
$pass   = 'calisPeru03';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Conexión fallida']);
  exit;
}
?>