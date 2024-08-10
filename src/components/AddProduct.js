import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { TextField, Button, MenuItem, Box, Typography, CircularProgress, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Select } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useForm, Controller } from 'react-hook-form';
import Autocomplete from '@mui/lab/Autocomplete';

const AddProduct = ({ productId, onProductAdded }) => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [reductionAdvice, setReductionAdvice] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [baseCountry, setBaseCountry] = useState('');

  const { handleSubmit, control, reset } = useForm();

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          reset({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            materialType: productData.materialType || [],
            productionMethod: productData.productionMethod,
            transportationMethod: productData.transportationMethod,
            productWeight: productData.productWeight,
            localOrImported: productData.localOrImported,
            country: productData.country || baseCountry,
          });
          setImagePreview(productData.imageUrl);
          setCarbonFootprint(productData.carbonFootprint);
          setReductionAdvice(productData.reductionAdvice);
        }
      }
    };

    const fetchUserBaseCountry = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBaseCountry(userData.baseCountry || '');
        }
      }
    };

    fetchProduct();
    fetchUserBaseCountry();
  }, [productId, reset, user]);

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

  const onSubmit = async (data) => {
    if (!data.name || !data.description || !data.price || (!image && !imagePreview)) {
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

      const productData = {
        ...data,
        imageUrl,
        updatedAt: serverTimestamp(),
        carbonFootprint,
        reductionAdvice,
      };

      if (productId) {
        // Update existing product
        await updateDoc(doc(db, 'products', productId), productData);
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
          ownerId: user.uid,
          ownerEmail: user.email,
        });
      }

      reset();
      setImage(null);
      setImagePreview(null);
      setCarbonFootprint('');
      setReductionAdvice('');
      setModalOpen(false);
      
      // Call the onProductAdded callback
      if (onProductAdded) {
        onProductAdded();
      }
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
      setModalOpen(true);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setImage(null);
    setImagePreview(null);
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mt: 2 }}>
      <Typography variant="h6" gutterBottom>{productId ? 'Edit Product' : 'Add Product'}</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Product Name"
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={loading}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Product Description"
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={loading}
            />
          )}
        />
        <Controller
          name="price"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Product Price"
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={loading}
            />
          )}
        />
        <Controller
          name="materialType"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <Autocomplete
              {...field}
              multiple
              options={['Plastic', 'Metal', 'Wood', 'Fabric', 'Glass', 'Leather', 'Ceramic', 'Paper', 'Cotton', 'Wool', 'Silk', 'Synthetic', 'Natural Oils', 'Synthetic Aromatics']}
              getOptionLabel={(option) => option}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Material Type"
                  variant="outlined"
                  sx={{ mb: 2 }}
                  disabled={loading}
                />
              )}
              onChange={(_, data) => field.onChange(data)}
            />
          )}
        />
        <Controller
          name="productionMethod"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormControl fullWidth sx={{ mb: 2 }} disabled={loading}>
              <InputLabel>Production Method</InputLabel>
              <Select {...field} label="Production Method">
                <MenuItem value="Handmade">Handmade</MenuItem>
                <MenuItem value="Machine-made">Machine-made</MenuItem>
                <MenuItem value="Recycled Materials">Recycled Materials</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <Controller
          name="transportationMethod"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormControl fullWidth sx={{ mb: 2 }} disabled={loading}>
              <InputLabel>Transportation Method</InputLabel>
              <Select {...field} label="Transportation Method">
                <MenuItem value="Air">Air</MenuItem>
                <MenuItem value="Sea">Sea</MenuItem>
                <MenuItem value="Land">Land</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <Controller
          name="productWeight"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Product Weight (kg)"
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={loading}
            />
          )}
        />
        <Controller
          name="localOrImported"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormControl fullWidth sx={{ mb: 2 }} disabled={loading}>
              <InputLabel>Local or Imported</InputLabel>
              <Select {...field} label="Local or Imported">
                <MenuItem value="Local">Local</MenuItem>
                <MenuItem value="Imported">Imported</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <Controller
          name="country"
          control={control}
          defaultValue={baseCountry}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Country"
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={loading}
            />
          )}
        />
        <input
          type="file"
          hidden
          id="upload-image"
          onChange={handleImageChange}
          disabled={loading}
        />
        {imagePreview && (
          <Box sx={{ mb: 2 }}>
            <img src={imagePreview} alt="Selected" style={{ maxWidth: '100%' }} />
          </Box>
        )}
        {carbonFootprint && (
          <Typography variant="body1" gutterBottom>
            Carbon Footprint: {carbonFootprint}
          </Typography>
        )}
        {reductionAdvice && (
          <Typography variant="body1" gutterBottom>
            Reduction Advice: {reductionAdvice}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          component="label"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (productId ? 'Update Product' : 'Add Product')}
          <input
            type="file"
            hidden
            onChange={handleImageChange}
            disabled={loading}
          />
        </Button>
      </form>

      <Dialog
        open={modalOpen}
        onClose={handleCancel}
      >
        <DialogTitle>Are you sure you want to submit the form?</DialogTitle>
        <DialogContent>
          <Typography>
            Please confirm that you want to submit the form with the selected image and data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} color="primary" autoFocus disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddProduct;