package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

// SecurityMiddleware applies security headers and rate limiting
func SecurityMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Apply security headers
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("X-XSS-Protection", "1; mode=block")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		return c.Next()
	}
}

// RateLimiter creates a rate limiter for API endpoints
func RateLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        100,             // Maximum 100 requests
		Expiration: 1 * time.Minute, // Per minute
		KeyGenerator: func(c *fiber.Ctx) string {
			// Use user ID if authenticated, otherwise IP
			if userID := c.Locals("user_id"); userID != nil {
				return c.IP() + ":" + string(rune(userID.(uint)))
			}
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{
				"error": "Too many requests. Please try again later.",
			})
		},
	})
}

// StrictRateLimiter for sensitive endpoints like login/register
func StrictRateLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        5,                // Maximum 5 requests
		Expiration: 15 * time.Minute, // Per 15 minutes
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{
				"error": "Too many attempts. Please try again in 15 minutes.",
			})
		},
	})
}

// OrderRateLimiter for order-related endpoints
func OrderRateLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        20,              // Maximum 20 requests
		Expiration: 1 * time.Minute, // Per minute
		KeyGenerator: func(c *fiber.Ctx) string {
			if userID := c.Locals("user_id"); userID != nil {
				return c.IP() + ":" + string(rune(userID.(uint)))
			}
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{
				"error": "Too many order requests. Please slow down.",
			})
		},
	})
}

// HelmetMiddleware applies security headers
func HelmetMiddleware() fiber.Handler {
	return helmet.New(helmet.Config{
		XSSProtection:             "1; mode=block",
		ContentTypeNosniff:        "nosniff",
		XFrameOptions:             "DENY",
		ReferrerPolicy:            "strict-origin-when-cross-origin",
		CrossOriginEmbedderPolicy: "require-corp",
		CrossOriginOpenerPolicy:   "same-origin",
		CrossOriginResourcePolicy: "same-origin",
		OriginAgentCluster:        "?1",
	})
}

// RequestIDMiddleware adds unique request IDs
func RequestIDMiddleware() fiber.Handler {
	return requestid.New(requestid.Config{
		Header: "X-Request-ID",
		Generator: func() string {
			return time.Now().Format("20060102150405") + "-" + randomString(8)
		},
	})
}

// Helper function to generate random string
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
