<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

/**
 * Smoke test do adapter HTTP real (api/finance.php), via `php -S` embutido
 * com um router de teste (tests/helpers/finance_api_router.php) que troca
 * apenas get_db() e o backend de sessao. Exercita o arquivo de producao tal
 * como ele e servido, sem tocar em FinanceApi.php.
 */

function fapi_start_server(string $repoRoot, string $router, int $port): array {
    $cmd = escapeshellarg(PHP_BINARY) . ' -S 127.0.0.1:' . $port . ' -t ' . escapeshellarg($repoRoot) . ' ' . escapeshellarg($router);
    $descriptors = [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
    $process = proc_open($cmd, $descriptors, $pipes, $repoRoot);
    if (!is_resource($process)) {
        throw new RuntimeException('Could not start the built-in PHP server for the adapter smoke test.');
    }
    foreach ($pipes as $pipe) {
        stream_set_blocking($pipe, false);
    }
    return [$process, $pipes];
}

function fapi_stop_server($process, array $pipes): void {
    foreach ($pipes as $pipe) {
        if (is_resource($pipe)) fclose($pipe);
    }
    if (is_resource($process)) {
        proc_terminate($process);
        proc_close($process);
    }
}

function fapi_wait_ready(string $url, int $attempts = 40): void {
    for ($i = 0; $i < $attempts; $i++) {
        $ctx = stream_context_create(['http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => '{}',
            'ignore_errors' => true,
            'timeout' => 2,
        ]]);
        $body = @file_get_contents($url, false, $ctx);
        if ($body !== false) return;
        usleep(100_000);
    }
    throw new RuntimeException('Built-in PHP server did not become ready for the adapter smoke test.');
}

/** @return array{status:int, body:string, contentType:string} */
function fapi_request(string $url, string $body, array $headers): array {
    $headers[] = 'Content-Type: application/json';
    $ctx = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => implode("\r\n", $headers),
        'content' => $body,
        'ignore_errors' => true,
        'timeout' => 5,
    ]]);
    $responseBody = file_get_contents($url, false, $ctx);
    $status = 0;
    $contentType = '';
    foreach ($http_response_header ?? [] as $line) {
        if (preg_match('#^HTTP/\S+\s+(\d+)#', $line, $m)) {
            $status = (int)$m[1];
        } elseif (stripos($line, 'Content-Type:') === 0) {
            $contentType = trim(substr($line, strlen('Content-Type:')));
        }
    }
    return ['status' => $status, 'body' => (string)$responseBody, 'contentType' => $contentType];
}

return function (): void {
    $repoRoot = test_repo_root();
    $router = __DIR__ . '/../helpers/finance_api_router.php';
    $port = 8973 + (getmypid() % 400);
    $base = "http://127.0.0.1:$port/api/finance.php";

    [$process, $pipes] = fapi_start_server($repoRoot, $router, $port);

    try {
        fapi_wait_ready($base);

        // Autenticacao continua ativa: sem sessao, o endpoint corta com 401
        // antes de chegar em qualquer validacao de payload.
        $r = fapi_request($base, '{}', ['X-Test-Session: anon']);
        test_assert_same(401, $r['status'], 'Endpoint without a session must still return 401.');

        // CSRF continua ativo: sessao valida, token errado -> 403.
        $r = fapi_request($base, '{}', ['X-Test-Session: authed', 'X-Csrf-Token: wrong-token']);
        test_assert_same(403, $r['status'], 'Endpoint with a wrong CSRF token must still return 403.');

        $authedHeaders = ['X-Test-Session: authed', 'X-Csrf-Token: testtoken'];

        // Payload valido -> 200, JSON, Content-Type correto.
        $validBody = json_encode(['key' => 'accounts_v2', 'value' => [
            ['id' => 'acc_smoke', 'label' => 'Conta smoke', 'limite' => 10],
        ]]);
        $r = fapi_request($base, $validBody, $authedHeaders);
        test_assert_same(200, $r['status'], 'Valid payload must return 200.');
        test_assert_true(
            str_contains($r['contentType'], 'application/json'),
            'Response must be served with a JSON content type.'
        );
        test_assert_equals(['ok' => true], json_decode($r['body'], true), 'Valid payload must return {"ok":true}.');

        // Payload invalido (key desconhecida) -> 400.
        $invalidBody = json_encode(['key' => 'nope', 'value' => []]);
        $r = fapi_request($base, $invalidBody, $authedHeaders);
        test_assert_same(400, $r['status'], 'Invalid payload must return 400.');
        test_assert_equals(['error' => 'invalid finance payload'], json_decode($r['body'], true), 'Invalid payload must return the current error message.');

        // Payload acima do limite de 4 MB -> 413.
        $huge = str_repeat('a', 4 * 1024 * 1024 + 10);
        $r = fapi_request($base, $huge, $authedHeaders);
        test_assert_same(413, $r['status'], 'Oversized payload must return 413.');
        test_assert_equals(['error' => 'payload too large'], json_decode($r['body'], true), 'Oversized payload must return the current error message.');

        // Falha interna controlada (erro de banco durante finance_save_set) -> 500.
        $poisonBody = json_encode(['key' => 'accounts_v2', 'value' => [
            ['id' => 'acc_poison', 'label' => 'Estoura', 'limite' => 9999999],
        ]]);
        $r = fapi_request($base, $poisonBody, array_merge($authedHeaders, ['X-Test-Db: poison']));
        test_assert_same(500, $r['status'], 'A controlled internal failure must return 500.');
        test_assert_equals(
            ['error' => 'erro ao salvar — banco atualizado? (ver migrations)'],
            json_decode($r['body'], true),
            'A controlled internal failure must return the current error message.'
        );
    } finally {
        fapi_stop_server($process, $pipes);
    }
};
