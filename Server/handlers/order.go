package handlers

import (
	"fmt"

	"injera-gebeya-platform/Server/config"
	"injera-gebeya-platform/Server/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// CreateOrderRequest represents the request for creating an order
type CreateOrderRequest struct {
	ShippingAddress string `json:"shipping_address" validate:"required"`
	ShippingCity    string `json:"shipping_city" validate:"required"`
	ShippingState   string `json:"shipping_state" validate:"required"`
	ShippingZip     string `json:"shipping_zip"`
	ShippingPhone   string `json:"shipping_phone" validate:"required"`
	Notes           string `json:"notes"`
	PaymentMethod   string `json:"payment_method" validate:"required,oneof=chapa stripe"`
	PaymentID       string `json:"payment_id"` // External payment ID
	Items           []struct {
		ProductID uint `json:"product_id" validate:"required"`
		Quantity  int  `json:"quantity" validate:"required,min=1"`
	} `json:"items" validate:"required,min=1"`
}

// CreateOrder creates a new order
func CreateOrder(c *fiber.Ctx) error {
	var req CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Invalid request body",
			"details": err.Error(),
		})
	}

	// Get user from context (set by auth middleware)
	user := c.Locals("user").(models.User)

	// Validate that all products exist and have sufficient stock
	var products []models.Product
	var productIDs []uint
	for _, item := range req.Items {
		productIDs = append(productIDs, item.ProductID)
	}

	if err := config.DB.Where("id IN ?", productIDs).Find(&products).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch products",
		})
	}

	// Create a map for quick product lookup
	productMap := make(map[uint]models.Product)
	for _, product := range products {
		productMap[product.ID] = product
	}

	// Validate stock and calculate totals
	var subtotal float64
	var orderItems []models.OrderItem

	for _, item := range req.Items {
		product, exists := productMap[item.ProductID]
		if !exists {
			return c.Status(400).JSON(fiber.Map{
				"error": fmt.Sprintf("Product with ID %d not found", item.ProductID),
			})
		}

		if product.Stock < item.Quantity {
			return c.Status(400).JSON(fiber.Map{
				"error": fmt.Sprintf("Insufficient stock for product %s. Available: %d, Requested: %d",
					product.Name, product.Stock, item.Quantity),
			})
		}

		itemTotal := product.Price * float64(item.Quantity)
		subtotal += itemTotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     product.Price,
			Total:     itemTotal,
		})
	}

	// Calculate shipping fee (free for now)
	shippingFee := 0.0
	total := subtotal + shippingFee

	// Create order
	order := models.Order{
		UserID:          user.ID,
		OrderNumber:     generateChapaOrderNumber(),
		Status:          models.OrderStatusPending,
		PaymentStatus:   models.PaymentStatusPaid, // Assuming payment is confirmed before order creation
		PaymentMethod:   req.PaymentMethod,
		PaymentID:       req.PaymentID,
		ShippingAddress: req.ShippingAddress,
		ShippingCity:    req.ShippingCity,
		ShippingState:   req.ShippingState,
		ShippingZip:     req.ShippingZip,
		ShippingPhone:   req.ShippingPhone,
		Notes:           req.Notes,
		Subtotal:        subtotal,
		ShippingFee:     shippingFee,
		Total:           total,
		OrderItems:      orderItems,
	}

	// Start transaction
	tx := config.DB.Begin()
	if tx.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to start transaction",
		})
	}

	// Create order
	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create order",
		})
	}

	// Update product stock
	for _, item := range orderItems {
		if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
			Update("stock", gorm.Expr("stock - ?", item.Quantity)).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to update product stock",
			})
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to commit transaction",
		})
	}

	// Load order with relationships
	if err := config.DB.Preload("User").Preload("OrderItems.Product").First(&order, order.ID).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to load order details",
		})
	}

	fmt.Printf("✅ Order created: %s for user %s\n", order.OrderNumber, user.Email)

	return c.Status(201).JSON(fiber.Map{
		"message": "Order created successfully",
		"order":   order,
	})
}

// GetUserOrders gets all orders for the authenticated user
func GetUserOrders(c *fiber.Ctx) error {
	user := c.Locals("user").(models.User)

	var orders []models.Order
	if err := config.DB.Preload("OrderItems.Product").
		Where("user_id = ?", user.ID).
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch orders",
		})
	}

	return c.JSON(fiber.Map{
		"orders": orders,
	})
}

