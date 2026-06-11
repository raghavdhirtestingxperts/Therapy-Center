using System.ComponentModel.DataAnnotations;

namespace TherapyCenterAPI.Models;

// Auth DTOs
public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(1)]
    public string Password { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}



// Admin / Staff DTOs
public class CreateStaffRequest
{
    [Required, StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "Receptionist";

    [Phone]
    public string? PhoneNumber { get; set; }
}

public class CreateDoctorRequest
{
    [Required, StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Specialization { get; set; } = string.Empty;

    public string? Bio { get; set; }

    [Required]
    public string AvailableDays { get; set; } = string.Empty;

    public string StartTime { get; set; } = "09:00";
    public string EndTime { get; set; } = "17:00";
}

public class GenerateSlotsRequest
{
    [Required, Range(1, int.MaxValue)]
    public int DoctorId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Range(5, 480)]
    public int SlotDurationMinutes { get; set; } = 45;
}

// Appointment DTOs
public class BookAppointmentRequest
{
    public int PatientId { get; set; }

    [Required, Range(1, int.MaxValue)]
    public int DoctorId { get; set; }

    [Required, Range(1, int.MaxValue)]
    public int TherapyId { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [Required]
    public string StartTime { get; set; } = string.Empty;

    [Required]
    public string EndTime { get; set; } = string.Empty;
}

// Patient DTOs
public class CreatePatientRequest
{
    [Required, StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    public string Gender { get; set; } = string.Empty;

    public string? MedicalHistory { get; set; }
    public int? GuardianId { get; set; }
}

// Doctor DTOs
public class SubmitFindingRequest
{
    [Required, Range(1, int.MaxValue)]
    public int AppointmentId { get; set; }

    [Required, MinLength(1)]
    public string Observations { get; set; } = string.Empty;

    [Required, MinLength(1)]
    public string Recommendations { get; set; } = string.Empty;

    public DateTime? NextSessionDate { get; set; }
}

// Payment DTOs
public class DummyPayRequest
{
    [Required, Range(1, int.MaxValue)]
    public int AppointmentId { get; set; }

    public string? PaymentMethod { get; set; }
}

public class RazorpayOrderRequest
{
    [Required, Range(1, int.MaxValue)]
    public int AppointmentId { get; set; }
}

public class RazorpayVerifyRequest
{
    [Required, Range(1, int.MaxValue)]
    public int AppointmentId { get; set; }

    [Required]
    public string RazorpayOrderId { get; set; } = string.Empty;

    [Required]
    public string RazorpayPaymentId { get; set; } = string.Empty;

    [Required]
    public string RazorpaySignature { get; set; } = string.Empty;
}

public class UpdateProfilePictureRequest
{
    public string? ProfilePicture { get; set; }
}
