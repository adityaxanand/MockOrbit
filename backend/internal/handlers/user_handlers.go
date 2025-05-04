package handlers

import (
	"context"
	"log"
	"net/http"
	"sort" // Added for sorting topics
	"time"

	"mock-orbit/backend/internal/database"
	"mock-orbit/backend/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	// "go.mongodb.org/mongo-driver/mongo" // Import mongo package
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Removed global variable initialization

// GetUserProfileHandler retrieves the profile of the currently logged-in user.
func GetUserProfileHandler(c *gin.Context) {
	userCollection := database.GetCollection("users") // Get collection inside handler
	userIDHex, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDHex.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var user models.User
	err = userCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		log.Printf("Error finding user profile for ID %s: %v", userIDHex, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
		return
	}

	// Return user info (excluding password)
	userResponse := models.UserResponse{ // Use UserResponse DTO
		ID:                user.ID,
		Name:              user.Name,
		Email:             user.Email,
		Role:              user.Role,
		AvailableRoles:    user.AvailableRoles,
		ProfilePictureURL: user.ProfilePictureURL,
		CreatedAt:         user.CreatedAt,
		UpdatedAt:         user.UpdatedAt,
	}
	c.JSON(http.StatusOK, userResponse)
}

// UpdateUserProfileHandler updates the profile of the currently logged-in user.
func UpdateUserProfileHandler(c *gin.Context) {
	userCollection := database.GetCollection("users") // Get collection inside handler
	userIDHex, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	userID, err := primitive.ObjectIDFromHex(userIDHex.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var input models.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Update profile input validation error for user %s: %v", userIDHex, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data", "details": err.Error()})
		return
	}

	updateFields := bson.M{}
	if input.Name != nil {
		if len(*input.Name) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Name must be at least 2 characters"})
			return
		}
		updateFields["name"] = *input.Name
	}
	if input.ProfilePictureURL != nil {
		if *input.ProfilePictureURL == "" {
             updateFields["profile_picture_url"] = nil // Allow setting to null/empty
        } else {
            // Basic URL validation could go here if desired
            updateFields["profile_picture_url"] = *input.ProfilePictureURL
        }
	}

	if len(updateFields) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No update fields provided"})
		return
	}

	// Also update the 'updatedAt' timestamp
	updateFields["updatedAt"] = time.Now().UTC()

	update := bson.M{"$set": updateFields}
	options := options.FindOneAndUpdate().SetReturnDocument(options.After) // Return the updated document

	var updatedUser models.User
	err = userCollection.FindOneAndUpdate(context.Background(), bson.M{"_id": userID}, update, options).Decode(&updatedUser)
	if err != nil {
		log.Printf("Error updating user profile for ID %s: %v", userIDHex, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

    // If name was updated, update denormalized names in future interviews
	if nameUpdate, ok := updateFields["name"]; ok {
		go updateDenormalizedNames(userID, nameUpdate.(string)) // Run in background
	}


	// Return updated user info (excluding password)
	userResponse := models.UserResponse{ // Use UserResponse DTO
		ID:                updatedUser.ID,
		Name:              updatedUser.Name,
		Email:             updatedUser.Email,
		Role:              updatedUser.Role,
		AvailableRoles:    updatedUser.AvailableRoles,
		ProfilePictureURL: updatedUser.ProfilePictureURL,
		CreatedAt:         updatedUser.CreatedAt,
		UpdatedAt:         updatedUser.UpdatedAt,
	}

	log.Printf("User profile updated successfully for: %s", updatedUser.Email)
	c.JSON(http.StatusOK, userResponse)
}

// updateDenormalizedNames updates names in interviews scheduled in the future.
func updateDenormalizedNames(userID primitive.ObjectID, newName string) {
	interviewCollection := database.GetCollection("interviews") // Get collection inside helper
	now := time.Now().UTC()
	filterInterviewer := bson.M{
		"interviewer_id": userID,
		"scheduled_time": bson.M{"$gt": now}, // Only update future interviews
	}
	updateInterviewer := bson.M{"$set": bson.M{"interviewer_name": newName, "updatedAt": now}}
	result, err := interviewCollection.UpdateMany(context.Background(), filterInterviewer, updateInterviewer)
	if err != nil {
		log.Printf("Error updating denormalized interviewer name for user %s: %v", userID.Hex(), err)
	} else {
         log.Printf("Updated %d future interviews for interviewer name change (User: %s)", result.ModifiedCount, userID.Hex())
    }


	filterInterviewee := bson.M{
		"interviewee_id": userID,
		"scheduled_time": bson.M{"$gt": now},
	}
	updateInterviewee := bson.M{"$set": bson.M{"interviewee_name": newName, "updatedAt": now}}
	result, err = interviewCollection.UpdateMany(context.Background(), filterInterviewee, updateInterviewee)
	if err != nil {
		log.Printf("Error updating denormalized interviewee name for user %s: %v", userID.Hex(), err)
	} else {
         log.Printf("Updated %d future interviews for interviewee name change (User: %s)", result.ModifiedCount, userID.Hex())
    }
}


// GetPeersHandler retrieves a list of potential peers (other users).
func GetPeersHandler(c *gin.Context) {
	userCollection := database.GetCollection("users") // Get collection inside handler
	requestingUserIDHex, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	requestingUserOID, _ := primitive.ObjectIDFromHex(requestingUserIDHex.(string)) // Assume valid from middleware

	// Fetch all users *except* the requesting user
	filter := bson.M{"_id": bson.M{"$ne": requestingUserOID}}
	findOptions := options.Find()
	// Project only necessary fields for UserInfo DTO
	findOptions.SetProjection(bson.M{"name": 1, "_id": 1})
	findOptions.SetSort(bson.M{"name": 1})              // Sort by name

	cursor, err := userCollection.Find(context.Background(), filter, findOptions)
	if err != nil {
		log.Printf("Error fetching peers: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve peer list"})
		return
	}
	defer cursor.Close(context.Background())

	var peers []models.UserInfo // Use UserInfo for minimal data
	if err = cursor.All(context.Background(), &peers); err != nil {
		log.Printf("Error decoding peers: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process peer data"})
		return
	}

	// If no peers found (other than self), return empty list
	if peers == nil {
		peers = []models.UserInfo{}
	}

	log.Printf("Retrieved %d peers for user %s", len(peers), requestingUserIDHex)
	c.JSON(http.StatusOK, peers)
}

