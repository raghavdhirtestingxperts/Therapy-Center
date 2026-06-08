using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;

namespace TherapyCenterAPI.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    // Lockout policy
    private const int MaxFailedAttempts = 5;
    private const int LockoutMinutes = 15;

    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
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

    public async Task<(bool Success, object? Result, int StatusCode)> LoginAsync(LoginRequest request, string? ip)
    {
        // Find user by email
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
        {
            await _userRepository.AddLoginHistoryAsync(new LoginHistory
            {
                UserId = null,
                Email = request.Email,
                IsSuccess = false,
                IpAddress = ip
            });
            return (false, "Invalid credentials or inactive account.", 401);
        }

        // Check if account is locked
        if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > DateTime.UtcNow)
        {
            var lockoutUtc = DateTime.SpecifyKind(user.LockoutUntil.Value, DateTimeKind.Utc);
            return (false, new
            {
                message = "Account locked due to too many failed attempts.",
                lockoutUntil = lockoutUtc.ToString("o")
            }, 423);
        }

        // Verify password (supports BCrypt and legacy plain-text)
        bool passwordValid = VerifyPassword(request.Password, user.PasswordHash);

        if (!passwordValid)
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= MaxFailedAttempts)
                user.LockoutUntil = DateTime.UtcNow.AddMinutes(LockoutMinutes);

            await _userRepository.UpdateAsync(user);

            await _userRepository.AddLoginHistoryAsync(new LoginHistory
            {
                UserId = user.UserId,
                Email = user.Email,
                IsSuccess = false,
                IpAddress = ip
            });

            if (user.LockoutUntil.HasValue)
            {
                var lockoutUtc = DateTime.SpecifyKind(user.LockoutUntil.Value, DateTimeKind.Utc);
                return (false, new
                {
                    message = $"Account locked after {MaxFailedAttempts} failed attempts.",
                    lockoutUntil = lockoutUtc.ToString("o")
                }, 423);
            }

            int attemptsLeft = MaxFailedAttempts - user.FailedLoginAttempts;
            return (false, $"Invalid credentials. {attemptsLeft} attempt(s) remaining before lockout.", 401);
        }

        // Success — reset lockout and upgrade plain-text to BCrypt if needed
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;

        if (!user.PasswordHash.StartsWith("$2"))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        await _userRepository.UpdateAsync(user);

        await _userRepository.AddLoginHistoryAsync(new LoginHistory
        {
            UserId = user.UserId,
            Email = user.Email,
            IsSuccess = true,
            IpAddress = ip
        });

        var token = GenerateJwtToken(user);
        return (true, new { token, role = user.Role, userId = user.UserId, firstName = user.FirstName, lastName = user.LastName }, 200);
    }

    public async Task<(bool Success, string Message)> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
            return (false, "User not found.");

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            return (false, "New password must be at least 6 characters.");

        if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
            return (false, "Current password is incorrect.");

        if (VerifyPassword(request.NewPassword, user.PasswordHash))
            return (false, "New password must be different from your current password.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);

        return (true, "Password changed successfully.");
    }

    public async Task<IEnumerable<object>> GetLoginHistoryAsync(int userId, int count = 10)
    {
        var history = await _userRepository.GetLoginHistoryAsync(userId, count);
        return history.Select(h => new
        {
            h.Id,
            h.IsSuccess,
            h.IpAddress,
            AttemptedAt = h.AttemptedAt.ToString("yyyy-MM-dd HH:mm:ss") + " UTC"
        });
    }


    // Verify password against stored hash (BCrypt or legacy plain-text)
    private static bool VerifyPassword(string inputPassword, string storedHash)
    {
        if (storedHash.StartsWith("$2"))
            return BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
        return inputPassword == storedHash;
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8), // Fixed: was DateTime.Now
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
