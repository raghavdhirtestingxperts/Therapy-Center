namespace TherapyCenterAPI.Services;

public interface IOtpService
{
    Task<string> GenerateOtpAsync(string email);
    Task<bool> VerifyOtpAsync(string mfaSessionId, string otp);
    Task<string?> GetEmailForSessionAsync(string mfaSessionId);
    Task ClearSessionAsync(string mfaSessionId);
}
