using System.Net;
using System.Net.Mail;

namespace TherapyCenterAPI.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        // 1. Prominent console logging so developers can see the code without SMTP server
        _logger.LogInformation("\n\n" +
                               "********************************************************************************\n" +
                               "****************************** [MOCK EMAIL SERVICE] ****************************\n" +
                               "********************************************************************************\n" +
                               $"  TO: {toEmail}\n" +
                               $"  SUBJECT: {subject}\n" +
                               $"  BODY: {body.Replace("<br/>", "\n").Replace("<h3>", "").Replace("</h3>", "").Replace("<p>", "").Replace("</p>", "").Replace("<strong>", "").Replace("</strong>", "")}\n" +
                               "********************************************************************************\n" +
                               "********************************************************************************\n");

        // 2. Real SMTP sending
        var smtpServer = _configuration["EmailSettings:SmtpServer"];
        var senderEmail = _configuration["EmailSettings:SenderEmail"];
        var senderPassword = _configuration["EmailSettings:SenderPassword"];

        if (string.IsNullOrWhiteSpace(smtpServer) || string.IsNullOrWhiteSpace(senderEmail) || string.IsNullOrWhiteSpace(senderPassword))
        {
            _logger.LogWarning("SMTP Settings not fully configured in appsettings.json. Email was not sent via SMTP.");
            return;
        }

        int smtpPort = int.TryParse(_configuration["EmailSettings:SmtpPort"], out var port) ? port : 587;
        bool enableSsl = !bool.TryParse(_configuration["EmailSettings:EnableSsl"], out var ssl) || ssl;

        try
        {
            using var client = new SmtpClient(smtpServer, smtpPort)
            {
                Credentials = new NetworkCredential(senderEmail, senderPassword),
                EnableSsl = enableSsl
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, "Special Kids Therapy Center"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation($"Successfully sent email to {toEmail} via SMTP ({smtpServer}:{smtpPort}).");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send email to {toEmail} via SMTP.");
        }
    }
}
