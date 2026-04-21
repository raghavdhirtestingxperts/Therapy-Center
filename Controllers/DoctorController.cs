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
    [Authorize(Roles = "Doctor,Admin")]
    public class DoctorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DoctorController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("appointments")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetDoctorAppointments()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            if (doctor == null) return NotFound("Doctor profile not found.");

            return await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Therapy)
                .Where(a => a.DoctorId == doctor.DoctorId)
                .ToListAsync();
        }

        [HttpPost("findings")]
        public async Task<ActionResult<DoctorFinding>> SubmitFindings(DoctorFinding finding)
        {
            _context.DoctorFindings.Add(finding);
            
            // Update appointment status to completed
            var appointment = await _context.Appointments.FindAsync(finding.AppointmentId);
            if (appointment != null) appointment.Status = "Completed";

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFinding), new { id = finding.FindingId }, finding);
        }

        [HttpGet("findings/{id}")]
        public async Task<ActionResult<DoctorFinding>> GetFinding(int id)
        {
            var finding = await _context.DoctorFindings
                .Include(f => f.Appointment)
                .FirstOrDefaultAsync(f => f.FindingId == id);

            if (finding == null) return NotFound();
            return finding;
        }

        [HttpGet("availability/{doctorId}")]
        public async Task<ActionResult<IEnumerable<Slot>>> GetAvailability(int doctorId)
        {
            return await _context.Slots
                .Where(s => s.DoctorId == doctorId && s.Date >= DateTime.Today && !s.IsBooked)
                .ToListAsync();
        }
    }
}
