package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name     string `json:"name"`
	Email    string `json:"email" gorm:"unique"`
	Password string `json:"-"`
	Address  string `json:"address"`
	Role     string `json:"role"`               // "buyer" or "seller"
	ShopName string `json:"shopName,omitempty"` // Only for sellers
}
