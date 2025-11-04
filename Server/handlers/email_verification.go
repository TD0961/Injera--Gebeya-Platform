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
	// Use Unscoped() to find pending registrations including soft-deleted ones
	result := config.DB.Unscoped().Where("verification_token = ? AND verification_expiry > ?", req.Code, time.Now()).First(&pendingReg)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			log.Printf("⚠️ Verification code not found or expired: %s", req.Code)
			// Try to find by code without expiry check (for debugging)
			var debugPending models.PendingRegistration
			if debugErr := config.DB.Unscoped().Where("verification_token = ?", req.Code).First(&debugPending).Error; debugErr == nil {
				log.Printf("🔍 Found code but expired: email=%s, expiry=%v, now=%v", debugPending.Email, debugPending.VerificationExpiry, time.Now())
			}
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid or expired verification code",
			})
		}
		// Log error for monitoring
		log.Printf("❌ Error finding pending registration: %v", result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Internal server error",
		})
	}

	log.Printf("📋 Verification request: code=%s, found pendingReg ID=%d, email=%s, role=%s, shopName=%s", req.Code, pendingReg.ID, pendingReg.Email, pendingReg.Role, pendingReg.ShopName)

	log.Printf("✅ Found pending registration for email: %s, role: %s, shopName: %s", pendingReg.Email, pendingReg.Role, pendingReg.ShopName)

	// Use UPSERT (INSERT ... ON CONFLICT DO UPDATE) as the primary method
	log.Printf("🔄 Verifying user via UPSERT: email=%s, role=%s, shopName=%s", pendingReg.Email, pendingReg.Role, pendingReg.ShopName)

	sqlDB, sqlErr := config.DB.DB()
	if sqlErr != nil {
		log.Printf("❌ Failed to get SQL DB: %v", sqlErr)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Database connection error",
		})
	}

	// UPSERT: Insert or update user atomically
	var userID uint
	upsertQuery := `INSERT INTO users (name, email, password, address, role, shop_name, email_verified, verification_token, created_at, updated_at, deleted_at)
		VALUES ($1, $2, $3, $4, $5, $6, true, NULL, NOW(), NOW(), NULL)
		ON CONFLICT (email) DO UPDATE SET
			name = EXCLUDED.name,
			password = EXCLUDED.password,
			address = EXCLUDED.address,
			role = EXCLUDED.role,
			shop_name = EXCLUDED.shop_name,
			email_verified = true,
			verification_token = NULL,
			updated_at = NOW(),
			deleted_at = NULL
		RETURNING id`

	upsertErr := sqlDB.QueryRow(upsertQuery,
		pendingReg.Name, pendingReg.Email, pendingReg.Password,
		pendingReg.Address, pendingReg.Role, pendingReg.ShopName).Scan(&userID)

	if upsertErr == nil {
		config.DB.Delete(&pendingReg)
		log.Printf("✅ User verified via UPSERT: ID=%d", userID)
		emailService := services.NewEmailService()
		if emailService.IsEmailConfigured() {
			go func() {
				emailService.SendWelcomeEmail(pendingReg.Email, pendingReg.Name)
			}()
		}
		return c.JSON(fiber.Map{
			"message": "Email verified successfully! You can now log in.",
			"user": fiber.Map{
				"id":    userID,
				"name":  pendingReg.Name,
				"email": pendingReg.Email,
				"role":  pendingReg.Role,
			},
		})
	}

	// Fallback: Direct UPDATE if UPSERT fails
	log.Printf("⚠️ UPSERT failed: %v, trying direct UPDATE...", upsertErr)
	updateQuery := `UPDATE users SET 
		name = $1, password = $2, address = $3, role = $4, shop_name = $5, 
		email_verified = true, verification_token = NULL, updated_at = NOW(), deleted_at = NULL
		WHERE email = $6`
	updateResult, updateErr := sqlDB.Exec(updateQuery,
		pendingReg.Name, pendingReg.Password, pendingReg.Address,
		pendingReg.Role, pendingReg.ShopName, pendingReg.Email)

	if updateErr == nil {
		rowsAffected, _ := updateResult.RowsAffected()
		if rowsAffected > 0 {
			var updatedID uint
			sqlDB.QueryRow("SELECT id FROM users WHERE email = $1", pendingReg.Email).Scan(&updatedID)
			config.DB.Delete(&pendingReg)
			log.Printf("✅ User verified via UPDATE: ID=%d", updatedID)
			emailService := services.NewEmailService()
			if emailService.IsEmailConfigured() {
				go func() {
					emailService.SendWelcomeEmail(pendingReg.Email, pendingReg.Name)
				}()
			}
			return c.JSON(fiber.Map{
				"message": "Email verified successfully! You can now log in.",
				"user": fiber.Map{
					"id":    updatedID,
					"name":  pendingReg.Name,
					"email": pendingReg.Email,
					"role":  pendingReg.Role,
				},
			})
		}
		log.Printf("⚠️ UPDATE affected 0 rows")
	} else {
		log.Printf("⚠️ UPDATE failed: %v", updateErr)
	}

	// Final fallback: GORM Create (shouldn't reach here if UPSERT works)
	log.Printf("❌ UPDATE also failed: %v, trying GORM Create...", updateErr)
	user := models.User{
		Name:              pendingReg.Name,
		Email:             pendingReg.Email,
		Password:          pendingReg.Password,
		Address:           pendingReg.Address,
		Role:              pendingReg.Role,
		ShopName:          pendingReg.ShopName,
		EmailVerified:     true,
		VerificationToken: "", // Will be set to NULL by GORM if empty
	}

	if err := config.DB.Create(&user).Error; err != nil {
		log.Printf("❌ All methods failed: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to verify user account. Please try again.",
		})
	}

	config.DB.Delete(&pendingReg)
	log.Printf("✅ User created via GORM: ID=%d", user.ID)
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
