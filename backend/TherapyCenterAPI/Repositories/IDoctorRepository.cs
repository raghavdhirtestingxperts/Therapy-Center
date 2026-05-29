using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public interface IDoctorRepository
{
    Task<IEnumerable<Doctor>> GetAllWithUserAsync();
    Task<IEnumerable<Doctor>> GetActiveWithUserAsync();
    Task<Doctor?> GetByIdWithUserAsync(int doctorId);
    Task<Doctor?> GetByUserIdAsync(int userId);
    Task<Doctor?> GetByIdAsync(int doctorId);
    Task<Doctor> AddAsync(Doctor doctor);
    Task<Doctor> UpdateAsync(Doctor doctor);
}
