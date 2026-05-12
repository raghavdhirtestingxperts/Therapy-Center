namespace TherapyCenterAPI.Models;

public class Therapy
{
    public int TherapyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal Cost { get; set; }
}
