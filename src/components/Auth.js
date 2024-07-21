import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import axios from 'axios';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });
    return () => unsubscribe();
  }, [setUser]);

  const signUp = async () => {
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user's country based on IP address
      const response = await axios.get('https://ipinfo.io?token=7b812b488cc942');
      const country = response.data.country;

      // Fetch the full country name
      const countryNameResponse = await axios.get(`https://restcountries.com/v3.1/alpha/${country}`);
      const fullCountryName = countryNameResponse.data[0].name.common;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        baseCountry: fullCountryName,
      });

      setUser(user);
    } catch (error) {
      setError(error.message);
    }
  };

  const login = async () => {
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mt: 2 }}>
      <Typography variant="h6" gutterBottom>Sign Up / Login</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={signUp} fullWidth sx={{ mb: 2 }}>
        Sign Up
      </Button>
      <Button variant="contained" color="secondary" onClick={login} fullWidth>
        Login
      </Button>
    </Box>
  );
};

export default Auth;
