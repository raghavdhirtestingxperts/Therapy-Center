using System.ComponentModel.DataAnnotations;

namespace TherapyCenterAPI.Models;

public class DoctorFinding
{
    [Key]
    public int FindingId { get; set; }
    public int AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;
    public string Observations { get; set; } = string.Empty;
    public string Recommendations { get; set; } = string.Empty;
    public DateTime? NextSessionDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
