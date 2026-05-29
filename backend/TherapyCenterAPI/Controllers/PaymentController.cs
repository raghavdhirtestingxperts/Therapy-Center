using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapyCenterAPI.Models;
using TherapyCenterAPI.Services;

namespace TherapyCenterAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("pay")]
    public async Task<IActionResult> Pay([FromBody] DummyPayRequest request)
    {
        var (success, message, result) = await _paymentService.PayAsync(request);
        if (!success) return message == "Appointment not found." ? NotFound(message) : BadRequest(message);
        return Ok(result);
    }

    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] RazorpayOrderRequest request)
    {
        var (success, message, result) = await _paymentService.CreateRazorpayOrderAsync(request);
        if (!success) return BadRequest(message);
        return Ok(result);
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] RazorpayVerifyRequest request)
    {
        var (success, message, result) = await _paymentService.VerifyRazorpayPaymentAsync(request);
        if (!success) return BadRequest(message);
        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetPaymentHistory()
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var payments = await _paymentService.GetHistoryAsync(role, userId);
        return Ok(payments);
    }

    [HttpGet("appointment/{appointmentId}")]
    public async Task<IActionResult> GetPaymentForAppointment(int appointmentId)
    {
        var payment = await _paymentService.GetByAppointmentAsync(appointmentId);
        if (payment == null) return NotFound();
        return Ok(payment);
    }
}
