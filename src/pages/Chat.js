import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import axios from 'axios';
import '../styles/Chat.css';

const Chat = () => {
  const { user } = useSelector(state => state.auth);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    const newSocket = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(newSocket);
    newSocket.on('receive-message', (data) => setMessages(prev => [...prev, data]));
    return () => newSocket.close();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
      setUsers(response.data.filter(u => u._id !== user?.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket && selectedUser) {
      const messageData = {
        sender: user.id,
        recipient: selectedUser._id,
        content: newMessage,
        timestamp: new Date()
      };
      socket.emit('send-message', messageData);
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <h2>Chats</h2>
        <div className="users-list">
          {users.map(u => (
            <div key={u._id} className={`user-item ${selectedUser?._id === u._id ? 'active' : ''}`} onClick={() => setSelectedUser(u)}>
              <div className="user-avatar">{u.username?.[0]?.toUpperCase()}</div>
              <h4>{u.username}</h4>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header"><h2>{selectedUser.username}</h2></div>
            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.sender === user.id ? 'sent' : 'received'}`}>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p className="no-user-selected">Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
