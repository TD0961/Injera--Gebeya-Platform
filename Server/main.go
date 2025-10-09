package main

import (
	"injera-gebeya-platform/Server/config"
	"injera-gebeya-platform/Server/handlers"
	"injera-gebeya-platform/Server/middleware"
	"injera-gebeya-platform/Server/models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5174",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowCredentials: true,
	}))

	config.ConnectDatabase()
	config.DB.AutoMigrate(&models.User{}, &models.Product{})

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Server running!")
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	app.Post("/api/register", handlers.Register)
	app.Post("/api/login", handlers.Login)

	// ✅ New route — no new file needed
	app.Get("/api/me", middleware.RequireAuth, func(c *fiber.Ctx) error {
		user := c.Locals("user").(models.User)
		return c.JSON(fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		})
	})

	// Seller routes
	app.Get("/seller/products", middleware.RequireAuth, handlers.GetSellerProducts)
	app.Post("/seller/products", middleware.RequireAuth, handlers.CreateProduct)
	app.Put("/seller/products/:id", middleware.RequireAuth, handlers.UpdateProduct)
	app.Delete("/seller/products/:id", middleware.RequireAuth, handlers.DeleteProduct)

	app.Get("/products", handlers.GetPublicProducts)

	app.Listen(":3000")
}
