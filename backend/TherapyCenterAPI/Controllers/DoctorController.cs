using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapyCenterAPI.Models;
using TherapyCenterAPI.Services;

namespace TherapyCenterAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Doctor,Admin")]
public class DoctorController : ControllerBase
{
    private readonly IDoctorService _doctorService;

    public DoctorController(IDoctorService doctorService)
    {
        _doctorService = doctorService;
    }

    [HttpPost("findings")]
    public async Task<IActionResult> SubmitFindings([FromBody] SubmitFindingRequest request)
    {
        var finding = await _doctorService.SubmitFindingsAsync(request);
        return Ok(finding);
    }

    [HttpGet("findings/{id}")]
    public async Task<IActionResult> GetFinding(int id)
    {
        var finding = await _doctorService.GetFindingAsync(id);
        if (finding == null) return NotFound();
        return Ok(finding);
    }

    [HttpGet("findings/appointment/{appointmentId}")]
    public async Task<IActionResult> GetFindingByAppointment(int appointmentId)
    {
        var finding = await _doctorService.GetFindingByAppointmentAsync(appointmentId);
        if (finding == null) return NotFound();
        return Ok(finding);
    }
}
