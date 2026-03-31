using System.ComponentModel.DataAnnotations;

namespace TherapyCenterAPI.Models
{
    public class Therapy
    {
        [Key]
        public int TherapyId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public int DurationMinutes { get; set; } // e.g., 30, 45, 60 mins
        [Required]
        public decimal Cost { get; set; }
    }
}
