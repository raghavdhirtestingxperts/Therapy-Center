using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Data
{
    public static class DataSeeder
    {
        public static async Task SeedDataAsync(ApplicationDbContext db)
        {
            // Do not seed if data already exists
            if (await db.Therapies.AnyAsync())
            {
                return;
            }

            // 1. Therapies
            var therapies = new[]
            {
                new Therapy { Name = "Physical Therapy", Description = "Rehabilitation and strengthening.", DurationMinutes = 60, Cost = 120.00m },
                new Therapy { Name = "Speech Therapy", Description = "Language and speech pathology.", DurationMinutes = 45, Cost = 95.00m },
                new Therapy { Name = "Occupational Therapy", Description = "Motor skills and behavioral development.", DurationMinutes = 60, Cost = 110.00m },
                new Therapy { Name = "ABA Therapy", Description = "Applied Behavior Analysis.", DurationMinutes = 90, Cost = 150.00m }
            };
            db.Therapies.AddRange(therapies);

            // 2. Add Users (Doctors, Receptionist)
            var receptionistUser = new User
            {
                FirstName = "Sarah",
                LastName = "Connor",
                Email = "sarah@therapycenter.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
                Role = "Receptionist",
                PhoneNumber = "111-222-3333",
                IsActive = true
            };
            var doctorUser1 = new User
            {
                FirstName = "Emily",
                LastName = "Smith",
                Email = "emily@therapycenter.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
                Role = "Doctor",
                PhoneNumber = "222-333-4444",
                IsActive = true
            };
            var doctorUser2 = new User
            {
                FirstName = "James",
                LastName = "Wilson",
                Email = "james@therapycenter.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
                Role = "Doctor",
                PhoneNumber = "555-666-7777",
                IsActive = true
            };

            db.Users.AddRange(receptionistUser, doctorUser1, doctorUser2);

            // Save to generate IDs for Users and Therapies
            await db.SaveChangesAsync();

            // 3. Doctors Table binding
            var doc1 = new Doctor
            {
                UserId = doctorUser1.UserId,
                Specialization = "Speech & Occupational",
                Bio = "Pediatric specialist with 10 years experience.",
                AvailableDays = "Mon,Wed,Fri",
                StartTime = new TimeSpan(9, 0, 0), // 9 AM
                EndTime = new TimeSpan(17, 0, 0) // 5 PM
            };
            var doc2 = new Doctor
            {
                UserId = doctorUser2.UserId,
                Specialization = "Physical Therapist",
                Bio = "Movement and joint specialist.",
                AvailableDays = "Tue,Thu",
                StartTime = new TimeSpan(10, 0, 0), // 10 AM
                EndTime = new TimeSpan(18, 0, 0) // 6 PM
            };
            db.Doctors.AddRange(doc1, doc2);

            // 4. Patients
            var pat1 = new Patient
            {
                FirstName = "Leo",
                LastName = "Martinez",
                DateOfBirth = new DateTime(2015, 6, 12),
                Gender = "Male",
                MedicalHistory = "Minor autism spectrum.",
                CreatedAt = DateTime.UtcNow
            };
            var pat2 = new Patient
            {
                FirstName = "Mia",
                LastName = "Chang",
                DateOfBirth = new DateTime(2018, 3, 24),
                Gender = "Female",
                MedicalHistory = "Speech delays.",
                CreatedAt = DateTime.UtcNow
            };
            var pat3 = new Patient
            {
                FirstName = "Sam",
                LastName = "Johnson",
                DateOfBirth = new DateTime(2012, 11, 2),
                Gender = "Male",
                MedicalHistory = "Post-surgery physical rehab.",
                CreatedAt = DateTime.UtcNow
            };
            db.Patients.AddRange(pat1, pat2, pat3);

            // Save to generate IDs for Doctors and Patients
            await db.SaveChangesAsync();

            // 5. Appointments
            // Let's create an appointment for tomorrow
            var tomorrow = DateTime.UtcNow.Date.AddDays(1);
            
            var appointments = new[]
            {
                new Appointment
                {
                    PatientId = pat1.PatientId,
                    DoctorId = doc1.DoctorId, // Emily Smith
                    TherapyId = therapies[2].TherapyId, // Occupational
                    AppointmentDate = tomorrow,
                    StartTime = new TimeSpan(10, 0, 0),
                    EndTime = new TimeSpan(11, 0, 0),
                    Status = "Scheduled",
                    Notes = "Initial evaluation."
                },
                new Appointment
                {
                    PatientId = pat2.PatientId,
                    DoctorId = doc1.DoctorId, // Emily Smith
                    TherapyId = therapies[1].TherapyId, // Speech
                    AppointmentDate = tomorrow,
                    StartTime = new TimeSpan(13, 0, 0),
                    EndTime = new TimeSpan(13, 45, 0),
                    Status = "Scheduled",
                    Notes = "Focusing on vocal pronunciation."
                },
                new Appointment
                {
                    PatientId = pat3.PatientId,
                    DoctorId = doc2.DoctorId, // James Wilson
                    TherapyId = therapies[0].TherapyId, // Physical
                    AppointmentDate = tomorrow.AddDays(1),
                    StartTime = new TimeSpan(14, 0, 0),
                    EndTime = new TimeSpan(15, 0, 0),
                    Status = "Scheduled"
                }
            };
            db.Appointments.AddRange(appointments);

            await db.SaveChangesAsync();
        }
    }
}
