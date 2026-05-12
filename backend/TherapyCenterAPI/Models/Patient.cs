namespace TherapyCenterAPI.Models;

public class Patient
{
    public int PatientId { get; set; }
    public int? GuardianId { get; set; }
    public User? Guardian { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string MedicalHistory { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
