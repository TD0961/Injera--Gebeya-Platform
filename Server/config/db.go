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
		password = "postgres"
	}

	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "egebeya"
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
		// Try to create database if it doesn't exist
		if dbname != "postgres" {
			fmt.Printf("⚠️ Database '%s' not found, attempting to create it...\n", dbname)
			// Connect to default postgres database first
			defaultDSN := fmt.Sprintf(
				"host=%s user=%s password=%s dbname=postgres port=%s sslmode=disable",
				host, user, password, port,
			)
			defaultDB, defaultErr := gorm.Open(postgres.Open(defaultDSN), &gorm.Config{})
			if defaultErr != nil {
				fmt.Printf("❌ Failed to connect to PostgreSQL: %v\n", defaultErr)
				panic(defaultErr)
			}
			// Create the database
			sqlDB, _ := defaultDB.DB()
			_, createDBErr := sqlDB.Exec(fmt.Sprintf("CREATE DATABASE %s", dbname))
			if createDBErr != nil {
				// Database might already exist or connection failed
				fmt.Printf("⚠️ Could not create database (might already exist): %v\n", createDBErr)
				fmt.Printf("❌ Failed to connect to database: %v\n", err)
				panic(err)
			}
			sqlDB.Close()
			fmt.Printf("✅ Database '%s' created! Retrying connection...\n", dbname)
			// Retry connection to the new database
			database, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
			if err != nil {
				fmt.Printf("❌ Failed to connect to database after creation: %v\n", err)
				panic(err)
			}
		} else {
			fmt.Printf("❌ Failed to connect to database: %v\n", err)
			fmt.Println("💡 Make sure PostgreSQL is running and the database exists")
			panic(err)
		}
	}
	fmt.Println("✅ Connected to PostgreSQL database!")
	DB = database
}
