import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message } from './Message';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';

export const ConversationView: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { 
    activeConversation, 
    sendMessage,
    markMessagesAsRead
  } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (activeConversation?.id && currentUser?.uid) {
      markMessagesAsRead(activeConversation.id, currentUser.uid);
    }
  }, [activeConversation, currentUser, markMessagesAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !currentUser) return;
    
    await sendMessage({
      conversationId: activeConversation.id,
      senderId: currentUser.uid,
      content: newMessage,
      timestamp: new Date().toISOString()
    });
    setNewMessage('');
  };

  if (!activeConversation) {
    return (
      <div className="flex flex-col h-full justify-center items-center p-4">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b bg-white sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Messages
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeConversation.messages.map((message) => (
          <Message 
            key={message.id} 
            message={message}
            isCurrentUser={message.senderId === currentUser?.uid}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
