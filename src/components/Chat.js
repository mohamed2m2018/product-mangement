import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebaseConfig';
import { addDoc, collection, orderBy, query, onSnapshot } from 'firebase/firestore';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';

const Chat = ({ user, recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchChatRoomMessages = async () => {
      try {
        const roomId = [user.uid, recipientId].sort().join('_');
        setChatRoomId(roomId);
        const q = query(
          collection(db, 'chatRooms', roomId, 'messages'),
          orderBy('createdAt')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const messagesList = [];
          querySnapshot.forEach((doc) => {
            messagesList.push({ id: doc.id, ...doc.data() });
          });
          setMessages(messagesList);
          scrollToBottom();
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (recipientId) {
      fetchChatRoomMessages();
    }
  }, [user.uid, recipientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const message = {
      text: newMessage,
      createdAt: new Date(),
      userId: user.uid,
      userName: user.email,
      translatedText: '', // This will be updated by the Firebase Function
    };

    await addDoc(collection(db, 'chatRooms', chatRoomId, 'messages'), message);
    setNewMessage('');
    scrollToBottom();
  };

  useEffect(() => {
    inputRef.current?.focus();
    scrollToBottom();
  }, [recipientId]);

  return (
    <Box>
      <Typography variant="h6">Chat with {recipientId}</Typography>
      <List>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <ListItemText primary={msg.text} secondary={msg.translatedText || 'Translating...'} />
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <Box sx={{ display: 'flex', mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          inputRef={inputRef}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
