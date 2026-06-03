using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAndPasswordAsync(string email, string password);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<IEnumerable<User>> GetAllAsync(string? role = null);
    Task<User?> GetByIdAsync(int id);
    Task<User> AddAsync(User user);
    Task<User> UpdateAsync(User user);
    Task AddLoginHistoryAsync(LoginHistory history);
    Task<IEnumerable<LoginHistory>> GetLoginHistoryAsync(int userId, int count = 10);
}
