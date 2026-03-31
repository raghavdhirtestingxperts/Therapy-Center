using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TherapyCenterAPI.Models
{
    public class Appointment
    {
        [Key]
        public int AppointmentId { get; set; }
        [Required]
        public int PatientId { get; set; }
        [ForeignKey("PatientId")]
        public Patient Patient { get; set; } = null!;
        [Required]
        public int DoctorId { get; set; }
        [ForeignKey("DoctorId")]
        public Doctor Doctor { get; set; } = null!;
        [Required]
        public int TherapyId { get; set; }
        [ForeignKey("TherapyId")]
        public Therapy Therapy { get; set; } = null!;
        public int? ReceptionistId { get; set; }
        [ForeignKey("ReceptionistId")]
        public User? Receptionist { get; set; }
        [Required]
        public DateTime AppointmentDate { get; set; }
        [Required]
        public TimeSpan StartTime { get; set; }
        [Required]
        public TimeSpan EndTime { get; set; }
        [MaxLength(20)]
        public string Status { get; set; } = "Scheduled"; // 'Scheduled', 'Completed', 'Cancelled'
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
