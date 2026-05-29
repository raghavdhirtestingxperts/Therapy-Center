using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Services;

public interface IPaymentService
{
    Task<(bool Success, string Message, object? Result)> PayAsync(DummyPayRequest request);
    Task<IEnumerable<Payment>> GetHistoryAsync(string role, int userId);
    Task<Payment?> GetByAppointmentAsync(int appointmentId);
}
