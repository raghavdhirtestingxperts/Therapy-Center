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
public class PatientController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PatientController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("my-patient")]
    public async Task<ActionResult<Patient>> GetMyPatient()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.GuardianId == int.Parse(userIdStr));
        if (patient == null) return NotFound();
        return patient;
    }

    [HttpGet("my-patients")]
    public async Task<ActionResult<IEnumerable<Patient>>> GetMyPatients()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        return await _context.Patients
            .Where(p => p.GuardianId == int.Parse(userIdStr))
            .ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> CreatePatient([FromBody] CreatePatientRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var patient = new Patient
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            MedicalHistory = request.MedicalHistory ?? ""
        };

        // If guardian is adding their child, link it
        if (role == "Guardian" || role == "Patient")
        {
            patient.GuardianId = int.Parse(userIdStr!);
        }
        else if (request.GuardianId.HasValue)
        {
            patient.GuardianId = request.GuardianId;
        }

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();
        return Ok(patient);
    }

    [HttpGet("{patientId}/findings")]
    public async Task<ActionResult<IEnumerable<DoctorFinding>>> GetFindings(int patientId)
    {
        return await _context.DoctorFindings
            .Include(f => f.Appointment).ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
            .Include(f => f.Appointment).ThenInclude(a => a.Therapy)
            .Where(f => f.Appointment.PatientId == patientId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }
}

public class CreatePatientRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? MedicalHistory { get; set; }
    public int? GuardianId { get; set; }
}
