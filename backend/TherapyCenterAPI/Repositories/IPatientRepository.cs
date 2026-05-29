using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public interface IPatientRepository
{
    Task<Patient?> GetByGuardianIdAsync(int guardianId);
    Task<IEnumerable<Patient>> GetManyByGuardianIdAsync(int guardianId);
    Task<IEnumerable<Patient>> GetAllWithGuardianAsync();
    Task<IEnumerable<int>> GetPatientIdsByGuardianIdAsync(int guardianId);
    Task<Patient> AddAsync(Patient patient);
}
