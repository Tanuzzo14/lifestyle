<?php
// Hash function matching JavaScript
function simpleHash($str) {
    $hash = 0;
    for ($i = 0; $i < strlen($str); $i++) {
        $hash = ord($str[$i]) + (($hash << 5) - $hash);
        // Convert to 32-bit signed integer like JavaScript
        if ($hash > 2147483647) $hash -= 4294967296;
        if ($hash < -2147483648) $hash += 4294967296;
    }
    return $hash;
}

// Read existing data
$dataFile = __DIR__ . '/data.json';
$data = [];
if (file_exists($dataFile)) {
    $content = file_get_contents($dataFile);
    $data = json_decode($content, true) ?: [];
}

// Create a test professional user
$username = 'test_pro';
$password = 'test123';
$userKey = strtolower($username);
$uid = (string)simpleHash($userKey);
$passwordHash = (string)simpleHash($password);

echo "UID: $uid\n";
echo "PasswordHash: $passwordHash\n";

$userData = [
    'userType' => 'pro',
    'displayUsername' => strtoupper($username),
    'passwordHash' => $passwordHash,
    'uid' => $uid,
    'clients' => [],
    'data' => [
        'habits' => [],
        'workout' => [],
        'uploadedWorkoutPlans' => [],
        'diet' => [],
        'dietPlan' => ['targetCalories' => 2000, 'plan' => []],
        'uploadedDietPlans' => [],
        'dailyCompliance' => [],
        'measurementsLog' => []
    ],
    'sleepStartTimestamp' => null,
    'createdBy' => null,
    'createdAt' => date('c')
];

$data[$uid] = $userData;
file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Test professional user created:\n";
echo "Username: test_pro\n";
echo "Password: test123\n";
