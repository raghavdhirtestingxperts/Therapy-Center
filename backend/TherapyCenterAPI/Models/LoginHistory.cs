namespace TherapyCenterAPI.Models;

public class LoginHistory
{
    public int Id { get; set; }

    /// <summary>Null when the attempted email doesn't match any user.</summary>
    public int? UserId { get; set; }

    /// <summary>The email address that was used in the login attempt.</summary>
    public string Email { get; set; } = string.Empty;

    public bool IsSuccess { get; set; }

    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;

    /// <summary>IP address of the client (may be null if not available).</summary>
    public string? IpAddress { get; set; }

    // Navigation property
    public virtual User? User { get; set; }
}
