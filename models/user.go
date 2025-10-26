package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name               string     `json:"name"`
	Email              string     `json:"email" gorm:"unique"`
	Password           string     `json:"-"`
	Address            string     `json:"address"`
	Role               string     `json:"role"`               // "buyer" or "seller"
	ShopName           string     `json:"shopName,omitempty"` // Only for sellers
	EmailVerified      bool       `json:"emailVerified" gorm:"default:false"`
	VerificationToken  string     `json:"-" gorm:"unique"`
	VerificationExpiry *time.Time `json:"-"`
}
