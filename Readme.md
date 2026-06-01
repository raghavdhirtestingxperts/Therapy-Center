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

### ✨ Personalization & Greetings
- **Dynamic Time-Based Greetings**: Greets logged-in users with a time-appropriate message ("Good Morning", "Good Afternoon", "Good Evening", or "Hello") followed by their name on the dashboard header.
- **Persistent Navbar Greeting**: Shows a personalized welcome in the global navigation bar next to the role badge.
- **Session Profile Recovery**: Powered by a secure `/api/auth/profile` backend endpoint that restores user names on page refresh.

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

## 💳 Payment Gateway Integration (Razorpay)

The system features a fully functional Razorpay Payment Gateway integration supporting both live testing and a fallback mock demo mode:

### 1. Mock/Demo Mode (Default Setup)
- If Razorpay API keys are not configured or are set to their default placeholder values in `appsettings.json`, the application automatically defaults to **Mock Mode**.
- The backend generates a mock order (`order_mock_...`) and the frontend prompts the user with a browser confirmation dialog to simulate a successful checkout.
- Upon confirmation, a mock payment verification request is processed and stored in the database as completed (Method: `Razorpay`, Status: `Paid`).

### 2. Sandbox/Test Mode Setup
To run actual test-mode transactions using the official Razorpay Checkout interface:
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/) and generate **Test API Keys** (`Key ID` and `Key Secret`).
2. Add these credentials to the `Razorpay` configuration block in `backend/TherapyCenterAPI/appsettings.json`:
   ```json
   "Razorpay": {
     "KeyId": "rzp_test_YOUR_KEY_ID",
     "KeySecret": "YOUR_KEY_SECRET"
   }
   ```
3. The application will automatically detect the presence of real keys and transition into Sandbox mode:
   - Frontend will load the Razorpay checkout script from `https://checkout.razorpay.com/v1/checkout.js`.
   - Clicking "Pay Now" will open the official Razorpay checkout modal allowing you to test payments (e.g., using test cards, Netbanking, or UPI).
   - The backend validates the integrity of payments via an HMAC-SHA256 signature verification utilizing the configured `KeySecret` before saving the transaction records.

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
