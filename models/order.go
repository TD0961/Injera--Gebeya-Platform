package models

import (
	"time"

	"gorm.io/gorm"
)

// OrderStatus represents the status of an order
type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusConfirmed OrderStatus = "confirmed"
	OrderStatusShipped   OrderStatus = "shipped"
	OrderStatusDelivered OrderStatus = "delivered"
	OrderStatusCancelled OrderStatus = "cancelled"
)

// PaymentStatus represents the payment status
type PaymentStatus string

const (
	PaymentStatusPending  PaymentStatus = "pending"
	PaymentStatusPaid     PaymentStatus = "paid"
	PaymentStatusFailed   PaymentStatus = "failed"
	PaymentStatusRefunded PaymentStatus = "refunded"
)

// Order represents an order in the system
type Order struct {
	ID            uint          `json:"id" gorm:"primaryKey"`
	OrderNumber   string        `json:"order_number" gorm:"uniqueIndex;not null"`
	UserID        uint          `json:"user_id" gorm:"not null"`
	User          User          `json:"user" gorm:"foreignKey:UserID"`
	Status        OrderStatus   `json:"status" gorm:"default:'pending'"`
	PaymentStatus PaymentStatus `json:"payment_status" gorm:"default:'pending'"`
	PaymentMethod string        `json:"payment_method"` // "chapa" or "stripe"
	PaymentID     string        `json:"payment_id"`     // External payment ID

	// Shipping Information
	ShippingAddress string `json:"shipping_address" gorm:"not null"`
	ShippingCity    string `json:"shipping_city" gorm:"not null"`
	ShippingState   string `json:"shipping_state" gorm:"not null"`
	ShippingZip     string `json:"shipping_zip"`
	ShippingPhone   string `json:"shipping_phone" gorm:"not null"`
	Notes           string `json:"notes"`

	// Pricing
	Subtotal    float64 `json:"subtotal" gorm:"not null"`
	ShippingFee float64 `json:"shipping_fee" gorm:"default:0"`
	Total       float64 `json:"total" gorm:"not null"`

	// Timestamps
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Relationships
	OrderItems []OrderItem `json:"order_items" gorm:"foreignKey:OrderID"`
}

// OrderItem represents an item within an order
type OrderItem struct {
	ID        uint    `json:"id" gorm:"primaryKey"`
	OrderID   uint    `json:"order_id" gorm:"not null"`
	Order     Order   `json:"order" gorm:"foreignKey:OrderID"`
	ProductID uint    `json:"product_id" gorm:"not null"`
	Product   Product `json:"product" gorm:"foreignKey:ProductID"`
	Quantity  int     `json:"quantity" gorm:"not null"`
	Price     float64 `json:"price" gorm:"not null"` // Price at time of order
	Total     float64 `json:"total" gorm:"not null"` // Quantity * Price

	// Timestamps
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

// BeforeCreate hook to generate order number
func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.OrderNumber == "" {
		o.OrderNumber = generateOrderNumber()
	}
	return nil
}

// generateOrderNumber generates a unique order number
func generateOrderNumber() string {
	// Format: INJ-YYYYMMDD-HHMMSS-XXXX
	// Example: INJ-20241220-143052-0001
	now := time.Now()
	timestamp := now.Format("20060102-150405")
	return "INJ-" + timestamp + "-0001" // In production, you'd increment the last part
}

// GetTotalItems returns the total number of items in the order
func (o *Order) GetTotalItems() int {
	total := 0
	for _, item := range o.OrderItems {
		total += item.Quantity
	}
	return total
}

// CanBeCancelled returns true if the order can be cancelled
func (o *Order) CanBeCancelled() bool {
	return o.Status == OrderStatusPending || o.Status == OrderStatusConfirmed
}

// CanBeShipped returns true if the order can be shipped
func (o *Order) CanBeShipped() bool {
	return o.Status == OrderStatusConfirmed
}

// CanBeDelivered returns true if the order can be marked as delivered
func (o *Order) CanBeDelivered() bool {
	return o.Status == OrderStatusShipped
}
