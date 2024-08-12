import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebaseConfig';
import {
  addDoc,
  collection,
  orderBy,
  query,
  onSnapshot,
} from 'firebase/firestore';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  Paper,
  Avatar,
} from '@mui/material';

const Chat = ({ user, recipientId, productId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchChatRoomMessages = async () => {
      try {
        if (!recipientId || !productId) return; // Early return if IDs are not set

        console.log('Fetching chat room messages...', recipientId, productId);

        // Create chat room ID by combining user IDs and product ID
        const roomId = [user.uid, recipientId, productId].sort().join('_');
        setChatRoomId(roomId);

        const q = query(
          collection(db, 'chatRooms', roomId, 'messages'),
          orderBy('createdAt', 'asc'),
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const messagesList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(messagesList);

          // Set recipient name from the first message that's not from the current user
          const recipientMessage = messagesList.find(
            (msg) => msg.userId !== user.uid,
          );
          if (recipientMessage) {
            setRecipientName(recipientMessage.userName);
          } else {
            setRecipientName("Unknown User");
          }

          scrollToBottom();
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchChatRoomMessages();
  }, [user.uid, recipientId, productId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const message = {
      text: newMessage,
      createdAt: new Date(),
      userId: user.uid,
      userName: user.displayName || user.email.split('@')[0],
      translatedText: '',
    };

    await addDoc(collection(db, 'chatRooms', chatRoomId, 'messages'), message);
    setNewMessage('');
    scrollToBottom();
  };

  useEffect(() => {
    inputRef.current?.focus();
    scrollToBottom();
  }, [messages]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ mr: 2 }}>
          {recipientName ? recipientName[0].toUpperCase() : '?'}
        </Avatar>
        <Typography variant="h6">Chat with {recipientName}</Typography>
      </Box>
      <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((msg, index) => (
          <ListItem
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.userId === user.uid ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Typography variant="caption" sx={{ mb: 0.5 }}>
              {msg.userId === user.uid ? 'You' : msg.userName}
            </Typography>
            <Paper
              elevation={2}
              sx={{
                p: 1,
                maxWidth: '70%',
                backgroundColor:
                  msg.userId === user.uid ? '#e3f2fd' : '#f5f5f5',
                borderRadius:
                  msg.userId === user.uid
                    ? '20px 20px 0 20px'
                    : '20px 20px 20px 0',
              }}
            >
              <Typography variant="body1">{msg.text}</Typography>
              {msg.translatedText && (
                <Typography variant="body2" color="textSecondary">
                  {msg.translatedText}
                </Typography>
              )}
            </Paper>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <Box sx={{ display: 'flex', p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          inputRef={inputRef}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          sx={{ ml: 1 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
