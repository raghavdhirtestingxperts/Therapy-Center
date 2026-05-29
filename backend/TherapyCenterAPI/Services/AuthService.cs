using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;

namespace TherapyCenterAPI.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;

    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User?> AuthenticateAsync(string email, string password)
    {
        var user = await _userRepository.GetByEmailAndPasswordAsync(email, password);
        if (user == null || !user.IsActive) return null;
        return user;
    }

    public async Task<(bool Success, string Message)> RegisterAsync(User user)
    {
        if (await _userRepository.EmailExistsAsync(user.Email))
            return (false, "Email already exists.");

        await _userRepository.AddAsync(user);
        return (true, "User registered successfully.");
    }
}
