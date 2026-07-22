<?php
declare(strict_types=1);

interface LlmProvider {
    public function name(): string;
    public function supportsTools(): bool;
    /** @param array<string,mixed> $payload @return array<string,mixed> */
    public function complete(array $payload): array;
}

final class LlmProviderException extends RuntimeException {
    public function __construct(
        string $message,
        public readonly string $provider,
        public readonly int $httpStatus = 0,
        public readonly string $kind = 'provider_error',
    ) {
        parent::__construct($message);
    }
}

final class AssistantProvidersExhausted extends RuntimeException {
}

final class AssistantRouteException extends RuntimeException {
}
