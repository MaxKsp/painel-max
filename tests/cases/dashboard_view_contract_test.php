<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once dirname(__DIR__, 2) . '/app/Shared/DashboardView.php';

return static function (): void {
    $root = test_repo_root();

    test_assert_true(
        dashboard_asset_version($root, 'assets/auth.css') !== '0',
        'Existing static assets must receive a cache version.'
    );
    test_assert_same(
        '0',
        dashboard_asset_version($root, 'assets/does-not-exist.css'),
        'Missing assets must use the stable zero fallback.'
    );

    ob_start();
    dashboard_view_render($root, 'csrf-test-token');
    $html = (string)ob_get_clean();

    test_assert_true(str_contains(strtolower($html), '<!doctype html>'), 'Dashboard view must render a complete document.');
    test_assert_true(str_contains($html, '<div id="root"></div>'), 'Dashboard view must prefer the React application shell.');
    test_assert_true(
        str_contains($html, 'window.CSRF_TOKEN = "csrf-test-token";'),
        'Dashboard view must inject the JSON-encoded CSRF token.'
    );
    test_assert_true(
        str_contains($html, '/frontend/dist/frontend-assets/'),
        'Local dashboard view must point to the compiled React assets.'
    );
    test_assert_true(
        !str_contains($html, 'assets/app.js?v='),
        'Dashboard view must not load the legacy runtime when the React build exists.'
    );
};
