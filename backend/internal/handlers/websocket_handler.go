package handlers

// import (
// 	"log"
// 	"net/http"
// 	"sync"

// 	"mock-orbit/backend/internal/models"

// 	"github.com/gin-gonic/gin"
// 	"github.com/gorilla/websocket"
// )

// var upgrader = websocket.Upgrader{
// 	ReadBufferSize:  1024,
// 	WriteBufferSize: 1024,
// 	CheckOrigin: func(r *http.Request) bool {
// 		// Allow all connections for development
// 		// TODO: Restrict origins in production
// 		return true
// 	},
// }

// // Represents a connected client
// type Client struct {
// 	Conn        *websocket.Conn
// 	InterviewID string
// 	UserID      string
// }

// // Hub manages WebSocket connections for interview rooms
// type Hub struct {
// 	Rooms map[string]map[*websocket.Conn]*Client // interviewID -> {conn -> client}
// 	Mutex sync.RWMutex
// }

// var hub = Hub{
// 	Rooms: make(map[string]map[*websocket.Conn]*Client),
// }

// // AddClient adds a client to a room
// func (h *Hub) AddClient(client *Client) {
// 	h.Mutex.Lock()
// 	defer h.Mutex.Unlock()

// 	if _, ok := h.Rooms[client.InterviewID]; !ok {
// 		h.Rooms[client.InterviewID] = make(map[*websocket.Conn]*Client)
// 	}
// 	h.Rooms[client.InterviewID][client.Conn] = client
// 	log.Printf("Client %s joined room %s. Room size: %d", client.UserID, client.InterviewID, len(h.Rooms[client.InterviewID]))

//     // Notify others in the room about the new user (for WebRTC signaling)
//     h.notifyOthersOfJoin(client)
// }

// // RemoveClient removes a client from a room and cleans up the room if empty
// func (h *Hub) RemoveClient(client *Client) {
// 	h.Mutex.Lock()
// 	defer h.Mutex.Unlock()

// 	if room, ok := h.Rooms[client.InterviewID]; ok {
// 		if _, clientOk := room[client.Conn]; clientOk {
//             // Notify others before removing
//             h.broadcastMessage(client.InterviewID, client.Conn, map[string]interface{}{
//                 "type": "user-disconnected",
//                 "userId": client.UserID,
//             })

// 			delete(room, client.Conn)
// 			log.Printf("Client %s removed from room %s. Room size: %d", client.UserID, client.InterviewID, len(room))

// 			// Clean up room if it becomes empty
// 			if len(room) == 0 {
// 				delete(h.Rooms, client.InterviewID)
// 				log.Printf("Room %s removed as it's empty.", client.InterviewID)
// 			}
// 		}
// 	}
// }

// // BroadcastMessage sends a message to all clients in a room except the sender
// func (h *Hub) broadcastMessage(interviewID string, sender *websocket.Conn, message interface{}) {
// 	h.Mutex.RLock() // Use RLock for reading
// 	defer h.Mutex.RUnlock()

// 	if room, ok := h.Rooms[interviewID]; ok {
// 		for conn, client := range room {
// 			if conn != sender { // Don't send back to sender
// 				err := conn.WriteJSON(message)
// 				if err != nil {
// 					log.Printf("Error broadcasting message to client %s in room %s: %v", client.UserID, interviewID, err)
// 					// Consider removing the client if write fails repeatedly
// 					// h.RemoveClient(client) // Be careful with locking if calling RemoveClient here
// 				}
// 			}
// 		}
// 	}
// }

// // SendMessageTo sends a message directly to a specific client connection
// func (h *Hub) sendMessageTo(conn *websocket.Conn, message interface{}) error {
//     // No need for lock here as WriteJSON is likely thread-safe for a single connection,
//     // but adding RLock is safer if other operations modify the connection state.
//     h.Mutex.RLock()
//     _, clientExists := h.getClientByConn(conn) // Check if client still exists in hub
//     h.Mutex.RUnlock()

//     if !clientExists {
//         log.Printf("Attempted to send message to a non-existent or removed connection.")
//         // Returning an error might not be the best approach here, depends on caller handling
//         return websocket.ErrCloseSent // Or a custom error
//     }

