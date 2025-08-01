import mongoose from 'mongoose';

const productCollection = 'products';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  description: { type: String }
});

const productModel = mongoose.model(productCollection, productSchema);
export default productModel;