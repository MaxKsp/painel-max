<?php
declare(strict_types=1);

final class DietPlanBudgetOutsideTolerance extends InvalidArgumentException {
    public function __construct(
        public readonly int $estimatedCents,
        public readonly int $budgetCents,
        public readonly int $minimumCents,
        public readonly int $maximumCents,
    ) {
        parent::__construct('Plano estimado fora da faixa do orçamento informado.');
    }

    public function isBelowTarget(): bool {
        return $this->estimatedCents < $this->minimumCents;
    }
}

final class DietPlanCostCalculator {
    public const MINIMUM_BUDGET_PERCENT = 90;
    public const MAXIMUM_BUDGET_PERCENT = 110;

    /** @param list<int> $dailyCostsCents */
    public static function totalForPeriod(array $dailyCostsCents, int $periodDays): int {
        if ($dailyCostsCents === [] || $periodDays < 1) {
            throw new InvalidArgumentException('Período ou cardápio inválido.');
        }

        $total = 0;
        $dayCount = count($dailyCostsCents);
        for ($day = 0; $day < $periodDays; $day++) {
            $cost = $dailyCostsCents[$day % $dayCount] ?? -1;
            if (!is_int($cost) || $cost < 0) {
                throw new InvalidArgumentException('Custo diário inválido.');
            }
            $total += $cost;
        }
        return $total;
    }

    /** @return array{minimumCents:int,maximumCents:int} */
    public static function targetRange(int $budgetCents): array {
        if ($budgetCents < 1) {
            throw new InvalidArgumentException('Orçamento inválido.');
        }

        return [
            'minimumCents' => intdiv($budgetCents * self::MINIMUM_BUDGET_PERCENT, 100),
            'maximumCents' => intdiv(
                ($budgetCents * self::MAXIMUM_BUDGET_PERCENT) + 99,
                100,
            ),
        ];
    }

    public static function requireNearBudget(int $estimatedCents, int $budgetCents): void {
        $range = self::targetRange($budgetCents);
        if (
            $estimatedCents < $range['minimumCents']
            || $estimatedCents > $range['maximumCents']
        ) {
            throw new DietPlanBudgetOutsideTolerance(
                $estimatedCents,
                $budgetCents,
                $range['minimumCents'],
                $range['maximumCents'],
            );
        }
    }
}
