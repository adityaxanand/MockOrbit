package handlers

import (
	"context"
	"log"
	"net/http"
	"strings" // Import strings package
	"time"

	"mock-orbit/backend/internal/database"
	"mock-orbit/backend/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


// CreateInterviewHandler handles the creation of a new interview schedule.
func CreateInterviewHandler(c *gin.Context) {
	interviewCollection := database.GetCollection("interviews") // Get collection inside handler
	userCollection := database.GetCollection("users")           // Get collection inside handler
	var input models.CreateInterviewInput

	// Log raw request body for debugging potential binding issues
	// bodyBytes, _ := io.ReadAll(c.Request.Body)
	// log.Printf("Raw Schedule Request Body: %s", string(bodyBytes))
	// c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes)) // IMPORTANT: Restore the body for ShouldBindJSON

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Create interview input validation error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data", "details": err.Error()})
		return
	}
	// Log the bound input
	log.Printf("Parsed Schedule Input: %+v", input)


	// Validate ObjectIDs
	interviewerOID, err := primitive.ObjectIDFromHex(input.InterviewerID)
	if err != nil {
		log.Printf("Invalid interviewer ID format: %s, error: %v", input.InterviewerID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid interviewer ID format"})
		return
	}
	intervieweeOID, err := primitive.ObjectIDFromHex(input.IntervieweeID)
	if err != nil {
		log.Printf("Invalid interviewee ID format: %s, error: %v", input.IntervieweeID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid interviewee ID format"})
		return
	}
	log.Printf("Validated ObjectIDs: Interviewer=%s, Interviewee=%s", interviewerOID.Hex(), intervieweeOID.Hex())

	// Prevent scheduling with self
	if interviewerOID == intervieweeOID {
		log.Printf("Attempt to schedule interview with self: UserID %s", interviewerOID.Hex())
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot schedule an interview with yourself"})
		return
	}

	// Prevent scheduling in the past
	// Add a small buffer (e.g., 1 minute) to avoid issues with clock skew
	if input.ScheduledTime.Before(time.Now().Add(-1 * time.Minute)) {
		log.Printf("Attempt to schedule interview in the past: Time %s", input.ScheduledTime)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot schedule an interview in the past"})
		return
	}


	// Fetch participant details
	var interviewer models.User
	var interviewee models.User

	log.Printf("Fetching interviewer details for ID: %s", input.InterviewerID)
	err = userCollection.FindOne(context.Background(), bson.M{"_id": interviewerOID}).Decode(&interviewer)
	if err != nil {
		// Log the specific error and ID
		log.Printf("Error finding interviewer with ID %s: %v", input.InterviewerID, err)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Interviewer not found"})
		} else {
			// Indicate a server error for other DB issues
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve interviewer details", "details": err.Error()})
		}
		return
	}
	log.Printf("Successfully fetched interviewer: %s (%s)", interviewer.Name, interviewer.ID.Hex())


	log.Printf("Fetching interviewee details for ID: %s", input.IntervieweeID)
	err = userCollection.FindOne(context.Background(), bson.M{"_id": intervieweeOID}).Decode(&interviewee)
	if err != nil {
		// Log the specific error and ID
		log.Printf("Error finding interviewee with ID %s: %v", input.IntervieweeID, err)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Interviewee not found"})
		} else {
			// Indicate a server error for other DB issues
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve interviewee details", "details": err.Error()})
		}
		return
	}
	log.Printf("Successfully fetched interviewee: %s (%s)", interviewee.Name, interviewee.ID.Hex())


	// Ensure schedule time is in UTC
	scheduledTimeUTC := input.ScheduledTime.UTC()

	newInterview := models.Interview{
		ID:             primitive.NewObjectID(),
		InterviewerID:  interviewerOID,
		IntervieweeID:  intervieweeOID,
		InterviewerName: interviewer.Name, // Store names
		IntervieweeName: interviewee.Name,
		ScheduledTime: scheduledTimeUTC,
		Topic:          input.Topic,
		Status:         "scheduled", // Initial status
		CreatedAt:      time.Now().UTC(),
		UpdatedAt:      time.Now().UTC(),
	}

	// Log the data just before inserting
	log.Printf("Attempting to insert interview into collection '%s': %+v", interviewCollection.Name(), newInterview)

	// Insert the new interview document
	insertResult, err := interviewCollection.InsertOne(context.Background(), newInterview)
	if err != nil {
		// Log the detailed error for server-side debugging
		// CRITICAL: This log is essential for diagnosing the 500 error.
		log.Printf("CRITICAL: Error inserting new interview into database: %v. Data: %+v", err, newInterview)
		// Return a specific JSON error response to the client
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to schedule interview due to a server issue.", "details": err.Error()})
		return // Important: Stop execution after sending error response
	}

	// Log success and the inserted ID
	log.Printf("Interview scheduled successfully. Inserted ID: %v", insertResult.InsertedID)
	log.Printf("Details: Interviewer=%s (%s), Interviewee=%s (%s), Topic='%s', InterviewID=%s",
		interviewer.Name, interviewerOID.Hex(),
		interviewee.Name, intervieweeOID.Hex(),
		input.Topic, newInterview.ID.Hex())

	// Return the created interview object on success
	c.JSON(http.StatusCreated, newInterview)
}