//     // Use WriteJSON which handles mutex internally for writes on the connection
// 	err := conn.WriteJSON(message)
// 	if err != nil {
// 		log.Printf("Error sending direct message: %v", err)
//         // Consider removing client if write fails
// 	}
//     return err
// }

// // GetClientByConn safely retrieves a client by connection pointer
// func (h *Hub) getClientByConn(conn *websocket.Conn) (*Client, bool) {
//     // Assumes caller holds at least RLock
//     for _, room := range h.Rooms {
//         if client, ok := room[conn]; ok {
//             return client, true
//         }
//     }
//     return nil, false
// }

// // notifyOthersOfJoin sends necessary info to existing clients when a new one joins (for WebRTC)
// func (h *Hub) notifyOthersOfJoin(newClient *Client) {
//     // Assumes caller holds Lock
//     room := h.Rooms[newClient.InterviewID]
//     existingClients := make([]map[string]string, 0, len(room)-1) // List of existing users

//     for conn, client := range room {
//         if client.UserID != newClient.UserID {
//             existingClients = append(existingClients, map[string]string{"id": client.UserID})

//             // Tell existing client about the new user (they might initiate signal)
//             // We don't send signal data here, just notification
//             err := conn.WriteJSON(map[string]interface{}{
//                 "type": "user-joined-notification", // Different from 'user-joined' signal message
//                 "userId": newClient.UserID,
//             })
//              if err != nil {
//                 log.Printf("Error notifying client %s about new user %s: %v", client.UserID, newClient.UserID, err)
//             }
//         }
//     }

//     // Tell the new client about all existing users
//     if len(existingClients) > 0 {
//         err := newClient.Conn.WriteJSON(map[string]interface{}{
//             "type": "all-users", // Trigger for the new client to potentially initiate connection
//             "users": existingClients,
//         })
//         if err != nil {
//              log.Printf("Error sending 'all-users' to new client %s: %v", newClient.UserID, err)
//         }
//     }
// }

// // FindPeerConn finds the connection of the other participant in the room.
// func (h *Hub) findPeerConn(interviewID string, selfID string) (*websocket.Conn, *Client) {
//     h.Mutex.RLock()
//     defer h.Mutex.RUnlock()
//     if room, ok := h.Rooms[interviewID]; ok {
//         for conn, client := range room {
//             if client.UserID != selfID {
//                 return conn, client
//             }
//         }
//     }
//     return nil, nil
// }

// // WebsocketHandler handles WebSocket upgrade requests and manages communication.
// func WebsocketHandler(c *gin.Context) {
// 	// TODO: Add Authentication/Authorization here before upgrading
// 	// Extract user ID and interview ID from query params or token
// 	interviewID := c.Query("interviewId")
// 	userID := c.Query("userId") // Get user ID from authenticated context or query param
//     token := c.Query("token") // Get token for validation

// 	if interviewID == "" || userID == "" || token == "" {
// 		log.Println("WebSocket upgrade refused: Missing interviewId, userId, or token")
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required query parameters (interviewId, userId, token)"})
// 		return
// 	}

//     // Basic Token Validation (optional but recommended)
//     // You could re-use parts of your AuthMiddleware logic here, but avoid full DB lookup if possible
//     _, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
//         if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
//             return nil, jwt.NewValidationError("unexpected signing method", jwt.ValidationErrorSignatureInvalid)
//         }
//         return []byte(config.AppConfig.JWTSecret), nil
//     })
//     if err != nil {
//         log.Printf("WebSocket upgrade refused for user %s in room %s: Invalid token: %v", userID, interviewID, err)
//         c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
//         return
//     }

// 	// Upgrade HTTP connection to WebSocket
// 	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
// 	if err != nil {
// 		log.Printf("WebSocket upgrade error for room %s: %v", interviewID, err)
// 		// Gin likely handles the response, but logging is important
// 		return
// 	}
// 	defer conn.Close() // Ensure connection is closed when handler exits