// GetOrder gets a specific order by ID
func GetOrder(c *fiber.Ctx) error {
	user := c.Locals("user").(models.User)
	orderID := c.Params("id")

	var order models.Order
	if err := config.DB.Preload("User").Preload("OrderItems.Product").
		Where("id = ? AND user_id = ?", orderID, user.ID).
		First(&order).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Order not found",
		})
	}

	return c.JSON(fiber.Map{
		"order": order,
	})
}

// GetOrderByTxRef gets a specific order by its payment tx_ref for the authenticated user
func GetOrderByTxRef(c *fiber.Ctx) error {
	user := c.Locals("user").(models.User)
	txRef := c.Params("tx_ref")

	if txRef == "" {
		return c.Status(400).JSON(fiber.Map{"error": "tx_ref is required"})
	}

	var order models.Order
	if err := config.DB.Preload("User").Preload("OrderItems.Product").
		Where("payment_id = ? AND user_id = ?", txRef, user.ID).
		First(&order).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Order not found"})
	}

	return c.JSON(fiber.Map{"order": order})
}

// UpdateOrderStatus updates the status of an order (for sellers)
func UpdateOrderStatus(c *fiber.Ctx) error {
	user := c.Locals("user").(models.User)
	orderID := c.Params("id")

	// Check if user is a seller
	if user.Role != "seller" {
		return c.Status(403).JSON(fiber.Map{
			"error": "Only sellers can update order status",
		})
	}

	var req struct {
		Status string `json:"status" validate:"required,oneof=pending confirmed processing shipped delivered cancelled"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var order models.Order
	if err := config.DB.Preload("OrderItems.Product").
		Where("id = ?", orderID).
		First(&order).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Order not found",
		})
	}

	// Validate status transition
	newStatus := models.OrderStatus(req.Status)
	if !isValidStatusTransition(order.Status, newStatus) {
		return c.Status(400).JSON(fiber.Map{
			"error": fmt.Sprintf("Invalid status transition from %s to %s", order.Status, newStatus),
		})
	}

	// Update order status
	order.Status = newStatus
	if err := config.DB.Save(&order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update order status",
		})
	}

	fmt.Printf("📦 Order %s status updated to %s by seller %s\n", order.OrderNumber, newStatus, user.Email)

	return c.JSON(fiber.Map{
		"message": "Order status updated successfully",
		"order":   order,
	})
}

// GetSellerOrders gets all orders for a seller
func GetSellerOrders(c *fiber.Ctx) error {
	user := c.Locals("user").(models.User)

	// Check if user is a seller
	if user.Role != "seller" {
		return c.Status(403).JSON(fiber.Map{
			"error": "Only sellers can view seller orders",
		})
	}

	// Get orders that contain products from this seller
	var orders []models.Order
	if err := config.DB.Preload("User").Preload("OrderItems.Product").
		Joins("JOIN order_items ON orders.id = order_items.order_id").
		Joins("JOIN products ON order_items.product_id = products.id").
		Where("products.seller_id = ?", user.ID).
		Group("orders.id").
		Order("orders.created_at DESC").
		Find(&orders).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch seller orders",
		})
	}

	return c.JSON(fiber.Map{
		"orders": orders,
	})
}

// isValidStatusTransition checks if a status transition is valid
func isValidStatusTransition(current, new models.OrderStatus) bool {
	validTransitions := map[models.OrderStatus][]models.OrderStatus{
		models.OrderStatusPending:    {models.OrderStatusConfirmed, models.OrderStatusCancelled},
		models.OrderStatusConfirmed:  {models.OrderStatusProcessing, models.OrderStatusCancelled},
		models.OrderStatusProcessing: {models.OrderStatusShipped, models.OrderStatusCancelled},
		models.OrderStatusShipped:    {models.OrderStatusDelivered},
		models.OrderStatusDelivered:  {}, // Final state
		models.OrderStatusCancelled:  {}, // Final state
	}

	allowed, exists := validTransitions[current]
	if !exists {
		return false
	}

	for _, status := range allowed {
		if status == new {
			return true
		}
	}
	return false
}
