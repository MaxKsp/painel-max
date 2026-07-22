<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/Core/Clock.php';
require_once dirname(__DIR__) . '/Progress/ProgressService.php';

const TRAINING_MODALITIES = ['forca', 'cardio', 'calistenia', 'mobilidade'];
const TRAINING_MEASUREMENT_UNITS = [
    'peso' => 'kg',
    'gordura' => '%',
    'altura' => 'cm',
    'cintura' => 'cm',
    'quadril' => 'cm',
    'braco' => 'cm',
    'coxa' => 'cm',
    'peito' => 'cm',
    'panturrilha' => 'cm',
];

function training_client_id(?string $value = null, string $prefix = 'tr'): string {
    $candidate = trim((string)$value);
    if ($candidate !== '' && strlen($candidate) <= 32 && preg_match('/\A[a-zA-Z0-9_-]+\z/D', $candidate) === 1) {
        return $candidate;
    }
    return substr($prefix . '_' . bin2hex(random_bytes(16)), 0, 32);
}

function training_text(mixed $value, int $max, bool $required = true): ?string {
    if (!is_string($value)) {
        if ($required) throw new InvalidArgumentException('Texto de treino inválido.');
        return null;
    }
    $clean = trim((string)preg_replace('/[\x00-\x1F\x7F]/u', '', $value));
    if ($clean === '') {
        if ($required) throw new InvalidArgumentException('Texto de treino obrigatório.');
        return null;
    }
    if (mb_strlen($clean) > $max) throw new InvalidArgumentException('Texto de treino muito longo.');
    return $clean;
}

function training_date(mixed $value): string {
    if (!is_string($value) || preg_match('/\A\d{4}-\d{2}-\d{2}\z/D', $value) !== 1) {
        throw new InvalidArgumentException('Data de treino inválida.');
    }
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, level_clock_utc_timezone());
    if ($date === false || $date->format('Y-m-d') !== $value) throw new InvalidArgumentException('Data de treino inválida.');
    $today = level_clock_today();
    if ($date < $today->modify('-10 years') || $date > $today->modify('+1 year')) {
        throw new InvalidArgumentException('Data de treino fora do intervalo permitido.');
    }
    return $value;
}

function training_number(mixed $value, float $min, float $max, bool $required = false): ?float {
    if ($value === null || $value === '') {
        if ($required) throw new InvalidArgumentException('Valor de treino obrigatório.');
        return null;
    }
    if (!is_int($value) && !is_float($value) && !is_string($value)) throw new InvalidArgumentException('Valor de treino inválido.');
    $normalized = is_string($value) ? str_replace(',', '.', trim($value)) : $value;
    if (!is_numeric($normalized)) throw new InvalidArgumentException('Valor de treino inválido.');
    $number = (float)$normalized;
    if (!is_finite($number) || $number < $min || $number > $max) throw new InvalidArgumentException('Valor de treino fora do intervalo.');
    return round($number, 3);
}

function training_int(mixed $value, int $min, int $max, bool $required = false): ?int {
    $number = training_number($value, $min, $max, $required);
    if ($number === null) return null;
    if (floor($number) !== $number) throw new InvalidArgumentException('Inteiro de treino inválido.');
    return (int)$number;
}

function training_modality(mixed $value, string $fallback = 'forca'): string {
    $candidate = is_string($value) ? strtolower(trim($value)) : $fallback;
    if (!in_array($candidate, TRAINING_MODALITIES, true)) throw new InvalidArgumentException('Modalidade inválida.');
    return $candidate;
}