// 	client := &Client{
// 		Conn:        conn,
// 		InterviewID: interviewID,
// 		UserID:      userID,
// 	}
// 	hub.AddClient(client)
// 	defer hub.RemoveClient(client) // Ensure client is removed when connection closes

// 	// Read messages from the client
// 	for {
// 		var message map[string]interface{} // Use map for flexible message structure
// 		err := conn.ReadJSON(&message)
// 		if err != nil {
// 			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
// 				log.Printf("WebSocket read error for client %s in room %s: %v", client.UserID, client.InterviewID, err)
// 			} else {
// 				log.Printf("WebSocket connection closed for client %s in room %s.", client.UserID, client.InterviewID)
// 			}
// 			break // Exit loop on error or close
// 		}

// 		log.Printf("Received message from %s in room %s: Type=%s", client.UserID, client.InterviewID, message["type"])

//         // Handle different message types
//         msgType, typeOk := message["type"].(string)
//         if !typeOk {
//             log.Printf("Invalid message format from %s: 'type' field missing or not a string", client.UserID)
//             continue
//         }

// 		switch msgType {
// 		case "chat-message":
//              var chatMsg models.ChatMessage
//              // Crude remarshaling - ideally use a typed struct from the start
//              jsonData, _ := json.Marshal(message["message"])
//              json.Unmarshal(jsonData, &chatMsg)
//              chatMsg.InterviewID = interviewID // Ensure interview ID is set
//              chatMsg.SenderID = userID // Ensure sender ID is correct
//              // TODO: Optionally store chat message in DB
//              hub.broadcastMessage(interviewID, conn, map[string]interface{}{"type": "chat-message", "message": chatMsg})

// 		case "code-update":
//             var codeUpdate models.CodeUpdate
//             jsonData, _ := json.Marshal(message)
//             json.Unmarshal(jsonData, &codeUpdate)
//             codeUpdate.InterviewID = interviewID
//             codeUpdate.SenderID = userID
// 			hub.broadcastMessage(interviewID, conn, map[string]interface{}{"type": "code-update", "code": codeUpdate.Code})

// 		case "whiteboard-update":
//             var wbUpdate models.WhiteboardUpdate
//              jsonData, _ := json.Marshal(message)
//              json.Unmarshal(jsonData, &wbUpdate)
//             wbUpdate.InterviewID = interviewID
//             wbUpdate.SenderID = userID
// 			hub.broadcastMessage(interviewID, conn, map[string]interface{}{"type": "whiteboard-update", "data": wbUpdate.Data})

//         // --- WebRTC Signaling ---
//         case "sending-signal": // Initiator sends signal to peer
//             userToSignal, utsOk := message["userToSignal"].(string)
//             signalData, sdOk := message["signal"]
//             if !utsOk || !sdOk {
//                  log.Printf("Invalid 'sending-signal' message from %s", client.UserID)
//                  continue
//             }
//              // Find the connection of the user to signal
//             peerConn, peerClient := hub.findPeerConn(interviewID, client.UserID) // Find conn of userToSignal
//             if peerConn != nil && peerClient.UserID == userToSignal {
//                 log.Printf("Relaying 'sending-signal' from %s to %s", client.UserID, userToSignal)
//                 err := hub.sendMessageTo(peerConn, map[string]interface{}{
//                     "type": "user-joined", // Peer receives this type
//                     "signal": signalData,
//                     "callerId": client.UserID,
//                 })
//                 if err != nil {
//                      log.Printf("Error relaying 'sending-signal' to %s: %v", userToSignal, err)
//                  }
//             } else {
//                  log.Printf("User %s tried to signal non-existent or incorrect user %s", client.UserID, userToSignal)
//             }

