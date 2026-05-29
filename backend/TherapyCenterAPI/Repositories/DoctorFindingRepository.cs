using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public class DoctorFindingRepository : IDoctorFindingRepository
{
    private readonly ApplicationDbContext _context;

    public DoctorFindingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DoctorFinding?> GetByIdAsync(int id)
    {
        return await _context.DoctorFindings
            .Include(f => f.Appointment).ThenInclude(a => a.Therapy)
            .FirstOrDefaultAsync(f => f.FindingId == id);
    }

    public async Task<DoctorFinding?> GetByAppointmentIdAsync(int appointmentId)
    {
        return await _context.DoctorFindings
            .Include(f => f.Appointment).ThenInclude(a => a.Therapy)
            .FirstOrDefaultAsync(f => f.AppointmentId == appointmentId);
    }

    public async Task<IEnumerable<DoctorFinding>> GetByPatientIdAsync(int patientId)
    {
        return await _context.DoctorFindings
            .Include(f => f.Appointment).ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
            .Include(f => f.Appointment).ThenInclude(a => a.Therapy)
            .Where(f => f.Appointment.PatientId == patientId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<DoctorFinding> AddAsync(DoctorFinding finding)
    {
        _context.DoctorFindings.Add(finding);
        await _context.SaveChangesAsync();
        return finding;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
