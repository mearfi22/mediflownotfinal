<?php

// Direct API test
$url = 'http://localhost:8000/api/login';
$data = [
    'email' => 'admin@careconnect.com',
    'password' => 'password'
];

$options = [
    'http' => [
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

echo "Response:\n";
echo $response . "\n\n";

if (isset($http_response_header)) {
    echo "Headers:\n";
    foreach ($http_response_header as $header) {
        echo $header . "\n";
    }
}
?>