//         case "returning-signal": // Peer returns signal to initiator
//              callerId, ciOk := message["callerId"].(string)
//              signalData, sdOk := message["signal"]
//               if !ciOk || !sdOk {
//                  log.Printf("Invalid 'returning-signal' message from %s", client.UserID)
//                  continue
//              }
//             // Find the connection of the original caller
//             callerConn, callerClient := hub.findPeerConn(interviewID, client.UserID) // Find conn of callerId
//              if callerConn != nil && callerClient.UserID == callerId {
//                  log.Printf("Relaying 'returning-signal' from %s to %s", client.UserID, callerId)
//                 err := hub.sendMessageTo(callerConn, map[string]interface{}{
//                     "type": "receiving-returned-signal", // Caller receives this type
//                     "signal": signalData,
//                     "id": client.UserID, // ID of the user who sent the return signal
//                 })
//                  if err != nil {
//                      log.Printf("Error relaying 'returning-signal' to %s: %v", callerId, err)
//                  }
//             } else {
//                  log.Printf("User %s tried to return signal to non-existent or incorrect caller %s", client.UserID, callerId)
//             }

//          case "end-interview":
//             log.Printf("User %s initiated 'end-interview' for room %s", client.UserID, interviewID)
//             // TODO: Update interview status in DB to 'completed' or 'cancelled'
//              hub.broadcastMessage(interviewID, conn, map[string]interface{}{"type": "interview-ended"})
//              // Optionally force close connections after broadcasting
//              hub.Mutex.RLock()
//              if room, ok := hub.Rooms[interviewID]; ok {
//                  for conn := range room {
//                      conn.Close() // Force close other connections in the room
//                  }
//              }
//              hub.Mutex.RUnlock()
//              // The defer hub.RemoveClient(client) will handle cleanup for the sender

// 		default:
// 			log.Printf("Unknown message type received from %s: %s", client.UserID, msgType)
// 		}
// 	}
// }
// ```
// Added `json` import.
// ```
// <content><![CDATA[package handlers

