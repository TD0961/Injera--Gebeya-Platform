package handlers

import (
	"injera-gebeya-platform/Server/config"
	"injera-gebeya-platform/Server/models"

	"github.com/gofiber/fiber/v2"
)

type ProductInput struct {
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
	ImageURL    string  `json:"image_url"`
}

func CreateProduct(c *fiber.Ctx) error {
	// Extract seller_id from JWT (middleware will set c.Locals)
	sellerID, ok := c.Locals("user_id").(uint)
	role, _ := c.Locals("role").(string)
	if !ok || role != "seller" {
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var input ProductInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	product := models.Product{
		SellerID:    sellerID,
		Name:        input.Name,
		Price:       input.Price,
		Description: input.Description,
		ImageURL:    input.ImageURL,
	}

	if err := config.DB.Create(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create product"})
	}

	return c.Status(201).JSON(product)
}
