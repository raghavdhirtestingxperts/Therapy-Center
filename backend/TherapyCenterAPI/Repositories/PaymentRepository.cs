using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly ApplicationDbContext _context;

    public PaymentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Payment>> GetAllWithIncludesAsync()
    {
        return await _context.Payments
            .Include(p => p.Appointment).ThenInclude(a => a.Therapy)
            .Include(p => p.Appointment).ThenInclude(a => a.Patient)
            .Include(p => p.Appointment).ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
            .OrderByDescending(p => p.PaidAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Payment>> GetForPatientAsync(IEnumerable<int> patientIds)
    {
        return await _context.Payments
            .Include(p => p.Appointment).ThenInclude(a => a.Therapy)
            .Include(p => p.Appointment).ThenInclude(a => a.Patient)
            .Include(p => p.Appointment).ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
            .Where(p => patientIds.Contains(p.Appointment.PatientId))
            .OrderByDescending(p => p.PaidAt)
            .ToListAsync();
    }

    public async Task<Payment?> GetByAppointmentIdAsync(int appointmentId)
    {
        return await _context.Payments
            .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);
    }

    public async Task<bool> AlreadyPaidAsync(int appointmentId)
    {
        return await _context.Payments
            .AnyAsync(p => p.AppointmentId == appointmentId && p.Status == "Paid");
    }

    public async Task<Payment> AddAsync(Payment payment)
    {
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        return payment;
    }
}
