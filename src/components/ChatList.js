import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/ChatList.css';

const ChatList = ({ conversations, onSelectConversation }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.participants.find((p) => p._id !== user._id);
    return otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectConversation = (conversation) => {
    onSelectConversation(conversation);
    navigate(`/chat/${conversation._id}`);
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Chats</h2>
        <button className="settings-btn" onClick={() => navigate('/settings')}>
          ⚙️
        </button>
      </div>
      <div className="chat-search">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="conversations">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => {
            const otherUser = conversation.participants.find((p) => p._id !== user._id);
            return (
              <div
                key={conversation._id}
                className="conversation-item"
                onClick={() => handleSelectConversation(conversation)}
              >
                <img src={otherUser?.avatar} alt={otherUser?.username} />
                <div className="conversation-info">
                  <h3>{otherUser?.username}</h3>
                  <p>{conversation.lastMessage?.content || 'No messages yet'}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-conversations">No conversations yet</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
