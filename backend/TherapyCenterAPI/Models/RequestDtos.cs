namespace TherapyCenterAPI.Models;

// ─── Auth DTOs ───
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

// ─── Admin / Staff DTOs ───
public class CreateStaffRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Receptionist";
    public string? PhoneNumber { get; set; }
}

public class CreateDoctorRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string AvailableDays { get; set; } = string.Empty;
    public string StartTime { get; set; } = "09:00";
    public string EndTime { get; set; } = "17:00";
}

public class GenerateSlotsRequest
{
    public int DoctorId { get; set; }
    public DateTime Date { get; set; }
    public int SlotDurationMinutes { get; set; } = 45;
}

// ─── Appointment DTOs ───
public class BookAppointmentRequest
{
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int TherapyId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
}

// ─── Patient DTOs ───
public class CreatePatientRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? MedicalHistory { get; set; }
    public int? GuardianId { get; set; }
}

// ─── Doctor DTOs ───
public class SubmitFindingRequest
{
    public int AppointmentId { get; set; }
    public string Observations { get; set; } = string.Empty;
    public string Recommendations { get; set; } = string.Empty;
    public DateTime? NextSessionDate { get; set; }
}

// ─── Payment DTOs ───
public class DummyPayRequest
{
    public int AppointmentId { get; set; }
    public string? PaymentMethod { get; set; }
}

public class RazorpayOrderRequest
{
    public int AppointmentId { get; set; }
}

public class RazorpayVerifyRequest
{
    public int AppointmentId { get; set; }
    public string RazorpayOrderId { get; set; } = string.Empty;
    public string RazorpayPaymentId { get; set; } = string.Empty;
    public string RazorpaySignature { get; set; } = string.Empty;
}

