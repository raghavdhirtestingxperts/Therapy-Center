using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Services;

public interface IDoctorService
{
    Task<DoctorFinding> SubmitFindingsAsync(SubmitFindingRequest request);
    Task<DoctorFinding?> GetFindingAsync(int id);
    Task<DoctorFinding?> GetFindingByAppointmentAsync(int appointmentId);
}
