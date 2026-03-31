using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TherapyCenterAPI.Models
{
    public class Doctor
    {
        [Key]
        public int DoctorId { get; set; }
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
        [MaxLength(100)]
        public string? Specialization { get; set; }
        public string? Bio { get; set; }
        [MaxLength(50)]
        public string? AvailableDays { get; set; } // e.g., "Mon,Wed,Fri"
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
    }
}
