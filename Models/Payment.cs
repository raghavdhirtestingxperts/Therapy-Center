using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TherapyCenterAPI.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }
        [Required]
        public int AppointmentId { get; set; }
        [ForeignKey("AppointmentId")]
        public Appointment Appointment { get; set; } = null!;
        [Required]
        public decimal Amount { get; set; }
        [MaxLength(50)]
        public string? PaymentMethod { get; set; } // 'Credit Card', 'Cash', 'Insurance'
        [MaxLength(100)]
        public string? TransactionId { get; set; }
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // 'Paid', 'Failed', 'Refunded'
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
