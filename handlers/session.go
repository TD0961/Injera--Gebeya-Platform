package handlers

import (
	"sync"
	"time"
)

// PendingOrder represents a pending order waiting for payment confirmation
type PendingOrder struct {
	UserID          uint   `json:"user_id"`
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
	TotalAmount float64   `json:"total_amount"`
	CreatedAt   time.Time `json:"created_at"`
}

// SessionStorage stores pending orders temporarily
type SessionStorage struct {
	mu     sync.RWMutex
	orders map[string]*PendingOrder
}

var sessionStorage = &SessionStorage{
	orders: make(map[string]*PendingOrder),
}

// StorePendingOrder stores a pending order with a transaction reference
func (s *SessionStorage) StorePendingOrder(txRef string, order *PendingOrder) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.orders[txRef] = order
}

// GetPendingOrder retrieves a pending order by transaction reference
func (s *SessionStorage) GetPendingOrder(txRef string) (*PendingOrder, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	order, exists := s.orders[txRef]
	return order, exists
}

// DeletePendingOrder removes a pending order after processing
func (s *SessionStorage) DeletePendingOrder(txRef string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.orders, txRef)
}

// CleanupExpiredOrders removes orders older than 1 hour
func (s *SessionStorage) CleanupExpiredOrders() {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	for txRef, order := range s.orders {
		if now.Sub(order.CreatedAt) > time.Hour {
			delete(s.orders, txRef)
		}
	}
}
