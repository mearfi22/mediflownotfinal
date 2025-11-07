<?php

// Direct API test using file_get_contents
$url = 'http://localhost:8000/api/pre-registrations';
$data = [
    'last_name' => 'Cruz',
    'first_name' => 'Maria',
    'middle_name' => 'Santos',
    'address' => '123 Rizal Street, Barangay San Jose, Roxas City, Capiz',
    'contact_number' => '+63 917 123 4567',
    'sex' => 'female',
    'civil_status' => 'Married',
    'spouse_name' => 'Juan Cruz',
    'date_of_birth' => '1985-03-15',
    'age' => '38',
    'birthplace' => 'Roxas City, Capiz',
    'nationality' => 'Filipino',
    'religion' => 'Roman Catholic',
    'occupation' => 'Teacher',
    'reason_for_visit' => 'Annual physical examination and health checkup. I have been experiencing mild headaches lately and would like to get a general consultation.',
    'philhealth_id' => '12-345678901-2'
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
