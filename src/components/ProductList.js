import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { List, Avatar, IconButton, Box, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button, Grid, MenuItem, Select, FormControl, InputLabel, Card, CardContent, CardActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { parseFormattedText } from '../helpers';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editMaterialType, setEditMaterialType] = useState('');
  const [editProductionMethod, setEditProductionMethod] = useState('');
  const [editTransportationMethod, setEditTransportationMethod] = useState('');
  const [editProductWeight, setEditProductWeight] = useState('');
  const [editLocalOrImported, setEditLocalOrImported] = useState('');
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
    setEditPrice(product.price);
    setEditMaterialType(product.materialType);
    setEditProductionMethod(product.productionMethod);
    setEditTransportationMethod(product.transportationMethod);
    setEditProductWeight(product.productWeight);
    setEditLocalOrImported(product.localOrImported);
  };

  const handleSave = async () => {
    const productRef = doc(db, 'products', editProduct.id);
    await updateDoc(productRef, {
      name: editName,
      description: editDescription,
      price: editPrice,
      materialType: editMaterialType,
      productionMethod: editProductionMethod,
      transportationMethod: editTransportationMethod,
      productWeight: editProductWeight,
      localOrImported: editLocalOrImported,
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
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mt: 2, backgroundColor: '#f9f9f9' }}>
      <Typography variant="h4" gutterBottom color="primary">Your Products</Typography>
      <List>
        {products.map((product) => (
          <Card key={product.id} sx={{ mb: 2, borderRadius: '16px', boxShadow: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item>
                  {product.imageUrl && (
                    <Box sx={{ width: 200, height: 200 }}>
                      <Avatar 
                        src={product.imageUrl} 
                        alt={product.name} 
                        sx={{ width: '100%', height: '100%'}} 
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs>
                  <Typography variant="h5">{product.name}</Typography>
                  <Typography variant="body1" color="textSecondary">{product.description} - ${product.price}</Typography>
                  {product.carbonFootprint && (
                    <Typography variant="body2" color="textSecondary"><strong>Carbon Footprint:</strong> {product.carbonFootprint}</Typography>
                  )}
                  {product.reductionAdvice && (
                    <div>
                      <Typography variant="body2" color="textSecondary"><strong>Reduction Advice:</strong></Typography>
                      {parseFormattedText(product.reductionAdvice)}
                    </div>
                  )}
                </Grid>
                <Grid item>
                  <CardActions>
                    <IconButton aria-label="edit" onClick={() => handleEdit(product)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => setDeleteProduct(product)} color="secondary">
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
          <FormControl fullWidth margin="dense">
            <InputLabel>Material Type</InputLabel>
            <Select
              value={editMaterialType}
              onChange={(e) => setEditMaterialType(e.target.value)}
              label="Material Type"
            >
              <MenuItem value="Plastic">Plastic</MenuItem>
              <MenuItem value="Metal">Metal</MenuItem>
              <MenuItem value="Wood">Wood</MenuItem>
              <MenuItem value="Fabric">Fabric</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Production Method</InputLabel>
            <Select
              value={editProductionMethod}
              onChange={(e) => setEditProductionMethod(e.target.value)}
              label="Production Method"
            >
              <MenuItem value="Handmade">Handmade</MenuItem>
              <MenuItem value="Machine-made">Machine-made</MenuItem>
              <MenuItem value="Recycled Materials">Recycled Materials</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Transportation Method</InputLabel>
            <Select
              value={editTransportationMethod}
              onChange={(e) => setEditTransportationMethod(e.target.value)}
              label="Transportation Method"
            >
              <MenuItem value="Air">Air</MenuItem>
              <MenuItem value="Sea">Sea</MenuItem>
              <MenuItem value="Land">Land</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Product Weight (kg)"
            type="text"
            fullWidth
            value={editProductWeight}
            onChange={(e) => setEditProductWeight(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Local or Imported</InputLabel>
            <Select
              value={editLocalOrImported}
              onChange={(e) => setEditLocalOrImported(e.target.value)}
              label="Local or Imported"
            >
              <MenuItem value="Local">Local</MenuItem>
              <MenuItem value="Imported">Imported</MenuItem>
            </Select>
          </FormControl>
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
