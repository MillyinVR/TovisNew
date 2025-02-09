import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  read: boolean;
};

type Conversation = {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage: Message;
};

type MessagingContextType = {
  messages: Message[];
  conversations: Conversation[];
  activeConversation?: Conversation;
  sendMessage: (message: {
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: string;
  }) => Promise<void>;
  getConversation: (recipientId: string) => Message[];
  markMessagesAsRead: (conversationId: string, userId: string) => void;
};

  const MessagingContext = createContext<MessagingContextType>({
    messages: [],
    conversations: [],
    sendMessage: async () => {},
    getConversation: () => [],
    markMessagesAsRead: () => {}
  });

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const messagesQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as Message[];
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const sendMessage = async (message: {
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: string;
  }) => {
    if (!currentUser?.uid) return;

    await addDoc(collection(db, 'conversations'), {
      senderId: message.senderId,
      recipientId: message.conversationId,
      content: message.content,
      timestamp: serverTimestamp(),
      read: false,
      participants: [message.senderId, message.conversationId]
    });
  };

  const getConversation = (recipientId: string) => {
    return messages.filter(message => 
      (message.senderId === currentUser?.uid && message.recipientId === recipientId) ||
      (message.senderId === recipientId && message.recipientId === currentUser?.uid)
    );
  };

  const markMessagesAsRead = async (conversationId: string, userId: string) => {
    if (!currentUser?.uid) return;
    
    // Update all messages in the conversation for this user
    const conversationMessages = messages.filter(message =>
      (message.senderId === conversationId && message.recipientId === currentUser.uid) ||
      (message.senderId === currentUser.uid && message.recipientId === conversationId)
    );
    
    // TODO: Implement Firestore update to mark messages as read
    // This would require a batch update to mark all relevant messages as read
    // For now, we'll just update the local state
    setMessages(prevMessages => prevMessages.map(message => {
      if (message.recipientId === currentUser.uid && !message.read) {
        return { ...message, read: true };
      }
      return message;
    }));
  };

  return (
    <MessagingContext.Provider value={{ 
      messages, 
      conversations: [], 
      sendMessage, 
      getConversation, 
      markMessagesAsRead 
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export const useMessaging = () => useContext(MessagingContext);
