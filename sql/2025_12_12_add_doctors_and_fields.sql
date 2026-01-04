-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctors_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Add a unique patient UID (UUID)
ALTER TABLE patients
    ADD COLUMN patient_uid CHAR(36) UNIQUE;

-- Backfill existing patient_uid values
UPDATE patients
SET patient_uid = UUID()
WHERE patient_uid IS NULL OR patient_uid = '';

-- Optional: trigger to auto-generate patient_uid on insert
DELIMITER $$
CREATE TRIGGER patients_set_uid_before_insert
BEFORE INSERT ON patients
FOR EACH ROW
BEGIN
    IF NEW.patient_uid IS NULL OR NEW.patient_uid = '' THEN
        SET NEW.patient_uid = UUID();
    END IF;
END$$
DELIMITER ;

-- Add department and doctor references to queue table
ALTER TABLE queue
    ADD COLUMN department_id INT NULL,
    ADD COLUMN doctor_id INT NULL,
    ADD CONSTRAINT fk_queue_department FOREIGN KEY (department_id) REFERENCES departments(id),
    ADD CONSTRAINT fk_queue_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id);

-- Indexes for faster lookups
CREATE INDEX idx_queue_department ON queue(department_id);
CREATE INDEX idx_queue_doctor ON queue(doctor_id);