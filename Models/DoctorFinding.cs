using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TherapyCenterAPI.Models
{
    public class DoctorFinding
    {
        [Key]
        public int FindingId { get; set; }
        [Required]
        public int AppointmentId { get; set; }
        [ForeignKey("AppointmentId")]
        public Appointment Appointment { get; set; } = null!;
        public string? Observations { get; set; }
        public string? Recommendations { get; set; }
        public DateTime? NextSessionDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
