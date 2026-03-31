using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("process")]
        public async Task<ActionResult<Payment>> ProcessPayment(Payment payment)
        {
            // Integration with Stripe/Razorpay would happen here.
            // For now, we simulate a successful payment.
            
            payment.Status = "Paid";
            payment.PaidAt = DateTime.UtcNow;
            payment.TransactionId = "TXN_" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return Ok(payment);
        }

        [HttpGet("history/{appointmentId}")]
        public async Task<ActionResult<Payment>> GetPaymentStatus(int appointmentId)
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);

            if (payment == null) return NotFound();
            return payment;
        }
    }
}
