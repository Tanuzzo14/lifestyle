<?php
/**
 * Gemini API Proxy
 * This file acts as a secure proxy between the client-side application and the Gemini API
 * The API key is kept secure on the server-side and never exposed to the client
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Only POST requests are accepted.']);
    exit();
}

// Load configuration
if (!file_exists(__DIR__ . '/config.php')) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error. config.php file not found.']);
    exit();
}

require_once __DIR__ . '/config.php';

// Check if API key is configured
if (!defined('GEMINI_API_KEY') || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    http_response_code(500);
    echo json_encode(['error' => 'Gemini API key not configured. Please configure config.php with a valid API key.']);
    exit();
}

// Get the request body
$input = file_get_contents('php://input');
$requestData = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON in request body.']);
    exit();
}

// Build the Gemini API URL
$geminiUrl = GEMINI_API_URL . '?key=' . GEMINI_API_KEY;

// Initialize cURL
$ch = curl_init($geminiUrl);

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30); // 30 seconds timeout

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

curl_close($ch);

// Check for cURL errors
if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to communicate with Gemini API',
        'details' => $curlError
    ]);
    exit();
}

// Return the response with the appropriate HTTP code
http_response_code($httpCode);
echo $response;