/** @return array<string,mixed> */
function training_snapshot(PDO $db, int $uid): array {
    $workoutStmt = $db->prepare('SELECT id, client_id, name, focus, created_at, updated_at
        FROM training_workouts WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT 201');
    $workoutStmt->execute([$uid]);
    $workoutRows = $workoutStmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($workoutRows) > 200) throw new OverflowException('Limite de treinos excedido.');

    $exerciseStmt = $db->prepare('SELECT workout_id, client_id, position, name, modality, target_sets,
        target_reps, target_load_kg, rest_sec, progression_level, assisted_kg, weighted_kg, duration_sec
        FROM training_workout_exercises WHERE user_id = ? ORDER BY workout_id, position, id LIMIT 4001');
    $exerciseStmt->execute([$uid]);
    $exerciseRows = $exerciseStmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($exerciseRows) > 4000) throw new OverflowException('Limite de exercícios excedido.');
    $byWorkout = [];
    foreach ($exerciseRows as $row) {
        $byWorkout[(string)$row['workout_id']][] = training_exercise_public($row, true);
    }
    $workouts = array_map(static fn(array $row): array => [
        'id' => (string)$row['client_id'],
        'name' => (string)$row['name'],
        'focus' => $row['focus'] !== null ? (string)$row['focus'] : '',
        'exercises' => $byWorkout[(string)$row['id']] ?? [],
        'createdAt' => (string)$row['created_at'],
        'updatedAt' => (string)$row['updated_at'],
    ], $workoutRows);

    $measurementStmt = $db->prepare('SELECT client_id, measurement_type, value, unit, measured_on, source, created_at
        FROM body_measurements WHERE user_id = ? ORDER BY measured_on DESC, id DESC LIMIT 1001');
    $measurementStmt->execute([$uid]);
    $measurementRows = $measurementStmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($measurementRows) > 1000) throw new OverflowException('Limite de medidas excedido.');
    $measurements = array_map(static fn(array $row): array => [
        'id' => (string)$row['client_id'], 'type' => (string)$row['measurement_type'],
        'value' => (float)$row['value'], 'unit' => (string)$row['unit'],
        'date' => (string)$row['measured_on'], 'source' => (string)$row['source'],
    ], $measurementRows);

    $sessionStmt = $db->prepare('SELECT s.id, s.client_id, s.name, s.modality, s.session_date, s.duration_sec,
        s.source, w.client_id AS workout_client_id
        FROM training_sessions s LEFT JOIN training_workouts w ON w.id = s.workout_id AND w.user_id = s.user_id
        WHERE s.user_id = ? ORDER BY s.session_date DESC, s.id DESC LIMIT 501');
    $sessionStmt->execute([$uid]);
    $sessionRows = $sessionStmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($sessionRows) > 500) throw new OverflowException('Limite de sessões excedido.');
    $entryStmt = $db->prepare('SELECT session_id, client_id, position, exercise_name, modality, sets_count,
        reps_count, load_kg, rest_sec, distance_km, duration_sec, avg_hr, progression_level, assisted_kg, weighted_kg
        FROM training_session_entries WHERE user_id = ? ORDER BY session_id, position, id LIMIT 10001');
    $entryStmt->execute([$uid]);
    $entryRows = $entryStmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($entryRows) > 10000) throw new OverflowException('Limite de métricas excedido.');
    $bySession = [];
    foreach ($entryRows as $row) $bySession[(string)$row['session_id']][] = training_exercise_public($row, false);
    $sessions = array_map(static fn(array $row): array => [
        'id' => (string)$row['client_id'], 'workoutId' => $row['workout_client_id'] !== null ? (string)$row['workout_client_id'] : null,
        'name' => (string)$row['name'], 'modality' => (string)$row['modality'],
        'date' => (string)$row['session_date'], 'durationSec' => $row['duration_sec'] !== null ? (int)$row['duration_sec'] : null,
        'source' => (string)$row['source'], 'exercises' => $bySession[(string)$row['id']] ?? [],
    ], $sessionRows);

    return ['workouts' => $workouts, 'measurements' => $measurements, 'sessions' => $sessions];
}

