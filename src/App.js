// src/App.js
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import AddProduct from './components/AddProduct';
import ProductList from './components/ProductList';
import Chat from './components/Chat';
import ChatList from './components/ChatList';
import { Container, Box, Grid, Typography, CircularProgress, Button } from '@mui/material';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ pt: 10 }}>
        {!user ? (
          <Auth setUser={setUser} />
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Welcome, {user.email}</Typography>
              <Button sx={{ width: 100 }} variant="contained" color="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ mt: 1 }}>
                <AddProduct />
                <ProductList />
              </Grid>
              <Grid item xs={12} md={4} sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <ChatList user={user} setSelectedRecipient={setSelectedRecipient} />
              </Grid>
              <Grid item xs={12} md={8} sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {selectedRecipient ? (
                  <Box>
                    <Chat user={user} recipientId={selectedRecipient} />
                  </Box>
                ) : (
                  <Typography variant="h6" sx={{ mt: 2 }}>Select a recipient to start chatting</Typography>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Container>
  );
};

export default App;
