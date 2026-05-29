using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Services;

public interface IAuthService
{
    Task<User?> AuthenticateAsync(string email, string password);
    Task<(bool Success, string Message)> RegisterAsync(User user);
}
