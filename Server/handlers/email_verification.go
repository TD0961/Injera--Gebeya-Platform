package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"injera-gebeya-platform/Server/config"
	"injera-gebeya-platform/Server/models"
	"injera-gebeya-platform/Server/services"
)

type EmailVerificationRequest struct {
	Code string `json:"code" validate:"required"`
}

type ResendVerificationRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// VerifyEmail handles email verification
func VerifyEmail(c *fiber.Ctx) error {
	var req EmailVerificationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Verification code is required",
		})
	}

	// Find pending registration by verification code
	var pendingReg models.PendingRegistration
	result := config.DB.Where("verification_token = ? AND verification_expiry > ?", req.Code, time.Now()).First(&pendingReg)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid or expired verification code",
			})
		}
		// Log error for monitoring
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Internal server error",
		})
	}

	// Create actual user from pending registration
	user := models.User{
		Name:          pendingReg.Name,
		Email:         pendingReg.Email,
		Password:      pendingReg.Password,
		Address:       pendingReg.Address,
		Role:          pendingReg.Role,
		ShopName:      pendingReg.ShopName,
		EmailVerified: true,
	}

	// Create the user in the database
	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user account",
		})
	}

	// Delete the pending registration
	config.DB.Delete(&pendingReg)

	// Send welcome email
	emailService := services.NewEmailService()
	if emailService.IsEmailConfigured() {
		go func() {
			emailService.SendWelcomeEmail(user.Email, user.Name)
		}()
	}

	return c.JSON(fiber.Map{
		"message": "Email verified successfully! You can now log in.",
		"user": fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// ResendVerificationEmail resends verification email
func ResendVerificationEmail(c *fiber.Ctx) error {
	var req ResendVerificationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Find pending registration by email
	var pendingReg models.PendingRegistration
	result := config.DB.Where("email = ?", req.Email).First(&pendingReg)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "No pending registration found for this email",
			})
		}
		log.Printf("Error finding pending registration by email: %v", result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Internal server error",
		})
	}

	// Generate new verification code
	emailService := services.NewEmailService()
	code, err := emailService.GenerateVerificationCode()
	if err != nil {
		log.Printf("Error generating verification code: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate verification code",
		})
	}

	// Update pending registration with new code
	expiry := time.Now().Add(24 * time.Hour) // 24 hours expiry
	pendingReg.VerificationToken = code
	pendingReg.VerificationExpiry = &expiry

	if err := config.DB.Save(&pendingReg).Error; err != nil {
		log.Printf("Error updating pending registration verification token: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update verification token",
		})
	}

	// Send verification email
	if emailService.IsEmailConfigured() {
		go func() {
			if err := emailService.SendVerificationEmail(pendingReg.Email, pendingReg.Name, code); err != nil {
				log.Printf("Failed to send verification email: %v", err)
			}
		}()
	} else {
		log.Printf("⚠️ Email service not configured. Verification code: %s", code)
	}

	log.Printf("📧 Verification email resent to: %s", pendingReg.Email)

	return c.JSON(fiber.Map{
		"message": "Verification email sent successfully",
	})
}

// CheckVerificationStatus checks if user's email is verified
func CheckVerificationStatus(c *fiber.Ctx) error {
	// Get user from context (set by auth middleware)
	user := c.Locals("user").(*models.User)

	return c.JSON(fiber.Map{
		"emailVerified": user.EmailVerified,
		"email":         user.Email,
	})
}

// GetVerificationInfo returns verification status for frontend
func GetVerificationInfo(c *fiber.Ctx) error {
	email := c.Query("email")
	if email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email is required",
		})
	}

	// First check if user exists and is verified
	var user models.User
	userResult := config.DB.Where("email = ?", email).First(&user)

	if userResult.Error == nil && user.EmailVerified {
		// User exists and is verified
		return c.JSON(fiber.Map{
			"emailVerified": true,
			"email":         user.Email,
		})
	}

	// Check for pending registration
	var pendingReg models.PendingRegistration
	pendingResult := config.DB.Where("email = ?", email).First(&pendingReg)

	if pendingResult.Error != nil {
		if pendingResult.Error == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "No registration found for this email",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Internal server error",
		})
	}

	response := fiber.Map{
		"emailVerified": false,
		"email":         pendingReg.Email,
	}

	// Add token expiry info
	if pendingReg.VerificationExpiry != nil {
		response["tokenExpiry"] = pendingReg.VerificationExpiry
		response["canResend"] = time.Now().Before(*pendingReg.VerificationExpiry)
	}

	return c.JSON(response)
}
