using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- Therapy Management ---

        [HttpGet("therapies")]
        public async Task<ActionResult<IEnumerable<Therapy>>> GetTherapies()
        {
            return await _context.Therapies.ToListAsync();
        }

        [HttpPost("therapies")]
        public async Task<ActionResult<Therapy>> CreateTherapy(Therapy therapy)
        {
            _context.Therapies.Add(therapy);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTherapies), new { id = therapy.TherapyId }, therapy);
        }

        [HttpPut("therapies/{id}")]
        public async Task<IActionResult> UpdateTherapy(int id, Therapy therapy)
        {
            if (id != therapy.TherapyId) return BadRequest();
            _context.Entry(therapy).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- Staff Management ---

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers(string? role)
        {
            var query = _context.Users.AsQueryable();
            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(u => u.Role == role);
            }
            return await query.ToListAsync();
        }

        [HttpPost("doctors")]
        public async Task<ActionResult<Doctor>> CreateDoctor(Doctor doctor)
        {
            // Note: In a real app, you'd probably check if the User exists and has the 'Doctor' role.
            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUsers), new { id = doctor.DoctorId }, doctor);
        }

        [HttpGet("doctors")]
        public async Task<ActionResult<IEnumerable<Doctor>>> GetDoctors()
        {
            return await _context.Doctors.Include(d => d.User).ToListAsync();
        }
    }
}
