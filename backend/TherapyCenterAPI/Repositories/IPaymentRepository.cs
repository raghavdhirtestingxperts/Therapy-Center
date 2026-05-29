using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public interface IPaymentRepository
{
    Task<IEnumerable<Payment>> GetAllWithIncludesAsync();
    Task<IEnumerable<Payment>> GetForPatientAsync(IEnumerable<int> patientIds);
    Task<Payment?> GetByAppointmentIdAsync(int appointmentId);
    Task<bool> AlreadyPaidAsync(int appointmentId);
    Task<Payment> AddAsync(Payment payment);
}
