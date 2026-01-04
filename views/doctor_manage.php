<?php
// ... existing code ...

// Example: $doctors, $departments provided by controller
?>
<h1>Manage Doctors</h1>

<form method="post" action="/doctors/create">
    <div>
        <label>Full Name</label>
        <input type="text" name="full_name" required />
    </div>
    <div>
        <label>Department</label>
        <select name="department_id" required>
            <?php foreach (($departments ?? []) as $dept): ?>
                <option value="<?= (int)$dept['id'] ?>"><?= htmlspecialchars($dept['name']) ?></option>
            <?php endforeach; ?>
        </select>
    </div>
    <div>
        <label>Email</label>
        <input type="email" name="email" />
    </div>
    <div>
        <label>Phone</label>
        <input type="text" name="phone" />
    </div>
    <div>
        <label>Status</label>
        <select name="status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
        </select>
    </div>
    <button type="submit">Add Doctor</button>
</form>

<hr />

<table class="table">
    <thead>
        <tr>
            <th>Full Name</th>
            <th>Department</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
    <?php foreach (($doctors ?? []) as $doc): ?>
        <tr>
            <td><?= htmlspecialchars($doc['full_name']) ?></td>
            <td><?= htmlspecialchars($doc['department_name']) ?></td>
            <td><?= htmlspecialchars($doc['email'] ?? '') ?></td>
            <td><?= htmlspecialchars($doc['phone'] ?? '') ?></td>
            <td><?= htmlspecialchars($doc['status']) ?></td>
            <td>
                <a href="/doctors/edit?id=<?= (int)$doc['id'] ?>">Edit</a>
                <a href="/doctors/delete?id=<?= (int)$doc['id'] ?>" onclick="return confirm('Delete this doctor?')">Delete</a>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>

<?php
// ... existing code ...