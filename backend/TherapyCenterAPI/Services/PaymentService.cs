using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;

namespace TherapyCenterAPI.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IConfiguration _configuration;
    private static readonly HttpClient _httpClient = new HttpClient();

    public PaymentService(
        IPaymentRepository paymentRepository,
        IPatientRepository patientRepository,
        IAppointmentRepository appointmentRepository,
        IConfiguration configuration)
    {
        _paymentRepository = paymentRepository;
        _patientRepository = patientRepository;
        _appointmentRepository = appointmentRepository;
        _configuration = configuration;
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

    public async Task<(bool Success, string Message, object? Result)> CreateRazorpayOrderAsync(RazorpayOrderRequest request)
    {
        var appointment = await _appointmentRepository.GetByIdWithIncludesAsync(request.AppointmentId);
        if (appointment == null)
            return (false, "Appointment not found.", null);

        if (await _paymentRepository.AlreadyPaidAsync(request.AppointmentId))
            return (false, "Already paid.", null);

        var keyId = _configuration["Razorpay:KeyId"];
        var keySecret = _configuration["Razorpay:KeySecret"];

        bool isMockMode = string.IsNullOrEmpty(keyId) || string.IsNullOrEmpty(keySecret) || 
                          keyId == "YOUR_RAZORPAY_KEY_ID" || keySecret == "YOUR_RAZORPAY_KEY_SECRET";

        int amountInPaise = (int)(appointment.Therapy.Cost * 100);

        if (isMockMode)
        {
            var mockOrderId = $"order_mock_{DateTime.UtcNow.Ticks}";
            return (true, "Mock order created successfully.", new
            {
                orderId = mockOrderId,
                amount = amountInPaise,
                currency = "INR",
                key = "rzp_test_mockKeyId",
                mockMode = true,
                patientName = $"{appointment.Patient.FirstName} {appointment.Patient.LastName}",
                patientEmail = appointment.Patient.Guardian?.Email ?? "patient@example.com",
                patientPhone = appointment.Patient.Guardian?.PhoneNumber ?? "9999999999"
            });
        }

        try
        {
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://api.razorpay.com/v1/orders");
            var authString = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{keyId}:{keySecret}"));
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Basic", authString);

            var body = new
            {
                amount = amountInPaise,
                currency = "INR",
                receipt = $"receipt_apt_{appointment.AppointmentId}"
            };
            requestMessage.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(requestMessage);
            if (!response.IsSuccessStatusCode)
            {
                var errContent = await response.Content.ReadAsStringAsync();
                return (false, $"Razorpay API error: {errContent}", null);
            }

            var resContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(resContent);
            var orderId = doc.RootElement.GetProperty("id").GetString();

            return (true, "Order created successfully.", new
            {
                orderId,
                amount = amountInPaise,
                currency = "INR",
                key = keyId,
                mockMode = false,
                patientName = $"{appointment.Patient.FirstName} {appointment.Patient.LastName}",
                patientEmail = appointment.Patient.Guardian?.Email ?? "patient@example.com",
                patientPhone = appointment.Patient.Guardian?.PhoneNumber ?? "9999999999"
            });
        }
        catch (Exception ex)
        {
            return (false, $"Exception calling Razorpay: {ex.Message}", null);
        }
    }

    public async Task<(bool Success, string Message, object? Result)> VerifyRazorpayPaymentAsync(RazorpayVerifyRequest request)
    {
        var appointment = await _appointmentRepository.GetByIdWithIncludesAsync(request.AppointmentId);
        if (appointment == null)
            return (false, "Appointment not found.", null);

        if (await _paymentRepository.AlreadyPaidAsync(request.AppointmentId))
            return (false, "Already paid.", null);

        var keyId = _configuration["Razorpay:KeyId"];
        var keySecret = _configuration["Razorpay:KeySecret"];

        bool isMockMode = string.IsNullOrEmpty(keyId) || string.IsNullOrEmpty(keySecret) || 
                          keyId == "YOUR_RAZORPAY_KEY_ID" || keySecret == "YOUR_RAZORPAY_KEY_SECRET" ||
                          request.RazorpayOrderId.StartsWith("order_mock_");

        if (!isMockMode)
        {
            var payload = request.RazorpayOrderId + "|" + request.RazorpayPaymentId;
            var secretBytes = Encoding.UTF8.GetBytes(keySecret!);
            var payloadBytes = Encoding.UTF8.GetBytes(payload);
            using var hmac = new HMACSHA256(secretBytes);
            var hashBytes = hmac.ComputeHash(payloadBytes);
            var calculatedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

            if (calculatedSignature != request.RazorpaySignature)
            {
                return (false, "Signature verification failed. Invalid payment.", null);
            }
        }

        var payment = new Payment
        {
            AppointmentId = request.AppointmentId,
            Amount = appointment.Therapy.Cost,
            PaymentMethod = "Razorpay",
            TransactionId = request.RazorpayPaymentId,
            Status = "Paid",
            PaidAt = DateTime.UtcNow
        };

        var created = await _paymentRepository.AddAsync(payment);
        return (true, "Payment verified successfully!", new { message = "Payment verified successfully!", payment = created });
    }
}
