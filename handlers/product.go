package handlers

import (
	"injera-gebeya-platform/config"
	"injera-gebeya-platform/models"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// ProductInput includes Stock for inventory tracking
type ProductInput struct {
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
	ImageURL    string  `json:"image_url"`
	Stock       int     `json:"stock"`
}

// ✅ CreateProduct — Add a new product (for sellers)
func CreateProduct(c *fiber.Ctx) error {
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
		Name:        input.Name,
		Price:       input.Price,
		Description: input.Description,
		ImageURL:    input.ImageURL,
		Stock:       input.Stock,
		SellerID:    sellerID,
	}

	if err := config.DB.Create(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create product"})
	}

	return c.Status(201).JSON(product)
}

// ✅ GetSellerProducts — View only the seller's own products
func GetSellerProducts(c *fiber.Ctx) error {
	sellerID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var products []models.Product
	if err := config.DB.Where("seller_id = ?", sellerID).Find(&products).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not fetch products"})
	}
	return c.JSON(products)
}

// ✅ GetPublicProducts — View all public products
func GetPublicProducts(c *fiber.Ctx) error {
	var products []models.Product
	if err := config.DB.Find(&products).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not fetch products"})
	}
	return c.JSON(products)
}

// ✅ UpdateProduct — Update seller’s product
func UpdateProduct(c *fiber.Ctx) error {
	sellerID, ok := c.Locals("user_id").(uint)
	role, _ := c.Locals("role").(string)
	if !ok || role != "seller" {
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized"})
	}

	idParam := c.Params("id")
	id64, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid product id"})
	}

	var product models.Product
	if err := config.DB.First(&product, id64).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
	}

	if product.SellerID != sellerID {
		return c.Status(403).JSON(fiber.Map{"error": "Not allowed"})
	}

	var input ProductInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	product.Name = input.Name
	product.Price = input.Price
	product.Description = input.Description
	product.ImageURL = input.ImageURL
	product.Stock = input.Stock

	if err := config.DB.Save(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not update product"})
	}

	return c.JSON(product)
}

// ✅ DeleteProduct — Remove a product
func DeleteProduct(c *fiber.Ctx) error {
	sellerID, ok := c.Locals("user_id").(uint)
	role, _ := c.Locals("role").(string)
	if !ok || role != "seller" {
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized"})
	}

	idParam := c.Params("id")
	id64, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid product id"})
	}

	var product models.Product
	if err := config.DB.First(&product, id64).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}

	if product.SellerID != sellerID {
		return c.Status(403).JSON(fiber.Map{"error": "Not allowed"})
	}

	if err := config.DB.Delete(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not delete product"})
	}

	return c.JSON(fiber.Map{"success": true})
}
