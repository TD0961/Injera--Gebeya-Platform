package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	SellerID    uint    `json:"seller_id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
	ImageURL    string  `json:"image_url"`
	Stock       int     `json:"stock"` // new
}
