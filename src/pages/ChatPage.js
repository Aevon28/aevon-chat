import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ChatContext from '../context/ChatContext';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const { conversations, messages } = useContext(ChatContext);
  const { conversationId } = useParams();
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (conversationId) {
      const conversation = conversations.find((c) => c._id === conversationId);
      setSelectedConversation(conversation);
    }
  }, [conversationId, conversations]);

  return (
    <div className="chat-page">
      <ChatList conversations={conversations} onSelectConversation={setSelectedConversation} />
      {selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          messages={messages[selectedConversation._id] || []}
        />
      ) : (
        <div className="no-chat-selected">
          <p>Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
