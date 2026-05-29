using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Services;

public interface IPatientService
{
    Task<Patient?> GetMyPatientAsync(int guardianId);
    Task<IEnumerable<Patient>> GetMyPatientsAsync(int guardianId);
    Task<Patient> CreatePatientAsync(CreatePatientRequest request, string role, int userId);
    Task<IEnumerable<DoctorFinding>> GetFindingsAsync(int patientId);
}
