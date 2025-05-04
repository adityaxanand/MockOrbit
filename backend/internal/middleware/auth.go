package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"mock-orbit/backend/internal/config"
	"mock-orbit/backend/internal/database"
	"mock-orbit/backend/internal/models"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader { // No "Bearer " prefix
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the alg is what you expect:
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.NewValidationError("unexpected signing method", jwt.ValidationErrorSignatureInvalid)
			}
			return []byte(config.AppConfig.JWTSecret), nil
		})

		if err != nil {
			log.Printf("Token parsing error: %v", err)
			status := http.StatusUnauthorized
			errMsg := "Invalid or expired token"
			if ve, ok := err.(*jwt.ValidationError); ok {
				if ve.Errors&jwt.ValidationErrorExpired != 0 {
					errMsg = "Token has expired"
				}
			}
			c.AbortWithStatusJSON(status, gin.H{"error": errMsg})
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			userIDStr, ok := claims["user_id"].(string)
			if !ok {
				log.Println("user_id claim missing or not a string")
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
				return
			}

			userID, err := primitive.ObjectIDFromHex(userIDStr)
			if err != nil {
				log.Printf("Invalid user ID format in token: %v", err)
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID in token"})
				return
			}

			// Optional: Fetch user from DB to ensure they still exist/aren't banned
			var user models.User
			userCollection := database.GetCollection("users")
			err = userCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
			if err != nil {
				log.Printf("User not found for token ID %s: %v", userIDStr, err)
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User associated with token not found"})
				return
			}

			// Set user information in the context
			c.Set("userID", userIDStr) // Store as string for easier use
			c.Set("userObjectID", userID) // Store ObjectID if needed
			c.Set("userRoles", user.AvailableRoles) // Store available roles

			log.Printf("Authenticated user: %s, Roles: %v", userIDStr, user.AvailableRoles)
			c.Next()
		} else {
			log.Println("Token claims invalid or token not valid")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		}
	}
}

// RoleMiddleware checks if the user has the required role(s).
// The active role is not directly enforced here, as the frontend controls UI.
// This checks if the user *can* perform actions related to the required role.
func RoleMiddleware(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRolesVal, exists := c.Get("userRoles")
		if !exists {
			log.Println("RoleMiddleware: userRoles not found in context (AuthMiddleware likely missing or failed)")
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied. User roles not determined."})
			return
		}

		userRoles, ok := userRolesVal.([]string)
		if !ok {
			log.Println("RoleMiddleware: userRoles in context is not a []string")
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal server error processing user roles."})
			return
		}

		hasRequiredRole := false
		for _, reqRole := range requiredRoles {
			for _, userRole := range userRoles {
				if userRole == reqRole {
					hasRequiredRole = true
					break
				}
			}
			if hasRequiredRole {
				break
			}
		}

		if !hasRequiredRole {
			userID, _ := c.Get("userID")
			log.Printf("Access Denied: User %s lacks required roles (%v). Has roles: %v", userID, requiredRoles, userRoles)
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied. Insufficient privileges."})
			return
		}

		// Log which roles were required and that the user passed
		userID, _ := c.Get("userID")
		log.Printf("Access Granted: User %s has required roles (%v).", userID, requiredRoles)
		c.Next()
	}
}
