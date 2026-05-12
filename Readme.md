# Special Kids Therapy Center Management System

A comprehensive Full-Stack Management Solution for therapy centers specializing in child development. This system streamlines the entire process from administrative setup and doctor scheduling to patient booking and medical reporting.

## 🚀 Features

### 👑 Admin Portal
- **Dashboard Analytics**: Real-time stats on revenue, appointments, and patient count.
- **Service Management**: Full CRUD operations for therapies (Physical, Speech, ABA, etc.).
- **Staff Control**: Manage Receptionists and Doctors with role-based access control.
- **Smart Slot Generator**: Automatically generate time slots based on doctor availability and session duration.

### 🏥 Receptionist Dashboard
- **Offline Booking**: Schedule appointments for walk-in patients.
- **Patient Management**: Register new children and manage profiles.
- **Payment Processing**: Record cash payments and manage appointment status.
- **Live Search**: Filter appointments by patient name or status.

### 👨‍⚕️ Doctor Portal
- **Digital Schedule**: View daily/weekly appointment lists.
- **Medical Findings**: Submit observations and recommendations for every session.
- **Patient History**: Access past therapy reports and progress notes before starting a session.
- **Follow-up Planning**: Recommend next session dates directly in the system.

### 👨‍👩‍👧‍👦 Patient/Guardian Portal
- **Online Booking**: 3-step wizard to select therapy, doctor, and available time slot.
- **Progress Tracking**: View and download medical reports and doctor recommendations.
- **Payment History**: Track all paid and pending session fees.
- **Profile Management**: Manage multiple child profiles under one guardian account.

---

## 🛠 Tech Stack

### Backend
- **Framework**: ASP.NET Core 6/10 (Web API)
- **Database**: MySQL
- **ORM**: Entity Framework Core
- **Security**: JWT (JSON Web Token) Authentication & RBAC
- **JSON Handling**: System.Text.Json with Reference Cycle Handling

### Frontend
- **Library**: React 18+ (Vite)
- **Styling**: Bootstrap 5 & Vanilla CSS (Custom Indigo/Violet Theme)
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## 📂 Database Schema

The system uses a relational MySQL schema:
- **Users**: Authentication and Role management.
- **Therapies**: Catalog of services and pricing.
- **Doctors**: Professional profiles linked to Users.
- **Patients**: Child profiles linked to Guardians.
- **Slots**: Pre-generated time intervals to prevent double-booking.
- **Appointments**: The bridge between Patient, Doctor, and Therapy.
- **DoctorFindings**: Medical reports for completed sessions.
- **Payments**: Transaction records for audit trails.

---

## ⚙️ Setup Instructions

### Prerequisites
- .NET SDK (6.0 or higher)
- MySQL Server
- Node.js (v16 or higher)

### 1. Backend Setup
1. Navigate to `backend/TherapyCenterAPI`.
2. Update `appsettings.json` with your MySQL connection string.
3. Run migrations:
   ```bash
   dotnet ef database update
   ```
4. Start the server:
   ```bash
   dotnet run
   ```
   *The API will be available at http://localhost:5248*

### 2. Frontend Setup
1. Navigate to `frontend/therapy-frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The App will be available at http://localhost:5173*

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@therapycenter.com` | `admin123` |
| **Receptionist** | `reception@therapycenter.com` | `pass123` |
| **Doctor** | `doctor@therapycenter.com` | `pass123` |
| **Guardian** | `guardian@therapycenter.com` | `pass123` |

---

## 🛡 License
This project is licensed under the MIT License.
