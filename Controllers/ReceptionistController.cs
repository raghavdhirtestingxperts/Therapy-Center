using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Receptionist,Admin")]
    public class ReceptionistController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReceptionistController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("patients/search")]
        public async Task<ActionResult<IEnumerable<Patient>>> SearchPatients(string name)
        {
            return await _context.Patients
                .Where(p => p.FirstName.Contains(name) || p.LastName.Contains(name))
                .ToListAsync();
        }

        [HttpPost("appointments/offline")]
        public async Task<ActionResult<Appointment>> BookOfflineAppointment(Appointment appointment)
        {
            appointment.Status = "Scheduled";
            appointment.CreatedAt = DateTime.UtcNow;
            
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetAppointment), new { id = appointment.AppointmentId }, appointment);
        }

        [HttpGet("appointments/{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.Therapy)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null) return NotFound();
            return appointment;
        }
    }
}
