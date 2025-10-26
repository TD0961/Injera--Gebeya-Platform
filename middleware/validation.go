package middleware

import (
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// SanitizeInput sanitizes user input to prevent XSS and injection attacks
func SanitizeInput(c *fiber.Ctx) error {
	// Sanitize path parameters
	params := c.AllParams()
	for key, value := range params {
		c.Params(key, sanitizeString(value))
	}

	return c.Next()
}

// sanitizeString removes potentially dangerous characters
func sanitizeString(input string) string {
	// Remove HTML tags
	htmlRegex := regexp.MustCompile(`<[^>]*>`)
	input = htmlRegex.ReplaceAllString(input, "")

	// Remove script tags and javascript
	scriptRegex := regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`)
	input = scriptRegex.ReplaceAllString(input, "")

	// Remove SQL injection patterns
	sqlRegex := regexp.MustCompile(`(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute)`)
	input = sqlRegex.ReplaceAllString(input, "")

	// Trim whitespace
	input = strings.TrimSpace(input)

	return input
}

// ValidateOrderInput validates order creation input
func ValidateOrderInput(c *fiber.Ctx) error {
	var req struct {
		ShippingAddress string `json:"shipping_address"`
		ShippingCity    string `json:"shipping_city"`
		ShippingState   string `json:"shipping_state"`
		ShippingZip     string `json:"shipping_zip"`
		ShippingPhone   string `json:"shipping_phone"`
		Notes           string `json:"notes"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if strings.TrimSpace(req.ShippingAddress) == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Shipping address is required",
		})
	}

	if strings.TrimSpace(req.ShippingCity) == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Shipping city is required",
		})
	}

	if strings.TrimSpace(req.ShippingState) == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Shipping state is required",
		})
	}

	if strings.TrimSpace(req.ShippingPhone) == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Shipping phone is required",
		})
	}

	// Validate phone number format
	phoneRegex := regexp.MustCompile(`^[\+]?[0-9\s\-\(\)]{10,15}$`)
	if !phoneRegex.MatchString(req.ShippingPhone) {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid phone number format",
		})
	}

	// Validate address length
	if len(req.ShippingAddress) > 500 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Shipping address too long (max 500 characters)",
		})
	}

	// Validate notes length
	if len(req.Notes) > 1000 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Notes too long (max 1000 characters)",
		})
	}

	// Sanitize inputs
	req.ShippingAddress = sanitizeString(req.ShippingAddress)
	req.ShippingCity = sanitizeString(req.ShippingCity)
	req.ShippingState = sanitizeString(req.ShippingState)
	req.ShippingZip = sanitizeString(req.ShippingZip)
	req.ShippingPhone = sanitizeString(req.ShippingPhone)
	req.Notes = sanitizeString(req.Notes)

	// Store sanitized data in context
	c.Locals("sanitized_order", req)

	return c.Next()
}

// ValidateStatusUpdate validates order status update input
func ValidateStatusUpdate(c *fiber.Ctx) error {
	var req struct {
		Status string `json:"status"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate status
	validStatuses := []string{"pending", "confirmed", "shipped", "delivered", "cancelled"}
	valid := false
	for _, status := range validStatuses {
		if req.Status == status {
			valid = true
			break
		}
	}

	if !valid {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid status. Must be one of: pending, confirmed, shipped, delivered, cancelled",
		})
	}

	// Sanitize status
	req.Status = sanitizeString(req.Status)
	c.Locals("sanitized_status", req.Status)

	return c.Next()
}
