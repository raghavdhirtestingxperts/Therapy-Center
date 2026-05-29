using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public class DoctorRepository : IDoctorRepository
{
    private readonly ApplicationDbContext _context;

    public DoctorRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Doctor>> GetAllWithUserAsync()
    {
        return await _context.Doctors.Include(d => d.User).ToListAsync();
    }

    public async Task<IEnumerable<Doctor>> GetActiveWithUserAsync()
    {
        return await _context.Doctors
            .Include(d => d.User)
            .Where(d => d.User.IsActive)
            .ToListAsync();
    }

    public async Task<Doctor?> GetByIdWithUserAsync(int doctorId)
    {
        return await _context.Doctors
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.DoctorId == doctorId);
    }

    public async Task<Doctor?> GetByUserIdAsync(int userId)
    {
        return await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
    }

    public async Task<Doctor?> GetByIdAsync(int doctorId)
    {
        return await _context.Doctors.FindAsync(doctorId);
    }

    public async Task<Doctor> AddAsync(Doctor doctor)
    {
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();
        return doctor;
    }

    public async Task<Doctor> UpdateAsync(Doctor doctor)
    {
        await _context.SaveChangesAsync();
        return doctor;
    }
}
