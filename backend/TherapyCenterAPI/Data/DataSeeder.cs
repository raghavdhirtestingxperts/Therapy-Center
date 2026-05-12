using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Data;

public static class DataSeeder
{
    public static async Task SeedData(ApplicationDbContext context)
    {
        await context.Database.MigrateAsync();

        if (await context.Users.AnyAsync())
        {
            return; // Data already seeded
        }

        // ─── Therapies ───
        var therapies = new List<Therapy>
        {
            new Therapy { Name = "Physical Therapy", Description = "Improves mobility, motor skills, and muscle strength through targeted exercises.", DurationMinutes = 45, Cost = 1500 },
            new Therapy { Name = "Speech Therapy", Description = "Enhances communication skills including speech, language, and social interaction.", DurationMinutes = 30, Cost = 1200 },
            new Therapy { Name = "Occupational Therapy", Description = "Helps children develop daily living skills and fine motor coordination.", DurationMinutes = 60, Cost = 1800 },
            new Therapy { Name = "ABA Therapy", Description = "Applied Behavior Analysis to improve social, communication, and learning skills.", DurationMinutes = 60, Cost = 2000 },
            new Therapy { Name = "Sensory Integration", Description = "Helps children process and respond to sensory information effectively.", DurationMinutes = 45, Cost = 1600 }
        };
        context.Therapies.AddRange(therapies);

        // ─── Users ───
        var users = new List<User>
        {
            new User { FirstName = "Admin", LastName = "User", Email = "admin@therapycenter.com", PasswordHash = "admin123", Role = "Admin", PhoneNumber = "9000000001" },
            new User { FirstName = "Sarah", LastName = "Connor", Email = "reception@therapycenter.com", PasswordHash = "pass123", Role = "Receptionist", PhoneNumber = "9000000002" },
            new User { FirstName = "John", LastName = "Doe", Email = "doctor@therapycenter.com", PasswordHash = "pass123", Role = "Doctor", PhoneNumber = "9000000003" },
            new User { FirstName = "Emily", LastName = "Brown", Email = "doctor2@therapycenter.com", PasswordHash = "pass123", Role = "Doctor", PhoneNumber = "9000000004" },
            new User { FirstName = "Jane", LastName = "Smith", Email = "guardian@therapycenter.com", PasswordHash = "pass123", Role = "Guardian", PhoneNumber = "9000000005" },
            new User { FirstName = "Mary", LastName = "Johnson", Email = "guardian2@therapycenter.com", PasswordHash = "pass123", Role = "Guardian", PhoneNumber = "9000000006" }
        };
        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // ─── Doctor Profiles ───
        var doctor1User = await context.Users.FirstAsync(u => u.Email == "doctor@therapycenter.com");
        var doctor2User = await context.Users.FirstAsync(u => u.Email == "doctor2@therapycenter.com");

        var doctor1 = new Doctor
        {
            UserId = doctor1User.UserId,
            Specialization = "Pediatric Neurology",
            Bio = "10+ years experience in pediatric neurological therapy.",
            AvailableDays = "Mon,Tue,Wed,Thu,Fri",
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(17, 0, 0)
        };
        var doctor2 = new Doctor
        {
            UserId = doctor2User.UserId,
            Specialization = "Speech & Language Pathology",
            Bio = "Specialist in childhood communication disorders.",
            AvailableDays = "Mon,Wed,Fri",
            StartTime = new TimeSpan(10, 0, 0),
            EndTime = new TimeSpan(16, 0, 0)
        };
        context.Doctors.AddRange(doctor1, doctor2);

        // ─── Patient Profiles ───
        var guardian1 = await context.Users.FirstAsync(u => u.Email == "guardian@therapycenter.com");
        var guardian2 = await context.Users.FirstAsync(u => u.Email == "guardian2@therapycenter.com");

        var patient1 = new Patient
        {
            GuardianId = guardian1.UserId,
            FirstName = "Timmy",
            LastName = "Smith",
            DateOfBirth = new DateTime(2018, 5, 12),
            Gender = "Male",
            MedicalHistory = "Autism Spectrum Disorder - mild. Responds well to structured therapy."
        };
        var patient2 = new Patient
        {
            GuardianId = guardian2.UserId,
            FirstName = "Lily",
            LastName = "Johnson",
            DateOfBirth = new DateTime(2019, 8, 22),
            Gender = "Female",
            MedicalHistory = "ADHD with speech delay. Making progress with regular sessions."
        };
        context.Patients.AddRange(patient1, patient2);
        await context.SaveChangesAsync();

        // ─── Generate Slots for next 5 days ───
        var today = DateTime.UtcNow.Date;
        var doctors = new[] { doctor1, doctor2 };

        foreach (var doctor in doctors)
        {
            var availableDays = doctor.AvailableDays.Split(',').Select(d => d.Trim()).ToList();

            for (int dayOffset = 1; dayOffset <= 7; dayOffset++)
            {
                var date = today.AddDays(dayOffset);
                var dayName = date.DayOfWeek.ToString().Substring(0, 3);

                if (!availableDays.Contains(dayName)) continue;

                var currentTime = doctor.StartTime;
                while (currentTime.Add(TimeSpan.FromMinutes(45)) <= doctor.EndTime)
                {
                    context.Slots.Add(new Slot
                    {
                        DoctorId = doctor.DoctorId,
                        Date = date,
                        StartTime = currentTime,
                        EndTime = currentTime.Add(TimeSpan.FromMinutes(45)),
                        IsBooked = false
                    });
                    currentTime = currentTime.Add(TimeSpan.FromMinutes(45));
                }
            }
        }
        await context.SaveChangesAsync();

        // ─── Sample Appointments ───
        var therapy1 = await context.Therapies.FirstAsync(t => t.Name == "Physical Therapy");
        var therapy2 = await context.Therapies.FirstAsync(t => t.Name == "Speech Therapy");

        // Completed appointment (yesterday)
        var completedApp = new Appointment
        {
            PatientId = patient1.PatientId,
            DoctorId = doctor1.DoctorId,
            TherapyId = therapy1.TherapyId,
            AppointmentDate = today.AddDays(-1),
            StartTime = new TimeSpan(10, 0, 0),
            EndTime = new TimeSpan(10, 45, 0),
            Status = "Completed"
        };

        // Scheduled appointment (tomorrow)
        var scheduledApp = new Appointment
        {
            PatientId = patient1.PatientId,
            DoctorId = doctor1.DoctorId,
            TherapyId = therapy2.TherapyId,
            AppointmentDate = today.AddDays(1),
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(9, 30, 0),
            Status = "Scheduled"
        };

        // Another scheduled appointment
        var scheduledApp2 = new Appointment
        {
            PatientId = patient2.PatientId,
            DoctorId = doctor2.DoctorId,
            TherapyId = therapy2.TherapyId,
            AppointmentDate = today.AddDays(2),
            StartTime = new TimeSpan(10, 0, 0),
            EndTime = new TimeSpan(10, 30, 0),
            Status = "Scheduled"
        };

        context.Appointments.AddRange(completedApp, scheduledApp, scheduledApp2);
        await context.SaveChangesAsync();

        // Mark those slots as booked
        var bookedSlots = await context.Slots
            .Where(s =>
                (s.DoctorId == doctor1.DoctorId && s.Date == today.AddDays(1) && s.StartTime == new TimeSpan(9, 0, 0)) ||
                (s.DoctorId == doctor2.DoctorId && s.Date == today.AddDays(2) && s.StartTime == new TimeSpan(10, 0, 0)))
            .ToListAsync();
        foreach (var slot in bookedSlots) slot.IsBooked = true;
        await context.SaveChangesAsync();

        // ─── Findings for completed appointment ───
        context.DoctorFindings.Add(new DoctorFinding
        {
            AppointmentId = completedApp.AppointmentId,
            Observations = "Patient showed good response to physical exercises. Improved leg muscle tone. Minor difficulty with balance exercises.",
            Recommendations = "Continue bi-weekly physical therapy sessions. Introduce balance board exercises. Monitor progress for 4 weeks.",
            NextSessionDate = today.AddDays(7)
        });

        // ─── Payment for completed appointment ───
        context.Payments.Add(new Payment
        {
            AppointmentId = completedApp.AppointmentId,
            Amount = therapy1.Cost,
            PaymentMethod = "Online",
            TransactionId = $"TXN-SEED-001",
            Status = "Paid",
            PaidAt = today.AddDays(-1)
        });

        await context.SaveChangesAsync();
    }
}
