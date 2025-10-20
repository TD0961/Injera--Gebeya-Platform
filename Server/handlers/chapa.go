package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"injera-gebeya-platform/Server/config"
	"injera-gebeya-platform/Server/models"

	"github.com/gofiber/fiber/v2"
)

// StorePendingOrder stores a pending order before payment
func StorePendingOrder(c *fiber.Ctx) error {
	user := c.Locals("user").(models.User)
	var req PendingOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Generate a transaction reference
	txRef := fmt.Sprintf("injera_%d", time.Now().UnixNano())

	// Store pending order
	pendingOrder := &PendingOrder{
		UserID:          user.ID,
		ShippingAddress: req.ShippingAddress,
		ShippingCity:    req.ShippingCity,
		ShippingState:   req.ShippingState,
		ShippingZip:     req.ShippingZip,
		ShippingPhone:   req.ShippingPhone,
		Notes:           req.Notes,
		PaymentMethod:   req.PaymentMethod,
		Items:           req.Items,
		TotalAmount:     req.TotalAmount,
		CreatedAt:       time.Now(),
	}

	sessionStorage.StorePendingOrder(txRef, pendingOrder)

	return c.JSON(fiber.Map{
		"message": "Pending order stored successfully",
		"tx_ref":  txRef,
	})
}

// PendingOrderRequest represents the request for storing a pending order
type PendingOrderRequest struct {
	ShippingAddress string `json:"shipping_address"`
	ShippingCity    string `json:"shipping_city"`
	ShippingState   string `json:"shipping_state"`
	ShippingZip     string `json:"shipping_zip"`
	ShippingPhone   string `json:"shipping_phone"`
	Notes           string `json:"notes"`
	PaymentMethod   string `json:"payment_method"`
	Items           []struct {
		ProductID uint `json:"product_id"`
		Quantity  int  `json:"quantity"`
	} `json:"items"`
	TotalAmount float64 `json:"total_amount"`
}

// ChapaPaymentRequest represents the request for creating a Chapa payment
type ChapaPaymentRequest struct {
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	Email       string  `json:"email"`
	FirstName   string  `json:"first_name"`
	LastName    string  `json:"last_name"`
	PhoneNumber string  `json:"phone_number"`
	TxRef       string  `json:"tx_ref"`
}

// ChapaPaymentResponse represents the response from Chapa
type ChapaPaymentResponse struct {
	Message interface{} `json:"message"` // Can be string or object
	Status  string      `json:"status"`
	Data    struct {
		CheckoutURL string `json:"checkout_url"`
	} `json:"data"`
}

// ChapaErrorResponse represents error response from Chapa
type ChapaErrorResponse struct {
	Message map[string][]string `json:"message"`
	Status  string              `json:"status"`
	Data    interface{}         `json:"data"`
}

