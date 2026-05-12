using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Controllers;

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

    // ─── Dashboard Stats ───
    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = new
        {
            totalPatients = await _context.Patients.CountAsync(),
            totalDoctors = await _context.Doctors.CountAsync(),
            totalAppointments = await _context.Appointments.CountAsync(),
            todaysAppointments = await _context.Appointments.CountAsync(a => a.AppointmentDate.Date == DateTime.UtcNow.Date),
            scheduledAppointments = await _context.Appointments.CountAsync(a => a.Status == "Scheduled"),
            completedAppointments = await _context.Appointments.CountAsync(a => a.Status == "Completed"),
            totalRevenue = await _context.Payments.Where(p => p.Status == "Paid").SumAsync(p => p.Amount),
            totalTherapies = await _context.Therapies.CountAsync()
        };
        return Ok(stats);
    }

    // ─── Therapies CRUD ───
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
        var existing = await _context.Therapies.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Name = therapy.Name;
        existing.Description = therapy.Description;
        existing.DurationMinutes = therapy.DurationMinutes;
        existing.Cost = therapy.Cost;
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("therapies/{id}")]
    public async Task<IActionResult> DeleteTherapy(int id)
    {
        var therapy = await _context.Therapies.FindAsync(id);
        if (therapy == null) return NotFound();
        _context.Therapies.Remove(therapy);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ─── Users / Staff CRUD ───
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

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateStaffRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Email already exists.");

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = request.Password,
            Role = request.Role,
            PhoneNumber = request.PhoneNumber
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(user);
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] CreateStaffRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        if (!string.IsNullOrEmpty(request.Password)) user.PasswordHash = request.Password;
        user.PhoneNumber = request.PhoneNumber;
        await _context.SaveChangesAsync();
        return Ok(user);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.IsActive = !user.IsActive; // Toggle active status
        await _context.SaveChangesAsync();
        return Ok(user);
    }

    // ─── Doctors CRUD ───
    [HttpGet("doctors")]
    public async Task<ActionResult<IEnumerable<Doctor>>> GetDoctors()
    {
        return await _context.Doctors.Include(d => d.User).ToListAsync();
    }

    [HttpPost("doctors")]
    public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Email already exists.");

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = request.Password,
            Role = "Doctor"
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var doctor = new Doctor
        {
            UserId = user.UserId,
            Specialization = request.Specialization,
            Bio = request.Bio ?? "",
            AvailableDays = request.AvailableDays,
            StartTime = TimeSpan.Parse(request.StartTime),
            EndTime = TimeSpan.Parse(request.EndTime)
        };
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();

        doctor.User = user;
        return Ok(doctor);
    }

    [HttpPut("doctors/{id}")]
    public async Task<IActionResult> UpdateDoctor(int id, [FromBody] CreateDoctorRequest request)
    {
        var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.DoctorId == id);
        if (doctor == null) return NotFound();

        doctor.User.FirstName = request.FirstName;
        doctor.User.LastName = request.LastName;
        doctor.User.Email = request.Email;
        if (!string.IsNullOrEmpty(request.Password)) doctor.User.PasswordHash = request.Password;
        doctor.Specialization = request.Specialization;
        doctor.Bio = request.Bio ?? "";
        doctor.AvailableDays = request.AvailableDays;
        doctor.StartTime = TimeSpan.Parse(request.StartTime);
        doctor.EndTime = TimeSpan.Parse(request.EndTime);

        await _context.SaveChangesAsync();
        return Ok(doctor);
    }

    [HttpDelete("doctors/{id}")]
    public async Task<IActionResult> DeleteDoctor(int id)
    {
        var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.DoctorId == id);
        if (doctor == null) return NotFound();
        doctor.User.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ─── Slots Management ───
    [HttpGet("slots")]
    public async Task<IActionResult> GetSlots(int? doctorId, DateTime? date)
    {
        var query = _context.Slots.Include(s => s.Doctor).ThenInclude(d => d.User).AsQueryable();
        if (doctorId.HasValue) query = query.Where(s => s.DoctorId == doctorId.Value);
        if (date.HasValue) query = query.Where(s => s.Date.Date == date.Value.Date);
        return Ok(await query.OrderBy(s => s.Date).ThenBy(s => s.StartTime).ToListAsync());
    }

    [HttpPost("slots/generate")]
    public async Task<IActionResult> GenerateSlots([FromBody] GenerateSlotsRequest request)
    {
        var doctor = await _context.Doctors.FindAsync(request.DoctorId);
        if (doctor == null) return NotFound("Doctor not found.");

        var duration = request.SlotDurationMinutes > 0 ? request.SlotDurationMinutes : 45;
        var currentTime = doctor.StartTime;
        var slotsCreated = 0;

        while (currentTime.Add(TimeSpan.FromMinutes(duration)) <= doctor.EndTime)
        {
            var endTime = currentTime.Add(TimeSpan.FromMinutes(duration));
            var exists = await _context.Slots.AnyAsync(s =>
                s.DoctorId == request.DoctorId &&
                s.Date.Date == request.Date.Date &&
                s.StartTime == currentTime);

            if (!exists)
            {
                _context.Slots.Add(new Slot
                {
                    DoctorId = request.DoctorId,
                    Date = request.Date.Date,
                    StartTime = currentTime,
                    EndTime = endTime,
                    IsBooked = false
                });
                slotsCreated++;
            }
            currentTime = endTime;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"{slotsCreated} slots created.", slotsCreated });
    }

    [HttpDelete("slots/{id}")]
    public async Task<IActionResult> DeleteSlot(int id)
    {
        var slot = await _context.Slots.FindAsync(id);
        if (slot == null) return NotFound();
        if (slot.IsBooked) return BadRequest("Cannot delete a booked slot.");
        _context.Slots.Remove(slot);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateStaffRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Receptionist";
    public string? PhoneNumber { get; set; }
}

public class CreateDoctorRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string AvailableDays { get; set; } = string.Empty;
    public string StartTime { get; set; } = "09:00";
    public string EndTime { get; set; } = "17:00";
}

public class GenerateSlotsRequest
{
    public int DoctorId { get; set; }
    public DateTime Date { get; set; }
    public int SlotDurationMinutes { get; set; } = 45;
}
