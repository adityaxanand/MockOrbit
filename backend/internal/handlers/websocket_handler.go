package handlers

import (
	"context"        // Import context package
	"encoding/json"
	"log"
	"net/http"
	// "strings" // No longer needed here
	"sync"
	"time" // Import time package

	"mock-orbit/backend/internal/config"
	"mock-orbit/backend/internal/database" // Import database package
	"mock-orbit/backend/internal/models"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"         // Import bson package
	"go.mongodb.org/mongo-driver/bson/primitive" // Import primitive package
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow frontend origin (adjust as needed for production)
		allowedOrigin := config.AppConfig.FrontendURL // Use configured Frontend URL
		if allowedOrigin == "" {
			// Fallback for local development if not set in .env
			allowedOrigin = "http://localhost:9002"
			log.Println("Warning: FRONTEND_URL not set, defaulting CORS to", allowedOrigin)
		}
		origin := r.Header.Get("Origin")
		// Allow if origin matches or if origin is not specified (e.g. same-origin requests or tools like Postman)
		return origin == allowedOrigin || origin == ""
	},
}

// Represents a connected client
type Client struct {
	Conn        *websocket.Conn
	InterviewID string
	UserID      string
}

// Hub manages WebSocket connections for interview rooms
type Hub struct {
	Rooms map[string]map[*websocket.Conn]*Client // interviewID -> {conn -> client}
	Mutex sync.RWMutex
}

var hub = Hub{
	Rooms: make(map[string]map[*websocket.Conn]*Client),
}

// AddClient adds a client to a room, handling potential re-joins.
func (h *Hub) AddClient(client *Client) {
	h.Mutex.Lock()
	defer h.Mutex.Unlock()

	isRejoin := false
	// Check if this user ID was previously in the room (quick check without iterating through closed conns)
	// A more robust check might involve storing recently disconnected users temporarily
	if room, ok := h.Rooms[client.InterviewID]; ok {
		 for _, existingClient := range room {
             if existingClient.UserID == client.UserID {
                 log.Printf("User %s attempted to join room %s again. Closing new connection.", client.UserID, client.InterviewID)
                 err := client.Conn.WriteJSON(map[string]interface{}{"type": "error", "message": "Already connected in another session."})
                 if err != nil {
                      log.Printf("Error sending 'already connected' message: %v", err)
                 }
                 client.Conn.Close()
                 return // Don't add
             }
         }
         // If user ID wasn't found but room exists, potentially a rejoin
         // Simple heuristic: if room exists and user wasn't actively connected, consider it a rejoin
         if len(room) > 0 { // If others are present, it's likely a rejoin for the joining user
            isRejoin = true
         }
	}


	if _, ok := h.Rooms[client.InterviewID]; !ok {
		h.Rooms[client.InterviewID] = make(map[*websocket.Conn]*Client)
		log.Printf("Created new room: %s", client.InterviewID)
	}

	h.Rooms[client.InterviewID][client.Conn] = client
	log.Printf("Client %s %s room %s. Room size: %d", client.UserID, map[bool]string{true: "REJOINED", false: "joined"}[isRejoin], client.InterviewID, len(h.Rooms[client.InterviewID]))

    // Notify others about the join/rejoin
    h.notifyPeersOfPresenceLocked(client, isRejoin)
}


// RemoveClient removes a client from a room and cleans up the room if empty
func (h *Hub) RemoveClient(client *Client) {
	h.Mutex.Lock()
	defer h.Mutex.Unlock()

	if room, ok := h.Rooms[client.InterviewID]; ok {
		if c, clientOk := room[client.Conn]; clientOk {
            userID := c.UserID // Capture userID before deletion

            // Notify others before removing
            h.broadcastMessageLocked(client.InterviewID, client.Conn, map[string]interface{}{
                "type": "user-disconnected",
                "userId": userID,
            })

			delete(room, client.Conn)
			log.Printf("Client %s removed from room %s. Room size: %d", userID, client.InterviewID, len(room))

			// Clean up room if it becomes empty
			if len(room) == 0 {
				delete(h.Rooms, client.InterviewID)
				log.Printf("Room %s removed as it's empty.", client.InterviewID)
			}
		}
	}
}

