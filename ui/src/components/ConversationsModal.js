import React, { useState, useEffect } from 'react';
import styles from './ConversationsModal.module.css';

const ConversationsModal = ({ isOpen, onClose, recipientId }) => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Fetch user's conversations when modal opens
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeConversation) {
      const ws = new WebSocket(`ws://localhost:8080/ws?conversationId=${activeConversation.id}`);
      ws.onopen = () => {
        console.log('WebSocket connected');
      };
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      };
      setSocket(ws);

      return () => {
        ws.close();
        setSocket(null);
      };
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations/get-all', { credentials: 'include' });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations', error);
    }
  };
  

  const sendMessage = () => {
    if (socket && input.trim()) {
      const message = { content: input, timestamp: Date.now() };
      socket.send(JSON.stringify(message));
      setMessages((prev) => [...prev, message]);
      setInput('');
    }
  };

  const setActiveConvo = (conversation) => {
    setActiveConversation(conversation);
    setMessages(conversation.messages);
  }

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>×</button>
        {!activeConversation ? (
          <div className={styles.conversationList}>
            <h3>Your Conversations</h3>
            {conversations.length === 0 && <p>No conversations yet</p>}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={styles.conversationItem}
                onClick={() => setActiveConvo(conv)}
              >
                {conv.recipient_username}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.chatContainer}>
            <button onClick={() => setActiveConvo(null)} className={styles.backButton}>
              Back to Conversations
            </button>
            <div className={styles.chatMessages}>
              {messages.map((msg, idx) => (
                <div key={idx} className={styles.message}>
                  <span>{msg.content}</span>
                  <span className={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsModal;