package middleware

import (
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

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid claims"})
	}

	c.Locals("user_id", uint(claims["user_id"].(float64)))
	c.Locals("role", claims["role"].(string))
	return c.Next()
}
