import React, { useState, useContext, useEffect, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import ChatContext from '../context/ChatContext';
import '../styles/ChatWindow.css';

const ChatWindow = ({ conversation, messages }) => {
  const { user } = useContext(AuthContext);
  const { sendMessage, setTyping, stopTyping, typingUsers, onlineUsers } = useContext(ChatContext);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const otherUser = conversation.participants.find((p) => p._id !== user._id);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    if (!isTyping) {
      setTyping(conversation._id, otherUser._id);
      setIsTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversation._id, otherUser._id);
      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(conversation._id, otherUser._id, inputValue);
      setInputValue('');
      stopTyping(conversation._id, otherUser._id);
      setIsTyping(false);
    }
  };

  const isUserTyping = typingUsers[conversation._id]?.isTyping;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="user-info">
          <img src={otherUser?.avatar} alt={otherUser?.username} />
          <div>
            <h2>{otherUser?.username}</h2>
            <p className="online-status">
              {onlineUsers.has(otherUser?._id) ? (
                <span className="online">Online</span>
              ) : (
                <span className="offline">Offline</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === user._id ? 'sent' : 'received'}`}
            >
              <div className="message-content">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))
        ) : (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        )}
        {isUserTyping && <div className="typing-indicator">typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={handleInputChange}
          disabled={!conversation}
        />
        <button type="submit" disabled={!inputValue.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
