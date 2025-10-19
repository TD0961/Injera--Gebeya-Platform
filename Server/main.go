package main

import (
	"fmt"
	"injera-gebeya-platform/Server/config"
	"injera-gebeya-platform/Server/handlers"
	"injera-gebeya-platform/Server/middleware"
	"injera-gebeya-platform/Server/models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	fmt.Println("🚀 Starting Injera Gebeya Platform Server...")
	
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5174",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowCredentials: true,
	}))

	fmt.Println("🔗 Connecting to database...")
	config.ConnectDatabase()
	
	fmt.Println("📊 Running database migrations...")
	config.DB.AutoMigrate(&models.User{}, &models.Product{}) // &models.Order{}, &models.OrderItem{} - commented out for now
	fmt.Println("✅ Database migrations completed!")

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Server running!")
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	app.Post("/api/register", handlers.Register)
	app.Post("/api/login", handlers.Login)
	app.Post("/api/logout", handlers.Logout)

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

	// Order routes (commented out for now)
	// app.Post("/api/orders", middleware.RequireAuth, handlers.CreateOrder)
	// app.Get("/api/orders", middleware.RequireAuth, handlers.GetUserOrders)
	// app.Get("/api/orders/:id", middleware.RequireAuth, handlers.GetOrder)
	// app.Put("/api/orders/:id/status", middleware.RequireAuth, handlers.UpdateOrderStatus)
	// app.Get("/api/seller/orders", middleware.RequireAuth, handlers.GetSellerOrders)

	// Payment routes (commented out for now)
	// app.Post("/api/create-payment-intent", middleware.RequireAuth, handlers.CreateStripePaymentIntent)
	// app.Post("/api/create-chapa-payment", middleware.RequireAuth, handlers.CreateChapaPayment)
	// app.Post("/api/chapa/callback", handlers.ChapaCallback)

	app.Get("/products", handlers.GetPublicProducts)

	fmt.Println("🌐 Server starting on port 3000...")
	fmt.Println("📡 Available endpoints:")
	fmt.Println("   GET  / - Server status")
	fmt.Println("   GET  /health - Health check")
	fmt.Println("   POST /api/register - User registration")
	fmt.Println("   POST /api/login - User login")
	fmt.Println("   GET  /products - Get products")
	
	err := app.Listen(":3000")
	if err != nil {
		fmt.Printf("❌ Server failed to start: %v\n", err)
	}
}