// CreateChapaPayment creates a real Chapa payment
func CreateChapaPayment(c *fiber.Ctx) error {
	var req ChapaPaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Invalid request body",
			"details": err.Error(),
		})
	}

	// Validate required fields for real Chapa payment
	if req.Amount <= 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Amount must be greater than 0",
		})
	}

	if req.Email == "" || req.FirstName == "" || req.LastName == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Email, first name, and last name are required",
		})
	}

	// Validate email format
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(req.Email) {
		return c.Status(400).JSON(fiber.Map{
			"error": "Please provide a valid email address",
		})
	}

	// Phone number is required for real Chapa payments
	if req.PhoneNumber == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Phone number is required for Chapa payment",
		})
	}

	// Validate phone number format (Ethiopian format)
	phoneRegex := regexp.MustCompile(`^(\+251|0)?9[0-9]{8}$`)
	if !phoneRegex.MatchString(req.PhoneNumber) {
		return c.Status(400).JSON(fiber.Map{
			"error": "Please provide a valid Ethiopian phone number (e.g., 0912345678 or +251912345678)",
		})
	}

	// Generate transaction reference if not provided
	if req.TxRef == "" {
		req.TxRef = fmt.Sprintf("injera_%d", time.Now().Unix())
	}

	// Set default currency if not provided
	if req.Currency == "" {
		req.Currency = "ETB"
	}

	// Use real Chapa API with test key (for testing, but real API structure)
	chapaSecretKey := "CHASECK_TEST-fnGvtP8fBikY8JetWMgLZX3f3aJ6n7Vi"
	chapaURL := "https://api.chapa.co/v1/transaction/initialize"

	fmt.Printf("🚀 Creating REAL Chapa payment for %s %s (%s)\n", req.FirstName, req.LastName, req.Email)
	fmt.Printf("📱 Phone: %s\n", req.PhoneNumber)
	fmt.Printf("💰 Amount: %.2f %s\n", req.Amount, req.Currency)
	fmt.Printf("🔗 Transaction Reference: %s\n", req.TxRef)

	// Prepare the request data for Chapa API (real format)
	requestData := map[string]interface{}{
		"amount":       req.Amount,
		"currency":     req.Currency,
		"email":        req.Email,
		"first_name":   req.FirstName,
		"last_name":    req.LastName,
		"phone_number": req.PhoneNumber,
		"tx_ref":       req.TxRef,
		// Server-to-server processing happens on callback_url; return_url sends user back to frontend with tx_ref
		"callback_url": fmt.Sprintf("http://localhost:3000/api/chapa/callback?tx_ref=%s", req.TxRef),
		"return_url":   fmt.Sprintf("http://localhost:5174/payment-success?tx_ref=%s", req.TxRef),
		"customization": map[string]string{
			"title":       "Injera Order",
			"description": "Payment for your delicious injera order",
		},
	}

	// Convert to JSON
	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to prepare payment data",
		})
	}

	fmt.Printf("📤 Sending to REAL Chapa API: %s\n", string(jsonData))

	// Create HTTP request to Chapa API
	httpReq, err := http.NewRequest("POST", chapaURL, strings.NewReader(string(jsonData)))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create request",
		})
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+chapaSecretKey)

	// Make the request to Chapa
	client := &http.Client{Timeout: 30 * time.Second} // Add timeout
	resp, err := client.Do(httpReq)
	if err != nil {
		fmt.Printf("❌ Failed to connect to Chapa: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to connect to Chapa API: " + err.Error(),
		})
	}
	defer resp.Body.Close()

	fmt.Printf("📡 Chapa API Status Code: %d\n", resp.StatusCode)

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to read Chapa response",
		})
	}

	fmt.Printf("📡 Raw Chapa API Response: %s\n", string(body))

	// Parse Chapa response
	var chapaResp ChapaPaymentResponse
	if err := json.Unmarshal(body, &chapaResp); err != nil {
		fmt.Printf("❌ Failed to parse Chapa response: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"error":        "Invalid response from Chapa API",
			"raw_response": string(body),
			"details":      err.Error(),
		})
	}

	// Check if Chapa returned an error
	if chapaResp.Status != "success" {
		fmt.Printf("❌ Chapa API returned error: %v\n", chapaResp.Message)

		// Try to parse as error response for better error messages
		var chapaError ChapaErrorResponse
		if err := json.Unmarshal(body, &chapaError); err == nil {
			// Format validation errors nicely
			var errorMessages []string
			for field, errors := range chapaError.Message {
				for _, errMsg := range errors {
					errorMessages = append(errorMessages, fmt.Sprintf("%s: %s", field, errMsg))
				}
			}

			return c.Status(400).JSON(fiber.Map{
				"error":             strings.Join(errorMessages, ", "),
				"raw_response":      string(body),
				"chapa_status":      chapaResp.Status,
				"validation_errors": chapaError.Message,
			})
		}

		// Fallback to generic error
		return c.Status(400).JSON(fiber.Map{
			"error":        chapaResp.Message,
			"raw_response": string(body),
			"chapa_status": chapaResp.Status,
		})
	}

	// Return successful response
	response := fiber.Map{
		"message": "Payment initialized successfully",
		"status":  "success",
		"data": fiber.Map{
			"checkout_url": chapaResp.Data.CheckoutURL,
		},
		"test_mode": true, // Still using test key
		"tx_ref":    req.TxRef,
		"amount":    req.Amount,
		"currency":  req.Currency,
	}

	fmt.Printf("✅ Chapa payment created successfully: %s\n", chapaResp.Data.CheckoutURL)

	return c.JSON(response)
}

