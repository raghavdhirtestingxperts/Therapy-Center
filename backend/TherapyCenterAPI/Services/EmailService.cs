using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace TherapyCenterAPI.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private static readonly HttpClient _httpClient = new HttpClient();

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

        // 2. Real SendGrid HTTP API sending (Port 443 - never blocked by cloud providers)
        var apiKey = _configuration["EmailSettings:SendGridApiKey"];
        var senderEmail = _configuration["EmailSettings:SenderEmail"];

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(senderEmail))
        {
            _logger.LogWarning("SendGrid SMTP/API Settings not fully configured in appsettings.json or environment variables. Email was not sent via HTTP API.");
            return;
        }

        try
        {
            var payload = new
            {
                personalizations = new[]
                {
                    new
                    {
                        to = new[]
                        {
                            new { email = toEmail }
                        },
                        subject = subject
                    }
                },
                from = new
                {
                    email = senderEmail,
                    name = "Special Kids Therapy Center"
                },
                content = new[]
                {
                    new
                    {
                        type = "text/html",
                        value = body
                    }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.sendgrid.com/v3/mail/send");
            request.Headers.Add("Authorization", $"Bearer {apiKey}");
            request.Content = content;

            using var response = await _httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation($"Successfully sent email to {toEmail} via SendGrid HTTP API.");
            }
            else
            {
                var errorResponse = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to send email to {toEmail} via SendGrid HTTP API. Status: {response.StatusCode}, Error: {errorResponse}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send email to {toEmail} via SendGrid HTTP API.");
        }
    }
}
