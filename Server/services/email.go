package services

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"net/smtp"
	"os"
)

type EmailService struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
}

func NewEmailService() *EmailService {
	es := &EmailService{
		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUsername: getEnv("SMTP_USERNAME", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
	}
	es.FromEmail = getEnv("FROM_EMAIL", es.SMTPUsername)
	return es
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GenerateVerificationCode creates a secure 6-digit verification code
func (es *EmailService) GenerateVerificationCode() (string, error) {
	// Generate a random 6-digit number
	code := rand.Intn(900000) + 100000 // Ensures 6 digits (100000-999999)
	return fmt.Sprintf("%06d", code), nil
}

// SendVerificationEmail sends email verification to user
func (es *EmailService) SendVerificationEmail(email, name, code string) error {
	// Check if email service is configured
	if !es.IsEmailConfigured() {
		log.Printf("⚠️ Email service not configured. Verification code for %s: %s", email, code)
		return fmt.Errorf("email service not configured")
	}

	// Email template
	emailTemplate := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify Your Email - Injera Gebeya</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #8B4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🍽️ eGebeya</div>
            <h1>Welcome to eGebeya!</h1>
        </div>
        <div class="content">
            <h2>Hello {{.Name}}!</h2>
            <p>Thank you for registering with eGebeya - your gateway to authentic Ethiopian cuisine!</p>
            <p>To complete your registration and start enjoying our delicious injera and traditional dishes, please verify your email address using the code below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <div style="background: #f0f0f0; border: 2px dashed #8B4513; padding: 20px; border-radius: 10px; display: inline-block;">
                    <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                    <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #8B4513; letter-spacing: 3px; font-family: monospace;">{{.VerificationCode}}</p>
                </div>
            </div>
            
            <p><strong>This verification code will expire in 24 hours.</strong></p>
            
            <p>Go to <a href="{{.FrontendURL}}/verify-email" style="color: #8B4513; text-decoration: none; font-weight: bold;">eGebeya Verification Page</a> and enter this code to complete your registration.</p>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
                <li>🍽️ Browse our delicious injera and traditional dishes</li>
                <li>🛒 Add items to your cart and checkout securely</li>
                <li>📦 Track your orders in real-time</li>
                <li>💳 Make secure payments with Chapa or Stripe</li>
            </ul>
            
            <p>If you didn't create an account with eGebeya, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2024 eGebeya. All rights reserved.</p>
            <p>This email was sent to {{.Email}}. If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`

	// Parse template
	tmpl, err := template.New("verification").Parse(emailTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse email template: %v", err)
	}

	// Execute template
	var body bytes.Buffer
	data := struct {
		Name             string
		Email            string
		VerificationCode string
		FrontendURL      string
	}{
		Name:             name,
		Email:            email,
		VerificationCode: code,
		FrontendURL:      getEnv("FRONTEND_URL", "http://localhost:5174"),
	}

	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("failed to execute email template: %v", err)
	}

	// Email headers
	subject := "Verify Your Email - Injera Gebeya"
	headers := make(map[string]string)
	headers["From"] = es.FromEmail
	headers["To"] = email
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	// Build email message
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body.String()

	// Send email
	auth := smtp.PlainAuth("", es.SMTPUsername, es.SMTPPassword, es.SMTPHost)
	addr := es.SMTPHost + ":" + es.SMTPPort

	log.Printf("📧 Attempting to send email to: %s", email)
	log.Printf("📧 SMTP Server: %s", addr)
	log.Printf("📧 From: %s", es.FromEmail)

	if err := smtp.SendMail(addr, auth, es.FromEmail, []string{email}, []byte(message)); err != nil {
		log.Printf("❌ Failed to send email to %s: %v", email, err)
		return fmt.Errorf("failed to send email: %v", err)
	}

	log.Printf("✅ Email sent successfully to: %s", email)
	return nil
}

// SendWelcomeEmail sends welcome email after verification
func (es *EmailService) SendWelcomeEmail(email, name string) error {
	welcomeTemplate := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Injera Gebeya!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🍽️ eGebeya</div>
            <h1>Welcome Aboard!</h1>
        </div>
        <div class="content">
            <h2>Hello {{.Name}}!</h2>
            <p>🎉 Congratulations! Your email has been successfully verified.</p>
            <p>You're now ready to explore eGebeya and discover the authentic taste of Ethiopia!</p>
            
            <p><strong>What's next?</strong></p>
            <ul>
                <li>🍽️ Browse our delicious injera and traditional dishes</li>
                <li>🛒 Add items to your cart and checkout securely</li>
                <li>📦 Track your orders in real-time</li>
                <li>💳 Make secure payments with Chapa or Stripe</li>
            </ul>
            
            <p>Start your culinary journey now: <a href="{{.FrontendURL}}/products">Browse Products</a></p>
        </div>
        <div class="footer">
            <p>© 2024 eGebeya. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`

	tmpl, err := template.New("welcome").Parse(welcomeTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse welcome template: %v", err)
	}

	var body bytes.Buffer
	data := struct {
		Name string
	}{
		Name: name,
	}

	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("failed to execute welcome template: %v", err)
	}

	subject := "Welcome to Injera Gebeya!"
	headers := make(map[string]string)
	headers["From"] = es.FromEmail
	headers["To"] = email
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body.String()

	auth := smtp.PlainAuth("", es.SMTPUsername, es.SMTPPassword, es.SMTPHost)
	addr := es.SMTPHost + ":" + es.SMTPPort

	return smtp.SendMail(addr, auth, es.FromEmail, []string{email}, []byte(message))
}

// IsEmailConfigured checks if email service is properly configured
func (es *EmailService) IsEmailConfigured() bool {
	return es.SMTPUsername != "" && es.SMTPPassword != ""
}
