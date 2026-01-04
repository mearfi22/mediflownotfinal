<?php

class DoctorController {
    protected $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // ... existing code ...

    public function index() {
        $doctors = $this->db->query("
            SELECT doc.*, d.name AS department_name
            FROM doctors doc
            LEFT JOIN departments d ON doc.department_id = d.id
            ORDER BY doc.full_name ASC
        ")->fetchAll();
        include __DIR__ . "\\..\\views\\doctor_manage.php";
    }

    public function create(array $data) {
        $stmt = $this->db->prepare("
            INSERT INTO doctors (department_id, full_name, email, phone, status, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $data['department_id'],
            $data['full_name'],
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['status'] ?? 'active',
        ]);
        // ... redirect or return ...
    }

    public function update(int $id, array $data) {
        $stmt = $this->db->prepare("
            UPDATE doctors
            SET department_id = ?, full_name = ?, email = ?, phone = ?, status = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $data['department_id'],
            $data['full_name'],
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['status'] ?? 'active',
            $id
        ]);
        // ... redirect or return ...
    }

    public function delete(int $id) {
        $stmt = $this->db->prepare("DELETE FROM doctors WHERE id = ?");
        $stmt->execute([$id]);
        // ... redirect or return ...
    }

    // ... existing code ...
}