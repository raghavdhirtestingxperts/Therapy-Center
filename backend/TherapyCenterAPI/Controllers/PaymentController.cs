using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;
using System.Security.Claims;

namespace TherapyCenterAPI.Controllers;

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

    [HttpPost("pay")]
    public async Task<IActionResult> Pay([FromBody] DummyPayRequest request)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Therapy)
            .FirstOrDefaultAsync(a => a.AppointmentId == request.AppointmentId);
        if (appointment == null) return NotFound("Appointment not found.");

        // Check if already paid
        var existingPayment = await _context.Payments
            .FirstOrDefaultAsync(p => p.AppointmentId == request.AppointmentId && p.Status == "Paid");
        if (existingPayment != null) return BadRequest("Already paid.");

        var payment = new Payment
        {
            AppointmentId = request.AppointmentId,
            Amount = appointment.Therapy.Cost,
            PaymentMethod = request.PaymentMethod ?? "Online",
            TransactionId = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{request.AppointmentId}",
            Status = "Paid",
            PaidAt = DateTime.UtcNow
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Payment successful!", payment });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetPaymentHistory()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = int.Parse(userIdStr);

        IQueryable<Payment> query = _context.Payments
            .Include(p => p.Appointment).ThenInclude(a => a.Therapy)
            .Include(p => p.Appointment).ThenInclude(a => a.Patient)
            .Include(p => p.Appointment).ThenInclude(a => a.Doctor).ThenInclude(d => d.User);

        if (role == "Guardian" || role == "Patient")
        {
            var patientIds = await _context.Patients
                .Where(p => p.GuardianId == userId)
                .Select(p => p.PatientId)
                .ToListAsync();
            query = query.Where(p => patientIds.Contains(p.Appointment.PatientId));
        }

        return Ok(await query.OrderByDescending(p => p.PaidAt).ToListAsync());
    }

    [HttpGet("appointment/{appointmentId}")]
    public async Task<IActionResult> GetPaymentForAppointment(int appointmentId)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);
        if (payment == null) return NotFound();
        return Ok(payment);
    }
}

public class DummyPayRequest
{
    public int AppointmentId { get; set; }
    public string? PaymentMethod { get; set; }
}
