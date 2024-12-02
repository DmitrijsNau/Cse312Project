import React, { useState, useEffect } from 'react';
import styles from './ChatModal.module.css';

const ChatModal = ({ isOpen, onClose, recipientId, socket }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      };
    }
  }, [socket]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      const message = { content: input, timestamp: Date.now() };
      socket.send(JSON.stringify(message));
      setMessages((prev) => [...prev, message]);
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>×</button>
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
    </div>
  );
};

export default ChatModal;