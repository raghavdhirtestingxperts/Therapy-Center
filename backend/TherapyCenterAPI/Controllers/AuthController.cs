using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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

    public AuthController(IAuthService authService, IConfiguration configuration, IUserRepository userRepository)
    {
        _authService = authService;
        _configuration = configuration;
        _userRepository = userRepository;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _authService.AuthenticateAsync(request.Email, request.Password);
        if (user == null)
            return Unauthorized("Invalid credentials or inactive account.");

        var token = GenerateJwtToken(user);
        return Ok(new { token, role = user.Role, userId = user.UserId, firstName = user.FirstName, lastName = user.LastName });
    }

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

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
        var (success, message) = await _authService.RegisterAsync(user);
        if (!success) return BadRequest(message);
        return Ok(message);
    }

    [HttpGet("ping")]
    public IActionResult Ping() => Ok(new { status = "healthy", timestamp = DateTime.UtcNow });

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
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
