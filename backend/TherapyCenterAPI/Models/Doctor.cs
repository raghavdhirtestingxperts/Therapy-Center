namespace TherapyCenterAPI.Models;

public class Doctor
{
    public int DoctorId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Specialization { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string AvailableDays { get; set; } = string.Empty; // e.g., "Mon,Wed,Fri"
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}
