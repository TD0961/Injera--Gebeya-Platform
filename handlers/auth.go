package handlers

import (
	"injera-gebeya-platform/config"
	"injera-gebeya-platform/models"
	"injera-gebeya-platform/services"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Address  string `json:"address"`
	Role     string `json:"role"`     // "buyer" or "seller"
	ShopName string `json:"shopName"` // Only for sellers
}

func Register(c *fiber.Ctx) error {
	var input RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), 12)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not hash password"})
	}

	// Generate verification code
	emailService := services.NewEmailService()
	code, err := emailService.GenerateVerificationCode()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate verification code"})
	}

	// Set token expiry (24 hours)
	expiry := time.Now().Add(24 * time.Hour)

	// Check if user already exists
	var existingUser models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"error": "Email already exists"})
	}

	// Check if pending registration already exists
	var existingPending models.PendingRegistration
	if err := config.DB.Where("email = ?", input.Email).First(&existingPending).Error; err == nil {
		// Update existing pending registration
		existingPending.Name = input.Name
		existingPending.Password = string(hashed)
		existingPending.Address = input.Address
		existingPending.Role = input.Role
		existingPending.ShopName = input.ShopName
		existingPending.VerificationToken = code
		existingPending.VerificationExpiry = &expiry

		if err := config.DB.Save(&existingPending).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to update pending registration"})
		}
	} else {
		// Create new pending registration
		pendingReg := models.PendingRegistration{
			Name:               input.Name,
			Email:              input.Email,
			Password:           string(hashed),
			Address:            input.Address,
			Role:               input.Role,
			ShopName:           input.ShopName,
			VerificationToken:  code,
			VerificationExpiry: &expiry,
		}

		if err := config.DB.Create(&pendingReg).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create pending registration"})
		}
	}

	// Send verification email
	emailSent := false
	if emailService.IsEmailConfigured() {
		go func() {
			emailService.SendVerificationEmail(input.Email, input.Name, code)
		}()
		emailSent = true
	}

	response := fiber.Map{
		"message":              "Registration successful! Please verify your account.",
		"email":                input.Email,
		"requiresVerification": true,
	}

	// Include verification token in development mode when email is not configured
	if !emailSent {
		response["verificationCode"] = code
		response["verificationURL"] = os.Getenv("FRONTEND_URL") + "/verify-email"
		response["message"] = "Registration successful! Email service not configured. Use the verification URL below."
	}

	return c.Status(201).JSON(response)
}

// Logout handles user logout
func Logout(c *fiber.Ctx) error {
	// Clear the authentication cookie
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour), // Set to past time to delete
		HTTPOnly: true,
		Secure:   false, // true in production
		SameSite: "Lax",
		Path:     "/",
	})

	return c.JSON(fiber.Map{"message": "Logout successful"})
}
