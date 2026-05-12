namespace TherapyCenterAPI.Models;

public class Slot
{
    public int SlotId { get; set; }
    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsBooked { get; set; } = false;
}
