using Microsoft.Extensions.Caching.Memory;

namespace TherapyCenterAPI.Services;

public class OtpService : IOtpService
{
    private readonly IMemoryCache _cache;
    private readonly IEmailService _emailService;

    public OtpService(IMemoryCache cache, IEmailService emailService)
    {
        _cache = cache;
        _emailService = emailService;
    }

    public async Task<string> GenerateOtpAsync(string email)
    {
        // 1. Generate 6-digit numeric OTP
        var random = new Random();
        var otpCode = random.Next(100000, 999999).ToString();

        // 2. Generate a unique session ID for the MFA step
        var mfaSessionId = Guid.NewGuid().ToString();

        var sessionState = new MfaSessionState
        {
            Email = email,
            OtpCode = otpCode,
            Expiry = DateTime.UtcNow.AddMinutes(5)
        };

        // Cache MFA session in memory for 5 minutes
        _cache.Set($"mfa:{mfaSessionId}", sessionState, TimeSpan.FromMinutes(5));

        // 3. Dispatch the OTP via email service
        var subject = "Verification Code - Special Kids Therapy Center";
        var body = $@"
            <h3>Security Verification</h3>
            <p>Your Multi-Factor Authentication (MFA) verification code is: <strong>{otpCode}</strong></p>
            <p>This code will expire in 5 minutes. If you did not initiate this login request, please ignore this email.</p>";

        await _emailService.SendEmailAsync(email, subject, body);

        return mfaSessionId;
    }

    public async Task<bool> VerifyOtpAsync(string mfaSessionId, string otp)
    {
        if (_cache.TryGetValue($"mfa:{mfaSessionId}", out MfaSessionState? sessionState) && sessionState != null)
        {
            if (sessionState.Expiry > DateTime.UtcNow && sessionState.OtpCode == otp)
            {
                return true;
            }
        }
        return false;
    }

    public async Task<string?> GetEmailForSessionAsync(string mfaSessionId)
    {
        if (_cache.TryGetValue($"mfa:{mfaSessionId}", out MfaSessionState? sessionState) && sessionState != null)
        {
            return sessionState.Email;
        }
        return null;
    }

    public async Task ClearSessionAsync(string mfaSessionId)
    {
        _cache.Remove($"mfa:{mfaSessionId}");
        await Task.CompletedTask;
    }
}

public class MfaSessionState
{
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public DateTime Expiry { get; set; }
}
