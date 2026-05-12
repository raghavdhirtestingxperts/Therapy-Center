namespace TherapyCenterAPI.Models;

public class Payment
{
    public int PaymentId { get; set; }
    public int AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty; // 'Credit Card', 'Cash', 'Insurance', 'Razorpay'
    public string? TransactionId { get; set; }
    public string Status { get; set; } = "Pending"; // 'Paid', 'Failed', 'Refunded'
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
