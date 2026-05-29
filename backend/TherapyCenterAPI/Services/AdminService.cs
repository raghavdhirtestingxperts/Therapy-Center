using TherapyCenterAPI.Models;
using TherapyCenterAPI.Repositories;

namespace TherapyCenterAPI.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IDoctorRepository _doctorRepository;
    private readonly ITherapyRepository _therapyRepository;
    private readonly ISlotRepository _slotRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IPaymentRepository _paymentRepository;

    public AdminService(
        IUserRepository userRepository,
        IDoctorRepository doctorRepository,
        ITherapyRepository therapyRepository,
        ISlotRepository slotRepository,
        IPatientRepository patientRepository,
        IAppointmentRepository appointmentRepository,
        IPaymentRepository paymentRepository)
    {
        _userRepository = userRepository;
        _doctorRepository = doctorRepository;
        _therapyRepository = therapyRepository;
        _slotRepository = slotRepository;
        _patientRepository = patientRepository;
        _appointmentRepository = appointmentRepository;
        _paymentRepository = paymentRepository;
    }

    // ─── Dashboard ───
    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        var patients = (await _patientRepository.GetAllWithGuardianAsync()).ToList();
        var doctors = (await _doctorRepository.GetAllWithUserAsync()).ToList();
        var appointments = (await _appointmentRepository.GetAllForAdminAsync()).ToList();
        var therapies = (await _therapyRepository.GetAllAsync()).ToList();
        var payments = (await _paymentRepository.GetAllWithIncludesAsync()).ToList();

        return new DashboardStats(
            TotalPatients: patients.Count,
            TotalDoctors: doctors.Count,
            TotalAppointments: appointments.Count,
            TodaysAppointments: appointments.Count(a => a.AppointmentDate.Date == DateTime.UtcNow.Date),
            ScheduledAppointments: appointments.Count(a => a.Status == "Scheduled"),
            CompletedAppointments: appointments.Count(a => a.Status == "Completed"),
            TotalRevenue: payments.Where(p => p.Status == "Paid").Sum(p => p.Amount),
            TotalTherapies: therapies.Count
        );
    }

    // ─── Therapies ───
    public async Task<IEnumerable<Therapy>> GetTherapiesAsync()
        => await _therapyRepository.GetAllAsync();

    public async Task<Therapy> CreateTherapyAsync(Therapy therapy)
        => await _therapyRepository.AddAsync(therapy);

    public async Task<Therapy?> UpdateTherapyAsync(int id, Therapy therapy)
    {
        var existing = await _therapyRepository.GetByIdAsync(id);
        if (existing == null) return null;

        existing.Name = therapy.Name;
        existing.Description = therapy.Description;
        existing.DurationMinutes = therapy.DurationMinutes;
        existing.Cost = therapy.Cost;

        return await _therapyRepository.UpdateAsync(existing);
    }

    public async Task<bool> DeleteTherapyAsync(int id)
    {
        var therapy = await _therapyRepository.GetByIdAsync(id);
        if (therapy == null) return false;

        await _therapyRepository.RemoveAsync(therapy);
        await _therapyRepository.SaveChangesAsync();
        return true;
    }

    // ─── Users / Staff ───
    public async Task<IEnumerable<User>> GetUsersAsync(string? role)
        => await _userRepository.GetAllAsync(role);

    public async Task<(bool Success, string Message, User? User)> CreateUserAsync(CreateStaffRequest request)
    {
        if (await _userRepository.EmailExistsAsync(request.Email))
            return (false, "Email already exists.", null);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = request.Password,
            Role = request.Role,
            PhoneNumber = request.PhoneNumber
        };

        var created = await _userRepository.AddAsync(user);
        return (true, "User created.", created);
    }

    public async Task<User?> UpdateUserAsync(int id, CreateStaffRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        if (!string.IsNullOrEmpty(request.Password))
            user.PasswordHash = request.Password;
        user.PhoneNumber = request.PhoneNumber;

        return await _userRepository.UpdateAsync(user);
    }

    public async Task<User?> ToggleUserActiveAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        user.IsActive = !user.IsActive;
        return await _userRepository.UpdateAsync(user);
    }

    // ─── Doctors ───
    public async Task<IEnumerable<Doctor>> GetDoctorsAsync()
        => await _doctorRepository.GetAllWithUserAsync();

    public async Task<(bool Success, string Message, Doctor? Doctor)> CreateDoctorAsync(CreateDoctorRequest request)
    {
        if (await _userRepository.EmailExistsAsync(request.Email))
            return (false, "Email already exists.", null);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = request.Password,
            Role = "Doctor"
        };
        var createdUser = await _userRepository.AddAsync(user);

        var doctor = new Doctor
        {
            UserId = createdUser.UserId,
            Specialization = request.Specialization,
            Bio = request.Bio ?? "",
            AvailableDays = request.AvailableDays,
            StartTime = TimeSpan.Parse(request.StartTime),
            EndTime = TimeSpan.Parse(request.EndTime)
        };
        var createdDoctor = await _doctorRepository.AddAsync(doctor);
        createdDoctor.User = createdUser;

        return (true, "Doctor created.", createdDoctor);
    }

    public async Task<Doctor?> UpdateDoctorAsync(int id, CreateDoctorRequest request)
    {
        var doctor = await _doctorRepository.GetByIdWithUserAsync(id);
        if (doctor == null) return null;

        doctor.User.FirstName = request.FirstName;
        doctor.User.LastName = request.LastName;
        doctor.User.Email = request.Email;
        if (!string.IsNullOrEmpty(request.Password))
            doctor.User.PasswordHash = request.Password;

        doctor.Specialization = request.Specialization;
        doctor.Bio = request.Bio ?? "";
        doctor.AvailableDays = request.AvailableDays;
        doctor.StartTime = TimeSpan.Parse(request.StartTime);
        doctor.EndTime = TimeSpan.Parse(request.EndTime);

        return await _doctorRepository.UpdateAsync(doctor);
    }

    public async Task<bool> DeactivateDoctorAsync(int id)
    {
        var doctor = await _doctorRepository.GetByIdWithUserAsync(id);
        if (doctor == null) return false;

        doctor.User.IsActive = false;
        await _doctorRepository.UpdateAsync(doctor);
        return true;
    }

    // ─── Slots ───
    public async Task<IEnumerable<Slot>> GetSlotsAsync(int? doctorId, DateTime? date)
        => await _slotRepository.GetSlotsAsync(doctorId, date);

    public async Task<(bool Success, string Message, int SlotsCreated)> GenerateSlotsAsync(GenerateSlotsRequest request)
    {
        var doctor = await _doctorRepository.GetByIdAsync(request.DoctorId);
        if (doctor == null) return (false, "Doctor not found.", 0);

        var duration = request.SlotDurationMinutes > 0 ? request.SlotDurationMinutes : 45;
        var currentTime = doctor.StartTime;
        var slotsCreated = 0;

        while (currentTime.Add(TimeSpan.FromMinutes(duration)) <= doctor.EndTime)
        {
            var endTime = currentTime.Add(TimeSpan.FromMinutes(duration));
            var exists = await _slotRepository.SlotExistsAsync(request.DoctorId, request.Date, currentTime);

            if (!exists)
            {
                await _slotRepository.AddAsync(new Slot
                {
                    DoctorId = request.DoctorId,
                    Date = request.Date.Date,
                    StartTime = currentTime,
                    EndTime = endTime,
                    IsBooked = false
                });
                slotsCreated++;
            }
            currentTime = endTime;
        }

        await _slotRepository.SaveChangesAsync();
        return (true, $"{slotsCreated} slots created.", slotsCreated);
    }

    public async Task<(bool Success, string Message)> DeleteSlotAsync(int id)
    {
        var slot = await _slotRepository.GetByIdAsync(id);
        if (slot == null) return (false, "Not found.");
        if (slot.IsBooked) return (false, "Cannot delete a booked slot.");

        await _slotRepository.RemoveAsync(slot);
        await _slotRepository.SaveChangesAsync();
        return (true, "Deleted.");
    }
}
