package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents the user model in the database
type User struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name              string             `bson:"name" json:"name"`
	Email             string             `bson:"email" json:"email"`
	Password          string             `bson:"password"` // Keep in DB model
	Role              string             `bson:"role" json:"role"` // Primary role at signup
	AvailableRoles    []string           `bson:"availableRoles" json:"availableRoles"` // All roles user can have
	ProfilePictureURL *string            `bson:"profile_picture_url,omitempty" json:"profile_picture_url,omitempty"`
	CreatedAt         time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt         time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// UserResponse is the DTO (Data Transfer Object) for user data sent in API responses.
// It explicitly excludes the password.
type UserResponse struct {
	ID                primitive.ObjectID `json:"id,omitempty"`
	Name              string             `json:"name"`
	Email             string             `json:"email"`
	Role              string             `json:"role"`
	AvailableRoles    []string           `json:"availableRoles"`
	ProfilePictureURL *string            `json:"profile_picture_url,omitempty"`
	CreatedAt         time.Time          `json:"createdAt"`
	UpdatedAt         time.Time          `json:"updatedAt"`
}


// Interview represents the interview model in the database
type Interview struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	InterviewerID  primitive.ObjectID `bson:"interviewer_id" json:"interviewer_id"`
	IntervieweeID  primitive.ObjectID `bson:"interviewee_id" json:"interviewee_id"`
	ScheduledTime time.Time          `bson:"scheduled_time" json:"scheduled_time"` // Store as UTC
	Topic          string             `bson:"topic" json:"topic"` // Store the topic name or ID
	Status         string             `bson:"status" json:"status"` // e.g., "scheduled", "in_progress", "completed", "cancelled"
	// Denormalized names for easier display in lists
	InterviewerName string `bson:"interviewer_name" json:"interviewerName"`
	IntervieweeName string `bson:"interviewee_name" json:"intervieweeName"`
	CreatedAt      time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time          `bson:"updatedAt" json:"updatedAt"`
	// Consider adding fields for feedback later if needed
	// FeedbackID primitive.ObjectID `bson:"feedback_id,omitempty" json:"feedback_id,omitempty"`
	// InterviewerFeedbackProvided bool `bson:"interviewerFeedbackProvided,omitempty"`
	// IntervieweeFeedbackReceived bool `bson:"intervieweeFeedbackReceived,omitempty"`
}

// Simplified user info for embedding or responses
type UserInfo struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name string             `bson:"name" json:"name"`
}

// Response structure for interview lists/details (including populated participant info)
type InterviewResponse struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Interviewer   *UserInfo          `bson:"interviewer,omitempty" json:"interviewer,omitempty"` // Populated in handler
	Interviewee   *UserInfo          `bson:"interviewee,omitempty" json:"interviewee,omitempty"` // Populated in handler
	ScheduledTime time.Time          `bson:"scheduled_time" json:"scheduled_time"`
	Topic         string             `bson:"topic" json:"topic"`
	Status        string             `bson:"status" json:"status"`
	FeedbackStatus string            `bson:"feedback_status,omitempty" json:"feedback_status,omitempty"` // Determined contextually in handler
}

type PerformanceStats struct {
	InterviewsConducted int     `json:"interviewsConducted"`
	AverageRating       float64 `json:"averageRating"` // Use float64 for average
	FeedbackPending     int     `json:"feedbackPending"`
}

// Topic represents an interview topic choice
type Topic struct {
	ID   string `json:"id"`   // Unique ID for the topic
	Name string `json:"name"` // Display name of the topic
}

// AvailableSlot represents a time slot for scheduling
type AvailableSlot struct {
    Date      string `json:"date"`      // YYYY-MM-DD
    Time      string `json:"time"`      // HH:mm (UTC)
    Available bool   `json:"available"`
}


// --- Input Structs for API Handlers ---

// Input struct for creating an interview
type CreateInterviewInput struct {
	InterviewerID string    `json:"interviewer_id" binding:"required,objectid"` // Add validation for ObjectID format
	IntervieweeID string    `json:"interviewee_id" binding:"required,objectid"`
	ScheduledTime time.Time `json:"scheduled_time" binding:"required"` // Expect ISO 8601 format UTC
	Topic         string    `json:"topic" binding:"required"`
}

// Input struct for registering a user
type RegisterInput struct {
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=interviewer interviewee"` // Validate role
}

// Input struct for logging in a user
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Input struct for updating user profile
type UpdateProfileInput struct {
	Name              *string `json:"name,omitempty" binding:"omitempty,min=2"` // Pointer allows distinguishing null/omitted from empty string
	ProfilePictureURL *string `json:"profile_picture_url,omitempty" binding:"omitempty,url|eq="` // Allow URL or empty string "" to clear
}

// --- WebSocket Message Structs ---

// Struct for chat messages (broadcasted)
type ChatMessage struct {
    SenderID    string `json:"senderId"`
    SenderName  string `json:"senderName"` // Consider fetching server-side or trusting client less
    Text        string `json:"text"`
    Timestamp   int64  `json:"timestamp"` // Unix timestamp (milliseconds, set by server)
    InterviewID string `json:"interviewId"` // Added for context
}

// Struct for code updates (broadcast)
type CodeUpdate struct {
    InterviewID string `json:"interviewId"`
    Code        string `json:"code"`
    SenderID    string `json:"senderId"` // Identify who sent the update
}

// Struct for whiteboard updates (broadcast)
type WhiteboardUpdate struct {
    InterviewID string      `json:"interviewId"`
    Type        string      `json:"type"` // "draw", "drawStart", "clear", etc.
    Data        interface{} `json:"data"` // Flexible data structure for different actions
    SenderID    string      `json:"senderId"`
}
