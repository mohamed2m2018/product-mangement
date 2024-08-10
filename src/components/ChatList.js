import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { List, ListItem, ListItemText, Typography, Box, CircularProgress, Avatar } from '@mui/material';

const ChatList = ({ user, setSelectedRecipient }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        console.log("Fetching data from Firestore collection group...");
        const querySnapshot = await getDocs(collectionGroup(db, 'messages'));
        console.log("Query successful. Snapshot received:", querySnapshot);

        const rooms = querySnapshot.docs.reduce((acc, doc) => {
          const chatRoomId = doc.ref.path.split('/')[1];
          if (chatRoomId.includes(user.uid)) {
            if (!acc[chatRoomId]) {
              acc[chatRoomId] = { id: chatRoomId, participants: chatRoomId.split('_'), messages: [] };
            }
            acc[chatRoomId].messages.push(doc.data());
          }
          return acc;
        }, {});

        const chatRoomsArray = Object.values(rooms).map(room => {
          const otherUserMessage = room.messages.find(msg => msg.userId !== user.uid);
          const otherUserName = otherUserMessage ? otherUserMessage.userName : 'Unknown User';
          return { ...room, otherUserName };
        });

        console.log("Processed chat rooms:", chatRoomsArray);
        setChatRooms(chatRoomsArray);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching collection group data:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [user.uid]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', overflowY: 'auto', maxHeight: '400px' }}>
      <Typography variant="h6" gutterBottom>Chat Rooms</Typography>
      <List>
        {chatRooms.map((room) => {
          const recipientId = room.participants.find(id => id !== user.uid);
          const avatarLetter = room.otherUserName ? room.otherUserName[0].toUpperCase() : '?';
          const lastMessage = room.messages[room.messages.length - 1];
          return (
            <ListItem button key={room.id} onClick={() => setSelectedRecipient(recipientId)}>
              <Avatar sx={{ mr: 2 }}>{avatarLetter}</Avatar>
              <ListItemText 
                primary={room.otherUserName} 
                secondary={`Last message: ${lastMessage?.text || 'No messages yet'}`} 
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default ChatList;