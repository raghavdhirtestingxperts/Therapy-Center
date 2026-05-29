using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Services;

public interface IAppointmentService
{
    Task<IEnumerable<Appointment>> GetAppointmentsAsync(string role, int userId);
    Task<IEnumerable<Slot>> GetAvailableSlotsAsync(int doctorId, DateTime date);
    Task<IEnumerable<Patient>> GetPatientsAsync();
    Task<IEnumerable<Therapy>> GetTherapiesAsync();
    Task<IEnumerable<Doctor>> GetActiveDoctorsAsync();
    Task<(bool Success, string Message, Appointment? Appointment)> BookAppointmentAsync(BookAppointmentRequest request, string role, int userId);
    Task<(bool Success, string Message)> CancelAppointmentAsync(int id);
}
