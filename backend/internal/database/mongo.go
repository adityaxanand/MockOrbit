package database

import (
	"context"
	"log"
	"time"

	"mock-orbit/backend/internal/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var DB *mongo.Database

func ConnectDB() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(config.AppConfig.MongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Printf("Error connecting to MongoDB: %v", err)
		return err
	}

	// Ping the primary
	if err := client.Ping(ctx, nil); err != nil {
		log.Printf("Error pinging MongoDB: %v", err)
		return err
	}

	MongoClient = client
	DB = client.Database(config.AppConfig.DatabaseName)
	log.Println("Connected to MongoDB!")

	// Setup indexes (optional but recommended)
	SetupIndexes(ctx, DB)

	return nil
}

func DisconnectDB() {
	if MongoClient != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := MongoClient.Disconnect(ctx); err != nil {
			log.Printf("Error disconnecting from MongoDB: %v", err)
		} else {
			log.Println("Disconnected from MongoDB.")
		}
	}
}

func SetupIndexes(ctx context.Context, db *mongo.Database) {
	// Example: Create a unique index on the email field in the users collection
	userCollection := db.Collection("users")
	emailIndex := mongo.IndexModel{
		Keys:    map[string]interface{}{"email": 1},
		Options: options.Index().SetUnique(true),
	}
	_, err := userCollection.Indexes().CreateOne(ctx, emailIndex)
	if err != nil {
		log.Printf("Error creating user email index: %v", err)
	} else {
		log.Println("User email index created successfully.")
	}

	// Add other indexes as needed for interviews, etc.
	interviewCollection := db.Collection("interviews")
	scheduledTimeIndex := mongo.IndexModel{
		Keys: map[string]interface{}{"scheduled_time": -1}, // Sort descending for recent interviews
	}
	_, err = interviewCollection.Indexes().CreateOne(ctx, scheduledTimeIndex)
	if err != nil {
		log.Printf("Error creating interview scheduled_time index: %v", err)
	} else {
		log.Println("Interview scheduled_time index created successfully.")
	}

	participantIndex := mongo.IndexModel{
		Keys: map[string]interface{}{"interviewer_id": 1, "interviewee_id": 1},
	}
	_, err = interviewCollection.Indexes().CreateOne(ctx, participantIndex)
	if err != nil {
		log.Printf("Error creating interview participant index: %v", err)
	} else {
		log.Println("Interview participant index created successfully.")
	}
}

// Helper function to get a collection
func GetCollection(collectionName string) *mongo.Collection {
	if DB == nil {
		log.Fatal("Database not initialized")
	}
	return DB.Collection(collectionName)
}
