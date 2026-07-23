<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';
require_once dirname(__DIR__, 2) . '/app/Modules/Assistant/DietPlanCostCalculator.php';

return static function (): void {
    test_assert_same(6_000, DietPlanCostCalculator::totalForPeriod([1_000, 2_000, 3_000], 3), 'Soma um cardápio completo.');
    test_assert_same(12_000, DietPlanCostCalculator::totalForPeriod([1_000, 2_000, 3_000], 6), 'Repete a sequência pelo período solicitado.');
    test_assert_same(7_000, DietPlanCostCalculator::totalForPeriod([1_000, 2_000, 3_000], 3 + 1), 'Usa o primeiro dia ao iniciar um novo ciclo.');

    test_assert_same(
        ['minimumCents'=>36_000, 'maximumCents'=>44_000],
        DietPlanCostCalculator::targetRange(40_000),
        'Aceita uma tolerância de dez por cento em torno da meta.',
    );
    DietPlanCostCalculator::requireNearBudget(36_000, 40_000);
    DietPlanCostCalculator::requireNearBudget(44_000, 40_000);

    $below = null;
    try {
        DietPlanCostCalculator::requireNearBudget(19_050, 40_000);
    } catch (DietPlanBudgetOutsideTolerance $error) {
        $below = $error;
    }
    test_assert_true($below instanceof DietPlanBudgetOutsideTolerance, 'Rejeita um plano muito abaixo da meta.');
    test_assert_true($below->isBelowTarget(), 'Identifica que a estimativa ficou abaixo da meta.');
    test_assert_same(36_000, $below->minimumCents, 'Informa o limite mínimo para a correção automática.');

    $above = null;
    try {
        DietPlanCostCalculator::requireNearBudget(44_001, 40_000);
    } catch (DietPlanBudgetOutsideTolerance $error) {
        $above = $error;
    }
    test_assert_true($above instanceof DietPlanBudgetOutsideTolerance, 'Rejeita um plano muito acima da meta.');
    test_assert_true(!$above->isBelowTarget(), 'Identifica que a estimativa ficou acima da meta.');
    test_assert_same(44_000, $above->maximumCents, 'Informa o limite máximo para a correção automática.');
};
