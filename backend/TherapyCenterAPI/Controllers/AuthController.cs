using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;
using TherapyCenterAPI.Services;

namespace TherapyCenterAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly IUserRepository _userRepository;

    // ─── Lockout policy ───────────────────────────────────────────────────────
    private const int MaxFailedAttempts = 5;
    private const int LockoutMinutes = 15;

    public AuthController(IAuthService authService, IConfiguration configuration, IUserRepository userRepository)
    {
        _authService = authService;
        _configuration = configuration;
        _userRepository = userRepository;
    }

    // ─── POST /api/auth/login ─────────────────────────────────────────────────
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        // 1. Find user by email
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
        {
            // Record failed attempt (no userId since email not found)
            await _userRepository.AddLoginHistoryAsync(new LoginHistory
            {
                UserId = null,
                Email = request.Email,
                IsSuccess = false,
                IpAddress = ip
            });
            return Unauthorized("Invalid credentials or inactive account.");
        }

        // 2. Check if account is currently locked
        if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > DateTime.UtcNow)
        {
            var remaining = (int)Math.Ceiling((user.LockoutUntil.Value - DateTime.UtcNow).TotalMinutes);
            return StatusCode(423, $"Account locked due to too many failed attempts. Try again in {remaining} minute(s).");
        }

        // 3. Verify password (supports both legacy plain-text and BCrypt hashes)
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
                return StatusCode(423, $"Account locked after {MaxFailedAttempts} failed attempts. Try again in {LockoutMinutes} minute(s).");

            int attemptsLeft = MaxFailedAttempts - user.FailedLoginAttempts;
            return Unauthorized($"Invalid credentials. {attemptsLeft} attempt(s) remaining before lockout.");
        }

        // 4. Success — reset lockout counters and upgrade plain-text → BCrypt if needed
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;

        // Upgrade legacy plain-text password to BCrypt on first successful login
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
        return Ok(new { token, role = user.Role, userId = user.UserId, firstName = user.FirstName, lastName = user.LastName });
    }

    // ─── GET /api/auth/profile ────────────────────────────────────────────────
    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized("User is not logged in or invalid token.");

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
            return NotFound("User not found or inactive.");

        return Ok(new { userId = user.UserId, firstName = user.FirstName, lastName = user.LastName, role = user.Role });
    }

    // ─── POST /api/auth/register ──────────────────────────────────────────────
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
        // Hash the password before storing
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        var (success, message) = await _authService.RegisterAsync(user);
        if (!success) return BadRequest(message);
        return Ok(message);
    }

    // ─── POST /api/auth/change-password ───────────────────────────────────────
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized("Invalid token.");

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
            return NotFound("User not found.");

        // Validate minimum new password length
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            return BadRequest("New password must be at least 6 characters.");

        // Verify current password
        if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
            return BadRequest("Current password is incorrect.");

        // Update to BCrypt hash
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);

        return Ok("Password changed successfully.");
    }

    // ─── GET /api/auth/login-history ─────────────────────────────────────────
    [Authorize]
    [HttpGet("login-history")]
    public async Task<IActionResult> GetLoginHistory()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized("Invalid token.");

        var history = await _userRepository.GetLoginHistoryAsync(userId, 10);

        return Ok(history.Select(h => new
        {
            h.Id,
            h.IsSuccess,
            h.IpAddress,
            AttemptedAt = h.AttemptedAt.ToString("yyyy-MM-dd HH:mm:ss") + " UTC"
        }));
    }

    // ─── GET /api/auth/ping ───────────────────────────────────────────────────
    [HttpGet("ping")]
    public IActionResult Ping() => Ok(new { status = "healthy", timestamp = DateTime.UtcNow });

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Verifies a password against a stored hash.
    /// Supports both BCrypt hashes (start with $2) and legacy plain-text.
    /// </summary>
    private static bool VerifyPassword(string inputPassword, string storedHash)
    {
        if (storedHash.StartsWith("$2"))
        {
            // BCrypt hash
            return BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
        }
        // Legacy plain-text comparison
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
            expires: DateTime.Now.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
