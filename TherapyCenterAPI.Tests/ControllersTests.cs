using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Security.Claims;
using TherapyCenterAPI.Controllers;
using TherapyCenterAPI.Data;
using TherapyCenterAPI.DTOs;
using TherapyCenterAPI.Models;
using Xunit;

namespace TherapyCenterAPI.Tests
{
    public class BaseTest
    {
        protected ApplicationDbContext GetInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new ApplicationDbContext(options);
        }

        protected ControllerContext GetMockControllerContextWithUser(string nameIdentifier)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, nameIdentifier)
            }, "mock"));

            return new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }
    }

    public class AdminControllerTests : BaseTest
    {
        [Fact]
        public async Task GetTherapies_ReturnsList()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new AdminController(context);
            var result = await controller.GetTherapies();
            Assert.NotNull(result.Value);
        }

        [Fact]
        public async Task CreateTherapy_ReturnsCreated()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new AdminController(context);
            var therapy = new Therapy { Name = "Physio", Description = "Desc", Cost = 50 };
            var result = await controller.CreateTherapy(therapy);
            Assert.IsType<CreatedAtActionResult>(result.Result);
        }

        [Fact]
        public async Task UpdateTherapy_ReturnsNoContent()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var therapy = new Therapy { Name = "P", Description = "D", Cost = 10 };
            context.Therapies.Add(therapy);
            await context.SaveChangesAsync();

            var controller = new AdminController(context);
            therapy.Cost = 20;
            var result = await controller.UpdateTherapy(therapy.TherapyId, therapy);
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task GetUsers_ReturnsList()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new AdminController(context);
            var result = await controller.GetUsers(null);
            Assert.NotNull(result.Value);
        }

        [Fact]
        public async Task CreateDoctor_ReturnsCreated()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new AdminController(context);
            var doctor = new Doctor { UserId = 1, Specialization = "A" };
            var result = await controller.CreateDoctor(doctor);
            Assert.IsType<CreatedAtActionResult>(result.Result);
        }

        [Fact]
        public async Task GetDoctors_ReturnsList()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new AdminController(context);
            var result = await controller.GetDoctors();
            Assert.NotNull(result.Value);
        }
    }

    public class AuthControllerTests : BaseTest
    {
        private readonly IConfiguration _config;
        public AuthControllerTests()
        {
            var mockConfig = new Mock<IConfiguration>();
            var mockSection = new Mock<IConfigurationSection>();
            mockSection.Setup(s => s.Value).Returns("SuperSecretKeyThatIsAtLeast64BytesLongForHS512_01234567890123456789!!!");
            mockConfig.Setup(c => c.GetSection(It.IsAny<string>())).Returns(mockSection.Object);
            _config = mockConfig.Object;
        }

        [Fact]
        public async Task Register_ReturnsUserDto()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new AuthController(context, _config);
            var dto = new RegisterDto { Email = "a@a.com", Password = "123", Role = "Admin", FirstName = "A", LastName = "B", PhoneNumber = "123" };
            var result = await controller.Register(dto);
            Assert.NotNull(result.Value);
            Assert.Equal("a@a.com", result.Value.Email);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenInvalid()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new AuthController(context, _config);
            var dto = new LoginDto { Email = "a@a.com", Password = "123" };
            var result = await controller.Login(dto);
            Assert.IsType<UnauthorizedObjectResult>(result.Result);
        }
    }

    public class DoctorControllerTests : BaseTest
    {
        [Fact]
        public async Task GetDoctorAppointments_ReturnsList()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new DoctorController(context);
            var result = await controller.GetDoctorAppointments(1);
            Assert.NotNull(result.Value);
        }

        [Fact]
        public async Task SubmitFindings_ReturnsCreated()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var appointment = new Appointment { DoctorId = 1, PatientId = 1, TherapyId = 1, AppointmentDate = DateTime.Today, StartTime = TimeSpan.Zero, Status = "Scheduled" };
            context.Appointments.Add(appointment);
            await context.SaveChangesAsync();

            var controller = new DoctorController(context);
            var finding = new DoctorFinding { AppointmentId = appointment.AppointmentId, Observations = "A", Recommendations = "B" };
            var result = await controller.SubmitFindings(finding);
            Assert.IsType<CreatedAtActionResult>(result.Result);
        }

        [Fact]
        public async Task GetFinding_ReturnsNotFound_WhenInvalid()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new DoctorController(context);
            var result = await controller.GetFinding(1);
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetAvailability_ReturnsList()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new DoctorController(context);
            var result = await controller.GetAvailability(1);
            Assert.NotNull(result.Value);
        }
    }

    public class PatientControllerTests : BaseTest
    {
        [Fact]
        public async Task GetMyAppointments_ReturnsNotFound_WhenNoPatient()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new PatientController(context)
            {
                ControllerContext = GetMockControllerContextWithUser("1")
            };
            var result = await controller.GetMyAppointments();
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetMyFindings_ReturnsNotFound_WhenNoPatient()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new PatientController(context)
            {
                ControllerContext = GetMockControllerContextWithUser("1")
            };
            var result = await controller.GetMyFindings();
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task BookOnline_ReturnsCreated()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new PatientController(context);
            var appt = new Appointment { DoctorId = 1, PatientId = 1, TherapyId = 1, AppointmentDate = DateTime.Today, StartTime = TimeSpan.Zero, Status = "" };
            var result = await controller.BookOnline(appt);
            Assert.IsType<CreatedAtActionResult>(result.Result);
        }
    }

    public class PaymentControllerTests : BaseTest
    {
        [Fact]
        public async Task ProcessPayment_ReturnsOk()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new PaymentController(context);
            var payment = new Payment { AppointmentId = 1, Amount = 10, PaymentMethod = "Card", PaidAt = DateTime.Today };
            var result = await controller.ProcessPayment(payment);
            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetPaymentStatus_ReturnsNotFound_WhenInvalid()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new PaymentController(context);
            var result = await controller.GetPaymentStatus(1);
            Assert.IsType<NotFoundResult>(result.Result);
        }
    }

    public class ReceptionistControllerTests : BaseTest
    {
        [Fact]
        public async Task SearchPatients_ReturnsList()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new ReceptionistController(context);
            var result = await controller.SearchPatients("John");
            Assert.NotNull(result.Value);
        }

        [Fact]
        public async Task BookOfflineAppointment_ReturnsCreated()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new ReceptionistController(context);
            var appt = new Appointment { DoctorId = 1, PatientId = 1, TherapyId = 1, AppointmentDate = DateTime.Today, StartTime = TimeSpan.Zero, Status = "" };
            var result = await controller.BookOfflineAppointment(appt);
            Assert.IsType<CreatedAtActionResult>(result.Result);
        }

        [Fact]
        public async Task GetAppointment_ReturnsNotFound_WhenInvalid()
        {
            var context = GetInMemoryContext(Guid.NewGuid().ToString());
            var controller = new ReceptionistController(context);
            var result = await controller.GetAppointment(1);
            Assert.IsType<NotFoundResult>(result.Result);
        }
    }
}
