curl -X POST http://localhost:8000/api/pre-registrations \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"last_name\": \"Cruz\",
    \"first_name\": \"Maria\",
    \"middle_name\": \"Santos\",
    \"address\": \"123 Rizal Street, Barangay San Jose, Roxas City, Capiz\",
    \"contact_number\": \"+63 917 123 4567\",
    \"sex\": \"female\",
    \"civil_status\": \"Married\",
    \"spouse_name\": \"Juan Cruz\",
    \"date_of_birth\": \"1985-03-15\",
    \"age\": \"38\",
    \"birthplace\": \"Roxas City, Capiz\",
    \"nationality\": \"Filipino\",
    \"religion\": \"Roman Catholic\",
    \"occupation\": \"Teacher\",
    \"reason_for_visit\": \"Annual physical examination and health checkup. I have been experiencing mild headaches lately and would like to get a general consultation.\",
    \"philhealth_id\": \"12-345678901-2\"
  }"
