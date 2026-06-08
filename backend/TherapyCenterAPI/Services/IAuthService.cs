using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Services;

public interface IAuthService
{
    Task<User?> AuthenticateAsync(string email, string password);
    Task<(bool Success, string Message)> RegisterAsync(User user);
    Task<(bool Success, object? Result, int StatusCode)> LoginAsync(LoginRequest request, string? ip);
    Task<(bool Success, string Message)> ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<IEnumerable<object>> GetLoginHistoryAsync(int userId, int count = 10);

}
