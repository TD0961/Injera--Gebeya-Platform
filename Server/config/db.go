package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	// Try to load .env file, but don't fail if it doesn't exist
	godotenv.Load("../.env")
	
	// Set default values if environment variables are not set
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "password"
	}
	
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "injera_gebeya"
	}
	
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}
	
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, password, dbname, port,
	)
	
	fmt.Printf("🔗 Attempting to connect to database: %s@%s:%s/%s\n", user, host, port, dbname)
	
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("❌ Failed to connect to database: %v\n", err)
		fmt.Println("💡 Make sure PostgreSQL is running and the database exists")
		fmt.Println("💡 You can create the database with: createdb injera_gebeya")
		panic(err)
	}
	fmt.Println("✅ Connected to PostgreSQL database!")
	DB = database
}
