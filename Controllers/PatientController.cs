using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Patient,Guardian,Admin")]
    public class PatientController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PatientController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("appointments")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetMyAppointments()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            // Assuming PatientId is linked to UserId for Patients
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.GuardianId == userId);
            if (patient == null) return NotFound("Patient record not found");

            return await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Therapy)
                .Where(a => a.PatientId == patient.PatientId)
                .ToListAsync();
        }

        [HttpGet("findings")]
        public async Task<ActionResult<IEnumerable<DoctorFinding>>> GetMyFindings()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.GuardianId == userId);
            if (patient == null) return NotFound("Patient record not found");

            return await _context.DoctorFindings
                .Include(f => f.Appointment)
                .ThenInclude(a => a.Doctor)
                .Where(f => f.Appointment.PatientId == patient.PatientId)
                .ToListAsync();
        }

        [HttpPost("book")]
        public async Task<ActionResult<Appointment>> BookOnline(Appointment appointment)
        {
            appointment.Status = "Scheduled";
            appointment.CreatedAt = DateTime.UtcNow;

            // Mark slot as booked
            var slot = await _context.Slots.FirstOrDefaultAsync(s => 
                s.DoctorId == appointment.DoctorId && 
                s.Date == appointment.AppointmentDate && 
                s.StartTime == appointment.StartTime);
            
            if (slot != null) slot.IsBooked = true;

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetMyAppointments), new { }, appointment);
        }
    }
}