// ChapaCallback handles the callback from Chapa after payment
func ChapaCallback(c *fiber.Ctx) error {
	// Extract values from multiple potential sources (query, form, JSON)
	txRef := c.Query("tx_ref")
	status := c.Query("status")

	if txRef == "" || status == "" {
		// Try form values (Chapa may send server-to-server callback as POST form)
		if txRef == "" {
			txRef = c.FormValue("tx_ref")
		}
		if status == "" {
			status = c.FormValue("status")
		}
	}

	if (txRef == "" || status == "") && c.Body() != nil && len(c.Body()) > 0 {
		var bodyMap map[string]interface{}
		if err := json.Unmarshal(c.Body(), &bodyMap); err == nil {
			if txRef == "" {
				if v, ok := bodyMap["tx_ref"].(string); ok {
					txRef = v
				}
				// Some gateways use reference or reference_id
				if txRef == "" {
					if v, ok := bodyMap["reference"].(string); ok {
						txRef = v
					}
				}
			}
			if status == "" {
				if v, ok := bodyMap["status"].(string); ok {
					status = v
				}
			}
		}
	}

	fmt.Printf("🔔 Chapa callback received:\n")
	fmt.Printf("   Transaction Reference: %s\n", txRef)
	fmt.Printf("   Status: %s\n", status)
	if txRef == "" {
		// If we still don't have txRef, redirect back with failure to avoid blank page
		return c.Redirect("http://localhost:5174/payment-success?status=failed")
	}

	// If payment was successful, create the order from pending order
	if status == "success" {
		pendingOrder, exists := sessionStorage.GetPendingOrder(txRef)
		if exists {
			// Create the actual order
			order, err := createOrderFromPending(pendingOrder, txRef)
			if err != nil {
				fmt.Printf("❌ Error creating order: %v\n", err)
				return c.Redirect("http://localhost:5175/payment-success?tx_ref=" + txRef + "&status=error&error=" + err.Error())
			}

			// Clean up pending order
			sessionStorage.DeletePendingOrder(txRef)

			fmt.Printf("✅ Order created successfully: %s\n", order.OrderNumber)
			// Redirect with both order_id and tx_ref for robustness
			return c.Redirect("http://localhost:5174/payment-success?status=success&order_id=" + fmt.Sprintf("%d", order.ID) + "&tx_ref=" + txRef)
		} else {
			fmt.Printf("⚠️ No pending order found for tx_ref: %s\n", txRef)
			return c.Redirect("http://localhost:5174/payment-success?tx_ref=" + txRef + "&status=success")
		}
	}

	// If payment failed, clean up pending order
	if status == "failed" {
		sessionStorage.DeletePendingOrder(txRef)
		return c.Redirect("http://localhost:5174/payment-success?status=failed&tx_ref=" + txRef)
	}

	return c.JSON(fiber.Map{
		"message": "Callback received",
		"status":  status,
		"tx_ref":  txRef,
	})
}

// VerifyChapaPayment verifies a Chapa payment (for testing)
func VerifyChapaPayment(c *fiber.Ctx) error {
	txRef := c.Params("tx_ref")

	if txRef == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Transaction reference is required",
		})
	}

	// In test mode, simulate payment verification
	fmt.Printf("🔍 TEST MODE: Verifying payment for transaction: %s\n", txRef)

	// Mock verification response
	response := fiber.Map{
		"message":        "Payment verified successfully (TEST MODE)",
		"status":         "success",
		"tx_ref":         txRef,
		"payment_status": "completed",
		"amount":         100.00, // Mock amount
		"currency":       "ETB",
		"test_mode":      true,
	}

	return c.JSON(response)
}

// createOrderFromPending creates an order from a pending order
func createOrderFromPending(pendingOrder *PendingOrder, txRef string) (*models.Order, error) {
	// Start transaction
	tx := config.DB.Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("failed to start transaction: %v", tx.Error)
	}

	// Calculate subtotal
	var subtotal float64
	var orderItems []models.OrderItem

	for _, item := range pendingOrder.Items {
		var product models.Product
		if err := tx.First(&product, item.ProductID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("product not found: %v", err)
		}

		if product.Stock < item.Quantity {
			tx.Rollback()
			return nil, fmt.Errorf("insufficient stock for product %s", product.Name)
		}

		itemTotal := product.Price * float64(item.Quantity)
		subtotal += itemTotal

		orderItem := models.OrderItem{
			ProductID: product.ID,
			Quantity:  item.Quantity,
			Price:     product.Price,
		}
		orderItems = append(orderItems, orderItem)

		// Update product stock
		product.Stock -= item.Quantity
		if err := tx.Save(&product).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to update product stock: %v", err)
		}
	}

	// Create order
	order := models.Order{
		UserID:          pendingOrder.UserID,
		OrderNumber:     generateChapaOrderNumber(),
		Status:          models.OrderStatusPending,
		PaymentStatus:   models.PaymentStatusPaid,
		PaymentMethod:   pendingOrder.PaymentMethod,
		PaymentID:       txRef,
		ShippingAddress: pendingOrder.ShippingAddress,
		ShippingCity:    pendingOrder.ShippingCity,
		ShippingState:   pendingOrder.ShippingState,
		ShippingZip:     pendingOrder.ShippingZip,
		ShippingPhone:   pendingOrder.ShippingPhone,
		Notes:           pendingOrder.Notes,
		Subtotal:        subtotal,
		ShippingFee:     0,
		Total:           subtotal,
		OrderItems:      orderItems,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create order: %v", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	return &order, nil
}

// generateChapaOrderNumber generates a unique order number
func generateChapaOrderNumber() string {
	return fmt.Sprintf("INJ-%s-%04d", time.Now().Format("20060102-150405"), time.Now().UnixNano()%10000)
}

// ...
