# Roxas Memorial Provincial Hospital - Management System

A comprehensive Hospital Management System prototype built with Laravel (backend) and React TypeScript (frontend), specifically designed for Roxas Memorial Provincial Hospital.

## 🎉 Project Status: COMPLETE

CareConnect Hospital Management System is now fully functional with all core modules implemented:

✅ **Authentication & Authorization** - Role-based access control  
✅ **Patient Management** - Complete CRUD with search/filter  
✅ **Medical Records** - Full medical history management  
✅ **Queue Management** - Real-time queue operations  
✅ **Public Queue Display** - Live queue status screen  
✅ **Online Pre-listing** - Public registration with staff approval  
✅ **Dashboard** - Real-time statistics and management  

## 🚀 Quick Start

### Both servers are currently running:
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Queue Display**: http://localhost:3000/queue-display
- **Pre-registration**: http://localhost:3000/pre-register

### Demo Accounts:
- **Admin**: admin@careconnect.com / password
- **Staff**: staff@careconnect.com / password

Roxas Memorial Provincial Hospital Management System helps manage patients, medical records, and patient queuing efficiently. The system is modular, cleanly coded, and features a modern interface with role-based access control.

## 🚀 Tech Stack

### Backend
- **Laravel 11** (Latest version)
- **MySQL** database with Laravel migrations & Eloquent ORM
- **Laravel Sanctum** for API authentication
- **RESTful API** architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** with modern light theme and teal accent (#1ABC9C)
- **Heroicons** for icons
- **React Router** for navigation
- **Axios** for API communication
- **React Hook Form** for form handling

## 📋 Features

### ✅ Completed Modules

1. **Authentication System**
   - Role-based login (Admin/Staff)
   - JWT token authentication with Laravel Sanctum
   - Protected routes

2. **Dashboard**
   - Real-time statistics cards
   - Current queue status
   - Recent patients table
   - Pre-registration management
   - Quick action buttons

3. **Patient Management**
   - Complete CRUD operations
   - Patient registration form with all required fields
   - Patient listing with pagination
   - Patient details view
   - Search and filter capabilities

4. **Medical Records Management** ✅ COMPLETE
   - Patient medical history with full CRUD
   - Diagnosis and treatment records
   - Doctor notes and visit tracking
   - Medical record modal for add/edit/view
   - Filter by patient functionality

5. **Queue Management System** ✅ COMPLETE
   - Queue number assignment with auto-increment
   - Real-time status updates (waiting, serving, served, skipped)
   - Queue statistics dashboard
   - Staff queue management interface
   - Auto-refresh every 30 seconds

6. **Queue Display Screen** ✅ COMPLETE
   - Public queue display with real-time updates
   - Now serving with large queue number display
   - Next 3 patients in line
   - Modern responsive design
   - Auto-refresh every 10 seconds

7. **Online Pre-listing** ✅ COMPLETE
   - Public patient registration form
   - Staff approval workflow in dashboard
   - Automatic patient and queue creation on approval
   - Email/contact notification ready

8. **Database Architecture**
   - Users table with role support
   - Patients table with comprehensive fields
   - Medical records with patient relationships
   - Queue system with status management
   - Pre-registrations for online patient intake

## 🗄️ Database Schema

### Users
- id, name, email, password, role (admin/staff)

### Patients
- id, full_name, date_of_birth, gender, address, contact_number
- civil_status, religion, philhealth_id, reason_for_visit, status

### Medical Records
- id, patient_id (FK), visit_date, diagnosis, treatment, notes, doctor_name

### Queue
- id, queue_number, patient_id (FK), reason_for_visit, status
- called_at, served_at, queue_date

### Pre-registrations
- id, patient data fields, status (pending/approved/rejected)
- approved_by (FK to users), approved_at

## 🔧 Installation & Setup

### Prerequisites
- PHP 8.1+
- Composer
- Node.js 18+
- npm/yarn
- MySQL 8.0+

### Backend Setup (Laravel)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   composer install
   ```

3. **Environment setup:**
   - Copy `.env.example` to `.env` (already configured)
   - Update database credentials in `.env` if needed

4. **Database setup:**
   ```bash
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   ```

5. **Start Laravel server:**
   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```

### Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The React app will run on `http://localhost:3000` and proxy API requests to `http://localhost:8000`.

## 👥 Demo Accounts

The system comes with pre-seeded demo accounts:

- **Admin:** admin@careconnect.com / password
- **Staff:** staff@careconnect.com / password
- **Doctor:** dr.garcia@careconnect.com / password

## 🎯 Key Features Implemented

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Protected routes and API endpoints

### Patient Management
- Complete patient CRUD operations
- Form validation with React Hook Form
- Modal-based patient forms
- Responsive data tables with pagination

### API Architecture
- RESTful API design
- Proper HTTP status codes
- Error handling and validation
- CORS configuration for frontend integration

### UI/UX
- Modern, clean design with TailwindCSS
- Responsive layout for all screen sizes
- Consistent color scheme with teal accent
- Intuitive navigation with sidebar layout
- Loading states and error handling

## 📁 Project Structure

### Backend (`/backend`)
```
app/
├── Http/Controllers/Api/    # API Controllers
├── Models/                  # Eloquent Models
database/
├── migrations/              # Database migrations
├── seeders/                # Sample data seeders
routes/
├── api.php                 # API routes
```

### Frontend (`/frontend`)
```
src/
├── components/             # Reusable React components
├── contexts/              # React Context (Auth)
├── pages/                 # Page components
├── services/              # API service layer
├── types/                 # TypeScript type definitions
```

## 🔗 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get authenticated user

### Patients
- `GET /api/patients` - List patients (paginated)
- `POST /api/patients` - Create patient
- `GET /api/patients/{id}` - Get patient details
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### Queue Management
- `GET /api/queue` - Get queue list
- `POST /api/queue` - Add patient to queue
- `PUT /api/queue/{id}` - Update queue status
- `GET /api/queue-statistics` - Get queue statistics
- `GET /api/queue/display` - Public queue display

### Medical Records
- `GET /api/medical-records` - List medical records
- `POST /api/medical-records` - Create medical record
- `GET /api/patients/{id}/medical-records` - Patient history

## 🛠️ Development Notes

### Code Quality
- TypeScript for type safety
- Clean, modular architecture
- Proper error handling
- Responsive design patterns

### Security Features
- CSRF protection
- SQL injection prevention (Eloquent ORM)
- XSS protection
- Rate limiting on API endpoints

### Performance Optimizations
- Database indexing on foreign keys
- Efficient pagination
- Optimized bundle with Vite
- Component lazy loading ready

## 🚀 Next Steps

To complete the remaining modules:

1. **Implement Queue Management UI** - Connect existing API endpoints
2. **Build Medical Records Interface** - Create forms and listing views  
3. **Complete Pre-listing Form** - Public patient registration
4. **Add Real-time Updates** - WebSocket integration for queue status
5. **Enhanced Search & Filters** - Advanced patient search
6. **Reports & Analytics** - Patient statistics and reports

## 🤝 Contributing

The system is designed with modularity in mind. Each module can be developed independently using the established patterns and API structure.

## 📄 License

This project is a prototype for educational and demonstration purposes.

---

**Built with ❤️ for rural healthcare management**#   M e d i q u e u e R N L  
 #   M e d i q u e u e R N L  
 "# mediflownotfinal" 
"# mediflownotfinal" 
