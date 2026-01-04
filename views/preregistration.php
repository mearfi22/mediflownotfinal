<?php
// ... existing code ...

// Example: fetch doctors (or provided by controller)
// $departments = $db->query("SELECT id, name FROM departments ORDER BY name")->fetchAll();
// $doctors = $db->query("SELECT id, full_name, department_id FROM doctors WHERE status = 'active' ORDER BY full_name")->fetchAll();

// Preserve selected values from POST or prefilled variables set by the controller
$oldDepartmentId = isset($_POST['department_id']) ? (string)$_POST['department_id'] : (isset($selectedDepartmentId) ? (string)$selectedDepartmentId : '');
$oldDoctorId     = isset($_POST['doctor_id']) ? (string)$_POST['doctor_id'] : (isset($selectedDoctorId) ? (string)$selectedDoctorId : '');

?>

<form method="post" action="/preregistration/submit">
    <!-- ... existing patient fields ... -->

    <div>
        <label>Department</label>
        <select id="department_id" name="department_id" required>
            <option value="">Select Department</option>
            <?php foreach (($departments ?? []) as $dept): ?>
                <option value="<?= (int)$dept['id'] ?>" <?= ((string)$dept['id'] === $oldDepartmentId) ? 'selected' : '' ?>>
                    <?= htmlspecialchars($dept['name']) ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>

    <div>
        <label>Doctor</label>
        <select id="doctor_id" name="doctor_id" <?= $oldDepartmentId ? '' : 'disabled' ?> required>
            <option value="">Select Doctor</option>
            <?php foreach (($doctors ?? []) as $doc): ?>
                <option
                    value="<?= (int)$doc['id'] ?>"
                    data-dept="<?= (int)$doc['department_id'] ?>"
                    <?= ((string)$doc['id'] === $oldDoctorId) ? 'selected' : '' ?>
                >
                    <?= htmlspecialchars($doc['full_name']) ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>

    <!-- ... existing submit button ... -->
</form>

<script>
    // Optional: filter doctors by selected department on the client-side
    (function() {
        var deptSelect = document.getElementById('department_id');
        var docSelect = document.getElementById('doctor_id');

        function filterDoctors() {
            var deptId = deptSelect.value;
            var hasVisibleDoctor = false;

            // Enable/disable doctor select depending on department selection
            docSelect.disabled = !deptId;

            for (var i = 0; i < docSelect.options.length; i++) {
                var opt = docSelect.options[i];
                var optDept = opt.getAttribute('data-dept');

                // Keep placeholder visible
                if (!optDept) {
                    opt.style.display = '';
                    continue;
                }

                // Show options that match selected department
                var visible = (optDept == deptId); // loose equality OK: attribute is string
                opt.style.display = visible ? '' : 'none';
                if (visible) hasVisibleDoctor = true;
            }

            // Reset selection if current choice is hidden or department not selected
            var selectedOpt = docSelect.selectedOptions[0];
            if (!deptId || (selectedOpt && selectedOpt.getAttribute('data-dept') != deptId)) {
                docSelect.value = '';
            }

            // If no matching doctors, keep select enabled state reflective of dept selection
            // (already handled above with docSelect.disabled = !deptId)
        }

        deptSelect.addEventListener('change', filterDoctors);
        // Initial filter on load to reflect any preselected values
        filterDoctors();
    })();
</script>

<?php
// ... existing code ...