using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapyCenterAPI.Models;
using TherapyCenterAPI.Services;

namespace TherapyCenterAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAppointments()
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var appointments = await _appointmentService.GetAppointmentsAsync(role, userId);
        return Ok(appointments);
    }

    [HttpGet("slots")]
    public async Task<IActionResult> GetAvailableSlots(int doctorId, DateTime date)
        => Ok(await _appointmentService.GetAvailableSlotsAsync(doctorId, date));

    [HttpGet("patients")]
    public async Task<IActionResult> GetPatients()
        => Ok(await _appointmentService.GetPatientsAsync());

    [HttpGet("therapies")]
    public async Task<IActionResult> GetTherapies()
        => Ok(await _appointmentService.GetTherapiesAsync());

    [HttpGet("doctors")]
    public async Task<IActionResult> GetDoctors()
        => Ok(await _appointmentService.GetActiveDoctorsAsync());

    [HttpPost("book")]
    public async Task<IActionResult> BookAppointment([FromBody] BookAppointmentRequest request)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var (success, message, appointment) = await _appointmentService.BookAppointmentAsync(request, role, userId);

        if (!success)
        {
            if (message == "Forbidden.") return Forbid();
            return BadRequest(message);
        }

        return Ok(appointment);
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        var (success, message) = await _appointmentService.CancelAppointmentAsync(id);
        if (!success) return message == "Not found." ? NotFound() : BadRequest(message);
        return Ok(new { message });
    }
}
