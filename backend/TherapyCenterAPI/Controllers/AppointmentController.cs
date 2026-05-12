using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AppointmentController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AppointmentController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
        {
            return Unauthorized();
        }

        if (role == "Patient" || role == "Guardian")
        {
            var patientIds = await _context.Patients
                .Where(p => p.GuardianId == userId)
                .Select(p => p.PatientId)
                .ToListAsync();
            return await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Therapy)
                .Include(a => a.Patient)
                .Where(a => patientIds.Contains(a.PatientId))
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }
        else if (role == "Doctor")
        {
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            if (doctor == null) return NotFound("Doctor record not found.");
            return await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Therapy)
                .Where(a => a.DoctorId == doctor.DoctorId)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }
        else // Admin or Receptionist
        {
            return await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Therapy)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
        }
    }

    [HttpGet("slots")]
    public async Task<ActionResult<IEnumerable<Slot>>> GetAvailableSlots(int doctorId, DateTime date)
    {
        return await _context.Slots
            .Where(s => s.DoctorId == doctorId && s.Date.Date == date.Date && !s.IsBooked)
            .OrderBy(s => s.StartTime)
            .ToListAsync();
    }

    [HttpGet("patients")]
    public async Task<ActionResult<IEnumerable<Patient>>> GetPatients()
    {
        return await _context.Patients.Include(p => p.Guardian).ToListAsync();
    }

    // Public endpoints so patients/guardians don't need Admin role
    [HttpGet("therapies")]
    public async Task<ActionResult<IEnumerable<Therapy>>> GetTherapies()
    {
        return await _context.Therapies.ToListAsync();
    }

    [HttpGet("doctors")]
    public async Task<ActionResult<IEnumerable<Doctor>>> GetDoctors()
    {
        return await _context.Doctors.Include(d => d.User).Where(d => d.User.IsActive).ToListAsync();
    }

    [HttpPost("book")]
    public async Task<ActionResult<Appointment>> BookAppointment([FromBody] BookAppointmentRequest request)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = int.Parse(userIdStr);

        var appointment = new Appointment
        {
            DoctorId = request.DoctorId,
            TherapyId = request.TherapyId,
            AppointmentDate = request.AppointmentDate,
            StartTime = TimeSpan.Parse(request.StartTime),
            EndTime = TimeSpan.Parse(request.EndTime),
            Status = "Scheduled"
        };

        if (role == "Patient" || role == "Guardian")
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.GuardianId == userId);
            if (patient == null) return BadRequest("No patient profile found. Please add a child profile first.");
            appointment.PatientId = request.PatientId > 0 ? request.PatientId : patient.PatientId;
            appointment.ReceptionistId = null;
        }
        else if (role == "Receptionist" || role == "Admin")
        {
            if (request.PatientId <= 0) return BadRequest("Patient is required for offline booking.");
            appointment.PatientId = request.PatientId;
            appointment.ReceptionistId = userId;
        }
        else
        {
            return Forbid();
        }

        _context.Appointments.Add(appointment);

        // Mark slot as booked if applicable
        var slot = await _context.Slots.FirstOrDefaultAsync(s =>
            s.DoctorId == appointment.DoctorId &&
            s.Date.Date == appointment.AppointmentDate.Date &&
            s.StartTime == appointment.StartTime &&
            !s.IsBooked);
        if (slot != null) slot.IsBooked = true;

        await _context.SaveChangesAsync();

        // Return with includes
        var result = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor).ThenInclude(d => d.User)
            .Include(a => a.Therapy)
            .FirstOrDefaultAsync(a => a.AppointmentId == appointment.AppointmentId);

        return Ok(result);
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null) return NotFound();
        if (appointment.Status == "Cancelled") return BadRequest("Already cancelled.");

        appointment.Status = "Cancelled";

        // Free the slot
        var slot = await _context.Slots.FirstOrDefaultAsync(s =>
            s.DoctorId == appointment.DoctorId &&
            s.Date.Date == appointment.AppointmentDate.Date &&
            s.StartTime == appointment.StartTime &&
            s.IsBooked);
        if (slot != null) slot.IsBooked = false;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Appointment cancelled." });
    }
}

public class BookAppointmentRequest
{
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int TherapyId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
}
