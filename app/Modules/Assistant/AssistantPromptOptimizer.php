<?php
declare(strict_types=1);

require_once __DIR__ . '/AssistantActionCatalog.php';

final class AssistantPromptOptimizer {
    /**
     * Consultas suportadas pelo executor nao precisam de um LLM para descobrir
     * que sao consultas. Os dados continuam sendo lidos somente no servidor.
     *
     * @return array{action:string,arguments:array<string,mixed>}|null
     */
    public static function localRoute(string $text, ?string $module): ?array {
        $trimmed = trim($text);
        if ($trimmed === '' || mb_strlen($trimmed) > 500) return null;
        $normalized = mb_strtolower($trimmed, 'UTF-8');
        if (self::containsAny($normalized, ['registrar','adicionar','criar','lançar','lancar','transferir','montar'])) {
            return null;
        }
        $question = str_contains($trimmed, '?')
            || preg_match('/\A(?:qual|quais|quanto|quantos|como|onde|mostre|resumo|analise)\b/u', $normalized) === 1;
        if (!$question) return null;

        $supported = match ($module) {
            'financeiro' => self::containsAny($normalized, ['saldo','patrim','gasto','gastei','gastando','despesa','categoria','dinheiro']),
            'agenda' => self::containsAny($normalized, ['produtividade','tarefa','rotina']),
            'treinos' => self::containsAny($normalized, ['treino','cardio','imc','peso','medida']),
            'alimentacao' => self::containsAny($normalized, ['alimentacao','alimentação','dieta','plano alimentar','cardapio','cardápio','refeicao','refeição']),
            default => self::containsAny($normalized, [
                'saldo','patrim','gasto','gastei','gastando','despesa','categoria','dinheiro',
                'produtividade','tarefa','rotina','treino','cardio','imc','peso','medida',
                'alimentacao','alimentação','dieta','plano alimentar','cardapio','cardápio','refeicao','refeição',
            ]),
        };
        return $supported ? assistant_validate_route('query', ['question' => $trimmed]) : null;
    }

    /** Retorna uma ferramenta apenas quando o proprio texto torna a intencao inequivoca. */
    public static function preferredAction(string $text, ?string $module): ?string {
        $normalized = self::ascii($text);
        return match ($module) {
            'alimentacao' => str_starts_with($normalized, 'monte um plano alimentar') ? 'create_diet_plan' : null,
            'agenda' => preg_match('/\b(?:criar|adicionar|registrar) (?:uma )?tarefa\b/', $normalized) === 1 ? 'add_task' : null,
            'financeiro' => match (true) {
                preg_match('/\b(?:transferir|transferi|transferencia)\b/', $normalized) === 1 => 'add_transfer',
                preg_match('/\b(?:registrar|adicionar|lancar) (?:uma )?renda\b/', $normalized) === 1 => 'add_income',
                preg_match('/\b(?:lancar|registrar|adicionar) (?:uma )?(?:despesa|gasto)\b/', $normalized) === 1,
                    str_starts_with($normalized, 'lancar r$') => 'add_expense',
                default => null,
            },
            'treinos' => match (true) {
                str_starts_with($normalized, 'monte um programa de treino') => 'create_workout_program',
                str_starts_with($normalized, 'registrar peso '), str_starts_with($normalized, 'registrar medida ') => 'log_measurement',
                default => null,
            },
            default => null,
        };
    }

    public static function maxOutputTokens(?string $module, ?string $preferredAction): int {
        return match ($preferredAction) {
            'create_diet_plan' => 4600,
            'create_workout_program' => 3200,
            'create_workout' => 1800,
            'query' => 192,
            'add_expense','add_income','add_transfer','add_task','log_measurement','log_cardio','log_workout_session' => 420,
            default => match ($module) {
                'financeiro','agenda' => 520,
                'treinos' => 2400,
                'alimentacao' => 4600,
                default => 1600,
            },
        };
    }

    /** @param list<string> $needles */
    private static function containsAny(string $value, array $needles): bool {
        foreach ($needles as $needle) if (str_contains($value, $needle)) return true;
        return false;
    }

    private static function ascii(string $value): string {
        $value = mb_strtolower(trim($value), 'UTF-8');
        $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
        return preg_replace('/\s+/', ' ', is_string($ascii) ? $ascii : $value) ?? $value;
    }
}
