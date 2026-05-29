using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;

namespace TherapyCenterAPI.Services;

public class DoctorService : IDoctorService
{
    private readonly IDoctorFindingRepository _findingRepository;
    private readonly IAppointmentRepository _appointmentRepository;

    public DoctorService(IDoctorFindingRepository findingRepository, IAppointmentRepository appointmentRepository)
    {
        _findingRepository = findingRepository;
        _appointmentRepository = appointmentRepository;
    }

    public async Task<DoctorFinding> SubmitFindingsAsync(SubmitFindingRequest request)
    {
        var finding = new DoctorFinding
        {
            AppointmentId = request.AppointmentId,
            Observations = request.Observations,
            Recommendations = request.Recommendations,
            NextSessionDate = request.NextSessionDate
        };

        var created = await _findingRepository.AddAsync(finding);

        // Update appointment status to Completed
        var appointment = await _appointmentRepository.GetByIdAsync(request.AppointmentId);
        if (appointment != null)
        {
            appointment.Status = "Completed";
            await _appointmentRepository.SaveChangesAsync();
        }

        return created;
    }

    public async Task<DoctorFinding?> GetFindingAsync(int id)
        => await _findingRepository.GetByIdAsync(id);

    public async Task<DoctorFinding?> GetFindingByAppointmentAsync(int appointmentId)
        => await _findingRepository.GetByAppointmentIdAsync(appointmentId);
}
