using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;
using TherapyCenterAPI.Services;
using Xunit;

namespace TherapyCenterAPI.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _configurationMock = new Mock<IConfiguration>();
        _loggerMock = new Mock<ILogger<AuthService>>();

        // Setup mock configurations
        var configSectionMock = new Mock<IConfigurationSection>();
        configSectionMock.Setup(s => s.Value).Returns("ThisIsASecretKeyForJwtAuthenticationWhichNeedsToBeLongEnough");
        _configurationMock.Setup(c => c.GetSection("Jwt:Key")).Returns(configSectionMock.Object);

        var issuerSectionMock = new Mock<IConfigurationSection>();
        issuerSectionMock.Setup(s => s.Value).Returns("TherapyCenterAPI");
        _configurationMock.Setup(c => c.GetSection("Jwt:Issuer")).Returns(issuerSectionMock.Object);

        var audienceSectionMock = new Mock<IConfigurationSection>();
        audienceSectionMock.Setup(s => s.Value).Returns("TherapyCenterFrontend");
        _configurationMock.Setup(c => c.GetSection("Jwt:Audience")).Returns(audienceSectionMock.Object);

        _authService = new AuthService(
            _userRepositoryMock.Object,
            _configurationMock.Object
        );
    }

    [Fact]
    public async Task AuthenticateAsync_InvalidEmail_ReturnsNull()
    {
        // Arrange
        _userRepositoryMock.Setup(r => r.GetByEmailAndPasswordAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _authService.AuthenticateAsync("nonexistent@example.com", "password");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task AuthenticateAsync_LockedAccount_ReturnsUserWithLockoutState()
    {
        // Arrange
        var user = new User
        {
            Email = "locked@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
            LockoutUntil = DateTime.UtcNow.AddMinutes(5)
        };
        _userRepositoryMock.Setup(r => r.GetByEmailAndPasswordAsync("locked@example.com", It.IsAny<string>()))
            .ReturnsAsync(user);

        // Act
        var result = await _authService.AuthenticateAsync("locked@example.com", "password");

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.LockoutUntil);
        Assert.True(result.LockoutUntil > DateTime.UtcNow);
    }
}
