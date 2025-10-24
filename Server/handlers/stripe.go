package handlers

import (
	"encoding/json"
	"log"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v75"
	"github.com/stripe/stripe-go/v75/paymentintent"
	"github.com/stripe/stripe-go/v75/webhook"
)

type CreatePaymentIntentRequest struct {
	Amount      int64  `json:"amount"`
	Currency    string `json:"currency"`
	Description string `json:"description"`
	OrderID     uint   `json:"orderId"`
}

type CreatePaymentIntentResponse struct {
	ClientSecret string `json:"clientSecret"`
	PaymentIntentID string `json:"paymentIntentId"`
}

func CreateStripePaymentIntent(c *fiber.Ctx) error {
	var req CreatePaymentIntentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate required fields
	if req.Amount <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Amount must be greater than 0"})
	}
	if req.Currency == "" {
		req.Currency = "etb" // Default to Ethiopian Birr
	}
	if req.Description == "" {
		req.Description = "eGebeya Order Payment"
	}

	// Get Stripe secret key from environment
	stripeKey := os.Getenv("STRIPE_SECRET_KEY")
	if stripeKey == "" {
		log.Println("⚠️ STRIPE_SECRET_KEY not found in environment variables")
		return c.Status(500).JSON(fiber.Map{
			"error": "Stripe configuration not found. Please contact support.",
		})
	}

	// Set Stripe API key
	stripe.Key = stripeKey

	log.Printf("🚀 Creating Stripe payment intent for amount: %d %s", req.Amount, req.Currency)
	log.Printf("📝 Description: %s", req.Description)

	// Create payment intent
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(req.Amount),
		Currency: stripe.String(req.Currency),
		Description: stripe.String(req.Description),
		Metadata: map[string]string{
			"order_id": strconv.Itoa(int(req.OrderID)),
		},
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		log.Printf("❌ Error creating payment intent: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create payment intent",
		})
	}

	log.Printf("✅ Payment intent created successfully: %s", pi.ID)

	response := CreatePaymentIntentResponse{
		ClientSecret: pi.ClientSecret,
		PaymentIntentID: pi.ID,
	}

	return c.JSON(response)
}

func StripeWebhook(c *fiber.Ctx) error {
	// Get the webhook signature
	signature := c.Get("Stripe-Signature")
	if signature == "" {
		log.Println("❌ Missing Stripe signature")
		return c.Status(400).JSON(fiber.Map{"error": "Missing signature"})
	}

	// Get the webhook secret from environment
	webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if webhookSecret == "" {
		log.Println("⚠️ STRIPE_WEBHOOK_SECRET not found in environment variables")
		return c.Status(500).JSON(fiber.Map{"error": "Webhook configuration not found"})
	}

	// Parse the webhook event
	payload := c.Body()
	event, err := webhook.ConstructEvent(payload, signature, webhookSecret)
	if err != nil {
		log.Printf("❌ Error parsing webhook: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid signature"})
	}

	// Handle the event
	switch event.Type {
	case "payment_intent.succeeded":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			log.Printf("❌ Error parsing payment_intent.succeeded: %v", err)
			return c.Status(400).JSON(fiber.Map{"error": "Error parsing event"})
		}
		
		log.Printf("✅ Payment succeeded: %s", paymentIntent.ID)
		
		// Update order status in database
		orderIDStr := paymentIntent.Metadata["order_id"]
		if orderIDStr != "" {
			orderID, err := strconv.Atoi(orderIDStr)
			if err == nil {
				// Update order status to confirmed
				// This would typically involve database operations
				log.Printf("📦 Order %d payment confirmed", orderID)
			}
		}

	case "payment_intent.payment_failed":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			log.Printf("❌ Error parsing payment_intent.payment_failed: %v", err)
			return c.Status(400).JSON(fiber.Map{"error": "Error parsing event"})
		}
		
		log.Printf("❌ Payment failed: %s", paymentIntent.ID)

	default:
		log.Printf("ℹ️ Unhandled event type: %s", event.Type)
	}

	return c.Status(200).JSON(fiber.Map{"status": "success"})
}
