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

### 🔒 Security & Session Management
- **Idle Auto-Logout**: Users are automatically signed out after **15 minutes of inactivity** (no mouse movement, clicks, scrolling, or keystrokes) — aligned with HIPAA guidelines for healthcare applications.
- **JWT Token Expiry**: Access tokens expire after **8 hours** (one full work shift), reducing the risk window if a token is ever compromised.
- **Page-Load Token Validation**: On every page load or browser refresh, the stored JWT is decoded and its expiry is checked. If expired, the "Session Expired" modal is shown immediately — no silent failures.
- **Global 401 Interceptor**: A global Axios response interceptor catches any `401 Unauthorized` response from any API call across the entire app and automatically triggers the session expiry flow.
- **Session Expired Modal**: A styled, accessible modal informs users when their session has ended and guides them back to the login page.

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

## 📋 Changelog

### Latest Updates

#### 🚀 Features & Enhancements
- **Dynamic Notifications**: Added a real-time `NotificationBell` with 10-second background polling to show pending payments and upcoming appointment alerts.
- **Interactive Charts**: Integrated rich visual analytics (appointment trends and revenue breakdown) on the Admin dashboard.
- **Doctor Read-Only Access**: Doctors can now review a patient's historical medical records and findings directly from the patient list in read-only mode.
- **Toast Alerts**: Built a custom animated Toast notification provider and solved the `addToast` integration bug.
- **Performance Optimization**: Implemented React `lazy()` and `Suspense` routing for faster frontend bundle loading.

#### 🔧 Backend Infrastructure & Security
- **Global Exception Middleware**: Introduced global exception logging and formatted JSON error responses.
- **Secrets Management**: Commited an `appsettings.Template.json` and added local `appsettings.json` to `.gitignore` to prevent secret leaks.
- **Input Validation**: Added strong validation constraints (DataAnnotations) to backend DTO requests.
- **CORS & Rate Limiting**: Added strict CORS header restrictions and a 20 requests/min rate limiter on authentication endpoints.
- **Refresh Tokens**: Added a secure refresh token structure for persistent user sessions.

#### 🧹 Cleanup & Simplification
- **English-Only Localization**: Removed the Spanish translations to keep the application focused entirely on English.
- **Deprecated Forgot Password & SMTP**: Removed Email sending, SMTP service setup, and forgotten password reset flows for direct administrator-mediated account resets.
- **Fixed PDF Reports**: Resolved the `undefined undefined` patient name bug on session report PDF downloads.

#### 🔒 Session Expiry & Security Hardening
- Added `isTokenExpired()` JWT decoder to validate stored tokens on page load.
- Introduced a global Axios 401 interceptor — any expired/invalid token triggers auto-logout from anywhere in the app.
- Idle session timeout set to **15 minutes** (HIPAA-aligned).
- JWT token lifetime reduced from 24 hours to **8 hours** (one work shift).
- Removed hardcoded demo credential hints from the login page UI.

#### 🌗 Light/Dark Theme System
- System-wide theme toggle persisted via `localStorage`.
- CSS custom properties (`--bg`, `--text`, `--primary`, etc.) for consistent theming.

#### 👋 Dynamic Greetings
- Time-based greetings (Good Morning/Afternoon/Evening) displayed on all role dashboards and the navbar.
- User name is recovered from `/api/auth/profile` on page refresh.

#### 💳 Razorpay Payment Integration
- Full Razorpay payment gateway with auto-detection of sandbox vs. mock mode.
- HMAC-SHA256 signature verification on the backend before saving transactions.

---

## 🛡 License
This project is licensed under the MIT License.

