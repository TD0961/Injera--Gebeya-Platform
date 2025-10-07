package main

import (
	"injera-gebeya-platform/Server/config"
	"injera-gebeya-platform/Server/handlers"
	"injera-gebeya-platform/Server/models"

	"injera-gebeya-platform/Server/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()

	// Allow frontend requests
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5174",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	}))

	// Connect to database
	config.ConnectDatabase()

	// Run migrations ONCE at startup
	config.DB.AutoMigrate(&models.User{})
	config.DB.AutoMigrate(&models.Product{})

	// Routes
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Server running!")
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	app.Post("/api/register", handlers.Register)

	app.Post("/api/login", handlers.Login)

	app.Post("/seller/products", middleware.RequireAuth, handlers.CreateProduct)

	// Start server

	app.Listen(":3000")
}
