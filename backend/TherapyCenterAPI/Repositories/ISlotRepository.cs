using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public interface ISlotRepository
{
    Task<IEnumerable<Slot>> GetSlotsAsync(int? doctorId, DateTime? date);
    Task<IEnumerable<Slot>> GetAvailableSlotsAsync(int doctorId, DateTime date);
    Task<Slot?> GetByIdAsync(int id);
    Task<bool> SlotExistsAsync(int doctorId, DateTime date, TimeSpan startTime);
    Task<Slot?> FindAvailableSlotAsync(int doctorId, DateTime date, TimeSpan startTime);
    Task<Slot?> FindBookedSlotAsync(int doctorId, DateTime date, TimeSpan startTime);
    Task AddAsync(Slot slot);
    Task RemoveAsync(Slot slot);
    Task SaveChangesAsync();
}