// GetUserStatsHandler retrieves performance stats for an interviewer.
func GetUserStatsHandler(c *gin.Context) {
	interviewCollection := database.GetCollection("interviews") // Get collection inside handler
	// feedbackCollection := database.GetCollection("feedback") // Get feedback collection if/when implemented
	userIDStr := c.Param("userId")
	userOID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Security Check: Ensure requesting user matches the user ID
	requestingUserID, _ := c.Get("userObjectID")
	if requestingUserID != userOID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only access your own stats"})
		return
	}

	// --- Calculate Stats ---
	// 1. Interviews Conducted (Completed)
	conductedFilter := bson.M{
		"interviewer_id": userOID,
		"status":         "completed",
	}
	conductedCount, err := interviewCollection.CountDocuments(context.Background(), conductedFilter)
	if err != nil {
		log.Printf("Error counting conducted interviews for user %s: %v", userIDStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate stats (conducted)"})
		return
	}

	// 2. Average Rating (Placeholder - Requires Feedback Model/Collection)
	avgRating := 0.0 // Default to 0
	// Conceptual Aggregation (uncomment and adapt when feedback model exists)
	/*
	pipeline := mongo.Pipeline{
		// Match feedback where the *recipient* was rated by *others* OR feedback *provided* by this interviewer
		// Adjust filter based on how you want to calculate rating (received vs given)
		{{"$match", bson.M{"interviewer_id": userOID}}}, // Example: Rating given by this interviewer
		{{"$group", bson.M{
			"_id":        nil,
			"avgRating":  bson.M{"$avg": "$rating"},
			"totalRatings": bson.M{"$sum": 1},
		}}},
	}
	cursor, err := feedbackCollection.Aggregate(context.Background(), pipeline)
	if err != nil {
		log.Printf("Error aggregating average rating for user %s: %v", userIDStr, err)
		// Don't fail the request, just use default rating
	} else {
		defer cursor.Close(context.Background())
		var results []struct { AvgRating *float64 `bson:"avgRating"`; TotalRatings int `bson:"totalRatings"`}
		if cursor.Next(context.Background()) {
			var result struct { AvgRating *float64 `bson:"avgRating"`; TotalRatings int `bson:"totalRatings"`}
			if err := cursor.Decode(&result); err == nil && result.AvgRating != nil && result.TotalRatings > 0 {
				avgRating = *result.AvgRating
			}
		}
	}
	*/

	// 3. Feedback Pending (Placeholder - Requires Feedback Model/Collection)
	pendingFeedbackCount := int64(0) // Placeholder value
	// Conceptual Logic (uncomment and adapt when feedback model exists)
	/*
	pendingInterviewsFilter := bson.M{
		"interviewer_id": userOID,
		"status":         "completed",
	}
    interviewCursor, err := interviewCollection.Find(context.Background(), pendingInterviewsFilter, options.Find().SetProjection(bson.M{"_id": 1}))
    if err != nil {
        log.Printf("Error fetching completed interviews for pending feedback check for user %s: %v", userIDStr, err)
    } else {
        defer interviewCursor.Close(context.Background())
        for interviewCursor.Next(context.Background()) {
            var interviewDoc struct{ ID primitive.ObjectID `bson:"_id"`}
            if err := interviewCursor.Decode(&interviewDoc); err != nil {
                 log.Printf("Error decoding interview ID for pending feedback check: %v", err)
                continue
            }
            // Check if feedback exists for this interview FROM this interviewer
            feedbackFilter := bson.M{"interview_id": interviewDoc.ID, "provider_id": userOID} // Assuming provider_id field
            count, err := feedbackCollection.CountDocuments(context.Background(), feedbackFilter)
            if err != nil {
                log.Printf("Error checking feedback existence for interview %s: %v", interviewDoc.ID.Hex(), err)
            } else if count == 0 { // If no feedback doc found for this interview+interviewer
                pendingFeedbackCount++
            }
        }
    }
	*/


	// --- Assemble Response ---
	stats := models.PerformanceStats{
		InterviewsConducted: int(conductedCount),
		AverageRating:       avgRating, // Assign the calculated or default value
		FeedbackPending:     int(pendingFeedbackCount),
	}

	log.Printf("Retrieved stats for user %s: Conducted=%d, AvgRating=%.1f, PendingFeedback=%d", userIDStr, stats.InterviewsConducted, stats.AverageRating, stats.FeedbackPending)
	c.JSON(http.StatusOK, stats)
}