// broadcastMessageLocked sends a message to all clients in a room except the sender.
// Assumes the Hub Mutex is already held by the caller (Lock or RLock).
func (h *Hub) broadcastMessageLocked(interviewID string, sender *websocket.Conn, message interface{}) {
	if room, ok := h.Rooms[interviewID]; ok {
		for conn, client := range room {
			if conn != sender {
				err := conn.WriteJSON(message)
				if err != nil {
					log.Printf("Error broadcasting message to client %s in room %s: %v", client.UserID, interviewID, err)
					// Consider scheduling removal or handling error more gracefully
					// Schedule client removal on write error?
				}
			}
		}
	}
}

// BroadcastMessage sends a message to all clients in a room except the sender (acquires lock).
func (h *Hub) BroadcastMessage(interviewID string, sender *websocket.Conn, message interface{}) {
    h.Mutex.RLock()
    defer h.Mutex.RUnlock()
    h.broadcastMessageLocked(interviewID, sender, message)
}


// SendMessageTo sends a message directly to a specific client connection
func (h *Hub) SendMessageTo(conn *websocket.Conn, message interface{}) error {
    h.Mutex.RLock()
     var targetClient *Client
     found := false
     for _, room := range h.Rooms {
         if client, ok := room[conn]; ok {
             targetClient = client
             found = true
             break
         }
     }
    h.Mutex.RUnlock()

    if !found {
        log.Printf("Attempted to send message to a connection no longer in the hub.")
        return websocket.ErrCloseSent
    }

	err := conn.WriteJSON(message)
	if err != nil {
		log.Printf("Error sending direct message to client %s: %v", targetClient.UserID, err)
	}
    return err
}


// notifyPeersOfPresenceLocked informs other clients about a user's presence (join/rejoin)
// and sends the current list of users to the joining/rejoining client.
// Assumes the Hub Mutex is already held by the caller (Lock).
func (h *Hub) notifyPeersOfPresenceLocked(joiningClient *Client, isRejoin bool) {
    room := h.Rooms[joiningClient.InterviewID]
    existingClientInfos := make([]map[string]string, 0, len(room)-1) // List of existing users {id: "..."}
    notificationType := "user-joined-notification"
    if isRejoin {
        notificationType = "peer-rejoined" // Use distinct type for rejoin
    }

    // Notify existing peers about the new/rejoining user
    for conn, existingClient := range room {
        if existingClient.Conn != joiningClient.Conn { // If it's an existing client
            existingClientInfos = append(existingClientInfos, map[string]string{"id": existingClient.UserID})

            // Tell existing client about the new/rejoining user
            err := conn.WriteJSON(map[string]interface{}{
                "type": notificationType, // 'user-joined-notification' or 'peer-rejoined'
                "userId": joiningClient.UserID,
            })
             if err != nil {
                log.Printf("Error notifying client %s about %s user %s: %v", existingClient.UserID, notificationType, joiningClient.UserID, err)
            }
        }
    }

    // Tell the new/rejoining client about all *other* existing users
    if len(existingClientInfos) > 0 {
         log.Printf("Sending 'all-users' list to client %s in room %s. Users: %v", joiningClient.UserID, joiningClient.InterviewID, existingClientInfos)
        err := joiningClient.Conn.WriteJSON(map[string]interface{}{
            "type": "all-users", // Client uses this to know who is already there
            "users": existingClientInfos,
        })
        if err != nil {
             log.Printf("Error sending 'all-users' to client %s: %v", joiningClient.UserID, err)
        }
    } else {
         log.Printf("Client %s is the first in room %s.", joiningClient.UserID, joiningClient.InterviewID)
    }
}


// FindPeerConnLocked finds the connection and client object of the other participant(s) in the room.
// For 1:1 calls, it returns the single peer.
// Assumes the Hub Mutex is already held (RLock or Lock).
func (h *Hub) findPeerConnLocked(interviewID string, selfID string) (*websocket.Conn, *Client) {
    if room, ok := h.Rooms[interviewID]; ok {
        for conn, client := range room {
            if client.UserID != selfID {
                return conn, client // Found the peer (in 1:1 scenario)
            }
        }
    }
    return nil, nil // Peer not found or room doesn't exist/empty
}


