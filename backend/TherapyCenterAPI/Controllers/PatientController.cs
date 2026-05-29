using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapyCenterAPI.Models;
using TherapyCenterAPI.Services;

namespace TherapyCenterAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PatientController : ControllerBase
{
    private readonly IPatientService _patientService;

    public PatientController(IPatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet("my-patient")]
    public async Task<IActionResult> GetMyPatient()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var patient = await _patientService.GetMyPatientAsync(userId);
        if (patient == null) return NotFound();
        return Ok(patient);
    }

    [HttpGet("my-patients")]
    public async Task<IActionResult> GetMyPatients()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        return Ok(await _patientService.GetMyPatientsAsync(userId));
    }

    [HttpPost]
    public async Task<IActionResult> CreatePatient([FromBody] CreatePatientRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var patient = await _patientService.CreatePatientAsync(request, role, userId);
        return Ok(patient);
    }

    [HttpGet("{patientId}/findings")]
    public async Task<IActionResult> GetFindings(int patientId)
        => Ok(await _patientService.GetFindingsAsync(patientId));
}
