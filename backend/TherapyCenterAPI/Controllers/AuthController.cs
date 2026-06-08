using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;
using TherapyCenterAPI.Services;

namespace TherapyCenterAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserRepository _userRepository;

    public AuthController(IAuthService authService, IUserRepository userRepository)
    {
        _authService = authService;
        _userRepository = userRepository;
    }

    // POST /api/auth/login
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var (success, result, statusCode) = await _authService.LoginAsync(request, ip);

        if (!success)
            return StatusCode(statusCode, result);

        return Ok(result);
    }

    // GET /api/auth/profile
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

    // POST /api/auth/register
    [HttpPost("register")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        var (success, message) = await _authService.RegisterAsync(user);
        if (!success) return BadRequest(message);
        return Ok(message);
    }

    // POST /api/auth/change-password
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized("Invalid token.");

        var (success, message) = await _authService.ChangePasswordAsync(userId, request);
        if (!success) return BadRequest(message);
        return Ok(message);
    }

    // GET /api/auth/login-history
    [Authorize]
    [HttpGet("login-history")]
    public async Task<IActionResult> GetLoginHistory()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized("Invalid token.");

        var history = await _authService.GetLoginHistoryAsync(userId, 10);
        return Ok(history);
    }



    // GET /api/auth/ping
    [HttpGet("ping")]
    public IActionResult Ping() => Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
}