// GetUserInterviewsHandler retrieves interviews for a specific user based on role and status.
func GetUserInterviewsHandler(c *gin.Context) {
	interviewCollection := database.GetCollection("interviews") // Get collection inside handler
	// userCollection := database.GetCollection("users")           // Get collection inside handler (Removed as not used directly)
	userIDStr := c.Param("userId") // Get user ID from path parameter
	// roleFilter := c.Query("role") // "interviewer" or "interviewee" - Used only for feedback status now
	statusFilter := c.Query("status") // e.g., "scheduled", "completed", "cancelled"

	userOID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Security Check: Ensure the requesting user is the one whose interviews are being fetched, or is an admin
	requestingUserID, _ := c.Get("userObjectID") // From AuthMiddleware
	if requestingUserID != userOID {
		// Basic check: prevent users from accessing others' interview lists easily
		// More robust checks might involve admin roles etc.
		log.Printf("Forbidden attempt: User %s trying to access interviews of user %s", requestingUserID.(primitive.ObjectID).Hex(), userIDStr)
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only access your own interviews"})
		return
	}

	filter := bson.M{}
	// Filter by the user's involvement
	filter["$or"] = []bson.M{
		{"interviewer_id": userOID},
		{"interviewee_id": userOID},
	}

	// Add status filtering if provided
	if statusFilter != "" {
		statuses := strings.Split(statusFilter, ",")
		validStatuses := []string{}
		for _, s := range statuses {
			trimmed := strings.TrimSpace(s)
			// Validate status values allowed by the filter
			if trimmed != "" && (trimmed == "scheduled" || trimmed == "completed" || trimmed == "cancelled" || trimmed == "in_progress") {
				validStatuses = append(validStatuses, trimmed)
			}
		}
		if len(validStatuses) > 0 {
			filter["status"] = bson.M{"$in": validStatuses}
		} else {
			// If status filter was provided but resulted in no valid statuses, return empty
			log.Printf("Invalid or empty status filter provided: %s for user %s", statusFilter, userIDStr)
			c.JSON(http.StatusOK, []models.InterviewResponse{}) // Return empty list
			return
		}
	}
	// Removed default status filter - fetch all matching user involvement if no status specified

	findOptions := options.Find()
	findOptions.SetSort(bson.D{{"scheduled_time", -1}}) // Sort by most recent first

	cursor, err := interviewCollection.Find(context.Background(), filter, findOptions)
	if err != nil {
		log.Printf("Error finding interviews for user %s with filter %v: %v", userIDStr, filter, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve interviews", "details": err.Error()})
		return
	}
	defer cursor.Close(context.Background())

	var interviews []models.Interview // Decode into the base Interview struct first
	if err = cursor.All(context.Background(), &interviews); err != nil {
		log.Printf("Error decoding interviews for user %s: %v", userIDStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process interview data", "details": err.Error()})
		return
	}

	// Transform to InterviewResponse with populated UserInfo
	responseInterviews := make([]models.InterviewResponse, len(interviews))
	for i, interview := range interviews {
		responseInterviews[i] = models.InterviewResponse{
			ID: interview.ID,
			Interviewer: &models.UserInfo{
				ID:   interview.InterviewerID,
				Name: interview.InterviewerName, // Use denormalized name
			},
			Interviewee: &models.UserInfo{
				ID:   interview.IntervieweeID,
				Name: interview.IntervieweeName, // Use denormalized name
			},
			ScheduledTime: interview.ScheduledTime,
			Topic:         interview.Topic,
			Status:        interview.Status,
			// Determine Feedback Status based on the user viewing their own list
			FeedbackStatus: determineFeedbackStatus(&interview, userOID),
		}
	}

	// If no interviews found, return empty list, not an error
	if responseInterviews == nil {
		responseInterviews = []models.InterviewResponse{}
	}

	log.Printf("Retrieved %d interviews for user %s (status filter: %s)", len(responseInterviews), userIDStr, statusFilter)
	c.JSON(http.StatusOK, responseInterviews)
}

// determineFeedbackStatus sets the feedback status string based on the interview and the viewing user's ID.
// NOTE: This is still placeholder logic as the feedback model/storage is not defined.
func determineFeedbackStatus(interview *models.Interview, viewingUserID primitive.ObjectID) string {
    if interview.Status != "completed" {
        return "N/A" // Feedback only relevant for completed interviews
    }

    // Placeholder: Replace with actual query to check feedback existence
    // Assume feedback collection has 'interview_id', 'provider_id', 'recipient_id'
    // feedbackCollection := database.GetCollection("feedback")
	// Example Check: hasInterviewerProvided := feedbackCollection.CountDocuments(ctx, bson.M{"interview_id": interview.ID, "provider_id": interview.InterviewerID}) > 0
    // Example Check: hasIntervieweeReceived := feedbackCollection.CountDocuments(ctx, bson.M{"interview_id": interview.ID, "recipient_id": interview.IntervieweeID}) > 0

    hasInterviewerProvided := false // MOCK: exists(interviewId: interview.ID, providerId: interview.InterviewerID)
    hasIntervieweeReceived := false // MOCK: exists(interviewId: interview.ID, recipientId: interview.IntervieweeID) - More accurately, feedback for the interviewee exists

	// Determine status based on the *viewing user's role in THIS interview*
    if viewingUserID == interview.IntervieweeID { // User is the interviewee
        if hasIntervieweeReceived {
            return "Received"
        } else if hasInterviewerProvided {
             // Interviewer provided feedback, but interviewee hasn't "received" it yet (logic depends on feedback system)
             // Or maybe it just means interviewer did their part. Let's simplify:
             return "Pending" // Interviewer provided, awaiting interviewee action/acknowledgement or just showing interviewer is done
        } else {
             return "Pending" // Interviewer hasn't provided yet
        }
    } else if viewingUserID == interview.InterviewerID { // User is the interviewer
        if hasInterviewerProvided {
            return "Provided"
        } else {
            return "Pending" // Interviewer needs to provide
        }
	} else {
		// This case should ideally not happen if the user is only fetching their own interviews
		log.Printf("WARN: determineFeedbackStatus called for user %s who is not part of interview %s", viewingUserID.Hex(), interview.ID.Hex())
		return "N/A"
	}
}


// GetInterviewDetailsHandler retrieves details for a single interview.
func GetInterviewDetailsHandler(c *gin.Context) {
	interviewCollection := database.GetCollection("interviews") // Get collection inside handler
	// userCollection := database.GetCollection("users")           // Get collection inside handler (Removed as not needed)
	interviewIDStr := c.Param("interviewId")
	interviewOID, err := primitive.ObjectIDFromHex(interviewIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid interview ID format"})
		return
	}

	var interview models.Interview
	err = interviewCollection.FindOne(context.Background(), bson.M{"_id": interviewOID}).Decode(&interview)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Interview not found"})
			return
		}
		log.Printf("Error finding interview %s: %v", interviewIDStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve interview details", "details": err.Error()})
		return
	}

	// Security Check: Ensure the requesting user is part of this interview
	requestingUserID, _ := c.Get("userObjectID")
	reqOID := requestingUserID.(primitive.ObjectID)
	if reqOID != interview.InterviewerID && reqOID != interview.IntervieweeID {
		log.Printf("Forbidden attempt: User %s trying to access interview %s", reqOID.Hex(), interviewIDStr)
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to access this interview"})
		return
	}

	// Populate participant details using denormalized names first
	interviewerInfo := models.UserInfo{ID: interview.InterviewerID, Name: interview.InterviewerName}
	intervieweeInfo := models.UserInfo{ID: interview.IntervieweeID, Name: interview.IntervieweeName}

	// Construct the response
	response := models.InterviewResponse{
		ID:            interview.ID,
		Interviewer:   &interviewerInfo,
		Interviewee:   &intervieweeInfo,
		ScheduledTime: interview.ScheduledTime,
		Topic:         interview.Topic,
		Status:        interview.Status,
		FeedbackStatus: determineFeedbackStatus(&interview, reqOID), // Determine based on requesting user
	}


	log.Printf("Retrieved details for interview %s", interviewIDStr)
	c.JSON(http.StatusOK, response)
}

// TODO: Add handlers for updating interview status (e.g., start, complete, cancel)
// TODO: Add handlers for managing feedback
