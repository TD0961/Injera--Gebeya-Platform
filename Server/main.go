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
	config.DB.AutoMigrate(&models.User{}, &models.Product{}, &models.Order{}, &models.OrderItem{})
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

	// Order routes
	app.Post("/api/orders", middleware.RequireAuth, handlers.CreateOrder)
	app.Get("/api/orders", middleware.RequireAuth, handlers.GetUserOrders)
	// Place the more specific tx_ref route BEFORE the :id route to avoid conflicts
	app.Get("/api/orders/tx/:tx_ref", middleware.RequireAuth, handlers.GetOrderByTxRef)
	app.Get("/api/orders/:id", middleware.RequireAuth, handlers.GetOrder)
	app.Put("/api/orders/:id/status", middleware.RequireAuth, handlers.UpdateOrderStatus)
	app.Get("/api/seller/orders", middleware.RequireAuth, handlers.GetSellerOrders)

	// Payment routes
	app.Post("/api/create-payment-intent", middleware.RequireAuth, handlers.CreateStripePaymentIntent)
	app.Post("/api/stripe/webhook", handlers.StripeWebhook)
	app.Post("/api/store-pending-order", middleware.RequireAuth, handlers.StorePendingOrder)
	app.Post("/api/create-chapa-payment", middleware.RequireAuth, handlers.CreateChapaPayment)
	app.Post("/api/chapa/callback", handlers.ChapaCallback)
	// Allow browser redirect callbacks as GET too (Chapa redirects users via GET)
	app.Get("/api/chapa/callback", handlers.ChapaCallback)
	app.Get("/api/chapa/verify/:tx_ref", handlers.VerifyChapaPayment)

	// Test endpoint for debugging Chapa API
	app.Get("/api/test-chapa", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message":   "Chapa test endpoint",
			"chapa_url": "https://api.chapa.co/v1/transaction/initialize",
			"test_key":  "CHASECK_TEST-fnGvtP8fBikY8JetWMgLZX3f3aJ6n7Vi",
		})
	})

	app.Get("/products", handlers.GetPublicProducts)

	fmt.Println("🌐 Server starting on port 3000...")
	fmt.Println("📡 Available endpoints:")
	fmt.Println("   GET  / - Server status")
	fmt.Println("   GET  /health - Health check")
	fmt.Println("   POST /api/register - User registration")
	fmt.Println("   POST /api/login - User login")
	fmt.Println("   GET  /products - Get products")
	fmt.Println("   POST /api/orders - Create order")
	fmt.Println("   GET  /api/orders - Get user orders")
	fmt.Println("   GET  /api/orders/:id - Get specific order")
	fmt.Println("   PUT  /api/orders/:id/status - Update order status")
	fmt.Println("   GET  /api/seller/orders - Get seller orders")
	fmt.Println("   POST /api/create-payment-intent - Create Stripe payment intent (TEST MODE)")
	fmt.Println("   POST /api/stripe/webhook - Stripe webhook handler")
	fmt.Println("   POST /api/create-chapa-payment - Create Chapa payment (TEST MODE)")
	fmt.Println("   POST /api/chapa/callback - Chapa payment callback")
	fmt.Println("   GET  /api/chapa/verify/:tx_ref - Verify Chapa payment")

	err := app.Listen(":3000")
	if err != nil {
		fmt.Printf("❌ Server failed to start: %v\n", err)
	}
}
