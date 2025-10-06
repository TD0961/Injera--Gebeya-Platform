package main

import (
	"fmt"
	"injera-gebeya-platform/Server/config"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	// Connect to database and check if successful
	config.ConnectDatabase()

	app.Get("/", func(c *fiber.Ctx) error {
		if config.DB != nil {
			fmt.Println("✅ Database connection established successfully!")
			fmt.Println("🚀 Server listening at http://localhost:3000")
		}
		return c.SendString("Server running!")
	})

	app.Listen(":3000")
}
