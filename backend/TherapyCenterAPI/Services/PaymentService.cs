using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;

namespace TherapyCenterAPI.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IAppointmentRepository _appointmentRepository;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IPatientRepository patientRepository,
        IAppointmentRepository appointmentRepository)
    {
        _paymentRepository = paymentRepository;
        _patientRepository = patientRepository;
        _appointmentRepository = appointmentRepository;
    }

    public async Task<(bool Success, string Message, object? Result)> PayAsync(DummyPayRequest request)
    {
        var appointment = await _appointmentRepository.GetByIdWithIncludesAsync(request.AppointmentId);
        if (appointment == null)
            return (false, "Appointment not found.", null);

        if (await _paymentRepository.AlreadyPaidAsync(request.AppointmentId))
            return (false, "Already paid.", null);

        var payment = new Payment
        {
            AppointmentId = request.AppointmentId,
            Amount = appointment.Therapy.Cost,
            PaymentMethod = request.PaymentMethod ?? "Online",
            TransactionId = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{request.AppointmentId}",
            Status = "Paid",
            PaidAt = DateTime.UtcNow
        };

        var created = await _paymentRepository.AddAsync(payment);
        return (true, "Payment successful!", new { message = "Payment successful!", payment = created });
    }

    public async Task<IEnumerable<Payment>> GetHistoryAsync(string role, int userId)
    {
        if (role == "Guardian" || role == "Patient")
        {
            var patientIds = await _patientRepository.GetPatientIdsByGuardianIdAsync(userId);
            return await _paymentRepository.GetForPatientAsync(patientIds);
        }
        return await _paymentRepository.GetAllWithIncludesAsync();
    }

    public async Task<Payment?> GetByAppointmentAsync(int appointmentId)
        => await _paymentRepository.GetByAppointmentIdAsync(appointmentId);
}
