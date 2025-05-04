package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI    string
	DatabaseName string
	JWTSecret   string
	ServerPort  string
	FrontendURL string // Added for CORS configuration
}

var AppConfig *Config

func LoadConfig() {
	// Load .env file from the root of the backend directory
	err := godotenv.Load(".env") // Adjusted path relative to main.go execution
	if err != nil {
		log.Println("No .env file found or error loading, using environment variables")
	}

	AppConfig = &Config{
		MongoURI:    getEnv("MONGODB_URI", ""),
		DatabaseName: getEnv("DATABASE_NAME", "mock_orbit"),
		JWTSecret:   getEnv("JWT_SECRET", "default_secret"),
		ServerPort:  getEnv("SERVER_PORT", "8080"),
		FrontendURL: getEnv("FRONTEND_URL", ""), // Frontend URL strictly from environment
	}

	if AppConfig.JWTSecret == "default_secret" {
		log.Println("Warning: JWT_SECRET is set to the default value. Please set a strong secret in your environment.")
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}