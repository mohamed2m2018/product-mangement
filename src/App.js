// src/App.js
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import AddProduct from './components/AddProduct';
import ProductList from './components/ProductList';
import Chat from './components/Chat';
import ChatList from './components/ChatList';
import { Container, Box, Typography, CircularProgress, Button, Tabs, Tab, Grid, AppBar, Toolbar, Snackbar, Alert } from '@mui/material';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ChatIcon from '@mui/icons-material/Chat';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <motion.div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: value === index ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </motion.div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#673ab7',
    },
    secondary: {
      main: '#ff5722',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: '48px',
          '&.Mui-selected': {
            color: '#673ab7',
          },
        },
      },
    },
  },
});

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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
    setSnackbarMessage('Logged out successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleProductAdded = () => {
    setTabIndex(1); // Switch to the Product List tab (index 1)
    setSnackbarMessage('Product added successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
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
    <ThemeProvider theme={theme}>
      <Container>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Inseparable App
            </Typography>
            {user && (
              <Button color="secondary" variant="contained" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Box sx={{ pt: 10 }}>
          {!user ? (
            <Auth setUser={setUser} />
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Welcome, {user.email}</Typography>
              </Box>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                  value={tabIndex}
                  onChange={handleTabChange}
                  aria-label="enhanced tabs example"
                  textColor="primary"
                  indicatorColor="primary"
                  centered
                >
                  <Tab icon={<AddBoxIcon />} label="Add Product" {...a11yProps(0)} />
                  <Tab icon={<ListAltIcon />} label="Product List" {...a11yProps(1)} />
                  <Tab icon={<ChatIcon />} label="Chat" {...a11yProps(2)} />
                </Tabs>
              </Box>
              <TabPanel value={tabIndex} index={0}>
                <AddProduct onProductAdded={handleProductAdded} />
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
                <ProductList />
              </TabPanel>
              <TabPanel value={tabIndex} index={2}>
                <Grid container spacing={2}>
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
              </TabPanel>
            </>
          )}
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default App;