// GetTopicsHandler retrieves a list of available interview topics.
func GetTopicsHandler(c *gin.Context) {
	// In a real app, these might come from a dedicated 'topics' collection
	// For now, hardcode a list. Ensure IDs are unique if used.
	topics := []models.Topic{
		{ID: "react-hooks", Name: "React Hooks"},
		{ID: "system-design", Name: "System Design"},
		{ID: "go-concurrency", Name: "Go Concurrency"},
		{ID: "frontend-basics", Name: "Frontend Basics"},
		{ID: "data-structures", Name: "Data Structures"},
		{ID: "behavioral", Name: "Behavioral Questions"},
		{ID: "rest-api", Name: "REST API Design"},
		{ID: "db-concepts", Name: "Database Concepts"},
	}
	// Sort topics alphabetically
	sort.Slice(topics, func(i, j int) bool {
		return topics[i].Name < topics[j].Name
	})

	log.Printf("Retrieved %d topics", len(topics))
	c.JSON(http.StatusOK, topics)
}

// GetAvailabilityHandler retrieves available time slots (placeholder).
// In a real system, this needs significant enhancement to check actual user schedules and existing interviews.
func GetAvailabilityHandler(c *gin.Context) {
	interviewCollection := database.GetCollection("interviews") // Get collection inside handler
	dateStr := c.Query("date") // Expect YYYY-MM-DD format
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date query parameter is required"})
		return
	}

	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD."})
		return
	}

	// --- Basic Placeholder Logic ---
	// Define potential slots for the day (e.g., 9 AM to 5 PM UTC)
	potentialSlots := []string{
		"09:00", "10:00", "11:00", "12:00",
		"13:00", "14:00", "15:00", "16:00", "17:00",
	}

	// Get start and end of the selected day in UTC
	dayStart := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), 0, 0, 0, 0, time.UTC)
	dayEnd := dayStart.Add(24 * time.Hour)

	// Fetch existing interviews scheduled for that day
	filter := bson.M{
		"scheduled_time": bson.M{
			"$gte": dayStart,
			"$lt":  dayEnd,
		},
		"status": bson.M{"$ne": "cancelled"}, // Don't consider cancelled interviews as booked
	}
	cursor, err := interviewCollection.Find(context.Background(), filter, options.Find().SetProjection(bson.M{"scheduled_time": 1}))
	if err != nil {
		log.Printf("Error fetching existing interviews for availability on %s: %v", dateStr, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check availability"})
		return
	}
	defer cursor.Close(context.Background())

	bookedTimes := make(map[string]bool)
	for cursor.Next(context.Background()) {
		var interview struct { ScheduledTime time.Time `bson:"scheduled_time"` }
		if err := cursor.Decode(&interview); err == nil {
			// Format booked time to HH:mm UTC
			bookedTimes[interview.ScheduledTime.UTC().Format("15:04")] = true
		}
	}

	// Generate response slots, marking booked ones
	responseSlots := []models.AvailableSlot{}
	for _, timeStr := range potentialSlots {
		slotDateTimeUTCStr := dateStr + "T" + timeStr + ":00Z"
		slotDateTimeUTC, _ := time.Parse(time.RFC3339, slotDateTimeUTCStr)

		// Consider a slot unavailable if it's in the past
		isPast := slotDateTimeUTC.Before(time.Now().UTC())
		isBooked := bookedTimes[timeStr]

		responseSlots = append(responseSlots, models.AvailableSlot{
			Date:      dateStr,
			Time:      timeStr,
			Available: !isBooked && !isPast, // Available if not booked and not in the past
		})
	}
	// --- End Placeholder Logic ---

	log.Printf("Retrieved %d availability slots for date %s (checked against existing interviews)", len(responseSlots), dateStr)
	c.JSON(http.StatusOK, responseSlots)
}
