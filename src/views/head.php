<?php
$rawBasePath = getenv('DRYWATCH_BASE_PATH');
if (!is_string($rawBasePath) || $rawBasePath === '') {
    $rawBasePath = '/drywatch';
}
$drywatchBasePath = '/' . trim($rawBasePath, '/');
if ($drywatchBasePath === '/') {
    $drywatchBasePath = '';
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DryWatch | Heutrocknungs-Cockpit</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='4' y='4' width='56' height='56' rx='12' fill='%232563eb'/%3E%3Cpath d='M14 24c6 0 10-3 14-3 5 0 8 2 12 2 4 0 7-1 10-3' stroke='white' stroke-width='4' stroke-linecap='round' fill='none'/%3E%3Cpath d='M18 34c6 0 9-2 13-2 5 0 8 2 12 2 4 0 7-1 10-3' stroke='white' stroke-width='4' stroke-linecap='round' fill='none'/%3E%3Cpath d='M22 44c5 0 8-2 12-2 4 0 8 1 11 1 3 0 6-1 9-2' stroke='white' stroke-width='4' stroke-linecap='round' fill='none'/%3E%3C/svg%3E">

    <script>
        window.DRYWATCH_BASE_PATH = <?= json_encode($drywatchBasePath, JSON_UNESCAPED_SLASHES) ?>;
    </script>
    <script src="<?= htmlspecialchars($drywatchBasePath, ENT_QUOTES, 'UTF-8') ?>/assets/vendor/lucide.min.js"></script>
    <script src="<?= htmlspecialchars($drywatchBasePath, ENT_QUOTES, 'UTF-8') ?>/assets/vendor/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.umd.min.js"></script>
    <script src="<?= htmlspecialchars($drywatchBasePath, ENT_QUOTES, 'UTF-8') ?>/assets/vendor/chartjs-plugin-datalabels.min.js"></script>
    <link rel="stylesheet" href="<?= htmlspecialchars($drywatchBasePath, ENT_QUOTES, 'UTF-8') ?>/assets/css/tailwind.generated.css">
    <link rel="stylesheet" href="<?= htmlspecialchars($drywatchBasePath, ENT_QUOTES, 'UTF-8') ?>/assets/css/app.css">
    <?php /* AGFF-Mediathek vorläufig deaktiviert (2026-11): futter ist nach app.graswachstum.ch umgezogen, drywatch noch nicht.
       Von einem fremden Ursprung lässt sich die Liste nicht laden. Wieder einschalten mit Kopie der Dateien oder nach dem Umzug,
       siehe futter docs/PORTIERUNG-ALL-INKL.md, Abschnitt 6. Gegenstück in app-content.php («Videos»).
    <link rel="stylesheet" href="/futter/v2/assets/mediathek.css">
    <script src="/futter/v2/assets/mediathek.js" defer></script>
    */ ?>
</head>
<body class="pb-24">