import (
	// "encoding/json" // Added json import
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"mock-orbit/backend/internal/config"
	"mock-orbit/backend/internal/models"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all connections for development
		// TODO: Restrict origins in production (e.g., check r.Header.Get("Origin"))
		// allowedOrigin := os.Getenv("FRONTEND_URL") // Example: Get from env var
		// return r.Header.Get("Origin") == allowedOrigin
		return true
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

// AddClient adds a client to a room
func (h *Hub) AddClient(client *Client) {
	h.Mutex.Lock()
	defer h.Mutex.Unlock()

	if _, ok := h.Rooms[client.InterviewID]; !ok {
		h.Rooms[client.InterviewID] = make(map[*websocket.Conn]*Client)
		log.Printf("Created new room: %s", client.InterviewID)
	}

    // Prevent adding the same user twice (e.g., multiple tabs) - could be more robust
    // for _, existingClient := range h.Rooms[client.InterviewID] {
    //     if existingClient.UserID == client.UserID {
    //         log.Printf("User %s attempted to join room %s again. Closing new connection.", client.UserID, client.InterviewID)
    //          client.Conn.Close() // Close the new connection attempt
    //         return // Don't add the client
    //     }
    // }


	h.Rooms[client.InterviewID][client.Conn] = client
	log.Printf("Client %s joined room %s. Room size: %d", client.UserID, client.InterviewID, len(h.Rooms[client.InterviewID]))

    // Notify others in the room about the new user (for WebRTC signaling)
    h.notifyOthersOfJoin(client)
}


// RemoveClient removes a client from a room and cleans up the room if empty
func (h *Hub) RemoveClient(client *Client) {
	h.Mutex.Lock()
	defer h.Mutex.Unlock()

	if room, ok := h.Rooms[client.InterviewID]; ok {
		if _, clientOk := room[client.Conn]; clientOk {
            userID := client.UserID // Capture userID before potential deletion

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
// Assumes the Hub Mutex is already held by the caller.
func (h *Hub) broadcastMessageLocked(interviewID string, sender *websocket.Conn, message interface{}) {
	if room, ok := h.Rooms[interviewID]; ok {
		for conn, client := range room {
			if conn != sender { // Don't send back to sender
				err := conn.WriteJSON(message)
				if err != nil {
					log.Printf("Error broadcasting message to client %s in room %s: %v", client.UserID, interviewID, err)
					// Consider scheduling removal instead of direct call to avoid deadlock
                    // scheduleClientRemoval(client)
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
     // Check if the connection still exists in any room
     clientFound := false
     var targetClient *Client
     for _, room := range h.Rooms {
         if client, ok := room[conn]; ok {
             clientFound = true
             targetClient = client
             break
         }
     }
    h.Mutex.RUnlock()

    if !clientFound {
        log.Printf("Attempted to send message to a connection no longer in the hub.")
        return websocket.ErrCloseSent // Indicate the connection is likely gone
    }

    // Use WriteJSON which handles mutex internally for writes on the connection
	err := conn.WriteJSON(message)
	if err != nil {
		log.Printf("Error sending direct message to client %s: %v", targetClient.UserID, err)
        // Consider removing client if write fails (needs locking)
        // go h.RemoveClient(targetClient) // Run removal in separate goroutine?
	}
    return err
}


// notifyOthersOfJoin sends necessary info to existing clients when a new one joins (for WebRTC)
// Assumes the Hub Mutex is already held by the caller (Lock).
func (h *Hub) notifyOthersOfJoin(newClient *Client) {
    room := h.Rooms[newClient.InterviewID]
    existingClientInfos := make([]map[string]string, 0, len(room)-1) // List of existing users {id: "..."}

    for conn, existingClient := range room {
        if existingClient.Conn != newClient.Conn { // If it's an existing client
            existingClientInfos = append(existingClientInfos, map[string]string{"id": existingClient.UserID})

            // Tell existing client about the new user (they might initiate signal)
            err := conn.WriteJSON(map[string]interface{}{
                "type": "user-joined-notification", // Use a distinct type
                "userId": newClient.UserID,
            })
             if err != nil {
                log.Printf("Error notifying client %s about new user %s: %v", existingClient.UserID, newClient.UserID, err)
            }
        }
    }

    // Tell the new client about all existing users immediately after joining
    if len(existingClientInfos) > 0 {
         log.Printf("Sending 'all-users' list to new client %s in room %s. Users: %v", newClient.UserID, newClient.InterviewID, existingClientInfos)
        err := newClient.Conn.WriteJSON(map[string]interface{}{
            "type": "all-users", // Client uses this to know who is already there
            "users": existingClientInfos,
        })
        if err != nil {
             log.Printf("Error sending 'all-users' to new client %s: %v", newClient.UserID, err)
        }
    } else {
         log.Printf("New client %s is the first in room %s.", newClient.UserID, newClient.InterviewID)
    }
}

// FindPeerConn finds the connection and client object of the other participant in the room.
// Assumes the Hub Mutex is already held (RLock or Lock).
func (h *Hub) findPeerConnLocked(interviewID string, selfID string) (*websocket.Conn, *Client) {
    if room, ok := h.Rooms[interviewID]; ok {
        for conn, client := range room {
            if client.UserID != selfID {
                return conn, client // Found the peer
            }
        }
    }
    return nil, nil // Peer not found or room doesn't exist
}


// WebsocketHandler handles WebSocket upgrade requests and manages communication.
func WebsocketHandler(c *gin.Context) {
	interviewID := c.Query("interviewId")
	userID := c.Query("userId") // Should ideally come from validated JWT in a real scenario
    token := c.Query("token") // Temporary way to pass token

	if interviewID == "" || userID == "" || token == "" {
		log.Println("WebSocket upgrade refused: Missing interviewId, userId, or token")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required query parameters (interviewId, userId, token)"})
		return
	}

    // --- Basic Token Validation ---
    claims := jwt.MapClaims{}
    _, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, jwt.NewValidationError("unexpected signing method", jwt.ValidationErrorSignatureInvalid)
        }
        return []byte(config.AppConfig.JWTSecret), nil
    })

    if err != nil {
        log.Printf("WebSocket upgrade refused for user %s in room %s: Invalid token: %v", userID, interviewID, err)
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
        return
    }

     // --- Validate User ID against Token ---
     tokenUserID, ok := claims["user_id"].(string)
     if !ok || tokenUserID != userID {
         log.Printf("WebSocket upgrade refused: User ID '%s' does not match token user ID '%s'", userID, tokenUserID)
         c.JSON(http.StatusForbidden, gin.H{"error": "User ID mismatch"})
         return
     }

    // TODO: Validate that this user (tokenUserID) is actually part of the interview (interviewID) by checking the database.
    // interviewOID, _ := primitive.ObjectIDFromHex(interviewID)
    // userOID, _ := primitive.ObjectIDFromHex(tokenUserID)
    // count, err := interviewCollection.CountDocuments(context.Background(), bson.M{"_id": interviewOID, "$or": []bson.M{{"interviewer_id": userOID}, {"interviewee_id": userOID}}})
    // if err != nil || count == 0 {
    //     log.Printf("WebSocket upgrade refused: User %s not part of interview %s", tokenUserID, interviewID)
    //     c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized for this interview"})
    //     return
    // }


	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error for room %s: %v", interviewID, err)
		// Gin likely handles the response, but logging is important
		return
	}
	defer conn.Close() // Ensure connection is closed when handler exits

	client := &Client{
		Conn:        conn,
		InterviewID: interviewID,
		UserID:      userID, // Use the validated userID from token/query
	}
	hub.AddClient(client)
	// Defer removal until the function (and read loop) exits
    defer func() {
        log.Printf("Removing client %s from room %s due to connection close or error", client.UserID, client.InterviewID)
        hub.RemoveClient(client)
    }()

	// Read messages from the client
	for {
		var message map[string]interface{} // Use map for flexible message structure
		err := conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket read error for client %s in room %s: %v", client.UserID, client.InterviewID, err)
			} else if err == websocket.ErrCloseSent || strings.Contains(err.Error(), "forcibly closed by the remote host") || strings.Contains(err.Error(), "connection reset by peer") {
                 log.Printf("WebSocket connection closed normally for client %s in room %s.", client.UserID, client.InterviewID)
             } else {
				 log.Printf("WebSocket unknown read error for client %s in room %s: %v", client.UserID, client.InterviewID, err)
			}
			break // Exit loop on error or close
		}

		log.Printf("Received message from %s in room %s: Type=%v", client.UserID, client.InterviewID, message["type"])


        // Handle different message types
        msgType, typeOk := message["type"].(string)
        if !typeOk {
            log.Printf("Invalid message format from %s: 'type' field missing or not a string", client.UserID)
            continue
        }

		switch msgType {
		case "chat-message":
             var chatMsg models.ChatMessage
             // More robust unmarshaling needed if 'message' is nested
             msgData, msgDataOk := message["message"].(map[string]interface{})
             if !msgDataOk {
                 log.Printf("Invalid 'chat-message' data format from %s", client.UserID)
                 continue
             }
             // Use helper or direct assignment (be careful with type assertions)
             chatMsg.Text, _ = msgData["text"].(string)
             // Assuming senderName and timestamp are generated/validated server-side or trusted from client
             chatMsg.InterviewID = interviewID
             chatMsg.SenderID = userID
             chatMsg.SenderName = "" // Fetch or use name from user data if needed
             chatMsg.Timestamp = time.Now().UnixMilli() // Set server time

             // TODO: Optionally store chat message in DB
             hub.BroadcastMessage(interviewID, conn, map[string]interface{}{"type": "chat-message", "message": chatMsg})

		case "code-update":
            code, codeOk := message["code"].(string)
            if !codeOk {
                log.Printf("Invalid 'code-update' format from %s", client.UserID)
                continue
            }
            hub.BroadcastMessage(interviewID, conn, map[string]interface{}{
                "type": "code-update",
                "code": code,
                "senderId": userID, // Let clients know who sent it
            })


		case "whiteboard-update":
            wbData, dataOk := message["data"] // data can be complex
            if !dataOk {
                 log.Printf("Invalid 'whiteboard-update' format from %s", client.UserID)
                continue
            }
			hub.BroadcastMessage(interviewID, conn, map[string]interface{}{
                "type": "whiteboard-update",
                "data": wbData,
                "senderId": userID,
            })

        // --- WebRTC Signaling ---
        case "sending-signal": // Initiator sends signal to peer
            userToSignal, utsOk := message["userToSignal"].(string)
            signalData, sdOk := message["signal"]
            if !utsOk || !sdOk {
                 log.Printf("Invalid 'sending-signal' message from %s: Missing fields", client.UserID)
                 continue
            }
             // Find the connection of the user to signal
            hub.Mutex.RLock() // Lock for reading hub state
            peerConn, peerClient := hub.findPeerConnLocked(interviewID, client.UserID)
            hub.Mutex.RUnlock()

            if peerConn != nil && peerClient.UserID == userToSignal {
                log.Printf("Relaying 'sending-signal' from %s to %s in room %s", client.UserID, userToSignal, interviewID)
                err := hub.SendMessageTo(peerConn, map[string]interface{}{
                    "type": "user-joined", // Peer receives this when someone initiates a connection TO them
                    "signal": signalData,
                    "callerId": client.UserID, // The ID of the user sending the initial signal
                })
                if err != nil {
                     log.Printf("Error relaying 'sending-signal' to %s: %v", userToSignal, err)
                 }
            } else {
                 log.Printf("User %s tried to signal non-existent or incorrect user %s in room %s", client.UserID, userToSignal, interviewID)
                 // Optionally send an error back to the sender
                 // hub.SendMessageTo(conn, map[string]interface{}{"type": "signal-error", "message": "Peer not found"})
            }


        case "returning-signal": // Peer returns signal to initiator
             callerId, ciOk := message["callerId"].(string) // The ID of the user who INITIATED the connection
             signalData, sdOk := message["signal"]
              if !ciOk || !sdOk {
                 log.Printf("Invalid 'returning-signal' message from %s: Missing fields", client.UserID)
                 continue
             }
            // Find the connection of the original caller
             hub.Mutex.RLock()
             callerConn, callerClient := hub.findPeerConnLocked(interviewID, client.UserID) // Find conn matching callerId
             hub.Mutex.RUnlock()

             if callerConn != nil && callerClient.UserID == callerId {
                 log.Printf("Relaying 'returning-signal' from %s to %s in room %s", client.UserID, callerId, interviewID)
                err := hub.SendMessageTo(callerConn, map[string]interface{}{
                    "type": "receiving-returned-signal", // Caller receives this to complete connection
                    "signal": signalData,
                    "id": client.UserID, // ID of the user who sent the return signal (the peer)
                })
                 if err != nil {
                     log.Printf("Error relaying 'returning-signal' to %s: %v", callerId, err)
                 }
            } else {
                 log.Printf("User %s tried to return signal to non-existent or incorrect caller %s in room %s", client.UserID, callerId, interviewID)
                  // Optionally send an error back to the sender
                 // hub.SendMessageTo(conn, map[string]interface{}{"type": "signal-error", "message": "Original caller not found"})
            }

         case "end-interview":
            log.Printf("User %s initiated 'end-interview' for room %s", client.UserID, interviewID)
            // TODO: Update interview status in DB to 'completed' or 'cancelled' by emitting an event or calling a service
             hub.BroadcastMessage(interviewID, conn, map[string]interface{}{"type": "interview-ended"})

             // Force close connections after broadcasting (needs careful locking)
             go func() { // Use goroutine to avoid blocking the read loop
                 hub.Mutex.Lock() // Acquire full lock to modify hub state
                 defer hub.Mutex.Unlock()
                 if room, ok := hub.Rooms[interviewID]; ok {
                     log.Printf("Force closing all connections in room %s due to 'end-interview'", interviewID)
                     for connToClose, clientToClose := range room {
                         if connToClose != conn { // Don't close the sender's connection immediately
                             log.Printf("Closing connection for user %s", clientToClose.UserID)
                             connToClose.Close()
                             // Removal will happen via defer in the client's read loop
                         }
                     }
                 }
             }()
             // The sender's loop will exit naturally after this, triggering their defer hub.RemoveClient

		default:
			log.Printf("Unknown message type received from %s: %s", client.UserID, msgType)
		}
	}
}

// Helper to marshal message data (replace direct map access later)
// func marshalToStruct(data interface{}, target interface{}) error {
//     bytes, err := json.Marshal(data)
//     if err != nil {
//         return err
//     }
//     return json.Unmarshal(bytes, target)
// }
