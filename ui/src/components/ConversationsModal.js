import React, { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, ArrowLeft, Send } from "lucide-react";
import styles from "./ConversationsModal.module.css";
import config from "@config";

const ConversationsModal = ({ isOpen, onClose }) => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("");
  const messagesEndRef = useRef(null);

  // VERY NECESSARY CHANGE THAT DIDN'T EVEN TAKE THAT LONG (LIE)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("/api/auth/status", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUsername(data.username);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };
    fetchUsername();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [usersResponse, convsResponse] = await Promise.all([
        fetch("/api/conversations/available-users", {
          credentials: "include",
        }),
        fetch("/api/conversations/get-all", {
          credentials: "include",
        }),
      ]);

      if (!usersResponse.ok || !convsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const [usersData, convsData] = await Promise.all([
        usersResponse.json(),
        convsResponse.json(),
      ]);

      setAvailableUsers(usersData);
      setConversations(convsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load conversations");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  useEffect(() => {
    if (activeConversation) {
      const ws = new WebSocket(`${config.wsUrl}/chat/${activeConversation.id}`);

      ws.onopen = async () => {
        console.log("WebSocket connected");
        setError(null);

        try {
          const response = await fetch(`/api/conversations/get-all`, {
            credentials: "include",
          });
          if (response.ok) {
            const allConversations = await response.json();
            const currentConv = allConversations.find(
              (conv) => conv.id === activeConversation.id,
            );
            if (currentConv && currentConv.messages) {
              setMessages(currentConv.messages);
              setTimeout(scrollToBottom, 100);
            }
          }
        } catch (error) {
          console.error("Error fetching latest messages:", error);
        }
      };

      ws.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        setMessages((prev) => [...prev, messageData]);
        setTimeout(scrollToBottom, 100);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Failed to connect to chat");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event);
        if (event.code === 1008) {
          setError("Authentication error. Please log in again.");
        } else if (event.code === 4403) {
          setError("Not authorized for this conversation");
        }
      };

      setSocket(ws);

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }
  }, [activeConversation]);

  const startNewConversation = async (userId) => {
    try {
      const response = await fetch(
        `/api/conversations/create?user_id=${userId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const newConversation = await response.json();
      await fetchData();

      const fullConversation = conversations.find(
        (c) => c.id === newConversation.id,
      );
      if (fullConversation) {
        setActiveConversation(fullConversation);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const sendMessage = () => {
    if (socket?.readyState === WebSocket.OPEN && input.trim()) {
      const messageData = {
        content: input.trim(),
        timestamp: new Date().toISOString(),
        sender_username: currentUsername,
      };
      socket.send(JSON.stringify(messageData));
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {!activeConversation ? (
          <div className={styles.conversationList}>
            <div className={styles.modalHeader}>
              <h3>Messages</h3>
              <button onClick={onClose} className={styles.closeButton}>
                ×
              </button>
            </div>

            {conversations.length === 0 ? (
              availableUsers.length > 0 ? (
                <div className={styles.availableUsers}>
                  <p className={styles.sectionTitle}>
                    Start a conversation with:
                  </p>
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className={styles.userItem}
                      onClick={() => startNewConversation(user.id)}
                    >
                      <div className={styles.userAvatar}>
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className={styles.username}>{user.username}</span>
                      <MessageCircle className={styles.messageIcon} size={20} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <MessageCircle size={48} className={styles.emptyStateIcon} />
                  <p>No conversations available.</p>
                  <p className={styles.emptyStateSubtext}>
                    Like some pets to start chatting!
                  </p>
                </div>
              )
            ) : (
              <>
                {availableUsers.length > 0 && (
                  <div className={styles.newChatSection}>
                    <p className={styles.sectionTitle}>New Conversation</p>
                    <div className={styles.usersList}>
                      {availableUsers.map((user) => (
                        <div
                          key={user.id}
                          className={styles.userItem}
                          onClick={() => startNewConversation(user.id)}
                        >
                          <div className={styles.userAvatar}>
                            {user.username[0].toUpperCase()}
                          </div>
                          <span className={styles.username}>
                            {user.username}
                          </span>
                          <MessageCircle
                            className={styles.messageIcon}
                            size={20}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.existingChats}>
                  <p className={styles.sectionTitle}>Recent Chats</p>
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={styles.conversationItem}
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `/api/conversations/get-all`,
                            {
                              credentials: "include",
                            },
                          );
                          if (response.ok) {
                            const allConversations = await response.json();
                            const updatedConv = allConversations.find(
                              (c) => c.id === conv.id,
                            );
                            if (updatedConv) {
                              setActiveConversation(updatedConv);
                            } else {
                              setActiveConversation(conv);
                            }
                          } else {
                            setActiveConversation(conv);
                          }
                        } catch (error) {
                          console.error(
                            "Error fetching updated conversation:",
                            error,
                          );
                          setActiveConversation(conv);
                        }
                      }}
                    >
                      <div className={styles.userAvatar}>
                        {conv.recipient_username[0].toUpperCase()}
                      </div>
                      <div className={styles.conversationInfo}>
                        <span className={styles.recipientName}>
                          {conv.recipient_username}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
              <button
                onClick={() => setActiveConversation(null)}
                className={styles.backButton}
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <span className={styles.recipientName}>
                {activeConversation.recipient_username}
              </span>
              <button onClick={onClose} className={styles.closeButton}>
                ×
              </button>
            </div>

            <div className={styles.chatMessages}>
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.id || idx}-${msg.timestamp}`}
                  className={`${styles.message} ${
                    msg.sender_username === currentUsername
                      ? styles.ownMessage
                      : styles.otherMessage
                  }`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageSender}>
                        {msg.sender_username}
                      </span>
                    </div>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputContainer}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className={styles.messageInput}
              />
              <button
                onClick={sendMessage}
                className={styles.sendButton}
                disabled={!input.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsModal;
