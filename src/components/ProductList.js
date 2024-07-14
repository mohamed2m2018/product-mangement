// src/components/ProductList.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Box, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState(''); // New state for price
  const [deleteProduct, setDeleteProduct] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsList = [];
      querySnapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsList);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (product) => {
    setEditProduct(product);
    setEditName(product.name);
    setEditDescription(product.description);
    setEditPrice(product.price); // Set price for editing
  };

  const handleSave = async () => {
    const productRef = doc(db, 'products', editProduct.id);
    await updateDoc(productRef, {
      name: editName,
      description: editDescription,
      price: editPrice, // Update price
    });
    setEditProduct(null);
  };

  const handleDelete = async () => {
    const productRef = doc(db, 'products', deleteProduct.id);
    await deleteDoc(productRef);
    setDeleteProduct(null);
  };

  const handleClose = () => {
    setEditProduct(null);
    setDeleteProduct(null);
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mt: 2 }}>
      <Typography variant="h6" gutterBottom>Your Products</Typography>
      <List>
        {products.map((product) => (
          <ListItem key={product.id}>
            <Grid container alignItems="center" spacing={1}>
              {product.imageUrl && (
                <Grid item>
                  <ListItemAvatar>
                    <Avatar src={product.imageUrl} alt={product.name} />
                  </ListItemAvatar>
                </Grid>
              )}
              <Grid item xs>
                <ListItemText
                  primary={product.name}
                  secondary={`${product.description} - $${product.price}`} // Display price
                />
              </Grid>
              <Grid item>
                <IconButton aria-label="edit" onClick={() => handleEdit(product)}>
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => setDeleteProduct(product)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!editProduct} onClose={handleClose}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To edit this product, please modify the fields below and click save.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            type="text"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Product Description"
            type="text"
            fullWidth
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Product Price"
            type="text"
            fullWidth
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteProduct} onClose={handleClose}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductList;
