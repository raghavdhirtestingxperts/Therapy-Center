using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public class PatientRepository : IPatientRepository
{
    private readonly ApplicationDbContext _context;

    public PatientRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Patient?> GetByGuardianIdAsync(int guardianId)
    {
        return await _context.Patients.FirstOrDefaultAsync(p => p.GuardianId == guardianId);
    }

    public async Task<IEnumerable<Patient>> GetManyByGuardianIdAsync(int guardianId)
    {
        return await _context.Patients
            .Where(p => p.GuardianId == guardianId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Patient>> GetAllWithGuardianAsync()
    {
        return await _context.Patients.Include(p => p.Guardian).ToListAsync();
    }

    public async Task<IEnumerable<int>> GetPatientIdsByGuardianIdAsync(int guardianId)
    {
        return await _context.Patients
            .Where(p => p.GuardianId == guardianId)
            .Select(p => p.PatientId)
            .ToListAsync();
    }

    public async Task<Patient> AddAsync(Patient patient)
    {
        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();
        return patient;
    }
}
