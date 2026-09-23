    <?php if (!isset($drywatchBasePath)) {
        $rawBasePath = getenv('DRYWATCH_BASE_PATH');
        if (!is_string($rawBasePath) || $rawBasePath === '') {
            $rawBasePath = '/drywatch';
        }
        $drywatchBasePath = '/' . trim($rawBasePath, '/');
        if ($drywatchBasePath === '/') {
            $drywatchBasePath = '';
        }
    } ?>
    <script src="<?= htmlspecialchars($drywatchBasePath, ENT_QUOTES, 'UTF-8') ?>/assets/js/app.js"></script>
</body>
</html>
