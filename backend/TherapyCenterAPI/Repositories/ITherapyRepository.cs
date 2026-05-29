using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public interface ITherapyRepository
{
    Task<IEnumerable<Therapy>> GetAllAsync();
    Task<Therapy?> GetByIdAsync(int id);
    Task<Therapy> AddAsync(Therapy therapy);
    Task<Therapy> UpdateAsync(Therapy therapy);
    Task RemoveAsync(Therapy therapy);
    Task SaveChangesAsync();
}
