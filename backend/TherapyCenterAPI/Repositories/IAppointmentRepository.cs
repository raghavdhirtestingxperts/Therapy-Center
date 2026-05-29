using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public interface IAppointmentRepository
{
    Task<IEnumerable<Appointment>> GetAllForAdminAsync();
    Task<IEnumerable<Appointment>> GetForPatientAsync(IEnumerable<int> patientIds);
    Task<IEnumerable<Appointment>> GetForDoctorAsync(int doctorId);
    Task<Appointment?> GetByIdAsync(int id);
    Task<Appointment?> GetByIdWithIncludesAsync(int id);
    Task<Appointment> AddAsync(Appointment appointment);
    Task SaveChangesAsync();
}
