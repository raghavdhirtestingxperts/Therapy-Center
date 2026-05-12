namespace TherapyCenterAPI.Models;

public class Appointment
{
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public int TherapyId { get; set; }
    public Therapy Therapy { get; set; } = null!;
    public int? ReceptionistId { get; set; }
    public User? Receptionist { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Status { get; set; } = "Scheduled"; // 'Scheduled', 'Completed', 'Cancelled'
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