// WebsocketHandler handles WebSocket upgrade requests and manages communication.
func WebsocketHandler(c *gin.Context) {
	interviewCollection := database.GetCollection("interviews") // Get collection inside handler
	interviewID := c.Query("interviewId")
	userID := c.Query("userId") // Get user ID from query param (will be validated against token)
    token := c.Query("token") // Get token for validation

	log.Printf("WebSocket connection attempt: interviewId=%s, userId=%s, token provided=%t", interviewID, userID, token != "")

	if interviewID == "" || userID == "" || token == "" {
		log.Println("WebSocket upgrade refused: Missing interviewId, userId, or token")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required query parameters (interviewId, userId, token)"})
		return
	}

    // --- JWT Token Validation ---
	log.Println("Validating JWT token...")
    claims := jwt.MapClaims{}
    parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			log.Printf("Unexpected signing method: %v", token.Header["alg"])
            return nil, jwt.NewValidationError("unexpected signing method", jwt.ValidationErrorSignatureInvalid)
        }
        return []byte(config.AppConfig.JWTSecret), nil
    })

    if err != nil || !parsedToken.Valid {
        log.Printf("WebSocket upgrade refused for user %s in room %s: Invalid token: %v", userID, interviewID, err)
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
        return
    }
	log.Println("JWT token validated successfully.")

     // --- Validate User ID and Interview Participation ---
     tokenUserID, okUserID := claims["user_id"].(string)
     if !okUserID || tokenUserID != userID {
         log.Printf("WebSocket upgrade refused: User ID '%s' from query does not match token user ID '%s'", userID, tokenUserID)
         c.JSON(http.StatusForbidden, gin.H{"error": "User ID mismatch"})
         return
     }
	 log.Printf("User ID '%s' matches token.", userID)

    // Validate interview ID format
	log.Printf("Validating interview ID format: %s", interviewID)
    interviewOID, err := primitive.ObjectIDFromHex(interviewID)
    if err != nil {
        log.Printf("WebSocket upgrade refused: Invalid interview ID format '%s'", interviewID)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid interview ID format"})
        return
    }
	log.Printf("Interview ID format validated: %s", interviewOID.Hex())
    userOID, _ := primitive.ObjectIDFromHex(tokenUserID)

    // Check if user is part of the specified interview
	log.Printf("Checking participation for user %s in interview %s", userOID.Hex(), interviewOID.Hex())
    count, err := interviewCollection.CountDocuments(context.Background(), bson.M{
        "_id": interviewOID,
        "$or": []bson.M{
            {"interviewer_id": userOID},
            {"interviewee_id": userOID},
        },
        "status": bson.M{"$in": []string{"scheduled", "in_progress"}}, // Allow joining scheduled or in-progress
    })
    if err != nil {
        log.Printf("Error checking interview participation for user %s in interview %s: %v", tokenUserID, interviewID, err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify interview participation"})
        return
    }
    if count == 0 {
        // Fetch interview to check if it's completed/cancelled to give specific error
        var interview models.Interview
        findErr := interviewCollection.FindOne(context.Background(), bson.M{"_id": interviewOID}).Decode(&interview)
        errMsg := "Not authorized for this interview or interview is not active"
        if findErr == nil && (interview.Status == "completed" || interview.Status == "cancelled") {
            errMsg = "This interview has already ended or been cancelled."
        }
        log.Printf("WebSocket upgrade refused: User %s in interview %s. Reason: %s", tokenUserID, interviewID, errMsg)
        c.JSON(http.StatusForbidden, gin.H{"error": errMsg})
        return
    }
	log.Printf("User %s authorized for interview %s.", userID, interviewID)

	// Upgrade HTTP connection to WebSocket
	log.Printf("Attempting to upgrade connection to WebSocket for user %s...", userID)
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("CRITICAL: WebSocket upgrade error for room %s, user %s: %v", interviewID, userID, err)
		return
	}
	log.Printf("WebSocket connection upgraded successfully for user %s.", userID)
	defer conn.Close() // Ensure connection is closed when handler exits

	client := &Client{
		Conn:        conn,
		InterviewID: interviewID,
		UserID:      userID,
	}
	hub.AddClient(client) // AddClient now handles rejoin logic notifications
    defer func() {
        log.Printf("Removing client %s from room %s due to connection close or error in read loop exit", client.UserID, client.InterviewID)
        hub.RemoveClient(client)
    }()

	// Main loop to read messages from the client
	log.Printf("Starting message read loop for client %s...", client.UserID)
	for {
		var message map[string]interface{}
		err := conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure, websocket.CloseNormalClosure) {
				log.Printf("WebSocket unexpected read error for client %s in room %s: %v", client.UserID, client.InterviewID, err)
			} else if e, ok := err.(*websocket.CloseError); ok && (e.Code == websocket.CloseNormalClosure || e.Code == websocket.CloseGoingAway) {
				 log.Printf("WebSocket connection closed normally by client %s in room %s.", client.UserID, client.InterviewID)
			} else {
				 log.Printf("WebSocket unknown read error/close for client %s in room %s: %v", client.UserID, client.InterviewID, err)
			}
			break // Exit loop on any error or close
		}

		// log.Printf("Received message from %s in room %s: Type=%v", client.UserID, client.InterviewID, message["type"])

        msgType, typeOk := message["type"].(string)
        if !typeOk {
            log.Printf("Invalid message format from %s: 'type' field missing or not a string", client.UserID)
            hub.SendMessageTo(conn, map[string]interface{}{"type": "error", "message": "Invalid message format: 'type' missing or not string"})
            continue
        }

		switch msgType {
		case "chat-message":
             var chatMsg models.ChatMessage
             msgPayload, payloadOk := message["message"]
             if !payloadOk { log.Printf("Invalid 'chat-message' format from %s: 'message' payload missing", client.UserID); continue }
             msgData, err := json.Marshal(msgPayload)
             if err != nil { log.Printf("Error marshaling chat payload from %s: %v", client.UserID, err); continue }
             if err := json.Unmarshal(msgData, &chatMsg); err != nil { log.Printf("Invalid 'chat-message' data format from %s: %v", client.UserID, err); continue }
             chatMsg.InterviewID = interviewID
             chatMsg.SenderID = userID
             chatMsg.Timestamp = time.Now().UnixMilli()
             if chatMsg.SenderName == "" { chatMsg.SenderName = "User_" + userID[:4] }
             // TODO: Store chat message in DB?
             hub.BroadcastMessage(interviewID, conn, map[string]interface{}{"type": "chat-message", "message": chatMsg})

		case "code-update":
            code, codeOk := message["code"].(string)
            if !codeOk { log.Printf("Invalid 'code-update' from %s: 'code' missing/not string", client.UserID); continue }
            hub.BroadcastMessage(interviewID, conn, map[string]interface{}{ "type": "code-update", "code": code, "senderId": userID })

		case "whiteboard-update":
            wbData, dataOk := message["data"]
            actionType, actionOk := message["actionType"].(string) // Expect actionType: "draw", "clear"
            if !dataOk || !actionOk { log.Printf("Invalid 'whiteboard-update' from %s: 'data' or 'actionType' missing", client.UserID); continue }
			hub.BroadcastMessage(interviewID, conn, map[string]interface{}{ "type": "whiteboard-update", "actionType": actionType, "data": wbData, "senderId": userID })

        // --- WebRTC Signaling (Remains largely the same) ---
        case "sending-signal": // Initiator sends signal TO a specific peer
            userToSignal, utsOk := message["userToSignal"].(string)
            signalData, sdOk := message["signal"] // signal can be offer, answer, or ICE candidate
            callerId, callerOk := message["callerId"].(string) // Ensure callerId is present
            if !utsOk || !sdOk || !callerOk || callerId != client.UserID {
                 log.Printf("Invalid 'sending-signal' from %s: Missing fields or callerId mismatch", client.UserID)
                 hub.SendMessageTo(conn, map[string]interface{}{"type": "error", "message": "Invalid sending-signal format or caller ID"})
                 continue
            }
            // Find the target peer's connection
            hub.Mutex.RLock()
            var targetConn *websocket.Conn
            var targetClient *Client
             if room, ok := hub.Rooms[interviewID]; ok {
                 for tConn, tClient := range room {
                     if tClient.UserID == userToSignal {
                         targetConn = tConn
                         targetClient = tClient
                         break
                     }
                 }
             }
            hub.Mutex.RUnlock()

            if targetConn != nil && targetClient != nil {
                log.Printf("Relaying 'sending-signal' from %s to %s in room %s", callerId, userToSignal, interviewID)
                // Forward the signal, adding who it's from (callerId)
                err := hub.SendMessageTo(targetConn, map[string]interface{}{
                    "type": "user-joined", // Receiving client interprets this as an incoming signal
                    "signal": signalData,
                    "callerId": callerId, // ID of the user who sent the original signal
                })
                if err != nil { log.Printf("Error relaying 'sending-signal' to %s: %v", userToSignal, err) }
            } else {
                 log.Printf("User %s tried to signal non-existent or incorrect user %s in room %s", callerId, userToSignal, interviewID)
                 hub.SendMessageTo(conn, map[string]interface{}{"type": "error", "message": "Peer not found or not ready"})
            }

        case "returning-signal": // Peer returns signal TO the original caller
             callerId, ciOk := message["callerId"].(string) // The ID of the user who INITIATED the connection
             signalData, sdOk := message["signal"] // The signal data (answer or ICE candidate)
              if !ciOk || !sdOk {
                 log.Printf("Invalid 'returning-signal' from %s: Missing 'callerId' or 'signal'", client.UserID)
                 hub.SendMessageTo(conn, map[string]interface{}{"type": "error", "message": "Invalid returning-signal format"})
                 continue
             }
            // Find the connection of the original caller
             hub.Mutex.RLock()
             var callerConn *websocket.Conn
             if room, ok := hub.Rooms[interviewID]; ok {
                 for c, cl := range room {
                     if cl.UserID == callerId {
                         callerConn = c
                         break
                     }
                 }
             }
             hub.Mutex.RUnlock()

             if callerConn != nil {
                 log.Printf("Relaying 'returning-signal' from %s to %s in room %s", client.UserID, callerId, interviewID)
                err := hub.SendMessageTo(callerConn, map[string]interface{}{
                    "type": "receiving-returned-signal", // Caller receives this to complete connection/add candidate
                    "signal": signalData,
                    "id": client.UserID, // ID of the user who sent the return signal (the current client)
                })
                 if err != nil { log.Printf("Error relaying 'returning-signal' to %s: %v", callerId, err) }
            } else {
                 log.Printf("User %s tried to return signal to non-existent caller %s in room %s", client.UserID, callerId, interviewID)
                  hub.SendMessageTo(conn, map[string]interface{}{"type": "error", "message": "Original caller not found"})
            }

         case "end-interview":
            log.Printf("User %s initiated 'end-interview' for room %s", client.UserID, interviewID)
            _, err := interviewCollection.UpdateOne(
                 context.Background(),
                 bson.M{"_id": interviewOID},
                 bson.M{"$set": bson.M{"status": "completed", "updatedAt": time.Now().UTC()}},
            )
            if err != nil { log.Printf("Error updating interview status to completed for %s: %v", interviewID, err) }

             hub.Mutex.RLock()
             hub.broadcastMessageLocked(interviewID, nil, map[string]interface{}{"type": "interview-ended"})
             hub.Mutex.RUnlock()

             // Goroutine to close connections and clean up room
             go func(roomID string) {
                 hub.Mutex.Lock()
                 defer hub.Mutex.Unlock()
                 if room, ok := hub.Rooms[roomID]; ok {
                     log.Printf("Force closing all connections in room %s due to 'end-interview'", roomID)
                     for connToClose, clientToClose := range room {
                         log.Printf("Closing connection for user %s", clientToClose.UserID)
                         connToClose.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "Interview ended"))
                         connToClose.Close()
                     }
                     delete(hub.Rooms, roomID)
                     log.Printf("Room %s removed after 'end-interview'.", roomID)
                 }
             }(interviewID)

		default:
			log.Printf("Unknown message type received from %s: %s", client.UserID, msgType)
            hub.SendMessageTo(conn, map[string]interface{}{"type": "error", "message": "Unknown message type: "+msgType})
		}
	}
	log.Printf("Exited message read loop for client %s.", client.UserID) // Log loop exit
}


    