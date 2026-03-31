using Microsoft.EntityFrameworkCore;
using TherapyCenterAPI.Models;

namespace TherapyCenterAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Therapy> Therapies { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<DoctorFinding> DoctorFindings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Slot> Slots { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure identity/constraints if needed
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Self-referencing or specific relationships can be defined here
            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany()
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany()
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Therapy)
                .WithMany()
                .HasForeignKey(a => a.TherapyId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
