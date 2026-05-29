using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public interface IDoctorFindingRepository
{
    Task<DoctorFinding?> GetByIdAsync(int id);
    Task<DoctorFinding?> GetByAppointmentIdAsync(int appointmentId);
    Task<IEnumerable<DoctorFinding>> GetByPatientIdAsync(int patientId);
    Task<DoctorFinding> AddAsync(DoctorFinding finding);
    Task SaveChangesAsync();
}
