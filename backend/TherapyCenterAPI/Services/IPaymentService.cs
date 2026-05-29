using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Services;

public interface IPaymentService
{
    Task<(bool Success, string Message, object? Result)> PayAsync(DummyPayRequest request);
    Task<IEnumerable<Payment>> GetHistoryAsync(string role, int userId);
    Task<Payment?> GetByAppointmentAsync(int appointmentId);
    Task<(bool Success, string Message, object? Result)> CreateRazorpayOrderAsync(RazorpayOrderRequest request);
    Task<(bool Success, string Message, object? Result)> VerifyRazorpayPaymentAsync(RazorpayVerifyRequest request);
}