/** @return array<string,mixed> */
function training_exercise_public(array $row, bool $template): array {
    $out = [
        'id' => (string)$row['client_id'],
        'name' => (string)($row[$template ? 'name' : 'exercise_name'] ?? ''),
        'modality' => (string)$row['modality'],
    ];
    $map = $template
        ? ['sets' => 'target_sets', 'reps' => 'target_reps', 'loadKg' => 'target_load_kg']
        : ['sets' => 'sets_count', 'reps' => 'reps_count', 'loadKg' => 'load_kg'];
    foreach ($map as $public => $column) $out[$public] = $row[$column] !== null ? ($public === 'loadKg' ? (float)$row[$column] : (int)$row[$column]) : null;
    foreach (['restSec' => 'rest_sec', 'distanceKm' => 'distance_km', 'durationSec' => 'duration_sec', 'avgHr' => 'avg_hr',
                 'progressionLevel' => 'progression_level', 'assistedKg' => 'assisted_kg', 'weightedKg' => 'weighted_kg'] as $public => $column) {
        if (!array_key_exists($column, $row)) continue;
        $out[$public] = $row[$column] === null ? null : (in_array($column, ['progression_level'], true) ? (string)$row[$column] : (float)$row[$column]);
    }
    return $out;
}

/** @param array<string,mixed> $workout @return array<string,mixed> */
function training_save_workout(PDO $db, int $uid, array $workout, string $source = 'manual'): array {
    $clientId = training_client_id(isset($workout['id']) ? (string)$workout['id'] : null, 'wo');
    $name = training_text($workout['name'] ?? null, 96);
    $focus = training_text($workout['focus'] ?? null, 255, false);
    $exercises = $workout['exercises'] ?? null;
    if (!is_array($exercises) || $exercises === [] || count($exercises) > 60) throw new InvalidArgumentException('Treino precisa de 1 a 60 exercícios.');
    $normalized = [];
    foreach (array_values($exercises) as $index => $exercise) {
        if (!is_array($exercise)) throw new InvalidArgumentException('Exercício inválido.');
        $normalized[] = training_normalize_exercise($exercise, true, $index);
    }
    $now = level_clock_utc_sql();
    $own = !$db->inTransaction();
    if ($own) $db->beginTransaction();
    try {
        $find = $db->prepare('SELECT id FROM training_workouts WHERE user_id = ? AND client_id = ? LIMIT 1');
        $find->execute([$uid, $clientId]);
        $workoutId = $find->fetchColumn();
        if ($workoutId === false) {
            $insert = $db->prepare('INSERT INTO training_workouts (user_id, client_id, name, focus, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
            $insert->execute([$uid, $clientId, $name, $focus, $now, $now]);
            $workoutId = (int)$db->lastInsertId();
        } else {
            $workoutId = (int)$workoutId;
            $db->prepare('UPDATE training_workouts SET name = ?, focus = ?, updated_at = ? WHERE id = ? AND user_id = ?')
                ->execute([$name, $focus, $now, $workoutId, $uid]);
            $db->prepare('DELETE FROM training_workout_exercises WHERE workout_id = ? AND user_id = ?')->execute([$workoutId, $uid]);
        }
        $insertExercise = $db->prepare('INSERT INTO training_workout_exercises
            (workout_id, user_id, client_id, position, name, modality, target_sets, target_reps, target_load_kg, rest_sec,
             progression_level, assisted_kg, weighted_kg, duration_sec) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($normalized as $exercise) {
            $insertExercise->execute([$workoutId, $uid, $exercise['id'], $exercise['position'], $exercise['name'], $exercise['modality'],
                $exercise['sets'], $exercise['reps'], $exercise['loadKg'], $exercise['restSec'], $exercise['progressionLevel'],
                $exercise['assistedKg'], $exercise['weightedKg'], $exercise['durationSec']]);
        }
        if ($own) $db->commit();
        return ['id' => $clientId, 'name' => $name, 'focus' => $focus ?? '', 'exercises' => array_map(static function(array $e): array { unset($e['position']); return $e; }, $normalized)];
    } catch (Throwable $e) {
        if ($own && $db->inTransaction()) $db->rollBack();
        throw $e;
    }
}

/** @param array<string,mixed> $exercise @return array<string,mixed> */
function training_normalize_exercise(array $exercise, bool $template, int $position): array {
    $modality = training_modality($exercise['modality'] ?? 'forca');
    $name = training_text($exercise['name'] ?? $exercise['exerciseName'] ?? null, 96);
    $sets = training_int($exercise['sets'] ?? null, 1, 100);
    $reps = training_int($exercise['reps'] ?? null, 1, 10000);
    $load = training_number($exercise['loadKg'] ?? null, 0, 2000);
    $rest = training_int($exercise['restSec'] ?? null, 0, 7200);
    $distance = training_number($exercise['distanceKm'] ?? null, 0, 1000);
    $duration = training_int($exercise['durationSec'] ?? null, 1, 172800);
    $avgHr = training_int($exercise['avgHr'] ?? null, 30, 240);
    $progression = training_text($exercise['progressionLevel'] ?? null, 64, false);
    $assisted = training_number($exercise['assistedKg'] ?? null, 0, 500);
    $weighted = training_number($exercise['weightedKg'] ?? null, 0, 500);
    if ($modality === 'cardio' && !$template && ($distance === null || $duration === null)) throw new InvalidArgumentException('Cardio exige distância e duração.');
    if ($modality === 'mobilidade' && !$template && $duration === null) throw new InvalidArgumentException('Mobilidade exige duração.');
    if ($modality === 'forca' && !$template && ($sets === null || $reps === null)) throw new InvalidArgumentException('Força exige séries e repetições.');
    return [
        'id' => training_client_id(isset($exercise['id']) ? (string)$exercise['id'] : null, 'ex'), 'position' => $position,
        'name' => $name, 'modality' => $modality, 'sets' => $sets, 'reps' => $reps, 'loadKg' => $load,
        'restSec' => $rest, 'distanceKm' => $distance, 'durationSec' => $duration, 'avgHr' => $avgHr,
        'progressionLevel' => $progression, 'assistedKg' => $assisted, 'weightedKg' => $weighted,
    ];
}

function training_delete_workout(PDO $db, int $uid, string $clientId): bool {
    $stmt = $db->prepare('DELETE FROM training_workouts WHERE user_id = ? AND client_id = ?');
    $stmt->execute([$uid, training_client_id($clientId)]);
    return $stmt->rowCount() === 1;
}

/** @param array<string,mixed> $input @return array<string,mixed> */
function training_log_measurement(PDO $db, int $uid, array $input, string $source = 'manual'): array {
    $type = is_string($input['type'] ?? null) ? strtolower(trim((string)$input['type'])) : '';
    $unit = is_string($input['unit'] ?? null) ? trim((string)$input['unit']) : '';
    if (!isset(TRAINING_MEASUREMENT_UNITS[$type]) || TRAINING_MEASUREMENT_UNITS[$type] !== $unit) throw new InvalidArgumentException('Tipo ou unidade de medida inválido.');
    $value = training_number($input['value'] ?? null, 0.01, 1000, true);
    $date = training_date($input['date'] ?? null);
    $clientId = training_client_id(isset($input['id']) ? (string)$input['id'] : null, 'bm');
    $stmt = $db->prepare('INSERT INTO body_measurements (user_id, client_id, measurement_type, value, unit, measured_on, source, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$uid, $clientId, $type, number_format((float)$value, 3, '.', ''), $unit, $date, $source === 'assistant' ? 'assistant' : 'manual', level_clock_utc_sql()]);
    return ['id' => $clientId, 'type' => $type, 'value' => $value, 'unit' => $unit, 'date' => $date, 'source' => $source === 'assistant' ? 'assistant' : 'manual'];
}

function training_delete_measurement(PDO $db, int $uid, string $clientId): bool {
    $stmt = $db->prepare('DELETE FROM body_measurements WHERE user_id = ? AND client_id = ?');
    $stmt->execute([$uid, training_client_id($clientId)]);
    return $stmt->rowCount() === 1;
}

/** @param array<string,mixed> $input @return array<string,mixed> */
function training_log_session(PDO $db, int $uid, array $input, string $source = 'manual', bool $awardXp = true): array {
    $clientId = training_client_id(isset($input['id']) ? (string)$input['id'] : null, 'ts');
    $date = training_date($input['date'] ?? level_clock_today()->format('Y-m-d'));
    $workoutClient = isset($input['workoutId']) && is_string($input['workoutId']) ? training_client_id($input['workoutId']) : null;
    $workoutId = null;
    $workoutName = null;
    if ($workoutClient !== null) {
        $find = $db->prepare('SELECT id, name FROM training_workouts WHERE user_id = ? AND client_id = ? LIMIT 1');
        $find->execute([$uid, $workoutClient]);
        $row = $find->fetch(PDO::FETCH_ASSOC);
        if (!$row) throw new InvalidArgumentException('Treino não encontrado.');
        $workoutId = (int)$row['id'];
        $workoutName = (string)$row['name'];
    }
    $entries = $input['exercises'] ?? null;
    if (!is_array($entries) || $entries === [] || count($entries) > 100) throw new InvalidArgumentException('Sessão precisa de métricas.');
    $normalized = [];
    foreach (array_values($entries) as $index => $entry) {
        if (!is_array($entry)) throw new InvalidArgumentException('Métrica de sessão inválida.');
        $normalized[] = training_normalize_exercise($entry, false, $index);
    }
    $modality = training_modality($input['modality'] ?? ($normalized[0]['modality'] ?? 'forca'));
    $name = training_text($input['name'] ?? $workoutName ?? 'Sessão de treino', 96);
    $duration = training_int($input['durationSec'] ?? null, 1, 172800);
    if ($duration === null) {
        $duration = array_reduce($normalized, static fn(?int $carry, array $entry): ?int => max($carry ?? 0, (int)($entry['durationSec'] ?? 0)), null);
        if ($duration === 0) $duration = null;
    }
    $now = level_clock_utc_sql();
    $own = !$db->inTransaction();
    if ($own) $db->beginTransaction();
    try {
        $insert = $db->prepare('INSERT INTO training_sessions (user_id, workout_id, client_id, name, modality, session_date, duration_sec, source, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $insert->execute([$uid, $workoutId, $clientId, $name, $modality, $date, $duration, $source === 'assistant' ? 'assistant' : 'manual', $now]);
        $sessionId = (int)$db->lastInsertId();
        $entryStmt = $db->prepare('INSERT INTO training_session_entries
            (session_id, user_id, client_id, position, exercise_name, modality, sets_count, reps_count, load_kg, rest_sec,
             distance_km, duration_sec, avg_hr, progression_level, assisted_kg, weighted_kg)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($normalized as $entry) {
            $entryStmt->execute([$sessionId, $uid, $entry['id'], $entry['position'], $entry['name'], $entry['modality'],
                $entry['sets'], $entry['reps'], $entry['loadKg'], $entry['restSec'], $entry['distanceKm'], $entry['durationSec'],
                $entry['avgHr'], $entry['progressionLevel'], $entry['assistedKg'], $entry['weightedKg']]);
        }
        if ($awardXp && function_exists('progress_award_event')) {
            progress_award_event($db, $uid, 'treino', 'treino:session:' . $clientId);
        }
        if ($own) $db->commit();
        return ['id' => $clientId, 'workoutId' => $workoutClient, 'name' => $name, 'modality' => $modality,
            'date' => $date, 'durationSec' => $duration, 'source' => $source === 'assistant' ? 'assistant' : 'manual',
            'exercises' => array_map(static function(array $e): array { unset($e['position']); return $e; }, $normalized)];
    } catch (Throwable $e) {
        if ($own && $db->inTransaction()) $db->rollBack();
        throw $e;
    }
}

function training_delete_session(PDO $db, int $uid, string $clientId, bool $revokeXp = true): bool {
    $safeId = training_client_id($clientId);
    $stmt = $db->prepare('DELETE FROM training_sessions WHERE user_id = ? AND client_id = ?');
    $stmt->execute([$uid, $safeId]);
    if ($stmt->rowCount() === 1 && $revokeXp && function_exists('progress_revoke_event')) {
        progress_revoke_event($db, $uid, 'treino:session:' . $safeId);
    }
    return $stmt->rowCount() === 1;
}
