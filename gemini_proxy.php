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
if (!defined('GEMINI_API_KEY') || GEMINI_API_KEY === 'AIzaSyCCE_m_W_L2DpBwA3hjaqMrOj-W1ws3Kv4') {
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

// If the response is an error (4xx or 5xx), wrap it in a consistent format
if ($httpCode >= 400) {
    // Try to parse the Gemini API error response
    $geminiError = json_decode($response, true);
    
    // Build a user-friendly error message
    $errorMessage = 'Gemini API error';
    
    // Extract error details from Gemini API response if available
    if (isset($geminiError['error']['message'])) {
        $errorMessage = $geminiError['error']['message'];
    } elseif (isset($geminiError['error'])) {
        $errorMessage = is_string($geminiError['error']) ? $geminiError['error'] : json_encode($geminiError['error']);
    } elseif (isset($geminiError['message'])) {
        $errorMessage = $geminiError['message'];
    }
    
    // Add HTTP status code to the message
    $errorMessage .= " (HTTP $httpCode)";
    
    // Return in consistent format
    echo json_encode([
        'error' => $errorMessage,
        'statusCode' => $httpCode,
        'details' => $geminiError
    ]);
} else {
    // Success response - pass through as-is
    echo $response;
}
