package middleware

import (
	"fmt"
	"injera-gebeya-platform/Server/config"
	"injera-gebeya-platform/Server/models"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func RequireAuth(c *fiber.Ctx) error {
	tokenStr := c.Cookies("token")
	if tokenStr == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Missing token"})
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "supersecret"
	}

	// Parse and validate token
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid claims"})
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid user id in token"})
	}

	var user models.User
	if err := config.DB.First(&user, uint(userIDFloat)).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "User not found"})
	}

	// Check if email is verified for protected operations
	// Allow access to verification endpoints without email verification
	path := c.Path()
	isVerificationEndpoint := path == "/api/verify-email" ||
		path == "/api/resend-verification" ||
		path == "/api/verification-info" ||
		path == "/api/verification-status"

	if !user.EmailVerified && !isVerificationEndpoint {
		return c.Status(403).JSON(fiber.Map{
			"error":                "Please verify your email before accessing this resource",
			"email":                user.Email,
			"requiresVerification": true,
		})
	}

	c.Locals("user_id", uint(userIDFloat))
	c.Locals("role", user.Role)
	c.Locals("user", user) // ✅ Attach full user object

	return c.Next()
}
