using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public class SlotRepository : ISlotRepository
{
    private readonly ApplicationDbContext _context;

    public SlotRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Slot>> GetSlotsAsync(int? doctorId, DateTime? date)
    {
        var query = _context.Slots
            .Include(s => s.Doctor).ThenInclude(d => d.User)
            .AsQueryable();

        if (doctorId.HasValue)
            query = query.Where(s => s.DoctorId == doctorId.Value);

        if (date.HasValue)
        {
            query = query.Where(s => s.Date.Date == date.Value.Date);
        }
        else
        {
            var today = DateTime.UtcNow.Date;
            query = query.Where(s => s.Date.Date >= today);
        }

        return await query
            .OrderBy(s => s.Date)
            .ThenBy(s => s.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Slot>> GetAvailableSlotsAsync(int doctorId, DateTime date)
    {
        return await _context.Slots
            .Where(s => s.DoctorId == doctorId && s.Date.Date == date.Date && !s.IsBooked)
            .OrderBy(s => s.StartTime)
            .ToListAsync();
    }

    public async Task<Slot?> GetByIdAsync(int id)
    {
        return await _context.Slots.FindAsync(id);
    }

    public async Task<bool> SlotExistsAsync(int doctorId, DateTime date, TimeSpan startTime)
    {
        return await _context.Slots.AnyAsync(s =>
            s.DoctorId == doctorId &&
            s.Date.Date == date.Date &&
            s.StartTime == startTime);
    }

    public async Task<Slot?> FindAvailableSlotAsync(int doctorId, DateTime date, TimeSpan startTime)
    {
        return await _context.Slots.FirstOrDefaultAsync(s =>
            s.DoctorId == doctorId &&
            s.Date.Date == date.Date &&
            s.StartTime == startTime &&
            !s.IsBooked);
    }

    public async Task<Slot?> FindBookedSlotAsync(int doctorId, DateTime date, TimeSpan startTime)
    {
        return await _context.Slots.FirstOrDefaultAsync(s =>
            s.DoctorId == doctorId &&
            s.Date.Date == date.Date &&
            s.StartTime == startTime &&
            s.IsBooked);
    }

    public async Task AddAsync(Slot slot)
    {
        _context.Slots.Add(slot);
        await Task.CompletedTask;
    }

    public async Task RemoveAsync(Slot slot)
    {
        _context.Slots.Remove(slot);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
