<?php
// ... existing code ...

// Example: fetch enriched queue rows with joins
// $queueItems = $db->query("
//   SELECT q.*, d.name AS department_name, doc.full_name AS doctor_name
//   FROM queue q
//   LEFT JOIN departments d ON q.department_id = d.id
//   LEFT JOIN doctors doc ON q.doctor_id = doc.id
//   ORDER BY q.created_at DESC
// ")->fetchAll();

// ... existing code ...
?>
<table class="table">
    <thead>
        <tr>
            <!-- ... existing <th> ... -->
            <th>Department</th>
            <th>Assigned Doctor</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($queueItems as $item): ?>
            <tr>
                <!-- ... existing <td> ... -->
                <td><?= htmlspecialchars($item['department_name'] ?? '—') ?></td>
                <td><?= htmlspecialchars($item['doctor_name'] ?? 'Unassigned') ?></td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>
<!-- ... existing code ... -->