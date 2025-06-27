<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Conexión a SQL Server
$server = "192.168.0.174";
$user = "sa";
$pass = "P@ssw0rd";
$db = "LOGS_CONTROL";

$conn = mssql_connect($server, $user, $pass);
if (!$conn) {
  die(json_encode(["error" => "No se pudo conectar a SQL Server"]));
}
mssql_select_db($db, $conn);

// Consulta a CEFLocales activos
$query = "SELECT cef, ipdb, rutadb, userdb, passdb FROM CEFLocales WHERE activo = 1";
$result = mssql_query($query, $conn);

$respuesta = [];

while ($row = mssql_fetch_assoc($result)) {
  $cef    = $row['cef'];
  $ip     = $row['ipdb'];
  $ruta   = $row['rutadb'];
  $userdb = $row['userdb'];
  $passdb = $row['passdb'];

  // Codificar parámetros para URL
  $params = http_build_query([
    "ip"   => $ip,
    "db"   => $ruta,
    "user" => $userdb,
    "pass" => $passdb,
    "cef"  => $cef
  ]);

  // Llamar al microservicio local (ajusta la IP si lo ejecutas desde otro equipo)
  $url = "http://192.168.56.1/:5077/ping?$params";

  // Iniciar tiempo
  $tiempoInicio = microtime(true);

  // Ejecutar petición
  $responseJson = @file_get_contents($url);

  // Tiempo total
  $tiempoTotal = round((microtime(true) - $tiempoInicio) * 1000, 2);

  if ($responseJson === false) {
    $respuesta[] = [
      "cef" => $cef,
      "firebird" => "Error",
      "fb_latencia_ms" => null,
      "fb_error" => "No se pudo conectar al microservicio"
    ];
    continue;
  }

  $data = json_decode($responseJson, true);

  $respuesta[] = [
    "cef" => $cef,
    "firebird" => $data["ping"] ?? "Error",
    "fb_latencia_ms" => $data["latencia_ms"] ?? null,
    "fb_error" => $data["error"] ?? "Sin respuesta"
  ];
}

echo json_encode($respuesta);
