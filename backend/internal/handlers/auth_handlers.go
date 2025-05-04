package handlers

import (
	"context"
	"log"
	"net/http"
	// "strings"
	"time"

	"mock-orbit/backend/internal/config"
	"mock-orbit/backend/internal/database"
	"mock-orbit/backend/internal/models"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// --- User Registration Handler ---
func RegisterHandler(c *gin.Context) {
	userCollection := database.GetCollection("users")
	var input models.RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Registration input validation error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data", "details": err.Error()})
		return
	}

	count, err := userCollection.CountDocuments(context.Background(), bson.M{"email": input.Email})
	if err != nil {
		log.Printf("Error checking email existence: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check email availability"})
		return
	}
	if count > 0 {
		log.Printf("Registration attempt with existing email: %s", input.Email)
		c.JSON(http.StatusConflict, gin.H{"error": "Email address already registered"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process registration"})
		return
	}

	availableRoles := []string{input.Role}

	newUser := models.User{
		ID:             primitive.NewObjectID(),
		Name:           input.Name,
		Email:          input.Email,
		Password:       string(hashedPassword),
		Role:           input.Role,
		AvailableRoles: availableRoles,
		CreatedAt:      time.Now().UTC(),
		UpdatedAt:      time.Now().UTC(),
	}

	_, err = userCollection.InsertOne(context.Background(), newUser)
	if err != nil {
		log.Printf("Error inserting new user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	log.Printf("User registered successfully: %s, Role: %s", newUser.Email, newUser.Role)
	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

// --- User Login Handler ---
func LoginHandler(c *gin.Context) {
	userCollection := database.GetCollection("users")
	var input models.LoginInput
	var user models.User

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Login input validation error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data", "details": err.Error()})
		return
	}

	err := userCollection.FindOne(context.Background(), bson.M{"email": input.Email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("Login attempt failed for non-existent email: %s", input.Email)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		log.Printf("Error finding user during login: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process login"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		log.Printf("Login attempt failed for email %s due to incorrect password", input.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.Hex(),
		"email":   user.Email,
		"roles":   user.AvailableRoles,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
	})

	tokenString, err := token.SignedString([]byte(config.AppConfig.JWTSecret))
	if err != nil {
		log.Printf("Error signing token for user %s: %v", user.Email, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate login token"})
		return
	}

	log.Printf("User logged in successfully: %s", user.Email)

	userResponse := models.User{
		ID:                user.ID,
		Name:              user.Name,
		Email:             user.Email,
		Role:              user.Role,
		AvailableRoles:    user.AvailableRoles,
		ProfilePictureURL: user.ProfilePictureURL,
		CreatedAt:         user.CreatedAt,
		UpdatedAt:         user.UpdatedAt,
	}
	c.JSON(http.StatusOK, gin.H{"token": tokenString, "user": userResponse})
}

// --- Create Interview Handler ---
// This function has been removed to avoid duplication with interview_handlers.go.

// --- Get User Interviews Handler ---
// Removed duplicate GetUserInterviewsHandler to avoid redeclaration error.

// --- Helper: Determine Feedback Status ---
// This function is defined in interview_handlers.go to avoid duplication.

// --- Get Interview Details Handler ---
// This function has been removed to avoid duplication with interview_handlers.go.
