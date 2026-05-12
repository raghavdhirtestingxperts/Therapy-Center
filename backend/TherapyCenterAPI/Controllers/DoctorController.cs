using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Doctor,Admin")]
public class DoctorController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DoctorController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("findings")]
    public async Task<ActionResult<DoctorFinding>> SubmitFindings([FromBody] SubmitFindingRequest request)
    {
        var finding = new DoctorFinding
        {
            AppointmentId = request.AppointmentId,
            Observations = request.Observations,
            Recommendations = request.Recommendations,
            NextSessionDate = request.NextSessionDate
        };

        _context.DoctorFindings.Add(finding);

        // Update appointment status to completed
        var appointment = await _context.Appointments.FindAsync(finding.AppointmentId);
        if (appointment != null) appointment.Status = "Completed";

        await _context.SaveChangesAsync();
        return Ok(finding);
    }

    [HttpGet("findings/{id}")]
    public async Task<ActionResult<DoctorFinding>> GetFinding(int id)
    {
        var finding = await _context.DoctorFindings
            .Include(f => f.Appointment).ThenInclude(a => a.Therapy)
            .FirstOrDefaultAsync(f => f.FindingId == id);
        if (finding == null) return NotFound();
        return finding;
    }

    [HttpGet("findings/appointment/{appointmentId}")]
    public async Task<ActionResult<DoctorFinding>> GetFindingByAppointment(int appointmentId)
    {
        var finding = await _context.DoctorFindings
            .Include(f => f.Appointment).ThenInclude(a => a.Therapy)
            .FirstOrDefaultAsync(f => f.AppointmentId == appointmentId);
        if (finding == null) return NotFound();
        return finding;
    }
}

public class SubmitFindingRequest
{
    public int AppointmentId { get; set; }
    public string Observations { get; set; } = string.Empty;
    public string Recommendations { get; set; } = string.Empty;
    public DateTime? NextSessionDate { get; set; }
}
