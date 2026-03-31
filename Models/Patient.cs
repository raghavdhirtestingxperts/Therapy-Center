using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TherapyCenterAPI.Models
{
    public class Patient
    {
        [Key]
        public int PatientId { get; set; }
        public int? GuardianId { get; set; }
        [ForeignKey("GuardianId")]
        public User? Guardian { get; set; }
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        [MaxLength(10)]
        public string? Gender { get; set; }
        public string? MedicalHistory { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
