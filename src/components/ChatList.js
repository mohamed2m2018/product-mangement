import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collectionGroup, getDocs, doc, getDoc } from 'firebase/firestore';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Avatar,
} from '@mui/material';

const ChatList = ({ user, setSelectedRecipient, setSelectedProductId }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        console.log('Fetching data from Firestore collection group...');
        const querySnapshot = await getDocs(collectionGroup(db, 'messages'));
        console.log('Query successful. Snapshot received:', querySnapshot);

        const rooms = querySnapshot.docs.reduce((acc, doc) => {
          const chatRoomId = doc.ref.path.split('/')[1];
          if (chatRoomId.includes(user.uid)) {
            if (!acc[chatRoomId]) {
              acc[chatRoomId] = {
                id: chatRoomId,
                participants: chatRoomId.split('_'),
                messages: [],
              };
            }
            acc[chatRoomId].messages.push(doc.data());
          }
          return acc;
        }, {});

        // Fetch product names and construct chat room details
        const chatRoomsArray = await Promise.all(
          Object.values(rooms).map(async (room) => {
            const productId = room.participants[2]; // Assuming the product ID is always in the third position
            let productName = 'Unknown Product';

            try {
              const productDocRef = doc(db, 'products', productId);
              const productDoc = await getDoc(productDocRef);
              if (productDoc.exists()) {
                productName = productDoc.data().name;
              }
            } catch (err) {
              console.error('Error fetching product data:', err);
            }

            const otherUserMessage = room.messages.find(
              (msg) => msg.userId !== user.uid,
            );
            const otherUserName = otherUserMessage
              ? otherUserMessage.userName
              : 'Unknown User';

            return { ...room, otherUserName, productName };
          }),
        );

        console.log('Processed chat rooms with product names:', chatRoomsArray);
        setChatRooms(chatRoomsArray);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching collection group data:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [user.uid]);

  const handleSelectChatRoom = (room) => {
    const recipientId = room.participants.find((id) => id !== user.uid);
    const productId = room.participants[2];
    setSelectedRecipient(recipientId);
    setSelectedProductId(productId);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflowY: 'auto',
        maxHeight: '400px',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Chat Rooms
      </Typography>
      <List>
        {chatRooms.map((room) => {
          const avatarLetter = room.otherUserName
            ? room.otherUserName[0].toUpperCase()
            : '?';
          const lastMessage = room.messages[room.messages.length - 1];
          return (
            <ListItem
              button
              key={room.id}
              onClick={() => handleSelectChatRoom(room)}
            >
              <Avatar sx={{ mr: 2 }}>{avatarLetter}</Avatar>
              <ListItemText
                primary={`${room.otherUserName} - ${room.productName}`}
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
