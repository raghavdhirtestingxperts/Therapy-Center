using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public class TherapyRepository : ITherapyRepository
{
    private readonly ApplicationDbContext _context;

    public TherapyRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Therapy>> GetAllAsync()
    {
        return await _context.Therapies.ToListAsync();
    }

    public async Task<Therapy?> GetByIdAsync(int id)
    {
        return await _context.Therapies.FindAsync(id);
    }

    public async Task<Therapy> AddAsync(Therapy therapy)
    {
        _context.Therapies.Add(therapy);
        await _context.SaveChangesAsync();
        return therapy;
    }

    public async Task<Therapy> UpdateAsync(Therapy therapy)
    {
        await _context.SaveChangesAsync();
        return therapy;
    }

    public async Task RemoveAsync(Therapy therapy)
    {
        _context.Therapies.Remove(therapy);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
