import React, { createContext, useState, useCallback, useContext } from 'react';
import io from 'socket.io-client';
import AuthContext from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState({});
  const [conversations, setConversations] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Initialize Socket.io connection
  React.useEffect(() => {
    if (user && token) {
      const newSocket = io(process.env.REACT_APP_API_URL, {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('user_online', user._id);
      });

      newSocket.on('receive_message', (data) => {
        const conversationId = data.conversationId;
        setMessages((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), data],
        }));
      });

      newSocket.on('user_typing', (data) => {
        setTypingUsers((prev) => ({
          ...prev,
          [data.conversationId]: {
            userId: data.userId,
            isTyping: data.isTyping,
          },
        }));
      });

      newSocket.on('user_status_changed', (data) => {
        if (data.isOnline) {
          setOnlineUsers((prev) => new Set([...prev, data.userId]));
        } else {
          setOnlineUsers((prev) => {
            const updated = new Set(prev);
            updated.delete(data.userId);
            return updated;
          });
        }
      });

      newSocket.on('message_read_receipt', (data) => {
        // Handle read receipts
        console.log('Message read:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token]);

  const sendMessage = useCallback(
    (conversationId, receiverId, content, messageType = 'text') => {
      if (socket) {
        socket.emit('send_message', {
          conversationId,
          receiverId,
          senderId: user._id,
          content,
          messageType,
        });
      }
    },
    [socket, user]
  );

  const setTyping = useCallback(
    (conversationId, receiverId) => {
      if (socket) {
        socket.emit('typing', {
          conversationId,
          receiverId,
          senderId: user._id,
        });
      }
    },
    [socket, user]
  );

  const stopTyping = useCallback(
    (conversationId, receiverId) => {
      if (socket) {
        socket.emit('stop_typing', {
          conversationId,
          receiverId,
          senderId: user._id,
        });
      }
    },
    [socket, user]
  );

  const markMessageAsRead = useCallback(
    (messageId, receiverId) => {
      if (socket) {
        socket.emit('message_read', {
          messageId,
          receiverId,
          senderId: user._id,
        });
      }
    },
    [socket, user]
  );

  return (
    <ChatContext.Provider
      value={{
        socket,
        messages,
        conversations,
        typingUsers,
        onlineUsers,
        sendMessage,
        setTyping,
        stopTyping,
        markMessageAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
