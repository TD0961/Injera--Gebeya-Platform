package handlers

import (
	"os"
	"time"

	"injera-gebeya-platform/Server/config"
	"injera-gebeya-platform/Server/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(c *fiber.Ctx) error {
	var input LoginInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid email or password"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid email or password"})
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "supersecret"
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secret))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not login"})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    signedToken,
		Expires:  time.Now().Add(72 * time.Hour),
		HTTPOnly: true,
		Secure:   false, // true in production
		SameSite: "Lax",
		Path:     "/",
	})

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"user": fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}
