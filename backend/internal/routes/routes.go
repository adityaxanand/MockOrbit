package routes

import (
	"mock-orbit/backend/internal/handlers"
	"mock-orbit/backend/internal/middleware"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	// CORS Middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:9002, https://mockorbit.vercel.app"} // Allow frontend origin (adjust port if needed)
    config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
    config.AllowCredentials = true // If you need to handle cookies or auth headers
	router.Use(cors.New(config))

    // Simple ping endpoint
    router.GET("/ping", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"message": "pong"})
    })


	// API v1 Group
	apiV1 := router.Group("/api/v1")
	{
		// --- Authentication Routes ---
		auth := apiV1.Group("/auth")
		{
			auth.POST("/register", handlers.RegisterHandler)
			auth.POST("/login", handlers.LoginHandler)
			// Maybe add /refresh-token later
		}

		// --- User Routes (Protected) ---
		users := apiV1.Group("/users")
		users.Use(middleware.AuthMiddleware()) // Apply auth middleware to all user routes
		{
			// Get current user's profile
			// Note: No need for userId in path, get from token
			users.GET("/profile", handlers.GetUserProfileHandler)

			// Update current user's profile
			// Note: Use PATCH for partial updates
			users.PATCH("/profile", handlers.UpdateUserProfileHandler) // Changed from /:userId to /profile

			// Get list of peers (other users)
			users.GET("/peers", handlers.GetPeersHandler)

			// Get interviews for a specific user (using path param, but validated against token)
			users.GET("/:userId/interviews", handlers.GetUserInterviewsHandler)

			// Get performance stats for a specific user (interviewer)
			users.GET("/:userId/stats", middleware.RoleMiddleware("interviewer"), handlers.GetUserStatsHandler)
		}

		// --- Interview Routes (Protected) ---
		interviews := apiV1.Group("/interviews")
		interviews.Use(middleware.AuthMiddleware())
		{
			// Schedule a new interview
			interviews.POST("", handlers.CreateInterviewHandler) // Requires both roles potentially

			// Get details of a specific interview
			interviews.GET("/:interviewId", handlers.GetInterviewDetailsHandler)

			// TODO: Add routes for updating interview status (e.g., /:interviewId/start, /:interviewId/complete)
			// TODO: Add routes for feedback (e.g., POST /:interviewId/feedback, GET /:interviewId/feedback)
		}

        // --- General/Utility Routes (Protected) ---
        utils := apiV1.Group("") // Or specific group like /utils
        utils.Use(middleware.AuthMiddleware())
        {
            // Get list of topics
            utils.GET("/topics", handlers.GetTopicsHandler)
             // Get availability slots (placeholder)
            utils.GET("/availability", handlers.GetAvailabilityHandler)
        }
	}

    // WebSocket Route
    router.GET("/ws", handlers.WebsocketHandler)


	return router
}
