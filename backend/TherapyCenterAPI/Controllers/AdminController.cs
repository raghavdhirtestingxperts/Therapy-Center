using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapyCenterAPI.Models;
using TherapyCenterAPI.Services;

namespace TherapyCenterAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    // ─── Dashboard Stats ───
    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = await _adminService.GetDashboardStatsAsync();
        return Ok(new
        {
            totalPatients = stats.TotalPatients,
            totalDoctors = stats.TotalDoctors,
            totalAppointments = stats.TotalAppointments,
            todaysAppointments = stats.TodaysAppointments,
            scheduledAppointments = stats.ScheduledAppointments,
            completedAppointments = stats.CompletedAppointments,
            totalRevenue = stats.TotalRevenue,
            totalTherapies = stats.TotalTherapies
        });
    }

    // ─── Therapies CRUD ───
    [HttpGet("therapies")]
    [ResponseCache(Duration = 60)]
    public async Task<IActionResult> GetTherapies()
        => Ok(await _adminService.GetTherapiesAsync());

    [HttpPost("therapies")]
    public async Task<IActionResult> CreateTherapy([FromBody] Therapy therapy)
    {
        var created = await _adminService.CreateTherapyAsync(therapy);
        return CreatedAtAction(nameof(GetTherapies), new { id = created.TherapyId }, created);
    }

    [HttpPut("therapies/{id}")]
    public async Task<IActionResult> UpdateTherapy(int id, [FromBody] Therapy therapy)
    {
        var updated = await _adminService.UpdateTherapyAsync(id, therapy);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("therapies/{id}")]
    public async Task<IActionResult> DeleteTherapy(int id)
    {
        var deleted = await _adminService.DeleteTherapyAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    // ─── Users / Staff CRUD ───
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(string? role)
        => Ok(await _adminService.GetUsersAsync(role));

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateStaffRequest request)
    {
        var (success, message, user) = await _adminService.CreateUserAsync(request);
        if (!success) return BadRequest(message);
        return Ok(user);
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] CreateStaffRequest request)
    {
        var updated = await _adminService.UpdateUserAsync(id, request);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var toggled = await _adminService.ToggleUserActiveAsync(id);
        if (toggled == null) return NotFound();
        return Ok(toggled);
    }

    // ─── Doctors CRUD ───
    [HttpGet("doctors")]
    [ResponseCache(Duration = 60)]
    public async Task<IActionResult> GetDoctors()
        => Ok(await _adminService.GetDoctorsAsync());

    [HttpPost("doctors")]
    public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorRequest request)
    {
        var (success, message, doctor) = await _adminService.CreateDoctorAsync(request);
        if (!success) return BadRequest(message);
        return Ok(doctor);
    }

    [HttpPut("doctors/{id}")]
    public async Task<IActionResult> UpdateDoctor(int id, [FromBody] CreateDoctorRequest request)
    {
        var updated = await _adminService.UpdateDoctorAsync(id, request);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("doctors/{id}")]
    public async Task<IActionResult> DeleteDoctor(int id)
    {
        var deactivated = await _adminService.DeactivateDoctorAsync(id);
        if (!deactivated) return NotFound();
        return NoContent();
    }

    // ─── Slots Management ───
    [HttpGet("slots")]
    public async Task<IActionResult> GetSlots(int? doctorId, DateTime? date)
        => Ok(await _adminService.GetSlotsAsync(doctorId, date));

    [HttpPost("slots/generate")]
    public async Task<IActionResult> GenerateSlots([FromBody] GenerateSlotsRequest request)
    {
        var (success, message, slotsCreated) = await _adminService.GenerateSlotsAsync(request);
        if (!success) return NotFound(message);
        return Ok(new { message, slotsCreated });
    }

    [HttpDelete("slots/{id}")]
    public async Task<IActionResult> DeleteSlot(int id)
    {
        var (success, message) = await _adminService.DeleteSlotAsync(id);
        if (!success) return message == "Not found." ? NotFound() : BadRequest(message);
        return NoContent();
    }
}
