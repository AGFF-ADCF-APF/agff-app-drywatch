<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function sat(float $t): float {
    return 6.1078 * exp((17.08 * $t) / (234.2 + $t));
}

function pressure(float $alt): float {
    return 1013.25 * pow(1 - 2.25e-5 * $alt, 5.25);
}

function density(float $t, float $p): float {
    return ($p * 100.0) / (287.05 * ($t + 273.15));
}

function absHumidity(float $t, float $rh, float $p): float {
    return (622.0 * sat($t) * $rh / 100.0) / ($p - sat($t) * $rh / 100.0);
}

function badRequest(string $msg): never {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = file_get_contents('php://input');
$payload = [];
if ($raw !== false && trim($raw) !== '') {
    $payload = json_decode($raw, true) ?? [];
}
if (!$payload && !empty($_GET)) {
    $payload = $_GET;
}

$required = ['t2', 'h2', 't3', 'h3', 'alt', 'flow'];
foreach ($required as $key) {
    if (!array_key_exists($key, $payload)) {
        badRequest("Missing field: {$key}");
    }
}

$t2 = (float) $payload['t2'];
$h2 = (float) $payload['h2'];
$t3 = (float) $payload['t3'];
$h3 = (float) $payload['h3'];
$alt = (float) $payload['alt'];
$flow = (float) $payload['flow'];

if ($h2 < 0 || $h2 > 100 || $h3 < 0 || $h3 > 100) {
    badRequest('Humidity values must be between 0 and 100');
}
if ($flow < 0) {
    badRequest('flow must be >= 0');
}

$p = pressure($alt);
$rho = density($t2, $p);
$dx = absHumidity($t3, $h3, $p) - absHumidity($t2, $h2, $p);
$waterPerM3 = $dx * $rho;
$removalLh = max(0.0, $dx * $rho * $flow * 3.6);

$response = [
    'status' => 'ok',
    'inputs' => [
        't2' => $t2,
        'h2' => $h2,
        't3' => $t3,
        'h3' => $h3,
        'alt' => $alt,
        'flow' => $flow,
    ],
    'result' => [
        'pressure_hpa' => round($p, 4),
        'air_density' => round($rho, 6),
        'delta_abs_humidity' => round($dx, 6),
        'water_per_m3' => round($waterPerM3, 6),
        'removal_l_per_h' => round($removalLh, 3),
    ],
];

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
