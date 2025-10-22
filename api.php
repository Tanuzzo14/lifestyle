<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$dataFile = __DIR__ . '/data.json';

// Gestione richieste OPTIONS per CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Funzione per leggere i dati
function readData() {
    global $dataFile;
    if (!file_exists($dataFile)) {
        return [];
    }
    $content = file_get_contents($dataFile);
    return json_decode($content, true) ?: [];
}

// Funzione per scrivere i dati
function writeData($data) {
    global $dataFile;
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents($dataFile, $json) !== false;
}

// Gestione delle richieste
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        // Lettura dati
        $userId = $_GET['userId'] ?? null;
        $data = readData();
        
        if ($userId) {
            // Ritorna i dati di un utente specifico
            $userData = $data[$userId] ?? null;
            echo json_encode(['success' => true, 'data' => $userData]);
        } else {
            // Ritorna tutti i dati
            echo json_encode(['success' => true, 'data' => $data]);
        }
        break;
        
    case 'POST':
    case 'PUT':
        // Salvataggio dati
        $userId = $input['userId'] ?? null;
        $userData = $input['data'] ?? null;
        
        if (!$userId || !$userData) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'userId e data sono obbligatori']);
            exit();
        }
        
        $allData = readData();
        $allData[$userId] = $userData;
        
        if (writeData($allData)) {
            echo json_encode(['success' => true, 'message' => 'Dati salvati con successo']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Errore durante il salvataggio']);
        }
        break;
        
    case 'DELETE':
        // Eliminazione dati di un utente
        $userId = $input['userId'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'userId è obbligatorio']);
            exit();
        }
        
        $allData = readData();
        if (isset($allData[$userId])) {
            unset($allData[$userId]);
            if (writeData($allData)) {
                echo json_encode(['success' => true, 'message' => 'Utente eliminato con successo']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Errore durante l\'eliminazione']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Utente non trovato']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Metodo non supportato']);
        break;
}
