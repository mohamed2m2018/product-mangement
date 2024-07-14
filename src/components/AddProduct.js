// src/components/AddProduct.js
import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';

const AddProduct = ({ productId }) => {
  const [user] = useAuthState(auth); // Hook to get the current authenticated user
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); // New state for price
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setName(productData.name);
          setDescription(productData.description);
          setPrice(productData.price);
          setImagePreview(productData.imageUrl);
        }
      }
    };

    fetchProduct();
  }, [productId]);

  const handleImageUpload = async (file) => {
    try {
      const imageRef = ref(storage, `product_images/${file.name}`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const saveProduct = async () => {
    if (!name || !description || !price || (!image && !imagePreview)) {
      alert('Please fill all fields and select an image');
      return;
    }

    if (!user) {
      alert('You must be logged in to add or edit a product');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = image ? await handleImageUpload(image) : imagePreview;

      if (productId) {
        // Update existing product
        await updateDoc(doc(db, 'products', productId), {
          name,
          description,
          price,
          imageUrl,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
          name,
          description,
          price,
          createdAt: serverTimestamp(),
          imageUrl,
          ownerId: user.uid, // Adding the ownerId
          ownerEmail: user.email, // Adding the ownerEmail
        });
      }

      setName('');
      setDescription('');
      setPrice('');
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mt: 2 }}>
      <Typography variant="h6" gutterBottom>{productId ? 'Edit Product' : 'Add Product'}</Typography>
      <TextField
        fullWidth
        label="Product Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Product Description"
        variant="outlined"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Product Price"
        variant="outlined"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        component="label"
        fullWidth
        sx={{ mb: 2 }}
      >
        Upload Image
        <input
          type="file"
          hidden
          onChange={handleImageChange}
        />
      </Button>
      {imagePreview && (
        <Box sx={{ mb: 2 }}>
          <img src={imagePreview} alt="Selected" style={{ maxWidth: '100%' }} />
        </Box>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={saveProduct}
        fullWidth
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : (productId ? 'Update Product' : 'Add Product')}
      </Button>
    </Box>
  );
};

export default AddProduct;
