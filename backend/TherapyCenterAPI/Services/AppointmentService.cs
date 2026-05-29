using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;

namespace TherapyCenterAPI.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly ISlotRepository _slotRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly ITherapyRepository _therapyRepository;
    private readonly IDoctorRepository _doctorRepository;

    public AppointmentService(
        IAppointmentRepository appointmentRepository,
        ISlotRepository slotRepository,
        IPatientRepository patientRepository,
        ITherapyRepository therapyRepository,
        IDoctorRepository doctorRepository)
    {
        _appointmentRepository = appointmentRepository;
        _slotRepository = slotRepository;
        _patientRepository = patientRepository;
        _therapyRepository = therapyRepository;
        _doctorRepository = doctorRepository;
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsAsync(string role, int userId)
    {
        if (role == "Patient" || role == "Guardian")
        {
            var patientIds = await _patientRepository.GetPatientIdsByGuardianIdAsync(userId);
            return await _appointmentRepository.GetForPatientAsync(patientIds);
        }
        else if (role == "Doctor")
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId);
            if (doctor == null) return Enumerable.Empty<Appointment>();
            return await _appointmentRepository.GetForDoctorAsync(doctor.DoctorId);
        }
        else // Admin or Receptionist
        {
            return await _appointmentRepository.GetAllForAdminAsync();
        }
    }

    public async Task<IEnumerable<Slot>> GetAvailableSlotsAsync(int doctorId, DateTime date)
        => await _slotRepository.GetAvailableSlotsAsync(doctorId, date);

    public async Task<IEnumerable<Patient>> GetPatientsAsync()
        => await _patientRepository.GetAllWithGuardianAsync();

    public async Task<IEnumerable<Therapy>> GetTherapiesAsync()
        => await _therapyRepository.GetAllAsync();

    public async Task<IEnumerable<Doctor>> GetActiveDoctorsAsync()
        => await _doctorRepository.GetActiveWithUserAsync();

    public async Task<(bool Success, string Message, Appointment? Appointment)> BookAppointmentAsync(
        BookAppointmentRequest request, string role, int userId)
    {
        var appointment = new Appointment
        {
            DoctorId = request.DoctorId,
            TherapyId = request.TherapyId,
            AppointmentDate = request.AppointmentDate,
            StartTime = TimeSpan.Parse(request.StartTime),
            EndTime = TimeSpan.Parse(request.EndTime),
            Status = "Scheduled"
        };

        if (role == "Patient" || role == "Guardian")
        {
            var patient = await _patientRepository.GetByGuardianIdAsync(userId);
            if (patient == null)
                return (false, "No patient profile found. Please add a child profile first.", null);

            appointment.PatientId = request.PatientId > 0 ? request.PatientId : patient.PatientId;
            appointment.ReceptionistId = null;
        }
        else if (role == "Receptionist" || role == "Admin")
        {
            if (request.PatientId <= 0)
                return (false, "Patient is required for offline booking.", null);

            appointment.PatientId = request.PatientId;
            appointment.ReceptionistId = userId;
        }
        else
        {
            return (false, "Forbidden.", null);
        }

        var created = await _appointmentRepository.AddAsync(appointment);

        // Mark slot as booked if applicable
        var slot = await _slotRepository.FindAvailableSlotAsync(
            appointment.DoctorId, appointment.AppointmentDate, appointment.StartTime);
        if (slot != null)
        {
            slot.IsBooked = true;
            await _slotRepository.SaveChangesAsync();
        }

        var result = await _appointmentRepository.GetByIdWithIncludesAsync(created.AppointmentId);
        return (true, "Booked.", result);
    }

    public async Task<(bool Success, string Message)> CancelAppointmentAsync(int id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null) return (false, "Not found.");
        if (appointment.Status == "Cancelled") return (false, "Already cancelled.");

        appointment.Status = "Cancelled";

        // Free the slot
        var slot = await _slotRepository.FindBookedSlotAsync(
            appointment.DoctorId, appointment.AppointmentDate, appointment.StartTime);
        if (slot != null)
            slot.IsBooked = false;

        await _appointmentRepository.SaveChangesAsync();
        return (true, "Appointment cancelled.");
    }
}
