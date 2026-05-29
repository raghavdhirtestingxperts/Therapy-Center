using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Services;

public record DashboardStats(
    int TotalPatients,
    int TotalDoctors,
    int TotalAppointments,
    int TodaysAppointments,
    int ScheduledAppointments,
    int CompletedAppointments,
    decimal TotalRevenue,
    int TotalTherapies
);

public interface IAdminService
{
    // Dashboard
    Task<DashboardStats> GetDashboardStatsAsync();

    // Therapies
    Task<IEnumerable<Therapy>> GetTherapiesAsync();
    Task<Therapy> CreateTherapyAsync(Therapy therapy);
    Task<Therapy?> UpdateTherapyAsync(int id, Therapy therapy);
    Task<bool> DeleteTherapyAsync(int id);

    // Users / Staff
    Task<IEnumerable<User>> GetUsersAsync(string? role);
    Task<(bool Success, string Message, User? User)> CreateUserAsync(CreateStaffRequest request);
    Task<User?> UpdateUserAsync(int id, CreateStaffRequest request);
    Task<User?> ToggleUserActiveAsync(int id);

    // Doctors
    Task<IEnumerable<Doctor>> GetDoctorsAsync();
    Task<(bool Success, string Message, Doctor? Doctor)> CreateDoctorAsync(CreateDoctorRequest request);
    Task<Doctor?> UpdateDoctorAsync(int id, CreateDoctorRequest request);
    Task<bool> DeactivateDoctorAsync(int id);

    // Slots
    Task<IEnumerable<Slot>> GetSlotsAsync(int? doctorId, DateTime? date);
    Task<(bool Success, string Message, int SlotsCreated)> GenerateSlotsAsync(GenerateSlotsRequest request);
    Task<(bool Success, string Message)> DeleteSlotAsync(int id);
}
