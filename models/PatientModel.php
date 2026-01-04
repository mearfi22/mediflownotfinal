<?php

class PatientModel {
    protected $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // ... existing code ...

    public function create(array $data) {
        // ... existing code ...

        // Ensure a unique patient UID is generated if not provided
        if (empty($data['patient_uid'])) {
            // Prefer DB UUID(); if you want purely app-generated:
            $data['patient_uid'] = $this->generateUuidV4();
        }

        // Insert statement (adjust columns according to your schema)
        $stmt = $this->db->prepare("
            INSERT INTO patients (patient_uid, first_name, last_name, birth_date, contact, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $data['patient_uid'],
            $data['first_name'],
            $data['last_name'],
            $data['birth_date'],
            $data['contact']
        ]);

        // ... existing code ...
    }

    private function generateUuidV4(): string {
        // Simple UUIDv4 generator without external libs
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    // ... existing code ...
}