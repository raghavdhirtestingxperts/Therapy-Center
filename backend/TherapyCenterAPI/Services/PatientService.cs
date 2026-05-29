using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;

namespace TherapyCenterAPI.Services;

public class PatientService : IPatientService
{
    private readonly IPatientRepository _patientRepository;
    private readonly IDoctorFindingRepository _findingRepository;

    public PatientService(IPatientRepository patientRepository, IDoctorFindingRepository findingRepository)
    {
        _patientRepository = patientRepository;
        _findingRepository = findingRepository;
    }

    public async Task<Patient?> GetMyPatientAsync(int guardianId)
        => await _patientRepository.GetByGuardianIdAsync(guardianId);

    public async Task<IEnumerable<Patient>> GetMyPatientsAsync(int guardianId)
        => await _patientRepository.GetManyByGuardianIdAsync(guardianId);

    public async Task<Patient> CreatePatientAsync(CreatePatientRequest request, string role, int userId)
    {
        var patient = new Patient
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            MedicalHistory = request.MedicalHistory ?? ""
        };

        if (role == "Guardian" || role == "Patient")
        {
            patient.GuardianId = userId;
        }
        else if (request.GuardianId.HasValue)
        {
            patient.GuardianId = request.GuardianId;
        }

        return await _patientRepository.AddAsync(patient);
    }

    public async Task<IEnumerable<DoctorFinding>> GetFindingsAsync(int patientId)
        => await _findingRepository.GetByPatientIdAsync(patientId);
}
