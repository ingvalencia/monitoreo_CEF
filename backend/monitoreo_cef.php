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

// Consulta a CEFLocales activos con datos necesarios para Firebird
$query = "SELECT cef, ipdb, rutadb, userdb, passdb FROM CEFLocales WHERE activo = 1";
$result = mssql_query($query, $conn);

$respuesta = [];

while ($row = mssql_fetch_assoc($result)) {
  $cef = $row['cef'];
  $ip = $row['ipdb'];

  // Medir latencia con ping
  $start = microtime(true);
  $ping = (stripos(PHP_OS, 'WIN') === 0)
    ? exec("ping -n 1 -w 500 $ip", $output, $status)
    : exec("ping -c 1 $ip", $output, $status);
  $latencia = round((microtime(true) - $start) * 1000, 2);

  $pingOk = ($status === 0) ? "OK" : "FALLO";
  $mensaje = ($pingOk === "OK") ? "En línea" : "Sin respuesta";

  $respuesta[] = [
    "cef" => $cef,
    "ip" => $ip,
    "ping" => $pingOk,
    "mensaje" => $mensaje,
    "timestamp" => date("Y-m-d H:i:s"),
    "latencia_ms" => $pingOk === "OK" ? $latencia : null,
    "rutadb" => $row["rutadb"],
    "userdb" => $row["userdb"],
    "passdb" => $row["passdb"]
  ];
}

echo json_encode($respuesta);
